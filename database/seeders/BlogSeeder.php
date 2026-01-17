<?php

namespace Database\Seeders;

use App\Models\BlogCategory;
use App\Models\Post;
use App\Models\User;
use Illuminate\Database\Seeder;

class BlogSeeder extends Seeder
{
    public function run(): void
    {
        $admin = User::first();

        // Create categories
        $categories = [
            [
                'name' => 'Panduan',
                'description' => 'Panduan lengkap menggunakan ChatCepat',
            ],
            [
                'name' => 'Tips & Trik',
                'description' => 'Tips dan trik untuk memaksimalkan ChatCepat',
            ],
            [
                'name' => 'Update',
                'description' => 'Berita dan update terbaru ChatCepat',
            ],
            [
                'name' => 'Tutorial',
                'description' => 'Tutorial step-by-step ChatCepat',
            ],
        ];

        $createdCategories = [];
        foreach ($categories as $category) {
            $createdCategories[] = BlogCategory::create($category);
        }

        // Create posts
        $posts = [
            [
                'title' => 'Cara Memulai dengan ChatCepat',
                'excerpt' => 'Panduan lengkap untuk memulai perjalanan Anda dengan ChatCepat',
                'content' => 'ChatCepat adalah platform komunikasi modern yang memudahkan Anda untuk terhubung dengan tim. Dalam panduan ini, kami akan membahas langkah-langkah dasar untuk memulai menggunakan ChatCepat. Pertama, Anda perlu membuat akun dengan mendaftar menggunakan email. Setelah verifikasi email, Anda dapat langsung mulai menggunakan ChatCepat untuk berkomunikasi dengan tim Anda.',
                'category_id' => 0,
                'status' => 'published',
            ],
            [
                'title' => '10 Fitur ChatCepat yang Harus Anda Ketahui',
                'excerpt' => 'Temukan fitur-fitur powerful yang akan meningkatkan produktivitas tim Anda',
                'content' => 'ChatCepat hadir dengan berbagai fitur yang dirancang untuk meningkatkan produktivitas. Berikut adalah 10 fitur utama: 1) Pesan real-time 2) Grup chat 3) Pengiriman file 4) Voice & Video call 5) Screen sharing 6) Integrasi dengan tools lain 7) Bot automation 8) Search yang powerful 9) Notifikasi yang dapat dikustomisasi 10) End-to-end encryption.',
                'category_id' => 1,
                'status' => 'published',
            ],
            [
                'title' => 'Update ChatCepat v2.0: Fitur Baru yang Amazing',
                'excerpt' => 'ChatCepat v2.0 hadir dengan berbagai fitur baru yang menakjubkan',
                'content' => 'Kami dengan senang hati mengumumkan peluncuran ChatCepat v2.0! Update ini membawa banyak fitur baru termasuk dark mode, reactions pada pesan, thread untuk diskusi yang lebih terorganisir, dan peningkatan performa yang signifikan. Kami juga telah memperbaiki berbagai bug dan meningkatkan keamanan platform.',
                'category_id' => 2,
                'status' => 'published',
            ],
            [
                'title' => 'Cara Membuat Bot ChatCepat untuk Otomasi',
                'excerpt' => 'Tutorial lengkap membuat bot untuk mengotomasi tugas-tugas rutin',
                'content' => 'Bot di ChatCepat dapat membantu Anda mengotomasi berbagai tugas. Dalam tutorial ini, kami akan memandu Anda membuat bot sederhana yang dapat menjawab pertanyaan umum. Anda akan belajar cara mengatur webhook, membuat command, dan mengintegrasikan bot dengan API ChatCepat. Ikuti langkah-langkah berikut untuk membuat bot pertama Anda.',
                'category_id' => 3,
                'status' => 'published',
            ],
            [
                'title' => 'Tingkatkan Keamanan Akun ChatCepat Anda',
                'excerpt' => 'Tips penting untuk menjaga keamanan akun ChatCepat',
                'content' => 'Keamanan akun adalah prioritas utama kami. Berikut adalah beberapa tips untuk meningkatkan keamanan akun ChatCepat Anda: 1) Aktifkan two-factor authentication 2) Gunakan password yang kuat dan unik 3) Jangan bagikan kredensial Anda 4) Review devices yang terhubung secara berkala 5) Logout dari session yang tidak digunakan. Dengan mengikuti tips ini, akun Anda akan lebih aman.',
                'category_id' => 0,
                'status' => 'published',
            ],
        ];

        foreach ($posts as $index => $postData) {
            Post::create([
                'blog_category_id' => $createdCategories[$postData['category_id']]->id,
                'user_id' => $admin->id,
                'title' => $postData['title'],
                'excerpt' => $postData['excerpt'],
                'content' => $postData['content'],
                'status' => $postData['status'],
                'published_at' => now(),
            ]);
        }
    }
}
