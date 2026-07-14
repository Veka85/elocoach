<?php

namespace App\Policies;

use App\Models\CoachingSession;
use App\Models\User;

/**
 * SessionPolicy
 *
 * POLICY CONCEPT:
 * While Middleware checks role (IS this user a coach?),
 * Policies check resource ownership (can THIS user do THIS action on THIS session?).
 *
 * Think of it as two layers of protection:
 * 1. Middleware: "Are you allowed to access this route at all?"
 * 2. Policy: "Are you allowed to do this specific thing to this specific resource?"
 *
 * Example scenario: Coach #1 cannot confirm Coach #2's sessions.
 * They're both coaches (same role), but the policy checks ownership.
 *
 * HOW IT WORKS:
 * In the controller: $this->authorize('confirm', $session)
 * Laravel auto-finds this policy (CoachingSession → SessionPolicy)
 * and calls the 'confirm' method, passing the authenticated user.
 *
 * Registration in AuthServiceProvider:
 * protected $policies = [CoachingSession::class => SessionPolicy::class];
 * (In Laravel 11, policies are auto-discovered from the app/Policies directory)
 */
class SessionPolicy
{
    /**
     * Who can view a session's details?
     * Only the coach, the student, or an admin.
     */
    public function view(User $user, CoachingSession $session): bool
    {
        return $user->isAdmin()
            || $user->id === $session->coach_id
            || $user->id === $session->student_id;
    }

    /**
     * Who can confirm a session?
     * Only the coach of THIS session (not just any coach).
     */
    public function confirm(User $user, CoachingSession $session): bool
    {
        return $user->id === $session->coach_id
            && $session->canBeConfirmed();
    }

    /**
     * Who can mark a session as complete?
     * The coach of this session, and only if it's in the past.
     */
    public function complete(User $user, CoachingSession $session): bool
    {
        return $user->id === $session->coach_id
            && $session->canBeCompleted();
    }

    /**
     * Who can cancel a session?
     * Either party (coach or student) can cancel, but only
     * if the session hasn't happened yet.
     */
    public function cancel(User $user, CoachingSession $session): bool
    {
        $isParticipant = $user->id === $session->coach_id
                      || $user->id === $session->student_id;

        return $isParticipant && $session->canBeCancelled();
    }

    /**
     * Who can update session notes?
     * Only the coach can write post-session notes.
     */
    public function updateNotes(User $user, CoachingSession $session): bool
    {
        return $user->id === $session->coach_id
            && $session->status === CoachingSession::STATUS_COMPLETED;
    }
}
