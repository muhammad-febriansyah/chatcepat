<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Models\WhatsappSession;
use App\Models\WhatsappMessage;
use App\Models\WhatsappContact;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Support\Facades\Http;
use Illuminate\Http\JsonResponse;

class ReplyManualController extends Controller
{
    /**
     * Display manual reply page
     */
    public function index(): Response
    {
        $user = auth()->user();

        // Get connected sessions
        $connectedSessions = WhatsappSession::where('user_id', $user->id)
            ->where('status', 'connected')
            ->select('id', 'session_id', 'name', 'phone_number', 'status')
            ->get();

        // Get all sessions to show status info
        $allSessions = WhatsappSession::where('user_id', $user->id)
            ->select('id', 'session_id', 'name', 'phone_number', 'status')
            ->get();

        return Inertia::render('user/reply-manual/index', [
            'sessions' => $connectedSessions,
            'allSessions' => $allSessions, // Include all sessions for status info
        ]);
    }

    /**
     * Get incoming messages for a session
     */
    public function getMessages(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'session_id' => 'required|exists:whatsapp_sessions,id',
            'contact_number' => 'nullable|string',
        ]);

        $session = WhatsappSession::findOrFail($validated['session_id']);

        // Ensure user owns this session
        if ($session->user_id !== auth()->id()) {
            abort(403, 'Unauthorized');
        }

        // Get messages
        $query = WhatsappMessage::where('whatsapp_session_id', $session->id)
            ->with([])
            ->orderBy('created_at', 'desc');

        // Filter by contact if specified
        if (!empty($validated['contact_number'])) {
            $query->where('from_number', $validated['contact_number']);
        }

        $messages = $query->limit(100)->get();

        // Get all contact numbers from messages
        $contactNumbers = $messages->map(function ($message) {
            return $message->direction === 'incoming'
                ? $message->from_number
                : $message->to_number;
        })->unique()->values()->toArray();

        // Look up contact names from whatsapp_contacts table
        $contacts = WhatsappContact::where('user_id', auth()->id())
            ->whereIn('phone_number', $contactNumbers)
            ->get()
            ->keyBy('phone_number');

        // Group messages by contact
        $conversations = [];
        foreach ($messages as $message) {
            $contactNumber = $message->direction === 'incoming'
                ? $message->from_number
                : $message->to_number;

            if (!isset($conversations[$contactNumber])) {
                // Get contact name from database
                $contact = $contacts->get($contactNumber);
                $contactName = null;
                if ($contact) {
                    $contactName = $contact->display_name ?: $contact->push_name;
                }

                $conversations[$contactNumber] = [
                    'contact_number' => $contactNumber,
                    'contact_name' => $contactName,
                    'last_message' => null,
                    'unread_count' => 0,
                    'messages' => [],
                ];
            }

            $conversations[$contactNumber]['messages'][] = $message;

            // Set last message (first in desc order)
            if (!$conversations[$contactNumber]['last_message']) {
                $conversations[$contactNumber]['last_message'] = $message;
            }

            // Count unread (incoming messages that haven't been replied to)
            if ($message->direction === 'incoming' && !$message->read_at) {
                $conversations[$contactNumber]['unread_count']++;
            }
        }

        return response()->json([
            'success' => true,
            'data' => [
                'conversations' => array_values($conversations),
            ],
        ]);
    }

    /**
     * Send manual reply
     */
    public function send(Request $request): JsonResponse
    {
        // Increase execution time for message sending (2 minutes)
        set_time_limit(120);

        $validated = $request->validate([
            'session_id' => 'required|exists:whatsapp_sessions,id',
            'to_number' => 'required|string',
            'message' => 'required|string|max:5000',
        ]);

        $session = WhatsappSession::findOrFail($validated['session_id']);

        // Ensure user owns this session
        if ($session->user_id !== auth()->id()) {
            abort(403, 'Unauthorized');
        }

        // Ensure session is connected
        if ($session->status !== 'connected') {
            return response()->json([
                'success' => false,
                'message' => 'Session is not connected',
            ], 400);
        }

        try {
            $gatewayUrl = config('services.whatsapp_gateway.url');

            // Clean phone number (remove spaces, dashes, etc)
            $cleanNumber = preg_replace('/[^0-9]/', '', $validated['to_number']);

            // Ensure number starts with country code (62 for Indonesia)
            if (!str_starts_with($cleanNumber, '62')) {
                if (str_starts_with($cleanNumber, '0')) {
                    $cleanNumber = '62' . substr($cleanNumber, 1);
                } else {
                    $cleanNumber = '62' . $cleanNumber;
                }
            }

            // Send message via WhatsApp Gateway
            $response = Http::timeout(60)->post($gatewayUrl . '/api/send-message', [
                'sessionId' => $session->session_id,
                'to' => $cleanNumber,
                'message' => $validated['message'],
            ]);

            if (!$response->successful()) {
                $errorBody = $response->body();
                return response()->json([
                    'success' => false,
                    'message' => 'Failed to send message: ' . $errorBody,
                ], 500);
            }

            $responseData = $response->json();

            // Store message in database
            $message = WhatsappMessage::create([
                'whatsapp_session_id' => $session->id,
                'message_id' => $responseData['messageId'] ?? ('manual-' . time() . '-' . rand(1000, 9999)),
                'from_number' => $session->phone_number,
                'to_number' => $cleanNumber,
                'direction' => 'outgoing',
                'type' => 'text',
                'content' => $validated['message'],
                'status' => 'sent',
                'is_auto_reply' => false,
                'sent_at' => now(),
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Message sent successfully',
                'data' => [
                    'message' => $message,
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
     * Get contacts from database
     */
    public function getContacts(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'session_id' => 'required|exists:whatsapp_sessions,id',
            'search' => 'nullable|string|max:100',
        ]);

        $session = WhatsappSession::findOrFail($validated['session_id']);

        // Ensure user owns this session
        if ($session->user_id !== auth()->id()) {
            abort(403, 'Unauthorized');
        }

        $query = WhatsappContact::where('user_id', auth()->id())
            ->where('whatsapp_session_id', $session->id)
            ->where('is_group', false);

        // Search by name or phone number
        if (!empty($validated['search'])) {
            $search = $validated['search'];
            $query->where(function ($q) use ($search) {
                $q->where('phone_number', 'like', "%{$search}%")
                    ->orWhere('display_name', 'like', "%{$search}%")
                    ->orWhere('push_name', 'like', "%{$search}%");
            });
        }

        $contacts = $query->orderBy('last_message_at', 'desc')
            ->limit(50)
            ->get()
            ->map(function ($contact) {
                return [
                    'id' => $contact->id,
                    'phone_number' => $contact->phone_number,
                    'display_name' => $contact->display_name,
                    'push_name' => $contact->push_name,
                    'name' => $contact->display_name ?: $contact->push_name ?: $contact->phone_number,
                    'last_message_at' => $contact->last_message_at,
                ];
            });

        return response()->json([
            'success' => true,
            'data' => [
                'contacts' => $contacts,
            ],
        ]);
    }

    /**
     * Send media/file message
     */
    public function sendMedia(Request $request): JsonResponse
    {
        // Increase execution time for media upload (3 minutes)
        set_time_limit(180);

        \Log::info('sendMedia started', [
            'has_file' => $request->hasFile('file'),
            'session_id' => $request->input('session_id'),
            'to_number' => $request->input('to_number'),
        ]);

        try {
            $validated = $request->validate([
                'session_id' => 'required|exists:whatsapp_sessions,id',
                'to_number' => 'required|string',
                'caption' => 'nullable|string|max:1000',
                'file' => 'required|file|max:16384', // 16MB max
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error: ' . json_encode($e->errors()),
            ], 422);
        }

        $session = WhatsappSession::findOrFail($validated['session_id']);

        // Ensure user owns this session
        if ($session->user_id !== auth()->id()) {
            abort(403, 'Unauthorized');
        }

        // Ensure session is connected
        if ($session->status !== 'connected') {
            return response()->json([
                'success' => false,
                'message' => 'Session is not connected',
            ], 400);
        }

        try {
            \Log::info('sendMedia: storing file...');

            // Store file
            $file = $request->file('file');
            $path = $file->store('whatsapp-media', 'public');

            // Use file:// protocol for local development (avoids deadlock with artisan serve)
            // In production with proper web server (nginx/apache), use asset() instead
            $absolutePath = storage_path('app/public/' . $path);
            $fileUrl = 'file://' . $absolutePath;

            \Log::info('sendMedia: file stored', ['url' => $fileUrl, 'path' => $absolutePath]);

            // Determine media type
            $mimeType = $file->getMimeType();
            $type = 'document';
            if (str_starts_with($mimeType, 'image/')) {
                $type = 'image';
            } elseif (str_starts_with($mimeType, 'video/')) {
                $type = 'video';
            } elseif (str_starts_with($mimeType, 'audio/')) {
                $type = 'audio';
            }

            $gatewayUrl = config('services.whatsapp_gateway.url');

            // Clean phone number
            $cleanNumber = preg_replace('/[^0-9]/', '', $validated['to_number']);
            if (!str_starts_with($cleanNumber, '62')) {
                if (str_starts_with($cleanNumber, '0')) {
                    $cleanNumber = '62' . substr($cleanNumber, 1);
                } else {
                    $cleanNumber = '62' . $cleanNumber;
                }
            }

            \Log::info('sendMedia: calling gateway...', ['to' => $cleanNumber, 'url' => $fileUrl]);

            // Send media via WhatsApp Gateway
            $response = Http::timeout(120)->post($gatewayUrl . '/api/send-media', [
                'sessionId' => $session->session_id,
                'to' => $cleanNumber,
                'mediaUrl' => $fileUrl,
                'caption' => $validated['caption'] ?? '',
                'mimetype' => $mimeType,
                'filename' => $file->getClientOriginalName(),
            ]);

            \Log::info('sendMedia: gateway responded', ['success' => $response->successful()]);

            if (!$response->successful()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Failed to send media: ' . $response->body(),
                ], 500);
            }

            $responseData = $response->json();

            // Store message in database (use web URL for display, not file://)
            $webUrl = asset('storage/' . $path);
            $message = WhatsappMessage::create([
                'whatsapp_session_id' => $session->id,
                'message_id' => $responseData['messageId'] ?? ('manual-media-' . time() . '-' . rand(1000, 9999)),
                'from_number' => $session->phone_number,
                'to_number' => $cleanNumber,
                'direction' => 'outgoing',
                'type' => $type,
                'content' => $validated['caption'] ?? $file->getClientOriginalName(),
                'media_metadata' => [
                    'url' => $webUrl,
                    'mimetype' => $mimeType,
                    'filename' => $file->getClientOriginalName(),
                    'filesize' => $file->getSize(),
                ],
                'status' => 'sent',
                'is_auto_reply' => false,
                'sent_at' => now(),
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Media sent successfully',
                'data' => [
                    'message' => $message,
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
     * Update contact display name
     */
    public function updateContactName(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'session_id' => 'required|exists:whatsapp_sessions,id',
            'phone_number' => 'required|string',
            'display_name' => 'required|string|max:100',
        ]);

        $session = WhatsappSession::findOrFail($validated['session_id']);

        // Ensure user owns this session
        if ($session->user_id !== auth()->id()) {
            abort(403, 'Unauthorized');
        }

        // Update or create contact with display name
        $contact = WhatsappContact::updateOrCreate(
            [
                'user_id' => auth()->id(),
                'whatsapp_session_id' => $session->id,
                'phone_number' => $validated['phone_number'],
            ],
            [
                'display_name' => $validated['display_name'],
            ]
        );

        return response()->json([
            'success' => true,
            'message' => 'Contact name updated',
            'data' => [
                'contact' => $contact,
            ],
        ]);
    }
}
