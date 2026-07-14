<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * CoachProfile Model
 *
 * Stores coach-specific data. Every User with role='coach'
 * should have a corresponding CoachProfile row.
 *
 * The UserObserver (or seeder) creates this profile automatically
 * when a coach registers, so the profile always exists.
 */
class CoachProfile extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'bio',
        'hourly_rate',
        'rank',
        'peak_rank',
        'specializations',
        'champions',
        'languages',
        'is_verified',
        'is_available',
        'rating_avg',
        'total_sessions',
        'total_reviews',
        'youtube_url',
        'twitch_url',
    ];

    /**
     * CAST CONCEPT:
     * The database stores specializations/champions/languages as a JSON string.
     * The 'array' cast tells Eloquent to automatically:
     * - When READING: JSON decode the string → PHP array
     * - When WRITING: JSON encode the PHP array → string
     *
     * This means in your code you always work with PHP arrays,
     * never JSON strings:
     *   $profile->specializations  // Returns ['Mid Lane', 'Top Lane']
     *   $profile->specializations = ['Mid Lane'] // Saves as JSON
     */
    protected $casts = [
        'specializations' => 'array',
        'champions'       => 'array',
        'languages'       => 'array',
        'is_verified'     => 'boolean',
        'is_available'    => 'boolean',
        'hourly_rate'     => 'decimal:2',
        'rating_avg'      => 'decimal:2',
    ];

    // =========================================================
    // RELATIONSHIPS
    // =========================================================

    /**
     * INVERSE ONE-TO-ONE: This profile belongs to one user.
     *
     * belongsTo() is the inverse of hasOne().
     * It looks at this model's user_id column to find the User.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    // =========================================================
    // QUERY SCOPES
    //
    // CONCEPT: Scopes let you add reusable WHERE clauses
    // that can be chained onto queries.
    //
    // Usage: CoachProfile::verified()->available()->get()
    // Instead of: CoachProfile::where('is_verified', true)->where('is_available', true)->get()
    // =========================================================

    /**
     * Scope: only return verified (admin-approved) coaches.
     * Unverified coaches shouldn't appear in search results.
     */
    public function scopeVerified($query)
    {
        return $query->where('is_verified', true);
    }

    /**
     * Scope: only coaches who are currently accepting bookings.
     */
    public function scopeAvailable($query)
    {
        return $query->where('is_available', true);
    }

    /**
     * Scope: filter by rank.
     * Example: CoachProfile::byRank('Diamond')->get()
     */
    public function scopeByRank($query, string $rank)
    {
        return $query->where('rank', $rank);
    }

    /**
     * Scope: coaches within a price range.
     */
    public function scopeMaxPrice($query, float $maxPrice)
    {
        return $query->where('hourly_rate', '<=', $maxPrice);
    }

    // =========================================================
    // METHODS
    // =========================================================

    /**
     * Recalculate and save the rating average.
     * Called after a new review is submitted.
     * This keeps rating_avg in sync with actual reviews.
     */
    public function recalculateRating(): void
    {
        $stats = Review::where('coach_id', $this->user_id)
                       ->where('is_visible', true)
                       ->selectRaw('AVG(rating) as avg_rating, COUNT(*) as total')
                       ->first();

        $this->update([
            'rating_avg'    => round($stats->avg_rating ?? 0, 2),
            'total_reviews' => $stats->total ?? 0,
        ]);
    }
}
