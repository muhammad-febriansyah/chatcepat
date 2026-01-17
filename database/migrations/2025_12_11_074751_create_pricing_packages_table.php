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
        Schema::create('pricing_packages', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->text('description');
            $table->decimal('price', 10, 2);
            $table->string('currency')->default('IDR'); // IDR, USD, etc.
            $table->integer('period')->default(1); // 1, 3, 6, 12
            $table->string('period_unit')->default('month'); // month, year
            $table->json('features'); // Array of features
            $table->boolean('is_featured')->default(false);
            $table->boolean('is_active')->default(true);
            $table->integer('order')->default(0);
            $table->string('button_text')->default('Pilih Paket');
            $table->string('button_url')->nullable();
            $table->timestamps();

            $table->index('slug');
            $table->index('is_featured');
            $table->index('is_active');
            $table->index('order');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('pricing_packages');
    }
};
