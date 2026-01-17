<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Insert new settings
        DB::table('settings')->insert([
            ['key' => 'tiktok_url', 'value' => '', 'type' => 'string', 'created_at' => now(), 'updated_at' => now()],
            ['key' => 'logo', 'value' => '', 'type' => 'string', 'created_at' => now(), 'updated_at' => now()],
            ['key' => 'favicon', 'value' => '', 'type' => 'string', 'created_at' => now(), 'updated_at' => now()],
        ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::table('settings')->whereIn('key', ['tiktok_url', 'logo', 'favicon'])->delete();
    }
};
