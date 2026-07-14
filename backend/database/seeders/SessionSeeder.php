<?php

namespace Database\Seeders;

use App\Models\CoachingSession;
use App\Models\Review;
use App\Models\SessionNote;
use App\Models\User;
use Illuminate\Database\Seeder;

/**
 * SessionSeeder
 *
 * Creates realistic sessions between coaches and students.
 * Includes completed sessions with reviews to showcase the rating system.
 */
class SessionSeeder extends Seeder
{
    public function run(): void
    {
        $coach   = User::where('email', 'coach@elocoach.gg')->first();
        $coach2  = User::where('email', 'junglequeen@elocoach.gg')->first();
        $student = User::where('email', 'student@elocoach.gg')->first();
        $student2 = User::where('email', 'jamie@elocoach.gg')->first();

        if (!$coach || !$student) return;

        // =============================================
        // COMPLETED SESSIONS (with reviews)
        // =============================================
        $completedSessions = [
            [
                'coach_id'         => $coach->id,
                'student_id'       => $student->id,
                'scheduled_at'     => now()->subDays(30),
                'duration_minutes' => 60,
                'price'            => 25.00,
                'status'           => 'completed',
                'student_notes'    => 'Want to improve my wave management in mid lane',
                'review' => ['rating' => 5, 'comment' => 'Viktor was incredible! He explained wave management so clearly. I went from Silver 2 to Silver 1 in just one week after the session!'],
                'notes'  => ['coach_notes' => "Alex showed good mechanics but needs to work on:\n1. Freeze under tower when ahead\n2. Roaming after pushing mid\n3. Vision control around obj timers"],
            ],
            [
                'coach_id'         => $coach->id,
                'student_id'       => $student->id,
                'scheduled_at'     => now()->subDays(20),
                'duration_minutes' => 60,
                'price'            => 25.00,
                'status'           => 'completed',
                'student_notes'    => 'Need help with roaming',
                'review' => ['rating' => 5, 'comment' => 'Second session and still amazing. My roaming timing is so much better now. Viktor breaks everything down perfectly.'],
                'notes'  => ['coach_notes' => "Great improvement from last session! Now focus on:\n1. Roam timing with wave states\n2. Communication with team via pings\n3. Tracking enemy jungler position"],
            ],
            [
                'coach_id'         => $coach->id,
                'student_id'       => $student->id,
                'scheduled_at'     => now()->subDays(10),
                'duration_minutes' => 90,
                'price'            => 37.50,
                'status'           => 'completed',
                'student_notes'    => 'Want to practice Ahri mechanics and teamfight positioning',
                'review' => ['rating' => 4, 'comment' => 'Great session on Ahri mechanics. Some connection issues mid-session but coach handled it professionally. Very helpful.'],
                'notes'  => ['coach_notes' => "Ahri mechanics are looking good. Key improvements:\n1. Charm into combo\n2. Ult usage for picks vs escapes\n3. Sidelane vs grouping decision making"],
            ],
        ];

        foreach ($completedSessions as $sessionData) {
            $reviewData = $sessionData['review'];
            $notesData  = $sessionData['notes'];
            unset($sessionData['review'], $sessionData['notes']);

            $session = CoachingSession::create($sessionData);

            SessionNote::create([
                'session_id'  => $session->id,
                'coach_notes' => $notesData['coach_notes'],
            ]);

            Review::create([
                'session_id' => $session->id,
                'coach_id'   => $session->coach_id,
                'student_id' => $session->student_id,
                'rating'     => $reviewData['rating'],
                'comment'    => $reviewData['comment'],
                'is_visible' => true,
            ]);
        }

        // =============================================
        // UPCOMING SESSIONS
        // =============================================
        CoachingSession::create([
            'coach_id'         => $coach->id,
            'student_id'       => $student->id,
            'scheduled_at'     => now()->addDays(3)->setTime(18, 0),
            'duration_minutes' => 60,
            'price'            => 25.00,
            'status'           => 'confirmed',
            'meet_link'        => 'https://discord.gg/elocoach-vikp',
            'student_notes'    => 'Want to work on Orianna positioning and ball placement',
        ]);

        CoachingSession::create([
            'coach_id'         => $coach->id,
            'student_id'       => $student->id,
            'scheduled_at'     => now()->addDays(10)->setTime(20, 0),
            'duration_minutes' => 60,
            'price'            => 25.00,
            'status'           => 'pending',
            'student_notes'    => 'Need help with CS under tower',
        ]);

        // Session with second coach
        if ($coach2 && $student2) {
            CoachingSession::create([
                'coach_id'         => $coach2->id,
                'student_id'       => $student2->id,
                'scheduled_at'     => now()->addDays(2)->setTime(19, 0),
                'duration_minutes' => 90,
                'price'            => 52.50,
                'status'           => 'confirmed',
                'meet_link'        => 'https://discord.gg/junglequeen',
                'student_notes'    => 'I main Lee Sin but my pathing is terrible',
            ]);
        }

        // Update coach's stats to reflect seeded reviews
        if ($coachProfile = $coach->coachProfile) {
            $coachProfile->recalculateRating();
        }
    }
}
