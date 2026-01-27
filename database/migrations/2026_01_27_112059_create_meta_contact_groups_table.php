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
        Schema::create('meta_contact_groups', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->enum('platform', ['whatsapp', 'instagram', 'facebook', 'all']); // Platform or all
            $table->string('name'); // Group name
            $table->text('description')->nullable();
            $table->string('color')->nullable(); // For UI labeling
            $table->integer('contacts_count')->default(0); // Cache count
            $table->timestamps();

            $table->index(['user_id', 'platform']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('meta_contact_groups');
    }
};
