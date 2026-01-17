<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\AiAssistantType;

class AiAssistantTypeSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $types = [
            [
                'code' => 'sales',
                'name' => 'Sales Assistant',
                'description' => 'Fokus pada penjualan, closing deals, dan follow-up pelanggan. Persuasif dan berorientasi hasil.',
                'icon' => 'TrendingUp',
                'color' => 'text-green-600',
                'is_active' => true,
                'sort_order' => 1,
            ],
            [
                'code' => 'customer_service',
                'name' => 'Customer Service',
                'description' => 'Membantu pelanggan dengan pertanyaan, keluhan, dan dukungan umum. Ramah, sabar, dan empati.',
                'icon' => 'Headphones',
                'color' => 'text-blue-600',
                'is_active' => true,
                'sort_order' => 2,
            ],
            [
                'code' => 'technical_support',
                'name' => 'Technical Support',
                'description' => 'Ahli dalam troubleshooting dan memberikan solusi teknis. Detail-oriented dan sistematis.',
                'icon' => 'Settings',
                'color' => 'text-purple-600',
                'is_active' => true,
                'sort_order' => 3,
            ],
            [
                'code' => 'general',
                'name' => 'General Assistant',
                'description' => 'Asisten serba guna yang dapat membantu dengan berbagai keperluan. Versatile dan friendly.',
                'icon' => 'MessageCircle',
                'color' => 'text-gray-600',
                'is_active' => true,
                'sort_order' => 4,
            ],
        ];

        foreach ($types as $type) {
            AiAssistantType::updateOrCreate(
                ['code' => $type['code']],
                $type
            );
        }
    }
}
