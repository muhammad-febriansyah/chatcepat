<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('whatsapp_messages', function (Blueprint $table) {
            $table->id();
            $table->foreignId('whatsapp_session_id')->constrained()->onDelete('cascade');
            $table->string('message_id', 100)->unique();
            $table->string('from_number', 100);
            $table->string('to_number', 100);
            $table->enum('direction', ['incoming', 'outgoing']);
            $table->enum('type', ['text', 'image', 'video', 'audio', 'document', 'sticker', 'location', 'contact', 'other'])->default('text');
            $table->text('content')->nullable();
            $table->json('media_metadata')->nullable();
            $table->enum('status', ['pending', 'sent', 'delivered', 'read', 'failed'])->default('pending');
            $table->boolean('is_auto_reply')->default(false);
            $table->string('auto_reply_source', 50)->nullable();
            $table->json('context')->nullable();
            $table->timestamp('sent_at')->nullable();
            $table->timestamp('delivered_at')->nullable();
            $table->timestamp('read_at')->nullable();
            $table->timestamps();

            $table->index(['whatsapp_session_id', 'created_at']);
            $table->index(['from_number', 'to_number']);
            $table->index(['direction', 'status']);
            $table->index('is_auto_reply');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('whatsapp_messages');
    }
};
