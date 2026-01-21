<?php

namespace Database\Seeders;

use App\Models\GuideArticle;
use App\Models\GuideCategory;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class GuideSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // 1. Akun & Profil
        $categoryAkun = GuideCategory::create([
            'name' => 'Akun & Profil',
            'slug' => 'akun-profil',
            'sort_order' => 1,
        ]);

        GuideArticle::create([
            'guide_category_id' => $categoryAkun->id,
            'title' => 'Cara Mengganti Password',
            'slug' => 'cara-mengganti-password',
            'content' => "Untuk mengganti password akun Anda, ikuti langkah-langkah berikut:\n\n1. Masuk ke halaman **Dashboard**.\n2. Klik menu profil di pojok kanan atas.\n3. Pilih **Pengaturan Akun**.\n4. Masuk ke tab **Password**.\n5. Masukkan password lama dan password baru Anda.\n6. Klik **Simpan**.",
            'sort_order' => 1,
            'is_published' => true,
        ]);

        GuideArticle::create([
            'guide_category_id' => $categoryAkun->id,
            'title' => 'Mengubah Foto Profil',
            'slug' => 'mengubah-foto-profil',
            'content' => "Anda dapat mengubah foto profil agar lebih personal.\n\n1. Pergi ke **Pengaturan Akun**.\n2. Pada bagian Foto Profil, klik tombol **Upload**.\n3. Pilih foto dari perangkat Anda (format JPG/PNG, maks 2MB).\n4. Foto akan otomatis diperbarui.",
            'sort_order' => 2,
            'is_published' => true,
        ]);


        // 2. Broadcast WhatsApp
        $categoryWa = GuideCategory::create([
            'name' => 'Broadcast WhatsApp',
            'slug' => 'broadcast-whatsapp',
            'sort_order' => 2,
        ]);

        GuideArticle::create([
            'guide_category_id' => $categoryWa->id,
            'title' => 'Cara Memulai Broadcast Pertama',
            'slug' => 'cara-memulai-broadcast-pertama',
            'content' => "Panduan memulai broadcast:\n\n1. Pastikan Anda sudah menghubungkan nomor WhatsApp di menu **WhatsApp > Sessions**.\n2. Siapkan data kontak di menu **Contact Groups**.\n3. Masuk ke menu **Broadcast > Kirim Broadcast**.\n4. Pilih Device, Group Kontak, dan Template Pesan (opsional).\n5. Tulis pesan Anda atau gunakan template.\n6. Klik **Kirim Broadcast**.",
            'sort_order' => 1,
            'is_published' => true,
        ]);

        GuideArticle::create([
            'guide_category_id' => $categoryWa->id,
            'title' => 'Tips Agar WhatsApp Tidak Terblokir',
            'slug' => 'tips-agar-whatsapp-tidak-terblokir',
            'content' => "Agar nomor WhatsApp Anda aman saat melakukan broadcast:\n\n- **Jangan kirim terlalu cepat**: Beri jeda antar pesan (min 5-10 detik).\n- **Gunakan Spintax**: Variasikan isi pesan agar tidak terdeteksi spam.\n- **Hangatkan Nomor**: Jangan langsung kirim ribuan pesan jika nomor baru.\n- **Targetkan Kontak Valid**: Pastikan nomor tujuan aktif dan relevan.",
            'sort_order' => 2,
            'is_published' => true,
        ]);


        // 3. Scraper Data
        $categoryScraper = GuideCategory::create([
            'name' => 'Scraper Data',
            'slug' => 'scraper-data',
            'sort_order' => 3,
        ]);

        GuideArticle::create([
            'guide_category_id' => $categoryScraper->id,
            'title' => 'Cara Scrape Google Maps',
            'slug' => 'cara-scrape-google-maps',
            'content' => "Dapatkan data bisnis potensial dari Google Maps:\n\n1. Buka menu **Scraper > Google Maps**.\n2. Masukkan kata kunci (misal: 'Cafe di Jakarta Selatan').\n3. Klik **Mulai Scrape**.\n4. Tunggu proses selesai.\n5. Hasil akan muncul di tabel dan bisa diekspor ke Excel.",
            'sort_order' => 1,
            'is_published' => true,
        ]);

         // 4. Integrasi API
         $categoryApi = GuideCategory::create([
            'name' => 'Integrasi API',
            'slug' => 'integrasi-api',
            'sort_order' => 4,
        ]);

        GuideArticle::create([
            'guide_category_id' => $categoryApi->id,
            'title' => 'Cara Mendapatkan API Key',
            'slug' => 'cara-mendapatkan-api-key',
            'content' => "Untuk developer yang ingin mengintegrasikan layanan kami:\n\n1. Masuk ke **Pengaturan Akun > API**.\n2. Klik **Generate New Token**.\n3. Salin token tersebut dan simpan di tempat aman.\n4. Gunakan token ini pada Header Authorization (Bearer Token) setiap request.",
            'sort_order' => 1,
            'is_published' => false, // Draft example
        ]);
    }
}
