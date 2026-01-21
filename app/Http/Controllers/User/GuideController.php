<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Models\GuideArticle;
use App\Models\GuideCategory;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class GuideController extends Controller
{
    public function index(Request $request): Response
    {
        $search = $request->input('search');

        $categories = GuideCategory::with(['articles' => function ($query) use ($search) {
            $query->where('is_published', true)
                ->orderBy('sort_order', 'asc');
                
            if ($search) {
                $query->where('title', 'like', "%{$search}%")
                      ->orWhere('content', 'like', "%{$search}%");
            }
        }])
        ->orderBy('sort_order', 'asc')
        ->get();

        // If search is active, we might want to flatten or show only categories with matching articles.
        // For simplicity, we send categories and filter on frontend or backend.
        // If search, maybe we just search articles directly?
        // Let's implement a separate search logic if needed, but for "Knowledge Base" typically you show categories.
        // If search is present, let's filter categories that have matching articles.
        
        if ($search) {
             $categories = $categories->filter(function ($category) {
                 return $category->articles->isNotEmpty();
             })->values();
        }

        return Inertia::render('user/guides/index', [
            'categories' => $categories,
            'search' => $search
        ]);
    }

    public function show(string $slug): Response
    {
        // Find article by slug
        $article = GuideArticle::where('slug', $slug)
            ->where('is_published', true)
            ->with('category')
            ->firstOrFail();

        // Get related articles in same category
        $relatedArticles = GuideArticle::where('guide_category_id', $article->guide_category_id)
            ->where('id', '!=', $article->id)
            ->where('is_published', true)
            ->orderBy('sort_order', 'asc')
            ->get();

        // Get all categories with articles for sidebar navigation
        $allCategories = GuideCategory::with(['articles' => function ($query) {
            $query->where('is_published', true)
                ->orderBy('sort_order', 'asc')
                ->select('id', 'guide_category_id', 'title', 'slug', 'sort_order');
        }])
        ->orderBy('sort_order', 'asc')
        ->get();

        return Inertia::render('user/guides/show', [
            'article' => $article,
            'relatedArticles' => $relatedArticles,
            'allCategories' => $allCategories
        ]);
    }
}
