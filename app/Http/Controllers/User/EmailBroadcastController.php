<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Models\EmailBroadcast;
use App\Models\MessageTemplate;
use App\Models\SmtpSetting;
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
        // Get user's active SMTP
        $activeSmtp = SmtpSetting::where('user_id', Auth::id())
            ->active()
            ->verified()
            ->first();

        // Get all user's SMTP settings
        $smtpSettings = SmtpSetting::where('user_id', Auth::id())
            ->verified()
            ->get();

        // Get email templates
        $emailTemplates = MessageTemplate::where('user_id', Auth::id())
            ->email()
            ->where('is_active', true)
            ->orderBy('created_at', 'desc')
            ->get();

        return Inertia::render('user/email-broadcast/index', [
            'activeSmtp' => $activeSmtp,
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
            'smtp_setting_id' => 'required|exists:smtp_settings,id',
            'template_id' => 'nullable|exists:message_templates,id',
            'subject' => 'required|string|max:255',
            'content' => 'required|string',
            'recipient_emails' => 'required|array|min:1',
            'recipient_emails.*' => 'required|email',
        ]);

        // Verify SMTP belongs to user
        $smtpSetting = SmtpSetting::where('id', $validated['smtp_setting_id'])
            ->where('user_id', Auth::id())
            ->verified()
            ->firstOrFail();

        // Create broadcast record
        $broadcast = EmailBroadcast::create([
            'user_id' => Auth::id(),
            'smtp_setting_id' => $smtpSetting->id,
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
        $query = EmailBroadcast::where('user_id', Auth::id())
            ->with(['smtpSetting', 'template'])
            ->orderBy('created_at', 'desc');

        // Filter by status if provided
        if ($request->has('status')) {
            $query->where('status', $request->get('status'));
        }

        $broadcasts = $query->paginate(15);

        // Statistics
        $stats = [
            'total' => EmailBroadcast::where('user_id', Auth::id())->count(),
            'pending' => EmailBroadcast::where('user_id', Auth::id())->byStatus('pending')->count(),
            'processing' => EmailBroadcast::where('user_id', Auth::id())->byStatus('processing')->count(),
            'completed' => EmailBroadcast::where('user_id', Auth::id())->byStatus('completed')->count(),
            'failed' => EmailBroadcast::where('user_id', Auth::id())->byStatus('failed')->count(),
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

        $broadcast->load(['smtpSetting', 'template']);

        return Inertia::render('user/email-broadcast/show', [
            'broadcast' => $broadcast,
        ]);
    }
}
