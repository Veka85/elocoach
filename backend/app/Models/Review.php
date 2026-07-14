<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * Review Model
 *
 * A review is left by a student after a completed coaching session.
 * It has a rating (1-5) and an optional comment.
 *
 * One review per session (enforced by database unique constraint on session_id).
 */
class Review extends Model
{
    use HasFactory;

    protected $fillable = [
        'session_id',
        'coach_id',
        'student_id',
        'rating',
        'comment',
        'is_visible',
    ];

    protected $casts = [
        'rating'     => 'integer',
        'is_visible' => 'boolean',
    ];

    // =========================================================
    // RELATIONSHIPS
    // =========================================================

    public function session()
    {
        return $this->belongsTo(CoachingSession::class, 'session_id');
    }

    public function coach()
    {
        return $this->belongsTo(User::class, 'coach_id');
    }

    public function student()
    {
        return $this->belongsTo(User::class, 'student_id');
    }

    // =========================================================
    // QUERY SCOPES
    // =========================================================

    /**
     * Only show reviews that the admin hasn't hidden.
     * Chain: Review::visible()->where('coach_id', 5)->get()
     */
    public function scopeVisible($query)
    {
        return $query->where('is_visible', true);
    }
}
