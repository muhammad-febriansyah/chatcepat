<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Models\TelegramBot;
use App\Models\TelegramAutoReply;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class TelegramAutoReplyController extends Controller
{
    public function index()
    {
        $autoReplies = auth()->user()->telegramAutoReplies()
            ->with('telegramBot')
            ->latest()
            ->get();

        $bots = auth()->user()->telegramBots()->where('is_active', true)->get();

        return Inertia::render('user/telegram/auto-replies/index', [
            'autoReplies' => $autoReplies,
            'bots' => $bots,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'bot_id' => 'required|exists:telegram_bots,id',
            'name' => 'required|string|max:255',
            'trigger_type' => 'required|in:keyword,contains,exact,regex,all',
            'trigger_value' => 'nullable|string',
            'reply_type' => 'required|in:text,photo,video,document',
            'reply_content' => 'required|string',
            'reply_file' => 'nullable|file|max:10240',
            'priority' => 'nullable|integer|min:0|max:100',
        ]);

        $bot = TelegramBot::findOrFail($request->bot_id);
        $this->authorize('update', $bot);

        // Upload file if exists
        $fileUrl = null;
        if ($request->hasFile('reply_file')) {
            $path = $request->file('reply_file')->store('telegram/auto-reply', 'public');
            $fileUrl = Storage::url($path);
        }

        TelegramAutoReply::create([
            'user_id' => auth()->id(),
            'telegram_bot_id' => $bot->id,
            'name' => $request->name,
            'trigger_type' => $request->trigger_type,
            'trigger_value' => $request->trigger_value,
            'reply_type' => $request->reply_type,
            'reply_content' => $request->reply_content,
            'reply_file_url' => $fileUrl,
            'priority' => $request->priority ?? 0,
            'is_active' => true,
        ]);

        return back()->with('success', 'Auto reply created successfully');
    }

    public function update(Request $request, TelegramAutoReply $autoReply)
    {
        $this->authorize('update', $autoReply);

        $request->validate([
            'name' => 'required|string|max:255',
            'trigger_type' => 'required|in:keyword,contains,exact,regex,all',
            'trigger_value' => 'nullable|string',
            'reply_type' => 'required|in:text,photo,video,document',
            'reply_content' => 'required|string',
            'reply_file' => 'nullable|file|max:10240',
            'priority' => 'nullable|integer|min:0|max:100',
        ]);

        $data = $request->only(['name', 'trigger_type', 'trigger_value', 'reply_type', 'reply_content', 'priority']);

        if ($request->hasFile('reply_file')) {
            if ($autoReply->reply_file_url) {
                Storage::disk('public')->delete(str_replace('/storage/', '', $autoReply->reply_file_url));
            }
            $path = $request->file('reply_file')->store('telegram/auto-reply', 'public');
            $data['reply_file_url'] = Storage::url($path);
        }

        $autoReply->update($data);

        return back()->with('success', 'Auto reply updated successfully');
    }

    public function toggleActive(TelegramAutoReply $autoReply)
    {
        $this->authorize('update', $autoReply);

        $autoReply->update(['is_active' => !$autoReply->is_active]);

        return back()->with('success', 'Auto reply ' . ($autoReply->is_active ? 'activated' : 'deactivated'));
    }

    public function destroy(TelegramAutoReply $autoReply)
    {
        $this->authorize('delete', $autoReply);

        if ($autoReply->reply_file_url) {
            Storage::disk('public')->delete(str_replace('/storage/', '', $autoReply->reply_file_url));
        }

        $autoReply->delete();

        return back()->with('success', 'Auto reply deleted successfully');
    }
}
