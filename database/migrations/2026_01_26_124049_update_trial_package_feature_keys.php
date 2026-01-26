<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use App\Models\PricingPackage;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Update Trial package with feature_keys
        $trialPackage = PricingPackage::where('slug', 'trial')->first();

        if ($trialPackage) {
            $trialPackage->update([
                'feature_keys' => [
                    'human_agent',
                    'ai_agent',
                    'whatsapp_session',
                    'whatsapp_broadcast',
                    'whatsapp_template',
                    'scraping_contacts',
                    'auto_reply',
                ],
            ]);
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Revert Trial package feature_keys to empty
        $trialPackage = PricingPackage::where('slug', 'trial')->first();

        if ($trialPackage) {
            $trialPackage->update([
                'feature_keys' => [],
            ]);
        }
    }
};
