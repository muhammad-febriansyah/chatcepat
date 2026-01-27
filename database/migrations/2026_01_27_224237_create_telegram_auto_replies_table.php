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
        Schema::create('telegram_auto_replies', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('telegram_bot_id')->constrained()->onDelete('cascade');
            $table->string('name');
            $table->enum('trigger_type', ['keyword', 'contains', 'exact', 'regex', 'all'])->default('keyword');
            $table->text('trigger_value')->nullable(); // keyword/pattern to match
            $table->enum('reply_type', ['text', 'photo', 'video', 'document'])->default('text');
            $table->text('reply_content'); // Message to send
            $table->string('reply_file_url')->nullable(); // File URL if media
            $table->boolean('is_active')->default(true);
            $table->integer('priority')->default(0); // Higher priority checked first
            $table->integer('usage_count')->default(0); // How many times this has been used
            $table->timestamp('last_used_at')->nullable();
            $table->timestamps();

            $table->index('user_id');
            $table->index('telegram_bot_id');
            $table->index('is_active');
            $table->index('priority');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('telegram_auto_replies');
    }
};
