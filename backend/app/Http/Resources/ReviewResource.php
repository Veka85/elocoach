<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * ReviewResource — API Resource for Review model
 */
class ReviewResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'         => $this->id,
            'rating'     => $this->rating,
            'comment'    => $this->comment,
            'created_at' => $this->created_at?->toISOString(),
            'student'    => $this->whenLoaded('student', fn() => [
                'id'        => $this->student->id,
                'name'      => $this->student->name,
                'avatar_url' => $this->student->avatar_url,
            ]),
        ];
    }
}
