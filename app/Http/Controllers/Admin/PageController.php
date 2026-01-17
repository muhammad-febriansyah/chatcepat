<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\UpdatePageRequest;
use App\Services\PageService;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class PageController extends Controller
{
    public function __construct(
        protected PageService $pageService
    ) {}

    public function index(): Response
    {
        $pages = $this->pageService->getAllPages();

        return Inertia::render('admin/pages/index', [
            'pages' => $pages,
        ]);
    }

    public function edit(int $id): Response
    {
        $page = $this->pageService->getPageById($id);

        return Inertia::render('admin/pages/edit', [
            'page' => $page,
        ]);
    }

    public function editBySlug(string $slug): Response
    {
        $page = $this->pageService->getPageBySlug($slug);

        return Inertia::render('admin/pages/edit', [
            'page' => $page,
        ]);
    }

    public function update(UpdatePageRequest $request, int $id): RedirectResponse
    {
        $data = $request->validated();

        $this->pageService->updatePage($id, $data);

        return redirect()
            ->route('admin.pages.index')
            ->with('success', 'Halaman berhasil diperbarui!');
    }

    public function updateBySlug(UpdatePageRequest $request, string $slug): RedirectResponse
    {
        $data = $request->validated();

        $this->pageService->updatePageBySlug($slug, $data);

        return redirect()
            ->back()
            ->with('success', 'Halaman berhasil diperbarui!');
    }
}
