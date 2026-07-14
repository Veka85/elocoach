<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * CoachingSession Model
 *
 * Represents a booked coaching session.
 * Central model of the application — most features connect here.
 *
 * NOTE: We name this "CoachingSession" (not "Session") because
 * "Session" is a reserved word in Laravel's own framework
 * (used for HTTP session handling). Always check for naming conflicts!
 */
class CoachingSession extends Model
{
    use HasFactory;

    /**
     * EXPLICIT TABLE NAME:
     * Laravel by default assumes the table name is the plural of the
     * model name: CoachingSession → coaching_sessions. That's correct
     * here, but it's good practice to be explicit when the auto-naming
     * might be ambiguous.
     */
    protected $table = 'coaching_sessions';

    protected $fillable = [
        'coach_id',
        'student_id',
        'scheduled_at',
        'duration_minutes',
        'price',
        'status',
        'meet_link',
        'student_notes',
        'cancellation_reason',
    ];

    protected $casts = [
        'scheduled_at' => 'datetime', // Carbon instance: $session->scheduled_at->format('d M Y')
        'price'        => 'decimal:2',
    ];

    // STATUS CONSTANTS — prevents typos like 'Pending' vs 'pending'
    const STATUS_PENDING   = 'pending';
    const STATUS_CONFIRMED = 'confirmed';
    const STATUS_COMPLETED = 'completed';
    const STATUS_CANCELLED = 'cancelled';
    const STATUS_NO_SHOW   = 'no_show';

    // =========================================================
    // RELATIONSHIPS
    // =========================================================

    /**
     * The coach who is teaching this session.
     * We specify 'coach_id' because the FK isn't the default 'user_id'.
     */
    public function coach()
    {
        return $this->belongsTo(User::class, 'coach_id');
    }

    /**
     * The student attending this session.
     */
    public function student()
    {
        return $this->belongsTo(User::class, 'student_id');
    }

    /**
     * ONE-TO-ONE: Each session can have one set of notes.
     * Notes are created/updated after the session ends.
     */
    public function notes()
    {
        return $this->hasOne(SessionNote::class, 'session_id');
    }

    /**
     * ONE-TO-ONE: Each session can have one review.
     * The unique() constraint on the database level prevents duplicates.
     */
    public function review()
    {
        return $this->hasOne(Review::class, 'session_id');
    }

    // =========================================================
    // QUERY SCOPES
    // =========================================================

    public function scopePending($query)
    {
        return $query->where('status', self::STATUS_PENDING);
    }

    public function scopeConfirmed($query)
    {
        return $query->where('status', self::STATUS_CONFIRMED);
    }

    public function scopeCompleted($query)
    {
        return $query->where('status', self::STATUS_COMPLETED);
    }

    public function scopeUpcoming($query)
    {
        return $query->whereIn('status', [self::STATUS_PENDING, self::STATUS_CONFIRMED])
                     ->where('scheduled_at', '>', now());
    }

    // =========================================================
    // HELPER METHODS
    // =========================================================

    /**
     * Can this session still be cancelled?
     * Business rule: Only pending and confirmed sessions can be cancelled.
     */
    public function canBeCancelled(): bool
    {
        return in_array($this->status, [self::STATUS_PENDING, self::STATUS_CONFIRMED]);
    }

    /**
     * Can this session be confirmed by the coach?
     * Only pending sessions can be confirmed.
     */
    public function canBeConfirmed(): bool
    {
        return $this->status === self::STATUS_PENDING;
    }

    /**
     * Can this session be marked as completed?
     * Only confirmed sessions that are in the past can be completed.
     */
    public function canBeCompleted(): bool
    {
        return $this->status === self::STATUS_CONFIRMED
               && $this->scheduled_at->isPast();
    }

    /**
     * Has a review been left for this session?
     */
    public function hasReview(): bool
    {
        return $this->review()->exists();
    }
}
