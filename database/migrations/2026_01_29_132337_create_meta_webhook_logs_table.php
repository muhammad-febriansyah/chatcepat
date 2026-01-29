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
        Schema::create('meta_webhook_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->onDelete('cascade');
            $table->string('platform'); // whatsapp, instagram, facebook
            $table->string('event_type'); // messages, messaging_postbacks, etc
            $table->string('status'); // success, failed, pending
            $table->json('payload'); // Full webhook payload
            $table->json('response')->nullable(); // Response sent back
            $table->text('error_message')->nullable();
            $table->string('sender_id')->nullable();
            $table->string('recipient_id')->nullable();
            $table->string('message_id')->nullable();
            $table->timestamps();

            $table->index(['user_id', 'platform', 'created_at']);
            $table->index('status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('meta_webhook_logs');
    }
};
