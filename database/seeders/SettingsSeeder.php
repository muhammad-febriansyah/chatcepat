<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class SettingsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $settings = [
            // Basic Site Information
            ['key' => 'site_name', 'value' => 'ChatCepat', 'type' => 'string'],
            ['key' => 'site_description', 'value' => 'Platform Chat AI Tercepat dan Terpercaya di Indonesia', 'type' => 'text'],
            ['key' => 'site_tagline', 'value' => 'Chat Lebih Cepat, Solusi Lebih Tepat', 'type' => 'string'],

            // Contact Information
            ['key' => 'contact_email', 'value' => 'info@chatcepat.id', 'type' => 'string'],
            ['key' => 'contact_phone', 'value' => '+62 812-3456-7890', 'type' => 'string'],
            ['key' => 'whatsapp_number', 'value' => '+62 812-3456-7890', 'type' => 'string'],
            ['key' => 'address', 'value' => 'Jl. Sudirman No. 123, Jakarta Pusat, DKI Jakarta 10220', 'type' => 'text'],

            // Social Media
            ['key' => 'facebook_url', 'value' => 'https://facebook.com/chatcepat', 'type' => 'string'],
            ['key' => 'twitter_url', 'value' => 'https://twitter.com/chatcepat', 'type' => 'string'],
            ['key' => 'instagram_url', 'value' => 'https://instagram.com/chatcepat.id', 'type' => 'string'],
            ['key' => 'linkedin_url', 'value' => 'https://linkedin.com/company/chatcepat', 'type' => 'string'],
            ['key' => 'tiktok_url', 'value' => 'https://tiktok.com/@chatcepat.id', 'type' => 'string'],
            ['key' => 'youtube_url', 'value' => 'https://youtube.com/@chatcepat', 'type' => 'string'],

            // SEO Settings
            ['key' => 'meta_keywords', 'value' => 'chat ai, artificial intelligence, chatbot indonesia, ai chat, chatcepat, chat cepat, asisten virtual', 'type' => 'text'],
            ['key' => 'meta_description', 'value' => 'ChatCepat adalah platform chat AI tercepat dan terpercaya di Indonesia. Nikmati pengalaman chat dengan AI yang canggih dan responsif.', 'type' => 'text'],
            ['key' => 'meta_author', 'value' => 'ChatCepat Team', 'type' => 'string'],

            // Branding
            ['key' => 'logo', 'value' => '', 'type' => 'string'],
            ['key' => 'favicon', 'value' => '', 'type' => 'string'],
            ['key' => 'og_image', 'value' => '', 'type' => 'string'],

            // Business Settings
            ['key' => 'business_hours', 'value' => 'Senin - Jumat: 09:00 - 18:00 WIB', 'type' => 'string'],
            ['key' => 'support_email', 'value' => 'support@chatcepat.id', 'type' => 'string'],
            ['key' => 'sales_email', 'value' => 'sales@chatcepat.id', 'type' => 'string'],

            // Features Toggle
            ['key' => 'maintenance_mode', 'value' => 'false', 'type' => 'boolean'],
            ['key' => 'allow_registration', 'value' => 'true', 'type' => 'boolean'],
            ['key' => 'enable_chat', 'value' => 'true', 'type' => 'boolean'],
            ['key' => 'enable_notifications', 'value' => 'true', 'type' => 'boolean'],

            // App Settings
            ['key' => 'default_language', 'value' => 'id', 'type' => 'string'],
            ['key' => 'timezone', 'value' => 'Asia/Jakarta', 'type' => 'string'],
            ['key' => 'date_format', 'value' => 'd/m/Y', 'type' => 'string'],
            ['key' => 'time_format', 'value' => 'H:i', 'type' => 'string'],

            // Footer Information
            ['key' => 'footer_text', 'value' => '© 2024 ChatCepat. Hak Cipta Dilindungi.', 'type' => 'string'],
            ['key' => 'footer_about', 'value' => 'ChatCepat adalah solusi AI chat terdepan yang membantu Anda berkomunikasi lebih efisien dan mendapatkan jawaban dengan cepat.', 'type' => 'text'],

            // Auth Page Settings
            ['key' => 'auth_hero_image', 'value' => '', 'type' => 'string'],
            ['key' => 'auth_logo_name', 'value' => 'ChatCepat', 'type' => 'string'],
            ['key' => 'auth_tagline', 'value' => 'Smart, Fast & Reliable', 'type' => 'string'],
            ['key' => 'auth_heading', 'value' => 'Kelola Chat & Customer Anda dengan Mudah dan Cepat', 'type' => 'string'],
            ['key' => 'auth_description', 'value' => 'Platform CRM berbasis AI yang membantu tim sales Anda bekerja lebih efisien, meningkatkan konversi, dan memberikan pengalaman customer terbaik.', 'type' => 'text'],
            ['key' => 'auth_features', 'value' => json_encode([
                'Balas Chat Otomatis 24/7',
                'AI Cerdas & Humanis',
                'Followup Otomatis',
                'WhatsApp Templating',
                'Scraping Google Maps',
                'Integrasi Ongkos Kirim'
            ]), 'type' => 'json'],
            ['key' => 'auth_copyright', 'value' => '© 2025 ChatCepat. All rights reserved.', 'type' => 'string'],
        ];

        foreach ($settings as $setting) {
            DB::table('settings')->updateOrInsert(
                ['key' => $setting['key']],
                [
                    'value' => $setting['value'],
                    'type' => $setting['type'],
                    'created_at' => now(),
                    'updated_at' => now(),
                ]
            );
        }
    }
}
