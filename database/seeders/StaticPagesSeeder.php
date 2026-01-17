<?php

namespace Database\Seeders;

use App\Models\Page;
use Illuminate\Database\Seeder;

class StaticPagesSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $pages = [
            [
                'title' => 'Tentang Kami',
                'slug' => 'about',
                'excerpt' => 'Pelajari lebih lanjut tentang ChatCepat dan misi kami',
                'content' => '<h2>Tentang ChatCepat</h2><p>ChatCepat adalah platform komunikasi modern yang dirancang untuk memudahkan komunikasi Anda.</p><p>Kami berkomitmen untuk menyediakan layanan terbaik dengan fitur-fitur canggih dan keamanan yang terjamin.</p>',
                'meta_title' => 'Tentang Kami - ChatCepat',
                'meta_description' => 'Pelajari lebih lanjut tentang ChatCepat, platform komunikasi modern untuk semua kebutuhan Anda.',
                'meta_keywords' => 'tentang kami, chatcepat, profil perusahaan',
                'is_active' => true,
            ],
            [
                'title' => 'Visi & Misi',
                'slug' => 'vision-mission',
                'excerpt' => 'Visi dan misi ChatCepat untuk masa depan komunikasi',
                'content' => '<h2>Visi</h2><p>Menjadi platform komunikasi terdepan yang menghubungkan jutaan pengguna di seluruh dunia.</p><h2>Misi</h2><ul><li>Menyediakan layanan komunikasi yang cepat, aman, dan andal</li><li>Terus berinovasi untuk memenuhi kebutuhan pengguna</li><li>Membangun komunitas yang positif dan produktif</li></ul>',
                'meta_title' => 'Visi & Misi - ChatCepat',
                'meta_description' => 'Visi dan misi ChatCepat dalam menyediakan platform komunikasi terbaik.',
                'meta_keywords' => 'visi, misi, chatcepat',
                'is_active' => true,
            ],
            [
                'title' => 'Kebijakan Privasi',
                'slug' => 'privacy',
                'excerpt' => 'Kebijakan privasi dan perlindungan data pengguna ChatCepat',
                'content' => '<h2>Kebijakan Privasi</h2><p>Kami menghargai privasi Anda dan berkomitmen untuk melindungi data pribadi Anda.</p><h3>Informasi yang Kami Kumpulkan</h3><p>Kami mengumpulkan informasi yang Anda berikan saat mendaftar dan menggunakan layanan kami.</p><h3>Penggunaan Informasi</h3><p>Informasi Anda digunakan untuk menyediakan dan meningkatkan layanan kami.</p><h3>Keamanan Data</h3><p>Kami menggunakan enkripsi end-to-end untuk melindungi komunikasi Anda.</p>',
                'meta_title' => 'Kebijakan Privasi - ChatCepat',
                'meta_description' => 'Kebijakan privasi ChatCepat mengenai pengumpulan dan penggunaan data pengguna.',
                'meta_keywords' => 'kebijakan privasi, privasi, perlindungan data',
                'is_active' => true,
            ],
            [
                'title' => 'Syarat & Ketentuan',
                'slug' => 'terms',
                'excerpt' => 'Syarat dan ketentuan penggunaan layanan ChatCepat',
                'content' => '<h2>Syarat & Ketentuan</h2><p>Dengan menggunakan ChatCepat, Anda menyetujui syarat dan ketentuan berikut:</p><h3>Penggunaan Layanan</h3><p>Anda harus berusia minimal 13 tahun untuk menggunakan layanan ini.</p><h3>Akun Pengguna</h3><p>Anda bertanggung jawab untuk menjaga keamanan akun Anda.</p><h3>Konten Pengguna</h3><p>Anda bertanggung jawab atas konten yang Anda bagikan melalui platform kami.</p><h3>Larangan</h3><p>Dilarang menggunakan layanan untuk tujuan ilegal atau melanggar hak orang lain.</p>',
                'meta_title' => 'Syarat & Ketentuan - ChatCepat',
                'meta_description' => 'Syarat dan ketentuan penggunaan layanan ChatCepat.',
                'meta_keywords' => 'syarat ketentuan, terms of service, tos',
                'is_active' => true,
            ],
        ];

        foreach ($pages as $page) {
            Page::updateOrCreate(
                ['slug' => $page['slug']],
                $page
            );
        }
    }
}
