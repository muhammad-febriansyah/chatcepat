<?php

namespace App\Repositories;

use App\Models\GuideArticle;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;

class GuideArticleRepository
{
    public function __construct(
        protected GuideArticle $model
    ) {}

    /**
     * Get all articles
     */
    public function getAll(): Collection
    {
        return $this->model->with('category')->orderBy('sort_order', 'asc')->get();
    }

    /**
     * Get paginated articles
     */
    public function getPaginated(int $perPage = 15): LengthAwarePaginator
    {
        return $this->model->with('category')->orderBy('sort_order', 'asc')->paginate($perPage);
    }

    /**
     * Find article by ID
     */
    public function findByIdOrFail(int $id): GuideArticle
    {
        return $this->model->findOrFail($id);
    }

    /**
     * Create new article
     */
    public function create(array $data): GuideArticle
    {
        return $this->model->create($data);
    }

    /**
     * Update article
     */
    public function update(GuideArticle $article, array $data): bool
    {
        return $article->update($data);
    }

    /**
     * Delete article
     */
    public function delete(GuideArticle $article): bool
    {
        return $article->delete();
    }

    /**
     * Search articles
     */
    public function search(string $query): Collection
    {
        return $this->model
            ->where('title', 'like', "%{$query}%")
            ->orWhere('content', 'like', "%{$query}%")
            ->with('category')
            ->orderBy('sort_order', 'asc')
            ->get();
    }
}
