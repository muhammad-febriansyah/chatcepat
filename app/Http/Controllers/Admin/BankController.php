<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Bank;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class BankController extends Controller
{
    public function index(): Response
    {
        $banks = Bank::latest()->get();

        return Inertia::render('admin/banks/index', [
            'banks' => $banks,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'nama_bank' => 'required|string|max:255',
            'atasnama' => 'required|string|max:255',
            'norek' => 'required|string|max:255',
            'gambar' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            'is_active' => 'boolean',
        ]);

        if ($request->hasFile('gambar')) {
            $validated['gambar'] = $request->file('gambar')->store('banks', 'public');
        }

        Bank::create($validated);

        return redirect()
            ->route('admin.banks.index')
            ->with('success', 'Bank berhasil ditambahkan!');
    }

    public function update(Request $request, Bank $bank): RedirectResponse
    {
        $validated = $request->validate([
            'nama_bank' => 'required|string|max:255',
            'atasnama' => 'required|string|max:255',
            'norek' => 'required|string|max:255',
            'gambar' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            'is_active' => 'boolean',
        ]);

        if ($request->hasFile('gambar')) {
            if ($bank->gambar) {
                Storage::disk('public')->delete($bank->gambar);
            }
            $validated['gambar'] = $request->file('gambar')->store('banks', 'public');
        }

        $bank->update($validated);

        return redirect()
            ->route('admin.banks.index')
            ->with('success', 'Bank berhasil diperbarui!');
    }

    public function destroy(Bank $bank): RedirectResponse
    {
        if ($bank->gambar) {
            Storage::disk('public')->delete($bank->gambar);
        }

        $bank->delete();

        return redirect()
            ->route('admin.banks.index')
            ->with('success', 'Bank berhasil dihapus!');
    }
}
