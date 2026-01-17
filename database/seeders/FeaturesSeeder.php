<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Feature;
use Illuminate\Support\Facades\DB;

class FeaturesSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Clear existing features
        DB::table('features')->truncate();

        $features = [
            [
                'icon' => 'MessageSquare',
                'title' => 'Balas Chat Otomatis',
                'description' => 'Membantu kamu melakukan automasi chat Non-Stop 24/7. Kamu bisa memilih automasi chat dengan template atau dengan bantuan AI Cerdas dan Humanis yang bisa kamu latih sesuai dengan bidang bisnis yang kamu jalankan.',
                'image' => null,
                'order' => 1,
                'is_active' => true,
            ],
            [
                'icon' => 'Bell',
                'title' => 'Followup Otomatis',
                'description' => 'Fitur Follow Up akan mengirimkan chat otomatis kepada konsumen setelah jeda tertentu dari chat terakhir. Misalnya, jika chat terakhir terjadi pukul 15.00 dan jeda follow up diatur 60 menit, maka pesan follow up akan terkirim pada pukul 16.00.',
                'image' => null,
                'order' => 2,
                'is_active' => true,
            ],
            [
                'icon' => 'MessageCircle',
                'title' => 'WhatsApp Templating',
                'description' => 'Mau balas chat atau broadcast WhatsApp dengan template pesan yang sudah siapkan? Dengan ChatCepat kamu bisa membuat template pesan dalam bentuk teks, teks + image, teks + video, dokumen, audio, list, button, location, dan polling.',
                'image' => null,
                'order' => 3,
                'is_active' => true,
            ],
            [
                'icon' => 'Users',
                'title' => 'Scraping Contacts',
                'description' => 'Membantu kamu mengambil kontak dari Google Maps. Sekali klik, boom! semua kontak langsung masuk ke dashboard ChatCepat kamu.',
                'image' => null,
                'order' => 4,
                'is_active' => true,
            ],
            [
                'icon' => 'Calculator',
                'title' => 'Integrasi Ongkos Kirim',
                'description' => 'Pilih ekspedisi yang kamu inginkan untuk memudahkan Chatbot AI mengirimkan estimasi ongkos kirim ketika ada customer yang menanyakan.',
                'image' => null,
                'order' => 5,
                'is_active' => true,
            ],
            [
                'icon' => 'Megaphone',
                'title' => 'Broadcast Terjadwal',
                'description' => 'Kirim promosi ke pelanggan secara aman melalui broadcast WhatsApp dan Email, bertahap, dan menyusun jadwal sehingga risiko banned menjadi minim.',
                'image' => null,
                'order' => 6,
                'is_active' => true,
            ],
            [
                'icon' => 'Users',
                'title' => 'Human Agent',
                'description' => 'Ada pertanyaan pelanggan yang terlalu kompleks untuk dijawab oleh chatbot AI? ChatCepat memungkinkan chatbot untuk dialihkan ke CS manusia.',
                'image' => null,
                'order' => 7,
                'is_active' => true,
            ],
            [
                'icon' => 'Grid',
                'title' => 'Open API - Integrasi Mudah',
                'description' => 'Setting dan Integrasi sangat mudah. Tinggal scan barcode seperti memakai WhatsApp versi web.',
                'image' => null,
                'order' => 8,
                'is_active' => true,
            ],
            [
                'icon' => 'Languages',
                'title' => 'Multi-Language',
                'description' => 'AI Agent bisa merespons dalam berbagai bahasa. Anda tinggal menentukan AI Behavior dan memberikan AI Training dengan bahasa yang Anda inginkan.',
                'image' => null,
                'order' => 9,
                'is_active' => true,
            ],
            [
                'icon' => 'MonitorPlay',
                'title' => 'Plugin Live Chat',
                'description' => 'Tambahkan fitur chat ke website tanpa coding agar pelanggan lebih mudah terhubung tanpa berpindah ke WhatsApp / Aplikasi Lain.',
                'image' => null,
                'order' => 10,
                'is_active' => true,
            ],
        ];

        foreach ($features as $feature) {
            Feature::create($feature);
        }
    }
}
