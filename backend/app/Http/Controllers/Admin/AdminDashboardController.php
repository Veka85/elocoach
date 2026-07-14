<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\CoachingSession;
use App\Models\CoachProfile;
use App\Models\Review;
use App\Models\User;
use Illuminate\Http\JsonResponse;

/**
 * AdminDashboardController
 *
 * Provides admin-only platform statistics and analytics.
 * Protected by EnsureRole middleware in routes — only admins can reach this.
 */
class AdminDashboardController extends Controller
{
    /**
     * GET /api/admin/dashboard
     * Platform-wide statistics for the admin overview page.
     */
    public function index(): JsonResponse
    {
        // Revenue by month (last 6 months)
        // strftime() is SQLite's equivalent of MySQL's DATE_FORMAT()
        $monthlyRevenue = CoachingSession::where('status', 'completed')
            ->where('scheduled_at', '>=', now()->subMonths(6))
            ->selectRaw("strftime('%Y-%m', scheduled_at) as month, SUM(price) as revenue, COUNT(*) as sessions")
            ->groupBy('month')
            ->orderBy('month')
            ->get();

        // New users by week (last 4 weeks)
        $weeklySignups = User::where('created_at', '>=', now()->subWeeks(4))
            ->selectRaw("strftime('%Y-%W', created_at) as week, role, COUNT(*) as count")
            ->groupBy('week', 'role')
            ->get();

        // Top performing coaches
        $topCoaches = CoachProfile::with('user')
            ->verified()
            ->orderBy('rating_avg', 'desc')
            ->take(5)
            ->get()
            ->map(fn($profile) => [
                'id'             => $profile->user_id,
                'name'           => $profile->user->name,
                'rating'         => $profile->rating_avg,
                'total_sessions' => $profile->total_sessions,
                'total_reviews'  => $profile->total_reviews,
            ]);

        // Coaches awaiting verification
        $pendingCoaches = CoachProfile::with('user')
            ->where('is_verified', false)
            ->latest()
            ->take(10)
            ->get()
            ->map(fn($profile) => [
                'id'         => $profile->user_id,
                'name'       => $profile->user->name,
                'email'      => $profile->user->email,
                'rank'       => $profile->rank,
                'region'     => $profile->user->region,
                'created_at' => $profile->user->created_at->toISOString(),
            ]);

        return response()->json([
            'stats' => [
                'total_users'     => User::count(),
                'total_coaches'   => User::where('role', 'coach')->count(),
                'total_students'  => User::where('role', 'student')->count(),
                'verified_coaches'   => CoachProfile::where('is_verified', true)->count(),
                'unverified_coaches' => CoachProfile::where('is_verified', false)->count(),
                'total_sessions'  => CoachingSession::count(),
                'sessions_today'  => CoachingSession::whereDate('scheduled_at', today())->count(),
                'sessions_this_month' => CoachingSession::whereMonth('scheduled_at', now()->month)->count(),
                'total_revenue'   => (float) CoachingSession::where('status', 'completed')->sum('price'),
                'revenue_this_month' => (float) CoachingSession::where('status', 'completed')
                    ->whereMonth('scheduled_at', now()->month)
                    ->sum('price'),
                'total_reviews'   => Review::count(),
            ],
            'monthly_revenue'  => $monthlyRevenue,
            'weekly_signups'   => $weeklySignups,
            'top_coaches'      => $topCoaches,
            'pending_coaches'  => $pendingCoaches,
        ]);
    }
}
