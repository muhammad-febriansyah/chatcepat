<?php

namespace Database\Seeders;

use App\Models\Feature;
use Illuminate\Database\Seeder;

class FeatureSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $features = [
            [
                'icon' => 'Bot',
                'title' => 'Balas Chat Otomatis 24/7',
                'description' => 'Chatbot AI Cerdas dan Humanis otomatis menjawab pelanggan kapan saja, bahkan saat CS offline atau sedang membalas pesan lain',
                'order' => 1,
                'is_active' => true,
            ],
            [
                'icon' => 'Bell',
                'title' => 'Follow Up Otomatis',
                'description' => 'Terkadang, pelanggan tidak langsung membeli setelah chat pertama. Dengan ChatCepat kamu bisa mengatur pesan follow-up otomatis',
                'order' => 2,
                'is_active' => true,
            ],
            [
                'icon' => 'Megaphone',
                'title' => 'Broadcast Terjadwal',
                'description' => 'Kirim promosi ke pelanggan secara aman melalui broadcast WhatsApp dan Email, bertahap, dan manusiawi sehingga risiko banned menjadi minim',
                'order' => 3,
                'is_active' => true,
            ],
            [
                'icon' => 'Users',
                'title' => 'Human Agent',
                'description' => 'Ada pertanyaan pelanggan yang terlalu kompleks untuk dijawab oleh chatbot AI? ChatCepat memungkinkan chatbot untuk dialihkan ke CS manusia.',
                'order' => 4,
                'is_active' => true,
            ],
            [
                'icon' => 'Grid',
                'title' => 'Open API - Integrasi Mudah',
                'description' => 'Setting dan Integrasi sangat mudah. Tinggal scan barcode seperti memakai WhatsApp versi web.',
                'order' => 5,
                'is_active' => true,
            ],
            [
                'icon' => 'Calculator',
                'title' => 'Hitung Ongkos Kirim Otomatis',
                'description' => 'Chatbot AI Cerdas bisa melakukan perhitungan ongkos kirim dengan pilihan kurir yang sudah di tentukan oleh pengguna.',
                'order' => 6,
                'is_active' => true,
            ],
            [
                'icon' => 'MessageSquare',
                'title' => 'Message Templating',
                'description' => 'Jika Anda ingin membalas chat dengan template, ChatCepat menyiapkan fitur yang memudahkan Anda membuat banyak template pesan, baik WhatsApp maupun Email.',
                'order' => 7,
                'is_active' => true,
            ],
            [
                'icon' => 'Languages',
                'title' => 'Multi-Language',
                'description' => 'AI Agent bisa merespons dalam berbagai bahasa. Anda tinggal menentukan AI Behavior dan memberikan AI Training dengan bahasa yang Anda inginkan.',
                'order' => 8,
                'is_active' => true,
            ],
            [
                'icon' => 'MonitorPlay',
                'title' => 'Plugin Live Chat',
                'description' => 'Tambahkan fitur chat ke website tanpa coding agar pelanggan lebih mudah terhubung tanpa berpindah ke WhatsApp / Aplikasi Lain.',
                'order' => 9,
                'is_active' => true,
            ],
        ];

        foreach ($features as $feature) {
            Feature::updateOrCreate(
                ['title' => $feature['title']],
                $feature
            );
        }
    }
}
