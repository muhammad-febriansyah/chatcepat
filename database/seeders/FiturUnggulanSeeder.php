<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\FiturUnggulan;

class FiturUnggulanSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $fiturUnggulans = [
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
                'icon' => 'Zap',
                'title' => 'Integrasi Ongkos Kirim',
                'description' => 'Pilih ekspedisi yang kamu inginkan untuk memudahkan Chatbot AI mengirimkan estimasi ongkos kirim ketika ada customer yang menanyakan.',
                'image' => null,
                'order' => 5,
                'is_active' => true,
            ],
        ];

        foreach ($fiturUnggulans as $fitur) {
            FiturUnggulan::create($fitur);
        }
    }
}
