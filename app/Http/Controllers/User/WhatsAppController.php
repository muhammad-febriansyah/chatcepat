<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Models\WhatsappSession;
use App\Models\WhatsappMessage;
use App\Models\WhatsappContact;
use App\Models\AiAssistantType;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class WhatsAppController extends Controller
{
    /**
     * Display user's WhatsApp sessions
     */
    public function index(): Response
    {
        $user = auth()->user();
        $sessions = WhatsappSession::where('user_id', $user->id)
            ->withCount('messages')
            ->latest()
            ->get();

        // Check session limit
        $canCreateMore = $user->role === 'admin' || $sessions->count() < 1;

        return Inertia::render('user/whatsapp/index', [
            'sessions' => $sessions,
            'canCreateMore' => $canCreateMore,
            'userRole' => $user->role,
            'sessionLimit' => $user->role === 'admin' ? 'unlimited' : 1,
        ]);
    }

    /**
     * Show create form
     */
    public function create(): Response
    {
        $user = auth()->user();

        // Check if user already has a session (unless admin)
        if ($user->role !== 'admin') {
            $existingSessionCount = WhatsappSession::where('user_id', $user->id)->count();

            if ($existingSessionCount >= 1) {
                return redirect()->route('user.whatsapp.index')
                    ->with('error', 'Anda sudah memiliki 1 sesi WhatsApp. User biasa hanya dapat memiliki 1 sesi. Hubungi admin untuk upgrade.');
            }
        }

        // Get AI assistant types from database
        $aiAssistantTypes = AiAssistantType::where('is_active', true)
            ->orderBy('sort_order')
            ->get();

        return Inertia::render('user/whatsapp/create', [
            'aiAssistantTypes' => $aiAssistantTypes,
        ]);
    }

    /**
     * Create a new WhatsApp session
     */
    public function store(Request $request): RedirectResponse
    {
        $user = auth()->user();

        // Check if user already has a session (unless admin)
        if ($user->role !== 'admin') {
            $existingSessionCount = WhatsappSession::where('user_id', $user->id)->count();

            if ($existingSessionCount >= 1) {
                return redirect()->route('user.whatsapp.index')
                    ->with('error', 'Anda sudah memiliki 1 sesi WhatsApp. User biasa hanya dapat memiliki 1 sesi. Hubungi admin untuk upgrade.');
            }
        }

        $validated = $request->validate([
            'phone_number' => 'required|string|max:20',
            'name' => 'required|string|max:255',
            'ai_assistant_type' => 'required|string|exists:ai_assistant_types,code',
        ]);

        // Disconnect any existing sessions that are still in qr_pending or connecting status
        $oldPendingSessions = WhatsappSession::where('user_id', auth()->id())
            ->whereIn('status', ['qr_pending', 'connecting'])
            ->get();

        foreach ($oldPendingSessions as $oldSession) {
            try {
                $gatewayUrl = config('services.whatsapp_gateway.url');
                Http::post($gatewayUrl . '/api/sessions/' . $oldSession->session_id . '/disconnect');
                $oldSession->update(['status' => 'disconnected']);
            } catch (\Exception $e) {
                Log::warning("Failed to disconnect old session {$oldSession->session_id}: " . $e->getMessage());
            }
        }

        // Create session in WhatsApp gateway (gateway will create it in database)
        try {
            $gatewayUrl = config('services.whatsapp_gateway.url');
            $response = Http::post($gatewayUrl . '/api/sessions', [
                'userId' => auth()->id(),
                'name' => $validated['name'],
                'webhookUrl' => null,
            ]);

            if (!$response->successful()) {
                return redirect()->route('user.whatsapp.index')
                    ->withErrors(['error' => 'Gagal membuat session di gateway']);
            }

            // Get session ID from gateway response
            $gatewaySession = $response->json('data');
            $sessionId = $gatewaySession['sessionId'];

            // Wait for gateway to write to database
            sleep(1);

            // Get the session that was created by gateway
            $session = WhatsappSession::where('session_id', $sessionId)->first();

            if (!$session) {
                return redirect()->route('user.whatsapp.index')
                    ->withErrors(['error' => 'Session dibuat di gateway tapi tidak ditemukan di database']);
            }

            // Update phone number and AI assistant type (gateway doesn't know these fields)
            $session->update([
                'phone_number' => $validated['phone_number'],
                'ai_assistant_type' => $validated['ai_assistant_type'],
            ]);

            return redirect()->route('user.whatsapp.show', $session)
                ->with('success', 'Sesi WhatsApp berhasil dibuat. Klik "Hubungkan" untuk mendapatkan QR code.');
        } catch (\Exception $e) {
            return redirect()->route('user.whatsapp.index')
                ->withErrors(['error' => 'Kesalahan koneksi gateway: ' . $e->getMessage()]);
        }
    }

    /**
     * Display a specific WhatsApp session
     */
    public function show(WhatsappSession $session): Response
    {
        // Ensure user owns this session
        if ($session->user_id !== auth()->id()) {
            abort(403, 'Unauthorized access to this session.');
        }

        // Sync session status with gateway before showing
        try {
            $waGatewayUrl = config('services.whatsapp_gateway.url', 'http://localhost:3000');
            // Pass userId to get correct user's sessions, and check specific session
            $response = Http::timeout(3)->get("{$waGatewayUrl}/api/sessions/{$session->session_id}/status");

            if ($response->successful()) {
                $gatewayData = $response->json();
                $isConnected = $gatewayData['data']['isConnected'] ?? false;
                $gatewayStatus = $gatewayData['data']['status'] ?? null;

                // Auto-fix stuck statuses based on actual gateway status
                if ($isConnected && $session->status !== 'connected') {
                    $session->update(['status' => 'connected', 'is_active' => true]);
                    $session->refresh();
                } elseif (!$isConnected && $gatewayStatus === 'disconnected' && $session->status === 'connected') {
                    $session->update(['status' => 'disconnected', 'is_active' => false]);
                    $session->refresh();
                }
            }
        } catch (\Exception $e) {
            // Silently fail - don't break page load
            Log::warning('Failed to sync session status: ' . $e->getMessage());
        }

        $session->load(['messages' => function ($query) {
            $query->latest()->limit(50);
        }]);

        $messageCount = $session->messages()->count();
        $contactCount = $session->contacts()->count();

        return Inertia::render('user/whatsapp/show', [
            'session' => $session,
            'stats' => [
                'messages' => $messageCount,
                'contacts' => $contactCount,
            ],
            'userId' => auth()->id(),
            'gatewayUrl' => config('services.whatsapp_gateway.url', 'http://localhost:3000'),
        ]);
    }

    /**
     * Get messages for a specific session
     */
    public function messages(WhatsappSession $session): Response
    {
        // Ensure user owns this session
        if ($session->user_id !== auth()->id()) {
            abort(403, 'Unauthorized access to this session.');
        }

        $messages = WhatsappMessage::where('whatsapp_session_id', $session->id)
            ->latest()
            ->paginate(50);

        return Inertia::render('user/whatsapp/messages', [
            'session' => $session,
            'messages' => $messages,
        ]);
    }

    /**
     * Get contacts for a specific session
     */
    public function contacts(WhatsappSession $session): Response
    {
        // Ensure user owns this session
        if ($session->user_id !== auth()->id()) {
            abort(403, 'Unauthorized access to this session.');
        }

        $contacts = WhatsappContact::where('whatsapp_session_id', $session->id)
            ->latest()
            ->paginate(50);

        return Inertia::render('user/whatsapp/contacts', [
            'session' => $session,
            'contacts' => $contacts,
        ]);
    }

    /**
     * Connect to WhatsApp (generate QR code)
     */
    public function connect(WhatsappSession $session): RedirectResponse
    {
        // Ensure user owns this session
        if ($session->user_id !== auth()->id()) {
            abort(403, 'Unauthorized access to this session.');
        }

        try {
            $gatewayUrl = config('services.whatsapp_gateway.url');

            // First, try to connect existing session
            $response = Http::timeout(10)->post($gatewayUrl . '/api/sessions/' . $session->session_id . '/connect');

            // If session not found in gateway (404), create it first
            if ($response->status() === 404 || $response->status() === 500) {
                Log::info("Session not found in gateway, creating new session: " . $session->session_id);

                // Create session in gateway
                $createResponse = Http::timeout(10)->post($gatewayUrl . '/api/sessions', [
                    'userId' => auth()->id(),
                    'sessionId' => $session->session_id, // Use existing session_id
                    'name' => $session->name,
                    'webhookUrl' => null,
                ]);

                if (!$createResponse->successful()) {
                    return redirect()->back()
                        ->withErrors(['error' => 'Gagal membuat session di gateway. Error: ' . $createResponse->body()]);
                }

                // Wait a moment for session to initialize
                sleep(2);

                // Try to connect again
                $response = Http::timeout(10)->post($gatewayUrl . '/api/sessions/' . $session->session_id . '/connect');
            }

            if ($response->successful()) {
                // Don't override status here - let Express.js update it via database
                // Express.js will set status to 'qr_pending' when QR is generated
                // Only update qr_expires_at for frontend display
                $session->update([
                    'qr_expires_at' => now()->addMinutes(5),
                ]);

                return redirect()->back()
                    ->with('success', 'Menghubungkan ke WhatsApp... QR code akan muncul sebentar lagi.');
            }

            return redirect()->back()
                ->withErrors(['error' => 'Gagal menghubungkan session. Silakan coba lagi.']);
        } catch (\Exception $e) {
            Log::error("Error connecting session: " . $e->getMessage());
            return redirect()->back()
                ->withErrors(['error' => 'Kesalahan koneksi: ' . $e->getMessage()]);
        }
    }

    /**
     * Disconnect from WhatsApp
     */
    public function disconnect(WhatsappSession $session): RedirectResponse
    {
        // Ensure user owns this session
        if ($session->user_id !== auth()->id()) {
            abort(403, 'Unauthorized access to this session.');
        }

        // Disconnect from WhatsApp gateway (without logout - keep auth files)
        try {
            $gatewayUrl = config('services.whatsapp_gateway.url');
            $response = Http::timeout(10)->post($gatewayUrl . '/api/sessions/' . $session->session_id . '/disconnect', [
                'logout' => false, // Don't logout, just disconnect (can reconnect without QR)
            ]);

            if ($response->successful()) {
                Log::info("Session {$session->session_id} disconnected from gateway");
            } else {
                Log::warning("Failed to disconnect session from gateway: " . $response->body());
            }
        } catch (\Exception $e) {
            Log::error("Error disconnecting session from gateway: " . $e->getMessage());
            // Continue with database update even if gateway call fails
        }

        // Update local database
        $session->update([
            'status' => 'disconnected',
            'is_active' => false,
            'qr_code' => null,
            'qr_expires_at' => null,
        ]);

        return redirect()->back()
            ->with('success', 'Koneksi WhatsApp berhasil diputuskan.');
    }

    /**
     * Delete a WhatsApp session
     */
    public function destroy(WhatsappSession $session): RedirectResponse
    {
        // Ensure user owns this session
        if ($session->user_id !== auth()->id()) {
            abort(403, 'Unauthorized access to this session.');
        }

        // Logout and cleanup session from WhatsApp gateway first
        try {
            $gatewayUrl = config('services.whatsapp_gateway.url');
            // Use DELETE endpoint with logout flag
            $response = Http::timeout(5)->delete($gatewayUrl . '/api/sessions/' . $session->session_id, [
                'logout' => true,
            ]);

            if ($response->successful()) {
                Log::info("Session {$session->session_id} logged out and cleaned from gateway");
            } else {
                Log::warning("Failed to logout session from gateway: " . $response->body());
            }
        } catch (\Exception $e) {
            Log::error("Error logging out session from gateway: " . $e->getMessage());
            // Continue with database deletion even if gateway deletion fails
        }

        // Delete from database (soft delete)
        $session->delete();

        return redirect()->route('user.whatsapp.index')
            ->with('success', 'WhatsApp session deleted successfully.');
    }
}
