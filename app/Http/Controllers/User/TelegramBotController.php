<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Models\TelegramBot;
use App\Services\Telegram\TelegramService;
use App\Services\Telegram\TelegramBotApiService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class TelegramBotController extends Controller
{
    protected TelegramService $telegramService;

    public function __construct(TelegramService $telegramService)
    {
        $this->telegramService = $telegramService;
    }

    /**
     * List all bots
     */
    public function index()
    {
        $bots = auth()->user()->telegramBots()->latest()->get();

        return Inertia::render('user/telegram/bots/index', [
            'bots' => $bots,
        ]);
    }

    /**
     * Show create bot page
     */
    public function create()
    {
        $session = auth()->user()->telegramSessions()->latest()->first();

        if (!$session || !$session->isValid()) {
            return redirect()->route('user.telegram.session.index')
                ->withErrors(['session' => 'Please setup Telegram session first']);
        }

        return Inertia::render('user/telegram/bots/create', [
            'session' => $session,
        ]);
    }

    /**
     * Create new bot via BotFather
     */
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'username' => 'required|string|max:255|unique:telegram_bots,username',
            'description' => 'nullable|string',
        ]);

        $session = auth()->user()->telegramSessions()->latest()->first();

        if (!$session || !$session->isValid()) {
            return back()->withErrors(['session' => 'Invalid session']);
        }

        // Create bot via BotFather
        $result = $this->telegramService->createBot(
            $session->session_id,
            $request->name,
            $request->username
        );

        if (!($result['success'] ?? false)) {
            return back()->withErrors(['username' => $result['error'] ?? 'Failed to create bot']);
        }

        // Save bot to database
        $bot = TelegramBot::create([
            'user_id' => auth()->id(),
            'telegram_session_id' => $session->id,
            'name' => $request->name,
            'username' => $request->username,
            'token' => $result['token'] ?? '',
            'description' => $request->description,
            'is_active' => true,
        ]);

        // Set webhook for this bot
        $this->setupWebhook($bot);

        return redirect()->route('user.telegram.bots.index')
            ->with('success', 'Bot created successfully');
    }

    /**
     * Toggle bot active status
     */
    public function toggleActive(TelegramBot $bot)
    {
        $this->authorize('update', $bot);

        $bot->update(['is_active' => !$bot->is_active]);

        return back()->with('success', 'Bot status updated');
    }

    /**
     * Toggle auto reply
     */
    public function toggleAutoReply(TelegramBot $bot)
    {
        $this->authorize('update', $bot);

        $bot->update(['auto_reply_enabled' => !$bot->auto_reply_enabled]);

        // Start/stop listener based on status
        $session = $bot->telegramSession;
        if ($session) {
            if ($bot->auto_reply_enabled) {
                $this->telegramService->startListener($session->session_id);
            } else {
                $this->telegramService->stopListener($session->session_id);
            }
        }

        return back()->with('success', 'Auto reply ' . ($bot->auto_reply_enabled ? 'enabled' : 'disabled'));
    }

    /**
     * Delete bot
     */
    public function destroy(TelegramBot $bot)
    {
        $this->authorize('delete', $bot);

        $bot->delete();

        return back()->with('success', 'Bot deleted successfully');
    }

    /**
     * Setup webhook for bot
     */
    protected function setupWebhook(TelegramBot $bot): void
    {
        try {
            $botApi = new TelegramBotApiService($bot->token);
            $webhookUrl = route('api.telegram.webhook', ['bot' => $bot->id]);

            $result = $botApi->setWebhook($webhookUrl);

            if ($result['success'] ?? false) {
                $bot->update(['webhook_url' => $webhookUrl]);
            }
        } catch (\Exception $e) {
            \Log::error('Failed to setup webhook: ' . $e->getMessage());
        }
    }
}
