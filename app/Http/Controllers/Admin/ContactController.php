<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Contact;
use Inertia\Inertia;
use Inertia\Response;

class ContactController extends Controller
{
    public function index(): Response
    {
        $contacts = Contact::latest()->paginate(20);

        return Inertia::render('admin/contacts/index', [
            'contacts' => $contacts,
            'stats' => [
                'total' => Contact::count(),
                'unread' => Contact::where('is_read', false)->count(),
                'read' => Contact::where('is_read', true)->count(),
            ],
        ]);
    }

    public function show(Contact $contact): Response
    {
        // Mark as read when viewing
        if (!$contact->is_read) {
            $contact->update(['is_read' => true]);
        }

        return Inertia::render('admin/contacts/show', [
            'contact' => $contact,
        ]);
    }

    public function markAsRead(Contact $contact)
    {
        $contact->update(['is_read' => true]);

        return redirect()->back()->with('success', 'Pesan ditandai sebagai sudah dibaca.');
    }

    public function destroy(Contact $contact)
    {
        $contact->delete();

        return redirect()->route('admin.contacts.index')->with('success', 'Pesan berhasil dihapus.');
    }
}
