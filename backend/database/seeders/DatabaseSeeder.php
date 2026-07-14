<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

/**
 * DatabaseSeeder — Main seeder entry point
 *
 * SEEDER CONCEPT:
 * Seeders populate the database with initial/test data.
 * Run with: php artisan db:seed
 *
 * The DatabaseSeeder calls other seeders in the correct order.
 * ORDER MATTERS: Users must exist before profiles, profiles before sessions, etc.
 *
 * This creates a complete, realistic dataset to demo the application.
 */
class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Run seeders in dependency order
        $this->call([
            UserSeeder::class,            // Creates admin, coaches, students
            SubscriptionPlanSeeder::class, // Creates Silver/Gold/Diamond plans
            SessionSeeder::class,          // Creates sessions between coaches & students
        ]);

        $this->command->info('✅ EloCoach database seeded successfully!');
        $this->command->info('');
        $this->command->info('📧 Login credentials:');
        $this->command->info('   Admin:   admin@elocoach.gg / password');
        $this->command->info('   Coach:   coach@elocoach.gg / password');
        $this->command->info('   Student: student@elocoach.gg / password');
    }
}
