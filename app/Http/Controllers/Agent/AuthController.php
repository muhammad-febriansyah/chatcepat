<?php

namespace App\Http\Controllers\Agent;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class AuthController extends Controller
{
    /**
     * Show the agent login form.
     */
    public function showLogin(): Response
    {
        return Inertia::render('agent/login');
    }

    /**
     * Handle agent login request.
     */
    public function login(Request $request): RedirectResponse
    {
        $credentials = $request->validate([
            'email' => 'required|email',
            'password' => 'required|string',
        ]);

        $remember = $request->boolean('remember');

        // Attempt to authenticate with agent guard
        if (Auth::guard('agent')->attempt($credentials, $remember)) {
            $request->session()->regenerate();

            $agent = Auth::guard('agent')->user();

            // Check if agent is active
            if (!$agent->is_active) {
                Auth::guard('agent')->logout();
                $request->session()->invalidate();
                $request->session()->regenerateToken();

                return back()->withErrors([
                    'email' => 'Akun Anda tidak aktif. Hubungi administrator.',
                ]);
            }

            // Update online status
            $agent->update([
                'is_online' => true,
                'last_active_at' => now(),
            ]);

            return redirect()->intended(route('agent.dashboard'));
        }

        return back()->withErrors([
            'email' => 'Email atau password salah.',
        ])->onlyInput('email');
    }

    /**
     * Handle agent logout request.
     */
    public function logout(Request $request): RedirectResponse
    {
        $agent = Auth::guard('agent')->user();

        // Update online status before logout
        if ($agent) {
            $agent->update([
                'is_online' => false,
            ]);
        }

        Auth::guard('agent')->logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect()->route('agent.login');
    }
}
