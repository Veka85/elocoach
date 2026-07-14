<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * Message Model
 *
 * Direct message between two users.
 * Simple 1-to-1 messaging system.
 */
class Message extends Model
{
    protected $fillable = [
        'sender_id',
        'receiver_id',
        'content',
        'read_at',
    ];

    protected $casts = [
        'read_at' => 'datetime',
    ];

    public function sender()
    {
        return $this->belongsTo(User::class, 'sender_id');
    }

    public function receiver()
    {
        return $this->belongsTo(User::class, 'receiver_id');
    }

    /**
     * Mark this message as read now.
     * Only updates if not already read (avoids unnecessary DB writes).
     */
    public function markAsRead(): void
    {
        if (is_null($this->read_at)) {
            $this->update(['read_at' => now()]);
        }
    }

    /**
     * Has this message been read?
     */
    public function isRead(): bool
    {
        return !is_null($this->read_at);
    }
}
