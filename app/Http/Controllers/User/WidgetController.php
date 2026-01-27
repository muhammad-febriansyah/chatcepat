<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class WidgetController extends Controller
{
    /**
     * Display widget live chat settings page
     */
    public function index(): Response
    {
        $user = auth()->user();

        return Inertia::render('user/widget/index', [
            'user' => $user,
            'widgetSettings' => [
                'enabled' => $user->widget_enabled ?? false,
                'color' => $user->widget_color ?? '#25D366',
                'position' => $user->widget_position ?? 'bottom-right',
                'greeting' => $user->widget_greeting ?? 'Halo! Ada yang bisa kami bantu?',
                'placeholder' => $user->widget_placeholder ?? 'Ketik pesan Anda...',
                'widget_id' => $user->id,
            ],
        ]);
    }

    /**
     * Update widget settings
     */
    public function updateSettings(Request $request)
    {
        $validated = $request->validate([
            'enabled' => 'required|boolean',
            'color' => 'nullable|string|max:7',
            'position' => 'nullable|in:bottom-right,bottom-left,top-right,top-left',
            'greeting' => 'nullable|string|max:255',
            'placeholder' => 'nullable|string|max:255',
        ]);

        $user = auth()->user();
        $user->update([
            'widget_enabled' => $validated['enabled'],
            'widget_color' => $validated['color'] ?? '#25D366',
            'widget_position' => $validated['position'] ?? 'bottom-right',
            'widget_greeting' => $validated['greeting'] ?? 'Halo! Ada yang bisa kami bantu?',
            'widget_placeholder' => $validated['placeholder'] ?? 'Ketik pesan Anda...',
        ]);

        return redirect()->back()->with('success', 'Widget settings berhasil diupdate!');
    }

    /**
     * Generate widget embed script
     */
    public function generateScript(Request $request)
    {
        $user = auth()->user();
        $widgetId = $user->id;
        $appUrl = config('app.url');

        $script = <<<SCRIPT
<!-- ChatCepat Widget -->
<script>
(function() {
    var widgetId = '{$widgetId}';
    var scriptEl = document.createElement('script');
    scriptEl.src = '{$appUrl}/widget/' + widgetId + '/embed.js';
    scriptEl.async = true;
    document.head.appendChild(scriptEl);
})();
</script>
<!-- End ChatCepat Widget -->
SCRIPT;

        return response()->json([
            'script' => $script,
            'widget_id' => $widgetId,
        ]);
    }
}
