<?php

namespace App\Http\Controllers;

use App\Http\Requests\UpdateCoachProfileRequest;
use App\Http\Resources\CoachResource;
use App\Models\CoachProfile;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * CoachController
 *
 * Handles browsing and managing coach profiles.
 * This is the main "marketplace" feature of the platform.
 */
class CoachController extends Controller
{
    /**
     * List coaches with search, filtering, and pagination.
     *
     * GET /api/coaches
     * Query params: search, rank, role, max_price, region, page
     *
     * EAGER LOADING CONCEPT:
     * We use with('coachProfile', 'user') to load related models
     * in ONE additional query rather than N queries (N+1 problem).
     *
     * WITHOUT eager loading:
     * - Query 1: SELECT * FROM coach_profiles (get 20 profiles)
     * - Query 2-21: SELECT * FROM users WHERE id = ? (20 separate queries!)
     * Total: 21 queries
     *
     * WITH eager loading:
     * - Query 1: SELECT * FROM coach_profiles
     * - Query 2: SELECT * FROM users WHERE id IN (1, 2, 3, ...)
     * Total: 2 queries — much better!
     */
    public function index(Request $request): JsonResponse
    {
        // Start building the query — we use Query Builder chaining pattern
        $query = CoachProfile::with('user')
            ->verified()    // Only show admin-approved coaches
            ->available();  // Only show coaches accepting bookings

        // SEARCH: Search across multiple fields using LIKE
        // The '%' wildcard matches any characters before/after the search term
        if ($search = $request->query('search')) {
            $query->where(function ($q) use ($search) {
                $q->whereHas('user', function ($userQuery) use ($search) {
                    $userQuery->where('name', 'LIKE', "%{$search}%")
                              ->orWhere('summoner_name', 'LIKE', "%{$search}%");
                })
                ->orWhere('bio', 'LIKE', "%{$search}%");
            });
        }

        // FILTER BY RANK
        if ($rank = $request->query('rank')) {
            $query->byRank($rank); // Uses the scopeByRank() we defined in CoachProfile
        }

        // FILTER BY MAX PRICE
        if ($maxPrice = $request->query('max_price')) {
            $query->maxPrice((float) $maxPrice);
        }

        // FILTER BY REGION (via the user relationship)
        if ($region = $request->query('region')) {
            $query->whereHas('user', fn($q) => $q->where('region', $region));
        }

        // SORT: Default is by rating, but allow sorting by price or sessions
        $sortBy = $request->query('sort', 'rating');
        match ($sortBy) {
            'price_asc'  => $query->orderBy('hourly_rate', 'asc'),
            'price_desc' => $query->orderBy('hourly_rate', 'desc'),
            'sessions'   => $query->orderBy('total_sessions', 'desc'),
            default      => $query->orderBy('rating_avg', 'desc'),
        };

        // PAGINATION: paginate(12) returns 12 results per page with metadata.
        // The response includes: data, current_page, last_page, total, etc.
        $coaches = $query->paginate(12);

        // Return paginated collection — CoachResource transforms each item
        return response()->json([
            'data' => CoachResource::collection($coaches->items()),
            'meta' => [
                'current_page' => $coaches->currentPage(),
                'last_page'    => $coaches->lastPage(),
                'per_page'     => $coaches->perPage(),
                'total'        => $coaches->total(),
            ],
        ]);
    }

    /**
     * Get a single coach's detailed profile.
     *
     * GET /api/coaches/{id}
     *
     * We load more data here than in the list — the detail page needs reviews.
     * This is an example of "query optimization by context" —
     * the list page doesn't need reviews, but the profile page does.
     */
    public function show(int $id): JsonResponse
    {
        $user = User::with([
            'coachProfile',
            'reviewsReceived' => function ($query) {
                $query->visible()
                      ->with('student')
                      ->latest()
                      ->take(10); // Only show 10 most recent reviews
            },
        ])
        ->where('role', 'coach')
        ->findOrFail($id);

        if (!$user->coachProfile) {
            return response()->json(['message' => 'Coach profile not found.'], 404);
        }

        return response()->json([
            'data'    => new CoachResource($user),
            'reviews' => \App\Http\Resources\ReviewResource::collection(
                $user->reviewsReceived
            ),
        ]);
    }

    /**
     * Update coach's own profile.
     *
     * PUT /api/coaches/{id}/profile
     * Requires: Bearer token (coach role)
     */
    public function updateProfile(UpdateCoachProfileRequest $request): JsonResponse
    {
        $user = $request->user();

        // Update the user's own profile only — security check
        // (the EnsureRole middleware already guarantees user is a coach)
        $profile = $user->coachProfile;

        if (!$profile) {
            // Create profile if it doesn't exist (shouldn't happen, but defensive)
            $profile = \App\Models\CoachProfile::create(['user_id' => $user->id]);
        }

        // Update profile fields (only fields present in the request)
        $profile->update($request->only([
            'bio', 'hourly_rate', 'rank', 'peak_rank',
            'specializations', 'champions', 'languages',
            'is_available', 'youtube_url', 'twitch_url',
        ]));

        // Also update user-level fields if provided
        $user->update($request->only(['summoner_name', 'region']));

        $user->load('coachProfile');

        return response()->json([
            'data'    => new CoachResource($user),
            'message' => 'Profile updated successfully.',
        ]);
    }
}
