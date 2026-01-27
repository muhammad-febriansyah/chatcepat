<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Services\Meta\WhatsAppBusinessService;
use App\Services\Meta\InstagramMessagingService;
use App\Services\Meta\FacebookMessengerService;
use App\Models\MetaWhatsappMessage;
use App\Models\MetaInstagramMessage;
use App\Models\MetaFacebookMessage;
use Inertia\Inertia;
use Inertia\Response;

class MetaMessagingController extends Controller
{
    /**
     * Show Meta messaging dashboard
     */
    public function index(): Response
    {
        $user = auth()->user();

        $stats = [
            'whatsapp' => [
                'total' => MetaWhatsappMessage::where('user_id', $user->id)->count(),
                'sent' => MetaWhatsappMessage::where('user_id', $user->id)
                    ->where('direction', 'outbound')->count(),
                'received' => MetaWhatsappMessage::where('user_id', $user->id)
                    ->where('direction', 'inbound')->count(),
            ],
            'instagram' => [
                'total' => MetaInstagramMessage::where('user_id', $user->id)->count(),
                'sent' => MetaInstagramMessage::where('user_id', $user->id)
                    ->where('direction', 'outbound')->count(),
                'received' => MetaInstagramMessage::where('user_id', $user->id)
                    ->where('direction', 'inbound')->count(),
            ],
            'facebook' => [
                'total' => MetaFacebookMessage::where('user_id', $user->id)->count(),
                'sent' => MetaFacebookMessage::where('user_id', $user->id)
                    ->where('direction', 'outbound')->count(),
                'received' => MetaFacebookMessage::where('user_id', $user->id)
                    ->where('direction', 'inbound')->count(),
            ],
        ];

        $recentMessages = [
            'whatsapp' => MetaWhatsappMessage::where('user_id', $user->id)
                ->latest()
                ->limit(10)
                ->get(),
            'instagram' => MetaInstagramMessage::where('user_id', $user->id)
                ->latest()
                ->limit(10)
                ->get(),
            'facebook' => MetaFacebookMessage::where('user_id', $user->id)
                ->latest()
                ->limit(10)
                ->get(),
        ];

        return Inertia::render('user/meta/messages/index', [
            'stats' => $stats,
            'recentMessages' => $recentMessages,
            'hasWhatsAppConfigured' => !empty($user->meta_whatsapp_phone_number_id),
            'hasInstagramConfigured' => !empty($user->meta_instagram_account_id),
            'hasFacebookConfigured' => !empty($user->meta_facebook_page_id),
        ]);
    }

    /**
     * Show Facebook Messenger page
     */
    public function messengerIndex(): Response
    {
        $user = auth()->user();

        $stats = [
            'total' => MetaFacebookMessage::where('user_id', $user->id)->count(),
            'sent' => MetaFacebookMessage::where('user_id', $user->id)
                ->where('direction', 'outbound')->count(),
            'received' => MetaFacebookMessage::where('user_id', $user->id)
                ->where('direction', 'inbound')->count(),
        ];

        $recentMessages = MetaFacebookMessage::where('user_id', $user->id)
            ->latest()
            ->limit(10)
            ->get();

        return Inertia::render('user/meta/messenger/index', [
            'stats' => $stats,
            'recentMessages' => $recentMessages,
            'hasFacebookConfigured' => !empty($user->meta_facebook_page_id),
        ]);
    }

    /**
     * Show Instagram DM page
     */
    public function instagramIndex(): Response
    {
        $user = auth()->user();

        $stats = [
            'total' => MetaInstagramMessage::where('user_id', $user->id)->count(),
            'sent' => MetaInstagramMessage::where('user_id', $user->id)
                ->where('direction', 'outbound')->count(),
            'received' => MetaInstagramMessage::where('user_id', $user->id)
                ->where('direction', 'inbound')->count(),
        ];

        $recentMessages = MetaInstagramMessage::where('user_id', $user->id)
            ->latest()
            ->limit(10)
            ->get();

        return Inertia::render('user/meta/instagram/index', [
            'stats' => $stats,
            'recentMessages' => $recentMessages,
            'hasInstagramConfigured' => !empty($user->meta_instagram_account_id),
        ]);
    }

    /**
     * Send WhatsApp message
     */
    public function sendWhatsApp(Request $request): JsonResponse
    {
        $request->validate([
            'to' => 'required|string',
            'type' => 'required|in:text,image,video,audio,document,template',
            'message' => 'required_if:type,text|string',
            'media_url' => 'required_if:type,image,video,audio,document|url',
            'caption' => 'nullable|string',
            'template_name' => 'required_if:type,template|string',
            'template_components' => 'nullable|array',
        ]);

        $service = new WhatsAppBusinessService();
        $userId = auth()->id();

        try {
            $response = match ($request->type) {
                'text' => $service->sendTextMessage(
                    $request->to,
                    $request->message,
                    $userId
                ),
                'template' => $service->sendTemplateMessage(
                    $request->to,
                    $request->template_name,
                    $request->template_components ?? [],
                    $userId
                ),
                default => $service->sendMediaMessage(
                    $request->to,
                    $request->type,
                    $request->media_url,
                    $request->caption,
                    $userId
                ),
            };

            if ($response['success']) {
                return response()->json([
                    'success' => true,
                    'message' => 'WhatsApp message sent successfully',
                    'data' => $response
                ]);
            }

            return response()->json([
                'success' => false,
                'message' => $response['error'] ?? 'Failed to send message'
            ], 422);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Send Instagram message
     */
    public function sendInstagram(Request $request): JsonResponse
    {
        $request->validate([
            'recipient_id' => 'required|string',
            'type' => 'required|in:text,image,video,audio,template',
            'message' => 'required_if:type,text|string',
            'media_url' => 'required_if:type,image,video,audio|url',
            'template_elements' => 'nullable|array',
        ]);

        $service = new InstagramMessagingService();
        $userId = auth()->id();

        try {
            $response = match ($request->type) {
                'text' => $service->sendTextMessage(
                    $request->recipient_id,
                    $request->message,
                    $userId
                ),
                'template' => $service->sendGenericTemplate(
                    $request->recipient_id,
                    $request->template_elements ?? [],
                    $userId
                ),
                default => $service->sendMediaMessage(
                    $request->recipient_id,
                    $request->type,
                    $request->media_url,
                    $userId
                ),
            };

            if ($response['success']) {
                return response()->json([
                    'success' => true,
                    'message' => 'Instagram message sent successfully',
                    'data' => $response
                ]);
            }

            return response()->json([
                'success' => false,
                'message' => $response['error'] ?? 'Failed to send message'
            ], 422);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Send Facebook Messenger message
     */
    public function sendFacebook(Request $request): JsonResponse
    {
        $request->validate([
            'recipient_id' => 'required|string',
            'type' => 'required|in:text,attachment,quick_reply,button_template',
            'message' => 'required_if:type,text|string',
            'attachment_type' => 'required_if:type,attachment|in:image,video,audio,file',
            'attachment_url' => 'required_if:type,attachment|url',
            'quick_replies' => 'required_if:type,quick_reply|array',
            'buttons' => 'required_if:type,button_template|array',
        ]);

        $service = new FacebookMessengerService();
        $userId = auth()->id();

        try {
            $response = match ($request->type) {
                'text' => $service->sendTextMessage(
                    $request->recipient_id,
                    $request->message,
                    $userId
                ),
                'attachment' => $service->sendAttachment(
                    $request->recipient_id,
                    $request->attachment_type,
                    $request->attachment_url,
                    $userId
                ),
                'quick_reply' => $service->sendQuickReplies(
                    $request->recipient_id,
                    $request->message,
                    $request->quick_replies,
                    $userId
                ),
                'button_template' => $service->sendButtonTemplate(
                    $request->recipient_id,
                    $request->message,
                    $request->buttons,
                    $userId
                ),
            };

            if ($response['success']) {
                return response()->json([
                    'success' => true,
                    'message' => 'Facebook message sent successfully',
                    'data' => $response
                ]);
            }

            return response()->json([
                'success' => false,
                'message' => $response['error'] ?? 'Failed to send message'
            ], 422);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get WhatsApp messages
     */
    public function getWhatsAppMessages(Request $request): JsonResponse
    {
        $messages = MetaWhatsappMessage::where('user_id', auth()->id())
            ->when($request->phone_number, function ($query, $phone) {
                return $query->where(function ($q) use ($phone) {
                    $q->where('from', $phone)->orWhere('to', $phone);
                });
            })
            ->orderBy('created_at', 'desc')
            ->paginate($request->per_page ?? 20);

        return response()->json($messages);
    }

    /**
     * Get Instagram messages
     */
    public function getInstagramMessages(Request $request): JsonResponse
    {
        $messages = MetaInstagramMessage::where('user_id', auth()->id())
            ->when($request->user_id, function ($query, $userId) {
                return $query->where(function ($q) use ($userId) {
                    $q->where('from', $userId)->orWhere('to', $userId);
                });
            })
            ->orderBy('created_at', 'desc')
            ->paginate($request->per_page ?? 20);

        return response()->json($messages);
    }

    /**
     * Get Facebook messages
     */
    public function getFacebookMessages(Request $request): JsonResponse
    {
        $messages = MetaFacebookMessage::where('user_id', auth()->id())
            ->when($request->psid, function ($query, $psid) {
                return $query->where(function ($q) use ($psid) {
                    $q->where('from', $psid)->orWhere('to', $psid);
                });
            })
            ->orderBy('created_at', 'desc')
            ->paginate($request->per_page ?? 20);

        return response()->json($messages);
    }
}
