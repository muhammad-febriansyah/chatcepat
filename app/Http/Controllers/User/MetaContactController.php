<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Models\MetaContact;
use App\Models\MetaContactGroup;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;
use Maatwebsite\Excel\Facades\Excel;
use App\Exports\MetaContactsExport;
use App\Imports\MetaContactsImport;

class MetaContactController extends Controller
{
    /**
     * Display contacts list
     */
    public function index(Request $request): Response
    {
        $user = auth()->user();

        $contacts = MetaContact::where('user_id', $user->id)
            ->when($request->platform, fn($q, $platform) => $q->where('platform', $platform))
            ->when($request->group, function($q, $groupId) {
                $q->whereHas('groups', fn($query) => $query->where('meta_contact_groups.id', $groupId));
            })
            ->when($request->search, function($q, $search) {
                $q->where(function($query) use ($search) {
                    $query->where('name', 'like', "%{$search}%")
                        ->orWhere('identifier', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%");
                });
            })
            ->when($request->blocked !== null, fn($q) => $q->where('is_blocked', $request->boolean('blocked')))
            ->with('groups')
            ->orderBy('last_message_at', 'desc')
            ->paginate(50);

        $groups = MetaContactGroup::where('user_id', $user->id)
            ->withCount('contacts')
            ->get();

        return Inertia::render('user/meta/contacts/index', [
            'contacts' => $contacts,
            'groups' => $groups,
            'filters' => $request->only(['platform', 'group', 'search', 'blocked']),
        ]);
    }

    /**
     * Show create form
     */
    public function create(): Response
    {
        $groups = MetaContactGroup::where('user_id', auth()->id())
            ->get();

        return Inertia::render('user/meta/contacts/create', [
            'groups' => $groups,
        ]);
    }

    /**
     * Store new contact
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'platform' => 'required|in:whatsapp,instagram,facebook',
            'identifier' => 'required|string',
            'name' => 'nullable|string|max:255',
            'username' => 'nullable|string|max:255',
            'email' => 'nullable|email',
            'custom_fields' => 'nullable|array',
            'tags' => 'nullable|array',
            'notes' => 'nullable|string',
            'groups' => 'nullable|array',
        ]);

        $validated['user_id'] = auth()->id();
        $groups = $validated['groups'] ?? [];
        unset($validated['groups']);

        $contact = MetaContact::create($validated);

        if (!empty($groups)) {
            $contact->groups()->attach($groups);

            // Update groups contacts count
            foreach ($groups as $groupId) {
                MetaContactGroup::find($groupId)?->updateContactsCount();
            }
        }

        return redirect()
            ->route('user.meta.contacts.index')
            ->with('success', 'Contact created successfully');
    }

    /**
     * Show edit form
     */
    public function edit(MetaContact $contact): Response
    {
        $this->authorize('update', $contact);

        $contact->load('groups');

        $groups = MetaContactGroup::where('user_id', auth()->id())
            ->get();

        return Inertia::render('user/meta/contacts/edit', [
            'contact' => $contact,
            'groups' => $groups,
        ]);
    }

    /**
     * Update contact
     */
    public function update(Request $request, MetaContact $contact): RedirectResponse
    {
        $this->authorize('update', $contact);

        $validated = $request->validate([
            'name' => 'nullable|string|max:255',
            'username' => 'nullable|string|max:255',
            'email' => 'nullable|email',
            'custom_fields' => 'nullable|array',
            'tags' => 'nullable|array',
            'notes' => 'nullable|string',
            'groups' => 'nullable|array',
        ]);

        $groups = $validated['groups'] ?? [];
        unset($validated['groups']);

        $contact->update($validated);

        // Sync groups
        $oldGroups = $contact->groups()->pluck('meta_contact_groups.id')->toArray();
        $contact->groups()->sync($groups);

        // Update contacts count for affected groups
        $affectedGroups = array_unique(array_merge($oldGroups, $groups));
        foreach ($affectedGroups as $groupId) {
            MetaContactGroup::find($groupId)?->updateContactsCount();
        }

        return redirect()
            ->route('user.meta.contacts.index')
            ->with('success', 'Contact updated successfully');
    }

    /**
     * Delete contact
     */
    public function destroy(MetaContact $contact): RedirectResponse
    {
        $this->authorize('delete', $contact);

        $groups = $contact->groups()->pluck('meta_contact_groups.id')->toArray();

        $contact->delete();

        // Update contacts count for groups
        foreach ($groups as $groupId) {
            MetaContactGroup::find($groupId)?->updateContactsCount();
        }

        return redirect()
            ->route('user.meta.contacts.index')
            ->with('success', 'Contact deleted successfully');
    }

    /**
     * Toggle blocked status
     */
    public function toggleBlock(MetaContact $contact): JsonResponse
    {
        $this->authorize('update', $contact);

        $contact->update(['is_blocked' => !$contact->is_blocked]);

        return response()->json([
            'success' => true,
            'is_blocked' => $contact->is_blocked,
        ]);
    }

    /**
     * Bulk delete contacts
     */
    public function bulkDelete(Request $request): JsonResponse
    {
        $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'integer|exists:meta_contacts,id',
        ]);

        $user = auth()->user();

        $contacts = MetaContact::where('user_id', $user->id)
            ->whereIn('id', $request->ids)
            ->get();

        $groupIds = [];
        foreach ($contacts as $contact) {
            $groupIds = array_merge($groupIds, $contact->groups()->pluck('meta_contact_groups.id')->toArray());
        }

        MetaContact::where('user_id', $user->id)
            ->whereIn('id', $request->ids)
            ->delete();

        // Update contacts count for affected groups
        $groupIds = array_unique($groupIds);
        foreach ($groupIds as $groupId) {
            MetaContactGroup::find($groupId)?->updateContactsCount();
        }

        return response()->json([
            'success' => true,
            'message' => 'Contacts deleted successfully',
        ]);
    }

    /**
     * Export contacts to Excel
     */
    public function export(Request $request)
    {
        $user = auth()->user();
        $platform = $request->platform;

        return Excel::download(
            new MetaContactsExport($user->id, $platform),
            'meta-contacts-' . now()->format('Y-m-d') . '.xlsx'
        );
    }

    /**
     * Import contacts from Excel
     */
    public function import(Request $request): JsonResponse
    {
        $request->validate([
            'file' => 'required|file|mimes:xlsx,xls,csv|max:10240',
            'platform' => 'required|in:whatsapp,instagram,facebook',
        ]);

        try {
            Excel::import(
                new MetaContactsImport(auth()->id(), $request->platform),
                $request->file('file')
            );

            return response()->json([
                'success' => true,
                'message' => 'Contacts imported successfully',
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Import failed: ' . $e->getMessage(),
            ], 422);
        }
    }
}
