<?php

namespace App\Repositories;

use App\Models\PricingPackage;
use Illuminate\Database\Eloquent\Collection;

class PricingPackageRepository
{
    public function getAll(): Collection
    {
        return PricingPackage::ordered()->get();
    }

    public function getActive(): Collection
    {
        return PricingPackage::active()->ordered()->get();
    }

    public function getFeatured(): Collection
    {
        return PricingPackage::featured()->active()->ordered()->get();
    }

    public function findById(int $id): ?PricingPackage
    {
        return PricingPackage::find($id);
    }

    public function findByIdOrFail(int $id): PricingPackage
    {
        return PricingPackage::findOrFail($id);
    }

    public function findBySlug(string $slug): ?PricingPackage
    {
        return PricingPackage::where('slug', $slug)->first();
    }

    public function create(array $data): PricingPackage
    {
        return PricingPackage::create($data);
    }

    public function update(PricingPackage $package, array $data): bool
    {
        return $package->update($data);
    }

    public function delete(PricingPackage $package): bool
    {
        return $package->delete();
    }
}
