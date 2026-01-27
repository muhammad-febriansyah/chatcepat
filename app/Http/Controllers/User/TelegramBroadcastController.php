<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Models\TelegramBot;
use App\Models\TelegramBroadcast;
use App\Models\TelegramBroadcastMessage;
use App\Models\TelegramContact;
use App\Models\TelegramMessage;
use App\Services\Telegram\TelegramBotApiService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class TelegramBroadcastController extends Controller
{
    public function index()
    {
        $broadcasts = auth()->user()->telegramBroadcasts()
            ->with('telegramBot')
            ->latest()
            ->paginate(20);

        return Inertia::render('user/telegram/broadcasts/index', [
            'broadcasts' => $broadcasts,
        ]);
    }

    public function create()
    {
        $bots = auth()->user()->telegramBots()->where('is_active', true)->get();
        $contacts = auth()->user()->telegramContacts()->get();

        return Inertia::render('user/telegram/broadcasts/create', [
            'bots' => $bots,
            'contacts' => $contacts,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'bot_id' => 'required|exists:telegram_bots,id',
            'name' => 'required|string|max:255',
            'message_type' => 'required|in:text,photo,video,document',
            'message_content' => 'required|string',
            'file' => 'nullable|file|max:51200',
            'contact_ids' => 'required|array|min:1',
            'contact_ids.*' => 'exists:telegram_contacts,id',
        ]);

        $bot = TelegramBot::findOrFail($request->bot_id);
        $this->authorize('update', $bot);

        // Upload file if exists
        $fileUrl = null;
        if ($request->hasFile('file')) {
            $path = $request->file('file')->store('telegram/broadcast', 'public');
            $fileUrl = Storage::url($path);
        }

        // Create broadcast
        $broadcast = TelegramBroadcast::create([
            'user_id' => auth()->id(),
            'telegram_bot_id' => $bot->id,
            'name' => $request->name,
            'message_type' => $request->message_type,
            'message_content' => $request->message_content,
            'file_url' => $fileUrl,
            'status' => 'processing',
            'total_recipients' => count($request->contact_ids),
        ]);

        // Create broadcast messages for each contact
        foreach ($request->contact_ids as $contactId) {
            TelegramBroadcastMessage::create([
                'telegram_broadcast_id' => $broadcast->id,
                'telegram_contact_id' => $contactId,
                'status' => 'pending',
            ]);
        }

        // Dispatch job to send broadcast (in real app, use Queue)
        $this->processBroadcast($broadcast);

        return redirect()->route('user.telegram.broadcasts.index')
            ->with('success', 'Broadcast created and being sent');
    }

    protected function processBroadcast(TelegramBroadcast $broadcast): void
    {
        $broadcast->update(['started_at' => now()]);
        $bot = $broadcast->telegramBot;
        $botApi = new TelegramBotApiService($bot->token);

        $messages = $broadcast->broadcastMessages()->with('telegramContact')->get();

        foreach ($messages as $broadcastMessage) {
            try {
                $contact = $broadcastMessage->telegramContact;
                $chatId = $contact->telegram_id ?? $contact->phone;

                // Send message based on type
                $result = match ($broadcast->message_type) {
                    'text' => $botApi->sendMessage($chatId, $broadcast->message_content),
                    'photo' => $botApi->sendPhoto($chatId, url($broadcast->file_url), $broadcast->message_content),
                    'video' => $botApi->sendVideo($chatId, url($broadcast->file_url), $broadcast->message_content),
                    'document' => $botApi->sendDocument($chatId, url($broadcast->file_url), $broadcast->message_content),
                };

                if ($result['success'] ?? false) {
                    // Create message record
                    $message = TelegramMessage::create([
                        'user_id' => $broadcast->user_id,
                        'telegram_bot_id' => $bot->id,
                        'telegram_contact_id' => $contact->id,
                        'chat_id' => $chatId,
                        'message_id' => $result['result']['message_id'] ?? null,
                        'direction' => 'outbound',
                        'type' => $broadcast->message_type,
                        'content' => $broadcast->message_content,
                        'file_url' => $broadcast->file_url,
                        'status' => 'sent',
                        'sent_at' => now(),
                    ]);

                    $broadcastMessage->update([
                        'telegram_message_id' => $message->id,
                        'status' => 'sent',
                        'sent_at' => now(),
                    ]);

                    $broadcast->increment('sent_count');
                } else {
                    $broadcastMessage->update([
                        'status' => 'failed',
                        'error_message' => $result['error'] ?? 'Unknown error',
                    ]);
                    $broadcast->increment('failed_count');
                }

                usleep(100000); // 100ms delay to avoid rate limit
            } catch (\Exception $e) {
                $broadcastMessage->update([
                    'status' => 'failed',
                    'error_message' => $e->getMessage(),
                ]);
                $broadcast->increment('failed_count');
            }
        }

        $broadcast->update([
            'status' => 'completed',
            'completed_at' => now(),
        ]);
    }

    public function show(TelegramBroadcast $broadcast)
    {
        $this->authorize('view', $broadcast);

        $broadcast->load(['telegramBot', 'broadcastMessages.telegramContact']);

        return Inertia::render('user/telegram/broadcasts/show', [
            'broadcast' => $broadcast,
        ]);
    }
}
