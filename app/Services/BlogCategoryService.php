<?php

namespace App\Services;

use App\Models\BlogCategory;
use App\Repositories\BlogCategoryRepository;
use Illuminate\Database\Eloquent\Collection;

class BlogCategoryService
{
    public function __construct(
        protected BlogCategoryRepository $categoryRepository
    ) {}

    public function getAllCategories(): Collection
    {
        return $this->categoryRepository->getAll();
    }

    public function getCategoryById(int $id): ?BlogCategory
    {
        return $this->categoryRepository->findByIdOrFail($id);
    }

    public function createCategory(array $data): BlogCategory
    {
        return $this->categoryRepository->create([
            'name' => $data['name'],
            'description' => $data['description'] ?? null,
        ]);
    }

    public function updateCategory(int $id, array $data): BlogCategory
    {
        $category = $this->categoryRepository->findByIdOrFail($id);

        $this->categoryRepository->update($category, [
            'name' => $data['name'],
            'description' => $data['description'] ?? null,
        ]);

        return $category->fresh();
    }

    public function deleteCategory(int $id): bool
    {
        $category = $this->categoryRepository->findByIdOrFail($id);

        if ($category->posts()->count() > 0) {
            throw new \Exception('Tidak dapat menghapus kategori yang masih memiliki artikel.');
        }

        return $this->categoryRepository->delete($category);
    }
}
