<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\UserEmail;
use App\Models\User;
use App\Services\MailketingService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\RedirectResponse;

class AdminEmailVerificationController extends Controller
{
    protected $mailketingService;

    public function __construct(MailketingService $mailketingService)
    {
        $this->mailketingService = $mailketingService;
    }

    /**
     * Display all email verifications
     */
    public function index(Request $request): Response
    {
        $status = $request->query('status', 'all');

        $query = UserEmail::with(['user:id,name,email', 'approver:id,name'])
            ->orderBy('created_at', 'desc');

        if ($status !== 'all') {
            $query->where('status', $status);
        }

        $emails = $query->get()->map(function ($email) {
            return [
                'id' => $email->id,
                'user_id' => $email->user_id,
                'user_name' => $email->user->name,
                'user_email' => $email->user->email,
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

        // Get statistics
        $stats = [
            'total' => UserEmail::count(),
            'pending' => UserEmail::pending()->count(),
            'approved' => UserEmail::approved()->count(),
            'rejected' => UserEmail::rejected()->count(),
        ];

        return Inertia::render('admin/email-verifications/index', [
            'emails' => $emails,
            'stats' => $stats,
            'currentStatus' => $status,
        ]);
    }

    /**
     * Approve an email and send verification email
     */
    public function approve(Request $request, int $id): RedirectResponse
    {
        $validated = $request->validate([
            'notes' => 'nullable|string|max:500',
            'mailketing_sender_id' => 'nullable|string|max:255',
        ]);

        $userEmail = UserEmail::findOrFail($id);

        if ($userEmail->status === 'approved') {
            return redirect()->back()
                ->withErrors(['error' => 'Email sudah disetujui sebelumnya.']);
        }

        // Update status
        $userEmail->update([
            'status' => 'approved',
            'approved_by' => auth()->id(),
            'approved_at' => now(),
            'verified_at' => now(),
            'notes' => $validated['notes'] ?? null,
            'mailketing_sender_id' => $validated['mailketing_sender_id'] ?? null,
        ]);

        // Send verification email via Mailketing
        try {
            $this->mailketingService->sendVerificationEmail(
                $userEmail->email,
                $userEmail->user->name
            );

            return redirect()->back()
                ->with('success', 'Email berhasil disetujui dan email verifikasi telah dikirim.');
        } catch (\Exception $e) {
            \Log::error('Failed to send verification email', [
                'email' => $userEmail->email,
                'error' => $e->getMessage(),
            ]);

            return redirect()->back()
                ->with('warning', 'Email disetujui, tetapi gagal mengirim email verifikasi. Error: ' . $e->getMessage());
        }
    }

    /**
     * Reject an email
     */
    public function reject(Request $request, int $id): RedirectResponse
    {
        $validated = $request->validate([
            'rejection_reason' => 'required|string|max:500',
            'notes' => 'nullable|string|max:500',
        ]);

        $userEmail = UserEmail::findOrFail($id);

        if ($userEmail->status === 'approved') {
            return redirect()->back()
                ->withErrors(['error' => 'Email yang sudah disetujui tidak dapat ditolak.']);
        }

        $userEmail->update([
            'status' => 'rejected',
            'approved_by' => auth()->id(),
            'approved_at' => now(),
            'rejection_reason' => $validated['rejection_reason'],
            'notes' => $validated['notes'] ?? null,
        ]);

        return redirect()->back()
            ->with('success', 'Email berhasil ditolak.');
    }

    /**
     * Resend verification email
     */
    public function resendVerification(int $id): RedirectResponse
    {
        $userEmail = UserEmail::findOrFail($id);

        if ($userEmail->status !== 'approved') {
            return redirect()->back()
                ->withErrors(['error' => 'Hanya email yang sudah disetujui yang dapat dikirim ulang.']);
        }

        try {
            $this->mailketingService->sendVerificationEmail(
                $userEmail->email,
                $userEmail->user->name
            );

            return redirect()->back()
                ->with('success', 'Email verifikasi berhasil dikirim ulang.');
        } catch (\Exception $e) {
            \Log::error('Failed to resend verification email', [
                'email' => $userEmail->email,
                'error' => $e->getMessage(),
            ]);

            return redirect()->back()
                ->withErrors(['error' => 'Gagal mengirim email verifikasi. Error: ' . $e->getMessage()]);
        }
    }
}
