<?php

namespace App\Repositories;

use App\Models\Page;
use Illuminate\Database\Eloquent\Collection;

class PageRepository
{
    public function getAll(): Collection
    {
        return Page::orderBy('title')->get();
    }

    public function findById(int $id): ?Page
    {
        return Page::find($id);
    }

    public function findByIdOrFail(int $id): Page
    {
        return Page::findOrFail($id);
    }

    public function findBySlug(string $slug): ?Page
    {
        return Page::bySlug($slug)->first();
    }

    public function findBySlugOrFail(string $slug): Page
    {
        return Page::bySlug($slug)->firstOrFail();
    }

    public function create(array $data): Page
    {
        return Page::create($data);
    }

    public function update(Page $page, array $data): bool
    {
        return $page->update($data);
    }

    public function delete(Page $page): bool
    {
        return $page->delete();
    }

    public function getActivePages(): Collection
    {
        return Page::active()->orderBy('title')->get();
    }
}
