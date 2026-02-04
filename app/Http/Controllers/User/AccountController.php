<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rules\Password;

class AccountController extends Controller
{
    /**
     * Display user account settings
     */
    public function index(): Response
    {
        $user = auth()->user();
        $user->load('businessCategory');

        $emails = \App\Models\UserEmail::where('user_id', $user->id)
            ->with('approver:id,name')
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($email) {
                return [
                    'id' => $email->id,
                    'email' => $email->email,
                    'status' => $email->status,
                    'verified_at' => $email->verified_at?->format('d M Y H:i'),
                    'approved_at' => $email->approved_at?->format('d M Y H:i'),
                    'approved_by' => $email->approver?->name,
                    'rejection_reason' => $email->rejection_reason,
                    'notes' => $email->notes,
                    'created_at' => $email->created_at->format('d M Y H:i'),
                ];
            });

        $smtpSettings = \App\Models\SmtpSetting::where('user_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->get();

        return Inertia::render('user/account/index', [
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'phone' => $user->phone,
                'address' => $user->address,
                'nama_bisnis' => $user->nama_bisnis,
                'kategori_bisnis' => $user->kategori_bisnis,
                'kategori_bisnis_name' => $user->businessCategory?->name,
                'role' => $user->role,
                'avatar' => $user->avatar ? Storage::url($user->avatar) : null,
                'created_at' => $user->created_at->format('d M Y'),
            ],
            'businessCategories' => \App\Models\BusinessCategory::where('is_active', true)->get(),
            'emails' => $emails,
            'smtpSettings' => $smtpSettings,
        ]);
    }

    /**
     * Update user profile
     */
    public function updateProfile(Request $request): RedirectResponse
    {
        $user = auth()->user();

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'phone' => 'nullable|string|max:20',
            'address' => 'nullable|string|max:500',
            'nama_bisnis' => 'nullable|string|max:255',
            'kategori_bisnis' => 'nullable|string|max:255',
        ]);

        $user->update($validated);

        return redirect()->back()
            ->with('success', 'Profil berhasil diupdate.');
    }

    /**
     * Update user password
     */
    public function updatePassword(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'current_password' => 'required|string',
            'password' => ['required', 'confirmed', Password::defaults()],
        ]);

        $user = auth()->user();

        // Verify current password
        if (!Hash::check($validated['current_password'], $user->password)) {
            return redirect()->back()
                ->withErrors(['current_password' => 'Password saat ini tidak sesuai.']);
        }

        // Update password
        $user->update([
            'password' => Hash::make($validated['password']),
        ]);

        return redirect()->back()
            ->with('success', 'Password berhasil diubah.');
    }

    /**
     * Update user avatar
     */
    public function updateAvatar(Request $request): RedirectResponse
    {
        \Log::info('Avatar update request received', [
            'has_file' => $request->hasFile('avatar'),
            'all_files' => $request->allFiles(),
            'all_input' => $request->except('avatar'),
        ]);

        $validated = $request->validate([
            'avatar' => 'required|image|mimes:jpeg,png,jpg,gif,webp|max:2048', // 2MB max
        ]);

        $user = auth()->user();

        // Delete old avatar if exists
        if ($user->avatar && Storage::exists($user->avatar)) {
            Storage::delete($user->avatar);
        }

        // Store new avatar
        $path = $request->file('avatar')->store('avatars', 'public');

        \Log::info('Avatar stored', ['path' => $path]);

        $user->update([
            'avatar' => $path,
        ]);

        \Log::info('User updated', ['avatar' => $user->avatar]);

        return redirect()->back()
            ->with('success', 'Avatar berhasil diupdate.');
    }
}
