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
        Schema::create('whatsapp_group_members', function (Blueprint $table) {
            $table->id();
            $table->foreignId('whatsapp_group_id')->constrained('whatsapp_groups')->onDelete('cascade');
            $table->string('participant_jid'); // Original JID (could be LID or phone)
            $table->string('phone_number')->nullable(); // Resolved phone number
            $table->string('display_name')->nullable();
            $table->string('push_name')->nullable();
            $table->boolean('is_admin')->default(false);
            $table->boolean('is_super_admin')->default(false);
            $table->boolean('is_lid_format')->default(false); // True if JID is LID format
            $table->json('metadata')->nullable();
            $table->timestamps();

            $table->unique(['whatsapp_group_id', 'participant_jid']);
            $table->index('phone_number');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('whatsapp_group_members');
    }
};
