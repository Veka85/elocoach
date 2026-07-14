<?php

use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\CoachController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\MessageController;
use App\Http\Controllers\ReviewController;
use App\Http\Controllers\RiotController;
use App\Http\Controllers\SessionController;
use App\Http\Controllers\SubscriptionController;
use App\Http\Controllers\Admin\AdminDashboardController;
use App\Http\Controllers\Admin\AdminUserController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
| File: routes/api.php
|--------------------------------------------------------------------------
|
| ROUTING CONCEPT:
| Laravel routes map HTTP methods + URLs to controller methods.
| The api.php file is for API routes — they automatically:
| - Get the /api prefix (so Route::get('/coaches') becomes /api/coaches)
| - Return JSON errors instead of HTML
| - Don't need CSRF tokens (APIs use stateless tokens instead)
|
| MIDDLEWARE GROUPS:
| Route::middleware(['auth:sanctum', 'role:coach']) creates a group
| where ALL routes inside require:
| 1. A valid Sanctum token (auth:sanctum)
| 2. The user to have the 'coach' role (role:coach — our custom middleware)
|
*/

// =========================================================
// PUBLIC ROUTES — No authentication required
// =========================================================

// Authentication
Route::prefix('auth')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login',    [AuthController::class, 'login']);
});

// Browse coaches — public (anyone can see the coach list)
Route::get('/coaches',     [CoachController::class, 'index']);
Route::get('/coaches/{id}', [CoachController::class, 'show']);

// Subscription plans — public (show pricing to guests)
Route::get('/subscriptions/plans', [SubscriptionController::class, 'plans']);

// Coach reviews — public (show social proof on coach profiles)
Route::get('/reviews/coach/{coachId}', [ReviewController::class, 'forCoach']);


// =========================================================
// AUTHENTICATED ROUTES — Require valid Sanctum token
// =========================================================

Route::middleware('auth:sanctum')->group(function () {

    // Current user info
    Route::get('/auth/me',    [AuthController::class, 'me']);
    Route::post('/auth/logout', [AuthController::class, 'logout']);

    // Dashboard — role-appropriate data is returned by the controller
    Route::get('/dashboard', [DashboardController::class, 'index']);

    // Sessions — both coaches and students can view their sessions
    Route::get('/sessions',              [SessionController::class, 'index']);
    Route::get('/sessions/{session}',    [SessionController::class, 'show']);

    // Session lifecycle actions
    // These use Policies to check authorization (not just role, but ownership)
    Route::post('/sessions/{session}/confirm',  [SessionController::class, 'confirm']);
    Route::post('/sessions/{session}/complete', [SessionController::class, 'complete']);
    Route::post('/sessions/{session}/cancel',   [SessionController::class, 'cancel']);

    // Subscription management
    Route::get('/subscriptions/current', [SubscriptionController::class, 'current']);
    Route::post('/subscriptions',        [SubscriptionController::class, 'subscribe']);

    // Messages
    Route::get('/messages',             [MessageController::class, 'index']);
    Route::get('/messages/unread-count', [MessageController::class, 'unreadCount']);
    Route::get('/messages/{userId}',    [MessageController::class, 'conversation']);
    Route::post('/messages',            [MessageController::class, 'store']);

    // Riot API proxy (requires auth to prevent abuse)
    Route::get('/riot/summoner/{region}/{name}', [RiotController::class, 'summoner']);


    // =========================================================
    // STUDENT-ONLY ROUTES
    // =========================================================
    Route::middleware('role:student')->group(function () {
        Route::post('/sessions', [SessionController::class, 'store']); // Book a session
        Route::post('/reviews',  [ReviewController::class, 'store']);  // Leave a review
    });


    // =========================================================
    // COACH-ONLY ROUTES
    // =========================================================
    Route::middleware('role:coach')->group(function () {
        Route::put('/coaches/{id}/profile', [CoachController::class, 'updateProfile']);
    });


    // =========================================================
    // ADMIN-ONLY ROUTES
    // =========================================================
    Route::middleware('role:admin')->prefix('admin')->group(function () {
        Route::get('/dashboard',         [AdminDashboardController::class, 'index']);
        Route::get('/users',             [AdminUserController::class, 'index']);
        Route::put('/users/{user}',      [AdminUserController::class, 'update']);
        Route::delete('/users/{user}',   [AdminUserController::class, 'destroy']);
        Route::get('/sessions',          [AdminUserController::class, 'sessions']);
    });
});
