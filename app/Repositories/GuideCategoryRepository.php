<?php

namespace App\Repositories;

use App\Models\GuideCategory;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;

class GuideCategoryRepository
{
    public function __construct(
        protected GuideCategory $model
    ) {}

    /**
     * Get all categories
     */
    public function getAll(): Collection
    {
        return $this->model->orderBy('sort_order', 'asc')->get();
    }

    /**
     * Get paginated categories
     */
    public function getPaginated(int $perPage = 15): LengthAwarePaginator
    {
        return $this->model->orderBy('sort_order', 'asc')->paginate($perPage);
    }

    /**
     * Find category by ID
     */
    public function findByIdOrFail(int $id): GuideCategory
    {
        return $this->model->findOrFail($id);
    }

    /**
     * Create new category
     */
    public function create(array $data): GuideCategory
    {
        return $this->model->create($data);
    }

    /**
     * Update category
     */
    public function update(GuideCategory $category, array $data): bool
    {
        return $category->update($data);
    }

    /**
     * Delete category
     */
    public function delete(GuideCategory $category): bool
    {
        return $category->delete();
    }
}
