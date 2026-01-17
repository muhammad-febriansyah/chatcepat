<?php

namespace App\Services;

use App\Models\Page;
use App\Repositories\PageRepository;
use Illuminate\Database\Eloquent\Collection;

class PageService
{
    public function __construct(
        protected PageRepository $pageRepository
    ) {}

    public function getAllPages(): Collection
    {
        return $this->pageRepository->getAll();
    }

    public function getPageById(int $id): ?Page
    {
        return $this->pageRepository->findByIdOrFail($id);
    }

    public function getPageBySlug(string $slug): ?Page
    {
        return $this->pageRepository->findBySlug($slug);
    }

    public function updatePage(int $id, array $data): Page
    {
        $page = $this->pageRepository->findByIdOrFail($id);

        $updateData = [
            'title' => $data['title'],
            'content' => $data['content'],
            'excerpt' => $data['excerpt'] ?? null,
            'meta_title' => $data['meta_title'] ?? null,
            'meta_description' => $data['meta_description'] ?? null,
            'meta_keywords' => $data['meta_keywords'] ?? null,
            'is_active' => $data['is_active'] ?? true,
        ];

        $this->pageRepository->update($page, $updateData);

        return $page->fresh();
    }

    public function updatePageBySlug(string $slug, array $data): Page
    {
        $page = $this->pageRepository->findBySlugOrFail($slug);

        $updateData = [
            'title' => $data['title'],
            'content' => $data['content'],
            'excerpt' => $data['excerpt'] ?? null,
            'meta_title' => $data['meta_title'] ?? null,
            'meta_description' => $data['meta_description'] ?? null,
            'meta_keywords' => $data['meta_keywords'] ?? null,
            'is_active' => $data['is_active'] ?? true,
        ];

        $this->pageRepository->update($page, $updateData);

        return $page->fresh();
    }

    public function getActivePages(): Collection
    {
        return $this->pageRepository->getActivePages();
    }
}
