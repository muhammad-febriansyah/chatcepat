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
        Schema::create('message_templates', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');

            // Template Info
            $table->string('name'); // Nama template
            $table->enum('type', ['whatsapp', 'email']); // Jenis template
            $table->string('subject')->nullable(); // Subject untuk email
            $table->text('content'); // Isi template

            // Variables/Placeholders yang tersedia
            $table->json('variables')->nullable(); // [{name: 'customer_name', example: 'John Doe'}]

            // Media attachments (untuk WhatsApp)
            $table->string('media_url')->nullable();
            $table->enum('media_type', ['image', 'video', 'document', 'audio'])->nullable();

            // Categorization
            $table->string('category')->nullable(); // Marketing, Support, Notification, dll
            $table->text('description')->nullable();

            // Usage tracking
            $table->integer('usage_count')->default(0);
            $table->timestamp('last_used_at')->nullable();

            // Status
            $table->boolean('is_active')->default(true);

            $table->timestamps();
            $table->softDeletes();

            // Indexes
            $table->index('user_id');
            $table->index('type');
            $table->index('category');
            $table->index('is_active');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('message_templates');
    }
};
