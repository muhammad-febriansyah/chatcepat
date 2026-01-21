<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Models\CrmChannel;
use Illuminate\Http\Request;
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
}
