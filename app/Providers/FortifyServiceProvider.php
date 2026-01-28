<?php

namespace App\Providers;

use App\Actions\Fortify\CreateNewUser;
use App\Actions\Fortify\ResetUserPassword;
use App\Models\Setting;
use App\Models\User;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Laravel\Fortify\Contracts\LoginResponse;
use Laravel\Fortify\Contracts\RegisterResponse;
use Laravel\Fortify\Features;
use Laravel\Fortify\Fortify;

class FortifyServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        $this->app->singleton(LoginResponse::class, function () {
            return new class implements LoginResponse {
                public function toResponse($request)
                {
                    $user = $request->user();

                    // Redirect based on user role
                    if ($user->role === 'admin') {
                        return redirect()->intended('/admin/dashboard');
                    }

                    // Default redirect for regular users
                    return redirect()->intended('/user/dashboard');
                }
            };
        });

        $this->app->singleton(RegisterResponse::class, function () {
            return new class implements RegisterResponse {
                public function toResponse($request)
                {
                    // Get package ID from request input (most reliable) or session
                    $packageId = $request->input('pricing_package_id')
                        ?? $request->session()->get('selected_package_id');

                    \Log::info('RegisterResponse called', [
                        'packageId_from_input' => $request->input('pricing_package_id'),
                        'packageId_from_session' => $request->session()->get('selected_package_id'),
                        'final_packageId' => $packageId,
                    ]);

                    if ($packageId) {
                        // Clear from session if exists
                        $request->session()->forget('selected_package_id');

                        \Log::info('Redirecting to payment', ['package_id' => $packageId]);

                        // Redirect to payment page with package ID
                        return redirect()->route('payment.index', ['package_id' => $packageId]);
                    }

                    \Log::info('Redirecting to dashboard - no package selected');
                    // Default redirect if no package selected
                    return redirect('/user/dashboard');
                }
            };
        });
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        $this->configureActions();
        $this->configureViews();
        $this->configureRateLimiting();
        $this->configureAuthentication();
    }

    /**
     * Configure Fortify actions.
     */
    private function configureActions(): void
    {
        Fortify::resetUserPasswordsUsing(ResetUserPassword::class);
        Fortify::createUsersUsing(CreateNewUser::class);
    }

    /**
     * Configure Fortify views.
     */
    private function configureViews(): void
    {
        Fortify::loginView(fn(Request $request) => Inertia::render('auth/login', [
            'canResetPassword' => Features::enabled(Features::resetPasswords()),
            'canRegister' => Features::enabled(Features::registration()),
            'status' => $request->session()->get('status'),
            'authBranding' => [
                'logo' => Setting::get('auth_logo')
                    ? '/storage/' . Setting::get('auth_logo')
                    : (Setting::get('logo') ? '/storage/' . Setting::get('logo') : null),
                'logo_name' => Setting::get('auth_logo_name', 'ChatCepat'),
                'tagline' => Setting::get('auth_tagline', 'Smart, Fast & Reliable'),
                'heading' => Setting::get('auth_heading', 'Kelola website Anda dengan mudah dan cepat'),
                'description' => Setting::get('auth_description', 'Platform manajemen konten modern dengan fitur lengkap untuk mengembangkan bisnis Anda.'),
                'features' => json_decode(Setting::get('auth_features', json_encode([
                    'Dashboard analytics yang powerful',
                    'Manajemen konten yang intuitif',
                    'Keamanan tingkat enterprise',
                ])), true),
                'copyright' => Setting::get('auth_copyright', '© 2025 ChatCepat. All rights reserved.'),
                'hero_image' => Setting::get('auth_hero_image') ? '/storage/' . Setting::get('auth_hero_image') : null,
            ],
        ]));

        Fortify::resetPasswordView(fn(Request $request) => Inertia::render('auth/reset-password', [
            'email' => $request->email,
            'token' => $request->route('token'),
        ]));

        Fortify::requestPasswordResetLinkView(fn(Request $request) => Inertia::render('auth/forgot-password', [
            'status' => $request->session()->get('status'),
        ]));

        Fortify::verifyEmailView(fn(Request $request) => Inertia::render('auth/verify-email', [
            'status' => $request->session()->get('status'),
        ]));

        Fortify::registerView(fn() => Inertia::render('auth/register', [
            'authBranding' => [
                'logo' => Setting::get('auth_logo')
                    ? '/storage/' . Setting::get('auth_logo')
                    : (Setting::get('logo') ? '/storage/' . Setting::get('logo') : null),
                'logo_name' => Setting::get('auth_logo_name', 'ChatCepat'),
                'tagline' => Setting::get('auth_tagline', 'Smart, Fast & Reliable'),
                'heading' => Setting::get('auth_heading', 'Kelola website Anda dengan mudah dan cepat'),
                'description' => Setting::get('auth_description', 'Platform manajemen konten modern dengan fitur lengkap untuk mengembangkan bisnis Anda.'),
                'features' => json_decode(Setting::get('auth_features', json_encode([
                    'Dashboard analytics yang powerful',
                    'Manajemen konten yang intuitif',
                    'Keamanan tingkat enterprise',
                ])), true),
                'copyright' => Setting::get('auth_copyright', '© 2025 ChatCepat. All rights reserved.'),
                'hero_image' => Setting::get('auth_hero_image') ? '/storage/' . Setting::get('auth_hero_image') : null,
            ],
            'businessCategories' => \App\Models\BusinessCategory::where('is_active', true)->orderBy('name')->get(),
            'pricingPackages' => \App\Models\PricingPackage::active()->ordered()->get(),
        ]));

        Fortify::twoFactorChallengeView(fn() => Inertia::render('auth/two-factor-challenge'));

        Fortify::confirmPasswordView(fn() => Inertia::render('auth/confirm-password'));
    }

    /**
     * Configure rate limiting.
     */
    private function configureRateLimiting(): void
    {
        RateLimiter::for('two-factor', function (Request $request) {
            return Limit::perMinute(5)->by($request->session()->get('login.id'));
        });

        RateLimiter::for('login', function (Request $request) {
            $throttleKey = Str::transliterate(Str::lower($request->input(Fortify::username())) . '|' . $request->ip());

            return Limit::perMinutes(5, 3)->by($throttleKey);
        });
    }

    /**
     * Configure authentication.
     */
    private function configureAuthentication(): void
    {
        Fortify::authenticateUsing(function (Request $request) {
            // Validate reCAPTCHA
            $request->validate([
                'g-recaptcha-response' => ['required', 'captcha'],
            ]);

            $user = User::where('email', $request->email)->first();

            if ($user && Hash::check($request->password, $user->password)) {
                return $user;
            }

            return null;
        });
    }
}
