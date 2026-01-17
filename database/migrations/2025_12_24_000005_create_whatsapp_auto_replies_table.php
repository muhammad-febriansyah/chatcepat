<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('whatsapp_auto_replies', function (Blueprint $table) {
            $table->id();
            $table->foreignId('whatsapp_session_id')->constrained()->onDelete('cascade');
            $table->enum('trigger_type', ['keyword', 'regex', 'all'])->default('all');
            $table->string('trigger_value')->nullable();
            $table->enum('reply_type', ['openai', 'rajaongkir', 'custom'])->default('openai');
            $table->text('custom_reply')->nullable();
            $table->json('openai_config')->nullable();
            $table->boolean('is_active')->default(true);
            $table->integer('priority')->default(0);
            $table->timestamps();

            $table->index(['whatsapp_session_id', 'is_active', 'priority'], 'wa_auto_replies_session_active_priority_idx');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('whatsapp_auto_replies');
    }
};
