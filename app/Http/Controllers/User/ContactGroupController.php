<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Models\ContactGroup;
use App\Models\ContactGroupMember;
use App\Models\WhatsappSession;
use App\Models\WhatsappContact;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;

class ContactGroupController extends Controller
{
    private function gatewayUrl(): string
    {
        return config('services.whatsapp_gateway.url', 'http://localhost:3000');
    }

    public function index(): Response
    {
        $user = auth()->user();

        $groups = ContactGroup::where('user_id', $user->id)
            ->with(['members' => function($query) {
                $query->orderBy('name');
            }])
            ->withCount('members')
            ->orderBy('name')
            ->get();

        $sessions = WhatsappSession::where('user_id', $user->id)
            ->where('status', 'connected')
            ->get();

        // Get user's WhatsApp contacts for selection
        $contacts = WhatsappContact::where('user_id', $user->id)
            ->where('is_group', false)
            ->orderBy('push_name')
            ->get()
            ->map(function ($contact) {
                return [
                    'id' => $contact->id,
                    'phone_number' => $contact->phone_number,
                    'name' => $contact->push_name ?? $contact->display_name ?? $contact->phone_number,
                ];
            });

        return Inertia::render('user/contact-groups/index', [
            'groups' => $groups,
            'sessions' => $sessions,
            'contacts' => $contacts,
        ]);
    }

    public function store(Request $request): RedirectResponse|JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:100',
            'description' => 'nullable|string|max:500',
        ], [
            'name.required' => 'Nama grup wajib diisi.',
            'name.max' => 'Nama grup maksimal 100 karakter.',
            'description.max' => 'Deskripsi maksimal 500 karakter.',
        ]);

        $user = auth()->user();

        $group = ContactGroup::create([
            'user_id' => $user->id,
            'name' => $validated['name'],
            'description' => $validated['description'] ?? null,
            'source' => 'manual',
        ]);

        // Return JSON for AJAX requests (more secure for SaaS)
        if ($request->expectsJson() || $request->ajax()) {
            return response()->json([
                'success' => true,
                'message' => 'Grup berhasil dibuat.',
                'group' => [
                    'id' => $group->id,
                    'name' => $group->name,
                    'description' => $group->description,
                    'source' => $group->source,
                    'members_count' => 0,
                ],
            ], 201);
        }

        return redirect()->back()->with('success', 'Grup berhasil dibuat.');
    }

    public function update(Request $request, ContactGroup $contactGroup): RedirectResponse
    {
        if ($contactGroup->user_id !== auth()->id()) {
            return redirect()->back()->with('error', 'Anda tidak memiliki akses ke grup ini.');
        }

        $validated = $request->validate([
            'name' => 'required|string|max:100',
            'description' => 'nullable|string|max:500',
        ], [
            'name.required' => 'Nama grup wajib diisi.',
            'name.max' => 'Nama grup maksimal 100 karakter.',
            'description.max' => 'Deskripsi maksimal 500 karakter.',
        ]);

        $contactGroup->update([
            'name' => $validated['name'],
            'description' => $validated['description'] ?? null,
        ]);

        return redirect()->back()->with('success', 'Grup berhasil diperbarui.');
    }

    public function destroy(ContactGroup $contactGroup): RedirectResponse
    {
        if ($contactGroup->user_id !== auth()->id()) {
            return redirect()->back()->with('error', 'Anda tidak memiliki akses ke grup ini.');
        }

        $contactGroup->delete();

        return redirect()->back()->with('success', 'Grup berhasil dihapus.');
    }

    public function addMembers(Request $request, ContactGroup $contactGroup): RedirectResponse
    {
        if ($contactGroup->user_id !== auth()->id()) {
            return redirect()->back()->with('error', 'Anda tidak memiliki akses ke grup ini.');
        }

        $validated = $request->validate([
            'members' => 'required|array|min:1',
            'members.*.phone_number' => 'required|string|max:20',
            'members.*.name' => 'nullable|string|max:100',
        ], [
            'members.required' => 'Minimal satu nomor harus diisi.',
            'members.*.phone_number.required' => 'Nomor telepon wajib diisi.',
        ]);

        $addedCount = 0;
        $skippedCount = 0;

        foreach ($validated['members'] as $member) {
            $phoneNumber = $this->cleanPhoneNumber($member['phone_number']);

            $existing = $contactGroup->members()
                ->where('phone_number', $phoneNumber)
                ->exists();

            if (!$existing) {
                $contactGroup->members()->create([
                    'phone_number' => $phoneNumber,
                    'name' => $member['name'] ?? null,
                ]);
                $addedCount++;
            } else {
                $skippedCount++;
            }
        }

        $contactGroup->updateMembersCount();

        $message = "Berhasil menambahkan {$addedCount} member.";
        if ($skippedCount > 0) {
            $message .= " {$skippedCount} nomor sudah ada di grup.";
        }

        return redirect()->back()->with('success', $message);
    }

    public function removeMember(ContactGroup $contactGroup, ContactGroupMember $member): RedirectResponse
    {
        if ($contactGroup->user_id !== auth()->id()) {
            return redirect()->back()->with('error', 'Anda tidak memiliki akses ke grup ini.');
        }

        if ($member->contact_group_id !== $contactGroup->id) {
            return redirect()->back()->with('error', 'Member tidak ditemukan di grup ini.');
        }

        $member->delete();
        $contactGroup->updateMembersCount();

        return redirect()->back()->with('success', 'Member berhasil dihapus dari grup.');
    }

    public function bulkDeleteMembers(Request $request, ContactGroup $contactGroup): RedirectResponse
    {
        if ($contactGroup->user_id !== auth()->id()) {
            return redirect()->back()->with('error', 'Anda tidak memiliki akses ke grup ini.');
        }

        $validated = $request->validate([
            'ids' => 'required|array|min:1',
            'ids.*' => 'integer|exists:contact_group_members,id',
        ], [
            'ids.required' => 'Pilih minimal satu anggota untuk dihapus.',
            'ids.min' => 'Pilih minimal satu anggota untuk dihapus.',
        ]);

        // Verify all members belong to this group
        $memberCount = ContactGroupMember::where('contact_group_id', $contactGroup->id)
            ->whereIn('id', $validated['ids'])
            ->count();

        if ($memberCount !== count($validated['ids'])) {
            return redirect()->back()->with('error', 'Beberapa anggota tidak ditemukan di grup ini.');
        }

        // Delete members
        ContactGroupMember::where('contact_group_id', $contactGroup->id)
            ->whereIn('id', $validated['ids'])
            ->delete();

        // Update members count
        $contactGroup->updateMembersCount();

        $deletedCount = count($validated['ids']);
        return redirect()->back()->with('success', "Berhasil menghapus {$deletedCount} anggota dari grup.");
    }

    public function syncFromWhatsApp(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'session_id' => 'required|exists:whatsapp_sessions,id',
        ], [
            'session_id.required' => 'Sesi WhatsApp wajib dipilih.',
            'session_id.exists' => 'Sesi WhatsApp tidak valid.',
        ]);

        $user = auth()->user();
        $session = WhatsappSession::findOrFail($validated['session_id']);

        if ($session->user_id !== $user->id) {
            return redirect()->back()->with('error', 'Anda tidak memiliki akses ke sesi ini.');
        }

        if ($session->status !== 'connected') {
            return redirect()->back()->with('error', 'Sesi WhatsApp tidak terhubung.');
        }

        try {
            $response = Http::timeout(120)->get($this->gatewayUrl() . '/api/groups/' . $session->session_id);

            if (!$response->successful()) {
                throw new \Exception('Gagal mengambil data grup dari WhatsApp.');
            }

            $waGroups = $response->json('groups', []);
            $syncedCount = 0;

            DB::beginTransaction();

            foreach ($waGroups as $waGroup) {
                $group = ContactGroup::updateOrCreate(
                    [
                        'user_id' => $user->id,
                        'whatsapp_group_jid' => $waGroup['id'],
                    ],
                    [
                        'name' => $waGroup['name'] ?? 'Grup WhatsApp',
                        'description' => $waGroup['description'] ?? null,
                        'source' => 'whatsapp',
                        'whatsapp_session_id' => $session->id,
                    ]
                );

                if (isset($waGroup['participants']) && is_array($waGroup['participants'])) {
                    $group->members()->delete();

                    foreach ($waGroup['participants'] as $participant) {
                        $phoneNumber = $this->extractPhoneFromJid($participant['id'] ?? $participant);
                        if ($phoneNumber) {
                            $group->members()->create([
                                'phone_number' => $phoneNumber,
                                'name' => $participant['name'] ?? null,
                            ]);
                        }
                    }
                }

                $group->updateMembersCount();
                $syncedCount++;
            }

            DB::commit();

            return redirect()->back()->with('success', "Berhasil menyinkronkan {$syncedCount} grup dari WhatsApp.");

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Failed to sync WhatsApp groups', [
                'session_id' => $session->id,
                'error' => $e->getMessage(),
            ]);

            return redirect()->back()->with('error', 'Gagal menyinkronkan grup: ' . $e->getMessage());
        }
    }

    public function getGroupsForBroadcast(): JsonResponse
    {
        $user = auth()->user();

        $groups = ContactGroup::where('user_id', $user->id)
            ->withCount('members')
            ->orderBy('name')
            ->get()
            ->map(function ($group) {
                return [
                    'id' => $group->id,
                    'name' => $group->name,
                    'source' => $group->source,
                    'members_count' => $group->members_count,
                ];
            });

        return response()->json(['groups' => $groups]);
    }

    public function getGroupMembers(ContactGroup $contactGroup): JsonResponse
    {
        if ($contactGroup->user_id !== auth()->id()) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $members = $contactGroup->members()
            ->orderBy('name')
            ->get()
            ->map(function ($member) {
                return [
                    'id' => $member->id,
                    'phone_number' => $member->phone_number,
                    'name' => $member->name,
                ];
            });

        return response()->json(['members' => $members]);
    }

    private function cleanPhoneNumber(string $phone): string
    {
        $cleanNumber = preg_replace('/[^0-9]/', '', $phone);

        if (!str_starts_with($cleanNumber, '62')) {
            if (str_starts_with($cleanNumber, '0')) {
                $cleanNumber = '62' . substr($cleanNumber, 1);
            } else {
                $cleanNumber = '62' . $cleanNumber;
            }
        }

        return $cleanNumber;
    }

    private function extractPhoneFromJid(string $jid): ?string
    {
        if (preg_match('/^(\d+)@/', $jid, $matches)) {
            return $matches[1];
        }
        return preg_replace('/[^0-9]/', '', $jid) ?: null;
    }
}
