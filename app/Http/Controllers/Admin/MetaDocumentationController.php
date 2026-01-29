<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\MetaDocumentation;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\RedirectResponse;

class MetaDocumentationController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(): Response
    {
        $docs = MetaDocumentation::orderBy('order')
            ->orderBy('created_at', 'desc')
            ->get();

        return Inertia::render('admin/meta/documentation/index', [
            'documentations' => $docs,
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(): Response
    {
        return Inertia::render('admin/meta/documentation/create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'platform' => 'required|in:whatsapp,instagram,facebook',
            'title' => 'required|string|max:255',
            'slug' => 'required|string|max:255|unique:meta_documentations,slug',
            'content' => 'required|string',
            'video_url' => 'nullable|url',
            'icon' => 'nullable|string|max:50',
            'order' => 'nullable|integer|min:0',
            'is_active' => 'nullable|boolean',
        ]);

        $validated['is_active'] = $validated['is_active'] ?? true;
        $validated['order'] = $validated['order'] ?? 0;

        MetaDocumentation::create($validated);

        return redirect()->route('admin.meta.documentation.index')
            ->with('success', 'Documentation created successfully');
    }

    /**
     * Display the specified resource.
     */
    public function show(MetaDocumentation $documentation): Response
    {
        return Inertia::render('admin/meta/documentation/show', [
            'documentation' => $documentation,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(MetaDocumentation $documentation): Response
    {
        return Inertia::render('admin/meta/documentation/edit', [
            'documentation' => $documentation,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, MetaDocumentation $documentation): RedirectResponse
    {
        $validated = $request->validate([
            'platform' => 'required|in:whatsapp,instagram,facebook',
            'title' => 'required|string|max:255',
            'slug' => 'required|string|max:255|unique:meta_documentations,slug,' . $documentation->id,
            'content' => 'required|string',
            'video_url' => 'nullable|url',
            'icon' => 'nullable|string|max:50',
            'order' => 'nullable|integer|min:0',
            'is_active' => 'nullable|boolean',
        ]);

        $documentation->update($validated);

        return redirect()->route('admin.meta.documentation.index')
            ->with('success', 'Documentation updated successfully');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(MetaDocumentation $documentation): RedirectResponse
    {
        $documentation->delete();

        return redirect()->route('admin.meta.documentation.index')
            ->with('success', 'Documentation deleted successfully');
    }

    /**
     * Toggle active status
     */
    public function toggle(MetaDocumentation $documentation): RedirectResponse
    {
        $documentation->update([
            'is_active' => !$documentation->is_active
        ]);

        return back()->with('success', 'Documentation status updated');
    }
}
