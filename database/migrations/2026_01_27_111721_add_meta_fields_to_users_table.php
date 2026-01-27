<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // Meta WhatsApp Business API
            $table->string('meta_whatsapp_phone_number_id')->nullable()->after('remember_token');
            $table->string('meta_whatsapp_business_account_id')->nullable();

            // Meta Instagram Business
            $table->string('meta_instagram_account_id')->nullable();

            // Meta Facebook Page
            $table->string('meta_facebook_page_id')->nullable();
            $table->text('meta_facebook_page_access_token')->nullable();

            // Meta App Access Token (per user if needed)
            $table->text('meta_access_token')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'meta_whatsapp_phone_number_id',
                'meta_whatsapp_business_account_id',
                'meta_instagram_account_id',
                'meta_facebook_page_id',
                'meta_facebook_page_access_token',
                'meta_access_token'
            ]);
        });
    }
};
