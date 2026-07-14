<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

/**
 * UpdateCoachProfileRequest — Validates coach profile updates
 */
class UpdateCoachProfileRequest extends FormRequest
{
    public function authorize(): bool
    {
        // Only coaches can update coach profiles
        return $this->user()->isCoach();
    }

    public function rules(): array
    {
        return [
            'bio'             => ['nullable', 'string', 'max:2000'],
            'hourly_rate'     => ['nullable', 'numeric', 'min:5', 'max:500'],
            'rank'            => ['nullable', 'string', 'in:Iron,Bronze,Silver,Gold,Platinum,Emerald,Diamond,Master,Grandmaster,Challenger'],
            'peak_rank'       => ['nullable', 'string', 'in:Iron,Bronze,Silver,Gold,Platinum,Emerald,Diamond,Master,Grandmaster,Challenger'],
            'specializations' => ['nullable', 'array'],
            'specializations.*' => ['string', 'max:50'], // Each item in array must be a string
            'champions'       => ['nullable', 'array'],
            'champions.*'     => ['string', 'max:50'],
            'languages'       => ['nullable', 'array'],
            'languages.*'     => ['string', 'max:50'],
            'is_available'    => ['nullable', 'boolean'],
            'youtube_url'     => ['nullable', 'url', 'max:255'],
            'twitch_url'      => ['nullable', 'url', 'max:255'],
            // Also allow updating the user's own summoner/region info
            'summoner_name'   => ['nullable', 'string', 'max:100'],
            'region'          => ['nullable', 'string', 'in:EUW,EUNE,NA,KR,JP,BR,LAN,LAS,OCE,TR,RU'],
        ];
    }
}
