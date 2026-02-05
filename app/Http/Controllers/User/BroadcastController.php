<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Models\WhatsappSession;
use App\Models\WhatsappMessage;
use App\Models\WhatsappContact;
use App\Models\ContactGroup;
use App\Traits\LogsActivity;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class BroadcastController extends Controller
{
    use LogsActivity;
    /**
     * Get WhatsApp Gateway URL
     */
    private function gatewayUrl(): string
    {
        return config('services.whatsapp_gateway.url', 'http://localhost:3000');
    }

    /**
     * Display broadcast page
     */
    public function index(): Response
    {
        $user = auth()->user();

        // Get user's WhatsApp sessions (only connected ones)
        $connectedSessions = WhatsappSession::where('user_id', $user->id)
            ->where('status', 'connected')
            ->latest()
            ->get();

        // Get all sessions to show status
        $allSessions = WhatsappSession::where('user_id', $user->id)
            ->latest()
            ->get();

        // Get user's contacts
        $contacts = WhatsappContact::whereHas('session', function ($query) use ($user) {
            $query->where('user_id', $user->id);
        })
            ->orderBy('display_name')
            ->get()
            ->map(function ($contact) {
                return [
                    'id' => $contact->id,
                    'phone_number' => $contact->phone_number,
                    'display_name' => $contact->display_name,
                ];
            });

        // Get user's contact groups
        $contactGroups = ContactGroup::where('user_id', $user->id)
            ->withCount('members')
            ->orderBy('name')
            ->get()
            ->map(function ($group) {
                return [
                    'id' => $group->id,
                    'name' => $group->name,
                    'description' => $group->description,
                    'source' => $group->source,
                    'members_count' => $group->members_count,
                ];
            });

        return Inertia::render('user/broadcast', [
            'sessions' => $connectedSessions,
            'allSessions' => $allSessions, // Include all sessions for status info
            'contacts' => $contacts,
            'contactGroups' => $contactGroups,
        ]);
    }

    /**
     * Send broadcast messages
     */
    public function send(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'session_id' => 'required|exists:whatsapp_sessions,id',
            'message' => 'nullable|string',
            'recipients' => 'required|array|min:1',
            'recipients.*' => 'required|string',
            'file' => 'nullable|file|max:10240', // Max 10MB
            'broadcast_type' => 'required|in:now,scheduled',
            'scheduled_at' => 'nullable|required_if:broadcast_type,scheduled|date|after:now',
            'broadcast_name' => 'nullable|string|max:100',
        ]);

        $user = auth()->user();

        // Get the session and verify ownership
        $session = WhatsappSession::findOrFail($validated['session_id']);

        if ($session->user_id !== $user->id) {
            return redirect()->back()->with('error', 'Anda tidak memiliki akses ke sesi ini.');
        }

        if ($session->status !== 'connected') {
            return redirect()->back()->with('error', 'Sesi WhatsApp tidak terhubung. Silakan hubungkan sesi terlebih dahulu.');
        }

        // Handle file upload if present
        $filePath = null;
        $fileName = null;
        $mediaMetadata = null;

        if ($request->hasFile('file')) {
            $file = $request->file('file');
            $fileName = time() . '_' . $file->getClientOriginalName();
            $filePath = $file->storeAs('broadcasts', $fileName, 'public');

            $mediaMetadata = [
                'file_path' => $filePath,
                'file_name' => $fileName,
                'file_type' => $file->getMimeType(),
                'file_size' => $file->getSize(),
            ];
        }

        // Determine broadcast name
        $broadcastName = $validated['broadcast_name'] ??
            ($validated['broadcast_type'] === 'scheduled'
                ? 'Broadcast Terjadwal - ' . now()->format('d/m/Y H:i')
                : 'Broadcast - ' . now()->format('d/m/Y H:i'));

        // Create broadcast record
        $broadcast = \App\Models\WhatsappBroadcast::create([
            'whatsapp_session_id' => $session->id,
            'user_id' => $user->id,
            'name' => $broadcastName,
            'type' => $filePath ? 'document' : 'text',
            'content' => $validated['message'] ?? '',
            'media_metadata' => $mediaMetadata,
            'recipient_numbers' => $validated['recipients'],
            'total_recipients' => count($validated['recipients']),
            'status' => $validated['broadcast_type'] === 'scheduled' ? 'pending' : 'processing',
            'scheduled_at' => $validated['broadcast_type'] === 'scheduled'
                ? $validated['scheduled_at']
                : null,
        ]);

        // Log activity
        $this->logActivity(
            action: 'create',
            resourceType: 'WhatsappBroadcast',
            resourceId: $broadcast->id,
            resourceName: $broadcastName,
            metadata: [
                'session_id' => $session->id,
                'session_name' => $session->name,
                'total_recipients' => count($validated['recipients']),
                'broadcast_type' => $validated['broadcast_type'],
                'scheduled_at' => $validated['scheduled_at'] ?? null,
            ]
        );

        // If immediate broadcast, dispatch job now
        if ($validated['broadcast_type'] === 'now') {
            \App\Jobs\ProcessWhatsappBroadcast::dispatch($broadcast);

            $message = "Broadcast sedang diproses! Pesan akan dikirim ke " . count($validated['recipients']) . " penerima.";
        } else {
            // Scheduled broadcast
            $scheduledTime = \Carbon\Carbon::parse($validated['scheduled_at'])->format('d/m/Y H:i');
            $message = "Broadcast berhasil dijadwalkan untuk {$scheduledTime}! Pesan akan dikirim ke " . count($validated['recipients']) . " penerima.";
        }

        return redirect()->back()->with('success', $message);
    }

    /**
     * Send a single WhatsApp message
     */
    private function sendMessage(WhatsappSession $session, string $recipient, string $message, ?string $filePath = null)
    {
        // Clean phone number (remove spaces, dashes, etc)
        $cleanNumber = preg_replace('/[^0-9]/', '', $recipient);

        // Ensure number starts with country code (62 for Indonesia)
        if (!str_starts_with($cleanNumber, '62')) {
            if (str_starts_with($cleanNumber, '0')) {
                $cleanNumber = '62' . substr($cleanNumber, 1);
            } else {
                $cleanNumber = '62' . $cleanNumber;
            }
        }

        try {
            if ($filePath) {
                // Send message with media/file
                $fileUrl = asset('storage/' . $filePath);

                $response = Http::timeout(60)->post($this->gatewayUrl() . '/api/send-media', [
                    'sessionId' => $session->session_id,
                    'to' => $cleanNumber,
                    'mediaUrl' => $fileUrl,
                    'caption' => $message ?: '',
                ]);
            } else {
                // Send text-only message
                $response = Http::timeout(60)->post($this->gatewayUrl() . '/api/send-message', [
                    'sessionId' => $session->session_id,
                    'to' => $cleanNumber,
                    'message' => $message,
                ]);
            }

            if (!$response->successful()) {
                $errorBody = $response->body();
                throw new \Exception("API request failed: {$errorBody}");
            }

            $responseData = $response->json();

            // Store message to database (optional)
            WhatsappMessage::create([
                'whatsapp_session_id' => $session->id,
                'message_id' => $responseData['messageId'] ?? uniqid(),
                'from_number' => $session->phone_number,
                'to_number' => $cleanNumber,
                'direction' => 'outgoing',
                'type' => $filePath ? 'document' : 'text',
                'content' => $message,
                'status' => 'sent',
            ]);

            Log::info('Broadcast message sent successfully', [
                'session_id' => $session->id,
                'recipient' => $cleanNumber,
                'has_file' => $filePath !== null,
            ]);

            return $responseData;
        } catch (\Exception $e) {
            Log::error('Failed to send WhatsApp message', [
                'session_id' => $session->id,
                'recipient' => $cleanNumber,
                'error' => $e->getMessage(),
            ]);
            throw $e;
        }
    }
}
