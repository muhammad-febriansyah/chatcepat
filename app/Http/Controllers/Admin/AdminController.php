<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Faq;
use App\Models\Page;
use App\Models\BlogCategory;
use App\Models\Post;
use App\Models\Feature;
use App\Models\PricingPackage;
use App\Models\WhatsappSession;
use App\Models\Transaction;
use App\Models\User;
use App\Models\GoogleMapPlace;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;
use Inertia\Inertia;
use Inertia\Response;

class AdminController extends Controller
{
    public function dashboard(): Response
    {
        // Content Stats
        $contentStats = [
            'total_faqs' => Faq::count(),
            'total_pages' => Page::count(),
            'total_features' => Feature::count(),
            'total_active_features' => Feature::where('is_active', true)->count(),
            'total_pricing_packages' => PricingPackage::count(),
            'total_active_packages' => PricingPackage::where('is_active', true)->count(),
            'total_blog_categories' => BlogCategory::count(),
            'total_blog_posts' => Post::count(),
            'total_published_posts' => Post::where('status', 'published')->count(),
            'total_draft_posts' => Post::where('status', 'draft')->count(),
        ];

        // User Stats
        $userStats = [
            'total_users' => User::count(),
            'total_admins' => User::where('role', 'admin')->count(),
            'total_regular_users' => User::where('role', 'user')->count(),
            'new_users_this_month' => User::whereMonth('created_at', Carbon::now()->month)
                ->whereYear('created_at', Carbon::now()->year)
                ->count(),
            'new_users_last_month' => User::whereMonth('created_at', Carbon::now()->subMonth()->month)
                ->whereYear('created_at', Carbon::now()->subMonth()->year)
                ->count(),
        ];

        // Transaction Stats
        $transactionStats = [
            'total_transactions' => Transaction::count(),
            'pending_transactions' => Transaction::where('status', 'pending')->count(),
            'paid_transactions' => Transaction::where('status', 'paid')->count(),
            'failed_transactions' => Transaction::where('status', 'failed')->count(),
            'expired_transactions' => Transaction::where('status', 'expired')->count(),
            'total_revenue' => Transaction::where('status', 'paid')->sum('amount'),
            'revenue_this_month' => Transaction::where('status', 'paid')
                ->whereMonth('paid_at', Carbon::now()->month)
                ->whereYear('paid_at', Carbon::now()->year)
                ->sum('amount'),
            'revenue_last_month' => Transaction::where('status', 'paid')
                ->whereMonth('paid_at', Carbon::now()->subMonth()->month)
                ->whereYear('paid_at', Carbon::now()->subMonth()->year)
                ->sum('amount'),
        ];

        // Scraper Stats
        $scraperStats = [
            'total_places' => GoogleMapPlace::count(),
            'places_this_month' => GoogleMapPlace::whereMonth('created_at', Carbon::now()->month)
                ->whereYear('created_at', Carbon::now()->year)
                ->count(),
        ];

        // Monthly Revenue Data (Last 6 months)
        $monthlyRevenue = [];
        for ($i = 5; $i >= 0; $i--) {
            $date = Carbon::now()->subMonths($i);
            $revenue = Transaction::where('status', 'paid')
                ->whereMonth('paid_at', $date->month)
                ->whereYear('paid_at', $date->year)
                ->sum('amount');

            $monthlyRevenue[] = [
                'month' => $date->translatedFormat('M Y'),
                'revenue' => (float) $revenue,
            ];
        }

        // Monthly Transactions Count (Last 6 months)
        $monthlyTransactions = [];
        for ($i = 5; $i >= 0; $i--) {
            $date = Carbon::now()->subMonths($i);
            $count = Transaction::whereMonth('created_at', $date->month)
                ->whereYear('created_at', $date->year)
                ->count();

            $monthlyTransactions[] = [
                'month' => $date->translatedFormat('M Y'),
                'count' => $count,
            ];
        }

        // Monthly User Registration (Last 6 months)
        $monthlyUsers = [];
        for ($i = 5; $i >= 0; $i--) {
            $date = Carbon::now()->subMonths($i);
            $count = User::whereMonth('created_at', $date->month)
                ->whereYear('created_at', $date->year)
                ->count();

            $monthlyUsers[] = [
                'month' => $date->translatedFormat('M Y'),
                'count' => $count,
            ];
        }

        // Recent Transactions (last 5)
        $recentTransactions = Transaction::with(['user', 'pricingPackage'])
            ->orderBy('created_at', 'desc')
            ->take(5)
            ->get()
            ->map(function ($transaction) {
                return [
                    'id' => $transaction->id,
                    'invoice_number' => $transaction->invoice_number,
                    'user_name' => $transaction->user?->name ?? 'Unknown',
                    'package_name' => $transaction->pricingPackage?->name ?? '-',
                    'amount' => $transaction->amount,
                    'status' => $transaction->status,
                    'created_at' => $transaction->created_at->format('d M Y H:i'),
                ];
            });

        // Recent Users (last 5)
        $recentUsers = User::orderBy('created_at', 'desc')
            ->take(5)
            ->get()
            ->map(function ($user) {
                return [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'role' => $user->role,
                    'created_at' => $user->created_at->format('d M Y'),
                ];
            });

        // Get WhatsApp sessions for current user
        $whatsappSessions = WhatsappSession::where('user_id', auth()->id())
            ->select('id', 'name', 'status', 'phone_number')
            ->orderBy('created_at', 'desc')
            ->get();

        return Inertia::render('admin/dashboard', [
            'contentStats' => $contentStats,
            'userStats' => $userStats,
            'transactionStats' => $transactionStats,
            'scraperStats' => $scraperStats,
            'monthlyRevenue' => $monthlyRevenue,
            'monthlyTransactions' => $monthlyTransactions,
            'monthlyUsers' => $monthlyUsers,
            'recentTransactions' => $recentTransactions,
            'recentUsers' => $recentUsers,
            'whatsappSessions' => $whatsappSessions,
        ]);
    }
}
