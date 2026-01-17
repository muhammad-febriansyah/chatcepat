<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Insert default settings for why choose section
        DB::table('settings')->insert([
            [
                'key' => 'why_choose_heading',
                'value' => 'Kenapa Ribuan Bisnis',
                'type' => 'string',
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'key' => 'why_choose_subheading',
                'value' => 'Menggunakan ChatCepat',
                'type' => 'string',
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'key' => 'why_choose_image',
                'value' => null,
                'type' => 'string',
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'key' => 'why_choose_features',
                'value' => json_encode([
                    [
                        'icon' => 'TrendingUp',
                        'title' => 'Tingkatkan Penjualan Hingga 40%',
                        'description' => 'Dengan automasi WhatsApp yang cerdas, bisnis Anda bisa melayani lebih banyak pelanggan sekaligus dan meningkatkan konversi secara signifikan.'
                    ],
                    [
                        'icon' => 'Clock',
                        'title' => 'Hemat Waktu dan Biaya Operasional',
                        'description' => 'Gantikan kebutuhan 3-5 customer service dengan 1 AI chatbot yang bekerja 24/7. Penghematan biaya gaji hingga ratusan juta per tahun.'
                    ],
                    [
                        'icon' => 'Users',
                        'title' => 'Layani Ribuan Pelanggan Bersamaan',
                        'description' => 'Tidak ada lagi pelanggan yang menunggu atau tertunda responnya. ChatCepat AI mampu menangani ribuan chat simultan tanpa penurunan kualitas.'
                    ],
                    [
                        'icon' => 'CheckCircle',
                        'title' => 'Keamanan dan Privasi Terjamin',
                        'description' => 'Data pelanggan Anda aman dengan enkripsi tingkat enterprise. Sistem backup otomatis memastikan tidak ada data yang hilang.'
                    ]
                ]),
                'type' => 'json',
                'created_at' => now(),
                'updated_at' => now()
            ],
        ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::table('settings')->whereIn('key', [
            'why_choose_heading',
            'why_choose_subheading',
            'why_choose_image',
            'why_choose_features'
        ])->delete();
    }
};
