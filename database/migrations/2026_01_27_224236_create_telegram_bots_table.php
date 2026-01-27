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
        Schema::create('telegram_bots', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('telegram_session_id')->nullable()->constrained()->onDelete('set null');
            $table->string('name');
            $table->string('username')->unique();
            $table->text('token');
            $table->text('description')->nullable();
            $table->boolean('is_active')->default(true);
            $table->boolean('auto_reply_enabled')->default(false);
            $table->string('webhook_url')->nullable();
            $table->timestamp('last_activity_at')->nullable();
            $table->timestamps();

            $table->index('user_id');
            $table->index('username');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('telegram_bots');
    }
};
