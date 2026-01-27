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
        Schema::create('meta_contacts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->enum('platform', ['whatsapp', 'instagram', 'facebook']); // Platform type
            $table->string('identifier')->nullable(); // Phone number (WA), Instagram ID (IG), PSID (FB)
            $table->string('name')->nullable(); // Contact name
            $table->string('username')->nullable(); // Instagram/Facebook username
            $table->string('profile_pic')->nullable(); // Profile picture URL
            $table->string('email')->nullable();
            $table->json('custom_fields')->nullable(); // Custom data
            $table->json('tags')->nullable(); // Tags for grouping
            $table->text('notes')->nullable();
            $table->boolean('is_blocked')->default(false);
            $table->timestamp('last_message_at')->nullable(); // Last interaction
            $table->timestamps();

            $table->index(['user_id', 'platform']);
            $table->index(['user_id', 'identifier']);
            $table->unique(['user_id', 'platform', 'identifier']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('meta_contacts');
    }
};
