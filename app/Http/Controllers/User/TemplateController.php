<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Models\MessageTemplate;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class TemplateController extends Controller
{
    /**
     * Display a listing of templates
     */
    public function index(Request $request)
    {
        $type = $request->get('type'); // whatsapp atau email

        $query = MessageTemplate::where('user_id', Auth::id())
            ->orderBy('created_at', 'desc');

        if ($type) {
            $query->where('type', $type);
        }

        $templates = $query->paginate(15);

        // Statistics
        $stats = [
            'total' => MessageTemplate::where('user_id', Auth::id())->count(),
            'whatsapp' => MessageTemplate::where('user_id', Auth::id())->whatsApp()->count(),
            'email' => MessageTemplate::where('user_id', Auth::id())->email()->count(),
        ];

        return Inertia::render('user/templates/index', [
            'templates' => $templates,
            'stats' => $stats,
            'currentType' => $type,
        ]);
    }

    /**
     * Show the form for creating a new template
     */
    public function create(Request $request)
    {
        $type = $request->get('type', 'whatsapp');

        // Use specialized email builder for email templates
        if ($type === 'email') {
            return Inertia::render('user/templates/create-email');
        }

        // Use standard template creator for WhatsApp
        return Inertia::render('user/templates/create', [
            'type' => $type,
        ]);
    }

    /**
     * Store a newly created template
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'type' => 'required|in:whatsapp,email',
            'subject' => 'nullable|required_if:type,email|string|max:255',
            'content' => 'required|string',
            'category' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'variables' => 'nullable|array',
            'variables.*.name' => 'required|string',
            'variables.*.example' => 'nullable|string',
        ]);

        $validated['user_id'] = Auth::id();

        MessageTemplate::create($validated);

        return redirect()->route('user.templates.index', ['type' => $validated['type']])
            ->with('success', 'Template berhasil dibuat');
    }

    /**
     * Show the form for editing the specified template
     */
    public function edit(MessageTemplate $template)
    {
        // Ensure user owns this template
        if ($template->user_id !== Auth::id()) {
            abort(403);
        }

        return Inertia::render('user/templates/edit', [
            'template' => $template,
        ]);
    }

    /**
     * Update the specified template
     */
    public function update(Request $request, MessageTemplate $template)
    {
        // Ensure user owns this template
        if ($template->user_id !== Auth::id()) {
            abort(403);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'type' => 'required|in:whatsapp,email',
            'subject' => 'nullable|required_if:type,email|string|max:255',
            'content' => 'required|string',
            'category' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'variables' => 'nullable|array',
            'variables.*.name' => 'required|string',
            'variables.*.example' => 'nullable|string',
            'is_active' => 'boolean',
        ]);

        $template->update($validated);

        return redirect()->route('user.templates.index', ['type' => $template->type])
            ->with('success', 'Template berhasil diperbarui');
    }

    /**
     * Remove the specified template
     */
    public function destroy(MessageTemplate $template)
    {
        // Ensure user owns this template
        if ($template->user_id !== Auth::id()) {
            abort(403);
        }

        $template->delete();

        return back()->with('success', 'Template berhasil dihapus');
    }

    /**
     * Duplicate a template
     */
    public function duplicate(MessageTemplate $template)
    {
        // Ensure user owns this template
        if ($template->user_id !== Auth::id()) {
            abort(403);
        }

        $newTemplate = $template->replicate();
        $newTemplate->name = $template->name . ' (Copy)';
        $newTemplate->usage_count = 0;
        $newTemplate->last_used_at = null;
        $newTemplate->save();

        return back()->with('success', 'Template berhasil diduplikasi');
    }
}
