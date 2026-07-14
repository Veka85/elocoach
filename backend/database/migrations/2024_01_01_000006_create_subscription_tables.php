<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Migration: Subscription Plans and User Subscriptions
 *
 * Two tables handle subscriptions:
 *
 * 1. subscription_plans — the CATALOG of plans (Silver, Gold, Diamond)
 *    This is admin-configured. Plans don't belong to any user.
 *
 * 2. subscriptions — each USER's subscription to a plan
 *    This is the "junction" between users and plans.
 *
 * This pattern is common for SaaS applications:
 * Plan defines "what you get"
 * Subscription records "who has what plan and when"
 */
return new class extends Migration
{
    public function up(): void
    {
        // PLANS: The catalog of available subscription tiers
        Schema::create('subscription_plans', function (Blueprint $table) {
            $table->id();
            $table->string('name');           // "Silver", "Gold", "Diamond"
            $table->string('slug')->unique(); // "silver", "gold", "diamond" — URL-friendly name
            $table->decimal('price', 8, 2);   // Monthly price
            $table->unsignedInteger('sessions_per_month'); // How many sessions included

            // JSON stores a flexible list of features without needing a separate features table
            // Example: ["Priority booking", "Session recordings", "Discord access"]
            $table->json('features');

            $table->boolean('is_active')->default(true); // Can deactivate plans without deleting

            $table->unsignedInteger('sort_order')->default(0); // Controls display order

            $table->timestamps();
        });

        // USER SUBSCRIPTIONS: Tracks which user has which plan
        Schema::create('subscriptions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('plan_id')->constrained('subscription_plans');

            // How many sessions remain this billing period
            $table->unsignedInteger('sessions_remaining')->default(0);

            $table->timestamp('starts_at');
            $table->timestamp('ends_at'); // When the subscription expires

            $table->enum('status', ['active', 'cancelled', 'expired'])->default('active');

            // Only one ACTIVE subscription per user at a time
            $table->index(['user_id', 'status']);

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('subscriptions');
        Schema::dropIfExists('subscription_plans');
    }
};
