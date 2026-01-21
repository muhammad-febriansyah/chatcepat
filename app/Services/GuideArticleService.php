<?php

namespace App\Services;

use App\Models\GuideArticle;
use App\Repositories\GuideArticleRepository;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Str;

class GuideArticleService
{
    public function __construct(
        protected GuideArticleRepository $repository
    ) {}

    public function getAllArticles(): Collection
    {
        return $this->repository->getAll();
    }

    public function getPaginatedArticles(int $perPage = 15): LengthAwarePaginator
    {
        return $this->repository->getPaginated($perPage);
    }

    public function getArticleById(int $id): GuideArticle
    {
        return $this->repository->findByIdOrFail($id);
    }

    public function createArticle(array $data): GuideArticle
    {
        $data['slug'] = Str::slug($data['title']);

        if (isset($data['featured_image'])) {
            $data['featured_image'] = $data['featured_image']->store('guide-articles', 'public');
        }

        return $this->repository->create($data);
    }

    public function updateArticle(int $id, array $data): GuideArticle
    {
        $article = $this->repository->findByIdOrFail($id);
        if (isset($data['title'])) {
            $data['slug'] = Str::slug($data['title']);
        }

        if (isset($data['featured_image'])) {
            // Delete old image if exists
            if ($article->featured_image && \Illuminate\Support\Facades\Storage::disk('public')->exists($article->featured_image)) {
                \Illuminate\Support\Facades\Storage::disk('public')->delete($article->featured_image);
            }
            $data['featured_image'] = $data['featured_image']->store('guide-articles', 'public');
        }

        $this->repository->update($article, $data);
        return $article->fresh();
    }

    public function deleteArticle(int $id): bool
    {
        $article = $this->repository->findByIdOrFail($id);
        
        if ($article->featured_image && \Illuminate\Support\Facades\Storage::disk('public')->exists($article->featured_image)) {
            \Illuminate\Support\Facades\Storage::disk('public')->delete($article->featured_image);
        }

        return $this->repository->delete($article);
    }

    public function searchArticles(string $query): Collection
    {
        return $this->repository->search($query);
    }
}
