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
        // Insert Trial package
        PricingPackage::create([
            'name' => 'Trial',
            'slug' => 'trial',
            'description' => 'Paket gratis untuk mencoba fitur-fitur ChatCepat selama 3 hari',
            'price' => 0,
            'currency' => 'IDR',
            'period' => 3,
            'period_unit' => 'day',
            'features' => [
                'Human Agent (1)',
                'AI Agent (1)',
                'Nomor WhatsApp (1)',
                'Broadcast WhatsApp (Terbatas)',
                'Template WhatsApp (5)',
                'Scraping Contacts (Terbatas)',
                'Auto-Reply Manual (Terbatas)',
            ],
            'feature_keys' => [
                'human_agent',
                'ai_agent',
                'whatsapp_session',
                'whatsapp_broadcast',
                'whatsapp_template',
                'scraping_contacts',
                'auto_reply',
            ],
            'is_featured' => false,
            'is_active' => true,
            'order' => 0,
            'button_text' => 'Mulai Trial Gratis',
            'button_url' => '/register',
        ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        PricingPackage::where('slug', 'trial')->delete();
    }
};
