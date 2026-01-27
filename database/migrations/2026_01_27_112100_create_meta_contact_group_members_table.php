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
        Schema::create('meta_contact_group_members', function (Blueprint $table) {
            $table->id();
            $table->foreignId('group_id')->constrained('meta_contact_groups')->onDelete('cascade');
            $table->foreignId('contact_id')->constrained('meta_contacts')->onDelete('cascade');
            $table->timestamps();

            $table->unique(['group_id', 'contact_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('meta_contact_group_members');
    }
};
