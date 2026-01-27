<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Models\MetaAutoReply;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class MetaAutoReplyController extends Controller
{
    /**
     * Display auto replies list
     */
    public function index(Request $request): Response
    {
        $user = auth()->user();

        $autoReplies = MetaAutoReply::where('user_id', $user->id)
            ->when($request->platform, fn($q, $platform) => $q->where('platform', $platform))
            ->when($request->search, fn($q, $search) => $q->where('name', 'like', "%{$search}%"))
            ->orderBy('priority', 'desc')
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return Inertia::render('user/meta/auto-reply/index', [
            'autoReplies' => $autoReplies,
            'filters' => $request->only(['platform', 'search']),
        ]);
    }

    /**
     * Show create form
     */
    public function create(): Response
    {
        return Inertia::render('user/meta/auto-reply/create');
    }

    /**
     * Store new auto reply
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'platform' => 'required|in:whatsapp,instagram,facebook',
            'name' => 'required|string|max:255',
            'trigger_type' => 'required|in:keyword,all,greeting,away',
            'keywords' => 'nullable|array',
            'keywords.*' => 'string',
            'match_type' => 'required|in:exact,contains,starts_with,ends_with',
            'reply_type' => 'required|in:text,image,video,audio,document,template',
            'reply_message' => 'required_if:reply_type,text|nullable|string',
            'media_url' => 'nullable|url',
            'media_caption' => 'nullable|string',
            'template_name' => 'nullable|string',
            'template_data' => 'nullable|array',
            'business_hours' => 'nullable|array',
            'only_first_message' => 'boolean',
            'is_active' => 'boolean',
            'priority' => 'integer|min:0|max:100',
        ]);

        $validated['user_id'] = auth()->id();

        MetaAutoReply::create($validated);

        return redirect()
            ->route('user.meta.auto-reply.index')
            ->with('success', 'Auto reply created successfully');
    }

    /**
     * Show edit form
     */
    public function edit(MetaAutoReply $autoReply): Response
    {
        $this->authorize('update', $autoReply);

        return Inertia::render('user/meta/auto-reply/edit', [
            'autoReply' => $autoReply,
        ]);
    }

    /**
     * Update auto reply
     */
    public function update(Request $request, MetaAutoReply $autoReply): RedirectResponse
    {
        $this->authorize('update', $autoReply);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'trigger_type' => 'required|in:keyword,all,greeting,away',
            'keywords' => 'nullable|array',
            'keywords.*' => 'string',
            'match_type' => 'required|in:exact,contains,starts_with,ends_with',
            'reply_type' => 'required|in:text,image,video,audio,document,template',
            'reply_message' => 'required_if:reply_type,text|nullable|string',
            'media_url' => 'nullable|url',
            'media_caption' => 'nullable|string',
            'template_name' => 'nullable|string',
            'template_data' => 'nullable|array',
            'business_hours' => 'nullable|array',
            'only_first_message' => 'boolean',
            'is_active' => 'boolean',
            'priority' => 'integer|min:0|max:100',
        ]);

        $autoReply->update($validated);

        return redirect()
            ->route('user.meta.auto-reply.index')
            ->with('success', 'Auto reply updated successfully');
    }

    /**
     * Delete auto reply
     */
    public function destroy(MetaAutoReply $autoReply): RedirectResponse
    {
        $this->authorize('delete', $autoReply);

        $autoReply->delete();

        return redirect()
            ->route('user.meta.auto-reply.index')
            ->with('success', 'Auto reply deleted successfully');
    }

    /**
     * Toggle active status
     */
    public function toggleStatus(MetaAutoReply $autoReply): JsonResponse
    {
        $this->authorize('update', $autoReply);

        $autoReply->update(['is_active' => !$autoReply->is_active]);

        return response()->json([
            'success' => true,
            'is_active' => $autoReply->is_active,
        ]);
    }

    /**
     * Duplicate auto reply
     */
    public function duplicate(MetaAutoReply $autoReply): RedirectResponse
    {
        $this->authorize('view', $autoReply);

        $newAutoReply = $autoReply->replicate();
        $newAutoReply->name = $autoReply->name . ' (Copy)';
        $newAutoReply->is_active = false;
        $newAutoReply->usage_count = 0;
        $newAutoReply->save();

        return redirect()
            ->route('user.meta.auto-reply.index')
            ->with('success', 'Auto reply duplicated successfully');
    }
}
