<?php

namespace App\Services;

use OpenAI;
use App\Models\AiAssistantType;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

class OpenAIService
{
    private $client;
    private const MAX_HISTORY = 10;
    private const CACHE_TTL = 3600; // 1 hour

    public function __construct()
    {
        $this->client = OpenAI::client(config('services.openai.api_key'));
    }

    /**
     * Generate AI response
     */
    public function generateResponse(
        string $sessionKey,
        string $message,
        string $assistantType = 'general',
        array $config = []
    ): string {
        try {
            // Get conversation history
            $history = $this->getConversationHistory($sessionKey);

            // Add user message to history
            $history[] = ['role' => 'user', 'content' => $message];

            // Get system prompt based on assistant type
            $systemPrompt = $config['system_prompt'] ?? $this->getSystemPrompt($assistantType);

            // Build messages array
            $messages = array_merge(
                [['role' => 'system', 'content' => $systemPrompt]],
                $history
            );

            // Call OpenAI API
            $response = $this->client->chat()->create([
                'model' => $config['model'] ?? config('services.openai.model', 'gpt-4o-mini'),
                'messages' => $messages,
                'temperature' => $config['temperature'] ?? config('services.openai.temperature', 0.7),
                'max_tokens' => $config['max_tokens'] ?? config('services.openai.max_tokens', 500),
            ]);

            $reply = $response->choices[0]->message->content ?? 'Maaf, saya tidak dapat memproses pesan Anda.';

            // Add assistant reply to history
            $history[] = ['role' => 'assistant', 'content' => $reply];

            // Save conversation history
            $this->saveConversationHistory($sessionKey, $history);

            return $reply;

        } catch (\Exception $e) {
            Log::error('OpenAI error', ['error' => $e->getMessage()]);

            if (str_contains($e->getMessage(), 'insufficient_quota')) {
                return 'Maaf, layanan AI sedang tidak tersedia. Silakan coba lagi nanti.';
            }

            return 'Maaf, terjadi kesalahan saat memproses pesan Anda.';
        }
    }

    /**
     * Get conversation history from cache
     */
    private function getConversationHistory(string $sessionKey): array
    {
        $history = Cache::get("openai_history_{$sessionKey}", []);

        // Limit history to MAX_HISTORY messages
        if (count($history) > self::MAX_HISTORY * 2) {
            $history = array_slice($history, -self::MAX_HISTORY * 2);
        }

        return $history;
    }

    /**
     * Save conversation history to cache
     */
    private function saveConversationHistory(string $sessionKey, array $history): void
    {
        // Limit history
        if (count($history) > self::MAX_HISTORY * 2) {
            $history = array_slice($history, -self::MAX_HISTORY * 2);
        }

        Cache::put("openai_history_{$sessionKey}", $history, self::CACHE_TTL);
    }

    /**
     * Clear conversation history
     */
    public function clearHistory(string $sessionKey): void
    {
        Cache::forget("openai_history_{$sessionKey}");
    }

    /**
     * Get system prompt based on assistant type
     */
    private function getSystemPrompt(string $type): string
    {
        // Try to load from database first (cached for 1 hour)
        $cacheKey = "ai_assistant_prompt_{$type}";

        return Cache::remember($cacheKey, 3600, function () use ($type) {
            $assistantType = AiAssistantType::where('code', $type)
                ->where('is_active', true)
                ->first();

            if ($assistantType && $assistantType->system_prompt) {
                return $assistantType->system_prompt;
            }

            // Fallback to default prompts
            $defaultPrompts = [
                'sales' => "Kamu adalah asisten penjualan yang ramah dan persuasif. Gunakan bahasa Indonesia yang sopan dan friendly.",
                'customer_service' => "Kamu adalah customer service yang profesional dan empatik. Gunakan bahasa Indonesia yang sopan.",
                'technical_support' => "Kamu adalah technical support yang ahli. Gunakan bahasa Indonesia.",
                'general' => "Kamu adalah asisten virtual yang helpful dan friendly. Gunakan bahasa Indonesia yang natural.",
            ];

            return $defaultPrompts[$type] ?? $defaultPrompts['general'];
        });
    }

    /**
     * Get available assistant types from database
     */
    public static function getAssistantTypes(): array
    {
        return Cache::remember('ai_assistant_types', 3600, function () {
            return AiAssistantType::where('is_active', true)
                ->orderBy('sort_order')
                ->pluck('name', 'code')
                ->toArray();
        });
    }

    /**
     * Get all assistant types with full details
     */
    public static function getAssistantTypesWithDetails(): array
    {
        return Cache::remember('ai_assistant_types_details', 3600, function () {
            return AiAssistantType::where('is_active', true)
                ->orderBy('sort_order')
                ->get()
                ->toArray();
        });
    }

    /**
     * Clear assistant types cache
     */
    public static function clearCache(): void
    {
        Cache::forget('ai_assistant_types');
        Cache::forget('ai_assistant_types_details');

        // Clear individual prompt caches
        $types = AiAssistantType::pluck('code');
        foreach ($types as $code) {
            Cache::forget("ai_assistant_prompt_{$code}");
        }
    }
}
