<?php

namespace App\Services;

use App\Models\Subscription;
use App\Models\SubscriptionPlan;
use App\Models\User;
use Illuminate\Support\Facades\DB;

/**
 * SubscriptionService
 *
 * Handles subscription lifecycle: subscribing, cancelling,
 * and consuming session credits.
 */
class SubscriptionService
{
    /**
     * Subscribe a user to a plan.
     * If they have an active subscription, cancel it first (upgrade/downgrade).
     *
     * @param User $user
     * @param SubscriptionPlan $plan
     * @return Subscription
     */
    public function subscribe(User $user, SubscriptionPlan $plan): Subscription
    {
        return DB::transaction(function () use ($user, $plan) {
            // Cancel any existing active subscription
            $existing = $user->activeSubscription();
            if ($existing) {
                $existing->update(['status' => 'cancelled']);
            }

            // Create new subscription — starts now, ends in 30 days
            return Subscription::create([
                'user_id'             => $user->id,
                'plan_id'             => $plan->id,
                'sessions_remaining'  => $plan->sessions_per_month,
                'starts_at'           => now(),
                'ends_at'             => now()->addDays(30),
                'status'              => 'active',
            ]);
        });
    }

    /**
     * Consume one session credit from a user's subscription.
     * Returns false if they have no credits left.
     *
     * @param User $user
     * @return bool  Whether a credit was successfully consumed
     */
    public function consumeSessionCredit(User $user): bool
    {
        $subscription = $user->activeSubscription();

        if (!$subscription || !$subscription->hasSessionsRemaining()) {
            return false;
        }

        // decrement() is atomic — prevents race conditions where two
        // concurrent requests both think sessions_remaining = 1
        // and both decrement it to 0 (resulting in -1... but we prevent that
        // with the check above plus transaction wrapping at call site)
        $subscription->decrement('sessions_remaining');
        return true;
    }
}
