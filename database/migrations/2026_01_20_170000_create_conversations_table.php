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
        Schema::create('conversations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('whatsapp_session_id')->constrained()->onDelete('cascade');
            $table->foreignId('human_agent_id')->nullable()->constrained()->onDelete('set null');
            $table->string('customer_phone');
            $table->string('customer_name')->nullable();
            $table->enum('status', ['open', 'pending', 'resolved', 'closed'])->default('open');
            $table->timestamp('last_message_at')->nullable();
            $table->text('last_message_text')->nullable();
            $table->string('last_message_from')->nullable(); // 'customer' or 'agent'
            $table->boolean('unread_by_agent')->default(true);
            $table->integer('unread_count')->default(0);
            $table->json('metadata')->nullable(); // Store additional info like tags, priority, etc.
            $table->timestamps();
            $table->softDeletes();

            // Indexes for better performance
            $table->index(['whatsapp_session_id', 'status']);
            $table->index(['human_agent_id', 'status']);
            $table->index('customer_phone');
        });

        Schema::create('conversation_messages', function (Blueprint $table) {
            $table->id();
            $table->foreignId('conversation_id')->constrained()->onDelete('cascade');
            $table->string('message_id')->unique(); // WhatsApp message ID
            $table->enum('direction', ['inbound', 'outbound']); // inbound = from customer, outbound = to customer
            $table->text('message_text')->nullable();
            $table->string('message_type')->default('text'); // text, image, document, video, audio, etc.
            $table->json('media')->nullable(); // Store media URLs and metadata
            $table->foreignId('human_agent_id')->nullable()->constrained()->onDelete('set null'); // Who sent the reply (if outbound)
            $table->boolean('is_read')->default(false);
            $table->timestamp('read_at')->nullable();
            $table->timestamps();

            $table->index('conversation_id');
            $table->index('message_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('conversation_messages');
        Schema::dropIfExists('conversations');
    }
};
