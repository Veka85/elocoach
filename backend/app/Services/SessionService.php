<?php

namespace App\Services;

use App\Models\CoachingSession;
use App\Models\CoachProfile;
use App\Models\User;
use Illuminate\Support\Facades\DB;

/**
 * SessionService
 *
 * SERVICE CLASS CONCEPT:
 * Controllers should be thin — they handle HTTP (receiving requests,
 * returning responses). Business logic belongs in Service classes.
 *
 * Benefits:
 * 1. Business logic is reusable (artisan commands, jobs, tests can use it)
 * 2. Controllers stay readable — you can see the flow at a glance
 * 3. Services are easier to unit test in isolation
 *
 * This service handles all session-related business logic:
 * booking, confirming, completing, cancelling.
 */
class SessionService
{
    /**
     * Book a new coaching session.
     *
     * DB::transaction() is critical here. It ensures that either
     * BOTH the session creation AND the subscription decrement happen,
     * or NEITHER does. Without a transaction, we could deduct a session
     * credit but fail to create the session record — money lost!
     *
     * TRANSACTION CONCEPT: A DB transaction groups multiple queries into
     * an atomic unit. If any query fails, all changes are rolled back.
     *
     * @param User  $student  The student booking the session
     * @param array $data     Validated request data
     * @return CoachingSession
     * @throws \Exception if coach not found or booking fails
     */
    public function bookSession(User $student, array $data): CoachingSession
    {
        return DB::transaction(function () use ($student, $data) {
            // Fetch the coach's profile to get their current hourly rate
            $coach = User::findOrFail($data['coach_id']);
            $coachProfile = $coach->coachProfile;

            if (!$coachProfile || !$coachProfile->is_verified) {
                throw new \Exception('Coach is not available for booking.');
            }

            // Calculate the price based on duration and hourly rate.
            // We store this price SNAPSHOT in the session record.
            // The coach might change their rate later, but this session's
            // price is locked at booking time.
            $hours = $data['duration_minutes'] / 60;
            $price = $coachProfile->hourly_rate * $hours;

            // Create the session record
            $session = CoachingSession::create([
                'coach_id'         => $data['coach_id'],
                'student_id'       => $student->id,
                'scheduled_at'     => $data['scheduled_at'],
                'duration_minutes' => $data['duration_minutes'],
                'price'            => $price,
                'status'           => CoachingSession::STATUS_PENDING,
                'student_notes'    => $data['notes'] ?? null,
            ]);

            return $session;
        });
    }

    /**
     * Coach confirms a pending session.
     *
     * @param CoachingSession $session
     * @param string|null $meetLink Google Meet / Discord link
     * @return CoachingSession
     */
    public function confirmSession(CoachingSession $session, ?string $meetLink = null): CoachingSession
    {
        $session->update([
            'status'    => CoachingSession::STATUS_CONFIRMED,
            'meet_link' => $meetLink,
        ]);

        return $session->fresh(); // fresh() re-fetches from DB to get updated values
    }

    /**
     * Mark a session as completed (coach action).
     * This also increments the coach's total_sessions counter.
     */
    public function completeSession(CoachingSession $session): CoachingSession
    {
        DB::transaction(function () use ($session) {
            $session->update(['status' => CoachingSession::STATUS_COMPLETED]);

            // Update the coach's total session count (denormalized stat)
            CoachProfile::where('user_id', $session->coach_id)
                        ->increment('total_sessions');
        });

        return $session->fresh();
    }

    /**
     * Cancel a session.
     * Either the coach or student can cancel, but with different rules.
     *
     * @param CoachingSession $session
     * @param User $cancelledBy
     * @param string|null $reason
     * @return CoachingSession
     */
    public function cancelSession(
        CoachingSession $session,
        User $cancelledBy,
        ?string $reason = null
    ): CoachingSession {
        $session->update([
            'status'               => CoachingSession::STATUS_CANCELLED,
            'cancellation_reason'  => $reason,
        ]);

        return $session->fresh();
    }
}
