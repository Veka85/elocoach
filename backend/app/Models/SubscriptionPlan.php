<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * SubscriptionPlan Model
 *
 * Defines what plans are available for purchase.
 * This is admin-managed content, not user-created.
 */
class SubscriptionPlan extends Model
{
    protected $fillable = [
        'name',
        'slug',
        'price',
        'sessions_per_month',
        'features',
        'is_active',
        'sort_order',
    ];

    protected $casts = [
        'features'  => 'array',
        'is_active' => 'boolean',
        'price'     => 'decimal:2',
    ];

    /**
     * Scope: only show plans currently available for purchase.
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true)->orderBy('sort_order');
    }

    /**
     * All subscriptions using this plan.
     */
    public function subscriptions()
    {
        return $this->hasMany(Subscription::class, 'plan_id');
    }
}
