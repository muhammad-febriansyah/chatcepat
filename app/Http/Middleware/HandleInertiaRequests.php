<?php

namespace App\Http\Middleware;

use App\Models\Setting;
use App\Models\Transaction;
use Illuminate\Foundation\Inspiring;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        [$message, $author] = str(Inspiring::quotes()->random())->explode('-');

        return [
            ...parent::share($request),
            'name' => config('app.name'),
            'quote' => ['message' => trim($message), 'author' => trim($author)],
            'auth' => [
                'user' => $request->user() ? [
                    'id' => $request->user()->id,
                    'name' => $request->user()->name,
                    'email' => $request->user()->email,
                    'role' => $request->user()->role,
                    'avatar' => $request->user()->avatar ? Storage::url($request->user()->avatar) : null,
                    'subscription' => $request->user()->getSubscriptionInfo(),
                ] : null,
            ],
            'notifications' => $this->getNotifications($request),
            'sidebarOpen' => ! $request->hasCookie('sidebar_state') || $request->cookie('sidebar_state') === 'true',
            'flash' => [
                'success' => $request->session()->get('success'),
                'error' => $request->session()->get('error'),
            ],
            'settings' => [
                'site_name' => Setting::get('site_name', config('app.name')),
                'site_description' => Setting::get('site_description'),
                'logo' => Setting::get('logo'),
                'favicon' => Setting::get('favicon'),
                'facebook_url' => Setting::get('facebook_url'),
                'twitter_url' => Setting::get('twitter_url'),
                'instagram_url' => Setting::get('instagram_url'),
                'linkedin_url' => Setting::get('linkedin_url'),
                'tiktok_url' => Setting::get('tiktok_url'),
                'contact_email' => Setting::get('contact_email'),
                'contact_phone' => Setting::get('contact_phone'),
                'address' => Setting::get('address'),
                'google_maps_embed' => Setting::get('google_maps_embed'),
                'contact_help_image' => Setting::get('contact_help_image'),
                'hero_image' => Setting::get('hero_image'),
                'hero_badge' => Setting::get('hero_badge'),
                'hero_heading' => Setting::get('hero_heading'),
                'hero_description' => Setting::get('hero_description'),
                'hero_stat_1_value' => Setting::get('hero_stat_1_value'),
                'hero_stat_1_label' => Setting::get('hero_stat_1_label'),
                'hero_stat_2_value' => Setting::get('hero_stat_2_value'),
                'hero_stat_2_label' => Setting::get('hero_stat_2_label'),
                'hero_stat_3_value' => Setting::get('hero_stat_3_value'),
                'hero_stat_3_label' => Setting::get('hero_stat_3_label'),
                'features_section_title' => Setting::get('features_section_title'),
                'features_section_subtitle' => Setting::get('features_section_subtitle'),
                'feature_1_icon' => Setting::get('feature_1_icon'),
                'feature_1_title' => Setting::get('feature_1_title'),
                'feature_1_description' => Setting::get('feature_1_description'),
                'feature_2_icon' => Setting::get('feature_2_icon'),
                'feature_2_title' => Setting::get('feature_2_title'),
                'feature_2_description' => Setting::get('feature_2_description'),
                'feature_3_icon' => Setting::get('feature_3_icon'),
                'feature_3_title' => Setting::get('feature_3_title'),
                'feature_3_description' => Setting::get('feature_3_description'),
                'feature_4_icon' => Setting::get('feature_4_icon'),
                'feature_4_title' => Setting::get('feature_4_title'),
                'feature_4_description' => Setting::get('feature_4_description'),
                'feature_5_icon' => Setting::get('feature_5_icon'),
                'feature_5_title' => Setting::get('feature_5_title'),
                'feature_5_description' => Setting::get('feature_5_description'),
                'feature_6_icon' => Setting::get('feature_6_icon'),
                'feature_6_title' => Setting::get('feature_6_title'),
                'feature_6_description' => Setting::get('feature_6_description'),
                'features_heading' => Setting::get('features_heading'),
                'features_heading_highlight' => Setting::get('features_heading_highlight'),
                'features_description' => Setting::get('features_description'),
                'why_choose_heading' => Setting::get('why_choose_heading'),
                'why_choose_subheading' => Setting::get('why_choose_subheading'),
                'why_choose_image' => Setting::get('why_choose_image'),
                'why_choose_features' => json_decode(Setting::get('why_choose_features') ?: '[]', true),
                'faq_heading' => Setting::get('faq_heading'),
                'faq_description' => Setting::get('faq_description'),
            ],
        ];
    }

    /**
     * Get notifications (recent transactions) for the user
     */
    private function getNotifications(Request $request): array
    {
        $user = $request->user();

        if (!$user) {
            return [];
        }

        // Payment method labels
        $paymentMethods = [
            'BC' => 'BCA VA',
            'M1' => 'Mandiri VA',
            'M2' => 'Mandiri VA',
            'VA' => 'Maybank VA',
            'I1' => 'BNI VA',
            'B1' => 'CIMB Niaga VA',
            'BT' => 'Permata VA',
            'BR' => 'BRIVA',
            'OV' => 'OVO',
            'SA' => 'ShopeePay',
            'DA' => 'DANA',
            'NQ' => 'QRIS',
            'manual' => 'Transfer Manual',
        ];

        // For regular users, show their own transactions
        if ($user->role === 'user') {
            $transactions = Transaction::where('user_id', $user->id)
                ->with('pricingPackage:id,name')
                ->latest()
                ->take(5)
                ->get();

            return $transactions->map(function ($tx) use ($paymentMethods) {
                $statusLabels = [
                    'pending' => 'Menunggu Pembayaran',
                    'paid' => 'Pembayaran Berhasil',
                    'failed' => 'Pembayaran Gagal',
                    'expired' => 'Pembayaran Kedaluwarsa',
                ];

                $statusIcons = [
                    'pending' => 'clock',
                    'paid' => 'check-circle',
                    'failed' => 'x-circle',
                    'expired' => 'x-circle',
                ];

                $statusColors = [
                    'pending' => 'yellow',
                    'paid' => 'green',
                    'failed' => 'red',
                    'expired' => 'gray',
                ];

                return [
                    'id' => $tx->id,
                    'type' => 'transaction',
                    'title' => $statusLabels[$tx->status] ?? 'Transaksi',
                    'message' => ($tx->pricingPackage?->name ?? 'Paket') . ' - Rp ' . number_format($tx->amount, 0, ',', '.'),
                    'status' => $tx->status,
                    'icon' => $statusIcons[$tx->status] ?? 'receipt',
                    'color' => $statusColors[$tx->status] ?? 'gray',
                    'payment_method' => $paymentMethods[$tx->payment_method] ?? $tx->payment_method,
                    'time' => $tx->created_at->diffForHumans(),
                    'url' => '/user/transactions/' . $tx->id,
                ];
            })->toArray();
        }

        // For admin, show all recent transactions
        if ($user->role === 'admin') {
            $transactions = Transaction::with(['user:id,name', 'pricingPackage:id,name'])
                ->latest()
                ->take(5)
                ->get();

            return $transactions->map(function ($tx) use ($paymentMethods) {
                $statusLabels = [
                    'pending' => 'Transaksi Pending',
                    'paid' => 'Pembayaran Diterima',
                    'failed' => 'Pembayaran Gagal',
                    'expired' => 'Transaksi Expired',
                ];

                $statusColors = [
                    'pending' => 'yellow',
                    'paid' => 'green',
                    'failed' => 'red',
                    'expired' => 'gray',
                ];

                return [
                    'id' => $tx->id,
                    'type' => 'transaction',
                    'title' => $statusLabels[$tx->status] ?? 'Transaksi',
                    'message' => ($tx->user?->name ?? 'User') . ' - ' . ($tx->pricingPackage?->name ?? 'Paket'),
                    'amount' => 'Rp ' . number_format($tx->amount, 0, ',', '.'),
                    'status' => $tx->status,
                    'color' => $statusColors[$tx->status] ?? 'gray',
                    'payment_method' => $paymentMethods[$tx->payment_method] ?? $tx->payment_method,
                    'time' => $tx->created_at->diffForHumans(),
                    'url' => '/admin/transactions/' . $tx->id,
                ];
            })->toArray();
        }

        return [];
    }
}
