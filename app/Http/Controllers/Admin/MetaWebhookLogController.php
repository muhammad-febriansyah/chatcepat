<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\MetaWebhookLog;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\RedirectResponse;

class MetaWebhookLogController extends Controller
{
    /**
     * Display a listing of webhook logs
     */
    public function index(Request $request): Response
    {
        $query = MetaWebhookLog::with('user:id,name,email');

        // Filter by platform
        if ($request->filled('platform')) {
            $query->where('platform', $request->platform);
        }

        // Filter by status
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        // Filter by user
        if ($request->filled('user_id')) {
            $query->where('user_id', $request->user_id);
        }

        // Filter by date range
        if ($request->filled('date_from')) {
            $query->whereDate('created_at', '>=', $request->date_from);
        }
        if ($request->filled('date_to')) {
            $query->whereDate('created_at', '<=', $request->date_to);
        }

        // Search
        if ($request->filled('search')) {
            $query->where(function($q) use ($request) {
                $q->where('sender_id', 'like', '%' . $request->search . '%')
                  ->orWhere('recipient_id', 'like', '%' . $request->search . '%')
                  ->orWhere('message_id', 'like', '%' . $request->search . '%')
                  ->orWhere('error_message', 'like', '%' . $request->search . '%');
            });
        }

        $logs = $query->orderBy('created_at', 'desc')
            ->paginate(50);

        // Statistics
        $stats = [
            'total' => MetaWebhookLog::count(),
            'success' => MetaWebhookLog::where('status', 'success')->count(),
            'failed' => MetaWebhookLog::where('status', 'failed')->count(),
            'pending' => MetaWebhookLog::where('status', 'pending')->count(),
            'by_platform' => MetaWebhookLog::selectRaw('platform, count(*) as count')
                ->groupBy('platform')
                ->pluck('count', 'platform'),
            'recent_errors' => MetaWebhookLog::where('status', 'failed')
                ->orderBy('created_at', 'desc')
                ->limit(5)
                ->get(['id', 'platform', 'error_message', 'created_at']),
        ];

        return Inertia::render('admin/meta/webhook-logs/index', [
            'logs' => $logs,
            'stats' => $stats,
            'filters' => $request->only(['platform', 'status', 'user_id', 'date_from', 'date_to', 'search']),
        ]);
    }

    /**
     * Display the specified webhook log
     */
    public function show(MetaWebhookLog $webhookLog): Response
    {
        $webhookLog->load('user:id,name,email');

        return Inertia::render('admin/meta/webhook-logs/show', [
            'log' => $webhookLog,
        ]);
    }

    /**
     * Delete old logs
     */
    public function cleanup(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'days' => 'required|integer|min:1|max:365',
        ]);

        $deletedCount = MetaWebhookLog::whereDate('created_at', '<', now()->subDays($validated['days']))
            ->delete();

        return back()->with('success', "Deleted {$deletedCount} old webhook logs");
    }

    /**
     * Retry failed webhook
     */
    public function retry(MetaWebhookLog $webhookLog): RedirectResponse
    {
        if ($webhookLog->status !== 'failed') {
            return back()->with('error', 'Can only retry failed webhooks');
        }

        // TODO: Implement retry logic
        // This would involve re-processing the webhook payload

        $webhookLog->update(['status' => 'pending']);

        return back()->with('success', 'Webhook marked for retry');
    }

    /**
     * Export logs to CSV
     */
    public function export(Request $request)
    {
        $query = MetaWebhookLog::with('user:id,name,email');

        // Apply same filters as index
        if ($request->filled('platform')) {
            $query->where('platform', $request->platform);
        }
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }
        if ($request->filled('user_id')) {
            $query->where('user_id', $request->user_id);
        }

        $logs = $query->orderBy('created_at', 'desc')->get();

        $filename = 'webhook-logs-' . now()->format('Y-m-d-His') . '.csv';

        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="' . $filename . '"',
        ];

        $callback = function() use ($logs) {
            $file = fopen('php://output', 'w');

            // Header
            fputcsv($file, ['ID', 'Date', 'Platform', 'Status', 'User', 'Sender', 'Recipient', 'Event Type', 'Error']);

            // Data
            foreach ($logs as $log) {
                fputcsv($file, [
                    $log->id,
                    $log->created_at->format('Y-m-d H:i:s'),
                    $log->platform,
                    $log->status,
                    $log->user ? $log->user->name : 'N/A',
                    $log->sender_id ?? 'N/A',
                    $log->recipient_id ?? 'N/A',
                    $log->event_type,
                    $log->error_message ?? '',
                ]);
            }

            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }

    /**
     * Delete webhook log
     */
    public function destroy(MetaWebhookLog $webhookLog): RedirectResponse
    {
        $webhookLog->delete();

        return redirect()->route('admin.meta.webhook-logs.index')
            ->with('success', 'Webhook log deleted successfully');
    }
}
