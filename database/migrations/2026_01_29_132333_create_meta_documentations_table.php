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
        Schema::create('meta_documentations', function (Blueprint $table) {
            $table->id();
            $table->string('platform'); // whatsapp, instagram, facebook
            $table->string('title');
            $table->string('slug')->unique();
            $table->text('content');
            $table->string('video_url')->nullable(); // Google Drive embed URL
            $table->string('icon')->nullable();
            $table->integer('order')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('meta_documentations');
    }
};
