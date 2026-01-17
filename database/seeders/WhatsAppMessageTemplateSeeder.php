<?php

namespace Database\Seeders;

use App\Models\WhatsAppMessageTemplate;
use App\Models\User;
use Illuminate\Database\Seeder;

class WhatsAppMessageTemplateSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get the first admin user or create one if doesn't exist
        $user = User::where('role', 'admin')->first();

        if (!$user) {
            $user = User::first();
        }

        if (!$user) {
            $this->command->warn('No users found. Please run user seeder first.');
            return;
        }

        $templates = [
            [
                'user_id' => $user->id,
                'name' => 'Ucapan Selamat Datang',
                'content' => 'Halo {nama}, selamat datang di layanan kami. Terima kasih telah menghubungi kami. Ada yang bisa kami bantu hari ini?',
                'type' => 'text',
                'category' => 'greeting',
                'variables' => ['nama'],
                'is_active' => true,
            ],
            [
                'user_id' => $user->id,
                'name' => 'Konfirmasi Pesanan',
                'content' => 'Terima kasih atas pesanan Anda, {nama}. Pesanan Anda dengan nomor #{nomor} telah kami terima dan sedang diproses. Estimasi pengiriman 2-3 hari kerja.',
                'type' => 'text',
                'category' => 'order',
                'variables' => ['nama', 'nomor'],
                'is_active' => true,
            ],
            [
                'user_id' => $user->id,
                'name' => 'Follow Up Pelanggan',
                'content' => 'Halo {nama}, apakah Anda masih tertarik dengan produk yang Anda tanyakan kemarin? Kami siap membantu jika ada pertanyaan lebih lanjut.',
                'type' => 'text',
                'category' => 'follow-up',
                'variables' => ['nama'],
                'is_active' => true,
            ],
            [
                'user_id' => $user->id,
                'name' => 'Promo Spesial',
                'content' => 'Hai {nama}, ada promo spesial untuk Anda! Dapatkan diskon hingga 30% untuk semua produk pilihan. Promo berlaku sampai {tanggal}. Jangan lewatkan kesempatan ini!',
                'type' => 'text',
                'category' => 'promo',
                'variables' => ['nama', 'tanggal'],
                'is_active' => true,
            ],
            [
                'user_id' => $user->id,
                'name' => 'Pengingat Pembayaran',
                'content' => 'Halo {nama}, ini adalah pengingat bahwa pembayaran Anda untuk invoice #{nomor} akan jatuh tempo pada {tanggal}. Silakan lakukan pembayaran sebelum tanggal tersebut.',
                'type' => 'text',
                'category' => 'reminder',
                'variables' => ['nama', 'nomor', 'tanggal'],
                'is_active' => true,
            ],
            [
                'user_id' => $user->id,
                'name' => 'Terima Kasih Setelah Pembelian',
                'content' => 'Terima kasih telah berbelanja di toko kami, {nama}. Kami berharap Anda puas dengan produk yang dibeli. Jangan ragu untuk menghubungi kami jika ada pertanyaan.',
                'type' => 'text',
                'category' => 'thank-you',
                'variables' => ['nama'],
                'is_active' => true,
            ],
            [
                'user_id' => $user->id,
                'name' => 'Status Pengiriman',
                'content' => 'Update pengiriman untuk {nama}: Paket Anda dengan nomor resi {nomor} sedang dalam perjalanan. Diperkirakan tiba pada {tanggal}.',
                'type' => 'text',
                'category' => 'shipping',
                'variables' => ['nama', 'nomor', 'tanggal'],
                'is_active' => true,
            ],
            [
                'user_id' => $user->id,
                'name' => 'Permintaan Review',
                'content' => 'Halo {nama}, kami sangat menghargai feedback Anda. Bisakah Anda meluangkan waktu sebentar untuk memberikan review tentang produk yang baru saja Anda terima?',
                'type' => 'text',
                'category' => 'review',
                'variables' => ['nama'],
                'is_active' => true,
            ],
            [
                'user_id' => $user->id,
                'name' => 'Informasi Jam Operasional',
                'content' => 'Terima kasih telah menghubungi kami, {nama}. Saat ini kami sedang di luar jam operasional. Jam operasional kami adalah Senin-Jumat, 09:00-17:00. Pesan Anda akan kami balas pada jam kerja berikutnya.',
                'type' => 'text',
                'category' => 'auto-reply',
                'variables' => ['nama'],
                'is_active' => true,
            ],
            [
                'user_id' => $user->id,
                'name' => 'Katalog Produk',
                'content' => 'Selamat datang di katalog produk kami! Berikut adalah daftar kategori produk yang tersedia. Silakan pilih kategori yang Anda minati untuk melihat detail produk.',
                'type' => 'image',
                'category' => 'catalog',
                'variables' => null,
                'media_url' => 'https://via.placeholder.com/800x600/4A90E2/ffffff?text=Katalog+Produk',
                'is_active' => true,
            ],
            [
                'user_id' => $user->id,
                'name' => 'Brosur Promo',
                'content' => 'Promo besar-besaran! Lihat brosur promo kami untuk penawaran terbaik bulan ini.',
                'type' => 'document',
                'category' => 'promo',
                'variables' => null,
                'media_url' => 'https://example.com/brosur-promo.pdf',
                'is_active' => true,
            ],
            [
                'user_id' => $user->id,
                'name' => 'Tutorial Produk',
                'content' => 'Halo {nama}, berikut adalah video tutorial cara menggunakan produk yang Anda beli. Semoga bermanfaat!',
                'type' => 'video',
                'category' => 'tutorial',
                'variables' => ['nama'],
                'media_url' => 'https://example.com/tutorial-video.mp4',
                'is_active' => true,
            ],
        ];

        foreach ($templates as $template) {
            WhatsAppMessageTemplate::updateOrCreate(
                [
                    'user_id' => $template['user_id'],
                    'name' => $template['name']
                ],
                $template
            );
        }

        $this->command->info('WhatsApp Message Templates seeded successfully!');
    }
}
