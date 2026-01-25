<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Partner;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class PartnerController extends Controller
{
    public function index()
    {
        $partners = Partner::ordered()->get();

        return Inertia::render('admin/partners/index', [
            'partners' => $partners,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'image' => 'required|image|mimes:png,jpg,jpeg,svg,webp|max:5120',
            'order' => 'nullable|integer|min:0',
            'is_active' => 'nullable|boolean',
        ]);

        if ($request->hasFile('image')) {
            $validated['image'] = $request->file('image')->store('partners', 'public');
        }

        Partner::create($validated);

        return redirect()->back()->with('success', 'Partner berhasil ditambahkan.');
    }

    public function update(Request $request, Partner $partner)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'image' => 'nullable|image|mimes:png,jpg,jpeg,svg,webp|max:5120',
            'order' => 'nullable|integer|min:0',
            'is_active' => 'nullable|boolean',
        ]);

        if ($request->hasFile('image')) {
            // Delete old image
            if ($partner->image) {
                Storage::disk('public')->delete($partner->image);
            }
            $validated['image'] = $request->file('image')->store('partners', 'public');
        }

        $partner->update($validated);

        return redirect()->back()->with('success', 'Partner berhasil diperbarui.');
    }

    public function destroy(Partner $partner)
    {
        // Delete image
        if ($partner->image) {
            Storage::disk('public')->delete($partner->image);
        }

        $partner->delete();

        return redirect()->back()->with('success', 'Partner berhasil dihapus.');
    }
}
