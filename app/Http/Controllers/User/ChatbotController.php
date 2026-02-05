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
use Smalot\PdfParser\Parser as PdfParser;

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
            ->select('id', 'session_id', 'name', 'phone_number', 'status', 'ai_assistant_type', 'ai_config', 'settings', 'training_pdf_path', 'training_pdf_name')
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
            'primary_language' => 'nullable|string|in:id,en,both',
            'communication_tone' => 'nullable|string|in:professional,friendly,casual,formal',
            'ai_description' => 'nullable|string|max:5000',
            'products' => 'nullable|array',
            'products.*.name' => 'required|string',
            'products.*.price' => 'required|numeric|min:0',
            'products.*.description' => 'nullable|string',
            'products.*.purchase_link' => 'nullable|string',
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

        // Update ai_config (behaviour & training)
        $aiConfig = $session->ai_config ?? [];
        if (isset($validated['primary_language'])) {
            $aiConfig['primary_language'] = $validated['primary_language'];
        }
        if (isset($validated['communication_tone'])) {
            $aiConfig['communication_tone'] = $validated['communication_tone'];
        }
        $aiConfig['ai_description'] = $validated['ai_description'] ?? '';
        $aiConfig['products'] = $validated['products'] ?? [];
        $session->ai_config = $aiConfig;

        // Build settings object
        $settings = $session->settings ?? [];
        $settings['autoReplyEnabled'] = $validated['auto_reply_enabled'];
        unset($settings['customSystemPrompt']);

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

    /**
     * Upload training PDF document
     */
    public function uploadTrainingPdf(Request $request, WhatsappSession $session): JsonResponse
    {
        // Ensure user owns this session
        if ($session->user_id !== auth()->id()) {
            abort(403, 'Unauthorized');
        }

        $validated = $request->validate([
            'pdf' => 'required|file|mimes:pdf|max:5120', // Max 5MB
        ], [
            'pdf.required' => 'File PDF wajib diupload.',
            'pdf.mimes' => 'File harus berformat PDF.',
            'pdf.max' => 'Ukuran file maksimal 5MB.',
        ]);

        try {
            // Delete old PDF if exists
            if ($session->training_pdf_path) {
                \Storage::delete($session->training_pdf_path);
            }

            // Store new PDF
            $file = $request->file('pdf');
            $originalName = $file->getClientOriginalName();
            $filename = 'session_' . $session->id . '_' . time() . '.pdf';
            $path = $file->storeAs('chatbot-training', $filename);

            // Extract text from PDF
            $extractedText = '';
            $pageCount = 0;

            try {
                $parser = new PdfParser();
                $pdf = $parser->parseFile(\Storage::path($path));
                $extractedText = $pdf->getText();
                $pageCount = count($pdf->getPages());

                // Clean up extracted text
                $extractedText = trim(preg_replace('/\s+/', ' ', $extractedText));

                // Limit text length to prevent database issues (max 50k chars)
                if (strlen($extractedText) > 50000) {
                    $extractedText = substr($extractedText, 0, 50000) . '... (truncated)';
                }
            } catch (\Exception $e) {
                \Log::warning('Failed to extract text from PDF: ' . $e->getMessage());
                $extractedText = '[Text extraction failed - PDF will be used as reference only]';
            }

            // Update ai_config with extracted text
            $aiConfig = $session->ai_config ?? [];
            $aiConfig['training_pdf_content'] = $extractedText;
            $aiConfig['training_pdf_pages'] = $pageCount;

            // Update session
            $session->training_pdf_path = $path;
            $session->training_pdf_name = $originalName;
            $session->ai_config = $aiConfig;
            $session->save();

            return response()->json([
                'success' => true,
                'message' => 'Training PDF berhasil diupload dan diproses',
                'data' => [
                    'pdf_name' => $originalName,
                    'pdf_path' => $path,
                    'pages' => $pageCount,
                    'text_length' => strlen($extractedText),
                ],
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal upload PDF: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Delete training PDF document
     */
    public function deleteTrainingPdf(Request $request, WhatsappSession $session): JsonResponse
    {
        // Ensure user owns this session
        if ($session->user_id !== auth()->id()) {
            abort(403, 'Unauthorized');
        }

        try {
            // Delete PDF file
            if ($session->training_pdf_path) {
                \Storage::delete($session->training_pdf_path);
            }

            // Remove extracted text from ai_config
            $aiConfig = $session->ai_config ?? [];
            unset($aiConfig['training_pdf_content']);
            unset($aiConfig['training_pdf_pages']);

            // Clear database fields
            $session->training_pdf_path = null;
            $session->training_pdf_name = null;
            $session->ai_config = $aiConfig;
            $session->save();

            return response()->json([
                'success' => true,
                'message' => 'Training PDF berhasil dihapus',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal hapus PDF: ' . $e->getMessage(),
            ], 500);
        }
    }
}
