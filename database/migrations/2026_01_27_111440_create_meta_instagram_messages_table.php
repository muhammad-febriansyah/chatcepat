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
        Schema::create('meta_instagram_messages', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('message_id')->unique(); // Meta message ID
            $table->string('ig_message_id')->nullable(); // Instagram message ID
            $table->string('from'); // Instagram user ID (IGSID)
            $table->string('to'); // Instagram account ID
            $table->string('instagram_account_id'); // Connected IG Business Account ID
            $table->enum('type', ['text', 'image', 'video', 'audio', 'file', 'story_mention', 'story_reply', 'share', 'like']);
            $table->enum('direction', ['inbound', 'outbound']);
            $table->text('content')->nullable(); // Message text
            $table->json('media')->nullable(); // Media attachments
            $table->json('metadata')->nullable(); // Additional data (username, profile_pic, etc)
            $table->string('status')->default('pending'); // pending, sent, delivered, read, failed
            $table->timestamp('sent_at')->nullable();
            $table->timestamp('read_at')->nullable();
            $table->text('error_message')->nullable();
            $table->timestamps();

            $table->index(['user_id', 'from']);
            $table->index(['user_id', 'to']);
            $table->index(['instagram_account_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('meta_instagram_messages');
    }
};
