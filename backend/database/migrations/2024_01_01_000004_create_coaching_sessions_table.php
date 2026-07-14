<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Migration: Coaching Sessions Table
 *
 * This is the CORE table of the application. It records every
 * booking between a student and a coach.
 *
 * RELATIONSHIPS:
 * - coaching_sessions belongs to a coach (user with role=coach)
 * - coaching_sessions belongs to a student (user with role=student)
 * - This is a MANY-TO-MANY through a junction table pattern, but
 *   since sessions have their own data (time, price, status), we
 *   use a dedicated table instead of a pivot table.
 *
 * STATUS LIFECYCLE:
 * pending → confirmed → completed
 *                     ↘ cancelled
 *                     ↘ no_show
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('coaching_sessions', function (Blueprint $table) {
            $table->id();

            // Both coach and student link back to the users table.
            // We use different column names (coach_id, student_id) but both
            // reference the same users table. This is called a "self-referential
            // foreign key" pattern where one table references itself via aliases.
            $table->foreignId('coach_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('student_id')->constrained('users')->onDelete('cascade');

            // SCHEDULING
            $table->dateTime('scheduled_at');
            $table->unsignedInteger('duration_minutes')->default(60);

            // PRICING: Store the price AT TIME OF BOOKING.
            // The coach might change their rate later, but this session's
            // price should not change. So we copy the price here.
            $table->decimal('price', 8, 2)->default(0);

            // SESSION STATUS STATE MACHINE
            $table->enum('status', [
                'pending',    // Student booked, waiting for coach to confirm
                'confirmed',  // Coach accepted the booking
                'completed',  // Session happened, coach marked it done
                'cancelled',  // Either party cancelled
                'no_show',    // Student didn't show up
            ])->default('pending');

            // MEETING DETAILS
            $table->string('meet_link')->nullable(); // Google Meet, Discord, etc.
            $table->text('student_notes')->nullable(); // What student wants to focus on
            $table->text('cancellation_reason')->nullable();

            // INDEXES: Speed up the most common queries.
            // We often query "all sessions for this coach" or "all sessions for this student"
            $table->index(['coach_id', 'status']);
            $table->index(['student_id', 'status']);
            $table->index('scheduled_at');

            $table->timestamps();
        });

        // Session notes are in a separate table because they're written AFTER
        // the session, while the session itself is booked BEFORE.
        // This separation makes the session table cleaner.
        Schema::create('session_notes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('session_id')->constrained('coaching_sessions')->onDelete('cascade');
            $table->text('coach_notes')->nullable();
            $table->text('student_feedback')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('session_notes');
        Schema::dropIfExists('coaching_sessions');
    }
};
