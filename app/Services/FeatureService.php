<?php

namespace App\Services;

use App\Models\Feature;
use App\Repositories\FeatureRepository;
use Illuminate\Database\Eloquent\Collection;

class FeatureService
{
    public function __construct(
        protected FeatureRepository $featureRepository
    ) {}

    public function getAllFeatures(): Collection
    {
        return $this->featureRepository->getAll();
    }

    public function getActiveFeatures(): Collection
    {
        return $this->featureRepository->getActive();
    }

    public function getFeatureById(int $id): ?Feature
    {
        return $this->featureRepository->findByIdOrFail($id);
    }

    public function createFeature(array $data): Feature
    {
        $featureData = [
            'icon' => $data['icon'],
            'title' => $data['title'],
            'description' => $data['description'],
            'order' => $data['order'] ?? 0,
            'is_active' => $data['is_active'] ?? true,
        ];

        // Handle image upload
        if (isset($data['image']) && $data['image'] instanceof \Illuminate\Http\UploadedFile) {
            $path = $data['image']->store('features', 'public');
            $featureData['image'] = $path;
        }

        return $this->featureRepository->create($featureData);
    }

    public function updateFeature(int $id, array $data): Feature
    {
        $feature = $this->featureRepository->findByIdOrFail($id);

        $updateData = [
            'icon' => $data['icon'],
            'title' => $data['title'],
            'description' => $data['description'],
            'order' => $data['order'] ?? $feature->order,
            'is_active' => $data['is_active'] ?? $feature->is_active,
        ];

        // Handle image upload
        if (isset($data['image']) && $data['image'] instanceof \Illuminate\Http\UploadedFile) {
            // Delete old image if exists
            if ($feature->image && \Storage::disk('public')->exists($feature->image)) {
                \Storage::disk('public')->delete($feature->image);
            }

            // Store new image
            $path = $data['image']->store('features', 'public');
            $updateData['image'] = $path;
        }

        $this->featureRepository->update($feature, $updateData);

        return $feature->fresh();
    }

    public function deleteFeature(int $id): bool
    {
        $feature = $this->featureRepository->findByIdOrFail($id);

        // Delete image if exists
        if ($feature->image && \Storage::disk('public')->exists($feature->image)) {
            \Storage::disk('public')->delete($feature->image);
        }

        return $this->featureRepository->delete($feature);
    }
}
