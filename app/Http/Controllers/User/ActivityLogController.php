<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ActivityLogController extends Controller
{
    /**
     * Display a listing of activity logs with filters.
     */
    public function index(Request $request)
    {
        $userId = auth()->id();

        $query = ActivityLog::where('user_id', $userId)
            ->with('user:id,name,email');

        // Search filter
        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('resource_name', 'like', "%{$search}%")
                    ->orWhere('action', 'like', "%{$search}%")
                    ->orWhere('resource_type', 'like', "%{$search}%")
                    ->orWhere('ip_address', 'like', "%{$search}%");
            });
        }

        // Action filter
        if ($request->filled('action')) {
            $query->where('action', $request->input('action'));
        }

        // Resource type filter
        if ($request->filled('resource_type')) {
            $query->where('resource_type', $request->input('resource_type'));
        }

        // Date range filter
        if ($request->filled('start_date')) {
            $query->whereDate('created_at', '>=', $request->input('start_date'));
        }

        if ($request->filled('end_date')) {
            $query->whereDate('created_at', '<=', $request->input('end_date'));
        }

        // Get unique values for filters
        $actions = ActivityLog::where('user_id', $userId)
            ->select('action')
            ->distinct()
            ->orderBy('action')
            ->pluck('action')
            ->map(function ($action) {
                $labels = [
                    'create' => 'Buat',
                    'update' => 'Ubah',
                    'delete' => 'Hapus',
                    'login' => 'Login',
                    'logout' => 'Logout',
                    'login_failed' => 'Login Gagal',
                    'send' => 'Kirim',
                    'connect' => 'Sambungkan',
                    'disconnect' => 'Putuskan',
                    'start' => 'Mulai',
                    'stop' => 'Hentikan',
                    'import' => 'Import',
                    'export' => 'Export',
                ];

                return [
                    'value' => $action,
                    'label' => $labels[$action] ?? ucfirst($action),
                ];
            })
            ->values();

        $resourceTypes = ActivityLog::where('user_id', $userId)
            ->select('resource_type')
            ->whereNotNull('resource_type')
            ->distinct()
            ->orderBy('resource_type')
            ->pluck('resource_type')
            ->map(function ($resourceType) {
                $labels = [
                    'Contact' => 'Kontak',
                    'ContactGroup' => 'Grup Kontak',
                    'MessageTemplate' => 'Template Pesan',
                    'WhatsappBroadcast' => 'Broadcast WhatsApp',
                    'TelegramBroadcast' => 'Broadcast Telegram',
                    'WhatsappSession' => 'Sesi WhatsApp',
                    'TelegramSession' => 'Sesi Telegram',
                    'WhatsappAutoReply' => 'Auto Reply WhatsApp',
                    'TelegramAutoReply' => 'Auto Reply Telegram',
                    'GoogleMapPlace' => 'Google Maps',
                    'WhatsappContact' => 'Kontak WhatsApp',
                    'WhatsappGroup' => 'Grup WhatsApp',
                    'Authentication' => 'Autentikasi',
                ];

                return [
                    'value' => $resourceType,
                    'label' => $labels[$resourceType] ?? $resourceType,
                ];
            })
            ->values();

        // Paginate results
        $logs = $query->orderBy('created_at', 'desc')
            ->paginate(20)
            ->through(function ($log) {
                return [
                    'id' => $log->id,
                    'action' => $log->action,
                    'action_label' => $log->action_label,
                    'resource_type' => $log->resource_type,
                    'resource_type_label' => $log->resource_type_label,
                    'resource_name' => $log->resource_name,
                    'description' => $log->description,
                    'ip_address' => $log->ip_address,
                    'device_type' => $log->device_type,
                    'browser' => $log->browser,
                    'platform' => $log->platform,
                    'is_successful' => $log->is_successful,
                    'created_at' => $log->created_at->format('Y-m-d H:i:s'),
                    'created_at_human' => $log->created_at->diffForHumans(),
                ];
            });

        return Inertia::render('user/activity-logs/index', [
            'logs' => $logs,
            'filters' => [
                'search' => $request->input('search'),
                'action' => $request->input('action'),
                'resource_type' => $request->input('resource_type'),
                'start_date' => $request->input('start_date'),
                'end_date' => $request->input('end_date'),
            ],
            'filterOptions' => [
                'actions' => $actions,
                'resourceTypes' => $resourceTypes,
            ],
        ]);
    }

    /**
     * Display the specified activity log.
     */
    public function show(ActivityLog $activityLog)
    {
        // Authorization check - user can only view their own logs
        if ($activityLog->user_id !== auth()->id()) {
            abort(403, 'Unauthorized action.');
        }

        $activityLog->load('user:id,name,email');

        return Inertia::render('user/activity-logs/show', [
            'log' => [
                'id' => $activityLog->id,
                'action' => $activityLog->action,
                'action_label' => $activityLog->action_label,
                'resource_type' => $activityLog->resource_type,
                'resource_type_label' => $activityLog->resource_type_label,
                'resource_id' => $activityLog->resource_id,
                'resource_name' => $activityLog->resource_name,
                'description' => $activityLog->description,
                'old_values' => $activityLog->old_values,
                'new_values' => $activityLog->new_values,
                'metadata' => $activityLog->metadata,
                'ip_address' => $activityLog->ip_address,
                'user_agent' => $activityLog->user_agent,
                'device_type' => $activityLog->device_type,
                'browser' => $activityLog->browser,
                'platform' => $activityLog->platform,
                'is_successful' => $activityLog->is_successful,
                'error_message' => $activityLog->error_message,
                'created_at' => $activityLog->created_at->format('Y-m-d H:i:s'),
                'created_at_human' => $activityLog->created_at->diffForHumans(),
                'user' => $activityLog->user,
            ],
        ]);
    }
}
