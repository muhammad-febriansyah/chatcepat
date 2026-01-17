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
        Schema::create('google_map_places', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('kecamatan');
            $table->string('location');
            $table->string('category')->nullable();
            $table->decimal('rating', 3, 2)->nullable();
            $table->integer('review_count')->nullable();
            $table->text('address')->nullable();
            $table->string('phone')->nullable();
            $table->string('website')->nullable();
            $table->text('url')->nullable();
            $table->timestamp('scraped_at')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('google_map_places');
    }
};
