<?php

namespace App\Http\Controllers;

use App\Models\SubscriptionPlan;
use App\Services\SubscriptionService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * SubscriptionController
 *
 * Handles subscription plan browsing and purchasing.
 */
class SubscriptionController extends Controller
{
    public function __construct(
        private SubscriptionService $subscriptionService
    ) {}

    /**
     * List all active subscription plans.
     * GET /api/subscriptions/plans  — public endpoint
     */
    public function plans(): JsonResponse
    {
        $plans = SubscriptionPlan::active()->get();

        return response()->json([
            'data' => $plans->map(fn($plan) => [
                'id'                  => $plan->id,
                'name'                => $plan->name,
                'slug'                => $plan->slug,
                'price'               => (float) $plan->price,
                'sessions_per_month'  => $plan->sessions_per_month,
                'features'            => $plan->features,
            ]),
        ]);
    }

    /**
     * Subscribe to a plan.
     * POST /api/subscriptions  — requires student auth
     * Body: { plan_id }
     */
    public function subscribe(Request $request): JsonResponse
    {
        $request->validate([
            'plan_id' => ['required', 'integer', 'exists:subscription_plans,id'],
        ]);

        $plan = SubscriptionPlan::findOrFail($request->plan_id);

        if (!$plan->is_active) {
            return response()->json(['message' => 'This plan is no longer available.'], 422);
        }

        $subscription = $this->subscriptionService->subscribe($request->user(), $plan);

        return response()->json([
            'data' => [
                'id'                 => $subscription->id,
                'plan_name'          => $plan->name,
                'sessions_remaining' => $subscription->sessions_remaining,
                'starts_at'          => $subscription->starts_at->toISOString(),
                'ends_at'            => $subscription->ends_at->toISOString(),
                'status'             => $subscription->status,
            ],
            'message' => "Subscribed to {$plan->name} plan successfully!",
        ], 201);
    }

    /**
     * Get the user's current subscription.
     * GET /api/subscriptions/current
     */
    public function current(Request $request): JsonResponse
    {
        $subscription = $request->user()->activeSubscription()?->load('plan');

        if (!$subscription) {
            return response()->json(['data' => null]);
        }

        return response()->json([
            'data' => [
                'id'                 => $subscription->id,
                'plan'               => $subscription->plan,
                'sessions_remaining' => $subscription->sessions_remaining,
                'starts_at'          => $subscription->starts_at->toISOString(),
                'ends_at'            => $subscription->ends_at->toISOString(),
                'status'             => $subscription->status,
            ],
        ]);
    }
}
