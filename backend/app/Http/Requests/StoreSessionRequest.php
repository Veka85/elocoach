<?php

namespace App\Http\Requests;

use App\Models\User;
use Illuminate\Foundation\Http\FormRequest;

/**
 * StoreSessionRequest — Validates session booking data
 */
class StoreSessionRequest extends FormRequest
{
    /**
     * Only authenticated students can book sessions.
     * The 'auth:sanctum' middleware already ensures authentication,
     * but we double-check the role here for clarity.
     */
    public function authorize(): bool
    {
        return $this->user()->isStudent();
    }

    public function rules(): array
    {
        return [
            'coach_id' => [
                'required',
                'integer',
                // 'exists:users,id' — verifies the coach_id references a real user in DB
                'exists:users,id',
            ],
            'scheduled_at' => [
                'required',
                'date',
                // 'after:now' — session must be in the future
                'after:now',
            ],
            'duration_minutes' => [
                'required',
                'integer',
                // Minimum 30 minutes, max 3 hours
                'min:30',
                'max:180',
                // 'in:30,60,90,120,180' — only allow standard durations
                'in:30,60,90,120,180',
            ],
            'notes' => ['nullable', 'string', 'max:1000'],
        ];
    }

    public function messages(): array
    {
        return [
            'coach_id.exists'          => 'Selected coach does not exist.',
            'scheduled_at.after'       => 'Session must be scheduled in the future.',
            'duration_minutes.in'      => 'Duration must be 30, 60, 90, 120, or 180 minutes.',
        ];
    }

    /**
     * After validation passes, we can add custom validation logic.
     * This checks that the coach_id actually belongs to a verified coach.
     */
    public function withValidator($validator): void
    {
        $validator->after(function ($validator) {
            $coachId = $this->coach_id;

            if ($coachId) {
                $coach = User::with('coachProfile')->find($coachId);

                if (!$coach || !$coach->isCoach()) {
                    $validator->errors()->add('coach_id', 'Selected user is not a coach.');
                    return;
                }

                if (!$coach->coachProfile || !$coach->coachProfile->is_verified) {
                    $validator->errors()->add('coach_id', 'This coach is not yet verified and cannot accept bookings.');
                }

                if ($coach->coachProfile && !$coach->coachProfile->is_available) {
                    $validator->errors()->add('coach_id', 'This coach is not currently available for bookings.');
                }

                // Students cannot book themselves (shouldn't happen but good to guard)
                if ($coach->id === $this->user()->id) {
                    $validator->errors()->add('coach_id', 'You cannot book a session with yourself.');
                }
            }
        });
    }
}
