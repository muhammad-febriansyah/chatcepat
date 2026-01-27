<?php

namespace App\Services\Telegram;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Exception;

class TelegramService
{
    protected string $baseUrl;
    protected string $secretKey;

    public function __construct()
    {
        $this->baseUrl = config('services.telegram_service.url');
        $this->secretKey = config('services.telegram_service.secret_key');
    }

    /**
     * Send OTP code to phone number
     */
    public function sendCode(string $sessionId, string $phone): array
    {
        return $this->makeRequest('POST', '/send-code', [
            'session_id' => $sessionId,
            'phone' => $phone,
        ]);
    }

    /**
     * Verify OTP code
     */
    public function verifyCode(string $sessionId, string $phone, string $code, string $phoneCodeHash, ?string $password = null): array
    {
        return $this->makeRequest('POST', '/verify-code', [
            'session_id' => $sessionId,
            'phone' => $phone,
            'code' => $code,
            'phone_code_hash' => $phoneCodeHash,
            'password' => $password,
        ]);
    }

    /**
     * Check session status
     */
    public function checkSession(string $sessionId): array
    {
        return $this->makeRequest('POST', '/check-session', [
            'session_id' => $sessionId,
        ]);
    }

    /**
     * Create new bot via BotFather
     */
    public function createBot(string $sessionId, string $botName, string $botUsername): array
    {
        return $this->makeRequest('POST', '/create-bot', [
            'session_id' => $sessionId,
            'bot_name' => $botName,
            'bot_username' => $botUsername,
        ]);
    }

    /**
     * Get user's bots list
     */
    public function getMyBots(string $sessionId): array
    {
        return $this->makeRequest('POST', '/get-my-bots', [
            'session_id' => $sessionId,
        ]);
    }

    /**
     * Get bot token from BotFather
     */
    public function getBotToken(string $sessionId, string $botUsername): array
    {
        return $this->makeRequest('POST', '/get-bot-token', [
            'session_id' => $sessionId,
            'bot_username' => $botUsername,
        ]);
    }

    /**
     * Logout and remove session
     */
    public function logout(string $sessionId): array
    {
        return $this->makeRequest('POST', '/logout', [
            'session_id' => $sessionId,
        ]);
    }

    /**
     * Delete session files (cleanup)
     */
    public function deleteSession(string $sessionId): array
    {
        return $this->makeRequest('POST', '/delete-session', [
            'session_id' => $sessionId,
        ]);
    }

    /**
     * Start auto-reply listener for a session
     */
    public function startListener(string $sessionId): array
    {
        return $this->makeRequest('POST', '/listener/start', [
            'session_id' => $sessionId,
        ]);
    }

    /**
     * Stop auto-reply listener for a session
     */
    public function stopListener(string $sessionId): array
    {
        return $this->makeRequest('POST', '/listener/stop', [
            'session_id' => $sessionId,
        ]);
    }

    /**
     * Make HTTP request to Telegram service
     */
    protected function makeRequest(string $method, string $endpoint, array $data = []): array
    {
        try {
            $response = Http::timeout(30)
                ->withHeaders([
                    'X-API-Key' => $this->secretKey,
                    'Content-Type' => 'application/json',
                ])
                ->$method($this->baseUrl . $endpoint, $data);

            if ($response->failed()) {
                Log::error('Telegram service request failed', [
                    'endpoint' => $endpoint,
                    'status' => $response->status(),
                    'body' => $response->body(),
                ]);

                return [
                    'success' => false,
                    'error' => $response->json('detail') ?? 'Request failed',
                    'status_code' => $response->status(),
                ];
            }

            return $response->json();
        } catch (Exception $e) {
            Log::error('Telegram service exception', [
                'endpoint' => $endpoint,
                'error' => $e->getMessage(),
            ]);

            return [
                'success' => false,
                'error' => 'Service unavailable: ' . $e->getMessage(),
            ];
        }
    }
}
