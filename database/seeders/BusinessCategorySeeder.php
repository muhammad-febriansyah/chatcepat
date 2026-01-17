<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class BusinessCategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $categories = [
            ['id' => '7075b5cb-e54c-4d3f-9bcd-97235b8a77b6', 'name' => 'Bisnis Industri'],
            ['id' => '5e8e143e-39d8-4252-bf90-d3a347faddc4', 'name' => 'Bisnis Jasa Kesehatan'],
            ['id' => '7cd59925-ea39-4c79-80b9-c3f175808371', 'name' => 'Bisnis Jasa Pendidikan'],
            ['id' => 'fb197db2-47c9-4875-b6c3-8267ab0e328e', 'name' => 'Bisnis Jasa Transportasi'],
            ['id' => '4df8e33d-5937-4fdd-ac8f-1788846fb320', 'name' => 'Bisnis Keuangan'],
            ['id' => 'b5b1bdd6-1104-4518-ab7c-e9069806a572', 'name' => 'Bisnis Konstruksi'],
            ['id' => '059e3eab-9ab8-4991-9dbf-f4bf17b9b2e6', 'name' => 'Bisnis Lainnya'],
            ['id' => 'e4e8d6d4-6a8f-4a8b-857e-952624856d3b', 'name' => 'Bisnis Pariwisata'],
            ['id' => '9c6e16d1-fa86-4c51-b871-5636dd34e139', 'name' => 'Bisnis Perdagangan'],
            ['id' => 'a9541786-aad5-4c67-9c6b-bccf10dec2b0', 'name' => 'Bisnis Perikanan'],
            ['id' => 'c556f0e7-c2f9-4677-98ba-b8b6b46d86b8', 'name' => 'Bisnis Pertambangan'],
            ['id' => '0e6f6d1c-9058-4973-bd24-ae0359b02032', 'name' => 'Bisnis Pertanian'],
            ['id' => 'c373b3b2-c146-4f56-a7d8-e70db33c306a', 'name' => 'Bisnis Teknologi Informasi'],
        ];

        foreach ($categories as $category) {
            DB::table('business_categories')->insert([
                'id' => $category['id'],
                'name' => $category['name'],
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }
}
