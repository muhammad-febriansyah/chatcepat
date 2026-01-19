<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AiAssistantType;
use App\Services\OpenAIService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AiAssistantTypeController extends Controller
{
    public function index(): Response
    {
        $aiAssistantTypes = AiAssistantType::orderBy('sort_order')->get();

        return Inertia::render('admin/ai-assistant-types/index', [
            'aiAssistantTypes' => $aiAssistantTypes,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'code' => 'required|string|max:50|unique:ai_assistant_types,code|regex:/^[a-z_]+$/',
            'name' => 'required|string|max:100',
            'description' => 'nullable|string|max:500',
            'system_prompt' => 'nullable|string|max:5000',
            'icon' => 'nullable|string|max:50',
            'color' => 'nullable|string|max:50',
            'is_active' => 'boolean',
            'sort_order' => 'nullable|integer|min:0',
        ], [
            'code.required' => 'Kode wajib diisi.',
            'code.unique' => 'Kode sudah digunakan.',
            'code.regex' => 'Kode hanya boleh huruf kecil dan underscore.',
            'name.required' => 'Nama wajib diisi.',
        ]);

        $validated['is_active'] = $request->boolean('is_active');
        $validated['sort_order'] = $validated['sort_order'] ?? 0;

        AiAssistantType::create($validated);

        // Clear cache
        OpenAIService::clearCache();

        return redirect()
            ->route('admin.ai-assistant-types.index')
            ->with('success', 'AI Assistant Type berhasil ditambahkan!');
    }

    public function update(Request $request, AiAssistantType $aiAssistantType): RedirectResponse
    {
        $validated = $request->validate([
            'code' => 'required|string|max:50|regex:/^[a-z_]+$/|unique:ai_assistant_types,code,' . $aiAssistantType->id,
            'name' => 'required|string|max:100',
            'description' => 'nullable|string|max:500',
            'system_prompt' => 'nullable|string|max:5000',
            'icon' => 'nullable|string|max:50',
            'color' => 'nullable|string|max:50',
            'is_active' => 'boolean',
            'sort_order' => 'nullable|integer|min:0',
        ], [
            'code.required' => 'Kode wajib diisi.',
            'code.unique' => 'Kode sudah digunakan.',
            'code.regex' => 'Kode hanya boleh huruf kecil dan underscore.',
            'name.required' => 'Nama wajib diisi.',
        ]);

        $validated['is_active'] = $request->boolean('is_active');

        $aiAssistantType->update($validated);

        // Clear cache
        OpenAIService::clearCache();

        return redirect()
            ->route('admin.ai-assistant-types.index')
            ->with('success', 'AI Assistant Type berhasil diperbarui!');
    }

    public function destroy(AiAssistantType $aiAssistantType): RedirectResponse
    {
        $aiAssistantType->delete();

        // Clear cache
        OpenAIService::clearCache();

        return redirect()
            ->route('admin.ai-assistant-types.index')
            ->with('success', 'AI Assistant Type berhasil dihapus!');
    }
}
