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
        Schema::create('meta_auto_replies', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->enum('platform', ['whatsapp', 'instagram', 'facebook']); // Platform type
            $table->string('name'); // Auto reply name
            $table->enum('trigger_type', ['keyword', 'all', 'greeting', 'away']); // Trigger condition
            $table->text('keywords')->nullable(); // JSON array of keywords
            $table->enum('match_type', ['exact', 'contains', 'starts_with', 'ends_with'])->default('contains');

            // Reply content
            $table->enum('reply_type', ['text', 'image', 'video', 'audio', 'document', 'template']);
            $table->text('reply_message')->nullable(); // Text message
            $table->string('media_url')->nullable(); // Media URL
            $table->string('media_caption')->nullable(); // Caption for media
            $table->string('template_name')->nullable(); // Template name for WhatsApp
            $table->json('template_data')->nullable(); // Template variables

            // Conditions
            $table->json('business_hours')->nullable(); // Operating hours
            $table->boolean('only_first_message')->default(false); // Reply only to first message

            // Status
            $table->boolean('is_active')->default(true);
            $table->integer('priority')->default(0); // Higher priority processed first
            $table->integer('usage_count')->default(0); // Track how many times used

            $table->timestamps();

            $table->index(['user_id', 'platform', 'is_active']);
            $table->index(['trigger_type', 'is_active']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('meta_auto_replies');
    }
};
