<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Http;

class MetaConfigCheck extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'meta:check-config {--test : Test API connection}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Check Meta Business API configuration for SaaS setup';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('╔═══════════════════════════════════════════════════════════╗');
        $this->info('║     META BUSINESS API CONFIGURATION CHECK                ║');
        $this->info('╚═══════════════════════════════════════════════════════════╝');
        $this->newLine();

        // Check .env configuration
        $this->checkEnvConfig();

        // Check config/services.php
        $this->checkServicesConfig();

        // Test API connection if --test flag is used
        if ($this->option('test')) {
            $this->newLine();
            $this->testApiConnection();
        }

        $this->newLine();
        $this->info('✅ Configuration check complete!');
        $this->newLine();
        $this->comment('📚 For detailed setup instructions, see:');
        $this->comment('   - SETUP_META_SAAS_COMPLETE.md');
        $this->comment('   - SETUP_META_WHATSAPP.md');
        $this->comment('   - SETUP_META_INSTAGRAM.md');
        $this->comment('   - SETUP_META_MESSENGER.md');
    }

    protected function checkEnvConfig()
    {
        $this->info('1. Checking .env Configuration:');
        $this->newLine();

        $configs = [
            'META_APP_ID' => [
                'value' => config('services.meta.app_id'),
                'required' => true,
                'description' => 'Meta App ID (Global - same for all users)',
            ],
            'META_APP_SECRET' => [
                'value' => config('services.meta.app_secret'),
                'required' => true,
                'description' => 'Meta App Secret (KEEP SECRET!)',
            ],
            'META_WEBHOOK_VERIFY_TOKEN' => [
                'value' => config('services.meta.webhook_verify_token'),
                'required' => true,
                'description' => 'Webhook Verify Token',
            ],
            'META_OAUTH_REDIRECT_URI' => [
                'value' => config('services.meta.oauth_redirect_uri'),
                'required' => false,
                'description' => 'OAuth Callback URL for user connections',
            ],
            'META_ACCESS_TOKEN' => [
                'value' => env('META_ACCESS_TOKEN'),
                'required' => false,
                'description' => 'System User Token (Optional - for admin testing)',
            ],
        ];

        foreach ($configs as $key => $config) {
            $value = $config['value'];
            $required = $config['required'];
            $description = $config['description'];

            if ($required && empty($value)) {
                $this->error("   ✗ {$key}: NOT SET ⚠️ REQUIRED");
            } elseif (empty($value)) {
                $this->warn("   ⚠ {$key}: Not set (optional)");
            } else {
                // Mask sensitive values
                $displayValue = $this->maskSensitiveValue($key, $value);
                $this->info("   ✓ {$key}: {$displayValue}");
            }
            $this->comment("     → {$description}");
            $this->newLine();
        }
    }

    protected function checkServicesConfig()
    {
        $this->info('2. Checking config/services.php:');
        $this->newLine();

        $metaConfig = config('services.meta');

        if (empty($metaConfig)) {
            $this->error('   ✗ Meta configuration not found in config/services.php');
            $this->comment('     → Add meta config to config/services.php');
            return;
        }

        $this->info('   ✓ Meta configuration found');
        $this->comment("     → Graph API Version: {$metaConfig['graph_api_version']}");
        $this->comment("     → Graph API URL: {$metaConfig['graph_api_url']}");
        $this->newLine();
    }

    protected function testApiConnection()
    {
        $this->info('3. Testing API Connection:');
        $this->newLine();

        $accessToken = env('META_ACCESS_TOKEN');

        if (empty($accessToken)) {
            $this->warn('   ⚠ META_ACCESS_TOKEN not set - skipping API test');
            $this->comment('     → Set META_ACCESS_TOKEN to test API connection');
            return;
        }

        $this->comment('   Testing Graph API connection...');

        try {
            $response = Http::get('https://graph.facebook.com/v21.0/me', [
                'access_token' => $accessToken,
            ]);

            if ($response->successful()) {
                $data = $response->json();
                $this->info('   ✓ API Connection: SUCCESS');
                $this->comment('     → User/Page ID: ' . ($data['id'] ?? 'N/A'));
                $this->comment('     → Name: ' . ($data['name'] ?? 'N/A'));
            } else {
                $this->error('   ✗ API Connection: FAILED');
                $error = $response->json();
                $this->error('     → Error: ' . ($error['error']['message'] ?? 'Unknown error'));
                $this->comment('     → Code: ' . ($error['error']['code'] ?? 'N/A'));
            }
        } catch (\Exception $e) {
            $this->error('   ✗ API Connection: ERROR');
            $this->error('     → ' . $e->getMessage());
        }

        $this->newLine();
    }

    protected function maskSensitiveValue($key, $value)
    {
        $sensitiveKeys = ['META_APP_SECRET', 'META_ACCESS_TOKEN', 'META_FACEBOOK_PAGE_ACCESS_TOKEN'];

        if (in_array($key, $sensitiveKeys)) {
            if (strlen($value) > 16) {
                return substr($value, 0, 8) . '...' . substr($value, -8);
            }
            return '••••••••';
        }

        return $value;
    }
}
