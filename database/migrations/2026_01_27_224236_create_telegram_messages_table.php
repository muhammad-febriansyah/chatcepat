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
        Schema::create('telegram_messages', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('telegram_bot_id')->constrained()->onDelete('cascade');
            $table->foreignId('telegram_contact_id')->nullable()->constrained()->onDelete('set null');
            $table->string('message_id')->nullable(); // Telegram message ID
            $table->string('chat_id'); // Telegram chat ID
            $table->enum('direction', ['inbound', 'outbound']);
            $table->enum('type', ['text', 'photo', 'video', 'document', 'audio', 'voice', 'sticker', 'location', 'contact', 'poll', 'other'])->default('text');
            $table->text('content')->nullable(); // Text content
            $table->string('file_url')->nullable(); // File URL if any
            $table->string('file_type')->nullable(); // mime type
            $table->integer('file_size')->nullable(); // in bytes
            $table->json('metadata')->nullable(); // Additional message data
            $table->enum('status', ['pending', 'sent', 'delivered', 'read', 'failed'])->default('pending');
            $table->text('error_message')->nullable();
            $table->timestamp('sent_at')->nullable();
            $table->timestamp('delivered_at')->nullable();
            $table->timestamp('read_at')->nullable();
            $table->timestamps();

            $table->index('user_id');
            $table->index('telegram_bot_id');
            $table->index('telegram_contact_id');
            $table->index('chat_id');
            $table->index('direction');
            $table->index('status');
            $table->index('created_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('telegram_messages');
    }
};
