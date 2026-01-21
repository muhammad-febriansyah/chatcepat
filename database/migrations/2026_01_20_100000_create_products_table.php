<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('products', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('name', 200);
            $table->string('code', 50)->nullable(); // SKU/Product code
            $table->decimal('price', 15, 2)->default(0);
            $table->decimal('sale_price', 15, 2)->nullable(); // Discounted price
            $table->text('description')->nullable();
            $table->text('short_description')->nullable(); // For quick replies
            $table->string('image_url', 500)->nullable();
            $table->string('category', 100)->nullable();
            $table->text('message_template')->nullable(); // Custom message template for this product
            $table->boolean('is_active')->default(true);
            $table->integer('stock')->nullable(); // Optional stock tracking
            $table->json('metadata')->nullable(); // Additional data (variants, specs, etc)
            $table->timestamps();

            $table->index(['user_id', 'is_active']);
            $table->index(['user_id', 'category']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('products');
    }
};
