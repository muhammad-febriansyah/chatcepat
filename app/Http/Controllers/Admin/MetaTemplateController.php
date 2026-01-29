<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\MetaMessageTemplate;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\RedirectResponse;

class MetaTemplateController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): Response
    {
        $query = MetaMessageTemplate::query();

        // Filter by category
        if ($request->filled('category')) {
            $query->where('category', $request->category);
        }

        // Filter by platform
        if ($request->filled('platform')) {
            $query->where('platform', $request->platform);
        }

        // Search
        if ($request->filled('search')) {
            $query->where(function($q) use ($request) {
                $q->where('name', 'like', '%' . $request->search . '%')
                  ->orWhere('content', 'like', '%' . $request->search . '%');
            });
        }

        $templates = $query->orderBy('category')
            ->orderBy('name')
            ->get();

        $stats = [
            'total' => MetaMessageTemplate::count(),
            'by_category' => MetaMessageTemplate::selectRaw('category, count(*) as count')
                ->groupBy('category')
                ->pluck('count', 'category'),
            'by_platform' => MetaMessageTemplate::selectRaw('platform, count(*) as count')
                ->groupBy('platform')
                ->pluck('count', 'platform'),
        ];

        return Inertia::render('admin/meta/templates/index', [
            'templates' => $templates,
            'stats' => $stats,
            'filters' => $request->only(['category', 'platform', 'search']),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(): Response
    {
        return Inertia::render('admin/meta/templates/create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'category' => 'required|in:greeting,follow_up,marketing,support,special',
            'platform' => 'required|in:whatsapp,instagram,facebook,all',
            'content' => 'required|string',
            'variables' => 'nullable|array',
            'language' => 'nullable|string|max:5',
            'is_system' => 'nullable|boolean',
            'is_active' => 'nullable|boolean',
        ]);

        $validated['language'] = $validated['language'] ?? 'id';
        $validated['is_system'] = $validated['is_system'] ?? false;
        $validated['is_active'] = $validated['is_active'] ?? true;

        MetaMessageTemplate::create($validated);

        return redirect()->route('admin.meta.templates.index')
            ->with('success', 'Template created successfully');
    }

    /**
     * Display the specified resource.
     */
    public function show(MetaMessageTemplate $template): Response
    {
        return Inertia::render('admin/meta/templates/show', [
            'template' => $template,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(MetaMessageTemplate $template): Response
    {
        return Inertia::render('admin/meta/templates/edit', [
            'template' => $template,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, MetaMessageTemplate $template): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'category' => 'required|in:greeting,follow_up,marketing,support,special',
            'platform' => 'required|in:whatsapp,instagram,facebook,all',
            'content' => 'required|string',
            'variables' => 'nullable|array',
            'language' => 'nullable|string|max:5',
            'is_system' => 'nullable|boolean',
            'is_active' => 'nullable|boolean',
        ]);

        $template->update($validated);

        return redirect()->route('admin.meta.templates.index')
            ->with('success', 'Template updated successfully');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(MetaMessageTemplate $template): RedirectResponse
    {
        // Prevent deleting system templates
        if ($template->is_system) {
            return back()->with('error', 'Cannot delete system template');
        }

        $template->delete();

        return redirect()->route('admin.meta.templates.index')
            ->with('success', 'Template deleted successfully');
    }

    /**
     * Toggle active status
     */
    public function toggle(MetaMessageTemplate $template): RedirectResponse
    {
        $template->update([
            'is_active' => !$template->is_active
        ]);

        return back()->with('success', 'Template status updated');
    }

    /**
     * Duplicate a template
     */
    public function duplicate(MetaMessageTemplate $template): RedirectResponse
    {
        $newTemplate = $template->replicate();
        $newTemplate->name = $template->name . ' (Copy)';
        $newTemplate->is_system = false;
        $newTemplate->usage_count = 0;
        $newTemplate->save();

        return back()->with('success', 'Template duplicated successfully');
    }
}
