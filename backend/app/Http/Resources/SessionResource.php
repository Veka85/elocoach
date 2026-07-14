<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * SessionResource — API Resource for CoachingSession model
 *
 * Returns session data with nested coach and student summaries.
 * The frontend needs to know who's involved without a separate API call.
 */
class SessionResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'               => $this->id,
            'status'           => $this->status,
            'scheduled_at'     => $this->scheduled_at?->toISOString(),
            'duration_minutes' => $this->duration_minutes,
            'price'            => (float) $this->price,
            'meet_link'        => $this->meet_link,
            'student_notes'    => $this->student_notes,
            'cancellation_reason' => $this->cancellation_reason,
            'created_at'       => $this->created_at?->toISOString(),

            // Nested relationship data
            // The controller should eager-load these with with('coach', 'student')
            'coach'   => $this->whenLoaded('coach', fn() => [
                'id'           => $this->coach->id,
                'name'         => $this->coach->name,
                'summoner_name' => $this->coach->summoner_name,
                'avatar_url'   => $this->coach->avatar_url,
                'rank'         => $this->coach->coachProfile?->rank,
            ]),
            'student' => $this->whenLoaded('student', fn() => [
                'id'           => $this->student->id,
                'name'         => $this->student->name,
                'summoner_name' => $this->student->summoner_name,
                'avatar_url'   => $this->student->avatar_url,
            ]),

            // Include notes if loaded
            'notes' => $this->whenLoaded('notes', fn() => [
                'coach_notes'      => $this->notes?->coach_notes,
                'student_feedback' => $this->notes?->student_feedback,
            ]),

            // Include review if loaded
            'review' => new ReviewResource($this->whenLoaded('review')),

            // Computed flags — useful for the frontend to know what actions are available
            'can_confirm'  => $this->canBeConfirmed(),
            'can_complete' => $this->canBeCompleted(),
            'can_cancel'   => $this->canBeCancelled(),
            'has_review'   => $this->whenLoaded('review', fn() => !is_null($this->review)),
        ];
    }
}
