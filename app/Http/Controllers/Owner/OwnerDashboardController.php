<?php

namespace App\Http\Controllers\Owner;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\WhatsappSession;
use App\Models\WhatsappMessage;
use App\Models\WhatsappBroadcast;
use App\Models\GoogleMapPlace;
use App\Models\WhatsappContact;
use App\Models\ContactGroup;
use App\Models\Transaction;
use App\Exports\OwnerTransactionsExport;
use Illuminate\Http\Request;
use Illuminate\Http\Response as HttpResponse;
use Inertia\Inertia;
use Inertia\Response;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Maatwebsite\Excel\Facades\Excel;
use Barryvdh\DomPDF\Facade\Pdf;

class OwnerDashboardController extends Controller
{
    /**
     * Display owner dashboard with analytics
     */
    public function index(): Response
    {
        // User Statistics
        $totalUsers = User::where('role', 'user')->count();
        $activeUsers = User::where('role', 'user')
            ->where('last_login_at', '>=', Carbon::now()->subDays(7))
            ->count();
        $newUsers = User::where('role', 'user')
            ->where('created_at', '>=', Carbon::now()->subDays(30))
            ->count();

        // WhatsApp Statistics
        $totalSessions = WhatsappSession::count();
        $activeSessions = WhatsappSession::where('status', 'connected')->count();
        $totalMessages = WhatsappMessage::count();
        $messagesThisMonth = WhatsappMessage::where('created_at', '>=', Carbon::now()->startOfMonth())->count();

        // Broadcast Statistics
        $totalBroadcasts = WhatsappBroadcast::count();
        $completedBroadcasts = WhatsappBroadcast::where('status', 'completed')->count();
        $scheduledBroadcasts = WhatsappBroadcast::where('status', 'scheduled')->count();

        // Scraping Statistics
        $totalScrapedPlaces = GoogleMapPlace::count();
        $totalContacts = WhatsappContact::count();
        $totalContactGroups = ContactGroup::count();

        // Revenue Statistics
        $monthlyRevenue = Transaction::where('status', 'paid')
            ->where('paid_at', '>=', Carbon::now()->startOfMonth())
            ->sum('amount');
        $yearlyRevenue = Transaction::where('status', 'paid')
            ->where('paid_at', '>=', Carbon::now()->startOfYear())
            ->sum('amount');

        // User Growth Chart (last 12 months)
        $userGrowth = User::where('role', 'user')
            ->where('created_at', '>=', Carbon::now()->subMonths(12))
            ->select(DB::raw('DATE_FORMAT(created_at, "%Y-%m") as month'), DB::raw('count(*) as count'))
            ->groupBy('month')
            ->orderBy('month')
            ->get()
            ->pluck('count', 'month');

        // Messages Chart (last 7 days)
        $messagesChart = WhatsappMessage::where('created_at', '>=', Carbon::now()->subDays(7))
            ->select(DB::raw('DATE(created_at) as date'), DB::raw('count(*) as count'))
            ->groupBy('date')
            ->orderBy('date')
            ->get()
            ->pluck('count', 'date');

        // Top Users by Activity
        $topUsers = User::where('role', 'user')
            ->withCount(['whatsappSessions'])
            ->orderBy('whatsapp_sessions_count', 'desc')
            ->limit(10)
            ->get()
            ->map(function ($user) {
                $user->sessions_count = $user->whatsapp_sessions_count;
                $user->contacts_count = 0;
                $user->broadcasts_count = WhatsappBroadcast::where('user_id', $user->id)->count();
                return $user;
            });

        // Recent Activities
        $recentUsers = User::where('role', 'user')
            ->latest()
            ->limit(10)
            ->get(['id', 'name', 'email', 'created_at']);

        $recentBroadcasts = WhatsappBroadcast::latest()
            ->limit(10)
            ->get(['id', 'name', 'status', 'created_at']);

        return Inertia::render('owner/dashboard', [
            'stats' => [
                'users' => [
                    'total' => $totalUsers,
                    'active' => $activeUsers,
                    'new' => $newUsers,
                ],
                'whatsapp' => [
                    'total_sessions' => $totalSessions,
                    'active_sessions' => $activeSessions,
                    'total_messages' => $totalMessages,
                    'messages_this_month' => $messagesThisMonth,
                ],
                'broadcasts' => [
                    'total' => $totalBroadcasts,
                    'completed' => $completedBroadcasts,
                    'scheduled' => $scheduledBroadcasts,
                ],
                'scraping' => [
                    'total_places' => $totalScrapedPlaces,
                    'total_contacts' => $totalContacts,
                    'total_groups' => $totalContactGroups,
                ],
                'revenue' => [
                    'monthly' => (float) $monthlyRevenue,
                    'yearly' => (float) $yearlyRevenue,
                ],
            ],
            'charts' => [
                'user_growth' => $userGrowth,
                'messages' => $messagesChart,
            ],
            'topUsers' => $topUsers,
            'recentUsers' => $recentUsers,
            'recentBroadcasts' => $recentBroadcasts,
        ]);
    }

    /**
     * Show user detail
     */
    public function showUser(int $id): Response
    {
        $user = User::with(['transactions.pricingPackage', 'whatsappSessions'])
            ->where('role', 'user')
            ->findOrFail($id);

        $totalMessages = WhatsappMessage::whereHas('session', fn($q) => $q->where('user_id', $id))->count();
        $totalBroadcasts = WhatsappBroadcast::where('user_id', $id)->count();
        $activeSessions = $user->whatsappSessions->where('status', 'connected')->count();

        return Inertia::render('owner/users/show', [
            'user' => $user,
            'activityStats' => [
                'total_messages' => $totalMessages,
                'total_broadcasts' => $totalBroadcasts,
                'total_sessions' => $user->whatsappSessions->count(),
                'active_sessions' => $activeSessions,
            ],
        ]);
    }

    /**
     * List users with search and filter
     */
    public function users(Request $request): Response
    {
        $search = $request->get('search', '');
        $status = $request->get('status', 'all');

        $query = User::where('role', 'user');

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        if ($status === 'active') {
            $query->where('last_login_at', '>=', Carbon::now()->subDays(7));
        } elseif ($status === 'new') {
            $query->where('created_at', '>=', Carbon::now()->subDays(30));
        }

        $users = $query->latest()->paginate(15)->withQueryString();

        $totalUsers = User::where('role', 'user')->count();
        $activeUsers = User::where('role', 'user')
            ->where('last_login_at', '>=', Carbon::now()->subDays(7))
            ->count();
        $newThisMonth = User::where('role', 'user')
            ->where('created_at', '>=', Carbon::now()->subDays(30))
            ->count();

        return Inertia::render('owner/users/index', [
            'users' => $users,
            'stats' => [
                'total' => $totalUsers,
                'active' => $activeUsers,
                'new_this_month' => $newThisMonth,
            ],
            'filters' => [
                'search' => $search,
                'status' => $status,
            ],
        ]);
    }

    /**
     * Show transaction detail
     */
    public function showTransaction(int $id): Response
    {
        $transaction = Transaction::with(['user', 'pricingPackage', 'bank'])->findOrFail($id);

        // Count user's other transactions
        $userTransactionCount = Transaction::where('user_id', $transaction->user_id)->count();
        $userPaidCount = Transaction::where('user_id', $transaction->user_id)->where('status', 'paid')->count();

        return Inertia::render('owner/transactions/show', [
            'transaction' => $transaction,
            'userStats' => [
                'total_transactions' => $userTransactionCount,
                'paid_transactions' => $userPaidCount,
            ],
        ]);
    }

    /**
     * List transactions with search, date filter, and pagination
     */
    public function transactions(Request $request): Response
    {
        $search    = (string) ($request->get('search') ?? '');
        $status    = (string) ($request->get('status') ?? 'all');
        $dateFrom  = (string) ($request->get('date_from') ?? '');
        $dateTo    = (string) ($request->get('date_to') ?? '');

        $query = $this->buildTransactionQuery($search, $status, $dateFrom, $dateTo);
        $transactions = $query->latest()->paginate(15)->withQueryString();

        return Inertia::render('owner/transactions/index', [
            'transactions' => $transactions,
            'stats'        => $this->getTransactionStats(),
            'filters'      => compact('search', 'status', 'dateFrom', 'dateTo'),
        ]);
    }

    /**
     * Export transactions to Excel
     */
    public function exportExcel(Request $request)
    {
        $search   = (string) ($request->get('search') ?? '');
        $status   = (string) ($request->get('status') ?? 'all');
        $dateFrom = (string) ($request->get('date_from') ?? '');
        $dateTo   = (string) ($request->get('date_to') ?? '');

        $transactions = $this->buildTransactionQuery($search, $status, $dateFrom, $dateTo)
            ->latest()->get();

        $filename = 'transaksi-' . now()->format('Ymd-His') . '.xlsx';

        return Excel::download(new OwnerTransactionsExport($transactions), $filename);
    }

    /**
     * Export transactions to PDF
     */
    public function exportPdf(Request $request)
    {
        $search   = (string) ($request->get('search') ?? '');
        $status   = (string) ($request->get('status') ?? 'all');
        $dateFrom = (string) ($request->get('date_from') ?? '');
        $dateTo   = (string) ($request->get('date_to') ?? '');

        $transactions = $this->buildTransactionQuery($search, $status, $dateFrom, $dateTo)
            ->latest()->get();

        $stats    = $this->getTransactionStats($search, $status, $dateFrom, $dateTo);
        $period   = $this->buildPeriodLabel($dateFrom, $dateTo);
        $siteName = \App\Models\Setting::get('site_name', 'ChatCepat');
        $filters  = compact('search', 'status', 'dateFrom', 'dateTo');

        $pdf = Pdf::loadView('exports.owner-transactions-pdf', compact(
            'transactions', 'stats', 'filters', 'period', 'siteName'
        ))->setPaper('a4', 'landscape');

        $filename = 'transaksi-' . now()->format('Ymd-His') . '.pdf';

        return $pdf->download($filename);
    }

    // ─── Helpers ────────────────────────────────────────────────────────────────

    private function buildTransactionQuery(string $search, string $status, string $dateFrom, string $dateTo)
    {
        $query = Transaction::with(['user', 'pricingPackage']);

        if ($status && $status !== 'all') {
            $query->where('status', $status);
        }

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('invoice_number', 'like', "%{$search}%")
                  ->orWhereHas('user', fn($uq) => $uq->where('name', 'like', "%{$search}%")
                      ->orWhere('email', 'like', "%{$search}%"));
            });
        }

        if ($dateFrom) {
            $query->whereDate('created_at', '>=', $dateFrom);
        }

        if ($dateTo) {
            $query->whereDate('created_at', '<=', $dateTo);
        }

        return $query;
    }

    private function getTransactionStats(string $search = '', string $status = 'all', string $dateFrom = '', string $dateTo = ''): array
    {
        $base = $this->buildTransactionQuery($search, $status, $dateFrom, $dateTo);

        return [
            'total'         => (clone $base)->count(),
            'pending'       => (clone $base)->where('status', 'pending')->count(),
            'paid'          => (clone $base)->where('status', 'paid')->count(),
            'failed'        => (clone $base)->where('status', 'failed')->count(),
            'expired'       => (clone $base)->where('status', 'expired')->count(),
            'total_revenue' => (string) (clone $base)->where('status', 'paid')->sum('amount'),
        ];
    }

    private function buildPeriodLabel(string $dateFrom, string $dateTo): string
    {
        if ($dateFrom && $dateTo) {
            return Carbon::parse($dateFrom)->format('d M Y') . ' – ' . Carbon::parse($dateTo)->format('d M Y');
        }
        if ($dateFrom) return 'Mulai ' . Carbon::parse($dateFrom)->format('d M Y');
        if ($dateTo)   return 'Hingga ' . Carbon::parse($dateTo)->format('d M Y');
        return 'Semua Waktu';
    }
}
