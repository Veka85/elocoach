<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Migration: Student Profiles Table
 *
 * Same pattern as coach_profiles — keeps the users table clean
 * and puts student-specific data here.
 *
 * ONE-TO-ONE: users (1) ←→ (1) student_profiles
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('student_profiles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');

            $table->string('rank')->default('Unranked');
            $table->string('main_role')->nullable(); // Top, Jungle, Mid, ADC, Support, Fill

            // Goals field: what does the student want to improve?
            // Text (unlimited length) vs string (255 chars)
            $table->text('goals')->nullable();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('student_profiles');
    }
};
