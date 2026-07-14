<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Migration: Reviews Table
 *
 * Students leave reviews for coaches after completed sessions.
 *
 * BUSINESS RULE (enforced at application level, not DB level):
 * - Only one review per session (unique constraint on session_id)
 * - Only the student who attended can leave a review
 * - Session must be 'completed' status
 *
 * We store both coach_id and student_id here for easy querying:
 * "Get all reviews for coach X" vs "Get all reviews by student Y"
 * Without these, we'd need expensive JOINs through coaching_sessions.
 * This is a controlled form of DENORMALIZATION for performance.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('reviews', function (Blueprint $table) {
            $table->id();

            // ONE review per session — unique() prevents duplicate reviews
            $table->foreignId('session_id')
                  ->unique() // Database-level enforcement: one review per session
                  ->constrained('coaching_sessions')
                  ->onDelete('cascade');

            $table->foreignId('coach_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('student_id')->constrained('users')->onDelete('cascade');

            // Rating: 1 to 5 stars — stored as TINYINT (1 byte) for efficiency
            $table->unsignedTinyInteger('rating'); // 1, 2, 3, 4, or 5

            $table->text('comment')->nullable();

            // Admin can hide inappropriate reviews without deleting them
            $table->boolean('is_visible')->default(true);

            $table->index('coach_id'); // Fast "get all reviews for coach X"
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('reviews');
    }
};
