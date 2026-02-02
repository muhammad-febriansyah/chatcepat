<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Support\Facades\Http;
use App\Services\MailketingService;
use Illuminate\Support\Facades\Log;

class SettingController extends Controller
{
    /**
     * Display the settings form
     */
    public function index(): Response
    {
        $settings = Setting::getAll();

        return Inertia::render('admin/settings/index', [
            'settings' => $settings,
        ]);
    }

    /**
     * Update the settings
     */
    public function update(Request $request)
    {
        $validated = $request->validate([
            'site_name' => 'required|string|max:255',
            'site_description' => 'nullable|string',
            'contact_email' => 'required|email',
            'contact_phone' => 'nullable|string|max:50',
            'address' => 'nullable|string',
            'google_maps_embed' => 'nullable|string',
            'contact_help_image' => 'nullable|image|mimes:png,jpg,jpeg,svg,webp|max:3072',
            'facebook_url' => 'nullable|url',
            'twitter_url' => 'nullable|url',
            'instagram_url' => 'nullable|url',
            'linkedin_url' => 'nullable|url',
            'tiktok_url' => 'nullable|url',
            'meta_keywords' => 'nullable|string',
            'meta_description' => 'nullable|string',
            'logo' => 'nullable|image|mimes:png,jpg,jpeg,svg|max:2048',
            'favicon' => 'nullable|image|mimes:png,jpg,jpeg,ico|max:1024',
            'auth_logo' => 'nullable|image|mimes:png,jpg,jpeg,svg|max:2048',
            'auth_logo_name' => 'nullable|string|max:255',
            'auth_tagline' => 'nullable|string|max:255',
            'auth_heading' => 'nullable|string|max:255',
            'auth_description' => 'nullable|string',
            'auth_features' => 'nullable|string',
            'auth_copyright' => 'nullable|string|max:255',
            'auth_hero_image' => 'nullable|image|mimes:png,jpg,jpeg,svg|max:5120',
            'hero_image' => 'nullable|image|mimes:png,jpg,jpeg,svg,webp|max:5120',
            'hero_badge' => 'nullable|string|max:255',
            'hero_heading' => 'nullable|string|max:500',
            'hero_description' => 'nullable|string',
            'hero_stat_1_value' => 'nullable|string|max:50',
            'hero_stat_1_label' => 'nullable|string|max:100',
            'hero_stat_2_value' => 'nullable|string|max:50',
            'hero_stat_2_label' => 'nullable|string|max:100',
            'hero_stat_3_value' => 'nullable|string|max:50',
            'hero_stat_3_label' => 'nullable|string|max:100',
            'features_section_title' => 'nullable|string|max:255',
            'features_section_subtitle' => 'nullable|string|max:500',
            'feature_1_icon' => 'nullable|string|max:50',
            'feature_1_title' => 'nullable|string|max:255',
            'feature_1_description' => 'nullable|string|max:500',
            'feature_2_icon' => 'nullable|string|max:50',
            'feature_2_title' => 'nullable|string|max:255',
            'feature_2_description' => 'nullable|string|max:500',
            'feature_3_icon' => 'nullable|string|max:50',
            'feature_3_title' => 'nullable|string|max:255',
            'feature_3_description' => 'nullable|string|max:500',
            'feature_4_icon' => 'nullable|string|max:50',
            'feature_4_title' => 'nullable|string|max:255',
            'feature_4_description' => 'nullable|string|max:500',
            'feature_5_icon' => 'nullable|string|max:50',
            'feature_5_title' => 'nullable|string|max:255',
            'feature_5_description' => 'nullable|string|max:500',
            'feature_6_icon' => 'nullable|string|max:50',
            'feature_6_title' => 'nullable|string|max:255',
            'feature_6_description' => 'nullable|string|max:500',
            'why_choose_heading' => 'nullable|string|max:255',
            'why_choose_subheading' => 'nullable|string|max:255',
            'why_choose_image' => 'nullable|image|mimes:png,jpg,jpeg,svg,webp|max:5120',
            'why_choose_features' => 'nullable|string',
            'footer_tagline' => 'nullable|string|max:255',
            'footer_company_name' => 'nullable|string|max:255',
            'footer_address' => 'nullable|string',
            'google_play_url' => 'nullable|string',
            'app_store_url' => 'nullable|string',
            'youtube_url' => 'nullable|url',
            'whatsapp_support' => 'nullable|string|max:20',
            'email_support' => 'nullable|email',
            'mailketing_from_email' => 'nullable|email',
            'mailketing_api_token' => 'nullable|string',
            'mail_template_registration_success' => 'nullable|string',
            'mail_template_payment_success' => 'nullable|string',
            'mail_template_password_change' => 'nullable|string',
            'mail_template_upgrade_success' => 'nullable|string',
            'mail_template_trial_reminder' => 'nullable|string',
            'mail_template_package_reminder' => 'nullable|string',
        ]);

        foreach ($validated as $key => $value) {
            // Handle file uploads
            if (in_array($key, ['logo', 'favicon', 'auth_logo', 'auth_hero_image', 'contact_help_image', 'hero_image', 'why_choose_image'])) {
                if ($request->hasFile($key)) {
                    // Delete old file if exists
                    $oldFile = Setting::get($key);
                    if ($oldFile && \Storage::disk('public')->exists($oldFile)) {
                        \Storage::disk('public')->delete($oldFile);
                    }

                    // Store new file
                    $path = $request->file($key)->store('settings', 'public');
                    Setting::set($key, $path, 'string');
                }
                continue;
            }

            // Handle auth_features and why_choose_features: already in JSON format from frontend
            if (in_array($key, ['auth_features', 'why_choose_features'])) {
                // Validate it's valid JSON
                $features = json_decode($value ?? '[]', true);
                if (!is_array($features)) {
                    $features = [];
                }

                // Handle why_choose_features image uploads
                if ($key === 'why_choose_features') {
                    foreach ($features as $index => &$feature) {
                        $imageKey = "why_choose_feature_image_{$index}";
                        if ($request->hasFile($imageKey)) {
                            // Delete old image if exists
                            if (isset($feature['image']) && \Storage::disk('public')->exists($feature['image'])) {
                                \Storage::disk('public')->delete($feature['image']);
                            }

                            // Store new image
                            $path = $request->file($imageKey)->store('why_choose_features', 'public');
                            $feature['image'] = $path;
                        }
                    }
                }

                Setting::set($key, json_encode(array_values($features)), 'json');
                continue;
            }

            // Handle text settings
            $type = in_array($key, [
                'site_description',
                'address',
                'google_maps_embed',
                'meta_keywords',
                'meta_description',
                'auth_description',
                'footer_address',
                'mailketing_api_token',
                'mail_template_registration_success',
                'mail_template_payment_success',
                'mail_template_password_change',
                'mail_template_upgrade_success',
                'mail_template_trial_reminder',
                'mail_template_package_reminder'
            ])
                ? 'text'
                : 'string';

            Setting::set($key, $value ?? '', $type);
        }

        Setting::clearCache();

        return redirect()
            ->back()
            ->with('success', 'Pengaturan berhasil diperbarui!');
    }

    public function testMailketing(Request $request, MailketingService $mailketingService)
    {
        $validated = $request->validate([
            'recipient_email' => 'required|email',
            'mailketing_from_email' => 'required|email',
            'mailketing_api_token' => 'required|string',
            'template_key' => 'nullable|string|in:mail_template_registration_success,mail_template_payment_success,mail_template_password_change,mail_template_upgrade_success,mail_template_trial_reminder,mail_template_package_reminder',
            'template_content' => 'nullable|string',
        ]);

        Log::info('Mailketing Test Template', [
            'key' => $validated['template_key'] ?? 'none',
            'has_content' => !empty($validated['template_content']),
            'length' => strlen($validated['template_content'] ?? '')
        ]);

        $siteName = Setting::get('site_name', 'ChatCepat');
        $subject = 'Test Koneksi Mailketing - ' . $siteName;
        $content = '<p>Halo,</p><p>Ini adalah email tes untuk memverifikasi konfigurasi Mailketing Anda pada platform <b>' . $siteName . '</b>.</p><p>Jika Anda menerima email ini, berarti konfigurasi Anda sudah benar dan siap digunakan.</p>';

        if (($validated['template_key'] ?? false) || ($validated['template_content'] ?? false)) {
            $templateContent = $validated['template_content'] ?? Setting::get($validated['template_key']);

            if ($templateContent !== null && $templateContent !== '') {
                $content = $templateContent;

                // Sample data for replacement
                $replacements = [
                    '{user_name}' => 'User Testing',
                    '{site_name}' => $siteName,
                    '{payment_amount}' => 'Rp 150.000',
                    '{payment_link}' => url('/payment/sample'),
                    '{transaction_id}' => 'TRX-' . strtoupper(bin2hex(random_bytes(4))),
                    '{package_name}' => 'Pro Plan',
                    '{new_package_name}' => 'Enterprise Plan',
                    '{date_time}' => now()->format('d M Y H:i'),
                    '{days_left}' => '3',
                    '{expiry_date}' => now()->addDays(30)->format('d M Y'),
                ];

                $content = str_replace(array_keys($replacements), array_values($replacements), $content);

                // Adjust subject based on template
                $subjectMap = [
                    'mail_template_registration_success' => 'Registrasi Berhasil & Instruksi Pembayaran',
                    'mail_template_payment_success' => 'Pembayaran Berhasil Diterima',
                    'mail_template_password_change' => 'Keamanan: Kata Sandi Anda Telah Diubah',
                    'mail_template_upgrade_success' => 'Selamat! Upgrade Paket Berhasil',
                    'mail_template_trial_reminder' => 'Penting: Masa Trial Anda Akan Segera Berakhir',
                    'mail_template_package_reminder' => 'Pengingat: Masa Aktif Paket Anda Segera Berakhir',
                ];
                $subject = ($subjectMap[$validated['template_key']] ?? 'Email Testing') . ' - ' . $siteName;
            }
        }

        // Temporarily override settings if they are provided in the test request
        // (This ensures we test with what's on the screen)
        config(['services.mailketing.api_token' => $validated['mailketing_api_token']]);
        config(['services.mailketing.from_email' => $validated['mailketing_from_email']]);

        $success = $mailketingService->send($validated['recipient_email'], $subject, $content);

        if ($success) {
            return back()->with('success', 'Email tes berhasil dikirim! Silakan cek inbox email tujuan.');
        }

        return back()->with('error', 'Gagal mengirim email tes. Silakan cek log untuk detail kesalahan atau pastikan kredensial Anda benar.');
    }
}
