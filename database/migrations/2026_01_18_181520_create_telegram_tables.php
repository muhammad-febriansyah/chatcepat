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
        // Telegram Bots table
        Schema::create('telegram_bots', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('bot_token', 100);
            $table->string('bot_username', 100)->nullable();
            $table->string('bot_first_name', 100)->nullable();
            $table->bigInteger('bot_id')->nullable();
            $table->string('webhook_secret', 64)->nullable();
            $table->boolean('is_active')->default(true);
            $table->boolean('auto_reply_enabled')->default(false);
            $table->json('settings')->nullable();
            $table->timestamp('last_webhook_at')->nullable();
            $table->timestamps();

            $table->unique(['user_id', 'bot_token']);
            $table->index('bot_id');
            $table->index('is_active');
        });

        // Telegram Messages table
        Schema::create('telegram_messages', function (Blueprint $table) {
            $table->id();
            $table->foreignId('telegram_bot_id')->constrained()->onDelete('cascade');
            $table->bigInteger('telegram_message_id')->nullable();
            $table->bigInteger('chat_id');
            $table->string('chat_type', 20)->default('private'); // private, group, supergroup, channel
            $table->string('chat_title')->nullable();
            $table->bigInteger('from_user_id')->nullable();
            $table->string('from_username')->nullable();
            $table->string('from_first_name')->nullable();
            $table->enum('direction', ['incoming', 'outgoing']);
            $table->enum('type', ['text', 'photo', 'video', 'audio', 'document', 'sticker', 'voice', 'location', 'contact', 'other'])->default('text');
            $table->text('content')->nullable();
            $table->json('media_metadata')->nullable();
            $table->boolean('is_auto_reply')->default(false);
            $table->timestamps();

            $table->index(['telegram_bot_id', 'chat_id']);
            $table->index(['telegram_bot_id', 'created_at']);
            $table->index('direction');
        });

        // Telegram Auto Replies table
        Schema::create('telegram_auto_replies', function (Blueprint $table) {
            $table->id();
            $table->foreignId('telegram_bot_id')->constrained()->onDelete('cascade');
            $table->string('name', 100);
            $table->enum('trigger_type', ['exact', 'contains', 'starts_with', 'regex', 'all']);
            $table->string('trigger_value', 500)->nullable(); // null for 'all' type
            $table->enum('response_type', ['text', 'photo', 'document']);
            $table->text('response_content');
            $table->string('response_media_url')->nullable();
            $table->boolean('is_active')->default(true);
            $table->integer('priority')->default(0);
            $table->timestamps();

            $table->index(['telegram_bot_id', 'is_active']);
            $table->index('priority');
        });

        // Telegram Broadcasts table
        Schema::create('telegram_broadcasts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('telegram_bot_id')->constrained()->onDelete('cascade');
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('name', 100);
            $table->enum('type', ['text', 'photo', 'document'])->default('text');
            $table->text('content');
            $table->string('media_url')->nullable();
            $table->json('recipient_chat_ids');
            $table->integer('total_recipients')->default(0);
            $table->integer('sent_count')->default(0);
            $table->integer('failed_count')->default(0);
            $table->enum('status', ['pending', 'processing', 'completed', 'failed', 'cancelled'])->default('pending');
            $table->timestamp('scheduled_at')->nullable();
            $table->timestamp('started_at')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->text('error_message')->nullable();
            $table->timestamps();

            $table->index(['telegram_bot_id', 'status']);
            $table->index(['user_id', 'created_at']);
        });

        // Telegram Contacts/Subscribers table (people who messaged the bot)
        Schema::create('telegram_contacts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('telegram_bot_id')->constrained()->onDelete('cascade');
            $table->bigInteger('chat_id');
            $table->string('chat_type', 20)->default('private');
            $table->string('username')->nullable();
            $table->string('first_name')->nullable();
            $table->string('last_name')->nullable();
            $table->string('chat_title')->nullable(); // for groups
            $table->boolean('is_blocked')->default(false);
            $table->timestamp('last_message_at')->nullable();
            $table->timestamps();

            $table->unique(['telegram_bot_id', 'chat_id']);
            $table->index('chat_id');
            $table->index('is_blocked');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('telegram_contacts');
        Schema::dropIfExists('telegram_broadcasts');
        Schema::dropIfExists('telegram_auto_replies');
        Schema::dropIfExists('telegram_messages');
        Schema::dropIfExists('telegram_bots');
    }
};
