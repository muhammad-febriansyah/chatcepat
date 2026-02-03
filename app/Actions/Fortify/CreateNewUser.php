<?php

namespace App\Actions\Fortify;

use App\Models\User;
use App\Models\PricingPackage;
use App\Models\Transaction;
use App\Notifications\RegistrationSuccessNotification;
use Illuminate\Support\Facades\Session;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;
use Laravel\Fortify\Contracts\CreatesNewUsers;
use Carbon\Carbon;

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
        ], [
            'name.required' => 'Nama lengkap wajib diisi.',
            'name.string' => 'Nama harus berupa teks.',
            'name.max' => 'Nama maksimal 255 karakter.',
            'email.required' => 'Email wajib diisi.',
            'email.string' => 'Email harus berupa teks.',
            'email.email' => 'Format email tidak valid.',
            'email.max' => 'Email maksimal 255 karakter.',
            'email.unique' => 'Email sudah terdaftar. Silakan gunakan email lain.',
            'phone.string' => 'Nomor telepon harus berupa teks.',
            'phone.max' => 'Nomor telepon maksimal 20 karakter.',
            'nama_bisnis.string' => 'Nama bisnis harus berupa teks.',
            'nama_bisnis.max' => 'Nama bisnis maksimal 255 karakter.',
            'kategori_bisnis.string' => 'Kategori bisnis harus berupa teks.',
            'kategori_bisnis.max' => 'Kategori bisnis maksimal 255 karakter.',
            'address.string' => 'Alamat harus berupa teks.',
            'address.max' => 'Alamat maksimal 500 karakter.',
            'password.required' => 'Password wajib diisi.',
            'password.string' => 'Password harus berupa teks.',
            'password.confirmed' => 'Konfirmasi password tidak cocok.',
            'password.min' => 'Password minimal 8 karakter.',
            'pricing_package_id.required' => 'Paket harga wajib dipilih.',
            'pricing_package_id.exists' => 'Paket harga tidak valid.',
            'g-recaptcha-response.required' => 'Verifikasi captcha wajib dilakukan.',
            'g-recaptcha-response.captcha' => 'Verifikasi captcha gagal. Silakan coba lagi.',
        ])->validate();

        // Store pricing package ID in flash session for redirect to payment
        // Using flash() so it survives session regeneration after login
        if (isset($input['pricing_package_id'])) {
            Session::flash('selected_package_id', $input['pricing_package_id']);
        }

        $user = User::create([
            'name' => $input['name'],
            'email' => $input['email'],
            'phone' => $input['phone'] ?? null,
            'nama_bisnis' => $input['nama_bisnis'] ?? null,
            'kategori_bisnis' => $input['kategori_bisnis'] ?? null,
            'address' => $input['address'] ?? null,
            'password' => $input['password'],
            'role' => 'user', // Default role for new users
        ]);

        // Auto-activate Trial package if selected
        $transaction = null;
        if (isset($input['pricing_package_id'])) {
            $package = PricingPackage::find($input['pricing_package_id']);

            // If trial package (free), auto-activate immediately
            if ($package && $package->slug === 'trial' && $package->price == 0) {
                $now = Carbon::now();
                $expiresAt = match ($package->period_unit) {
                    'day' => $now->copy()->addDays($package->period),
                    'month' => $now->copy()->addMonths($package->period),
                    'year' => $now->copy()->addYears($package->period),
                    default => $now->copy()->addDays($package->period),
                };

                $transaction = Transaction::create([
                    'user_id' => $user->id,
                    'pricing_package_id' => $package->id,
                    'invoice_number' => Transaction::generateInvoiceNumber(),
                    'merchant_order_id' => Transaction::generateMerchantOrderId(),
                    'amount' => 0,
                    'payment_method' => 'free_trial',
                    'status' => 'paid',
                    'paid_at' => $now,
                    'subscription_expires_at' => $expiresAt,
                ]);

                // Clear session since trial is auto-activated
                Session::forget('selected_package_id');
            }
        }

        // Send registration success email notification
        try {
            $user->notify(new RegistrationSuccessNotification($transaction));
            \Log::info('Registration success email sent', ['user_id' => $user->id, 'email' => $user->email]);
        } catch (\Exception $e) {
            \Log::error('Failed to send registration email', [
                'user_id' => $user->id,
                'error' => $e->getMessage(),
            ]);
            // Don't fail registration if email fails
        }

        return $user;
    }
}
