<?php

namespace Database\Seeders;

use App\Models\CoachProfile;
use App\Models\StudentProfile;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

/**
 * UserSeeder
 *
 * Creates the initial users for the application:
 * - 1 admin account
 * - 8 coach accounts with rich profiles
 * - 5 student accounts
 *
 * HASH CONCEPT:
 * Hash::make('password') creates a bcrypt hash of the plain text password.
 * This is what gets stored in the database.
 * When someone logs in, Laravel's Auth::attempt() hashes their input
 * and compares it to the stored hash.
 */
class UserSeeder extends Seeder
{
    public function run(): void
    {
        // =============================================
        // ADMIN USER
        // =============================================
        User::create([
            'name'     => 'EloCoach Admin',
            'email'    => 'admin@elocoach.gg',
            'password' => Hash::make('password'),
            'role'     => 'admin',
        ]);

        // =============================================
        // COACH USERS
        // =============================================
        $coaches = [
            [
                'user' => [
                    'name'           => 'Viktor Petrovic',
                    'email'          => 'coach@elocoach.gg',
                    'password'       => Hash::make('password'),
                    'role'           => 'coach',
                    'summoner_name'  => 'VikP Mid',
                    'region'         => 'EUW',
                    'discord_username' => 'vikp#1234',
                ],
                'profile' => [
                    'bio'             => "Hi! I'm a Diamond I mid laner with 6 years of competitive experience. I specialize in wave management, roaming, and champion mechanics. I've helped 150+ students climb from Silver to Platinum.",
                    'hourly_rate'     => 25.00,
                    'rank'            => 'Diamond',
                    'peak_rank'       => 'Master',
                    'specializations' => ['Mid Lane', 'Wave Management', 'Champion Mechanics', 'Roam Timing'],
                    'champions'       => ['Ahri', 'Syndra', 'Viktor', 'Orianna', 'Zed'],
                    'languages'       => ['English', 'Serbian'],
                    'is_verified'     => true,
                    'is_available'    => true,
                    'rating_avg'      => 4.85,
                    'total_sessions'  => 148,
                    'total_reviews'   => 87,
                    'youtube_url'     => 'https://youtube.com/@vikpmid',
                ],
            ],
            [
                'user' => [
                    'name'           => 'Sarah "Jungle Queen" Chen',
                    'email'          => 'junglequeen@elocoach.gg',
                    'password'       => Hash::make('password'),
                    'role'           => 'coach',
                    'summoner_name'  => 'JungleQueen EUW',
                    'region'         => 'EUW',
                    'discord_username' => 'junglequeen#5678',
                ],
                'profile' => [
                    'bio'             => "Grandmaster jungler focusing on pathing, objective control, and macro decision-making. Former collegiate esports player. My students average +2 divisions within 4 weeks of coaching.",
                    'hourly_rate'     => 35.00,
                    'rank'            => 'Grandmaster',
                    'peak_rank'       => 'Grandmaster',
                    'specializations' => ['Jungle', 'Pathing', 'Objective Control', 'Macro Play', 'Vision Control'],
                    'champions'       => ['Lee Sin', 'Nidalee', 'Hecarim', 'Graves', 'Kindred'],
                    'languages'       => ['English', 'Mandarin'],
                    'is_verified'     => true,
                    'is_available'    => true,
                    'rating_avg'      => 4.92,
                    'total_sessions'  => 312,
                    'total_reviews'   => 201,
                    'twitch_url'      => 'https://twitch.tv/junglequeen',
                ],
            ],
            [
                'user' => [
                    'name'           => 'Marcus "TopGod" Williams',
                    'email'          => 'topgod@elocoach.gg',
                    'password'       => Hash::make('password'),
                    'role'           => 'coach',
                    'summoner_name'  => 'TopGod NA',
                    'region'         => 'NA',
                    'discord_username' => 'topgod#9999',
                ],
                'profile' => [
                    'bio'             => "Master top laner specializing in split pushing, 1v1 matchups, and teleport usage. I make Riven look easy.",
                    'hourly_rate'     => 20.00,
                    'rank'            => 'Master',
                    'peak_rank'       => 'Master',
                    'specializations' => ['Top Lane', 'Split Push', 'Dueling', 'TP Usage'],
                    'champions'       => ['Riven', 'Darius', 'Fiora', 'Camille', 'Garen'],
                    'languages'       => ['English'],
                    'is_verified'     => true,
                    'is_available'    => true,
                    'rating_avg'      => 4.70,
                    'total_sessions'  => 95,
                    'total_reviews'   => 62,
                ],
            ],
            [
                'user' => [
                    'name'           => 'Kim "ADC Pro" Jinhee',
                    'email'          => 'adcpro@elocoach.gg',
                    'password'       => Hash::make('password'),
                    'role'           => 'coach',
                    'summoner_name'  => 'ADCPro KR',
                    'region'         => 'KR',
                ],
                'profile' => [
                    'bio'             => "Diamond ADC main from Korea. I coach positioning, kiting mechanics, and bot lane synergy. Perfect for players who want to improve their ADC fundamentals.",
                    'hourly_rate'     => 30.00,
                    'rank'            => 'Diamond',
                    'peak_rank'       => 'Diamond',
                    'specializations' => ['ADC', 'Positioning', 'Kiting', 'Bot Lane Synergy'],
                    'champions'       => ['Jinx', 'Caitlyn', 'Jhin', 'Kai\'Sa', 'Ezreal'],
                    'languages'       => ['English', 'Korean'],
                    'is_verified'     => true,
                    'is_available'    => true,
                    'rating_avg'      => 4.60,
                    'total_sessions'  => 67,
                    'total_reviews'   => 43,
                ],
            ],
            [
                'user' => [
                    'name'           => 'Alex "SupportGuru" Novak',
                    'email'          => 'supportguru@elocoach.gg',
                    'password'       => Hash::make('password'),
                    'role'           => 'coach',
                    'summoner_name'  => 'SupportGuru EUW',
                    'region'         => 'EUW',
                ],
                'profile' => [
                    'bio'             => "Platinum support main. I specialize in roaming supports, engage timing, and vision control. If you want to climb as support in solo queue, I can help.",
                    'hourly_rate'     => 15.00,
                    'rank'            => 'Platinum',
                    'peak_rank'       => 'Diamond',
                    'specializations' => ['Support', 'Engage', 'Vision Control', 'Roaming'],
                    'champions'       => ['Thresh', 'Leona', 'Nautilus', 'Blitzcrank', 'Lulu'],
                    'languages'       => ['English', 'Czech'],
                    'is_verified'     => true,
                    'is_available'    => true,
                    'rating_avg'      => 4.50,
                    'total_sessions'  => 43,
                    'total_reviews'   => 28,
                ],
            ],
            // Unverified coach (shows admin verification workflow)
            [
                'user' => [
                    'name'           => 'New Coach Unverified',
                    'email'          => 'newcoach@elocoach.gg',
                    'password'       => Hash::make('password'),
                    'role'           => 'coach',
                    'summoner_name'  => 'NewCoach EUW',
                    'region'         => 'EUW',
                ],
                'profile' => [
                    'bio'             => "New coach waiting for verification. Diamond 2 mid laner.",
                    'hourly_rate'     => 20.00,
                    'rank'            => 'Diamond',
                    'peak_rank'       => 'Diamond',
                    'specializations' => ['Mid Lane'],
                    'champions'       => ['Zed', 'Yasuo'],
                    'languages'       => ['English'],
                    'is_verified'     => false, // Pending admin approval
                    'is_available'    => false,
                ],
            ],
        ];

        foreach ($coaches as $coachData) {
            $user = User::create($coachData['user']);
            CoachProfile::create(array_merge(
                ['user_id' => $user->id],
                $coachData['profile']
            ));
        }

        // =============================================
        // STUDENT USERS
        // =============================================
        $students = [
            [
                'name'           => 'Alex Player',
                'email'          => 'student@elocoach.gg',
                'password'       => Hash::make('password'),
                'role'           => 'student',
                'summoner_name'  => 'AlexPlayer123',
                'region'         => 'EUW',
                'discord_username' => 'alexplayer#4321',
            ],
            [
                'name'           => 'Jamie Gamer',
                'email'          => 'jamie@elocoach.gg',
                'password'       => Hash::make('password'),
                'role'           => 'student',
                'summoner_name'  => 'JamieGamer',
                'region'         => 'NA',
            ],
            [
                'name'           => 'Chris Noob',
                'email'          => 'chris@elocoach.gg',
                'password'       => Hash::make('password'),
                'role'           => 'student',
                'summoner_name'  => 'ChrisNoob99',
                'region'         => 'EUW',
            ],
            [
                'name'           => 'Taylor Swift',
                'email'          => 'taylor@elocoach.gg',
                'password'       => Hash::make('password'),
                'role'           => 'student',
                'summoner_name'  => 'TaySwift LoL',
                'region'         => 'NA',
            ],
        ];

        $studentProfiles = [
            ['rank' => 'Silver', 'main_role' => 'Mid', 'goals' => 'I want to reach Gold this season and improve my mid lane mechanics. I struggle with wave management and roaming.'],
            ['rank' => 'Gold', 'main_role' => 'ADC', 'goals' => 'Want to hit Platinum. Need help with my positioning in teamfights.'],
            ['rank' => 'Bronze', 'main_role' => 'Jungle', 'goals' => 'Complete beginner to jungling. Want to learn pathing and gank timings.'],
            ['rank' => 'Platinum', 'main_role' => 'Support', 'goals' => 'Trying to hit Diamond. My macro is weak and I need help with roaming as support.'],
        ];

        foreach ($students as $i => $studentData) {
            $user = User::create($studentData);
            StudentProfile::create(array_merge(
                ['user_id' => $user->id],
                $studentProfiles[$i]
            ));
        }
    }
}
