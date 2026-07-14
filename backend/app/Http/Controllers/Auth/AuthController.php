<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Requests\Auth\RegisterRequest;
use App\Http\Resources\UserResource;
use App\Models\CoachProfile;
use App\Models\StudentProfile;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

/**
 * AuthController
 *
 * Handles user registration, login, and logout.
 *
 * SANCTUM CONCEPT:
 * Laravel Sanctum provides token-based authentication for SPAs and APIs.
 * Unlike JWT, Sanctum tokens are stored in the database (personal_access_tokens table).
 * This means you can revoke individual tokens — unlike JWT where you'd need a blacklist.
 *
 * Flow:
 * 1. User logs in → create token → send token to frontend
 * 2. Frontend stores token in localStorage
 * 3. Every API request includes: Authorization: Bearer {token}
 * 4. Laravel's auth:sanctum middleware validates the token
 *
 * CONTROLLER CONCEPT:
 * Controllers are thin — they:
 * 1. Receive the request (already validated by Form Request)
 * 2. Call service/model methods to do the work
 * 3. Return a response
 *
 * They should NOT contain business logic — that belongs in Services or Models.
 */
class AuthController extends Controller
{
    /**
     * Register a new user.
     *
     * POST /api/auth/register
     *
     * The RegisterRequest class handles validation BEFORE this method runs.
     * If validation fails, Laravel automatically returns a 422 error.
     * So by the time we reach this code, all data is valid.
     */
    public function register(RegisterRequest $request): JsonResponse
    {
        // DB::transaction() ensures all database operations succeed or all fail.
        // We create 3 records (user + profile + token) — they must all succeed together.
        $result = DB::transaction(function () use ($request) {
            // Create the user
            // Note: 'password' is automatically hashed because of the 'hashed' cast in User model
            $user = User::create([
                'name'          => $request->name,
                'email'         => $request->email,
                'password'      => $request->password, // Auto-hashed by model cast
                'role'          => $request->role,
                'summoner_name' => $request->summoner_name,
                'region'        => $request->region,
            ]);

            // Create the appropriate profile based on role
            if ($user->isCoach()) {
                CoachProfile::create([
                    'user_id'    => $user->id,
                    'is_verified' => false, // Must be verified by admin before appearing in search
                ]);
            } else {
                StudentProfile::create(['user_id' => $user->id]);
            }

            // createToken() is from the HasApiTokens trait (Sanctum).
            // The string 'auth_token' is just a descriptive name for the token.
            // plainTextToken is what we send to the client — it won't be retrievable again.
            $token = $user->createToken('auth_token')->plainTextToken;

            return ['user' => $user, 'token' => $token];
        });

        $result['user']->load(['coachProfile', 'studentProfile']);

        // 201 Created is the correct HTTP status for successful resource creation
        return response()->json([
            'data'    => new UserResource($result['user']),
            'token'   => $result['token'],
            'message' => 'Account created successfully.',
        ], 201);
    }

    /**
     * Authenticate user and return token.
     *
     * POST /api/auth/login
     */
    public function login(LoginRequest $request): JsonResponse
    {
        // Auth::attempt() checks credentials against the database.
        // It automatically hashes the provided password and compares to stored hash.
        // We use 'only' to make sure we only pass email/password to attempt().
        if (!Auth::attempt($request->only('email', 'password'))) {
            // 401 Unauthorized — credentials are wrong
            return response()->json([
                'message' => 'Invalid credentials. Please check your email and password.',
            ], 401);
        }

        $user = Auth::user();
        $user->load(['coachProfile', 'studentProfile']);

        // Revoke all old tokens on login to maintain single-session behavior.
        // In a real app you might want to keep tokens for "devices" — but for
        // a portfolio project, one active token is simpler and more secure.
        $user->tokens()->delete();

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'data'    => new UserResource($user),
            'token'   => $token,
            'message' => 'Logged in successfully.',
        ]);
    }

    /**
     * Get the currently authenticated user.
     *
     * GET /api/auth/me
     * Requires: Authorization: Bearer {token}
     */
    public function me(Request $request): JsonResponse
    {
        // $request->user() returns the User model for the authenticated user.
        // Sanctum automatically handles the token lookup from the Authorization header.
        $user = $request->user()->load(['coachProfile', 'studentProfile']);

        return response()->json([
            'data' => new UserResource($user),
        ]);
    }

    /**
     * Logout — revoke the current token.
     *
     * POST /api/auth/logout
     * Requires: Authorization: Bearer {token}
     */
    public function logout(Request $request): JsonResponse
    {
        // currentAccessToken() returns the Sanctum token used for this request.
        // delete() removes it from the personal_access_tokens table.
        // After this, the token is invalid — the user must log in again.
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Logged out successfully.',
        ]);
    }
}
