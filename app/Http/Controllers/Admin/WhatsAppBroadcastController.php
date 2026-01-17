<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\WhatsappBroadcast;
use App\Models\WhatsappSession;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Inertia\Inertia;

class WhatsAppBroadcastController extends Controller
{
    private function gatewayUrl(): string
    {
        return config('services.whatsapp_gateway.url', 'http://localhost:3000');
    }

    /**
     * Display a listing of broadcasts
     */
    public function index(Request $request)
    {
        $query = WhatsappBroadcast::query()
            ->where('user_id', auth()->id())
            ->with('session:id,name,session_id');

        // Search
        if ($request->filled('search')) {
            $query->where('name', 'like', "%{$request->search}%");
        }

        // Filter by status
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        // Filter by session
        if ($request->filled('session_id')) {
            $query->where('whatsapp_session_id', $request->session_id);
        }

        $broadcasts = $query->latest()->paginate($request->per_page ?? 15);

        // Get user's sessions for filter
        $sessions = WhatsappSession::where('user_id', auth()->id())
            ->select('id', 'name')
            ->get();

        return Inertia::render('admin/whatsapp/broadcasts/index', [
            'broadcasts' => $broadcasts,
            'sessions' => $sessions,
            'filters' => [
                'search' => $request->search,
                'status' => $request->status,
                'session_id' => $request->session_id,
            ],
        ]);
    }

    /**
     * Show the form for creating a new broadcast
     */
    public function create()
    {
        $sessions = WhatsappSession::where('user_id', auth()->id())
            ->where('status', 'connected')
            ->select('id', 'name', 'phone_number')
            ->get();

        if ($sessions->isEmpty()) {
            return redirect()->route('admin.whatsapp.sessions.index')
                ->withErrors(['error' => 'You need at least one connected WhatsApp session to create a broadcast.']);
        }

        return Inertia::render('admin/whatsapp/broadcasts/create', [
            'sessions' => $sessions,
        ]);
    }

    /**
     * Store a newly created broadcast
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'whatsapp_session_id' => 'required|exists:whatsapp_sessions,id',
            'name' => 'required|string|max:255',
            'template.type' => 'required|in:text,image,document',
            'template.content' => 'required|string',
            'template.mediaUrl' => 'nullable|url',
            'template.variables' => 'nullable|array',
            'recipients' => 'required|array|min:1',
            'recipients.*.phoneNumber' => 'required|string',
            'recipients.*.name' => 'nullable|string',
            'scheduled_at' => 'nullable|date|after:now',
            'batch_size' => 'nullable|integer|min:1|max:100',
            'batch_delay_ms' => 'nullable|integer|min:1000|max:300000',
        ]);

        // Check session ownership
        $session = WhatsappSession::findOrFail($validated['whatsapp_session_id']);
        if ($session->user_id !== auth()->id()) {
            abort(403, 'Unauthorized action.');
        }

        // Create broadcast in Laravel database
        $broadcast = WhatsappBroadcast::create([
            'whatsapp_session_id' => $validated['whatsapp_session_id'],
            'user_id' => auth()->id(),
            'name' => $validated['name'],
            'template' => $validated['template'],
            'status' => $validated['scheduled_at'] ?? null ? 'scheduled' : 'draft',
            'scheduled_at' => $validated['scheduled_at'] ?? null,
            'total_recipients' => count($validated['recipients']),
            'batch_size' => $validated['batch_size'] ?? 20,
            'batch_delay_ms' => $validated['batch_delay_ms'] ?? 60000,
        ]);

        // Create broadcast in Node.js gateway
        try {
            $response = Http::post($this->gatewayUrl() . '/api/broadcasts', [
                'whatsappSessionId' => $session->id,
                'userId' => auth()->id(),
                'name' => $validated['name'],
                'template' => $validated['template'],
                'recipients' => $validated['recipients'],
                'batchSize' => $broadcast->batch_size,
                'batchDelayMs' => $broadcast->batch_delay_ms,
            ]);

            if (!$response->successful()) {
                $broadcast->delete();
                return back()->withErrors(['error' => 'Failed to create broadcast in gateway']);
            }

            // Update with gateway campaign ID if returned
            $gatewayData = $response->json();
            if (isset($gatewayData['id'])) {
                $broadcast->update(['gateway_campaign_id' => $gatewayData['id']]);
            }
        } catch (\Exception $e) {
            $broadcast->delete();
            return back()->withErrors(['error' => 'Gateway connection error: ' . $e->getMessage()]);
        }

        return redirect()->route('admin.whatsapp.broadcasts.show', $broadcast->id)
            ->with('success', 'Broadcast campaign created successfully.');
    }

    /**
     * Display the specified broadcast
     */
    public function show(WhatsappBroadcast $broadcast)
    {
        // Authorization check
        if ($broadcast->user_id !== auth()->id()) {
            abort(403, 'Unauthorized action.');
        }

        $broadcast->load('session:id,name,phone_number');

        return Inertia::render('admin/whatsapp/broadcasts/show', [
            'broadcast' => $broadcast,
        ]);
    }

    /**
     * Show the form for editing the specified broadcast
     */
    public function edit(WhatsappBroadcast $broadcast)
    {
        // Authorization check
        if ($broadcast->user_id !== auth()->id()) {
            abort(403, 'Unauthorized action.');
        }

        // Only allow editing draft or scheduled broadcasts
        if (!in_array($broadcast->status, ['draft', 'scheduled'])) {
            return redirect()->route('admin.whatsapp.broadcasts.show', $broadcast->id)
                ->withErrors(['error' => 'Cannot edit a broadcast that is processing, completed, or failed.']);
        }

        $sessions = WhatsappSession::where('user_id', auth()->id())
            ->where('status', 'connected')
            ->select('id', 'name', 'phone_number')
            ->get();

        return Inertia::render('admin/whatsapp/broadcasts/edit', [
            'broadcast' => $broadcast,
            'sessions' => $sessions,
        ]);
    }

    /**
     * Update the specified broadcast
     */
    public function update(Request $request, WhatsappBroadcast $broadcast)
    {
        // Authorization check
        if ($broadcast->user_id !== auth()->id()) {
            abort(403, 'Unauthorized action.');
        }

        // Only allow editing draft or scheduled broadcasts
        if (!in_array($broadcast->status, ['draft', 'scheduled'])) {
            return back()->withErrors(['error' => 'Cannot edit this broadcast.']);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'template.type' => 'required|in:text,image,document',
            'template.content' => 'required|string',
            'template.mediaUrl' => 'nullable|url',
            'scheduled_at' => 'nullable|date|after:now',
            'batch_size' => 'nullable|integer|min:1|max:100',
            'batch_delay_ms' => 'nullable|integer|min:1000|max:300000',
        ]);

        $broadcast->update($validated);

        return redirect()->route('admin.whatsapp.broadcasts.show', $broadcast->id)
            ->with('success', 'Broadcast updated successfully.');
    }

    /**
     * Remove the specified broadcast
     */
    public function destroy(WhatsappBroadcast $broadcast)
    {
        // Authorization check
        if ($broadcast->user_id !== auth()->id()) {
            abort(403, 'Unauthorized action.');
        }

        // Only allow deleting draft broadcasts
        if ($broadcast->status !== 'draft') {
            return back()->withErrors(['error' => 'Can only delete draft broadcasts. Cancel active broadcasts first.']);
        }

        // Delete from gateway
        try {
            Http::delete($this->gatewayUrl() . '/api/broadcasts/' . $broadcast->id);
        } catch (\Exception $e) {
            \Log::warning('Failed to delete broadcast from gateway: ' . $e->getMessage());
        }

        $broadcast->delete();

        return redirect()->route('admin.whatsapp.broadcasts.index')
            ->with('success', 'Broadcast deleted successfully.');
    }

    /**
     * Execute a broadcast campaign
     */
    public function execute(WhatsappBroadcast $broadcast)
    {
        // Authorization check
        if ($broadcast->user_id !== auth()->id()) {
            abort(403, 'Unauthorized action.');
        }

        // Check if broadcast can be started
        if (!in_array($broadcast->status, ['draft', 'scheduled'])) {
            return back()->withErrors(['error' => 'Broadcast cannot be started. Current status: ' . $broadcast->status]);
        }

        // Check if session is connected
        if ($broadcast->session->status !== 'connected') {
            return back()->withErrors(['error' => 'WhatsApp session is not connected. Please connect the session first.']);
        }

        // Execute via gateway
        try {
            $response = Http::post($this->gatewayUrl() . '/api/broadcasts/' . $broadcast->id . '/execute');

            if ($response->successful()) {
                $broadcast->update([
                    'status' => 'processing',
                    'started_at' => now(),
                ]);

                return back()->with('success', 'Broadcast campaign started! Track progress in real-time.');
            }

            return back()->withErrors(['error' => 'Failed to start broadcast']);
        } catch (\Exception $e) {
            return back()->withErrors(['error' => 'Execution error: ' . $e->getMessage()]);
        }
    }

    /**
     * Cancel a broadcast campaign
     */
    public function cancel(WhatsappBroadcast $broadcast)
    {
        // Authorization check
        if ($broadcast->user_id !== auth()->id()) {
            abort(403, 'Unauthorized action.');
        }

        // Only allow canceling processing or scheduled broadcasts
        if (!in_array($broadcast->status, ['processing', 'scheduled'])) {
            return back()->withErrors(['error' => 'Can only cancel processing or scheduled broadcasts.']);
        }

        // Cancel via gateway
        try {
            $response = Http::post($this->gatewayUrl() . '/api/broadcasts/' . $broadcast->id . '/cancel');

            if ($response->successful()) {
                $broadcast->update([
                    'status' => 'cancelled',
                    'completed_at' => now(),
                ]);

                return back()->with('success', 'Broadcast campaign cancelled.');
            }

            return back()->withErrors(['error' => 'Failed to cancel broadcast']);
        } catch (\Exception $e) {
            return back()->withErrors(['error' => 'Cancel error: ' . $e->getMessage()]);
        }
    }

    /**
     * Get broadcast statistics
     */
    public function statistics()
    {
        $userId = auth()->id();

        $stats = [
            'total_campaigns' => WhatsappBroadcast::where('user_id', $userId)->count(),
            'active_campaigns' => WhatsappBroadcast::where('user_id', $userId)
                ->where('status', 'processing')
                ->count(),
            'completed_campaigns' => WhatsappBroadcast::where('user_id', $userId)
                ->where('status', 'completed')
                ->count(),
            'total_messages_sent' => WhatsappBroadcast::where('user_id', $userId)
                ->sum('sent_count'),
            'success_rate' => 0,
        ];

        $totalAttempted = WhatsappBroadcast::where('user_id', $userId)
            ->sum('sent_count') + WhatsappBroadcast::where('user_id', $userId)->sum('failed_count');

        if ($totalAttempted > 0) {
            $stats['success_rate'] = round(($stats['total_messages_sent'] / $totalAttempted) * 100, 2);
        }

        return response()->json($stats);
    }
}
