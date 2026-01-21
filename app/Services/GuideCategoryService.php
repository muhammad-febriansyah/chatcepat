<?php

namespace App\Services;

use App\Models\GuideCategory;
use App\Repositories\GuideCategoryRepository;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Str;

class GuideCategoryService
{
    public function __construct(
        protected GuideCategoryRepository $repository
    ) {}

    public function getAllCategories(): Collection
    {
        return $this->repository->getAll();
    }

    public function getPaginatedCategories(int $perPage = 15): LengthAwarePaginator
    {
        return $this->repository->getPaginated($perPage);
    }

    public function getCategoryById(int $id): GuideCategory
    {
        return $this->repository->findByIdOrFail($id);
    }

    public function createCategory(array $data): GuideCategory
    {
        $data['slug'] = Str::slug($data['name']);
        return $this->repository->create($data);
    }

    public function updateCategory(int $id, array $data): GuideCategory
    {
        $category = $this->repository->findByIdOrFail($id);
        if (isset($data['name'])) {
            $data['slug'] = Str::slug($data['name']);
        }
        $this->repository->update($category, $data);
        return $category->fresh();
    }

    public function deleteCategory(int $id): bool
    {
        $category = $this->repository->findByIdOrFail($id);
        return $this->repository->delete($category);
    }
}
