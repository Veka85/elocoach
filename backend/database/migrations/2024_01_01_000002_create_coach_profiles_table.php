<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Migration: Coach Profiles Table
 *
 * DESIGN DECISION: Why a separate coach_profiles table instead of
 * putting everything in the users table?
 *
 * This is the "Profile Pattern" — it keeps the users table lean
 * and clean. Only coaches have coaching data, so putting it in
 * users would result in many NULL columns for students and admins.
 *
 * This is a ONE-TO-ONE relationship:
 * users (1) ←→ (1) coach_profiles
 *
 * A coach IS a user, but has additional coach-specific data stored separately.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('coach_profiles', function (Blueprint $table) {
            $table->id();

            // FOREIGN KEY: Links this profile to a user.
            // foreignId() creates an unsigned BIGINT column.
            // constrained() adds the FOREIGN KEY constraint to the users table.
            // onDelete('cascade') means: if the user is deleted, their profile is too.
            $table->foreignId('user_id')->constrained()->onDelete('cascade');

            // PROFILE CONTENT
            $table->text('bio')->nullable();
            $table->decimal('hourly_rate', 8, 2)->default(0); // e.g. 25.50

            // LoL RANK SYSTEM
            $table->string('rank')->default('Unranked'); // Iron, Bronze, ..., Challenger
            $table->string('peak_rank')->nullable(); // Highest ever rank

            // JSON COLUMNS: Store arrays in a single column.
            // MySQL stores as JSON, Eloquent casts it to a PHP array automatically
            // (when using $casts in the Model).
            // Example: ["Mid Lane", "Top Lane", "Teamfight Composition"]
            $table->json('specializations')->nullable();

            // Example: ["Ahri", "Syndra", "Orianna", "Viktor"]
            $table->json('champions')->nullable();

            // Example: ["English", "Spanish", "German"]
            $table->json('languages')->nullable();

            // ADMIN VERIFICATION: Coaches must be approved by admin before appearing
            // in search results. This prevents fake coaches from taking bookings.
            $table->boolean('is_verified')->default(false);
            $table->boolean('is_available')->default(true);

            // COMPUTED STATS: These could be calculated via queries, but storing
            // them denormalized improves read performance on the coaches list page.
            // We update these when reviews are submitted.
            $table->decimal('rating_avg', 3, 2)->default(0.00); // e.g. 4.85
            $table->unsignedInteger('total_sessions')->default(0);
            $table->unsignedInteger('total_reviews')->default(0);

            // SOCIAL LINKS
            $table->string('youtube_url')->nullable();
            $table->string('twitch_url')->nullable();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('coach_profiles');
    }
};
