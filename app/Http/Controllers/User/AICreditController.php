<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AICreditController extends Controller
{
    /**
     * Display AI credit top up page
     */
    public function index(): Response
    {
        $user = auth()->user();

        return Inertia::render('user/ai-credit/index', [
            'user' => $user,
            'currentCredit' => $user->ai_credit ?? 0,
            'creditPackages' => [
                [
                    'id' => 1,
                    'name' => 'Paket Pemula',
                    'credits' => 100,
                    'price' => 10000,
                    'bonus' => 0,
                    'popular' => false,
                ],
                [
                    'id' => 2,
                    'name' => 'Paket Bisnis',
                    'credits' => 500,
                    'price' => 45000,
                    'bonus' => 50,
                    'popular' => true,
                ],
                [
                    'id' => 3,
                    'name' => 'Paket Enterprise',
                    'credits' => 1000,
                    'price' => 80000,
                    'bonus' => 150,
                    'popular' => false,
                ],
                [
                    'id' => 4,
                    'name' => 'Paket Unlimited',
                    'credits' => 5000,
                    'price' => 350000,
                    'bonus' => 1000,
                    'popular' => false,
                ],
            ],
            'usageHistory' => $this->getUsageHistory(),
        ]);
    }

    /**
     * Purchase AI credits
     */
    public function purchase(Request $request)
    {
        $validated = $request->validate([
            'package_id' => 'required|integer|min:1|max:4',
            'payment_method' => 'required|in:bank_transfer,e-wallet,credit_card',
        ]);

        // Credit packages mapping
        $packages = [
            1 => ['credits' => 100, 'price' => 10000, 'bonus' => 0],
            2 => ['credits' => 500, 'price' => 45000, 'bonus' => 50],
            3 => ['credits' => 1000, 'price' => 80000, 'bonus' => 150],
            4 => ['credits' => 5000, 'price' => 350000, 'bonus' => 1000],
        ];

        $package = $packages[$validated['package_id']];
        $totalCredits = $package['credits'] + $package['bonus'];

        // TODO: Create payment transaction
        // 1. Create transaction record
        // 2. Generate payment URL (Midtrans/Duitku)
        // 3. Redirect to payment page

        // For now, just add credits directly (DEVELOPMENT ONLY)
        $user = auth()->user();
        $user->increment('ai_credit', $totalCredits);

        return redirect()->back()->with('success', "Berhasil menambahkan {$totalCredits} AI credits!");
    }

    /**
     * Get AI credit usage history
     */
    public function history()
    {
        $history = $this->getUsageHistory();

        return response()->json([
            'history' => $history,
        ]);
    }

    /**
     * Get usage history data
     */
    private function getUsageHistory()
    {
        // TODO: Get from database
        // For now, return empty array
        return [];

        // Example structure:
        // return [
        //     [
        //         'date' => '2026-01-27 10:30:00',
        //         'type' => 'usage',
        //         'credits' => -5,
        //         'balance' => 95,
        //         'description' => 'Chatbot AI - 5 pesan',
        //     ],
        //     [
        //         'date' => '2026-01-26 15:20:00',
        //         'type' => 'purchase',
        //         'credits' => +100,
        //         'balance' => 100,
        //         'description' => 'Top Up - Paket Pemula',
        //     ],
        // ];
    }
}
