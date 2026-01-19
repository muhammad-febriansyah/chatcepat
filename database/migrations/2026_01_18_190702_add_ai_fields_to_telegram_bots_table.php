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
        Schema::table('telegram_bots', function (Blueprint $table) {
            $table->boolean('ai_enabled')->default(false)->after('auto_reply_enabled');
            $table->string('ai_assistant_type')->default('general')->after('ai_enabled');
            $table->text('ai_system_prompt')->nullable()->after('ai_assistant_type');
            $table->decimal('ai_temperature', 3, 2)->default(0.7)->after('ai_system_prompt');
            $table->integer('ai_max_tokens')->default(500)->after('ai_temperature');
        });
    }

    public function down(): void
    {
        Schema::table('telegram_bots', function (Blueprint $table) {
            $table->dropColumn(['ai_enabled', 'ai_assistant_type', 'ai_system_prompt', 'ai_temperature', 'ai_max_tokens']);
        });
    }
};
