<?php

namespace App\Http\Requests\Auth;

use Illuminate\Foundation\Http\FormRequest;

/**
 * RegisterRequest — Form Request for user registration
 *
 * FORM REQUEST CONCEPT:
 * Instead of validating in the controller like this:
 *
 *   $validated = $request->validate([
 *       'email' => 'required|email',
 *       ...
 *   ]);
 *
 * We move validation to a dedicated class. Benefits:
 * 1. Controller stays clean and focused on business logic
 * 2. Validation rules are reusable and testable
 * 3. Custom error messages live in one place
 * 4. The authorize() method controls WHO can make this request
 *
 * Laravel automatically runs this before the controller method is called.
 * If validation fails, Laravel returns a 422 Unprocessable Entity response
 * with the validation errors — you don't write any error handling code!
 */
class RegisterRequest extends FormRequest
{
    /**
     * Who is allowed to make this request?
     * Returning true means anyone (guests can register).
     * For protected actions, you'd check: return $this->user()->isAdmin();
     */
    public function authorize(): bool
    {
        return true; // Public endpoint — anyone can register
    }

    /**
     * Validation rules.
     *
     * RULE SYNTAX:
     * 'required' — field must be present and non-empty
     * 'string'   — must be a string
     * 'max:255'  — max 255 characters (matches DB column size)
     * 'email'    — valid email format
     * 'unique:users,email' — no existing row in users table with this email
     * 'confirmed' — requires a matching 'field_confirmation' field
     * 'in:admin,coach,student' — value must be one of these
     * 'nullable' — allow null/empty values
     */
    public function rules(): array
    {
        return [
            'name'      => ['required', 'string', 'max:255'],
            'email'     => ['required', 'string', 'email', 'max:255', 'unique:users,email'],
            'password'  => ['required', 'string', 'min:8', 'confirmed'],
            // Users can only register as 'student' or 'coach' — never 'admin'
            // (admins are created manually or via seeder)
            'role'          => ['required', 'in:student,coach'],
            'summoner_name' => ['nullable', 'string', 'max:100'],
            'region'        => ['nullable', 'string', 'in:EUW,EUNE,NA,KR,JP,BR,LAN,LAS,OCE,TR,RU'],
        ];
    }

    /**
     * Custom error messages.
     * More user-friendly than Laravel's default messages.
     */
    public function messages(): array
    {
        return [
            'email.unique'    => 'An account with this email already exists.',
            'password.min'    => 'Password must be at least 8 characters.',
            'role.in'         => 'Role must be either student or coach.',
            'region.in'       => 'Please select a valid region.',
        ];
    }
}
