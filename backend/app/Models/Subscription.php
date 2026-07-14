<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * Subscription Model
 *
 * A user's active (or past) subscription to a plan.
 * One user can have many subscriptions over time (history),
 * but only one should be 'active' at any given moment.
 */
class Subscription extends Model
{
    protected $fillable = [
        'user_id',
        'plan_id',
        'sessions_remaining',
        'starts_at',
        'ends_at',
        'status',
    ];

    protected $casts = [
        'starts_at' => 'datetime',
        'ends_at'   => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function plan()
    {
        return $this->belongsTo(SubscriptionPlan::class, 'plan_id');
    }

    /**
     * Is this subscription currently valid?
     */
    public function isActive(): bool
    {
        return $this->status === 'active' && $this->ends_at->isFuture();
    }

    /**
     * Does the subscriber have sessions left this month?
     */
    public function hasSessionsRemaining(): bool
    {
        return $this->sessions_remaining > 0;
    }
}
