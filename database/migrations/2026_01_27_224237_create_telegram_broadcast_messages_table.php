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
        Schema::create('telegram_broadcast_messages', function (Blueprint $table) {
            $table->id();
            $table->foreignId('telegram_broadcast_id')->constrained()->onDelete('cascade');
            $table->foreignId('telegram_contact_id')->constrained()->onDelete('cascade');
            $table->foreignId('telegram_message_id')->nullable()->constrained()->onDelete('set null');
            $table->enum('status', ['pending', 'sent', 'failed'])->default('pending');
            $table->text('error_message')->nullable();
            $table->timestamp('sent_at')->nullable();
            $table->timestamps();

            $table->index('telegram_broadcast_id');
            $table->index('telegram_contact_id');
            $table->index('status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('telegram_broadcast_messages');
    }
};
