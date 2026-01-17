<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('whatsapp_contacts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('whatsapp_session_id')->constrained()->onDelete('cascade');
            $table->string('phone_number', 100);
            $table->string('display_name')->nullable();
            $table->string('push_name')->nullable();
            $table->boolean('is_business')->default(false);
            $table->boolean('is_group')->default(false);
            $table->json('metadata')->nullable();
            $table->timestamp('last_message_at')->nullable();
            $table->timestamps();

            $table->unique(['whatsapp_session_id', 'phone_number']);
            $table->index(['whatsapp_session_id', 'last_message_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('whatsapp_contacts');
    }
};
