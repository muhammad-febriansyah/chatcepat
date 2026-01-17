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
        Schema::create('settings', function (Blueprint $table) {
            $table->id();
            $table->string('key')->unique();
            $table->text('value')->nullable();
            $table->string('type')->default('string'); // string, text, boolean, json
            $table->timestamps();
        });

        // Insert default settings
        DB::table('settings')->insert([
            ['key' => 'site_name', 'value' => 'ChatCepat', 'type' => 'string', 'created_at' => now(), 'updated_at' => now()],
            ['key' => 'site_description', 'value' => 'Platform Chat AI Tercepat dan Terpercaya di Indonesia', 'type' => 'text', 'created_at' => now(), 'updated_at' => now()],
            ['key' => 'contact_email', 'value' => 'info@chatcepat.id', 'type' => 'string', 'created_at' => now(), 'updated_at' => now()],
            ['key' => 'contact_phone', 'value' => '+62 812-3456-7890', 'type' => 'string', 'created_at' => now(), 'updated_at' => now()],
            ['key' => 'address', 'value' => 'Jl. Sudirman No. 123, Jakarta Pusat, DKI Jakarta 10220', 'type' => 'text', 'created_at' => now(), 'updated_at' => now()],
            ['key' => 'facebook_url', 'value' => 'https://facebook.com/chatcepat', 'type' => 'string', 'created_at' => now(), 'updated_at' => now()],
            ['key' => 'twitter_url', 'value' => 'https://twitter.com/chatcepat', 'type' => 'string', 'created_at' => now(), 'updated_at' => now()],
            ['key' => 'instagram_url', 'value' => 'https://instagram.com/chatcepat.id', 'type' => 'string', 'created_at' => now(), 'updated_at' => now()],
            ['key' => 'linkedin_url', 'value' => 'https://linkedin.com/company/chatcepat', 'type' => 'string', 'created_at' => now(), 'updated_at' => now()],
            ['key' => 'meta_keywords', 'value' => 'chat ai, artificial intelligence, chatbot indonesia, ai chat, chatcepat, chat cepat', 'type' => 'text', 'created_at' => now(), 'updated_at' => now()],
            ['key' => 'meta_description', 'value' => 'ChatCepat adalah platform chat AI tercepat dan terpercaya di Indonesia. Nikmati pengalaman chat dengan AI yang canggih dan responsif.', 'type' => 'text', 'created_at' => now(), 'updated_at' => now()],
        ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('settings');
    }
};
