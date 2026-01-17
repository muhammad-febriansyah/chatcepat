<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\WhatsappAutoReply;
use App\Models\WhatsappSession;
use Illuminate\Http\Request;
use Inertia\Inertia;

class WhatsAppAutoReplyController extends Controller
{
    public function index(Request $request)
    {
        $query = WhatsappAutoReply::query()
            ->whereHas('session', function ($q) {
                $q->where('user_id', auth()->id());
            })
            ->with('session:id,name');

        if ($request->filled('session_id')) {
            $query->where('whatsapp_session_id', $request->session_id);
        }

        if ($request->has('is_active')) {
            $query->where('is_active', $request->boolean('is_active'));
        }

        $autoReplies = $query->orderBy('priority', 'desc')->paginate($request->per_page ?? 20);

        $sessions = WhatsappSession::where('user_id', auth()->id())
            ->select('id', 'name')
            ->get();

        return Inertia::render('admin/whatsapp/auto-replies/index', [
            'autoReplies' => $autoReplies,
            'sessions' => $sessions,
            'filters' => $request->only(['session_id', 'is_active']),
        ]);
    }

    public function create()
    {
        $sessions = WhatsappSession::where('user_id', auth()->id())
            ->select('id', 'name')
            ->get();

        return Inertia::render('admin/whatsapp/auto-replies/create', [
            'sessions' => $sessions,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'whatsapp_session_id' => 'required|exists:whatsapp_sessions,id',
            'name' => 'required|string|max:255',
            'trigger_type' => 'required|in:keyword,regex,all',
            'trigger_value' => 'nullable|string',
            'reply_type' => 'required|in:custom,openai,rajaongkir',
            'reply_content' => 'nullable|string',
            'openai_prompt' => 'nullable|string',
            'is_active' => 'boolean',
            'priority' => 'integer|min:0|max:100',
        ]);

        $session = WhatsappSession::findOrFail($validated['whatsapp_session_id']);
        if ($session->user_id !== auth()->id()) {
            abort(403);
        }

        WhatsappAutoReply::create($validated);

        return redirect()->route('admin.whatsapp.auto-replies.index')
            ->with('success', 'Auto-reply rule created successfully.');
    }

    public function edit(WhatsappAutoReply $autoReply)
    {
        if ($autoReply->session->user_id !== auth()->id()) {
            abort(403);
        }

        $sessions = WhatsappSession::where('user_id', auth()->id())
            ->select('id', 'name')
            ->get();

        return Inertia::render('admin/whatsapp/auto-replies/edit', [
            'autoReply' => $autoReply,
            'sessions' => $sessions,
        ]);
    }

    public function update(Request $request, WhatsappAutoReply $autoReply)
    {
        if ($autoReply->session->user_id !== auth()->id()) {
            abort(403);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'trigger_type' => 'required|in:keyword,regex,all',
            'trigger_value' => 'nullable|string',
            'reply_type' => 'required|in:custom,openai,rajaongkir',
            'reply_content' => 'nullable|string',
            'openai_prompt' => 'nullable|string',
            'is_active' => 'boolean',
            'priority' => 'integer|min:0|max:100',
        ]);

        $autoReply->update($validated);

        return redirect()->route('admin.whatsapp.auto-replies.index')
            ->with('success', 'Auto-reply rule updated successfully.');
    }

    public function destroy(WhatsappAutoReply $autoReply)
    {
        if ($autoReply->session->user_id !== auth()->id()) {
            abort(403);
        }

        $autoReply->delete();

        return redirect()->route('admin.whatsapp.auto-replies.index')
            ->with('success', 'Auto-reply rule deleted successfully.');
    }
}
