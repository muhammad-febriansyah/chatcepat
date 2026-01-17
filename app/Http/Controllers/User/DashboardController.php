<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Models\WhatsappSession;
use App\Models\WhatsappMessage;
use App\Models\GoogleMapPlace;
use App\Models\Contact;
use App\Models\MessageTemplate;
use App\Models\SmtpSetting;
use App\Models\EmailBroadcast;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    /**
     * Display the user dashboard.
     */
    public function index(): Response
    {
        $user = auth()->user();
        $userId = auth()->id();

        // Load business category relationship
        $user->load('businessCategory');

        // Get WhatsApp statistics
        $whatsappSessions = WhatsappSession::where('user_id', $userId)->get();
        $connectedSessions = $whatsappSessions->where('status', 'connected')->count();
        $totalMessages = WhatsappMessage::whereIn('whatsapp_session_id', $whatsappSessions->pluck('id'))->count();

        // Get Scraping statistics
        $totalScrapedPlaces = GoogleMapPlace::where('user_id', $userId)->count();
        $recentPlaces = GoogleMapPlace::where('user_id', $userId)
            ->latest()
            ->limit(5)
            ->get();

        // Get recent WhatsApp sessions
        $recentSessions = WhatsappSession::where('user_id', $userId)
            ->withCount('messages')
            ->latest()
            ->limit(5)
            ->get();

        // Get Contacts statistics
        $totalContacts = Contact::where('user_id', $userId)->count();

        // Get Templates statistics
        $totalTemplates = MessageTemplate::where('user_id', $userId)->count();
        $whatsappTemplates = MessageTemplate::where('user_id', $userId)->where('type', 'whatsapp')->count();
        $emailTemplates = MessageTemplate::where('user_id', $userId)->where('type', 'email')->count();

        // Get SMTP statistics
        $totalSmtp = SmtpSetting::where('user_id', $userId)->count();
        $activeSmtp = SmtpSetting::where('user_id', $userId)->where('is_active', true)->first();
        $verifiedSmtp = SmtpSetting::where('user_id', $userId)->where('is_verified', true)->count();

        // Get Email Broadcast statistics
        $totalBroadcasts = EmailBroadcast::where('user_id', $userId)->count();
        $completedBroadcasts = EmailBroadcast::where('user_id', $userId)->where('status', 'completed')->count();
        $recentBroadcasts = EmailBroadcast::where('user_id', $userId)
            ->with('smtpSetting')
            ->latest()
            ->limit(5)
            ->get();

        return Inertia::render('user/dashboard', [
            'user' => [
                'name' => $user->name,
                'email' => $user->email,
                'phone' => $user->phone,
                'nama_bisnis' => $user->nama_bisnis,
                'kategori_bisnis' => $user->businessCategory?->name ?? $user->kategori_bisnis,
                'address' => $user->address,
            ],
            'stats' => [
                'whatsapp' => [
                    'total_sessions' => $whatsappSessions->count(),
                    'connected_sessions' => $connectedSessions,
                    'total_messages' => $totalMessages,
                ],
                'scraping' => [
                    'total_places' => $totalScrapedPlaces,
                ],
                'contacts' => [
                    'total' => $totalContacts,
                ],
                'templates' => [
                    'total' => $totalTemplates,
                    'whatsapp' => $whatsappTemplates,
                    'email' => $emailTemplates,
                ],
                'smtp' => [
                    'total' => $totalSmtp,
                    'verified' => $verifiedSmtp,
                    'has_active' => $activeSmtp !== null,
                ],
                'email_broadcast' => [
                    'total' => $totalBroadcasts,
                    'completed' => $completedBroadcasts,
                ],
            ],
            'recentSessions' => $recentSessions,
            'recentPlaces' => $recentPlaces,
            'recentBroadcasts' => $recentBroadcasts,
        ]);
    }
}
