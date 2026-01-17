<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Models\WhatsappSession;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class GroupBroadcastController extends Controller
{
    public function index()
    {
        // Get user's sessions for dropdown
        $sessions = WhatsappSession::where('user_id', auth()->id())
            ->where('status', 'connected')
            ->select('id', 'session_id', 'name', 'status')
            ->get();

        return Inertia::render('user/broadcast/groups', [
            'sessions' => $sessions,
        ]);
    }

    /**
     * Get groups for a session
     */
    public function getGroups(Request $request)
    {
        $request->validate([
            'session_id' => 'required|string',
        ]);

        // Verify session belongs to user
        $session = WhatsappSession::where('user_id', auth()->id())
            ->where('session_id', $request->session_id)
            ->firstOrFail();

        try {
            $waGatewayUrl = config('services.whatsapp_gateway.url', 'http://localhost:3000');

            $response = Http::timeout(30)
                ->get("{$waGatewayUrl}/api/group-broadcast/{$request->session_id}/groups", [
                    'userId' => auth()->id(),
                ]);

            if ($response->successful()) {
                return response()->json($response->json());
            }

            return response()->json([
                'success' => false,
                'error' => 'Failed to get groups',
            ], 500);
        } catch (\Exception $e) {
            Log::error('Error getting groups: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'error' => 'WhatsApp Gateway tidak dapat dihubungi',
            ], 500);
        }
    }

    /**
     * Send broadcast to groups
     */
    public function send(Request $request)
    {
        $request->validate([
            'session_id' => 'required|string',
            'group_jids' => 'required|array|min:1',
            'message_type' => 'required|in:text,image,video,document,audio',
            'message_text' => 'required_if:message_type,text|nullable|string',
            'media_file' => 'required_unless:message_type,text|nullable|file|max:10240', // 10MB max
            'caption' => 'nullable|string',
        ]);

        // Verify session belongs to user
        $session = WhatsappSession::where('user_id', auth()->id())
            ->where('session_id', $request->session_id)
            ->firstOrFail();

        try {
            $waGatewayUrl = config('services.whatsapp_gateway.url', 'http://localhost:3000');

            // Prepare message data
            $messageData = [
                'userId' => auth()->id(),
                'groupJids' => $request->group_jids,
                'message' => [
                    'type' => $request->message_type,
                ],
            ];

            // Handle different message types
            if ($request->message_type === 'text') {
                $messageData['message']['text'] = $request->message_text;
            } else {
                // Upload file and get URL
                if ($request->hasFile('media_file')) {
                    $file = $request->file('media_file');
                    $fileName = time() . '_' . $file->getClientOriginalName();
                    $filePath = $file->storeAs('broadcast', $fileName, 'public');
                    $mediaUrl = Storage::url($filePath);

                    // Convert to absolute URL
                    $mediaUrl = url($mediaUrl);

                    $messageData['message']['mediaPath'] = $mediaUrl;
                    $messageData['message']['fileName'] = $file->getClientOriginalName();

                    if ($request->filled('caption')) {
                        $messageData['message']['caption'] = $request->caption;
                    }
                }
            }

            // Send broadcast request to WhatsApp Gateway
            $response = Http::timeout(300) // 5 minutes timeout
                ->post("{$waGatewayUrl}/api/group-broadcast/{$request->session_id}/send", $messageData);

            if ($response->successful()) {
                return response()->json($response->json());
            }

            return response()->json([
                'success' => false,
                'error' => 'Failed to send broadcast',
            ], $response->status());
        } catch (\Exception $e) {
            Log::error('Error sending group broadcast: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}
