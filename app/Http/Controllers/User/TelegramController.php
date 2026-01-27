<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class TelegramController extends Controller
{
    /**
     * Show Telegram dashboard
     */
    public function index(): Response
    {
        $user = auth()->user();

        // Get actual stats from database
        $stats = [
            'total' => $user->telegramMessages()->count(),
            'sent' => $user->telegramMessages()->outbound()->count(),
            'received' => $user->telegramMessages()->inbound()->count(),
        ];

        $recentMessages = $user->telegramMessages()
            ->with(['telegramBot', 'telegramContact'])
            ->latest()
            ->limit(10)
            ->get()
            ->map(function ($message) {
                return [
                    'id' => $message->id,
                    'from' => $message->direction === 'inbound'
                        ? ($message->telegramContact?->display_name ?? 'Unknown')
                        : $message->telegramBot?->name,
                    'to' => $message->direction === 'outbound'
                        ? ($message->telegramContact?->display_name ?? 'Unknown')
                        : 'Me',
                    'content' => $message->content,
                    'direction' => $message->direction,
                    'created_at' => $message->created_at->toISOString(),
                ];
            });

        $bots = $user->telegramBots()
            ->latest()
            ->get()
            ->map(function ($bot) {
                return [
                    'id' => $bot->id,
                    'name' => $bot->name,
                    'username' => $bot->username,
                    'is_active' => $bot->is_active,
                    'auto_reply_enabled' => $bot->auto_reply_enabled,
                ];
            });

        $session = $user->telegramSessions()->latest()->first();
        $hasTelegramConfigured = $session && $session->isValid();

        return Inertia::render('user/telegram/index', [
            'stats' => $stats,
            'recentMessages' => $recentMessages,
            'bots' => $bots,
            'hasTelegramConfigured' => $hasTelegramConfigured,
        ]);
    }
}
