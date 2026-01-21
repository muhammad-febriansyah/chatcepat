<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Models\HumanAgent;
use App\Models\WhatsappSession;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\RedirectResponse;

class HumanAgentController extends Controller
{
    /**
     * Display a listing of human agents
     */
    public function index(): Response
    {
        $user = auth()->user();

        $agents = HumanAgent::where('user_id', $user->id)
            ->with(['whatsappSession'])
            ->latest()
            ->get()
            ->map(function ($agent) {
                return [
                    'id' => $agent->id,
                    'full_name' => $agent->full_name,
                    'email' => $agent->email,
                    'phone_number' => $agent->phone_number,
                    'role' => $agent->role,
                    'shift' => $agent->shift,
                    'shift_start' => $agent->shift_start ? $agent->shift_start->format('H:i') : null,
                    'shift_end' => $agent->shift_end ? $agent->shift_end->format('H:i') : null,
                    'is_active' => $agent->is_active,
                    'is_online' => $agent->is_online,
                    'is_working' => $agent->isWorking(),
                    'last_active_at' => $agent->last_active_at?->diffForHumans(),
                    'whatsapp_session' => $agent->whatsappSession ? [
                        'id' => $agent->whatsappSession->id,
                        'name' => $agent->whatsappSession->name,
                        'phone_number' => $agent->whatsappSession->phone_number,
                    ] : null,
                    'assigned_sessions_count' => $agent->assigned_sessions ? count($agent->assigned_sessions) : 0,
                    'created_at' => $agent->created_at->format('d M Y'),
                ];
            });

        // Get all WhatsApp sessions for dropdown
        $whatsappSessions = WhatsappSession::where('user_id', $user->id)
            ->where('status', 'connected')
            ->select('id', 'name', 'phone_number')
            ->get();

        return Inertia::render('user/human-agents/index', [
            'agents' => $agents,
            'whatsappSessions' => $whatsappSessions,
        ]);
    }

    /**
     * Store a newly created agent
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'full_name' => 'required|string|max:255',
            'email' => 'required|email|unique:human_agents,email',
            'phone_number' => 'nullable|string|max:20',
            'password' => 'required|string|min:6|confirmed',
            'role' => 'required|in:admin,supervisor,agent',
            'shift' => 'required|in:morning,afternoon,night,full_time',
            'shift_start' => 'nullable|date_format:H:i',
            'shift_end' => 'nullable|date_format:H:i',
            'whatsapp_session_id' => 'nullable|exists:whatsapp_sessions,id',
            'assigned_sessions' => 'nullable|array',
            'assigned_sessions.*' => 'exists:whatsapp_sessions,id',
        ]);

        $user = auth()->user();

        HumanAgent::create([
            'user_id' => $user->id,
            'full_name' => $validated['full_name'],
            'email' => $validated['email'],
            'phone_number' => $validated['phone_number'] ?? null,
            'password' => $validated['password'],
            'role' => $validated['role'],
            'shift' => $validated['shift'],
            'shift_start' => $validated['shift_start'] ?? null,
            'shift_end' => $validated['shift_end'] ?? null,
            'whatsapp_session_id' => $validated['whatsapp_session_id'] ?? null,
            'assigned_sessions' => $validated['assigned_sessions'] ?? null,
            'is_active' => true,
        ]);

        return redirect()->route('user.human-agents.index')
            ->with('success', 'Human agent berhasil dibuat');
    }

    /**
     * Update the specified agent
     */
    public function update(Request $request, HumanAgent $humanAgent): RedirectResponse
    {
        // Ensure user owns this agent
        if ($humanAgent->user_id !== auth()->id()) {
            abort(403, 'Unauthorized');
        }

        $validated = $request->validate([
            'full_name' => 'required|string|max:255',
            'email' => 'required|email|unique:human_agents,email,' . $humanAgent->id,
            'phone_number' => 'nullable|string|max:20',
            'password' => 'nullable|string|min:6|confirmed',
            'role' => 'required|in:admin,supervisor,agent',
            'shift' => 'required|in:morning,afternoon,night,full_time',
            'shift_start' => 'nullable|date_format:H:i',
            'shift_end' => 'nullable|date_format:H:i',
            'whatsapp_session_id' => 'nullable|exists:whatsapp_sessions,id',
            'assigned_sessions' => 'nullable|array',
            'assigned_sessions.*' => 'exists:whatsapp_sessions,id',
            'is_active' => 'boolean',
        ]);

        $updateData = [
            'full_name' => $validated['full_name'],
            'email' => $validated['email'],
            'phone_number' => $validated['phone_number'] ?? null,
            'role' => $validated['role'],
            'shift' => $validated['shift'],
            'shift_start' => $validated['shift_start'] ?? null,
            'shift_end' => $validated['shift_end'] ?? null,
            'whatsapp_session_id' => $validated['whatsapp_session_id'] ?? null,
            'assigned_sessions' => $validated['assigned_sessions'] ?? null,
            'is_active' => $validated['is_active'] ?? true,
        ];

        // Only update password if provided
        if (!empty($validated['password'])) {
            $updateData['password'] = $validated['password'];
        }

        $humanAgent->update($updateData);

        return redirect()->route('user.human-agents.index')
            ->with('success', 'Human agent berhasil diupdate');
    }

    /**
     * Remove the specified agent
     */
    public function destroy(HumanAgent $humanAgent): RedirectResponse
    {
        // Ensure user owns this agent
        if ($humanAgent->user_id !== auth()->id()) {
            abort(403, 'Unauthorized');
        }

        $humanAgent->delete();

        return redirect()->route('user.human-agents.index')
            ->with('success', 'Human agent berhasil dihapus');
    }

    /**
     * Toggle agent active status
     */
    public function toggleStatus(HumanAgent $humanAgent): RedirectResponse
    {
        // Ensure user owns this agent
        if ($humanAgent->user_id !== auth()->id()) {
            abort(403, 'Unauthorized');
        }

        $humanAgent->update([
            'is_active' => !$humanAgent->is_active,
        ]);

        $status = $humanAgent->is_active ? 'diaktifkan' : 'dinonaktifkan';

        return redirect()->route('user.human-agents.index')
            ->with('success', "Human agent berhasil {$status}");
    }
}
