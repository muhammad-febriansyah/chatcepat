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
        Schema::create('meta_facebook_messages', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('message_id')->unique(); // Meta message ID
            $table->string('fb_message_id')->nullable(); // Facebook Messenger message ID
            $table->string('from'); // Facebook user PSID
            $table->string('to'); // Page ID
            $table->string('page_id'); // Connected Facebook Page ID
            $table->enum('type', ['text', 'image', 'video', 'audio', 'file', 'template', 'quick_reply', 'postback', 'attachment']);
            $table->enum('direction', ['inbound', 'outbound']);
            $table->text('content')->nullable(); // Message text
            $table->json('attachments')->nullable(); // Media attachments
            $table->json('quick_replies')->nullable(); // Quick reply buttons
            $table->json('metadata')->nullable(); // Additional data
            $table->string('status')->default('pending'); // pending, sent, delivered, read, failed
            $table->timestamp('sent_at')->nullable();
            $table->timestamp('delivered_at')->nullable();
            $table->timestamp('read_at')->nullable();
            $table->text('error_message')->nullable();
            $table->timestamps();

            $table->index(['user_id', 'from']);
            $table->index(['user_id', 'to']);
            $table->index(['page_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('meta_facebook_messages');
    }
};
