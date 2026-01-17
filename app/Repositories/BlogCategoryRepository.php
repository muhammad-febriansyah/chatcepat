<?php

namespace App\Repositories;

use App\Models\BlogCategory;
use Illuminate\Database\Eloquent\Collection;

class BlogCategoryRepository
{
    public function __construct(
        protected BlogCategory $model
    ) {}

    public function getAll(): Collection
    {
        return $this->model->with('posts')->latest()->get();
    }

    public function findById(int $id): ?BlogCategory
    {
        return $this->model->find($id);
    }

    public function findByIdOrFail(int $id): BlogCategory
    {
        return $this->model->findOrFail($id);
    }

    public function create(array $data): BlogCategory
    {
        return $this->model->create($data);
    }

    public function update(BlogCategory $category, array $data): bool
    {
        return $category->update($data);
    }

    public function delete(BlogCategory $category): bool
    {
        return $category->delete();
    }
}
