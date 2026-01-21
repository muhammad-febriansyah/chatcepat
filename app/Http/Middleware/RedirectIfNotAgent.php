<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class RedirectIfNotAgent
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        if (!Auth::guard('agent')->check()) {
            return redirect()->route('agent.login');
        }

        // Check if agent is active
        $agent = Auth::guard('agent')->user();
        if (!$agent->is_active) {
            Auth::guard('agent')->logout();
            return redirect()->route('agent.login')
                ->withErrors(['email' => 'Akun Anda tidak aktif. Hubungi administrator.']);
        }

        // Update last active timestamp
        $agent->update([
            'last_active_at' => now(),
            'is_online' => true,
        ]);

        return $next($request);
    }
}
