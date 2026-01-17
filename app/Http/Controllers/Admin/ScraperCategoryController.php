<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ScraperCategory;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class ScraperCategoryController extends Controller
{
    public function index()
    {
        $categories = ScraperCategory::ordered()->get();

        return Inertia::render('admin/ScraperCategories/Index', [
            'categories' => $categories,
        ]);
    }

    public function create()
    {
        return Inertia::render('admin/ScraperCategories/Create');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'slug' => 'nullable|string|max:255|unique:scraper_categories,slug',
            'image' => 'nullable|file|mimes:jpeg,png,jpg,gif,svg,webp|max:2048',
            'is_active' => 'boolean',
            'order' => 'nullable|integer',
        ]);

        // Handle image upload
        if ($request->hasFile('image')) {
            $validated['image'] = $request->file('image')->store('scraper-categories', 'public');
        }

        ScraperCategory::create($validated);

        return redirect()->route('admin.scraper-categories.index');
    }

    public function edit(ScraperCategory $scraperCategory)
    {
        return Inertia::render('admin/ScraperCategories/Edit', [
            'category' => $scraperCategory,
        ]);
    }

    public function update(Request $request, ScraperCategory $scraperCategory)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'slug' => 'nullable|string|max:255|unique:scraper_categories,slug,' . $scraperCategory->id,
            'image' => 'nullable|file|mimes:jpeg,png,jpg,gif,svg,webp|max:2048',
            'is_active' => 'boolean',
            'order' => 'nullable|integer',
        ]);

        // Handle image upload
        if ($request->hasFile('image')) {
            // Delete old image
            if ($scraperCategory->image) {
                Storage::disk('public')->delete($scraperCategory->image);
            }
            $validated['image'] = $request->file('image')->store('scraper-categories', 'public');
        }

        $scraperCategory->update($validated);

        return redirect()->route('admin.scraper-categories.index');
    }

    public function destroy(ScraperCategory $scraperCategory)
    {
        // Delete image
        if ($scraperCategory->image) {
            Storage::disk('public')->delete($scraperCategory->image);
        }

        $scraperCategory->delete();

        return redirect()->route('admin.scraper-categories.index');
    }
}
