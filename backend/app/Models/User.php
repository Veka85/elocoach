<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

/**
 * User Model
 *
 * CONCEPT: In Laravel, a Model represents a database table.
 * Each instance of User is one row in the users table.
 * The Model also defines RELATIONSHIPS to other tables.
 *
 * This class extends Authenticatable (not just Model) because
 * it represents a user who can log in. Authenticatable adds
 * the password hashing, login logic, and "remember me" features.
 *
 * TRAITS USED:
 * - HasApiTokens: From Laravel Sanctum. Adds the ability to issue
 *   and revoke API tokens (needed for our Bearer token auth).
 * - HasFactory: Allows us to use UserFactory in tests and seeders.
 * - Notifiable: Allows sending email notifications, push notifications, etc.
 *
 * @property int $id
 * @property string $name
 * @property string $email
 * @property string $role  'admin' | 'coach' | 'student'
 * @property string|null $summoner_name
 * @property string|null $region
 * @property CoachProfile|null $coachProfile
 * @property StudentProfile|null $studentProfile
 */
class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    /**
     * $fillable lists which columns can be mass-assigned.
     *
     * SECURITY CONCEPT - Mass Assignment Protection:
     * Without $fillable, a malicious user could POST
     * {"role": "admin"} and escalate their privileges.
     * By explicitly listing allowed fields, we prevent this.
     *
     * NEVER put sensitive fields like 'role' in $fillable if
     * users can set them directly. Note that 'role' IS here —
     * we handle this by only setting role in controlled code paths
     * (registration logic, admin actions), never from raw user input.
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
        'summoner_name',
        'region',
        'avatar_url',
        'discord_username',
    ];

    /**
     * $hidden ensures these fields are NEVER included in
     * JSON responses, even if you call $user->toArray() or
     * return $user directly from a route.
     *
     * SECURITY: Password hashes must never be sent to clients.
     * Remember tokens are internal session management.
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * $casts tells Eloquent how to transform database values.
     *
     * 'password' => 'hashed' means Eloquent will automatically
     * hash the password when you do: $user->password = 'plaintext'
     *
     * 'email_verified_at' => 'datetime' converts the stored string
     * to a Carbon datetime object for easy date manipulation.
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    // =========================================================
    // ROLE HELPER METHODS
    // These make role checks readable: $user->isCoach()
    // instead of $user->role === 'coach' everywhere.
    // =========================================================

    public function isAdmin(): bool
    {
        return $this->role === 'admin';
    }

    public function isCoach(): bool
    {
        return $this->role === 'coach';
    }

    public function isStudent(): bool
    {
        return $this->role === 'student';
    }

    // =========================================================
    // ELOQUENT RELATIONSHIPS
    //
    // CONCEPT: Relationships let you access related data through
    // the model, and Laravel handles the SQL JOIN automatically.
    //
    // Instead of:
    //   SELECT * FROM coach_profiles WHERE user_id = 5
    //
    // You just write:
    //   $user->coachProfile
    // =========================================================

    /**
     * ONE-TO-ONE: A user (who is a coach) has one coach profile.
     *
     * hasOne() means: look in the coach_profiles table
     * for a row where user_id = $this->id
     */
    public function coachProfile()
    {
        return $this->hasOne(CoachProfile::class);
    }

    /**
     * ONE-TO-ONE: A user (who is a student) has one student profile.
     */
    public function studentProfile()
    {
        return $this->hasOne(StudentProfile::class);
    }

    /**
     * ONE-TO-MANY: A coach has many sessions (as the coach).
     *
     * The second argument 'coach_id' specifies which foreign key
     * column in coaching_sessions points to this user.
     * Without it, Laravel would assume the foreign key is 'user_id'.
     */
    public function sessionsAsCoach()
    {
        return $this->hasMany(CoachingSession::class, 'coach_id');
    }

    /**
     * ONE-TO-MANY: A student has many sessions (as the student).
     */
    public function sessionsAsStudent()
    {
        return $this->hasMany(CoachingSession::class, 'student_id');
    }

    /**
     * ONE-TO-MANY: A coach has received many reviews.
     */
    public function reviewsReceived()
    {
        return $this->hasMany(Review::class, 'coach_id');
    }

    /**
     * ONE-TO-MANY: A student has written many reviews.
     */
    public function reviewsGiven()
    {
        return $this->hasMany(Review::class, 'student_id');
    }

    /**
     * ONE-TO-MANY: Messages sent by this user.
     */
    public function sentMessages()
    {
        return $this->hasMany(Message::class, 'sender_id');
    }

    /**
     * ONE-TO-MANY: Messages received by this user.
     */
    public function receivedMessages()
    {
        return $this->hasMany(Message::class, 'receiver_id');
    }

    /**
     * ONE-TO-MANY: User's subscription history.
     */
    public function subscriptions()
    {
        return $this->hasMany(Subscription::class);
    }

    /**
     * Get the user's currently active subscription.
     * This is a convenience method — not a relationship method.
     */
    public function activeSubscription()
    {
        return $this->subscriptions()
                    ->where('status', 'active')
                    ->where('ends_at', '>', now())
                    ->latest()
                    ->first();
    }
}
