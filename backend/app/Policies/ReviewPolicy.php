<?php

namespace App\Policies;

use App\Models\CoachingSession;
use App\Models\Review;
use App\Models\User;

/**
 * ReviewPolicy
 *
 * Controls who can leave reviews and when.
 * This is where the "completed session" business rule lives.
 */
class ReviewPolicy
{
    /**
     * Can this user create a review for a given session?
     *
     * Rules:
     * 1. User must be the student of the session (not just any student)
     * 2. Session must be 'completed' (can't review before it happens)
     * 3. No review already exists for this session (unique per session)
     */
    public function create(User $user, CoachingSession $session): bool
    {
        return $user->id === $session->student_id
            && $session->status === CoachingSession::STATUS_COMPLETED
            && !$session->hasReview();
    }

    /**
     * Can this user delete a review?
     * Only admins and the review's author can delete.
     */
    public function delete(User $user, Review $review): bool
    {
        return $user->isAdmin() || $user->id === $review->student_id;
    }
}
