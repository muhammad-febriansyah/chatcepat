<?php

namespace App\Http\Controllers\Agent;

use App\Http\Controllers\Controller;
use App\Models\Conversation;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    /**
     * Display the agent dashboard.
     */
    public function index(): Response
    {
        $agent = Auth::guard('agent')->user();

        // Get assigned WhatsApp sessions
        $assignedSessions = $agent->getAssignedWhatsappSessions();

        // Get basic stats for the agent
        $stats = [
            'total_chats' => Conversation::where('human_agent_id', $agent->id)->count(),
            'active_chats' => Conversation::where('human_agent_id', $agent->id)
                ->where('status', 'open')
                ->count(),
            'pending_chats' => Conversation::where('human_agent_id', $agent->id)
                ->where('status', 'pending')
                ->orWhere(function($query) use ($agent) {
                    $query->where('human_agent_id', $agent->id)
                        ->where('unread_by_agent', true);
                })
                ->count(),
            'resolved_today' => Conversation::where('human_agent_id', $agent->id)
                ->where('status', 'resolved')
                ->whereDate('updated_at', today())
                ->count(),
        ];

        return Inertia::render('agent/dashboard', [
            'agent' => $agent,
            'assignedSessions' => $assignedSessions,
            'stats' => $stats,
        ]);
    }
}
