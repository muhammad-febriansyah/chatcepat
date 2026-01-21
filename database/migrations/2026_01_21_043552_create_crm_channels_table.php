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
        Schema::create('crm_channels', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('platform'); // whatsapp_cloud, instagram, messenger
            $table->string('name')->nullable(); // Display name for the channel
            $table->text('credentials')->nullable(); // Encrypted JSON with API credentials
            $table->string('status')->default('disconnected'); // connected, disconnected, error
            $table->boolean('webhook_verified')->default(false);
            $table->string('phone_number')->nullable(); // For WhatsApp
            $table->string('account_id')->nullable(); // Platform-specific account ID
            $table->timestamp('last_sync_at')->nullable();
            $table->text('error_message')->nullable();
            $table->timestamps();
            
            $table->unique(['user_id', 'platform', 'account_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('crm_channels');
    }
};
