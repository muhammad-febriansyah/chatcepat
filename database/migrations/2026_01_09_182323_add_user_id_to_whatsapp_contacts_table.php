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
        // Add user_id column if it doesn't exist
        if (!Schema::hasColumn('whatsapp_contacts', 'user_id')) {
            Schema::table('whatsapp_contacts', function (Blueprint $table) {
                $table->foreignId('user_id')->after('id')->constrained()->onDelete('cascade');
            });
        }

        // Check if old unique constraint exists using raw query
        $indexes = \DB::select("SHOW INDEX FROM whatsapp_contacts WHERE Key_name = 'whatsapp_contacts_whatsapp_session_id_phone_number_unique'");

        if (!empty($indexes)) {
            // Drop existing unique constraint
            \DB::statement('ALTER TABLE whatsapp_contacts DROP INDEX whatsapp_contacts_whatsapp_session_id_phone_number_unique');
        }

        // Check if new unique constraint already exists
        $newIndexes = \DB::select("SHOW INDEX FROM whatsapp_contacts WHERE Key_name = 'wa_contacts_user_session_phone_unique'");

        if (empty($newIndexes)) {
            // Add new unique constraint including user_id with custom short name
            Schema::table('whatsapp_contacts', function (Blueprint $table) {
                $table->unique(['user_id', 'whatsapp_session_id', 'phone_number'], 'wa_contacts_user_session_phone_unique');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Check if new unique constraint exists
        $newIndexes = \DB::select("SHOW INDEX FROM whatsapp_contacts WHERE Key_name = 'wa_contacts_user_session_phone_unique'");

        if (!empty($newIndexes)) {
            // Drop the new unique constraint
            \DB::statement('ALTER TABLE whatsapp_contacts DROP INDEX wa_contacts_user_session_phone_unique');
        }

        // Check if old unique constraint exists
        $oldIndexes = \DB::select("SHOW INDEX FROM whatsapp_contacts WHERE Key_name = 'whatsapp_contacts_whatsapp_session_id_phone_number_unique'");

        if (empty($oldIndexes)) {
            // Restore old unique constraint
            Schema::table('whatsapp_contacts', function (Blueprint $table) {
                $table->unique(['whatsapp_session_id', 'phone_number']);
            });
        }

        // Drop user_id column
        if (Schema::hasColumn('whatsapp_contacts', 'user_id')) {
            Schema::table('whatsapp_contacts', function (Blueprint $table) {
                $table->dropForeign(['user_id']);
                $table->dropColumn('user_id');
            });
        }
    }
};
