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
        // Change whatsapp_messages.content to LONGTEXT
        DB::statement('ALTER TABLE whatsapp_messages MODIFY content LONGTEXT NULL');
        
        // Also change conversations.last_message_text if exists
        if (Schema::hasColumn('conversations', 'last_message_text')) {
            DB::statement('ALTER TABLE conversations MODIFY last_message_text LONGTEXT NULL');
        }
        
        // Also change conversation_messages.message_text if exists
        if (Schema::hasColumn('conversation_messages', 'message_text')) {
            DB::statement('ALTER TABLE conversation_messages MODIFY message_text LONGTEXT NULL');
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::statement('ALTER TABLE whatsapp_messages MODIFY content TEXT NULL');
        
        if (Schema::hasColumn('conversations', 'last_message_text')) {
            DB::statement('ALTER TABLE conversations MODIFY last_message_text TEXT NULL');
        }
        
        if (Schema::hasColumn('conversation_messages', 'message_text')) {
            DB::statement('ALTER TABLE conversation_messages MODIFY message_text TEXT NULL');
        }
    }
};
