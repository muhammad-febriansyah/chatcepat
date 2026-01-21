<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreGuideCategoryRequest;
use App\Http\Requests\Admin\UpdateGuideCategoryRequest;
use App\Services\GuideCategoryService;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class GuideCategoryController extends Controller
{
    public function __construct(
        protected GuideCategoryService $service
    ) {}

    public function index(): Response
    {
        $categories = $this->service->getAllCategories();

        return Inertia::render('admin/guide-categories/index', [
            'categories' => $categories,
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('admin/guide-categories/create');
    }

    public function store(StoreGuideCategoryRequest $request): RedirectResponse
    {
        $this->service->createCategory($request->validated());

        return redirect()
            ->route('admin.guides.categories.index')
            ->with('success', 'Kategori panduan berhasil ditambahkan!');
    }

    public function edit(int $id): Response
    {
        $category = $this->service->getCategoryById($id);

        return Inertia::render('admin/guide-categories/edit', [
            'category' => $category,
        ]);
    }

    public function update(UpdateGuideCategoryRequest $request, int $id): RedirectResponse
    {
        $this->service->updateCategory($id, $request->validated());

        return redirect()
            ->route('admin.guides.categories.index')
            ->with('success', 'Kategori panduan berhasil diperbarui!');
    }

    public function destroy(int $id): RedirectResponse
    {
        $this->service->deleteCategory($id);

        return redirect()
            ->route('admin.guides.categories.index')
            ->with('success', 'Kategori panduan berhasil dihapus!');
    }
}
