<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * EnsureRole Middleware
 *
 * MIDDLEWARE CONCEPT:
 * Middleware is code that runs BEFORE your controller action.
 * It can inspect the request, modify it, or reject it entirely.
 *
 * Think of it as a "guard" at the door:
 * Request → [Middleware 1] → [Middleware 2] → Controller → Response
 *
 * In routes/api.php we'll use this like:
 *   Route::middleware(['auth:sanctum', 'role:coach'])->group(...)
 *
 * The 'role:coach' part passes 'coach' as the $role parameter
 * to the handle() method below.
 *
 * You can also pass multiple roles:
 *   Route::middleware(['auth:sanctum', 'role:admin,coach'])->group(...)
 *
 * HOW SANCTUM WORKS WITH MIDDLEWARE:
 * 'auth:sanctum' middleware runs first — it reads the Authorization header,
 * finds the token in personal_access_tokens, and sets $request->user().
 * Our EnsureRole middleware runs after, and can use $request->user().
 */
class EnsureRole
{
    /**
     * @param Request $request
     * @param Closure $next      Call this to continue to the next middleware/controller
     * @param string  ...$roles  One or more allowed roles (passed via 'role:admin,coach')
     */
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        // At this point, 'auth:sanctum' has already run and set the user.
        // If not authenticated, auth:sanctum would have already returned 401.
        $user = $request->user();

        // If user is not authenticated (shouldn't happen if 'auth:sanctum' runs first)
        if (!$user) {
            return response()->json([
                'message' => 'Unauthenticated.',
            ], 401);
        }

        // Check if the user's role is in the list of allowed roles
        if (!in_array($user->role, $roles)) {
            // 403 Forbidden means "authenticated but not authorized"
            // vs 401 Unauthorized which means "not authenticated"
            return response()->json([
                'message' => 'You do not have permission to access this resource.',
            ], 403);
        }

        // Role is valid — continue to the next middleware or controller
        return $next($request);
    }
}
