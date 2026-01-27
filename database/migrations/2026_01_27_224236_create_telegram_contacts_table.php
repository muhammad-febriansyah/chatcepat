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
        Schema::create('telegram_contacts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('telegram_bot_id')->nullable()->constrained()->onDelete('cascade');
            $table->string('telegram_id')->nullable(); // Telegram user ID
            $table->string('username')->nullable();
            $table->string('first_name')->nullable();
            $table->string('last_name')->nullable();
            $table->string('phone')->nullable();
            $table->text('bio')->nullable();
            $table->boolean('is_bot')->default(false);
            $table->boolean('is_verified')->default(false);
            $table->boolean('is_premium')->default(false);
            $table->json('metadata')->nullable(); // Additional data from Telegram
            $table->timestamp('last_interaction_at')->nullable();
            $table->timestamps();

            $table->index('user_id');
            $table->index('telegram_bot_id');
            $table->index('telegram_id');
            $table->index('username');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('telegram_contacts');
    }
};
