<?php

namespace App\Services;

use App\Models\PricingPackage;
use App\Repositories\PricingPackageRepository;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Str;

class PricingPackageService
{
    public function __construct(
        protected PricingPackageRepository $pricingPackageRepository
    ) {}

    public function getAllPackages(): Collection
    {
        return $this->pricingPackageRepository->getAll();
    }

    public function getActivePackages(): Collection
    {
        return $this->pricingPackageRepository->getActive();
    }

    public function getFeaturedPackages(): Collection
    {
        return $this->pricingPackageRepository->getFeatured();
    }

    public function getPackageById(int $id): ?PricingPackage
    {
        return $this->pricingPackageRepository->findByIdOrFail($id);
    }

    public function createPackage(array $data): PricingPackage
    {
        $packageData = [
            'name' => $data['name'],
            'slug' => $data['slug'] ?? Str::slug($data['name']),
            'description' => $data['description'],
            'price' => $data['price'],
            'currency' => $data['currency'] ?? 'IDR',
            'period' => $data['period'] ?? 1,
            'period_unit' => $data['period_unit'] ?? 'month',
            'features' => $data['features'] ?? [],
            'is_featured' => $data['is_featured'] ?? false,
            'is_active' => $data['is_active'] ?? true,
            'order' => $data['order'] ?? 0,
            'button_text' => $data['button_text'] ?? 'Pilih Paket',
            'button_url' => $data['button_url'] ?? null,
        ];

        return $this->pricingPackageRepository->create($packageData);
    }

    public function updatePackage(int $id, array $data): PricingPackage
    {
        $package = $this->pricingPackageRepository->findByIdOrFail($id);

        $updateData = [
            'name' => $data['name'],
            'slug' => $data['slug'] ?? Str::slug($data['name']),
            'description' => $data['description'],
            'price' => $data['price'],
            'currency' => $data['currency'] ?? $package->currency,
            'period' => $data['period'] ?? $package->period,
            'period_unit' => $data['period_unit'] ?? $package->period_unit,
            'features' => $data['features'] ?? [],
            'is_featured' => $data['is_featured'] ?? $package->is_featured,
            'is_active' => $data['is_active'] ?? $package->is_active,
            'order' => $data['order'] ?? $package->order,
            'button_text' => $data['button_text'] ?? $package->button_text,
            'button_url' => $data['button_url'] ?? $package->button_url,
        ];

        $this->pricingPackageRepository->update($package, $updateData);

        return $package->fresh();
    }

    public function deletePackage(int $id): bool
    {
        $package = $this->pricingPackageRepository->findByIdOrFail($id);
        return $this->pricingPackageRepository->delete($package);
    }
}
