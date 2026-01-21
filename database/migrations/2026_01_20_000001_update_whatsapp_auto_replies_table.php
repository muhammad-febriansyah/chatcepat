<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('whatsapp_auto_replies', function (Blueprint $table) {
            // Add name column for better identification
            $table->string('name', 100)->after('whatsapp_session_id')->nullable();

            // Change trigger_type to support more options
            $table->string('trigger_type_new', 20)->after('name')->default('contains');

            // Add response_type for different media types
            $table->enum('response_type', ['text', 'photo', 'document'])->after('reply_type')->default('text');

            // Add response_media_url for photo/document
            $table->string('response_media_url', 500)->nullable()->after('custom_reply');
        });

        // Migrate old data
        \DB::statement("UPDATE whatsapp_auto_replies SET trigger_type_new = CASE
            WHEN trigger_type = 'keyword' THEN 'contains'
            WHEN trigger_type = 'regex' THEN 'regex'
            WHEN trigger_type = 'all' THEN 'all'
            ELSE 'contains'
        END");

        // Drop old column and rename new
        Schema::table('whatsapp_auto_replies', function (Blueprint $table) {
            $table->dropColumn('trigger_type');
        });

        Schema::table('whatsapp_auto_replies', function (Blueprint $table) {
            $table->renameColumn('trigger_type_new', 'trigger_type');
        });
    }

    public function down(): void
    {
        Schema::table('whatsapp_auto_replies', function (Blueprint $table) {
            $table->dropColumn(['name', 'response_type', 'response_media_url']);

            // Restore original trigger_type enum
            $table->enum('trigger_type_old', ['keyword', 'regex', 'all'])->after('whatsapp_session_id')->default('all');
        });

        \DB::statement("UPDATE whatsapp_auto_replies SET trigger_type_old = CASE
            WHEN trigger_type = 'contains' THEN 'keyword'
            WHEN trigger_type = 'exact' THEN 'keyword'
            WHEN trigger_type = 'starts_with' THEN 'keyword'
            ELSE trigger_type
        END");

        Schema::table('whatsapp_auto_replies', function (Blueprint $table) {
            $table->dropColumn('trigger_type');
        });

        Schema::table('whatsapp_auto_replies', function (Blueprint $table) {
            $table->renameColumn('trigger_type_old', 'trigger_type');
        });
    }
};
