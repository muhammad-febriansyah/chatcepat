<?php

namespace App\Console\Commands;

use App\Models\WhatsappContact;
use App\Models\WhatsappMessage;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class SyncContactNamesFromMessages extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'contacts:sync-names';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Sync contact names (push_name) from incoming messages';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Syncing contact names from messages...');

        // Get unique push_names from messages
        $messagesWithNames = DB::table('whatsapp_messages')
            ->select('whatsapp_session_id', 'from_number', 'push_name')
            ->whereNotNull('push_name')
            ->where('push_name', '!=', '')
            ->where('direction', 'incoming')
            ->groupBy('whatsapp_session_id', 'from_number', 'push_name')
            ->get();

        $this->info("Found {$messagesWithNames->count()} unique contacts with push_name in messages");

        $updated = 0;
        $created = 0;

        foreach ($messagesWithNames as $msg) {
            // Get session to find user_id
            $session = DB::table('whatsapp_sessions')
                ->where('id', $msg->whatsapp_session_id)
                ->first();

            if (!$session) {
                continue;
            }

            // Update or create contact
            $contact = WhatsappContact::where('whatsapp_session_id', $msg->whatsapp_session_id)
                ->where('phone_number', $msg->from_number)
                ->first();

            if ($contact) {
                // Only update if push_name is empty
                if (empty($contact->push_name)) {
                    $contact->push_name = $msg->push_name;
                    $contact->save();
                    $updated++;
                    $this->line("  Updated: {$msg->from_number} -> {$msg->push_name}");
                }
            } else {
                // Create new contact
                WhatsappContact::create([
                    'user_id' => $session->user_id,
                    'whatsapp_session_id' => $msg->whatsapp_session_id,
                    'phone_number' => $msg->from_number,
                    'push_name' => $msg->push_name,
                    'is_group' => false,
                    'is_business' => false,
                ]);
                $created++;
                $this->line("  Created: {$msg->from_number} -> {$msg->push_name}");
            }
        }

        $this->info("Done! Updated: {$updated}, Created: {$created}");

        return Command::SUCCESS;
    }
}
