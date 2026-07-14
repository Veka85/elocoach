<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreSessionRequest;
use App\Http\Resources\SessionResource;
use App\Models\CoachingSession;
use App\Services\SessionService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * SessionController
 *
 * Handles the full session lifecycle:
 * booking → confirm → complete → review
 *
 * Notice how thin this controller is — all business logic
 * is in SessionService. The controller just:
 * 1. Receives request data
 * 2. Calls the service
 * 3. Returns the response
 *
 * DEPENDENCY INJECTION CONCEPT:
 * SessionService is injected via the constructor. Laravel's IoC container
 * automatically resolves and injects this dependency — we don't call `new SessionService()`.
 * This makes testing easier (you can inject a mock service in tests).
 */
class SessionController extends Controller
{
    public function __construct(
        private SessionService $sessionService
    ) {}

    /**
     * List sessions for the authenticated user.
     * Coaches see their coaching sessions, students see their booked sessions.
     *
     * GET /api/sessions?status=pending&page=1
     */
    public function index(Request $request): JsonResponse
    {
        $user  = $request->user();
        $query = null;

        if ($user->isCoach()) {
            // Coach sees sessions WHERE they are the coach
            $query = CoachingSession::where('coach_id', $user->id);
        } elseif ($user->isStudent()) {
            // Student sees sessions WHERE they are the student
            $query = CoachingSession::where('student_id', $user->id);
        } else {
            // Admin sees ALL sessions
            $query = CoachingSession::query();
        }

        // Optional status filter
        if ($status = $request->query('status')) {
            $query->where('status', $status);
        }

        // Eager load coach and student to avoid N+1 queries
        $sessions = $query
            ->with(['coach.coachProfile', 'student', 'notes', 'review'])
            ->orderBy('scheduled_at', 'desc')
            ->paginate(10);

        return response()->json([
            'data' => SessionResource::collection($sessions->items()),
            'meta' => [
                'current_page' => $sessions->currentPage(),
                'last_page'    => $sessions->lastPage(),
                'total'        => $sessions->total(),
            ],
        ]);
    }

    /**
     * Book a new coaching session.
     *
     * POST /api/sessions
     * Body: { coach_id, scheduled_at, duration_minutes, notes }
     */
    public function store(StoreSessionRequest $request): JsonResponse
    {
        $session = $this->sessionService->bookSession(
            $request->user(),
            $request->validated()
        );

        $session->load(['coach.coachProfile', 'student']);

        return response()->json([
            'data'    => new SessionResource($session),
            'message' => 'Session booked successfully! Waiting for coach confirmation.',
        ], 201);
    }

    /**
     * Get details of a single session.
     *
     * GET /api/sessions/{id}
     */
    public function show(Request $request, CoachingSession $session): JsonResponse
    {
        // POLICY CHECK: Can this user view this session?
        // SessionPolicy::view() ensures only the coach, student, or admin can see it
        $this->authorize('view', $session);

        $session->load(['coach.coachProfile', 'student.studentProfile', 'notes', 'review.student']);

        return response()->json([
            'data' => new SessionResource($session),
        ]);
    }

    /**
     * Coach confirms a pending session.
     *
     * POST /api/sessions/{id}/confirm
     * Body: { meet_link }
     */
    public function confirm(Request $request, CoachingSession $session): JsonResponse
    {
        $this->authorize('confirm', $session);

        $session = $this->sessionService->confirmSession(
            $session,
            $request->input('meet_link')
        );

        $session->load(['coach', 'student']);

        return response()->json([
            'data'    => new SessionResource($session),
            'message' => 'Session confirmed! The student will be notified.',
        ]);
    }

    /**
     * Coach marks a session as completed.
     *
     * POST /api/sessions/{id}/complete
     */
    public function complete(Request $request, CoachingSession $session): JsonResponse
    {
        $this->authorize('complete', $session);

        $session = $this->sessionService->completeSession($session);

        // Also save coach notes if provided
        if ($request->has('coach_notes')) {
            $session->notes()->updateOrCreate(
                ['session_id' => $session->id],
                ['coach_notes' => $request->input('coach_notes')]
            );
        }

        $session->load(['coach', 'student', 'notes']);

        return response()->json([
            'data'    => new SessionResource($session),
            'message' => 'Session marked as completed! The student can now leave a review.',
        ]);
    }

    /**
     * Cancel a session.
     *
     * POST /api/sessions/{id}/cancel
     * Body: { reason }
     */
    public function cancel(Request $request, CoachingSession $session): JsonResponse
    {
        $this->authorize('cancel', $session);

        $session = $this->sessionService->cancelSession(
            $session,
            $request->user(),
            $request->input('reason')
        );

        $session->load(['coach', 'student']);

        return response()->json([
            'data'    => new SessionResource($session),
            'message' => 'Session cancelled.',
        ]);
    }
}
