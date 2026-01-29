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
        Schema::create('meta_message_templates', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('category'); // greeting, follow_up, marketing, support, etc
            $table->string('platform'); // whatsapp, instagram, facebook, all
            $table->text('content');
            $table->json('variables')->nullable(); // Available variables like {{name}}, {{product}}
            $table->string('language')->default('id');
            $table->boolean('is_system')->default(true); // System template or user-created
            $table->boolean('is_active')->default(true);
            $table->integer('usage_count')->default(0);
            $table->timestamps();

            $table->index(['platform', 'category']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('meta_message_templates');
    }
};
