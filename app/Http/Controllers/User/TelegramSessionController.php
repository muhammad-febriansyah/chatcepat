<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Models\TelegramSession;
use App\Services\Telegram\TelegramService;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;

class TelegramSessionController extends Controller
{
    protected TelegramService $telegramService;

    public function __construct(TelegramService $telegramService)
    {
        $this->telegramService = $telegramService;
    }

    /**
     * Show session setup page
     */
    public function index()
    {
        $session = auth()->user()->telegramSessions()->latest()->first();

        return Inertia::render('user/telegram/session/index', [
            'session' => $session,
            'hasActiveSession' => $session && $session->isValid(),
        ]);
    }

    /**
     * Send OTP code to phone
     */
    public function sendCode(Request $request)
    {
        $request->validate([
            'phone' => 'required|string',
        ]);

        $sessionId = 'session_' . auth()->id() . '_' . Str::random(16);

        $result = $this->telegramService->sendCode($sessionId, $request->phone);

        if (!($result['success'] ?? false)) {
            return back()->withErrors(['phone' => $result['error'] ?? 'Failed to send code']);
        }

        // Save session
        $session = TelegramSession::updateOrCreate(
            ['user_id' => auth()->id()],
            [
                'session_id' => $sessionId,
                'phone' => $request->phone,
                'phone_code_hash' => $result['phone_code_hash'] ?? '',
                'is_authorized' => false,
            ]
        );

        return back()->with('success', 'OTP code sent to your Telegram');
    }

    /**
     * Verify OTP code
     */
    public function verifyCode(Request $request)
    {
        $request->validate([
            'code' => 'required|string',
            'password' => 'nullable|string', // 2FA password
        ]);

        $session = auth()->user()->telegramSessions()->latest()->first();

        if (!$session) {
            return back()->withErrors(['code' => 'Session not found']);
        }

        $result = $this->telegramService->verifyCode(
            $session->session_id,
            $session->phone,
            $request->code,
            $session->phone_code_hash,
            $request->password
        );

        if (!($result['success'] ?? false)) {
            return back()->withErrors(['code' => $result['error'] ?? 'Invalid code']);
        }

        // Update session
        $session->update([
            'is_authorized' => true,
            'authorized_at' => now(),
            'expires_at' => now()->addDays(30), // Session valid for 30 days
        ]);

        return back()->with('success', 'Telegram session authorized successfully');
    }

    /**
     * Check session status
     */
    public function checkStatus()
    {
        $session = auth()->user()->telegramSessions()->latest()->first();

        if (!$session) {
            return response()->json(['authorized' => false]);
        }

        $result = $this->telegramService->checkSession($session->session_id);

        return response()->json([
            'authorized' => $result['authorized'] ?? false,
            'session' => $session,
        ]);
    }

    /**
     * Logout session
     */
    public function logout()
    {
        $session = auth()->user()->telegramSessions()->latest()->first();

        if ($session) {
            $this->telegramService->logout($session->session_id);
            $session->delete();
        }

        return back()->with('success', 'Telegram session logged out');
    }
}
