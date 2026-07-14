<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * StudentProfile Model
 *
 * Student-specific data. Created when a student registers.
 * Much simpler than CoachProfile — students don't need
 * verification, pricing, availability schedules, etc.
 */
class StudentProfile extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'rank',
        'main_role',
        'goals',
    ];

    /**
     * belongsTo is the inverse of hasOne.
     * StudentProfile knows its user via the user_id column.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
