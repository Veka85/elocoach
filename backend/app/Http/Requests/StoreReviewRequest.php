<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

/**
 * StoreReviewRequest — Validates review submission
 */
class StoreReviewRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->isStudent();
    }

    public function rules(): array
    {
        return [
            'session_id' => [
                'required',
                'integer',
                'exists:coaching_sessions,id',
            ],
            'rating'  => ['required', 'integer', 'min:1', 'max:5'],
            'comment' => ['nullable', 'string', 'min:10', 'max:1000'],
        ];
    }

    public function messages(): array
    {
        return [
            'session_id.exists' => 'Session not found.',
            'rating.min'        => 'Rating must be at least 1 star.',
            'rating.max'        => 'Rating cannot exceed 5 stars.',
            'comment.min'       => 'If you leave a comment, it must be at least 10 characters.',
        ];
    }
}
