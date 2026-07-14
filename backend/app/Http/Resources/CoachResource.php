<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * CoachResource — API Resource for Coach profile data
 *
 * Used when returning coach listing/detail pages.
 * Combines data from the User model AND the CoachProfile model
 * into a single flat JSON object for the frontend.
 *
 * This is common: the frontend doesn't care about your DB structure —
 * it wants all coach info in one place.
 */
class CoachResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        // $this->resource is the underlying model (CoachProfile in this case)
        // When called via whenLoaded() from UserResource, $this is a CoachProfile.
        // We need to handle both cases: called directly or via relationship.
        $isCoachProfile = $this->resource instanceof \App\Models\CoachProfile;

        if ($isCoachProfile) {
            $profile = $this->resource;
            $user    = $this->resource->user;
        } else {
            // $this->resource is a User model — get their profile
            $profile = $this->resource->coachProfile;
            $user    = $this->resource;
        }

        if (!$profile) return [];

        return [
            // User info
            'id'              => $user->id,
            'name'            => $user->name,
            'email'           => $user->email,
            'summoner_name'   => $user->summoner_name,
            'region'          => $user->region,
            'avatar_url'      => $user->avatar_url,
            'discord_username' => $user->discord_username,

            // Coach profile info
            'bio'             => $profile->bio,
            'hourly_rate'     => (float) $profile->hourly_rate,
            'rank'            => $profile->rank,
            'peak_rank'       => $profile->peak_rank,
            'specializations' => $profile->specializations ?? [],
            'champions'       => $profile->champions ?? [],
            'languages'       => $profile->languages ?? [],
            'is_verified'     => (bool) $profile->is_verified,
            'is_available'    => (bool) $profile->is_available,
            'rating_avg'      => (float) $profile->rating_avg,
            'total_sessions'  => $profile->total_sessions,
            'total_reviews'   => $profile->total_reviews,
            'youtube_url'     => $profile->youtube_url,
            'twitch_url'      => $profile->twitch_url,
            'member_since'    => $user->created_at?->format('M Y'), // "Jan 2024"
        ];
    }
}
