<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('whatsapp_rate_limits', function (Blueprint $table) {
            $table->id();
            $table->foreignId('whatsapp_session_id')->unique()->constrained()->onDelete('cascade');
            $table->integer('messages_sent_last_hour')->default(0);
            $table->integer('messages_sent_today')->default(0);
            $table->timestamp('last_message_sent_at')->nullable();
            $table->timestamp('cooldown_until')->nullable();
            $table->json('hourly_buckets')->nullable();
            $table->timestamps();

            $table->index('cooldown_until');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('whatsapp_rate_limits');
    }
};
