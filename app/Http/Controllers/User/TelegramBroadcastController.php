<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Models\TelegramBot;
use App\Models\TelegramBroadcast;
use App\Models\ContactGroup;
use App\Services\TelegramService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Log;

class TelegramBroadcastController extends Controller
{
    /**
     * Display broadcast page
     */
    public function index(): Response
    {
        $user = auth()->user();

        $bots = TelegramBot::where('user_id', $user->id)
            ->where('is_active', true)
            ->withCount('contacts')
            ->get()
            ->map(function ($bot) {
                return [
                    'id' => $bot->id,
                    'bot_username' => $bot->bot_username,
                    'contacts_count' => $bot->contacts_count,
                ];
            });

        // Get contact groups (can be used for Telegram too if phone numbers are converted)
        $contactGroups = ContactGroup::where('user_id', $user->id)
            ->withCount('members')
            ->orderBy('name')
            ->get()
            ->map(function ($group) {
                return [
                    'id' => $group->id,
                    'name' => $group->name,
                    'members_count' => $group->members_count,
                ];
            });

        return Inertia::render('user/telegram/broadcast', [
            'bots' => $bots,
            'contactGroups' => $contactGroups,
        ]);
    }

    /**
     * Get contacts for a specific bot
     */
    public function getContacts(TelegramBot $telegramBot)
    {
        if ($telegramBot->user_id !== auth()->id()) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $contacts = $telegramBot->contacts()
            ->where('is_blocked', false)
            ->orderBy('last_message_at', 'desc')
            ->get()
            ->map(function ($contact) {
                return [
                    'id' => $contact->id,
                    'chat_id' => $contact->chat_id,
                    'display_name' => $contact->display_name,
                    'username' => $contact->username,
                    'chat_type' => $contact->chat_type,
                ];
            });

        return response()->json(['contacts' => $contacts]);
    }

    /**
     * Send broadcast
     */
    public function send(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'bot_id' => 'required|exists:telegram_bots,id',
            'message' => 'required|string',
            'recipients' => 'required|array|min:1',
            'recipients.*' => 'required|integer',
        ], [
            'bot_id.required' => 'Pilih bot terlebih dahulu.',
            'bot_id.exists' => 'Bot tidak valid.',
            'message.required' => 'Pesan wajib diisi.',
            'recipients.required' => 'Pilih minimal 1 penerima.',
            'recipients.min' => 'Pilih minimal 1 penerima.',
        ]);

        $user = auth()->user();
        $bot = TelegramBot::findOrFail($validated['bot_id']);

        if ($bot->user_id !== $user->id) {
            return redirect()->back()->with('error', 'Anda tidak memiliki akses ke bot ini.');
        }

        if (!$bot->is_active) {
            return redirect()->back()->with('error', 'Bot tidak aktif.');
        }

        $chatIds = $validated['recipients'];
        $message = $validated['message'];

        // Create broadcast record
        $broadcast = TelegramBroadcast::create([
            'telegram_bot_id' => $bot->id,
            'user_id' => $user->id,
            'name' => 'Broadcast ' . now()->format('d M Y H:i'),
            'type' => 'text',
            'content' => $message,
            'recipient_chat_ids' => $chatIds,
            'total_recipients' => count($chatIds),
            'status' => 'processing',
            'started_at' => now(),
        ]);

        // Send messages
        $service = new TelegramService($bot);
        $sentCount = 0;
        $failedCount = 0;

        foreach ($chatIds as $chatId) {
            try {
                $result = $service->sendMessage($chatId, $message);

                if ($result['success']) {
                    $sentCount++;
                } else {
                    $failedCount++;
                    Log::warning('Telegram broadcast failed', [
                        'broadcast_id' => $broadcast->id,
                        'chat_id' => $chatId,
                        'error' => $result['error'],
                    ]);
                }

                // Rate limiting
                usleep(100000); // 100ms delay

            } catch (\Exception $e) {
                $failedCount++;
                Log::error('Telegram broadcast error', [
                    'broadcast_id' => $broadcast->id,
                    'chat_id' => $chatId,
                    'error' => $e->getMessage(),
                ]);
            }
        }

        // Update broadcast record
        $broadcast->update([
            'sent_count' => $sentCount,
            'failed_count' => $failedCount,
            'status' => 'completed',
            'completed_at' => now(),
        ]);

        return redirect()->back()->with('success', "Broadcast selesai! Terkirim: {$sentCount}, Gagal: {$failedCount}");
    }

    /**
     * Get broadcast history
     */
    public function history(): Response
    {
        $user = auth()->user();

        $broadcasts = TelegramBroadcast::where('user_id', $user->id)
            ->with('bot:id,bot_username')
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return Inertia::render('user/telegram/history', [
            'broadcasts' => $broadcasts,
        ]);
    }
}
