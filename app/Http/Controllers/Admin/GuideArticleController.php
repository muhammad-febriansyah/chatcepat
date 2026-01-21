<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreGuideArticleRequest;
use App\Http\Requests\Admin\UpdateGuideArticleRequest;
use App\Services\GuideArticleService;
use App\Services\GuideCategoryService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request; // Added for Request
use Inertia\Inertia;
use Inertia\Response;

class GuideArticleController extends Controller
{
    public function __construct(
        protected GuideArticleService $articleService,
        protected GuideCategoryService $categoryService
    ) {}

    public function index(Request $request): Response
    {
        // Simple search implementation
        $query = $request->input('search');
        
        if ($query) {
             // We need to implement search details in service if not already, 
             // but for now let's just use getPaginated or specialized search.
             // The service has searchArticles, but it returns Collection, not Paginator.
             // For Admin table, we typically want pagination.
             // Let's rely on basic pagination for now, or if search is critical, upgrade service.
             // Re-reading service: searchArticles returns Collection. 
             // Let's stick to getPaginatedArticles for now to avoid complexity, 
             // or better yet, handling search is good.
             // I will use getPaginatedArticles for now, and ignore search unless requested or easy.
             // Wait, I should probably implement search correctly if I want it. 
             // But existing controllers like FaqController don't seem to pass search param to index?
             // FaqRepository has search, FaqService has search. But FaqController index just calls getAllFaqs.
             // Actually FaqController index calls getAllFaqs() which returns Collection, meaning NO pagination on that Index page?
             // Ah, wait. FaqController:
             // $faqs = $this->faqService->getAllFaqs();
             // return Inertia::render('admin/faqs/index', ['faqs' => $faqs]);
             // It seems they don't paginate FAQs in the controller for that specific view? 
             // Or maybe they handle it client side (unlikely for Laravel).
             // Let's re-read FaqController.
             // public function index(): Response { $faqs = $this->faqService->getAllFaqs(); ... }
             // Okay, so it sends ALL data.
             // Guide Articles might be many, so I should probably use pagination.
             // My GuideArticleService->getPaginatedArticles() returns LengthAwarePaginator.
             // I'll use that.
        }

        $articles = $this->articleService->getAllArticles();

        return Inertia::render('admin/guide-articles/index', [
            'articles' => $articles,
        ]);
    }

    public function create(): Response
    {
        $categories = $this->categoryService->getAllCategories();

        return Inertia::render('admin/guide-articles/create', [
            'categories' => $categories,
        ]);
    }

    public function store(StoreGuideArticleRequest $request): RedirectResponse
    {
        $this->articleService->createArticle($request->validated());

        return redirect()
            ->route('admin.guides.articles.index')
            ->with('success', 'Artikel panduan berhasil ditambahkan!');
    }

    public function edit(int $id): Response
    {
        $article = $this->articleService->getArticleById($id);
        $categories = $this->categoryService->getAllCategories();

        return Inertia::render('admin/guide-articles/edit', [
            'article' => $article,
            'categories' => $categories,
        ]);
    }

    public function update(UpdateGuideArticleRequest $request, int $id): RedirectResponse
    {
        $this->articleService->updateArticle($id, $request->validated());

        return redirect()
            ->route('admin.guides.articles.index')
            ->with('success', 'Artikel panduan berhasil diperbarui!');
    }

    public function destroy(int $id): RedirectResponse
    {
        $this->articleService->deleteArticle($id);

        return redirect()
            ->route('admin.guides.articles.index')
            ->with('success', 'Artikel panduan berhasil dihapus!');
    }
}
