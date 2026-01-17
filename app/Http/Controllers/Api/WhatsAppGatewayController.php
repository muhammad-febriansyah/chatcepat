<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\WhatsappSession;
use App\Models\WhatsappMessage;
use App\Models\WhatsappContact;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class WhatsAppGatewayController extends Controller
{
    /**
     * Verify if a session belongs to a user
     */
    public function verifySession(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'user_id' => 'required|integer',
            'session_id' => 'required|string',
        ]);

        $session = WhatsappSession::where('user_id', $validated['user_id'])
            ->where('session_id', $validated['session_id'])
            ->first();

        return response()->json([
            'valid' => $session !== null,
            'session' => $session,
        ]);
    }

    /**
     * Update session status
     */
    public function updateSessionStatus(Request $request, string $sessionId): JsonResponse
    {
        $validated = $request->validate([
            'status' => 'required|in:qr_pending,connected,disconnected,failed',
            'phone_number' => 'nullable|string',
            'last_connected_at' => 'nullable|date',
            'last_disconnected_at' => 'nullable|date',
        ]);

        $session = WhatsappSession::where('session_id', $sessionId)->firstOrFail();

        $session->update($validated);

        return response()->json([
            'success' => true,
            'session' => $session,
        ]);
    }

    /**
     * Update QR code
     */
    public function updateQRCode(Request $request, string $sessionId): JsonResponse
    {
        $validated = $request->validate([
            'qr_code' => 'required|string',
            'expires_at' => 'required|date',
        ]);

        $session = WhatsappSession::where('session_id', $sessionId)->firstOrFail();

        $session->update([
            'qr_code' => $validated['qr_code'],
            'qr_expires_at' => $validated['expires_at'],
            'status' => 'qr_pending',
        ]);

        return response()->json([
            'success' => true,
            'session' => $session,
        ]);
    }

    /**
     * Store incoming message
     */
    public function storeMessage(Request $request, string $sessionId): JsonResponse
    {
        $session = WhatsappSession::where('session_id', $sessionId)->firstOrFail();

        $validated = $request->validate([
            'message_id' => 'required|string',
            'from_number' => 'required|string',
            'to_number' => 'required|string',
            'direction' => 'required|in:incoming,outgoing',
            'type' => 'required|in:text,image,video,audio,document,sticker,location,contact,other',
            'content' => 'nullable|string',
            'media_metadata' => 'nullable|array',
            'status' => 'required|in:pending,sent,delivered,read,failed',
            'is_auto_reply' => 'boolean',
            'auto_reply_source' => 'nullable|string',
            'context' => 'nullable|array',
            'push_name' => 'nullable|string',
        ]);

        // Extract push_name before creating message (it's not a message field)
        $pushName = $validated['push_name'] ?? null;
        unset($validated['push_name']);

        $message = $session->messages()->create($validated);

        // Update contact with push_name if available
        $contactNumber = $validated['direction'] === 'incoming' ? $validated['from_number'] : $validated['to_number'];
        $contactData = [
            'user_id' => $session->user_id,
            'last_message_at' => now()
        ];

        // Save push_name if provided (from incoming messages)
        if ($pushName) {
            $contactData['push_name'] = $pushName;
        }

        $session->contacts()->updateOrCreate(
            ['phone_number' => $contactNumber],
            $contactData
        );

        return response()->json([
            'success' => true,
            'message' => $message,
        ]);
    }

    /**
     * Sync contacts
     */
    public function syncContacts(Request $request, string $sessionId): JsonResponse
    {
        $session = WhatsappSession::where('session_id', $sessionId)->firstOrFail();

        $validated = $request->validate([
            'contacts' => 'required|array',
            'contacts.*.phone_number' => 'required|string',
            'contacts.*.display_name' => 'nullable|string',
            'contacts.*.push_name' => 'nullable|string',
            'contacts.*.is_business' => 'boolean',
            'contacts.*.is_group' => 'boolean',
            'contacts.*.metadata' => 'nullable|array',
        ]);

        $synced = 0;
        foreach ($validated['contacts'] as $contactData) {
            $contactData['user_id'] = $session->user_id;
            $session->contacts()->updateOrCreate(
                ['phone_number' => $contactData['phone_number']],
                $contactData
            );
            $synced++;
        }

        return response()->json([
            'success' => true,
            'synced' => $synced,
        ]);
    }

    /**
     * Get user by ID
     */
    public function getUser(int $id): JsonResponse
    {
        $user = User::findOrFail($id);

        return response()->json([
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'role' => $user->role,
        ]);
    }

    /**
     * Get session by ID
     */
    public function getSession(string $sessionId): JsonResponse
    {
        $session = WhatsappSession::where('session_id', $sessionId)
            ->with(['user', 'rateLimit'])
            ->firstOrFail();

        return response()->json($session);
    }
}
