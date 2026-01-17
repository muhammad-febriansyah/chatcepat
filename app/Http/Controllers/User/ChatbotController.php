<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Models\WhatsappSession;
use App\Models\AiAssistantType;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Http;

class ChatbotController extends Controller
{
    /**
     * Display chatbot configuration page
     */
    public function index(): Response
    {
        $user = auth()->user();

        // Get all user sessions
        $sessions = WhatsappSession::where('user_id', $user->id)
            ->select('id', 'session_id', 'name', 'phone_number', 'status', 'ai_assistant_type', 'settings')
            ->get();

        // Get AI assistant types
        $aiAssistantTypes = AiAssistantType::where('is_active', true)
            ->orderBy('sort_order')
            ->get();

        return Inertia::render('user/chatbot/index', [
            'sessions' => $sessions,
            'aiAssistantTypes' => $aiAssistantTypes,
        ]);
    }

    /**
     * Update chatbot settings for a session
     */
    public function updateSettings(Request $request, WhatsappSession $session): JsonResponse
    {
        // Ensure user owns this session
        if ($session->user_id !== auth()->id()) {
            abort(403, 'Unauthorized');
        }

        $validated = $request->validate([
            'ai_assistant_type' => 'required|string|exists:ai_assistant_types,code',
            'auto_reply_enabled' => 'required|boolean',
            'custom_system_prompt' => 'nullable|string|max:2000',
            'temperature' => 'nullable|numeric|min:0|max:2',
            'max_tokens' => 'nullable|integer|min:50|max:4000',
            'response_delay' => 'nullable|integer|min:0|max:10000',
            'blacklist' => 'nullable|array',
            'blacklist.*' => 'string',
            'whitelist' => 'nullable|array',
            'whitelist.*' => 'string',
        ]);

        // Update AI assistant type
        $session->ai_assistant_type = $validated['ai_assistant_type'];

        // Build settings object
        $settings = $session->settings ?? [];
        $settings['autoReplyEnabled'] = $validated['auto_reply_enabled'];

        if (!empty($validated['custom_system_prompt'])) {
            $settings['customSystemPrompt'] = $validated['custom_system_prompt'];
        } else {
            unset($settings['customSystemPrompt']);
        }

        if (isset($validated['temperature'])) {
            $settings['temperature'] = (float) $validated['temperature'];
        }

        if (isset($validated['max_tokens'])) {
            $settings['maxTokens'] = (int) $validated['max_tokens'];
        }

        if (isset($validated['response_delay'])) {
            $settings['responseDelay'] = (int) $validated['response_delay'];
        }

        if (isset($validated['blacklist'])) {
            $settings['blacklist'] = array_values(array_filter($validated['blacklist']));
        }

        if (isset($validated['whitelist'])) {
            $settings['whitelist'] = array_values(array_filter($validated['whitelist']));
        }

        $session->settings = $settings;
        $session->save();

        return response()->json([
            'success' => true,
            'message' => 'Chatbot settings updated successfully',
            'data' => [
                'session' => $session,
            ],
        ]);
    }

    /**
     * Test chatbot with a sample message
     */
    public function testChatbot(Request $request, WhatsappSession $session): JsonResponse
    {
        // Ensure user owns this session
        if ($session->user_id !== auth()->id()) {
            abort(403, 'Unauthorized');
        }

        $validated = $request->validate([
            'message' => 'required|string|max:1000',
        ]);

        try {
            $gatewayUrl = config('services.whatsapp_gateway.url');

            // Call test endpoint on WhatsApp Gateway
            $response = Http::post($gatewayUrl . '/api/chatbot/test', [
                'sessionId' => $session->session_id,
                'message' => $validated['message'],
                'aiAssistantType' => $session->ai_assistant_type,
                'settings' => $session->settings,
            ]);

            if (!$response->successful()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Failed to test chatbot',
                ], 500);
            }

            $data = $response->json();

            return response()->json([
                'success' => true,
                'data' => [
                    'response' => $data['response'] ?? 'No response',
                ],
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error: ' . $e->getMessage(),
            ], 500);
        }
    }
}
