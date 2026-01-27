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
        Schema::create('meta_broadcasts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->enum('platform', ['whatsapp', 'instagram', 'facebook']); // Platform type
            $table->string('name'); // Broadcast campaign name

            // Message content
            $table->enum('message_type', ['text', 'image', 'video', 'audio', 'document', 'template']);
            $table->text('message_content')->nullable(); // Text message
            $table->string('media_url')->nullable(); // Media URL for files
            $table->string('media_caption')->nullable(); // Caption for media
            $table->string('template_name')->nullable(); // WhatsApp template name
            $table->json('template_data')->nullable(); // Template parameters

            // Recipients
            $table->enum('recipient_type', ['all', 'groups', 'contacts']); // Who to send to
            $table->json('recipient_groups')->nullable(); // Contact group IDs
            $table->json('recipient_contacts')->nullable(); // Specific contact IDs

            // Scheduling
            $table->enum('schedule_type', ['now', 'scheduled'])->default('now');
            $table->timestamp('scheduled_at')->nullable(); // When to send

            // Status & Statistics
            $table->enum('status', ['draft', 'scheduled', 'processing', 'completed', 'failed', 'cancelled'])->default('draft');
            $table->integer('total_recipients')->default(0);
            $table->integer('sent_count')->default(0);
            $table->integer('failed_count')->default(0);
            $table->integer('delivered_count')->default(0);
            $table->integer('read_count')->default(0);

            $table->timestamp('started_at')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->text('error_message')->nullable();

            $table->timestamps();

            $table->index(['user_id', 'platform', 'status']);
            $table->index(['status', 'scheduled_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('meta_broadcasts');
    }
};
