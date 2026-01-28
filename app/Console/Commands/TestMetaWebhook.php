<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Http;

class TestMetaWebhook extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'meta:test-webhook {--url=}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Test Meta webhook URL accessibility and configuration';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('╔═══════════════════════════════════════════════════════════╗');
        $this->info('║         META WEBHOOK CONFIGURATION TEST                  ║');
        $this->info('╚═══════════════════════════════════════════════════════════╝');
        $this->newLine();

        // Get webhook URL
        $webhookUrl = $this->option('url') ?? config('app.url') . '/api/meta/webhook';
        $verifyToken = config('services.meta.webhook_verify_token');

        $this->info('📋 Configuration:');
        $this->comment("   Webhook URL: {$webhookUrl}");
        $this->comment("   Verify Token: {$verifyToken}");
        $this->newLine();

        // Test 1: Check URL accessibility
        $this->info('1️⃣  Testing webhook URL accessibility...');
        $this->testUrlAccessibility($webhookUrl);

        // Test 2: Test webhook verification (GET request)
        $this->newLine();
        $this->info('2️⃣  Testing webhook verification (GET)...');
        $this->testWebhookVerification($webhookUrl, $verifyToken);

        // Test 3: Check SSL certificate
        $this->newLine();
        $this->info('3️⃣  Checking SSL certificate...');
        $this->testSSL($webhookUrl);

        // Summary
        $this->newLine();
        $this->info('✅ Test completed!');
        $this->newLine();
        $this->comment('📚 Next steps:');
        $this->comment('   1. Update webhook in Meta Developer Dashboard');
        $this->comment('   2. Use this URL: ' . $webhookUrl);
        $this->comment('   3. Use this verify token: ' . $verifyToken);
        $this->comment('   4. Subscribe to webhook events');
        $this->newLine();
    }

    protected function testUrlAccessibility($url)
    {
        try {
            $response = Http::timeout(10)->get($url);

            if ($response->successful() || $response->status() === 403) {
                $this->info("   ✓ URL is accessible (Status: {$response->status()})");
                return true;
            } else {
                $this->error("   ✗ URL returned status: {$response->status()}");
                return false;
            }
        } catch (\Exception $e) {
            $this->error("   ✗ Failed to access URL");
            $this->comment("     Error: {$e->getMessage()}");
            return false;
        }
    }

    protected function testWebhookVerification($url, $verifyToken)
    {
        try {
            $challenge = 'test_challenge_' . time();

            $response = Http::timeout(10)->get($url, [
                'hub.mode' => 'subscribe',
                'hub.verify_token' => $verifyToken,
                'hub.challenge' => $challenge,
            ]);

            if ($response->successful() && $response->body() === $challenge) {
                $this->info('   ✓ Webhook verification successful');
                $this->comment('     → Verify token is correct');
                $this->comment('     → Challenge response is correct');
                return true;
            } else {
                $this->error('   ✗ Webhook verification failed');
                $this->comment("     Status: {$response->status()}");
                $this->comment("     Expected: {$challenge}");
                $this->comment("     Got: {$response->body()}");
                return false;
            }
        } catch (\Exception $e) {
            $this->error('   ✗ Failed to verify webhook');
            $this->comment("     Error: {$e->getMessage()}");
            return false;
        }
    }

    protected function testSSL($url)
    {
        if (strpos($url, 'https://') === 0) {
            try {
                $ch = curl_init($url);
                curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
                curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, true);
                curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, 2);
                curl_setopt($ch, CURLOPT_TIMEOUT, 10);

                $result = curl_exec($ch);
                $error = curl_error($ch);
                curl_close($ch);

                if ($result !== false) {
                    $this->info('   ✓ SSL certificate is valid');
                    $this->comment('     → HTTPS connection successful');
                    return true;
                } else {
                    $this->error('   ✗ SSL certificate issue');
                    $this->comment("     Error: {$error}");
                    return false;
                }
            } catch (\Exception $e) {
                $this->error('   ✗ SSL check failed');
                $this->comment("     Error: {$e->getMessage()}");
                return false;
            }
        } else {
            $this->warn('   ⚠ URL is not HTTPS');
            $this->comment('     → Meta requires HTTPS for webhooks');
            $this->comment('     → Please use HTTPS URL');
            return false;
        }
    }
}
