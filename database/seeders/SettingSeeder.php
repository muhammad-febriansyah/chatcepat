<?php

namespace Database\Seeders;

use App\Models\Setting;
use Illuminate\Database\Seeder;

class SettingSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $settings = [
            [
                'key' => 'site_name',
                'value' => config('app.name', 'ChatCepat'),
                'type' => 'string',
            ],
            [
                'key' => 'site_logo',
                'value' => null, // Upload through admin panel
                'type' => 'image',
            ],
            [
                'key' => 'site_description',
                'value' => 'Platform WhatsApp Gateway dan Broadcast Message',
                'type' => 'text',
            ],
            [
                'key' => 'support_email',
                'value' => 'support@chatcepat.com',
                'type' => 'string',
            ],
            [
                'key' => 'support_phone',
                'value' => '+62 812 3456 7890',
                'type' => 'string',
            ],
            [
                'key' => 'company_address',
                'value' => 'Indonesia',
                'type' => 'text',
            ],
            [
                'key' => 'social_facebook',
                'value' => null,
                'type' => 'string',
            ],
            [
                'key' => 'social_instagram',
                'value' => null,
                'type' => 'string',
            ],
            [
                'key' => 'social_twitter',
                'value' => null,
                'type' => 'string',
            ],
        ];

        foreach ($settings as $setting) {
            Setting::updateOrCreate(
                ['key' => $setting['key']],
                $setting
            );
        }

        $this->command->info('Settings seeded successfully.');
    }
}
