<?php

namespace Database\Seeders;

use App\Models\SubscriptionPlan;
use Illuminate\Database\Seeder;

/**
 * SubscriptionPlanSeeder
 *
 * Creates the three subscription tiers.
 * Plans are admin-managed content, so we seed them here.
 */
class SubscriptionPlanSeeder extends Seeder
{
    public function run(): void
    {
        $plans = [
            [
                'name'               => 'Silver',
                'slug'               => 'silver',
                'price'              => 29.99,
                'sessions_per_month' => 2,
                'features'           => [
                    '2 coaching sessions per month',
                    'Session recordings',
                    'Post-session notes from coach',
                    'Email support',
                ],
                'is_active'  => true,
                'sort_order' => 1,
            ],
            [
                'name'               => 'Gold',
                'slug'               => 'gold',
                'price'              => 54.99,
                'sessions_per_month' => 4,
                'features'           => [
                    '4 coaching sessions per month',
                    'Session recordings',
                    'Post-session notes from coach',
                    'VOD review included',
                    'Priority booking',
                    'Discord community access',
                    'Email & chat support',
                ],
                'is_active'  => true,
                'sort_order' => 2,
            ],
            [
                'name'               => 'Diamond',
                'slug'               => 'diamond',
                'price'              => 99.99,
                'sessions_per_month' => 8,
                'features'           => [
                    '8 coaching sessions per month',
                    'Session recordings',
                    'Detailed post-session reports',
                    'VOD reviews + replay analysis',
                    'Priority booking (24h guarantee)',
                    'Exclusive Diamond Discord channel',
                    'Monthly progress report',
                    'Direct coach Discord DM access',
                    '24/7 priority support',
                ],
                'is_active'  => true,
                'sort_order' => 3,
            ],
        ];

        foreach ($plans as $plan) {
            SubscriptionPlan::create($plan);
        }
    }
}
