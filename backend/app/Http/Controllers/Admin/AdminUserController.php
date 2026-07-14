<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\UserResource;
use App\Models\CoachProfile;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * AdminUserController
 *
 * Admin CRUD operations for user management.
 * The key feature here is verifying coaches.
 */
class AdminUserController extends Controller
{
    /**
     * List all users with search and role filter.
     * GET /api/admin/users?role=coach&search=...&page=1
     */
    public function index(Request $request): JsonResponse
    {
        $query = User::with(['coachProfile', 'studentProfile']);

        if ($role = $request->query('role')) {
            $query->where('role', $role);
        }

        if ($search = $request->query('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'LIKE', "%{$search}%")
                  ->orWhere('email', 'LIKE', "%{$search}%")
                  ->orWhere('summoner_name', 'LIKE', "%{$search}%");
            });
        }

        // Filter by verification status (only relevant for coaches)
        if ($request->query('verified') !== null) {
            $isVerified = $request->boolean('verified');
            $query->whereHas('coachProfile', fn($q) => $q->where('is_verified', $isVerified));
        }

        $users = $query->latest()->paginate(20);

        return response()->json([
            'data' => UserResource::collection($users->items()),
            'meta' => [
                'current_page' => $users->currentPage(),
                'last_page'    => $users->lastPage(),
                'total'        => $users->total(),
            ],
        ]);
    }

    /**
     * Update a user (admin action).
     * PUT /api/admin/users/{id}
     *
     * The main use case is verifying/unverifying coaches.
     * Admins can also change roles, suspend accounts, etc.
     */
    public function update(Request $request, User $user): JsonResponse
    {
        $request->validate([
            'is_verified'  => ['sometimes', 'boolean'],
            'is_available' => ['sometimes', 'boolean'],
            'role'         => ['sometimes', 'in:admin,coach,student'],
        ]);

        // Update coach verification status
        if ($request->has('is_verified') && $user->isCoach()) {
            $user->coachProfile()->updateOrCreate(
                ['user_id' => $user->id],
                ['is_verified' => $request->boolean('is_verified')]
            );
        }

        // Update role
        if ($request->has('role')) {
            $user->update(['role' => $request->role]);
        }

        $user->load(['coachProfile', 'studentProfile']);

        return response()->json([
            'data'    => new UserResource($user),
            'message' => 'User updated successfully.',
        ]);
    }

    /**
     * Delete a user (admin action).
     * DELETE /api/admin/users/{id}
     *
     * This cascades to their profile, sessions, etc. due to DB constraints.
     */
    public function destroy(User $user): JsonResponse
    {
        // Prevent admin from deleting themselves
        if ($user->id === auth()->id()) {
            return response()->json(['message' => 'You cannot delete your own account.'], 422);
        }

        $user->delete();

        return response()->json(['message' => 'User deleted successfully.']);
    }

    /**
     * GET /api/admin/sessions?status=pending
     * List sessions for admin management.
     */
    public function sessions(Request $request): JsonResponse
    {
        $query = \App\Models\CoachingSession::with(['coach', 'student']);

        if ($status = $request->query('status')) {
            $query->where('status', $status);
        }

        $sessions = $query->latest()->paginate(20);

        return response()->json([
            'data' => \App\Http\Resources\SessionResource::collection($sessions->items()),
            'meta' => [
                'current_page' => $sessions->currentPage(),
                'last_page'    => $sessions->lastPage(),
                'total'        => $sessions->total(),
            ],
        ]);
    }
}
