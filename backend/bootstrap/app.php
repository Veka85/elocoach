<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

/*
|--------------------------------------------------------------------------
| Bootstrap Application
| File: bootstrap/app.php
|--------------------------------------------------------------------------
|
| In Laravel 11, this is where you register middleware, service providers,
| and exception handling. Prior to Laravel 11, this was spread across
| App\Http\Kernel.php and other files.
|
| MIDDLEWARE REGISTRATION CONCEPT:
| We register our custom 'role' middleware here with an alias.
| This lets us use 'role:admin' in routes instead of the full class path.
|
*/

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__ . '/../routes/web.php',
        api: __DIR__ . '/../routes/api.php',
        commands: __DIR__ . '/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        // CORS: allow the React frontend to call the API
        $middleware->use([
            \Illuminate\Http\Middleware\HandleCors::class,
        ]);

        // Register our custom role middleware with the alias 'role'
        $middleware->alias([
            'role' => \App\Http\Middleware\EnsureRole::class,
        ]);

        // We use pure Bearer token auth (token stored in localStorage, sent as
        // Authorization: Bearer {token}). Do NOT call statefulApi() — that
        // switches Sanctum to cookie/session mode and demands CSRF tokens,
        // which our React frontend never sends.
    })
    ->withExceptions(function (Exceptions $exceptions) {
        // Customize how exceptions are rendered as JSON for API routes

        // ModelNotFoundException is thrown by findOrFail() when record doesn't exist.
        // Default: Laravel returns a 404 HTML page.
        // Custom: We return a JSON response (better for APIs).
        $exceptions->render(function (\Illuminate\Database\Eloquent\ModelNotFoundException $e, $request) {
            if ($request->is('api/*')) {
                return response()->json([
                    'message' => 'Resource not found.',
                ], 404);
            }
        });

        // AuthorizationException is thrown by $this->authorize() in controllers
        // when a Policy method returns false.
        $exceptions->render(function (\Illuminate\Auth\Access\AuthorizationException $e, $request) {
            if ($request->is('api/*')) {
                return response()->json([
                    'message' => 'You are not authorized to perform this action.',
                ], 403);
            }
        });
    })->create();
