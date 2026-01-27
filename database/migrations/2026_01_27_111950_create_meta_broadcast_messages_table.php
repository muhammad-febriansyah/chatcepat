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
        Schema::create('meta_broadcast_messages', function (Blueprint $table) {
            $table->id();
            $table->foreignId('broadcast_id')->constrained('meta_broadcasts')->onDelete('cascade');
            $table->foreignId('contact_id')->constrained('meta_contacts')->onDelete('cascade');
            $table->string('recipient_identifier'); // Phone number, IG ID, or FB PSID
            $table->string('meta_message_id')->nullable(); // Message ID from Meta API
            $table->enum('status', ['pending', 'sent', 'delivered', 'read', 'failed'])->default('pending');
            $table->timestamp('sent_at')->nullable();
            $table->timestamp('delivered_at')->nullable();
            $table->timestamp('read_at')->nullable();
            $table->text('error_message')->nullable();
            $table->timestamps();

            $table->index(['broadcast_id', 'status']);
            $table->index(['contact_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('meta_broadcast_messages');
    }
};
