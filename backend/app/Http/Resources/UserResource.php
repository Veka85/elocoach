<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * UserResource — API Resource for User model
 *
 * API RESOURCE CONCEPT:
 * Resources transform your Eloquent models into JSON responses.
 * Instead of returning $user directly (which would expose ALL fields
 * including sensitive ones like password hash), a Resource lets you
 * explicitly define what gets returned.
 *
 * Benefits:
 * 1. Security — never accidentally expose password, tokens, etc.
 * 2. Consistency — API responses have a predictable structure
 * 3. Transformation — rename fields, add computed values, format dates
 * 4. Conditional data — include related data only when loaded
 *
 * Usage in controller:
 *   return new UserResource($user);
 *   return UserResource::collection($users);
 *
 * $this refers to the underlying User model instance.
 */
class UserResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'              => $this->id,
            'name'            => $this->name,
            'email'           => $this->email,
            'role'            => $this->role,
            'summoner_name'   => $this->summoner_name,
            'region'          => $this->region,
            'avatar_url'      => $this->avatar_url,
            'discord_username' => $this->discord_username,
            'created_at'      => $this->created_at?->toISOString(),

            // CONDITIONAL RELATIONSHIPS:
            // whenLoaded() only includes this data if the relationship
            // was eager-loaded (with('coachProfile')).
            // This prevents the "N+1 query problem" — if you didn't load
            // the relationship, we don't trigger a lazy-load here.
            'coach_profile'   => new CoachResource($this->whenLoaded('coachProfile')),
            'student_profile' => $this->when(
                $this->relationLoaded('studentProfile'),
                fn() => [
                    'rank'      => $this->studentProfile?->rank,
                    'main_role' => $this->studentProfile?->main_role,
                    'goals'     => $this->studentProfile?->goals,
                ]
            ),
        ];
    }
}
