<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('email_broadcasts', function (Blueprint $table) {
            $table->foreignId('user_email_id')->nullable()->after('smtp_setting_id')->constrained()->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('email_broadcasts', function (Blueprint $table) {
            $table->dropForeign(['user_email_id']);
            $table->dropColumn('user_email_id');
        });
    }
};
