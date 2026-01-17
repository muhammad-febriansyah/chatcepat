<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreBlogCategoryRequest;
use App\Http\Requests\Admin\UpdateBlogCategoryRequest;
use App\Services\BlogCategoryService;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class BlogCategoryController extends Controller
{
    public function __construct(
        protected BlogCategoryService $categoryService
    ) {}

    public function index(): Response
    {
        $categories = $this->categoryService->getAllCategories();

        return Inertia::render('admin/blog/categories/index', [
            'categories' => $categories,
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('admin/blog/categories/create');
    }

    public function store(StoreBlogCategoryRequest $request): RedirectResponse
    {
        $this->categoryService->createCategory($request->validated());

        return redirect()
            ->route('admin.blog.categories.index')
            ->with('success', 'Kategori berhasil ditambahkan!');
    }

    public function edit(int $id): Response
    {
        $category = $this->categoryService->getCategoryById($id);

        return Inertia::render('admin/blog/categories/edit', [
            'category' => $category,
        ]);
    }

    public function update(UpdateBlogCategoryRequest $request, int $id): RedirectResponse
    {
        $this->categoryService->updateCategory($id, $request->validated());

        return redirect()
            ->route('admin.blog.categories.index')
            ->with('success', 'Kategori berhasil diperbarui!');
    }

    public function destroy(int $id): RedirectResponse
    {
        try {
            $this->categoryService->deleteCategory($id);

            return redirect()
                ->route('admin.blog.categories.index')
                ->with('success', 'Kategori berhasil dihapus!');
        } catch (\Exception $e) {
            return redirect()
                ->route('admin.blog.categories.index')
                ->with('error', $e->getMessage());
        }
    }
}
