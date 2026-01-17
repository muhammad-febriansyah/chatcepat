<?php

namespace App\Repositories;

use App\Models\Feature;
use Illuminate\Database\Eloquent\Collection;

class FeatureRepository
{
    public function getAll(): Collection
    {
        return Feature::ordered()->get();
    }

    public function getActive(): Collection
    {
        return Feature::active()->ordered()->get();
    }

    public function findById(int $id): ?Feature
    {
        return Feature::find($id);
    }

    public function findByIdOrFail(int $id): Feature
    {
        return Feature::findOrFail($id);
    }

    public function create(array $data): Feature
    {
        return Feature::create($data);
    }

    public function update(Feature $feature, array $data): bool
    {
        return $feature->update($data);
    }

    public function delete(Feature $feature): bool
    {
        return $feature->delete();
    }
}
