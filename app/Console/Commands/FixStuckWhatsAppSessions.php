<?php

namespace App\Console\Commands;

use App\Models\WhatsappSession;
use Illuminate\Console\Command;

class FixStuckWhatsAppSessions extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'whatsapp:fix-stuck-sessions {--force : Force fix all connecting sessions}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Fix WhatsApp sessions stuck in connecting/qr_pending status';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('🔍 Checking for stuck WhatsApp sessions...');

        // Find sessions stuck in connecting or qr_pending status for more than 10 minutes
        $stuckSessions = WhatsappSession::whereIn('status', ['connecting', 'qr_pending'])
            ->where('updated_at', '<', now()->subMinutes(10))
            ->get();

        if ($this->option('force')) {
            // Force fix all connecting sessions regardless of time
            $stuckSessions = WhatsappSession::whereIn('status', ['connecting', 'qr_pending'])->get();
            $this->warn('⚠️  Force mode enabled: fixing ALL connecting/qr_pending sessions');
        }

        if ($stuckSessions->isEmpty()) {
            $this->info('✅ No stuck sessions found.');
            return 0;
        }

        $this->warn("Found {$stuckSessions->count()} stuck session(s):");

        $table = [];
        foreach ($stuckSessions as $session) {
            $table[] = [
                'ID' => $session->id,
                'User' => $session->user->name ?? 'N/A',
                'Name' => $session->name,
                'Status' => $session->status,
                'Updated' => $session->updated_at->diffForHumans(),
            ];
        }

        $this->table(['ID', 'User', 'Name', 'Status', 'Updated'], $table);

        if ($this->confirm('Do you want to reset these sessions to disconnected status?', true)) {
            $fixed = 0;
            foreach ($stuckSessions as $session) {
                $session->update([
                    'status' => 'disconnected',
                    'qr_code' => null,
                    'qr_expires_at' => null,
                ]);
                $fixed++;
                $this->line("  ✓ Fixed session: {$session->name}");
            }

            $this->info("✅ Successfully fixed {$fixed} session(s).");
            $this->line('');
            $this->info('💡 Users can now reconnect their sessions from WhatsApp Management page.');
        } else {
            $this->warn('⚠️  Operation cancelled.');
        }

        return 0;
    }
}
