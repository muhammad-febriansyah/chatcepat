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
        Schema::create('ai_assistant_types', function (Blueprint $table) {
            $table->id();
            $table->string('code')->unique(); // sales, customer_service, etc
            $table->string('name'); // Sales Assistant, Customer Service, etc
            $table->text('description'); // Description of the AI type
            $table->string('icon')->nullable(); // Icon name (e.g., 'TrendingUp')
            $table->string('color')->nullable(); // Tailwind color class
            $table->boolean('is_active')->default(true);
            $table->integer('sort_order')->default(0);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('ai_assistant_types');
    }
};
