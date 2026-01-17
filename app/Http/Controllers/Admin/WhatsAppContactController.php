<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\WhatsappContact;
use App\Models\WhatsappSession;
use Illuminate\Http\Request;
use Inertia\Inertia;

class WhatsAppContactController extends Controller
{
    public function index(Request $request)
    {
        $query = WhatsappContact::query()
            ->whereHas('session', function ($q) {
                $q->where('user_id', auth()->id());
            })
            ->with('session:id,name');

        if ($request->filled('search')) {
            $query->where(function ($q) use ($request) {
                $q->where('name', 'like', "%{$request->search}%")
                  ->orWhere('phone_number', 'like', "%{$request->search}%");
            });
        }

        if ($request->filled('session_id')) {
            $query->where('whatsapp_session_id', $request->session_id);
        }

        $contacts = $query->latest()->paginate($request->per_page ?? 20);

        $sessions = WhatsappSession::where('user_id', auth()->id())
            ->select('id', 'name')
            ->get();

        return Inertia::render('admin/whatsapp/contacts/index', [
            'contacts' => $contacts,
            'sessions' => $sessions,
            'filters' => $request->only(['search', 'session_id']),
        ]);
    }

    public function show(WhatsappContact $contact)
    {
        $contact->load('session:id,name,phone_number');

        if ($contact->session->user_id !== auth()->id()) {
            abort(403);
        }

        return Inertia::render('admin/whatsapp/contacts/show', [
            'contact' => $contact,
        ]);
    }

    public function destroy(WhatsappContact $contact)
    {
        if ($contact->session->user_id !== auth()->id()) {
            abort(403);
        }

        $contact->delete();

        return redirect()->route('admin.whatsapp.contacts.index')
            ->with('success', 'Contact deleted successfully.');
    }
}
