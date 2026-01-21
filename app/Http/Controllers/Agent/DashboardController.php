<?php

namespace App\Http\Controllers\Agent;

use App\Http\Controllers\Controller;
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
            'total_chats' => 0, // TODO: Implement chat count
            'active_chats' => 0, // TODO: Implement active chat count
            'pending_chats' => 0, // TODO: Implement pending chat count
            'resolved_today' => 0, // TODO: Implement resolved count
        ];

        return Inertia::render('agent/dashboard', [
            'agent' => $agent,
            'assignedSessions' => $assignedSessions,
            'stats' => $stats,
        ]);
    }
}
