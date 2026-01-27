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
        Schema::create('meta_whatsapp_messages', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('message_id')->unique(); // Meta message ID
            $table->string('wamid')->nullable(); // WhatsApp message ID
            $table->string('from'); // Phone number
            $table->string('to'); // Phone number
            $table->string('phone_number_id'); // Meta phone number ID
            $table->enum('type', ['text', 'image', 'video', 'audio', 'document', 'location', 'contacts', 'interactive', 'button', 'template', 'sticker']);
            $table->enum('direction', ['inbound', 'outbound']);
            $table->text('content')->nullable(); // Text content or caption
            $table->json('media')->nullable(); // Media info (url, mime_type, etc)
            $table->json('metadata')->nullable(); // Additional metadata
            $table->string('status')->default('pending'); // pending, sent, delivered, read, failed
            $table->timestamp('sent_at')->nullable();
            $table->timestamp('delivered_at')->nullable();
            $table->timestamp('read_at')->nullable();
            $table->text('error_message')->nullable();
            $table->timestamps();

            $table->index(['user_id', 'from']);
            $table->index(['user_id', 'to']);
            $table->index(['phone_number_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('meta_whatsapp_messages');
    }
};
