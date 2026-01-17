<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use App\Models\WhatsappSession;
use Symfony\Component\HttpFoundation\Response;

class EnsureHasWhatsAppSession
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (!$user) {
            return redirect()->route('login');
        }

        // Check if user has at least one connected WhatsApp session
        $hasConnectedSession = WhatsappSession::where('user_id', $user->id)
            ->where('status', 'connected')
            ->where('is_active', true)
            ->exists();

        if (!$hasConnectedSession) {
            // Check if user has any session at all
            $hasAnySession = WhatsappSession::where('user_id', $user->id)->exists();

            if ($hasAnySession) {
                return redirect()
                    ->route('admin.whatsapp.sessions.index')
                    ->with('error', 'Anda belum memiliki WhatsApp session yang terhubung. Silakan hubungkan session terlebih dahulu.');
            } else {
                return redirect()
                    ->route('admin.whatsapp.sessions.create')
                    ->with('error', 'Anda belum memiliki WhatsApp session. Silakan buat dan hubungkan session terlebih dahulu untuk menggunakan fitur ini.');
            }
        }

        return $next($request);
    }
}
