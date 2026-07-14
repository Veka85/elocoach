<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * MessageResource — API Resource for Message model
 */
class MessageResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'          => $this->id,
            'content'     => $this->content,
            'is_read'     => $this->isRead(),
            'read_at'     => $this->read_at?->toISOString(),
            'created_at'  => $this->created_at?->toISOString(),
            'sender'      => $this->whenLoaded('sender', fn() => [
                'id'        => $this->sender->id,
                'name'      => $this->sender->name,
                'avatar_url' => $this->sender->avatar_url,
            ]),
            'receiver'    => $this->whenLoaded('receiver', fn() => [
                'id'        => $this->receiver->id,
                'name'      => $this->receiver->name,
                'avatar_url' => $this->receiver->avatar_url,
            ]),
            // Is the authenticated user the sender?
            'is_mine'     => $request->user()?->id === $this->sender_id,
        ];
    }
}
