<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('whatsapp_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('whatsapp_session_id')->nullable()->constrained()->onDelete('set null');
            $table->enum('level', ['debug', 'info', 'warning', 'error'])->default('info');
            $table->string('event_type', 50);
            $table->text('message');
            $table->json('metadata')->nullable();
            $table->timestamp('created_at');

            $table->index(['whatsapp_session_id', 'created_at']);
            $table->index(['event_type', 'level']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('whatsapp_logs');
    }
};
