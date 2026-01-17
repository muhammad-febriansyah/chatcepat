<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\WhatsappSession;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Inertia\Inertia;

class WhatsAppSessionController extends Controller
{
    /**
     * Gateway URL dari environment
     */
    private function gatewayUrl(): string
    {
        return config('services.whatsapp_gateway.url', 'http://localhost:3000');
    }

    /**
     * Display a listing of sessions
     */
    public function index(Request $request)
    {
        $query = WhatsappSession::query()->where('user_id', auth()->id());

        // Search
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('session_id', 'like', "%{$search}%")
                  ->orWhere('phone_number', 'like', "%{$search}%");
            });
        }

        // Filter by status
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        $sessions = $query->latest()->paginate($request->per_page ?? 15);

        return Inertia::render('admin/whatsapp/sessions/index', [
            'sessions' => $sessions,
            'filters' => [
                'search' => $request->search,
                'status' => $request->status,
            ],
        ]);
    }

    /**
     * Show the form for creating a new session
     */
    public function create()
    {
        return Inertia::render('admin/whatsapp/sessions/create');
    }

    /**
     * Store a newly created session
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'webhook_url' => 'nullable|url',
            'settings' => 'nullable|array',
        ]);

        // Disconnect any existing sessions that are still in qr_pending or connecting status
        // This prevents old sessions from interfering with the new one
        $oldPendingSessions = WhatsappSession::where('user_id', auth()->id())
            ->whereIn('status', ['qr_pending', 'connecting'])
            ->get();

        foreach ($oldPendingSessions as $oldSession) {
            try {
                // Disconnect from gateway
                Http::post($this->gatewayUrl() . '/api/sessions/' . $oldSession->session_id . '/disconnect');

                // Update status in database
                $oldSession->update(['status' => 'disconnected']);

                \Log::info("Disconnected old pending session: {$oldSession->session_id}");
            } catch (\Exception $e) {
                \Log::warning("Failed to disconnect old session {$oldSession->session_id}: " . $e->getMessage());
            }
        }

        // Create session in Node.js gateway first
        // Note: Gateway will also create the session in database
        try {
            $response = Http::post($this->gatewayUrl() . '/api/sessions', [
                'userId' => auth()->id(),
                'name' => $validated['name'],
                'webhookUrl' => $validated['webhook_url'] ?? null,
            ]);

            if (!$response->successful()) {
                return back()->withErrors(['error' => 'Gagal membuat session di gateway']);
            }

            // Get session ID from gateway response
            $gatewaySession = $response->json('data');
            $sessionId = $gatewaySession['sessionId'];

            // Wait a moment for gateway to write to database
            sleep(1);

            // Get the session that was created by gateway
            $session = WhatsappSession::where('session_id', $sessionId)->first();

            if (!$session) {
                return back()->withErrors(['error' => 'Session dibuat di gateway tapi tidak ditemukan di database']);
            }
        } catch (\Exception $e) {
            return back()->withErrors(['error' => 'Kesalahan koneksi gateway: ' . $e->getMessage()]);
        }

        return redirect()->route('admin.whatsapp.sessions.show', $session->id)
            ->with('success', 'Session berhasil dibuat. Scan QR code untuk menghubungkan.');
    }

    /**
     * Display the specified session
     */
    public function show(WhatsappSession $session)
    {
        // Authorization check
        if ($session->user_id !== auth()->id()) {
            abort(403, 'Unauthorized action.');
        }

        $session->load(['messages' => function ($query) {
            $query->latest()->limit(10);
        }]);

        // Include QR code in response
        return Inertia::render('admin/whatsapp/sessions/show', [
            'session' => $session->makeVisible(['qr_code']), // Make sure qr_code is visible
            'recentMessages' => $session->messages,
        ]);
    }

    /**
     * Show the form for editing the specified session
     */
    public function edit(WhatsappSession $session)
    {
        // Authorization check
        if ($session->user_id !== auth()->id()) {
            abort(403, 'Unauthorized action.');
        }

        return Inertia::render('admin/whatsapp/sessions/edit', [
            'session' => $session,
        ]);
    }

    /**
     * Update the specified session
     */
    public function update(Request $request, WhatsappSession $session)
    {
        // Authorization check
        if ($session->user_id !== auth()->id()) {
            abort(403, 'Unauthorized action.');
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'webhook_url' => 'nullable|url',
            'settings' => 'nullable|array',
        ]);

        $session->update($validated);

        return redirect()->route('admin.whatsapp.sessions.show', $session->id)
            ->with('success', 'Session berhasil diperbarui.');
    }

    /**
     * Remove the specified session
     */
    public function destroy(WhatsappSession $session)
    {
        // Authorization check
        if ($session->user_id !== auth()->id()) {
            abort(403, 'Unauthorized action.');
        }

        // Delete from gateway first
        try {
            Http::delete($this->gatewayUrl() . '/api/sessions/' . $session->session_id);
        } catch (\Exception $e) {
            // Log but don't fail - allow database deletion even if gateway fails
            \Log::warning('Failed to delete session from gateway: ' . $e->getMessage());
        }

        $session->delete();

        return redirect()->route('admin.whatsapp.sessions.index')
            ->with('success', 'Session berhasil dihapus.');
    }

    /**
     * Connect/reconnect a session
     */
    public function connect(WhatsappSession $session)
    {
        // Authorization check
        if ($session->user_id !== auth()->id()) {
            abort(403, 'Aksi tidak diizinkan.');
        }

        try {
            $response = Http::post($this->gatewayUrl() . '/api/sessions/' . $session->session_id . '/connect');

            if ($response->successful()) {
                $session->update(['status' => 'connecting']);
                return back()->with('success', 'Menghubungkan ke WhatsApp... QR code akan muncul sebentar lagi.');
            }

            return back()->withErrors(['error' => 'Gagal menghubungkan session']);
        } catch (\Exception $e) {
            return back()->withErrors(['error' => 'Kesalahan koneksi: ' . $e->getMessage()]);
        }
    }

    /**
     * Disconnect a session
     */
    public function disconnect(WhatsappSession $session)
    {
        // Authorization check
        if ($session->user_id !== auth()->id()) {
            abort(403, 'Aksi tidak diizinkan.');
        }

        try {
            $response = Http::post($this->gatewayUrl() . '/api/sessions/' . $session->session_id . '/disconnect');

            if ($response->successful()) {
                $session->update(['status' => 'disconnected']);
                return back()->with('success', 'Session berhasil diputuskan.');
            }

            return back()->withErrors(['error' => 'Gagal memutuskan session']);
        } catch (\Exception $e) {
            return back()->withErrors(['error' => 'Kesalahan: ' . $e->getMessage()]);
        }
    }

    /**
     * Cleanup session files (force delete old files to generate fresh QR)
     */
    public function cleanup(WhatsappSession $session)
    {
        // Authorization check
        if ($session->user_id !== auth()->id()) {
            abort(403, 'Aksi tidak diizinkan.');
        }

        try {
            $response = Http::post($this->gatewayUrl() . '/api/sessions/' . $session->session_id . '/cleanup');

            if ($response->successful()) {
                return back()->with('success', 'Session files cleaned up.');
            }

            return back()->withErrors(['error' => 'Gagal cleanup session']);
        } catch (\Exception $e) {
            return back()->withErrors(['error' => 'Kesalahan: ' . $e->getMessage()]);
        }
    }
}
