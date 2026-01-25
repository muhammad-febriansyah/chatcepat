<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Models\WhatsappBroadcast;
use App\Models\TelegramBroadcast;
use App\Models\GoogleMapPlace;
use App\Models\WhatsappContact;
use App\Models\WhatsappGroup;
use App\Models\WhatsappAutoReply;
use App\Models\TelegramAutoReply;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Carbon\Carbon;

class ReportController extends Controller
{
    /**
     * Display the reports page.
     */
    public function index()
    {
        return Inertia::render('user/reports/index');
    }

    /**
     * Get broadcast report data.
     */
    public function broadcast(Request $request)
    {
        $userId = auth()->id();
        $startDate = $request->input('start_date', Carbon::now()->subDays(30)->startOfDay());
        $endDate = $request->input('end_date', Carbon::now()->endOfDay());

        // WhatsApp Broadcast Stats
        $whatsappStats = WhatsappBroadcast::where('user_id', $userId)
            ->whereBetween('created_at', [$startDate, $endDate])
            ->selectRaw('
                COUNT(*) as total,
                SUM(total_recipients) as total_recipients,
                SUM(sent_count) as sent_count,
                SUM(failed_count) as failed_count
            ')
            ->first();

        // Telegram Broadcast Stats
        $telegramStats = TelegramBroadcast::where('user_id', $userId)
            ->whereBetween('created_at', [$startDate, $endDate])
            ->selectRaw('
                COUNT(*) as total,
                SUM(total_recipients) as total_recipients,
                SUM(sent_count) as sent_count,
                SUM(failed_count) as failed_count
            ')
            ->first();

        $totalBroadcasts = ($whatsappStats->total ?? 0) + ($telegramStats->total ?? 0);
        $totalRecipients = ($whatsappStats->total_recipients ?? 0) + ($telegramStats->total_recipients ?? 0);
        $totalSent = ($whatsappStats->sent_count ?? 0) + ($telegramStats->sent_count ?? 0);
        $totalFailed = ($whatsappStats->failed_count ?? 0) + ($telegramStats->failed_count ?? 0);

        $successRate = $this->calculateSuccessRate($totalSent, $totalRecipients);

        // Breakdown by status for WhatsApp
        $whatsappByStatus = WhatsappBroadcast::where('user_id', $userId)
            ->whereBetween('created_at', [$startDate, $endDate])
            ->select('status', DB::raw('COUNT(*) as count'))
            ->groupBy('status')
            ->pluck('count', 'status')
            ->toArray();

        // Breakdown by status for Telegram
        $telegramByStatus = TelegramBroadcast::where('user_id', $userId)
            ->whereBetween('created_at', [$startDate, $endDate])
            ->select('status', DB::raw('COUNT(*) as count'))
            ->groupBy('status')
            ->pluck('count', 'status')
            ->toArray();

        // Chart data - daily broadcasts
        $chartData = $this->getBroadcastChartData($userId, $startDate, $endDate);

        return response()->json([
            'total_broadcasts' => $totalBroadcasts,
            'total_recipients' => $totalRecipients,
            'total_sent' => $totalSent,
            'total_failed' => $totalFailed,
            'success_rate' => $successRate,
            'whatsapp_stats' => [
                'total' => $whatsappStats->total ?? 0,
                'recipients' => $whatsappStats->total_recipients ?? 0,
                'sent' => $whatsappStats->sent_count ?? 0,
                'failed' => $whatsappStats->failed_count ?? 0,
                'by_status' => $whatsappByStatus,
            ],
            'telegram_stats' => [
                'total' => $telegramStats->total ?? 0,
                'recipients' => $telegramStats->total_recipients ?? 0,
                'sent' => $telegramStats->sent_count ?? 0,
                'failed' => $telegramStats->failed_count ?? 0,
                'by_status' => $telegramByStatus,
            ],
            'chart_data' => $chartData,
        ]);
    }

    /**
     * Get scraping report data.
     */
    public function scraping(Request $request)
    {
        $userId = auth()->id();
        $startDate = $request->input('start_date', Carbon::now()->subDays(30)->startOfDay());
        $endDate = $request->input('end_date', Carbon::now()->endOfDay());

        // Google Maps scraping
        $googleMapsCount = GoogleMapPlace::where('user_id', $userId)
            ->whereBetween('created_at', [$startDate, $endDate])
            ->count();

        // WhatsApp Contacts
        $whatsappContactsCount = WhatsappContact::where('user_id', $userId)
            ->whereBetween('created_at', [$startDate, $endDate])
            ->count();

        // WhatsApp Groups
        $whatsappGroupsCount = WhatsappGroup::where('user_id', $userId)
            ->whereBetween('created_at', [$startDate, $endDate])
            ->count();

        $totalScraped = $googleMapsCount + $whatsappContactsCount + $whatsappGroupsCount;

        // Chart data - daily scraping
        $chartData = $this->getScrapingChartData($userId, $startDate, $endDate);

        return response()->json([
            'total_scraped' => $totalScraped,
            'google_maps' => $googleMapsCount,
            'whatsapp_contacts' => $whatsappContactsCount,
            'whatsapp_groups' => $whatsappGroupsCount,
            'breakdown' => [
                [
                    'type' => 'Google Maps',
                    'count' => $googleMapsCount,
                    'percentage' => $totalScraped > 0 ? round(($googleMapsCount / $totalScraped) * 100, 1) : 0,
                ],
                [
                    'type' => 'Kontak WhatsApp',
                    'count' => $whatsappContactsCount,
                    'percentage' => $totalScraped > 0 ? round(($whatsappContactsCount / $totalScraped) * 100, 1) : 0,
                ],
                [
                    'type' => 'Grup WhatsApp',
                    'count' => $whatsappGroupsCount,
                    'percentage' => $totalScraped > 0 ? round(($whatsappGroupsCount / $totalScraped) * 100, 1) : 0,
                ],
            ],
            'chart_data' => $chartData,
        ]);
    }

    /**
     * Get chatbot & auto reply report data.
     */
    public function chatbot(Request $request)
    {
        $userId = auth()->id();
        $startDate = $request->input('start_date', Carbon::now()->subDays(30)->startOfDay());
        $endDate = $request->input('end_date', Carbon::now()->endOfDay());

        // WhatsApp Auto Reply Stats - join through whatsapp_sessions
        $whatsappRules = WhatsappAutoReply::whereHas('session', function ($query) use ($userId) {
            $query->where('user_id', $userId);
        })->count();

        $whatsappActiveRules = WhatsappAutoReply::whereHas('session', function ($query) use ($userId) {
            $query->where('user_id', $userId);
        })->where('is_active', true)->count();

        // Telegram Auto Reply Stats - join through telegram_bots
        $telegramRules = TelegramAutoReply::whereHas('bot', function ($query) use ($userId) {
            $query->where('user_id', $userId);
        })->count();

        $telegramActiveRules = TelegramAutoReply::whereHas('bot', function ($query) use ($userId) {
            $query->where('user_id', $userId);
        })->where('is_active', true)->count();

        $totalRules = $whatsappRules + $telegramRules;
        $totalActiveRules = $whatsappActiveRules + $telegramActiveRules;

        // Count by type (AI vs Manual) - WhatsApp uses reply_type with 'openai', 'custom', etc.
        $whatsappByType = WhatsappAutoReply::whereHas('session', function ($query) use ($userId) {
            $query->where('user_id', $userId);
        })
            ->select('reply_type', DB::raw('COUNT(*) as count'))
            ->groupBy('reply_type')
            ->pluck('count', 'reply_type')
            ->toArray();

        // For WhatsApp: 'openai' = AI, others = manual
        $whatsappAiCount = $whatsappByType['openai'] ?? 0;
        $whatsappManualCount = ($whatsappByType['custom'] ?? 0) + ($whatsappByType['rajaongkir'] ?? 0);

        // Telegram doesn't have AI/Manual distinction in current schema, treat all as manual
        $telegramManualCount = $telegramRules;

        // Merge counts
        $aiCount = $whatsappAiCount;
        $manualCount = $whatsappManualCount + $telegramManualCount;

        // Chart data
        $chartData = $this->getChatbotChartData($userId, $startDate, $endDate);

        return response()->json([
            'total_rules' => $totalRules,
            'active_rules' => $totalActiveRules,
            'inactive_rules' => $totalRules - $totalActiveRules,
            'whatsapp_rules' => $whatsappRules,
            'telegram_rules' => $telegramRules,
            'by_type' => [
                'ai' => $aiCount,
                'manual' => $manualCount,
            ],
            'breakdown' => [
                [
                    'type' => 'AI Reply',
                    'count' => $aiCount,
                    'percentage' => $totalRules > 0 ? round(($aiCount / $totalRules) * 100, 1) : 0,
                ],
                [
                    'type' => 'Manual Reply',
                    'count' => $manualCount,
                    'percentage' => $totalRules > 0 ? round(($manualCount / $totalRules) * 100, 1) : 0,
                ],
            ],
            'chart_data' => $chartData,
        ]);
    }

    /**
     * Get general/dashboard report with period comparison.
     */
    public function general(Request $request)
    {
        $userId = auth()->id();

        // Current period (default: last 30 days)
        $currentEnd = Carbon::now()->endOfDay();
        $currentStart = Carbon::now()->subDays(29)->startOfDay();

        // Previous period (30 days before current period)
        $previousEnd = $currentStart->copy()->subSecond();
        $previousStart = $previousEnd->copy()->subDays(29)->startOfDay();

        // Get stats for both periods
        $currentStats = $this->getGeneralStats($userId, $currentStart, $currentEnd);
        $previousStats = $this->getGeneralStats($userId, $previousStart, $previousEnd);

        // Calculate comparisons
        $comparison = $this->calculateComparison($currentStats, $previousStats);

        return response()->json([
            'current' => $currentStats,
            'previous' => $previousStats,
            'comparison' => $comparison,
            'period' => [
                'current_start' => $currentStart->format('Y-m-d'),
                'current_end' => $currentEnd->format('Y-m-d'),
                'previous_start' => $previousStart->format('Y-m-d'),
                'previous_end' => $previousEnd->format('Y-m-d'),
            ],
        ]);
    }

    /**
     * Calculate success rate percentage.
     */
    private function calculateSuccessRate($sent, $total): float
    {
        if ($total == 0) {
            return 0;
        }

        return round(($sent / $total) * 100, 2);
    }

    /**
     * Get broadcast chart data (daily).
     */
    private function getBroadcastChartData($userId, $startDate, $endDate): array
    {
        $whatsappDaily = WhatsappBroadcast::where('user_id', $userId)
            ->whereBetween('created_at', [$startDate, $endDate])
            ->select(DB::raw('DATE(created_at) as date'), DB::raw('COUNT(*) as count'))
            ->groupBy('date')
            ->orderBy('date')
            ->get()
            ->keyBy('date');

        $telegramDaily = TelegramBroadcast::where('user_id', $userId)
            ->whereBetween('created_at', [$startDate, $endDate])
            ->select(DB::raw('DATE(created_at) as date'), DB::raw('COUNT(*) as count'))
            ->groupBy('date')
            ->orderBy('date')
            ->get()
            ->keyBy('date');

        // Generate date range
        $period = Carbon::parse($startDate)->daysUntil($endDate);
        $chartData = [];

        foreach ($period as $date) {
            $dateStr = $date->format('Y-m-d');
            $chartData[] = [
                'date' => $dateStr,
                'whatsapp' => $whatsappDaily[$dateStr]->count ?? 0,
                'telegram' => $telegramDaily[$dateStr]->count ?? 0,
            ];
        }

        return $chartData;
    }

    /**
     * Get scraping chart data (daily).
     */
    private function getScrapingChartData($userId, $startDate, $endDate): array
    {
        $googleMapsDaily = GoogleMapPlace::where('user_id', $userId)
            ->whereBetween('created_at', [$startDate, $endDate])
            ->select(DB::raw('DATE(created_at) as date'), DB::raw('COUNT(*) as count'))
            ->groupBy('date')
            ->orderBy('date')
            ->get()
            ->keyBy('date');

        $contactsDaily = WhatsappContact::where('user_id', $userId)
            ->whereBetween('created_at', [$startDate, $endDate])
            ->select(DB::raw('DATE(created_at) as date'), DB::raw('COUNT(*) as count'))
            ->groupBy('date')
            ->orderBy('date')
            ->get()
            ->keyBy('date');

        $groupsDaily = WhatsappGroup::where('user_id', $userId)
            ->whereBetween('created_at', [$startDate, $endDate])
            ->select(DB::raw('DATE(created_at) as date'), DB::raw('COUNT(*) as count'))
            ->groupBy('date')
            ->orderBy('date')
            ->get()
            ->keyBy('date');

        // Generate date range
        $period = Carbon::parse($startDate)->daysUntil($endDate);
        $chartData = [];

        foreach ($period as $date) {
            $dateStr = $date->format('Y-m-d');
            $chartData[] = [
                'date' => $dateStr,
                'google_maps' => $googleMapsDaily[$dateStr]->count ?? 0,
                'contacts' => $contactsDaily[$dateStr]->count ?? 0,
                'groups' => $groupsDaily[$dateStr]->count ?? 0,
            ];
        }

        return $chartData;
    }

    /**
     * Get chatbot chart data (daily active rules).
     */
    private function getChatbotChartData($userId, $startDate, $endDate): array
    {
        // For chatbot, we'll show the count of rules created over time
        $whatsappDaily = WhatsappAutoReply::whereHas('session', function ($query) use ($userId) {
            $query->where('user_id', $userId);
        })
            ->whereBetween('created_at', [$startDate, $endDate])
            ->select(DB::raw('DATE(created_at) as date'), DB::raw('COUNT(*) as count'))
            ->groupBy('date')
            ->orderBy('date')
            ->get()
            ->keyBy('date');

        $telegramDaily = TelegramAutoReply::whereHas('bot', function ($query) use ($userId) {
            $query->where('user_id', $userId);
        })
            ->whereBetween('created_at', [$startDate, $endDate])
            ->select(DB::raw('DATE(created_at) as date'), DB::raw('COUNT(*) as count'))
            ->groupBy('date')
            ->orderBy('date')
            ->get()
            ->keyBy('date');

        // Generate date range
        $period = Carbon::parse($startDate)->daysUntil($endDate);
        $chartData = [];

        foreach ($period as $date) {
            $dateStr = $date->format('Y-m-d');
            $chartData[] = [
                'date' => $dateStr,
                'whatsapp' => $whatsappDaily[$dateStr]->count ?? 0,
                'telegram' => $telegramDaily[$dateStr]->count ?? 0,
            ];
        }

        return $chartData;
    }

    /**
     * Get general statistics for a period.
     */
    private function getGeneralStats($userId, $startDate, $endDate): array
    {
        $broadcasts = WhatsappBroadcast::where('user_id', $userId)
            ->whereBetween('created_at', [$startDate, $endDate])
            ->count();

        $broadcasts += TelegramBroadcast::where('user_id', $userId)
            ->whereBetween('created_at', [$startDate, $endDate])
            ->count();

        $scraped = GoogleMapPlace::where('user_id', $userId)
            ->whereBetween('created_at', [$startDate, $endDate])
            ->count();

        $scraped += WhatsappContact::where('user_id', $userId)
            ->whereBetween('created_at', [$startDate, $endDate])
            ->count();

        $scraped += WhatsappGroup::where('user_id', $userId)
            ->whereBetween('created_at', [$startDate, $endDate])
            ->count();

        $autoReplyRules = WhatsappAutoReply::whereHas('session', function ($query) use ($userId) {
            $query->where('user_id', $userId);
        })
            ->whereBetween('created_at', [$startDate, $endDate])
            ->count();

        $autoReplyRules += TelegramAutoReply::whereHas('bot', function ($query) use ($userId) {
            $query->where('user_id', $userId);
        })
            ->whereBetween('created_at', [$startDate, $endDate])
            ->count();

        return [
            'broadcasts' => $broadcasts,
            'scraped_data' => $scraped,
            'auto_reply_rules' => $autoReplyRules,
        ];
    }

    /**
     * Calculate comparison between current and previous stats.
     */
    private function calculateComparison($current, $previous): array
    {
        $comparison = [];

        foreach ($current as $key => $value) {
            $previousValue = $previous[$key] ?? 0;
            $difference = $value - $previousValue;

            if ($previousValue > 0) {
                $percentageChange = round((($value - $previousValue) / $previousValue) * 100, 1);
            } else {
                $percentageChange = $value > 0 ? 100 : 0;
            }

            $comparison[$key] = [
                'difference' => $difference,
                'percentage' => $percentageChange,
                'trend' => $difference > 0 ? 'up' : ($difference < 0 ? 'down' : 'stable'),
            ];
        }

        return $comparison;
    }
}
