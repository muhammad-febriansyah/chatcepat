<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Cache;

class RajaOngkirService
{
    private $apiKey;
    private $baseUrl = 'https://rajaongkir.komerce.id/api/v1';

    public function __construct()
    {
        $this->apiKey = config('services.rajaongkir.key');
    }

    /**
     * Check shipping cost
     */
    public function checkShippingCost(string $origin, string $destination, int $weight = 1000, string $courier = 'jne'): array
    {
        try {
            // Search cities first
            $originCity = $this->searchCity($origin);
            $destinationCity = $this->searchCity($destination);

            if (!$originCity) {
                throw new \Exception("Kota asal \"{$origin}\" tidak ditemukan");
            }

            if (!$destinationCity) {
                throw new \Exception("Kota tujuan \"{$destination}\" tidak ditemukan");
            }

            // Calculate cost
            $response = Http::withHeaders([
                'key' => $this->apiKey,
                'Content-Type' => 'application/x-www-form-urlencoded',
            ])->asForm()->post("{$this->baseUrl}/calculate/domestic-cost", [
                'origin' => $originCity['id'],
                'destination' => $destinationCity['id'],
                'weight' => $weight,
                'courier' => $courier,
            ]);

            if ($response->failed()) {
                throw new \Exception('Gagal menghubungi server RajaOngkir');
            }

            $data = $response->json();
            
            if (empty($data['data'])) {
                // Fallback: return location info if no courier available
                 return [[
                    'courier' => 'INFO',
                    'service' => 'LOCATION',
                    'description' => "{$originCity['district_name']} -> {$destinationCity['district_name']}",
                    'cost' => 0,
                    'etd' => "{$originCity['city_name']} -> {$destinationCity['city_name']}",
                ]];
            }

            $costs = [];
            foreach ($data['data'] as $item) {
                $costs[] = [
                    'courier' => $item['name'],
                    'service' => $item['service'],
                    'description' => $item['description'],
                    'cost' => $item['cost'],
                    'etd' => $item['etd'],
                ];
            }

            return $costs;

        } catch (\Exception $e) {
            Log::error('RajaOngkir Error: ' . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Search city/district
     */
    private function searchCity(string $query): ?array
    {
        return Cache::remember('city_search_' . md5($query), 86400, function () use ($query) {
            $response = Http::withHeaders([
                'key' => $this->apiKey,
            ])->get("{$this->baseUrl}/destination/domestic-destination", [
                'search' => $query,
                'limit' => 1,
            ]);

            if ($response->successful()) {
                $data = $response->json();
                return $data['data'][0] ?? null;
            }

            return null;
        });
    }

    /**
     * Format Reply
     */
    public function formatShippingCostReply(array $costs): string
    {
        if (empty($costs)) {
            return "Maaf, tidak ada layanan pengiriman yang tersedia.";
        }

        // Check for INFO fallback
        if (count($costs) === 1 && $costs[0]['courier'] === 'INFO') {
             $info = $costs[0];
             return "📍 *Pencarian Ongkir*\n\n" .
                    "Rute: {$info['etd']}\n" .
                    "Kecamatan: {$info['description']}\n\n" .
                    "⚠️ _Fitur cek harga sedang gangguan, namun lokasi berhasil ditemukan._";
        }

        $reply = "📦 *Informasi Ongkos Kirim*\n\n";
        
        // Group by courier (already flattened in our simple implementation but good practice)
        $grouped = [];
        foreach ($costs as $cost) {
            $grouped[$cost['courier']][] = $cost;
        }

        foreach ($grouped as $courierName => $services) {
            $reply .= "*{$courierName}*\n";
            foreach ($services as $service) {
                $cost = number_format($service['cost'], 0, ',', '.');
                $reply .= "• {$service['service']}: Rp {$cost}\n";
                $reply .= "  _{$service['description']}_\n";
                $reply .= "  Estimasi: {$service['etd']} hari\n\n";
            }
        }

        $reply .= "_Harga sudah termasuk PPN_\n";
        return $reply;
    }
}
