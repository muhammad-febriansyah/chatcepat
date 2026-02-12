<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Models\CrmChannel;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;

class CrmChatController extends Controller
{
    public function index()
    {
        $channels = CrmChannel::where('user_id', Auth::id())->get();
        
        // Group by platform
        $whatsappChannel = $channels->where('platform', CrmChannel::PLATFORM_WHATSAPP_CLOUD)->first();
        $instagramChannel = $channels->where('platform', CrmChannel::PLATFORM_INSTAGRAM)->first();
        $messengerChannel = $channels->where('platform', CrmChannel::PLATFORM_MESSENGER)->first();

        return Inertia::render('user/crm-chat/index', [
            'channels' => [
                'whatsapp_cloud' => $whatsappChannel,
                'instagram' => $instagramChannel,
                'messenger' => $messengerChannel,
            ],
        ]);
    }

    public function connectWhatsAppForm()
    {
        $channel = CrmChannel::where('user_id', Auth::id())
            ->where('platform', CrmChannel::PLATFORM_WHATSAPP_CLOUD)
            ->first();

        return Inertia::render('user/crm-chat/connect-whatsapp', [
            'channel' => $channel,
            'webhookUrl' => config('app.url') . '/api/meta/webhook',
            'verifyToken' => config('meta.webhook_verify_token', 'chatcepat-meta-webhook-2026'),
        ]);
    }

    public function storeWhatsApp(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'phone_number_id' => 'required|string|max:255',
            'waba_id' => 'required|string|max:255',
            'access_token' => 'required|string',
            'verify_token' => 'required|string|max:255',
        ]);

        CrmChannel::updateOrCreate(
            [
                'user_id' => Auth::id(),
                'platform' => CrmChannel::PLATFORM_WHATSAPP_CLOUD,
            ],
            [
                'name' => $validated['name'],
                'phone_number' => $validated['phone_number_id'],
                'account_id' => $validated['waba_id'],
                'credentials' => [
                    'phone_number_id' => $validated['phone_number_id'],
                    'waba_id' => $validated['waba_id'],
                    'access_token' => $validated['access_token'],
                    'verify_token' => $validated['verify_token'],
                ],
                'status' => CrmChannel::STATUS_CONNECTED,
            ]
        );

        return redirect()->route('user.crm-chat.index')
            ->with('success', 'WhatsApp Cloud API berhasil dihubungkan!');
    }

    public function connectInstagramForm()
    {
        $channel = CrmChannel::where('user_id', Auth::id())
            ->where('platform', CrmChannel::PLATFORM_INSTAGRAM)
            ->first();

        return Inertia::render('user/crm-chat/connect-instagram', [
            'channel' => $channel,
            'webhookUrl' => config('app.url') . '/api/meta/webhook',
            'verifyToken' => config('meta.webhook_verify_token', 'chatcepat-meta-webhook-2026'),
        ]);
    }

    public function storeInstagram(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'instagram_account_id' => 'required|string|max:255',
            'page_id' => 'required|string|max:255',
            'access_token' => 'required|string',
        ]);

        CrmChannel::updateOrCreate(
            [
                'user_id' => Auth::id(),
                'platform' => CrmChannel::PLATFORM_INSTAGRAM,
            ],
            [
                'name' => $validated['name'],
                'account_id' => $validated['instagram_account_id'],
                'credentials' => [
                    'instagram_account_id' => $validated['instagram_account_id'],
                    'page_id' => $validated['page_id'],
                    'access_token' => $validated['access_token'],
                ],
                'status' => CrmChannel::STATUS_CONNECTED,
            ]
        );

        return redirect()->route('user.crm-chat.index')
            ->with('success', 'Instagram berhasil dihubungkan!');
    }

    public function connectMessengerForm()
    {
        $channel = CrmChannel::where('user_id', Auth::id())
            ->where('platform', CrmChannel::PLATFORM_MESSENGER)
            ->first();

        return Inertia::render('user/crm-chat/connect-messenger', [
            'channel' => $channel,
            'webhookUrl' => config('app.url') . '/api/meta/webhook',
            'verifyToken' => config('meta.webhook_verify_token', 'chatcepat-meta-webhook-2026'),
        ]);
    }

    public function storeMessenger(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'page_id' => 'required|string|max:255',
            'page_access_token' => 'required|string',
            'app_secret' => 'required|string|max:255',
        ]);

        CrmChannel::updateOrCreate(
            [
                'user_id' => Auth::id(),
                'platform' => CrmChannel::PLATFORM_MESSENGER,
            ],
            [
                'name' => $validated['name'],
                'account_id' => $validated['page_id'],
                'credentials' => [
                    'page_id' => $validated['page_id'],
                    'page_access_token' => $validated['page_access_token'],
                    'app_secret' => $validated['app_secret'],
                ],
                'status' => CrmChannel::STATUS_CONNECTED,
            ]
        );

        return redirect()->route('user.crm-chat.index')
            ->with('success', 'Facebook Messenger berhasil dihubungkan!');
    }

    public function disconnect($id)
    {
        $channel = CrmChannel::where('user_id', Auth::id())
            ->findOrFail($id);

        $channel->update([
            'status' => CrmChannel::STATUS_DISCONNECTED,
            'credentials' => null,
        ]);

        return redirect()->route('user.crm-chat.index')
            ->with('success', $channel->getPlatformLabel() . ' berhasil diputuskan!');
    }

    public function validateCredentials(Request $request)
    {
        $request->validate([
            'platform' => 'required|in:whatsapp,instagram,messenger',
            'access_token' => 'required|string',
        ]);

        try {
            if ($request->platform === 'whatsapp') {
                $request->validate(['phone_number_id' => 'required|string']);
                $response = Http::withToken($request->access_token)
                    ->get("https://graph.facebook.com/v21.0/{$request->phone_number_id}");

                if ($response->successful()) {
                    $data = $response->json();
                    return response()->json([
                        'valid' => true,
                        'message' => 'Credentials valid! WhatsApp siap digunakan.',
                        'phone_number' => $data['display_phone_number'] ?? null,
                        'verified_name' => $data['verified_name'] ?? null,
                    ]);
                }
            } elseif ($request->platform === 'instagram') {
                $request->validate(['page_id' => 'required|string']);
                $response = Http::withToken($request->access_token)
                    ->get("https://graph.facebook.com/v21.0/{$request->page_id}", [
                        'fields' => 'id,name,instagram_business_account',
                    ]);

                if ($response->successful()) {
                    $data = $response->json();
                    return response()->json([
                        'valid' => true,
                        'message' => 'Credentials valid! Instagram siap digunakan.',
                        'page_name' => $data['name'] ?? null,
                    ]);
                }
            } elseif ($request->platform === 'messenger') {
                $request->validate(['page_id' => 'required|string']);
                $response = Http::withToken($request->access_token)
                    ->get("https://graph.facebook.com/v21.0/{$request->page_id}", [
                        'fields' => 'id,name',
                    ]);

                if ($response->successful()) {
                    $data = $response->json();
                    return response()->json([
                        'valid' => true,
                        'message' => 'Credentials valid! Messenger siap digunakan.',
                        'page_name' => $data['name'] ?? null,
                    ]);
                }
            }

            return response()->json([
                'valid' => false,
                'message' => 'Credentials tidak valid: ' . $request->getContent(),
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'valid' => false,
                'message' => 'Validasi gagal: ' . $e->getMessage(),
            ], 422);
        }
    }

    public function testConnection(Request $request)
    {
        $request->validate([
            'platform' => 'required|in:whatsapp,instagram,messenger',
            'access_token' => 'required|string',
        ]);

        try {
            if ($request->platform === 'whatsapp') {
                $request->validate(['phone_number_id' => 'required|string']);
                $response = Http::withToken($request->access_token)
                    ->get("https://graph.facebook.com/v21.0/{$request->phone_number_id}");

                if ($response->successful()) {
                    return response()->json([
                        'success' => true,
                        'message' => 'Koneksi berhasil! WhatsApp siap kirim & terima pesan.',
                    ]);
                }
            } elseif ($request->platform === 'instagram') {
                $request->validate(['page_id' => 'required|string']);
                $response = Http::withToken($request->access_token)
                    ->get("https://graph.facebook.com/v21.0/{$request->page_id}", [
                        'fields' => 'id,name,instagram_business_account',
                    ]);

                if ($response->successful()) {
                    return response()->json([
                        'success' => true,
                        'message' => 'Koneksi berhasil! Instagram siap menerima pesan DM.',
                    ]);
                }
            } elseif ($request->platform === 'messenger') {
                $request->validate(['page_id' => 'required|string']);
                $response = Http::withToken($request->access_token)
                    ->get("https://graph.facebook.com/v21.0/{$request->page_id}", [
                        'fields' => 'id,name',
                    ]);

                if ($response->successful()) {
                    return response()->json([
                        'success' => true,
                        'message' => 'Koneksi berhasil! Messenger siap menerima pesan.',
                    ]);
                }
            }

            return response()->json([
                'success' => false,
                'message' => 'Koneksi gagal. Periksa kembali credentials Anda.',
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Test gagal: ' . $e->getMessage(),
            ], 422);
        }
    }

    public function saveConnection(Request $request)
    {
        $request->validate([
            'platform' => 'required|in:whatsapp,instagram,messenger',
            'channel_name' => 'required|string|max:255',
        ]);

        if ($request->platform === 'whatsapp') {
            $request->validate([
                'phone_number_id' => 'required|string',
                'business_account_id' => 'required|string',
                'access_token' => 'required|string',
            ]);

            CrmChannel::updateOrCreate(
                ['user_id' => Auth::id(), 'platform' => CrmChannel::PLATFORM_WHATSAPP_CLOUD],
                [
                    'name' => $request->channel_name,
                    'phone_number' => $request->phone_number_id,
                    'account_id' => $request->business_account_id,
                    'credentials' => [
                        'phone_number_id' => $request->phone_number_id,
                        'waba_id' => $request->business_account_id,
                        'access_token' => $request->access_token,
                        'verify_token' => config('meta.webhook_verify_token'),
                    ],
                    'status' => CrmChannel::STATUS_CONNECTED,
                ]
            );

            return response()->json(['success' => true, 'message' => 'WhatsApp berhasil dihubungkan!']);
        }

        if ($request->platform === 'instagram') {
            $request->validate([
                'instagram_account_id' => 'required|string',
                'page_id' => 'required|string',
                'access_token' => 'required|string',
            ]);

            CrmChannel::updateOrCreate(
                ['user_id' => Auth::id(), 'platform' => CrmChannel::PLATFORM_INSTAGRAM],
                [
                    'name' => $request->channel_name,
                    'account_id' => $request->instagram_account_id,
                    'credentials' => [
                        'instagram_account_id' => $request->instagram_account_id,
                        'page_id' => $request->page_id,
                        'access_token' => $request->access_token,
                        'verify_token' => config('meta.webhook_verify_token'),
                    ],
                    'status' => CrmChannel::STATUS_CONNECTED,
                ]
            );

            return response()->json(['success' => true, 'message' => 'Instagram berhasil dihubungkan!']);
        }

        if ($request->platform === 'messenger') {
            $request->validate([
                'page_id' => 'required|string',
                'access_token' => 'required|string',
                'app_secret' => 'required|string',
            ]);

            CrmChannel::updateOrCreate(
                ['user_id' => Auth::id(), 'platform' => CrmChannel::PLATFORM_MESSENGER],
                [
                    'name' => $request->channel_name,
                    'account_id' => $request->page_id,
                    'credentials' => [
                        'page_id' => $request->page_id,
                        'page_access_token' => $request->access_token,
                        'app_secret' => $request->app_secret,
                        'verify_token' => config('meta.webhook_verify_token'),
                    ],
                    'status' => CrmChannel::STATUS_CONNECTED,
                ]
            );

            return response()->json(['success' => true, 'message' => 'Facebook Messenger berhasil dihubungkan!']);
        }
    }
}
