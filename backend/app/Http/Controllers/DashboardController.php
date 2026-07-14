<?php

namespace App\Http\Controllers;

use App\Models\CoachingSession;
use App\Models\Review;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * DashboardController
 *
 * Returns statistics and summary data for dashboard pages.
 * Different data is returned based on the user's role.
 *
 * This could be split into StudentDashboard, CoachDashboard controllers,
 * but combining them shows the role-based conditional pattern clearly.
 */
class DashboardController extends Controller
{
    /**
     * GET /api/dashboard
     *
     * Returns role-appropriate dashboard statistics.
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        if ($user->isCoach()) {
            return $this->coachDashboard($user);
        }

        if ($user->isStudent()) {
            return $this->studentDashboard($user);
        }

        // Admin gets a system overview
        return $this->adminDashboard();
    }

    /**
     * Coach dashboard: earnings, sessions, ratings
     */
    private function coachDashboard($user): JsonResponse
    {
        $profile = $user->coachProfile;

        // Upcoming sessions (pending or confirmed, in the future)
        $upcomingSessions = CoachingSession::where('coach_id', $user->id)
            ->upcoming()
            ->with('student')
            ->orderBy('scheduled_at')
            ->take(5)
            ->get();

        // Sessions completed this month
        $sessionsThisMonth = CoachingSession::where('coach_id', $user->id)
            ->where('status', 'completed')
            ->whereMonth('scheduled_at', now()->month)
            ->count();

        // Total earnings this month (sum of completed session prices)
        $earningsThisMonth = CoachingSession::where('coach_id', $user->id)
            ->where('status', 'completed')
            ->whereMonth('scheduled_at', now()->month)
            ->sum('price');

        // Pending sessions waiting for confirmation
        $pendingSessions = CoachingSession::where('coach_id', $user->id)
            ->pending()
            ->count();

        // Recent reviews
        $recentReviews = Review::where('coach_id', $user->id)
            ->visible()
            ->with('student')
            ->latest()
            ->take(3)
            ->get();

        return response()->json([
            'role' => 'coach',
            'stats' => [
                'total_sessions'     => $profile?->total_sessions ?? 0,
                'sessions_this_month' => $sessionsThisMonth,
                'earnings_this_month' => (float) $earningsThisMonth,
                'pending_sessions'   => $pendingSessions,
                'rating_avg'         => (float) ($profile?->rating_avg ?? 0),
                'total_reviews'      => $profile?->total_reviews ?? 0,
                'is_verified'        => (bool) $profile?->is_verified,
            ],
            'upcoming_sessions' => \App\Http\Resources\SessionResource::collection($upcomingSessions),
            'recent_reviews'    => \App\Http\Resources\ReviewResource::collection($recentReviews),
        ]);
    }

    /**
     * Student dashboard: sessions, improvements, spending
     */
    private function studentDashboard($user): JsonResponse
    {
        // Upcoming sessions
        $upcomingSessions = CoachingSession::where('student_id', $user->id)
            ->upcoming()
            ->with('coach.coachProfile')
            ->orderBy('scheduled_at')
            ->take(5)
            ->get();

        // Total sessions completed
        $completedSessions = CoachingSession::where('student_id', $user->id)
            ->where('status', 'completed')
            ->count();

        // Total amount spent
        $totalSpent = CoachingSession::where('student_id', $user->id)
            ->where('status', 'completed')
            ->sum('price');

        // Number of different coaches worked with
        $coachesWorkedWith = CoachingSession::where('student_id', $user->id)
            ->where('status', 'completed')
            ->distinct('coach_id')
            ->count('coach_id');

        // Active subscription
        $subscription = $user->activeSubscription()?->load('plan');

        return response()->json([
            'role' => 'student',
            'stats' => [
                'completed_sessions'  => $completedSessions,
                'total_spent'         => (float) $totalSpent,
                'coaches_worked_with' => $coachesWorkedWith,
            ],
            'upcoming_sessions' => \App\Http\Resources\SessionResource::collection($upcomingSessions),
            'subscription'      => $subscription ? [
                'plan_name'          => $subscription->plan?->name,
                'sessions_remaining' => $subscription->sessions_remaining,
                'ends_at'            => $subscription->ends_at?->toISOString(),
                'status'             => $subscription->status,
            ] : null,
        ]);
    }

    /**
     * Admin dashboard: platform-wide stats
     */
    private function adminDashboard(): JsonResponse
    {
        return response()->json([
            'role' => 'admin',
            'stats' => [
                'total_users'     => User::count(),
                'total_coaches'   => User::where('role', 'coach')->count(),
                'total_students'  => User::where('role', 'student')->count(),
                'pending_verification' => \App\Models\CoachProfile::where('is_verified', false)->count(),
                'total_sessions'  => CoachingSession::count(),
                'sessions_today'  => CoachingSession::whereDate('scheduled_at', today())->count(),
                'total_revenue'   => CoachingSession::where('status', 'completed')->sum('price'),
            ],
        ]);
    }
}
