<?php

namespace Database\Seeders;

use App\Models\Testimonial;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class TestimonialSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $testimonials = [
            [
                'user_id' => 1,
                'rating' => 5,
                'description' => 'ChatCepat sangat membantu bisnis saya! Fitur AI-nya luar biasa dan customer service saya jadi lebih efisien. Highly recommended!',
                'is_active' => true,
            ],
            [
                'user_id' => 1,
                'rating' => 5,
                'description' => 'Platform CRM terbaik yang pernah saya gunakan. Interface-nya user-friendly dan fitur automasi sangat membantu menghemat waktu.',
                'is_active' => true,
            ],
            [
                'user_id' => 1,
                'rating' => 4,
                'description' => 'Sistem yang bagus untuk mengelola customer relationship. Saya suka fitur chat automation-nya. Sangat membantu untuk bisnis online saya.',
                'is_active' => true,
            ],
            [
                'user_id' => 1,
                'rating' => 5,
                'description' => 'Sudah menggunakan ChatCepat selama 6 bulan dan sangat puas. Customer support responsif dan fiturnya terus berkembang.',
                'is_active' => true,
            ],
            [
                'user_id' => 1,
                'rating' => 5,
                'description' => 'Investasi terbaik untuk bisnis saya! Conversion rate meningkat sejak menggunakan ChatCepat. Tim support juga sangat helpful.',
                'is_active' => true,
            ],
            [
                'user_id' => 1,
                'rating' => 4,
                'description' => 'Fitur-fiturnya lengkap dan mudah digunakan. Sangat cocok untuk UMKM yang ingin meningkatkan pelayanan customer.',
                'is_active' => true,
            ],
        ];

        foreach ($testimonials as $testimonial) {
            Testimonial::create($testimonial);
        }
    }
}
