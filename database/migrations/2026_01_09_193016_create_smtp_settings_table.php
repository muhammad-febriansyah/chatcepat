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
        Schema::create('smtp_settings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('name'); // Nama konfigurasi (e.g., "Gmail Primary", "SendGrid")
            $table->string('host'); // smtp.gmail.com
            $table->integer('port')->default(587); // 587, 465, 25
            $table->string('username'); // email atau username
            $table->text('password'); // akan di-encrypt
            $table->enum('encryption', ['tls', 'ssl', 'none'])->default('tls');
            $table->string('from_address'); // Email pengirim
            $table->string('from_name'); // Nama pengirim
            $table->boolean('is_active')->default(false); // SMTP aktif untuk user ini
            $table->boolean('is_verified')->default(false); // Sudah ditest atau belum
            $table->timestamp('verified_at')->nullable();
            $table->timestamps();

            // User hanya bisa punya 1 SMTP aktif
            $table->index(['user_id', 'is_active']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('smtp_settings');
    }
};
