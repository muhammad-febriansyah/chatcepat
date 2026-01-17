<?php

namespace Database\Seeders;

use App\Models\MessageTemplate;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class MessageTemplateSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get first user or create one
        $user = User::first();

        if (!$user) {
            $user = User::create([
                'name' => 'Demo User',
                'email' => 'user@example.com',
                'password' => bcrypt('password'),
                'email_verified_at' => now(),
            ]);
        }

        // WhatsApp Templates
        $whatsappTemplates = [
            [
                'name' => 'Konfirmasi Pesanan',
                'type' => 'whatsapp',
                'subject' => null,
                'content' => "Halo {{nama_customer}},\n\nTerima kasih telah berbelanja di {{nama_toko}}!\n\nPesanan Anda telah kami terima dengan detail:\nNo. Pesanan: {{nomor_pesanan}}\nTotal Pembayaran: {{total_pembayaran}}\nMetode Pembayaran: {{metode_pembayaran}}\n\nPesanan akan segera kami proses.\n\nHormat kami,\nTim {{nama_toko}}",
                'category' => 'Konfirmasi',
                'description' => 'Template untuk konfirmasi pesanan pelanggan',
                'variables' => [
                    ['name' => 'nama_customer', 'example' => 'Budi Santoso'],
                    ['name' => 'nama_toko', 'example' => 'Toko Saya'],
                    ['name' => 'nomor_pesanan', 'example' => 'ORD-2024-001'],
                    ['name' => 'total_pembayaran', 'example' => 'Rp 250.000'],
                    ['name' => 'metode_pembayaran', 'example' => 'Transfer Bank'],
                ],
                'is_active' => true,
                'usage_count' => 45,
                'last_used_at' => now()->subDays(2),
            ],
            [
                'name' => 'Notifikasi Pengiriman',
                'type' => 'whatsapp',
                'subject' => null,
                'content' => "Halo {{nama_customer}},\n\nPesanan Anda sedang dalam perjalanan!\n\nNo. Resi: {{nomor_resi}}\nKurir: {{nama_kurir}}\nEstimasi Tiba: {{estimasi_tiba}}\n\nAnda dapat melacak pesanan melalui website kurir.\n\nTerima kasih atas kepercayaan Anda.\n\nSalam,\n{{nama_toko}}",
                'category' => 'Notifikasi',
                'description' => 'Template notifikasi pengiriman barang',
                'variables' => [
                    ['name' => 'nama_customer', 'example' => 'Siti Nurhaliza'],
                    ['name' => 'nomor_resi', 'example' => 'JNE123456789'],
                    ['name' => 'nama_kurir', 'example' => 'JNE'],
                    ['name' => 'estimasi_tiba', 'example' => '2-3 hari'],
                    ['name' => 'nama_toko', 'example' => 'Toko Saya'],
                ],
                'is_active' => true,
                'usage_count' => 32,
                'last_used_at' => now()->subDays(1),
            ],
            [
                'name' => 'Promo Bulanan',
                'type' => 'whatsapp',
                'subject' => null,
                'content' => "Halo {{nama_customer}},\n\nKabar gembira untuk Anda!\n\n{{judul_promo}}\n\nDapatkan diskon hingga {{persentase_diskon}} untuk semua produk pilihan.\n\nPeriode Promo: {{periode_promo}}\nKode Voucher: {{kode_voucher}}\n\nBuruan belanja sekarang juga di {{website}} atau kunjungi toko kami.\n\nJangan lewatkan kesempatan ini!\n\nSalam hangat,\nTim {{nama_toko}}",
                'category' => 'Promosi',
                'description' => 'Template untuk promosi bulanan',
                'variables' => [
                    ['name' => 'nama_customer', 'example' => 'Ahmad Rizki'],
                    ['name' => 'judul_promo', 'example' => 'Promo Akhir Tahun 2024'],
                    ['name' => 'persentase_diskon', 'example' => '50%'],
                    ['name' => 'periode_promo', 'example' => '1-31 Desember 2024'],
                    ['name' => 'kode_voucher', 'example' => 'PROMO2024'],
                    ['name' => 'website', 'example' => 'www.tokosaya.com'],
                    ['name' => 'nama_toko', 'example' => 'Toko Saya'],
                ],
                'is_active' => true,
                'usage_count' => 78,
                'last_used_at' => now()->subHours(6),
            ],
            [
                'name' => 'Reminder Pembayaran',
                'type' => 'whatsapp',
                'subject' => null,
                'content' => "Halo {{nama_customer}},\n\nIni adalah pengingat bahwa pembayaran untuk pesanan Anda belum kami terima.\n\nNo. Invoice: {{nomor_invoice}}\nTotal: {{total_tagihan}}\nJatuh Tempo: {{tanggal_jatuh_tempo}}\n\nSilakan lakukan pembayaran segera agar pesanan dapat kami proses.\n\nDetail pembayaran:\nBank: {{nama_bank}}\nNo. Rekening: {{nomor_rekening}}\nAtas Nama: {{atas_nama}}\n\nJika sudah melakukan pembayaran, mohon abaikan pesan ini.\n\nTerima kasih,\n{{nama_toko}}",
                'category' => 'Reminder',
                'description' => 'Template reminder pembayaran pelanggan',
                'variables' => [
                    ['name' => 'nama_customer', 'example' => 'Dewi Lestari'],
                    ['name' => 'nomor_invoice', 'example' => 'INV-2024-001'],
                    ['name' => 'total_tagihan', 'example' => 'Rp 500.000'],
                    ['name' => 'tanggal_jatuh_tempo', 'example' => '15 Januari 2024'],
                    ['name' => 'nama_bank', 'example' => 'BCA'],
                    ['name' => 'nomor_rekening', 'example' => '1234567890'],
                    ['name' => 'atas_nama', 'example' => 'PT Toko Saya'],
                    ['name' => 'nama_toko', 'example' => 'Toko Saya'],
                ],
                'is_active' => true,
                'usage_count' => 23,
                'last_used_at' => now()->subDays(3),
            ],
            [
                'name' => 'Selamat Datang Member Baru',
                'type' => 'whatsapp',
                'subject' => null,
                'content' => "Halo {{nama_customer}},\n\nSelamat bergabung di {{nama_toko}}!\n\nTerima kasih telah mendaftar sebagai member kami. Kami senang Anda menjadi bagian dari keluarga besar kami.\n\nSebagai ucapan selamat datang, kami berikan voucher diskon khusus untuk Anda:\n\nKode Voucher: {{kode_voucher}}\nDiskon: {{nominal_diskon}}\nBerlaku hingga: {{masa_berlaku}}\n\nMulai belanja sekarang dan nikmati berbagai keuntungan menjadi member kami.\n\nSelamat berbelanja!\n\nSalam,\nTim {{nama_toko}}",
                'category' => 'Selamat Datang',
                'description' => 'Template sambutan untuk member baru',
                'variables' => [
                    ['name' => 'nama_customer', 'example' => 'Rina Susanti'],
                    ['name' => 'nama_toko', 'example' => 'Toko Saya'],
                    ['name' => 'kode_voucher', 'example' => 'WELCOME50'],
                    ['name' => 'nominal_diskon', 'example' => 'Rp 50.000'],
                    ['name' => 'masa_berlaku', 'example' => '31 Desember 2024'],
                ],
                'is_active' => true,
                'usage_count' => 156,
                'last_used_at' => now()->subHours(12),
            ],
            [
                'name' => 'Update Status Pesanan',
                'type' => 'whatsapp',
                'subject' => null,
                'content' => "Halo {{nama_customer}},\n\nStatus pesanan Anda telah diperbarui.\n\nNo. Pesanan: {{nomor_pesanan}}\nStatus: {{status_pesanan}}\nKeterangan: {{keterangan}}\n\nUntuk informasi lebih lanjut, silakan hubungi customer service kami.\n\nTerima kasih,\n{{nama_toko}}",
                'category' => 'Notifikasi',
                'description' => 'Template update status pesanan',
                'variables' => [
                    ['name' => 'nama_customer', 'example' => 'Joko Widodo'],
                    ['name' => 'nomor_pesanan', 'example' => 'ORD-2024-005'],
                    ['name' => 'status_pesanan', 'example' => 'Sedang Dikemas'],
                    ['name' => 'keterangan', 'example' => 'Pesanan sedang dalam proses pengemasan'],
                    ['name' => 'nama_toko', 'example' => 'Toko Saya'],
                ],
                'is_active' => true,
                'usage_count' => 89,
                'last_used_at' => now()->subHours(3),
            ],
        ];

        // Email Templates
        $emailTemplates = [
            [
                'name' => 'Invoice Pembayaran',
                'type' => 'email',
                'subject' => 'Invoice Pembayaran - {{nomor_invoice}}',
                'content' => "Kepada Yth. {{nama_customer}},\n\nBerikut adalah invoice untuk transaksi Anda:\n\nNo. Invoice: {{nomor_invoice}}\nTanggal: {{tanggal_invoice}}\n\nRincian Pembelian:\n{{detail_pembelian}}\n\nSubtotal: {{subtotal}}\nPajak (PPN 11%): {{pajak}}\nTotal: {{total_tagihan}}\n\nSilakan lakukan pembayaran sebelum {{tanggal_jatuh_tempo}}.\n\nInformasi Pembayaran:\nBank: {{nama_bank}}\nNo. Rekening: {{nomor_rekening}}\nAtas Nama: {{atas_nama}}\n\nSetelah melakukan pembayaran, mohon konfirmasi melalui email atau WhatsApp.\n\nTerima kasih atas kepercayaan Anda.\n\nHormat kami,\n{{nama_perusahaan}}",
                'category' => 'Invoice',
                'description' => 'Template invoice pembayaran untuk customer',
                'variables' => [
                    ['name' => 'nama_customer', 'example' => 'Budi Santoso'],
                    ['name' => 'nomor_invoice', 'example' => 'INV-2024-001'],
                    ['name' => 'tanggal_invoice', 'example' => '8 Januari 2024'],
                    ['name' => 'detail_pembelian', 'example' => '- Produk A x2 = Rp 200.000\n- Produk B x1 = Rp 150.000'],
                    ['name' => 'subtotal', 'example' => 'Rp 350.000'],
                    ['name' => 'pajak', 'example' => 'Rp 38.500'],
                    ['name' => 'total_tagihan', 'example' => 'Rp 388.500'],
                    ['name' => 'tanggal_jatuh_tempo', 'example' => '15 Januari 2024'],
                    ['name' => 'nama_bank', 'example' => 'BCA'],
                    ['name' => 'nomor_rekening', 'example' => '1234567890'],
                    ['name' => 'atas_nama', 'example' => 'PT Toko Saya'],
                    ['name' => 'nama_perusahaan', 'example' => 'PT Toko Saya'],
                ],
                'is_active' => true,
                'usage_count' => 67,
                'last_used_at' => now()->subDays(1),
            ],
            [
                'name' => 'Konfirmasi Registrasi',
                'type' => 'email',
                'subject' => 'Selamat Datang di {{nama_platform}}',
                'content' => "Halo {{nama_customer}},\n\nTerima kasih telah mendaftar di {{nama_platform}}!\n\nAkun Anda telah berhasil dibuat dengan informasi berikut:\n\nEmail: {{email}}\nUsername: {{username}}\nTanggal Registrasi: {{tanggal_registrasi}}\n\nUntuk keamanan akun Anda, mohon verifikasi email dengan klik tombol di bawah ini:\n\n[Verifikasi Email]\n\nJika tombol tidak berfungsi, copy dan paste link berikut ke browser Anda:\n{{link_verifikasi}}\n\nSetelah verifikasi, Anda dapat:\n- Mengakses semua fitur platform\n- Mengelola profil Anda\n- Melakukan transaksi dengan aman\n\nJika Anda tidak merasa mendaftar, mohon abaikan email ini.\n\nSalam hangat,\nTim {{nama_platform}}",
                'category' => 'Selamat Datang',
                'description' => 'Template konfirmasi registrasi member baru',
                'variables' => [
                    ['name' => 'nama_customer', 'example' => 'Dewi Lestari'],
                    ['name' => 'nama_platform', 'example' => 'ChatCepat'],
                    ['name' => 'email', 'example' => 'dewi@example.com'],
                    ['name' => 'username', 'example' => 'dewilestari'],
                    ['name' => 'tanggal_registrasi', 'example' => '8 Januari 2024'],
                    ['name' => 'link_verifikasi', 'example' => 'https://example.com/verify/abc123'],
                ],
                'is_active' => true,
                'usage_count' => 234,
                'last_used_at' => now()->subHours(8),
            ],
            [
                'name' => 'Newsletter Bulanan',
                'type' => 'email',
                'subject' => '{{judul_newsletter}} - Edisi {{bulan}}',
                'content' => "Halo {{nama_subscriber}},\n\nSelamat datang di newsletter bulanan kami!\n\n{{judul_newsletter}}\n\nHighlight Bulan Ini:\n{{highlight_1}}\n{{highlight_2}}\n{{highlight_3}}\n\nArtikel Pilihan:\n{{artikel_judul}}\n{{artikel_ringkasan}}\n\nBaca selengkapnya: {{artikel_link}}\n\nPromo Spesial:\nKhusus untuk subscriber setia, dapatkan diskon {{diskon}} dengan kode:\n{{kode_promo}}\n\nBerlaku hingga: {{masa_berlaku}}\n\nTerima kasih telah menjadi subscriber setia kami!\n\nJika tidak ingin menerima newsletter, klik: {{link_unsubscribe}}\n\nSalam,\nTim {{nama_perusahaan}}",
                'category' => 'Marketing',
                'description' => 'Template newsletter bulanan untuk subscriber',
                'variables' => [
                    ['name' => 'nama_subscriber', 'example' => 'Ahmad Rizki'],
                    ['name' => 'judul_newsletter', 'example' => 'Update Terbaru dari Kami'],
                    ['name' => 'bulan', 'example' => 'Januari 2024'],
                    ['name' => 'highlight_1', 'example' => '- Peluncuran produk baru'],
                    ['name' => 'highlight_2', 'example' => '- Fitur update aplikasi'],
                    ['name' => 'highlight_3', 'example' => '- Event dan webinar'],
                    ['name' => 'artikel_judul', 'example' => 'Tips Meningkatkan Produktivitas'],
                    ['name' => 'artikel_ringkasan', 'example' => '10 cara efektif untuk meningkatkan produktivitas kerja Anda...'],
                    ['name' => 'artikel_link', 'example' => 'https://blog.example.com/artikel'],
                    ['name' => 'diskon', 'example' => '20%'],
                    ['name' => 'kode_promo', 'example' => 'NEWS2024'],
                    ['name' => 'masa_berlaku', 'example' => '31 Januari 2024'],
                    ['name' => 'link_unsubscribe', 'example' => 'https://example.com/unsubscribe'],
                    ['name' => 'nama_perusahaan', 'example' => 'PT Toko Saya'],
                ],
                'is_active' => true,
                'usage_count' => 445,
                'last_used_at' => now()->subDays(5),
            ],
            [
                'name' => 'Reset Password',
                'type' => 'email',
                'subject' => 'Permintaan Reset Password - {{nama_platform}}',
                'content' => "Halo {{nama_user}},\n\nKami menerima permintaan untuk reset password akun Anda.\n\nJika Anda yang melakukan permintaan ini, klik tombol di bawah untuk membuat password baru:\n\n[Reset Password]\n\nAtau copy link berikut ke browser:\n{{link_reset}}\n\nLink ini akan kadaluarsa dalam {{masa_berlaku}}.\n\nJika Anda tidak merasa melakukan permintaan reset password, mohon abaikan email ini dan pastikan akun Anda aman.\n\nUntuk keamanan:\n- Jangan bagikan link ini kepada siapapun\n- Gunakan password yang kuat dan unik\n- Aktifkan two-factor authentication jika tersedia\n\nTerima kasih,\nTim Keamanan {{nama_platform}}",
                'category' => 'Support',
                'description' => 'Template reset password untuk user',
                'variables' => [
                    ['name' => 'nama_user', 'example' => 'Siti Nurhaliza'],
                    ['name' => 'nama_platform', 'example' => 'ChatCepat'],
                    ['name' => 'link_reset', 'example' => 'https://example.com/reset-password/token123'],
                    ['name' => 'masa_berlaku', 'example' => '60 menit'],
                ],
                'is_active' => true,
                'usage_count' => 112,
                'last_used_at' => now()->subHours(15),
            ],
            [
                'name' => 'Terima Kasih Setelah Pembelian',
                'type' => 'email',
                'subject' => 'Terima Kasih atas Pembelian Anda - {{nomor_pesanan}}',
                'content' => "Kepada Yth. {{nama_customer}},\n\nTerima kasih telah berbelanja di {{nama_toko}}!\n\nKami sangat menghargai kepercayaan Anda. Berikut detail pesanan Anda:\n\nNo. Pesanan: {{nomor_pesanan}}\nTanggal: {{tanggal_pesanan}}\nTotal: {{total_pembayaran}}\n\nProduk yang dibeli:\n{{daftar_produk}}\n\nPesanan Anda akan segera kami proses dan kirim ke alamat:\n{{alamat_pengiriman}}\n\nAnda dapat melacak status pesanan melalui:\n{{link_tracking}}\n\nKami berharap Anda puas dengan produk kami. Jangan ragu untuk memberikan review atau testimoni Anda.\n\nAda pertanyaan? Hubungi customer service:\nEmail: {{email_cs}}\nWhatsApp: {{whatsapp_cs}}\n\nTerima kasih dan selamat berbelanja lagi!\n\nHormat kami,\n{{nama_toko}}",
                'category' => 'Terima Kasih',
                'description' => 'Template ucapan terima kasih setelah pembelian',
                'variables' => [
                    ['name' => 'nama_customer', 'example' => 'Joko Widodo'],
                    ['name' => 'nama_toko', 'example' => 'Toko Saya'],
                    ['name' => 'nomor_pesanan', 'example' => 'ORD-2024-010'],
                    ['name' => 'tanggal_pesanan', 'example' => '8 Januari 2024'],
                    ['name' => 'total_pembayaran', 'example' => 'Rp 750.000'],
                    ['name' => 'daftar_produk', 'example' => '- Produk A x1\n- Produk B x2'],
                    ['name' => 'alamat_pengiriman', 'example' => 'Jl. Sudirman No. 123, Jakarta'],
                    ['name' => 'link_tracking', 'example' => 'https://example.com/track/abc123'],
                    ['name' => 'email_cs', 'example' => 'cs@tokosaya.com'],
                    ['name' => 'whatsapp_cs', 'example' => '+62812-3456-7890'],
                ],
                'is_active' => true,
                'usage_count' => 201,
                'last_used_at' => now()->subHours(4),
            ],
            [
                'name' => 'Feedback Survey',
                'type' => 'email',
                'subject' => 'Kami Butuh Pendapat Anda - Survey Kepuasan',
                'content' => "Halo {{nama_customer}},\n\nTerima kasih telah menggunakan layanan {{nama_layanan}}!\n\nKepuasan Anda adalah prioritas kami. Kami ingin mendengar pengalaman Anda untuk membantu kami meningkatkan layanan.\n\nMohon luangkan 2-3 menit untuk mengisi survey singkat:\n{{link_survey}}\n\nSebagai apresiasi, kami berikan voucher diskon {{nominal_voucher}} yang dapat digunakan untuk pembelian berikutnya.\n\nPertanyaan dalam survey:\n- Bagaimana pengalaman Anda dengan produk/layanan kami?\n- Apa yang paling Anda sukai?\n- Apa yang perlu kami tingkatkan?\n- Apakah Anda akan merekomendasikan kami?\n\nMasukan Anda sangat berharga bagi kami.\n\nTerima kasih atas waktu dan partisipasi Anda!\n\nSalam hangat,\nTim {{nama_perusahaan}}",
                'category' => 'Support',
                'description' => 'Template permintaan feedback dan survey kepuasan',
                'variables' => [
                    ['name' => 'nama_customer', 'example' => 'Rina Susanti'],
                    ['name' => 'nama_layanan', 'example' => 'ChatCepat'],
                    ['name' => 'link_survey', 'example' => 'https://survey.example.com/abc123'],
                    ['name' => 'nominal_voucher', 'example' => 'Rp 25.000'],
                    ['name' => 'nama_perusahaan', 'example' => 'PT ChatCepat Indonesia'],
                ],
                'is_active' => true,
                'usage_count' => 89,
                'last_used_at' => now()->subDays(2),
            ],
        ];

        // Insert WhatsApp templates
        foreach ($whatsappTemplates as $template) {
            MessageTemplate::create(array_merge($template, ['user_id' => $user->id]));
        }

        // Insert Email templates
        foreach ($emailTemplates as $template) {
            MessageTemplate::create(array_merge($template, ['user_id' => $user->id]));
        }

        $this->command->info('Message templates seeded successfully!');
    }
}
