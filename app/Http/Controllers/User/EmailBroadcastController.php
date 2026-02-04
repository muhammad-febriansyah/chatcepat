<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Models\EmailBroadcast;
use App\Models\MessageTemplate;
use App\Models\SmtpSetting;
use App\Models\UserEmail;
use App\Jobs\SendBroadcastEmail;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class EmailBroadcastController extends Controller
{
    /**
     * Display email broadcast form
     */
    public function index()
    {
        $userId = Auth::id();

        // Get user's verified emails (Mailketing identities)
        $verifiedEmails = UserEmail::where('user_id', $userId)
            ->approved()
            ->orderBy('created_at', 'desc')
            ->get();

        // Get all user's verified SMTP settings
        $smtpSettings = SmtpSetting::where('user_id', $userId)
            ->verified()
            ->get();

        // Get email templates
        $emailTemplates = MessageTemplate::where('user_id', $userId)
            ->email()
            ->where('is_active', true)
            ->orderBy('created_at', 'desc')
            ->get();

        return Inertia::render('user/email-broadcast/index', [
            'verifiedEmails' => $verifiedEmails,
            'smtpSettings' => $smtpSettings,
            'emailTemplates' => $emailTemplates,
        ]);
    }

    /**
     * Send broadcast email
     */
    public function send(Request $request)
    {
        $validated = $request->validate([
            'sender_type' => 'required|in:mailketing,smtp',
            'user_email_id' => 'required_if:sender_type,mailketing|exists:user_emails,id',
            'smtp_setting_id' => 'required_if:sender_type,smtp|exists:smtp_settings,id',
            'template_id' => 'nullable|exists:message_templates,id',
            'subject' => 'required|string|max:255',
            'content' => 'required|string',
            'recipient_emails' => 'required|array|min:1',
            'recipient_emails.*' => 'required|email',
        ]);

        $userId = Auth::id();

        // Verify sender belongs to user
        if ($validated['sender_type'] === 'mailketing') {
            $sender = UserEmail::where('id', $validated['user_email_id'])
                ->where('user_id', $userId)
                ->approved()
                ->firstOrFail();
            $smtpId = null;
            $userEmailId = $sender->id;
        } else {
            $sender = SmtpSetting::where('id', $validated['smtp_setting_id'])
                ->where('user_id', $userId)
                ->verified()
                ->firstOrFail();
            $smtpId = $sender->id;
            $userEmailId = null;
        }

        // Create broadcast record
        $broadcast = EmailBroadcast::create([
            'user_id' => $userId,
            'smtp_setting_id' => $smtpId,
            'user_email_id' => $userEmailId,
            'message_template_id' => $validated['template_id'] ?? null,
            'subject' => $validated['subject'],
            'content' => $validated['content'],
            'total_recipients' => count($validated['recipient_emails']),
            'recipient_emails' => $validated['recipient_emails'],
            'status' => 'pending',
        ]);

        // Dispatch job to send emails
        SendBroadcastEmail::dispatch($broadcast);

        return redirect()->route('user.email-broadcast.history')
            ->with('success', 'Broadcast email sedang diproses. Anda dapat melihat statusnya di halaman history.');
    }

    /**
     * Display broadcast history
     */
    public function history(Request $request)
    {
        $userId = Auth::id();
        $query = EmailBroadcast::where('user_id', $userId)
            ->with(['smtpSetting', 'userEmail', 'template'])
            ->orderBy('created_at', 'desc');

        // Filter by status if provided
        if ($request->has('status')) {
            $query->where('status', $request->get('status'));
        }

        $broadcasts = $query->paginate(15);

        // Statistics
        $stats = [
            'total' => EmailBroadcast::where('user_id', $userId)->count(),
            'pending' => EmailBroadcast::where('user_id', $userId)->byStatus('pending')->count(),
            'processing' => EmailBroadcast::where('user_id', $userId)->byStatus('processing')->count(),
            'completed' => EmailBroadcast::where('user_id', $userId)->byStatus('completed')->count(),
            'failed' => EmailBroadcast::where('user_id', $userId)->byStatus('failed')->count(),
        ];

        return Inertia::render('user/email-broadcast/history', [
            'broadcasts' => $broadcasts,
            'stats' => $stats,
            'currentStatus' => $request->get('status'),
        ]);
    }

    /**
     * Show broadcast detail
     */
    public function show(EmailBroadcast $broadcast)
    {
        // Ensure user owns this broadcast
        if ($broadcast->user_id !== Auth::id()) {
            abort(403);
        }

        $broadcast->load(['smtpSetting', 'userEmail', 'template']);

        return Inertia::render('user/email-broadcast/show', [
            'broadcast' => $broadcast,
        ]);
    }
}
