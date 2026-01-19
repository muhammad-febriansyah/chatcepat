<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Models\WhatsappSession;
use App\Models\WhatsappMessage;
use App\Models\WhatsappContact;
use App\Models\ContactGroup;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class BroadcastController extends Controller
{
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
        if ($request->hasFile('file')) {
            $file = $request->file('file');
            $fileName = time() . '_' . $file->getClientOriginalName();
            $filePath = $file->storeAs('broadcasts', $fileName, 'public');
        }

        // Send messages to all recipients
        $successCount = 0;
        $failedCount = 0;
        $recipients = $validated['recipients'];

        // Anti-ban configuration
        $batchSize = 20; // Send in batches of 20
        $messageCount = 0;
        $minDelay = 7000000; // 7 seconds (in microseconds)
        $maxDelay = 10000000; // 10 seconds (in microseconds)
        $batchCooldown = 60000000; // 60 seconds cooldown after each batch

        // Calculate estimated time
        $totalRecipients = count($recipients);
        $avgDelay = 8.5; // Average of 7-10 seconds
        $batches = ceil($totalRecipients / $batchSize);
        $estimatedMinutes = (($totalRecipients * $avgDelay) + (($batches - 1) * 60)) / 60;

        Log::info("Starting broadcast to {$totalRecipients} recipients. Estimated time: " . round($estimatedMinutes, 1) . " minutes");

        foreach ($recipients as $index => $recipient) {
            try {
                $this->sendMessage($session, $recipient, $validated['message'] ?? '', $filePath);
                $successCount++;
                $messageCount++;

                // Random delay between messages (7-10 seconds) to appear more human-like
                $randomDelay = rand($minDelay, $maxDelay);
                usleep($randomDelay);

                // Cooldown after batch
                if ($messageCount >= $batchSize && ($index + 1) < count($recipients)) {
                    Log::info("Batch of {$batchSize} messages sent. Cooling down for 60 seconds...");
                    sleep(60); // 60 second cooldown
                    $messageCount = 0; // Reset counter
                }
            } catch (\Exception $e) {
                $failedCount++;
                Log::error('Broadcast send failed for recipient: ' . $recipient, [
                    'error' => $e->getMessage(),
                    'session_id' => $session->id,
                ]);

                // Still delay even on failure to avoid detection
                usleep(rand($minDelay, $maxDelay));
            }
        }

        // Clean up file if it was uploaded
        if ($filePath && Storage::disk('public')->exists($filePath)) {
            Storage::disk('public')->delete($filePath);
        }

        $totalTime = round(($successCount + $failedCount) * 8.5 / 60, 1);
        $message = "Broadcast selesai! Terkirim: {$successCount}, Gagal: {$failedCount}. Waktu: {$totalTime} menit";

        Log::info("Broadcast completed. Success: {$successCount}, Failed: {$failedCount}");

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
