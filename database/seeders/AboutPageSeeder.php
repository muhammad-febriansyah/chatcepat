<?php

namespace Database\Seeders;

use App\Models\AboutPage;
use Illuminate\Database\Seeder;

class AboutPageSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        AboutPage::create([
            'title' => 'Tentang ChatCepat',
            'description' => 'Platform CRM berbasis AI yang membantu tim sales Anda bekerja lebih efisien, meningkatkan konversi, dan memberikan pengalaman customer terbaik.',
            'content' => 'ChatCepat adalah solusi CRM modern yang dirancang khusus untuk bisnis Indonesia. Kami menggunakan teknologi AI terdepan untuk membantu Anda mengelola customer relationship dengan lebih baik, mengotomasi tugas-tugas repetitif, dan fokus pada hal yang paling penting - membangun hubungan yang kuat dengan customer Anda.',
            'vision' => 'Menjadi platform CRM berbasis AI terdepan di Indonesia yang membantu setiap bisnis mencapai potensi maksimal mereka melalui teknologi yang mudah digunakan dan terjangkau.',
            'mission' => 'Menyediakan solusi CRM yang powerful namun mudah digunakan, membantu bisnis Indonesia meningkatkan efisiensi sales, dan memberikan pengalaman customer yang luar biasa melalui kekuatan AI.',
            'values' => [
                [
                    'title' => 'Inovasi',
                    'description' => 'Kami terus berinovasi untuk memberikan solusi terbaik'
                ],
                [
                    'title' => 'Kemudahan',
                    'description' => 'Teknologi canggih yang mudah digunakan untuk semua orang'
                ],
                [
                    'title' => 'Kemitraan',
                    'description' => 'Kami adalah partner kesuksesan bisnis Anda'
                ],
                [
                    'title' => 'Transparansi',
                    'description' => 'Komunikasi yang jujur dan terbuka dengan customer'
                ],
            ],
            'is_active' => true,
        ]);
    }
}
