<?php

namespace App\Http\Controllers;

use App\Models\GuideArticle;
use App\Models\GuideCategory;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Laravel\Fortify\Features;

class DocsController extends Controller
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

        if ($search) {
             $categories = $categories->filter(function ($category) {
                 return $category->articles->isNotEmpty();
             })->values();
        }

        return Inertia::render('docs/index', [
            'canRegister' => Features::enabled(Features::registration()),
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

        return Inertia::render('docs/show', [
            'canRegister' => Features::enabled(Features::registration()),
            'article' => $article,
            'relatedArticles' => $relatedArticles,
            'allCategories' => $allCategories
        ]);
    }
}
