<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Crypt;
use Inertia\Inertia;
use Inertia\Response;

class MetaSettingsController extends Controller
{
    /**
     * Show Meta integration settings
     */
    public function index(): Response
    {
        $user = auth()->user();

        // Decrypt sensitive data for display (partially masked)
        $settings = [
            'whatsapp' => [
                'phone_number_id' => $user->meta_whatsapp_phone_number_id,
                'business_account_id' => $user->meta_whatsapp_business_account_id,
                'configured' => !empty($user->meta_whatsapp_phone_number_id),
            ],
            'instagram' => [
                'account_id' => $user->meta_instagram_account_id,
                'configured' => !empty($user->meta_instagram_account_id),
            ],
            'facebook' => [
                'page_id' => $user->meta_facebook_page_id,
                'page_access_token_masked' => $user->meta_facebook_page_access_token
                    ? '••••••••' . substr($user->meta_facebook_page_access_token, -8)
                    : null,
                'configured' => !empty($user->meta_facebook_page_id),
            ],
            'access_token_masked' => $user->meta_access_token
                ? '••••••••' . substr($user->meta_access_token, -8)
                : null,
        ];

        return Inertia::render('user/meta/settings/index', [
            'settings' => $settings,
        ]);
    }

    /**
     * Update WhatsApp settings
     */
    public function updateWhatsApp(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'phone_number_id' => 'required|string',
            'business_account_id' => 'required|string',
            'access_token' => 'nullable|string',
        ]);

        $user = auth()->user();

        $user->update([
            'meta_whatsapp_phone_number_id' => $validated['phone_number_id'],
            'meta_whatsapp_business_account_id' => $validated['business_account_id'],
        ]);

        // Update access token if provided
        if (!empty($validated['access_token'])) {
            $user->update([
                'meta_access_token' => $validated['access_token'],
            ]);
        }

        return back()->with('success', 'WhatsApp settings updated successfully');
    }

    /**
     * Update Instagram settings
     */
    public function updateInstagram(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'account_id' => 'required|string',
            'access_token' => 'nullable|string',
        ]);

        $user = auth()->user();

        $user->update([
            'meta_instagram_account_id' => $validated['account_id'],
        ]);

        // Update access token if provided
        if (!empty($validated['access_token'])) {
            $user->update([
                'meta_access_token' => $validated['access_token'],
            ]);
        }

        return back()->with('success', 'Instagram settings updated successfully');
    }

    /**
     * Update Facebook settings
     */
    public function updateFacebook(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'page_id' => 'required|string',
            'page_access_token' => 'required|string',
        ]);

        $user = auth()->user();

        $user->update([
            'meta_facebook_page_id' => $validated['page_id'],
            'meta_facebook_page_access_token' => $validated['page_access_token'],
        ]);

        return back()->with('success', 'Facebook settings updated successfully');
    }

    /**
     * Test connection for a platform
     */
    public function testConnection(Request $request)
    {
        $request->validate([
            'platform' => 'required|in:whatsapp,instagram,facebook',
        ]);

        $user = auth()->user();

        try {
            $result = match ($request->platform) {
                'whatsapp' => $this->testWhatsAppConnection($user),
                'instagram' => $this->testInstagramConnection($user),
                'facebook' => $this->testFacebookConnection($user),
            };

            return response()->json([
                'success' => $result['success'],
                'message' => $result['message'],
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Connection test failed: ' . $e->getMessage(),
            ], 422);
        }
    }

    /**
     * Test WhatsApp connection
     */
    protected function testWhatsAppConnection(User $user): array
    {
        if (empty($user->meta_whatsapp_phone_number_id)) {
            return ['success' => false, 'message' => 'WhatsApp not configured'];
        }

        $service = new \App\Services\Meta\WhatsAppBusinessService();

        // Try to get phone number info
        $url = config('meta.whatsapp.base_url') . '/' . config('meta.whatsapp.api_version') . '/' . $user->meta_whatsapp_phone_number_id;

        $response = \Illuminate\Support\Facades\Http::withToken($user->meta_access_token ?? config('meta.access_token'))
            ->get($url);

        if ($response->successful()) {
            return ['success' => true, 'message' => 'WhatsApp connection successful'];
        }

        return ['success' => false, 'message' => 'WhatsApp connection failed: ' . $response->json('error.message', 'Unknown error')];
    }

    /**
     * Test Instagram connection
     */
    protected function testInstagramConnection(User $user): array
    {
        if (empty($user->meta_instagram_account_id)) {
            return ['success' => false, 'message' => 'Instagram not configured'];
        }

        $url = config('meta.instagram.base_url') . '/' . config('meta.instagram.api_version') . '/' . $user->meta_instagram_account_id;

        $response = \Illuminate\Support\Facades\Http::withToken($user->meta_access_token ?? config('meta.access_token'))
            ->get($url);

        if ($response->successful()) {
            return ['success' => true, 'message' => 'Instagram connection successful'];
        }

        return ['success' => false, 'message' => 'Instagram connection failed: ' . $response->json('error.message', 'Unknown error')];
    }

    /**
     * Test Facebook connection
     */
    protected function testFacebookConnection(User $user): array
    {
        if (empty($user->meta_facebook_page_id)) {
            return ['success' => false, 'message' => 'Facebook not configured'];
        }

        $url = config('meta.facebook.base_url') . '/' . config('meta.facebook.api_version') . '/' . $user->meta_facebook_page_id;

        $response = \Illuminate\Support\Facades\Http::withToken($user->meta_facebook_page_access_token)
            ->get($url);

        if ($response->successful()) {
            return ['success' => true, 'message' => 'Facebook connection successful'];
        }

        return ['success' => false, 'message' => 'Facebook connection failed: ' . $response->json('error.message', 'Unknown error')];
    }

    /**
     * Disconnect a platform
     */
    public function disconnect(Request $request): RedirectResponse
    {
        $request->validate([
            'platform' => 'required|in:whatsapp,instagram,facebook',
        ]);

        $user = auth()->user();

        match ($request->platform) {
            'whatsapp' => $user->update([
                'meta_whatsapp_phone_number_id' => null,
                'meta_whatsapp_business_account_id' => null,
            ]),
            'instagram' => $user->update([
                'meta_instagram_account_id' => null,
            ]),
            'facebook' => $user->update([
                'meta_facebook_page_id' => null,
                'meta_facebook_page_access_token' => null,
            ]),
        };

        return back()->with('success', ucfirst($request->platform) . ' disconnected successfully');
    }
}
