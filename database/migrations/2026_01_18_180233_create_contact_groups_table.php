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
        Schema::create('contact_groups', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('name', 100);
            $table->text('description')->nullable();
            $table->enum('source', ['manual', 'whatsapp'])->default('manual');
            $table->string('whatsapp_group_jid')->nullable();
            $table->foreignId('whatsapp_session_id')->nullable()->constrained()->onDelete('set null');
            $table->integer('members_count')->default(0);
            $table->timestamps();

            $table->index(['user_id', 'source']);
            $table->index('whatsapp_group_jid');
        });

        Schema::create('contact_group_members', function (Blueprint $table) {
            $table->id();
            $table->foreignId('contact_group_id')->constrained()->onDelete('cascade');
            $table->string('phone_number', 20);
            $table->string('name', 100)->nullable();
            $table->timestamps();

            $table->unique(['contact_group_id', 'phone_number']);
            $table->index('phone_number');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('contact_group_members');
        Schema::dropIfExists('contact_groups');
    }
};
