<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Models\SmtpSetting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Mail;
use Inertia\Inertia;

class SmtpSettingController extends Controller
{
    /**
     * Display a listing of SMTP settings
     */
    public function index()
    {
        $smtpSettings = SmtpSetting::where('user_id', Auth::id())
            ->orderBy('is_active', 'desc')
            ->orderBy('created_at', 'desc')
            ->get();

        return Inertia::render('user/smtp-settings/index', [
            'smtpSettings' => $smtpSettings,
        ]);
    }

    /**
     * Store a newly created SMTP setting
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'host' => 'required|string|max:255',
            'port' => 'required|integer|min:1|max:65535',
            'username' => 'required|string|max:255',
            'password' => 'required|string',
            'encryption' => 'required|in:tls,ssl,none',
            'from_address' => 'required|email|max:255',
            'from_name' => 'required|string|max:255',
        ]);

        $validated['user_id'] = Auth::id();
        $validated['is_active'] = false;
        $validated['is_verified'] = false;

        $smtpSetting = SmtpSetting::create($validated);

        return back()->with('success', 'SMTP setting berhasil ditambahkan');
    }

    /**
     * Update the specified SMTP setting
     */
    public function update(Request $request, SmtpSetting $smtpSetting)
    {
        // Ensure user owns this SMTP setting
        if ($smtpSetting->user_id !== Auth::id()) {
            abort(403);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'host' => 'required|string|max:255',
            'port' => 'required|integer|min:1|max:65535',
            'username' => 'required|string|max:255',
            'password' => 'nullable|string',
            'encryption' => 'required|in:tls,ssl,none',
            'from_address' => 'required|email|max:255',
            'from_name' => 'required|string|max:255',
        ]);

        // Only update password if provided
        if (empty($validated['password'])) {
            unset($validated['password']);
        }

        // Reset verification if credentials changed
        if (isset($validated['password']) ||
            $smtpSetting->host !== $validated['host'] ||
            $smtpSetting->port !== $validated['port'] ||
            $smtpSetting->username !== $validated['username']) {
            $validated['is_verified'] = false;
            $validated['verified_at'] = null;
        }

        $smtpSetting->update($validated);

        return back()->with('success', 'SMTP setting berhasil diperbarui');
    }

    /**
     * Remove the specified SMTP setting
     */
    public function destroy(SmtpSetting $smtpSetting)
    {
        // Ensure user owns this SMTP setting
        if ($smtpSetting->user_id !== Auth::id()) {
            abort(403);
        }

        $smtpSetting->delete();

        return back()->with('success', 'SMTP setting berhasil dihapus');
    }

    /**
     * Set SMTP as active
     */
    public function setActive(SmtpSetting $smtpSetting)
    {
        // Ensure user owns this SMTP setting
        if ($smtpSetting->user_id !== Auth::id()) {
            abort(403);
        }

        // Only allow verified SMTP to be set as active
        if (!$smtpSetting->is_verified) {
            return back()->with('error', 'SMTP harus diverifikasi terlebih dahulu');
        }

        $smtpSetting->setAsActive();

        return back()->with('success', 'SMTP berhasil diaktifkan');
    }

    /**
     * Test SMTP connection
     */
    public function test(Request $request, SmtpSetting $smtpSetting)
    {
        // Ensure user owns this SMTP setting
        if ($smtpSetting->user_id !== Auth::id()) {
            abort(403);
        }

        try {
            // Configure mail with this SMTP
            config([
                'mail.mailers.smtp.host' => $smtpSetting->host,
                'mail.mailers.smtp.port' => $smtpSetting->port,
                'mail.mailers.smtp.username' => $smtpSetting->username,
                'mail.mailers.smtp.password' => $smtpSetting->password,
                'mail.mailers.smtp.encryption' => $smtpSetting->encryption === 'none' ? null : $smtpSetting->encryption,
                'mail.from.address' => $smtpSetting->from_address,
                'mail.from.name' => $smtpSetting->from_name,
            ]);

            // Send test email to user's email or to a test address
            $testEmail = $request->input('test_email', Auth::user()->email);

            Mail::raw('Ini adalah test email dari ChatCepat. SMTP Anda berfungsi dengan baik!', function ($message) use ($testEmail, $smtpSetting) {
                $message->to($testEmail)
                    ->subject('Test Email - ChatCepat SMTP');
            });

            // Mark as verified
            $smtpSetting->update([
                'is_verified' => true,
                'verified_at' => now(),
            ]);

            return back()->with('success', 'SMTP berhasil diverifikasi! Test email telah dikirim ke ' . $testEmail);
        } catch (\Exception $e) {
            return back()->with('error', 'Gagal mengirim test email: ' . $e->getMessage());
        }
    }
}
