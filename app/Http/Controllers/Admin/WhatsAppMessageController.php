<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\WhatsappMessage;
use App\Models\WhatsappSession;
use Illuminate\Http\Request;
use Inertia\Inertia;

class WhatsAppMessageController extends Controller
{
    public function index(Request $request)
    {
        $query = WhatsappMessage::query()
            ->whereHas('session', function ($q) {
                $q->where('user_id', auth()->id());
            })
            ->with('session:id,name');

        if ($request->filled('search')) {
            $query->where(function ($q) use ($request) {
                $q->where('content', 'like', "%{$request->search}%")
                  ->orWhere('from_number', 'like', "%{$request->search}%")
                  ->orWhere('to_number', 'like', "%{$request->search}%");
            });
        }

        if ($request->filled('session_id')) {
            $query->where('whatsapp_session_id', $request->session_id);
        }

        if ($request->filled('direction')) {
            $query->where('direction', $request->direction);
        }

        $messages = $query->latest('sent_at')->paginate($request->per_page ?? 20);

        $sessions = WhatsappSession::where('user_id', auth()->id())
            ->select('id', 'name')
            ->get();

        return Inertia::render('admin/whatsapp/messages/index', [
            'messages' => $messages,
            'sessions' => $sessions,
            'filters' => $request->only(['search', 'session_id', 'direction']),
        ]);
    }

    public function show(WhatsappMessage $message)
    {
        $message->load('session:id,name,phone_number');

        if ($message->session->user_id !== auth()->id()) {
            abort(403);
        }

        return Inertia::render('admin/whatsapp/messages/show', [
            'message' => $message,
        ]);
    }

    public function conversation(Request $request, int $sessionId, string $phoneNumber)
    {
        $session = WhatsappSession::findOrFail($sessionId);

        if ($session->user_id !== auth()->id()) {
            abort(403);
        }

        $messages = WhatsappMessage::where('whatsapp_session_id', $sessionId)
            ->where(function ($q) use ($phoneNumber) {
                $q->where('from_number', $phoneNumber)
                  ->orWhere('to_number', $phoneNumber);
            })
            ->orderBy('sent_at', 'asc')
            ->paginate($request->per_page ?? 50);

        return Inertia::render('admin/whatsapp/messages/conversation', [
            'session' => $session,
            'phoneNumber' => $phoneNumber,
            'messages' => $messages,
        ]);
    }
}
