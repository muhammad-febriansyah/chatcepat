<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        if (DB::getDriverName() !== 'sqlite') {
            DB::statement("ALTER TABLE whatsapp_sessions MODIFY COLUMN status ENUM('qr_pending', 'connecting', 'connected', 'disconnected', 'failed') NOT NULL DEFAULT 'qr_pending'");
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (DB::getDriverName() !== 'sqlite') {
            DB::statement("ALTER TABLE whatsapp_sessions MODIFY COLUMN status ENUM('qr_pending', 'connected', 'disconnected', 'failed') NOT NULL DEFAULT 'qr_pending'");
        }
    }
};
