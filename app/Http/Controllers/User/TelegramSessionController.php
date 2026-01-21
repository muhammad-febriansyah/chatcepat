<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Models\TelegramBot;
use App\Services\TelegramService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Str;

class TelegramSessionController extends Controller
{
    private function serviceUrl(): string
    {
        return config('services.telegram_service.url', 'http://localhost:8001');
    }

    private function serviceHeaders(): array
    {
        $secretKey = config('services.telegram_service.secret_key');
        $headers = ['Accept' => 'application/json'];

        if ($secretKey) {
            $headers['X-Api-Key'] = $secretKey;
        }

        return $headers;
    }

    /**
     * Send OTP code to phone number
     */
    public function sendCode(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'phone' => 'required|string',
        ], [
            'phone.required' => 'Nomor telepon wajib diisi.',
        ]);

        $user = auth()->user();
        $sessionId = "user_{$user->id}_" . Str::random(16);

        try {
            $response = Http::withHeaders($this->serviceHeaders())
                ->timeout(30)
                ->post($this->serviceUrl() . '/send-code', [
                    'session_id' => $sessionId,
                    'phone' => $validated['phone'],
                ]);

            $result = $response->json();

            if ($result['success'] ?? false) {
                // Store session info in cache (expires in 10 minutes)
                Cache::put("telegram_session_{$user->id}", [
                    'session_id' => $sessionId,
                    'phone' => $validated['phone'],
                    'phone_code_hash' => $result['phone_code_hash'],
                ], now()->addMinutes(10));

                return response()->json([
                    'success' => true,
                    'message' => $result['message'] ?? 'Kode verifikasi telah dikirim',
                ]);
            }

            return response()->json([
                'success' => false,
                'message' => $result['message'] ?? 'Gagal mengirim kode',
            ], 400);

        } catch (\Exception $e) {
            Log::error('Telegram send code error', ['error' => $e->getMessage()]);
            return response()->json([
                'success' => false,
                'message' => 'Gagal menghubungi service Telegram: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Verify OTP code
     */
    public function verifyCode(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'code' => 'required|string',
            'password' => 'nullable|string',
        ], [
            'code.required' => 'Kode verifikasi wajib diisi.',
        ]);

        $user = auth()->user();
        $sessionData = Cache::get("telegram_session_{$user->id}");

        if (!$sessionData) {
            return response()->json([
                'success' => false,
                'message' => 'Session expired, silakan kirim ulang kode',
            ], 400);
        }

        try {
            $response = Http::withHeaders($this->serviceHeaders())
                ->timeout(30)
                ->post($this->serviceUrl() . '/verify-code', [
                    'session_id' => $sessionData['session_id'],
                    'phone' => $sessionData['phone'],
                    'code' => $validated['code'],
                    'phone_code_hash' => $sessionData['phone_code_hash'],
                    'password' => $validated['password'] ?? null,
                ]);

            $result = $response->json();

            if ($result['requires_2fa'] ?? false) {
                return response()->json([
                    'success' => false,
                    'requires_2fa' => true,
                    'message' => 'Akun memiliki 2FA, masukkan password',
                ]);
            }

            if ($result['success'] ?? false) {
                // Update cache with verified status
                $sessionData['verified'] = true;
                $sessionData['telegram_user'] = $result['user'] ?? null;
                Cache::put("telegram_session_{$user->id}", $sessionData, now()->addHours(1));

                return response()->json([
                    'success' => true,
                    'message' => 'Login berhasil!',
                    'user' => $result['user'] ?? null,
                ]);
            }

            return response()->json([
                'success' => false,
                'message' => $result['message'] ?? 'Verifikasi gagal',
            ], 400);

        } catch (\Exception $e) {
            Log::error('Telegram verify code error', ['error' => $e->getMessage()]);
            return response()->json([
                'success' => false,
                'message' => 'Gagal memverifikasi: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Create bot via BotFather
     */
    public function createBot(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'bot_name' => 'required|string|max:64',
            'bot_username' => 'required|string|max:32|regex:/^[a-zA-Z][a-zA-Z0-9_]*$/',
        ], [
            'bot_name.required' => 'Nama bot wajib diisi.',
            'bot_username.required' => 'Username bot wajib diisi.',
            'bot_username.regex' => 'Username hanya boleh huruf, angka, dan underscore.',
        ]);

        $user = auth()->user();
        $sessionData = Cache::get("telegram_session_{$user->id}");

        if (!$sessionData || !($sessionData['verified'] ?? false)) {
            return response()->json([
                'success' => false,
                'message' => 'Session tidak valid, silakan login ulang',
            ], 400);
        }

        try {
            $response = Http::withHeaders($this->serviceHeaders())
                ->timeout(60)
                ->post($this->serviceUrl() . '/create-bot', [
                    'session_id' => $sessionData['session_id'],
                    'bot_name' => $validated['bot_name'],
                    'bot_username' => $validated['bot_username'],
                ]);

            $result = $response->json();

            if ($result['success'] ?? false) {
                $botData = $result['bot'];

                // Save bot to database
                $bot = TelegramBot::create([
                    'user_id' => $user->id,
                    'bot_token' => $botData['token'],
                    'bot_id' => $botData['bot_id'],
                    'bot_username' => $botData['username'],
                    'bot_first_name' => $botData['name'],
                    'is_active' => true,
                ]);

                // Setup webhook
                $telegramService = new TelegramService($bot);
                $webhookResult = $telegramService->setWebhook($bot->webhook_url, $bot->webhook_secret);

                return response()->json([
                    'success' => true,
                    'message' => $result['message'] ?? 'Bot berhasil dibuat!',
                    'bot' => [
                        'id' => $bot->id,
                        'username' => $bot->bot_username,
                        'name' => $bot->bot_first_name,
                    ],
                ]);
            }

            return response()->json([
                'success' => false,
                'message' => $result['message'] ?? 'Gagal membuat bot',
                'error' => $result['error'] ?? null,
            ], 400);

        } catch (\Exception $e) {
            Log::error('Telegram create bot error', ['error' => $e->getMessage()]);
            return response()->json([
                'success' => false,
                'message' => 'Gagal membuat bot: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Check session status
     */
    public function checkSession(): JsonResponse
    {
        $user = auth()->user();
        $sessionData = Cache::get("telegram_session_{$user->id}");

        if (!$sessionData) {
            return response()->json([
                'success' => true,
                'logged_in' => false,
            ]);
        }

        try {
            $response = Http::withHeaders($this->serviceHeaders())
                ->timeout(15)
                ->post($this->serviceUrl() . '/check-session', [
                    'session_id' => $sessionData['session_id'],
                ]);

            $result = $response->json();

            return response()->json([
                'success' => true,
                'logged_in' => $result['authorized'] ?? false,
                'user' => $sessionData['telegram_user'] ?? null,
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => true,
                'logged_in' => false,
            ]);
        }
    }

    /**
     * Logout from Telegram session
     */
    public function logout(): JsonResponse
    {
        $user = auth()->user();
        $sessionData = Cache::get("telegram_session_{$user->id}");

        if ($sessionData) {
            try {
                Http::withHeaders($this->serviceHeaders())
                    ->timeout(15)
                    ->post($this->serviceUrl() . '/logout', [
                        'session_id' => $sessionData['session_id'],
                    ]);
            } catch (\Exception $e) {
                // Try to delete session files even if logout fails
                try {
                    Http::withHeaders($this->serviceHeaders())
                        ->timeout(10)
                        ->post($this->serviceUrl() . '/delete-session', [
                            'session_id' => $sessionData['session_id'],
                        ]);
                } catch (\Exception $e) {
                    // Ignore
                }
            }

            Cache::forget("telegram_session_{$user->id}");
        }

        return response()->json([
            'success' => true,
            'message' => 'Logout berhasil, session dihapus',
        ]);
    }

    /**
     * Start Userbot Auto Reply Listener
     */
    public function startAutoReply(): JsonResponse
    {
        $user = auth()->user();
        $sessionData = Cache::get("telegram_session_{$user->id}");

        if (!$sessionData || !($sessionData['verified'] ?? false)) {
            return response()->json([
                'success' => false,
                'message' => 'Session tidak valid, silakan login ulang',
            ], 400);
        }

        try {
            $response = Http::withHeaders($this->serviceHeaders())
                ->timeout(10)
                ->post($this->serviceUrl() . '/listener/start', [
                    'session_id' => $sessionData['session_id'],
                ]);

            $result = $response->json();

            if ($result['success'] ?? false) {
                 return response()->json([
                    'success' => true,
                    'message' => 'Auto-reply listener berhasil dijalankan!',
                ]);
            }
             
            return response()->json([
                'success' => false,
                'message' => $result['message'] ?? 'Gagal menjalankan listener',
            ], 400);

        } catch (\Exception $e) {
            Log::error('Telegram start listener error', ['error' => $e->getMessage()]);
            return response()->json([
                'success' => false,
                'message' => 'Gagal menghubungi service: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Stop Userbot Auto Reply Listener
     */
    public function stopAutoReply(): JsonResponse
    {
        $user = auth()->user();
        $sessionData = Cache::get("telegram_session_{$user->id}");

        if ($sessionData) {
            try {
                Http::withHeaders($this->serviceHeaders())
                    ->timeout(10)
                    ->post($this->serviceUrl() . '/listener/stop', [
                        'session_id' => $sessionData['session_id'],
                    ]);
            } catch (\Exception $e) {
                // Ignore errors on stop
            }
        }

        return response()->json([
            'success' => true,
            'message' => 'Auto-reply listener dihentikan',
        ]);
    }

    /**
     * Force delete session (cleanup)
     */
    public function deleteSession(): JsonResponse
    {
        $user = auth()->user();
        $sessionData = Cache::get("telegram_session_{$user->id}");

        if ($sessionData) {
            try {
                Http::withHeaders($this->serviceHeaders())
                    ->timeout(10)
                    ->post($this->serviceUrl() . '/delete-session', [
                        'session_id' => $sessionData['session_id'],
                    ]);
            } catch (\Exception $e) {
                Log::error('Telegram delete session error', ['error' => $e->getMessage()]);
            }

            Cache::forget("telegram_session_{$user->id}");
        }

        return response()->json([
            'success' => true,
            'message' => 'Session dihapus',
        ]);
    }
}
