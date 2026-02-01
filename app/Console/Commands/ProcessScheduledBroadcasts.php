<?php

namespace App\Console\Commands;

use App\Jobs\ProcessWhatsappBroadcast;
use App\Models\WhatsappBroadcast;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

class ProcessScheduledBroadcasts extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'broadcasts:process-scheduled';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Process scheduled WhatsApp broadcasts that are due';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $this->info('Checking for scheduled broadcasts...');

        // Find broadcasts that are scheduled and due
        $broadcasts = WhatsappBroadcast::where('status', 'pending')
            ->whereNotNull('scheduled_at')
            ->where('scheduled_at', '<=', now())
            ->get();

        if ($broadcasts->isEmpty()) {
            $this->info('No scheduled broadcasts to process.');
            return Command::SUCCESS;
        }

        $this->info("Found {$broadcasts->count()} broadcast(s) to process.");

        foreach ($broadcasts as $broadcast) {
            try {
                // Dispatch the job to process this broadcast
                ProcessWhatsappBroadcast::dispatch($broadcast);

                $this->info("Dispatched job for broadcast #{$broadcast->id} - {$broadcast->name}");

                Log::info("Scheduled broadcast dispatched", [
                    'broadcast_id' => $broadcast->id,
                    'name' => $broadcast->name,
                    'scheduled_at' => $broadcast->scheduled_at,
                ]);
            } catch (\Exception $e) {
                $this->error("Failed to dispatch broadcast #{$broadcast->id}: {$e->getMessage()}");

                Log::error("Failed to dispatch scheduled broadcast", [
                    'broadcast_id' => $broadcast->id,
                    'error' => $e->getMessage(),
                ]);
            }
        }

        $this->info('Scheduled broadcasts processing completed.');
        return Command::SUCCESS;
    }
}
