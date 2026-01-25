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
        // Insert default footer settings
        DB::table('settings')->insert([
            [
                'key' => 'footer_tagline',
                'value' => 'Omnichannel + CRM',
                'type' => 'string',
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'key' => 'footer_company_name',
                'value' => 'PT Teknologi ChatCepat Indonesia',
                'type' => 'string',
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'key' => 'footer_address',
                'value' => 'Ruko Hampton Avenue Blok A no.10. Paramount - Gading Serpong. Tangerang, 15810',
                'type' => 'text',
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'key' => 'google_play_url',
                'value' => '#',
                'type' => 'string',
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'key' => 'app_store_url',
                'value' => '#',
                'type' => 'string',
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'key' => 'youtube_url',
                'value' => 'https://youtube.com',
                'type' => 'string',
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'key' => 'whatsapp_support',
                'value' => '6281234567890',
                'type' => 'string',
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'key' => 'email_support',
                'value' => 'support@chatcepat.com',
                'type' => 'string',
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
            'footer_tagline',
            'footer_company_name',
            'footer_address',
            'google_play_url',
            'app_store_url',
            'youtube_url',
            'whatsapp_support',
            'email_support'
        ])->delete();
    }
};
