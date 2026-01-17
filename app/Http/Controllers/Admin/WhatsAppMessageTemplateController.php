<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\WhatsAppMessageTemplate;
use Illuminate\Http\Request;
use Inertia\Inertia;

class WhatsAppMessageTemplateController extends Controller
{
    /**
     * Display a listing of message templates
     */
    public function index(Request $request)
    {
        $query = WhatsAppMessageTemplate::query()->with('user');

        // Search
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('content', 'like', "%{$search}%")
                  ->orWhere('category', 'like', "%{$search}%");
            });
        }

        // Filter by user
        if ($request->filled('user_id')) {
            $query->where('user_id', $request->user_id);
        }

        // Filter by category
        if ($request->filled('category')) {
            $query->where('category', $request->category);
        }

        // Filter by type
        if ($request->filled('type')) {
            $query->where('type', $request->type);
        }

        // Filter by status
        if ($request->filled('is_active')) {
            $query->where('is_active', $request->is_active === 'true');
        }

        $templates = $query->latest()->get();

        // Get distinct categories and users for filters
        $categories = WhatsAppMessageTemplate::distinct()->pluck('category')->filter();
        $users = \App\Models\User::select('id', 'name', 'email')->get();

        return Inertia::render('admin/whatsapp/message-templates/index', [
            'templates' => $templates,
            'categories' => $categories,
            'users' => $users,
            'filters' => [
                'search' => $request->search,
                'user_id' => $request->user_id,
                'category' => $request->category,
                'type' => $request->type,
                'is_active' => $request->is_active,
            ],
        ]);
    }

    /**
     * Show the form for creating a new template
     */
    public function create()
    {
        $users = \App\Models\User::select('id', 'name', 'email')->get();

        return Inertia::render('admin/whatsapp/message-templates/create', [
            'users' => $users,
        ]);
    }

    /**
     * Store a newly created template
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'user_id' => 'required|exists:users,id',
            'name' => 'required|string|max:100',
            'content' => 'required|string',
            'type' => 'required|in:text,image,document,video',
            'category' => 'nullable|string|max:50',
            'variables' => 'nullable|array',
            'media_url' => 'nullable|string',
            'media_metadata' => 'nullable|array',
            'is_active' => 'boolean',
        ]);

        WhatsAppMessageTemplate::create($validated);

        return redirect()->route('admin.whatsapp.message-templates.index')
            ->with('success', 'Template berhasil dibuat.');
    }

    /**
     * Show the form for editing the specified template
     */
    public function edit(WhatsAppMessageTemplate $messageTemplate)
    {
        $messageTemplate->load('user');
        $users = \App\Models\User::select('id', 'name', 'email')->get();

        return Inertia::render('admin/whatsapp/message-templates/edit', [
            'template' => $messageTemplate,
            'users' => $users,
        ]);
    }

    /**
     * Update the specified template
     */
    public function update(Request $request, WhatsAppMessageTemplate $messageTemplate)
    {
        $validated = $request->validate([
            'user_id' => 'required|exists:users,id',
            'name' => 'required|string|max:100',
            'content' => 'required|string',
            'type' => 'required|in:text,image,document,video',
            'category' => 'nullable|string|max:50',
            'variables' => 'nullable|array',
            'media_url' => 'nullable|string',
            'media_metadata' => 'nullable|array',
            'is_active' => 'boolean',
        ]);

        $messageTemplate->update($validated);

        return redirect()->route('admin.whatsapp.message-templates.index')
            ->with('success', 'Template berhasil diupdate.');
    }

    /**
     * Remove the specified template
     */
    public function destroy(WhatsAppMessageTemplate $messageTemplate)
    {
        $messageTemplate->delete();

        return redirect()->route('admin.whatsapp.message-templates.index')
            ->with('success', 'Template berhasil dihapus.');
    }

    /**
     * Toggle template active status
     */
    public function toggleActive(WhatsAppMessageTemplate $messageTemplate)
    {
        $messageTemplate->update([
            'is_active' => !$messageTemplate->is_active,
        ]);

        return back()->with('success', 'Status template berhasil diubah.');
    }
}
