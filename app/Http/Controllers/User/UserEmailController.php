<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Models\UserEmail;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\RedirectResponse;

class UserEmailController extends Controller
{
    /**
     * Display user's email addresses
     */
    public function index(): Response
    {
        $user = auth()->user();

        $emails = UserEmail::where('user_id', $user->id)
            ->with('approver:id,name')
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($email) {
                return [
                    'id' => $email->id,
                    'email' => $email->email,
                    'status' => $email->status,
                    'verified_at' => $email->verified_at?->format('d M Y H:i'),
                    'approved_at' => $email->approved_at?->format('d M Y H:i'),
                    'approved_by' => $email->approver?->name,
                    'rejection_reason' => $email->rejection_reason,
                    'notes' => $email->notes,
                    'created_at' => $email->created_at->format('d M Y H:i'),
                ];
            });

        return Inertia::render('user/email-settings/index', [
            'emails' => $emails,
        ]);
    }

    /**
     * Store a new email address
     */
    public function store(Request $request): RedirectResponse
    {
        $user = auth()->user();

        $validated = $request->validate([
            'email' => [
                'required',
                'email',
                'unique:user_emails,email',
                'different:' . $user->email, // Cannot use the same email as account email
            ],
        ], [
            'email.unique' => 'Email ini sudah terdaftar.',
            'email.different' => 'Tidak dapat menggunakan email akun utama.',
        ]);

        UserEmail::create([
            'user_id' => $user->id,
            'email' => $validated['email'],
            'status' => 'pending',
        ]);

        return redirect()->back()
            ->with('success', 'Email berhasil ditambahkan. Menunggu verifikasi admin.');
    }

    /**
     * Delete an email address (only if pending or rejected)
     */
    public function destroy(int $id): RedirectResponse
    {
        $user = auth()->user();

        $email = UserEmail::where('user_id', $user->id)
            ->where('id', $id)
            ->firstOrFail();

        if ($email->status === 'approved') {
            return redirect()->back()
                ->withErrors(['error' => 'Email yang sudah disetujui tidak dapat dihapus.']);
        }

        $email->delete();

        return redirect()->back()
            ->with('success', 'Email berhasil dihapus.');
    }
}
