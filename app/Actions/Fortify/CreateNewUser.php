<?php

namespace App\Actions\Fortify;

use App\Models\User;
use Illuminate\Support\Facades\Session;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;
use Laravel\Fortify\Contracts\CreatesNewUsers;

class CreateNewUser implements CreatesNewUsers
{
    use PasswordValidationRules;

    /**
     * Validate and create a newly registered user.
     *
     * @param  array<string, string>  $input
     */
    public function create(array $input): User
    {
        \Log::info('CreateNewUser input', ['input' => array_keys($input), 'pricing_package_id' => $input['pricing_package_id'] ?? 'NOT SET']);

        Validator::make($input, [
            'name' => ['required', 'string', 'max:255'],
            'email' => [
                'required',
                'string',
                'email',
                'max:255',
                Rule::unique(User::class),
            ],
            'phone' => ['nullable', 'string', 'max:20'],
            'nama_bisnis' => ['nullable', 'string', 'max:255'],
            'kategori_bisnis' => ['nullable', 'string', 'max:255'],
            'address' => ['nullable', 'string', 'max:500'],
            'password' => $this->passwordRules(),
            'pricing_package_id' => ['required', 'exists:pricing_packages,id'],
            'g-recaptcha-response' => ['required', 'captcha'],
        ])->validate();

        // Store pricing package ID in flash session for redirect to payment
        // Using flash() so it survives session regeneration after login
        if (isset($input['pricing_package_id'])) {
            Session::flash('selected_package_id', $input['pricing_package_id']);
        }

        return User::create([
            'name' => $input['name'],
            'email' => $input['email'],
            'phone' => $input['phone'] ?? null,
            'nama_bisnis' => $input['nama_bisnis'] ?? null,
            'kategori_bisnis' => $input['kategori_bisnis'] ?? null,
            'address' => $input['address'] ?? null,
            'password' => $input['password'],
            'role' => 'user', // Default role for new users
        ]);
    }
}
