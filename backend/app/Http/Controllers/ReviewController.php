<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreReviewRequest;
use App\Http\Resources\ReviewResource;
use App\Models\CoachingSession;
use App\Models\Review;
use Illuminate\Http\JsonResponse;

/**
 * ReviewController
 *
 * Handles submitting and listing coach reviews.
 * Reviews can only be left after a completed session.
 */
class ReviewController extends Controller
{
    /**
     * Get all visible reviews for a specific coach.
     *
     * GET /api/reviews/coach/{coachId}
     * Public endpoint — no authentication required for viewing reviews.
     */
    public function forCoach(int $coachId): JsonResponse
    {
        $reviews = Review::where('coach_id', $coachId)
            ->visible()
            ->with('student') // Eager load to show reviewer's name
            ->latest()
            ->paginate(10);

        // Calculate rating breakdown (how many 1-star, 2-star, etc.)
        $breakdown = Review::where('coach_id', $coachId)
            ->visible()
            ->selectRaw('rating, COUNT(*) as count')
            ->groupBy('rating')
            ->pluck('count', 'rating')
            ->toArray();

        return response()->json([
            'data'      => ReviewResource::collection($reviews->items()),
            'breakdown' => $breakdown, // e.g. {5: 45, 4: 12, 3: 3, 2: 1}
            'meta'      => [
                'current_page' => $reviews->currentPage(),
                'last_page'    => $reviews->lastPage(),
                'total'        => $reviews->total(),
            ],
        ]);
    }

    /**
     * Submit a review for a completed session.
     *
     * POST /api/reviews
     * Body: { session_id, rating, comment }
     */
    public function store(StoreReviewRequest $request): JsonResponse
    {
        $session = CoachingSession::findOrFail($request->session_id);

        // POLICY CHECK: Can this student review this specific session?
        // ReviewPolicy::create() checks:
        // - User is the student of this session
        // - Session is completed
        // - No review exists yet
        $this->authorize('create', [Review::class, $session]);

        $review = Review::create([
            'session_id' => $request->session_id,
            'coach_id'   => $session->coach_id,
            'student_id' => $request->user()->id,
            'rating'     => $request->rating,
            'comment'    => $request->comment,
        ]);

        // Recalculate the coach's average rating — this updates the denormalized
        // rating_avg column in coach_profiles so we don't need to compute it on every request
        $session->coach->coachProfile->recalculateRating();

        $review->load('student');

        return response()->json([
            'data'    => new ReviewResource($review),
            'message' => 'Review submitted successfully!',
        ], 201);
    }
}
