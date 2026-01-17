<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\ScraperCategory;

class ScraperCategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $categories = [
            [
                'name' => 'Restoran',
                'slug' => 'restoran',
                'image' => null,
                'is_active' => true,
                'order' => 1,
            ],
            [
                'name' => 'Cafe',
                'slug' => 'cafe',
                'image' => null,
                'is_active' => true,
                'order' => 2,
            ],
            [
                'name' => 'Hotel',
                'slug' => 'hotel',
                'image' => null,
                'is_active' => true,
                'order' => 3,
            ],
            [
                'name' => 'Toko',
                'slug' => 'toko',
                'image' => null,
                'is_active' => true,
                'order' => 4,
            ],
            [
                'name' => 'Salon',
                'slug' => 'salon',
                'image' => null,
                'is_active' => true,
                'order' => 5,
            ],
            [
                'name' => 'Barbershop',
                'slug' => 'barbershop',
                'image' => null,
                'is_active' => true,
                'order' => 6,
            ],
            [
                'name' => 'Klinik',
                'slug' => 'klinik',
                'image' => null,
                'is_active' => true,
                'order' => 7,
            ],
            [
                'name' => 'Apotek',
                'slug' => 'apotek',
                'image' => null,
                'is_active' => true,
                'order' => 8,
            ],
            [
                'name' => 'Gym',
                'slug' => 'gym',
                'image' => null,
                'is_active' => true,
                'order' => 9,
            ],
            [
                'name' => 'Fitness Center',
                'slug' => 'fitness-center',
                'image' => null,
                'is_active' => true,
                'order' => 10,
            ],
            [
                'name' => 'Bengkel',
                'slug' => 'bengkel',
                'image' => null,
                'is_active' => true,
                'order' => 11,
            ],
            [
                'name' => 'Laundry',
                'slug' => 'laundry',
                'image' => null,
                'is_active' => true,
                'order' => 12,
            ],
            [
                'name' => 'Sekolah',
                'slug' => 'sekolah',
                'image' => null,
                'is_active' => true,
                'order' => 13,
            ],
            [
                'name' => 'Kursus',
                'slug' => 'kursus',
                'image' => null,
                'is_active' => true,
                'order' => 14,
            ],
            [
                'name' => 'Bank',
                'slug' => 'bank',
                'image' => null,
                'is_active' => true,
                'order' => 15,
            ],
            [
                'name' => 'ATM',
                'slug' => 'atm',
                'image' => null,
                'is_active' => true,
                'order' => 16,
            ],
            [
                'name' => 'SPBU',
                'slug' => 'spbu',
                'image' => null,
                'is_active' => true,
                'order' => 17,
            ],
            [
                'name' => 'Minimarket',
                'slug' => 'minimarket',
                'image' => null,
                'is_active' => true,
                'order' => 18,
            ],
            [
                'name' => 'Supermarket',
                'slug' => 'supermarket',
                'image' => null,
                'is_active' => true,
                'order' => 19,
            ],
            [
                'name' => 'Dokter',
                'slug' => 'dokter',
                'image' => null,
                'is_active' => true,
                'order' => 20,
            ],
            [
                'name' => 'Rumah Sakit',
                'slug' => 'rumah-sakit',
                'image' => null,
                'is_active' => true,
                'order' => 21,
            ],
            [
                'name' => 'Properti',
                'slug' => 'properti',
                'image' => null,
                'is_active' => true,
                'order' => 22,
            ],
            [
                'name' => 'Spa',
                'slug' => 'spa',
                'image' => null,
                'is_active' => true,
                'order' => 23,
            ],
            [
                'name' => 'Massage',
                'slug' => 'massage',
                'image' => null,
                'is_active' => true,
                'order' => 24,
            ],
            [
                'name' => 'Butik',
                'slug' => 'butik',
                'image' => null,
                'is_active' => true,
                'order' => 25,
            ],
            [
                'name' => 'Bakery',
                'slug' => 'bakery',
                'image' => null,
                'is_active' => true,
                'order' => 26,
            ],
            [
                'name' => 'Fotografi',
                'slug' => 'fotografi',
                'image' => null,
                'is_active' => true,
                'order' => 27,
            ],
            [
                'name' => 'Event Organizer',
                'slug' => 'event-organizer',
                'image' => null,
                'is_active' => true,
                'order' => 28,
            ],
            [
                'name' => 'Kantor Pos',
                'slug' => 'kantor-pos',
                'image' => null,
                'is_active' => true,
                'order' => 29,
            ],
            [
                'name' => 'Pet Shop',
                'slug' => 'pet-shop',
                'image' => null,
                'is_active' => true,
                'order' => 30,
            ],
        ];

        foreach ($categories as $category) {
            ScraperCategory::create($category);
        }
    }
}
