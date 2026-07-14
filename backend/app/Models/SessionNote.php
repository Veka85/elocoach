<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * SessionNote Model
 *
 * Post-session notes written by the coach and feedback from the student.
 * Stored separately from the session so the sessions table stays clean.
 */
class SessionNote extends Model
{
    protected $table = 'session_notes';

    protected $fillable = [
        'session_id',
        'coach_notes',
        'student_feedback',
    ];

    public function session()
    {
        return $this->belongsTo(CoachingSession::class, 'session_id');
    }
}
