<?php

/**
 * CORS Configuration
 *
 * CORS (Cross-Origin Resource Sharing) allows the React frontend (localhost:5173)
 * to make API requests to the Laravel backend (localhost:8000).
 * Without this, browsers block cross-origin requests for security.
 */
return [
    'paths' => ['api/*', 'sanctum/csrf-cookie'],

    'allowed_methods' => ['*'],

    // Allow requests from the React dev server
    'allowed_origins' => [
        env('FRONTEND_URL', 'http://localhost:5173'),
        'http://localhost:5173',
        'http://localhost:3000',
    'https://incomparable-dodol-bf3d5f.netlify.app',
        'https://vedrankovacevic.com',
    ],

    'allowed_origins_patterns' => [],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 0,

    // Allow cookies/credentials to be sent (needed for Sanctum)
    'supports_credentials' => true,
];
