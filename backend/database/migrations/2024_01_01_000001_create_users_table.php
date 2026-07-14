<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Migration: Create Users Table
 *
 * CONCEPT: Migrations are like version control for your database.
 * Instead of writing raw SQL, you define table structure in PHP.
 * This means the whole team gets the same database by running
 * `php artisan migrate` — no manual SQL scripts needed.
 *
 * NAMING: The date prefix (2024_01_01_000001) ensures migrations
 * run in order. Tables that are referenced by foreign keys must
 * be created BEFORE the tables that reference them.
 */
return new class extends Migration
{
    /**
     * Run the migrations — creates the table.
     * Called by `php artisan migrate`
     */
    public function up(): void
    {
        Schema::create('users', function (Blueprint $table) {
            // PRIMARY KEY: Auto-incrementing integer, always the first column
            $table->id();

            // BASIC INFO
            $table->string('name');
            $table->string('email')->unique(); // unique() adds a database-level UNIQUE constraint

            $table->timestamp('email_verified_at')->nullable(); // null means not yet verified

            // SECURITY: Password is stored HASHED (bcrypt), never plain text.
            // Laravel's Hash::make() handles this automatically.
            $table->string('password');

            // ROLE SYSTEM: We use an enum to limit allowed values at DB level.
            // This prevents garbage data even if our app code has bugs.
            // Default is 'student' — most users signing up are students.
            $table->enum('role', ['admin', 'coach', 'student'])->default('student');

            // LEAGUE OF LEGENDS SPECIFIC FIELDS
            // nullable() means these can be empty — not everyone fills them in immediately
            $table->string('summoner_name')->nullable();
            $table->string('region')->nullable(); // EUW, NA, KR, etc.
            $table->string('avatar_url')->nullable();
            $table->string('discord_username')->nullable();

            // SANCTUM: Remember token for "keep me logged in" functionality
            $table->rememberToken();

            // TIMESTAMPS: Automatically adds `created_at` and `updated_at` columns.
            // Laravel updates these automatically when you save models.
            $table->timestamps();
        });

        // Personal access tokens table — required by Laravel Sanctum.
        // This table stores the API tokens issued to users.
        Schema::create('password_reset_tokens', function (Blueprint $table) {
            $table->string('email')->primary();
            $table->string('token');
            $table->timestamp('created_at')->nullable();
        });

        Schema::create('sessions', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->foreignId('user_id')->nullable()->index();
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->longText('payload');
            $table->integer('last_activity')->index();
        });
    }

    /**
     * Reverse the migrations — drops the table.
     * Called by `php artisan migrate:rollback`
     *
     * IMPORTANT: Always define down() so you can safely roll back migrations
     * during development. In production, rolling back is risky — use new
     * migrations to modify tables instead.
     */
    public function down(): void
    {
        Schema::dropIfExists('sessions');
        Schema::dropIfExists('password_reset_tokens');
        Schema::dropIfExists('users');
    }
};
