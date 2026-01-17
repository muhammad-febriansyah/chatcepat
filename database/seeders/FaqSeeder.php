<?php

namespace Database\Seeders;

use App\Models\Faq;
use Illuminate\Database\Seeder;

class FaqSeeder extends Seeder
{
    public function run(): void
    {
        $faqs = [
            [
                'question' => 'Apa itu ChatCepat?',
                'answer' => 'ChatCepat adalah platform komunikasi instant messaging yang memungkinkan Anda untuk berkomunikasi dengan cepat dan mudah. Platform ini menyediakan fitur chat real-time, pengiriman file, dan berbagai fitur komunikasi lainnya untuk meningkatkan produktivitas tim Anda.',
            ],
            [
                'question' => 'Bagaimana cara mendaftar di ChatCepat?',
                'answer' => 'Untuk mendaftar di ChatCepat, klik tombol "Daftar" di halaman utama, isi formulir pendaftaran dengan nama, email, dan password Anda. Setelah itu, verifikasi email Anda melalui link yang dikirimkan ke inbox Anda. Setelah verifikasi selesai, Anda dapat langsung menggunakan ChatCepat.',
            ],
            [
                'question' => 'Apakah ChatCepat gratis?',
                'answer' => 'Ya, ChatCepat menyediakan paket gratis dengan fitur-fitur dasar yang sudah cukup untuk penggunaan personal atau tim kecil. Kami juga menyediakan paket premium dengan fitur-fitur tambahan seperti penyimpanan unlimited, integrasi dengan aplikasi lain, dan dukungan prioritas.',
            ],
            [
                'question' => 'Bagaimana cara mengirim pesan?',
                'answer' => 'Untuk mengirim pesan, pilih kontak atau grup yang ingin Anda kirimi pesan dari daftar chat Anda. Ketik pesan Anda di kolom input yang tersedia di bagian bawah layar, lalu tekan Enter atau klik tombol kirim. Pesan Anda akan langsung terkirim secara real-time.',
            ],
            [
                'question' => 'Apakah ChatCepat aman?',
                'answer' => 'Ya, ChatCepat menggunakan enkripsi end-to-end untuk melindungi privasi pesan Anda. Semua data yang dikirim melalui platform kami dienkripsi dan hanya dapat dibaca oleh pengirim dan penerima. Kami juga menerapkan berbagai langkah keamanan untuk melindungi akun dan data Anda.',
            ],
            [
                'question' => 'Bagaimana cara membuat grup chat?',
                'answer' => 'Untuk membuat grup chat, klik tombol "+" atau "Buat Grup" di menu utama. Pilih anggota yang ingin Anda tambahkan ke grup, berikan nama grup, dan tambahkan foto grup jika diinginkan. Setelah itu, klik "Buat" dan grup chat Anda siap digunakan.',
            ],
            [
                'question' => 'Apakah bisa mengirim file di ChatCepat?',
                'answer' => 'Ya, ChatCepat mendukung pengiriman berbagai jenis file termasuk dokumen, gambar, video, dan audio. Cukup klik ikon attachment (📎) di kolom input pesan, pilih file yang ingin dikirim, dan file akan langsung terkirim. Ukuran maksimal file yang dapat dikirim adalah 100MB untuk paket gratis dan unlimited untuk paket premium.',
            ],
            [
                'question' => 'Bagaimana cara menghapus pesan?',
                'answer' => 'Untuk menghapus pesan, tekan dan tahan pesan yang ingin dihapus, lalu pilih opsi "Hapus". Anda dapat memilih untuk menghapus pesan hanya untuk diri sendiri atau untuk semua orang dalam chat tersebut. Perlu diketahui bahwa Anda hanya dapat menghapus pesan untuk semua orang dalam waktu 1 jam setelah pesan dikirim.',
            ],
            [
                'question' => 'Apakah ChatCepat tersedia di mobile?',
                'answer' => 'Ya, ChatCepat tersedia dalam bentuk aplikasi mobile untuk iOS dan Android. Anda dapat mengunduhnya secara gratis dari App Store atau Google Play Store. Aplikasi mobile memiliki fitur yang sama dengan versi web, sehingga Anda dapat tetap terhubung di mana saja.',
            ],
            [
                'question' => 'Bagaimana cara menghubungi customer support?',
                'answer' => 'Jika Anda memiliki pertanyaan atau mengalami masalah, Anda dapat menghubungi customer support kami melalui email di support@chatcepat.com atau melalui fitur live chat yang tersedia di aplikasi. Tim support kami siap membantu Anda 24/7 untuk pengguna paket premium, dan dalam jam kerja untuk pengguna paket gratis.',
            ],
        ];

        foreach ($faqs as $faq) {
            Faq::create($faq);
        }
    }
}
