<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreFiturUnggulanRequest;
use App\Http\Requests\Admin\UpdateFiturUnggulanRequest;
use App\Models\FiturUnggulan;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class FiturUnggulanController extends Controller
{
    public function index(): Response
    {
        $fiturUnggulans = FiturUnggulan::orderBy('order')->get();

        return Inertia::render('admin/fitur-unggulan/index', [
            'fiturUnggulans' => $fiturUnggulans,
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('admin/fitur-unggulan/create');
    }

    public function store(StoreFiturUnggulanRequest $request): RedirectResponse
    {
        $data = $request->validated();

        // Handle image upload
        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('fitur_unggulan', 'public');
            $data['image'] = $path;
        }

        FiturUnggulan::create($data);

        return redirect()
            ->route('admin.fitur-unggulan.index')
            ->with('success', 'Fitur Unggulan berhasil ditambahkan!');
    }

    public function edit(int $id): Response
    {
        $fiturUnggulan = FiturUnggulan::findOrFail($id);

        return Inertia::render('admin/fitur-unggulan/edit', [
            'fiturUnggulan' => $fiturUnggulan,
        ]);
    }

    public function update(UpdateFiturUnggulanRequest $request, int $id): RedirectResponse
    {
        $fiturUnggulan = FiturUnggulan::findOrFail($id);
        $data = $request->validated();

        // Handle image upload
        if ($request->hasFile('image')) {
            // Delete old image
            if ($fiturUnggulan->image && \Storage::disk('public')->exists($fiturUnggulan->image)) {
                \Storage::disk('public')->delete($fiturUnggulan->image);
            }

            $path = $request->file('image')->store('fitur_unggulan', 'public');
            $data['image'] = $path;
        }

        $fiturUnggulan->update($data);

        return redirect()
            ->route('admin.fitur-unggulan.index')
            ->with('success', 'Fitur Unggulan berhasil diperbarui!');
    }

    public function destroy(int $id): RedirectResponse
    {
        $fiturUnggulan = FiturUnggulan::findOrFail($id);

        // Delete image
        if ($fiturUnggulan->image && \Storage::disk('public')->exists($fiturUnggulan->image)) {
            \Storage::disk('public')->delete($fiturUnggulan->image);
        }

        $fiturUnggulan->delete();

        return redirect()
            ->route('admin.fitur-unggulan.index')
            ->with('success', 'Fitur Unggulan berhasil dihapus!');
    }
}
