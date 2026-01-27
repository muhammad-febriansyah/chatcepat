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
        Schema::table('users', function (Blueprint $table) {
            $table->boolean('widget_enabled')->default(false);
            $table->string('widget_color', 7)->default('#25D366');
            $table->string('widget_position', 20)->default('bottom-right');
            $table->string('widget_greeting')->nullable();
            $table->string('widget_placeholder')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'widget_enabled',
                'widget_color',
                'widget_position',
                'widget_greeting',
                'widget_placeholder',
            ]);
        });
    }
};
