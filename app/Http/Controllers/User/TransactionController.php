<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Models\Transaction;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class TransactionController extends Controller
{
    /**
     * Display user's transaction history
     */
    public function index(Request $request): Response
    {
        $query = Transaction::where('user_id', auth()->id())
            ->with(['pricingPackage:id,name', 'bank:id,name,code'])
            ->latest();

        // Filter by status
        if ($request->filled('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        // Search by invoice number
        if ($request->filled('search')) {
            $query->where(function ($q) use ($request) {
                $q->where('invoice_number', 'like', '%' . $request->search . '%')
                  ->orWhere('merchant_order_id', 'like', '%' . $request->search . '%');
            });
        }

        $transactions = $query->paginate(15)->through(function ($transaction) {
            return [
                'id' => $transaction->id,
                'invoice_number' => $transaction->invoice_number,
                'package_name' => $transaction->pricingPackage?->name ?? '-',
                'bank_name' => $transaction->bank?->name ?? $transaction->payment_method ?? '-',
                'amount' => $transaction->amount,
                'formatted_amount' => 'Rp ' . number_format($transaction->amount, 0, ',', '.'),
                'status' => $transaction->status,
                'status_label' => $this->getStatusLabel($transaction->status),
                'status_color' => $this->getStatusColor($transaction->status),
                'payment_method' => $transaction->payment_method,
                'va_number' => $transaction->va_number,
                'created_at' => $transaction->created_at->format('d/m/Y H:i'),
                'paid_at' => $transaction->paid_at?->format('d/m/Y H:i'),
                'expired_at' => $transaction->expired_at?->format('d/m/Y H:i'),
            ];
        });

        // Get stats
        $stats = [
            'total_transactions' => Transaction::where('user_id', auth()->id())->count(),
            'total_paid' => Transaction::where('user_id', auth()->id())->where('status', 'paid')->count(),
            'total_pending' => Transaction::where('user_id', auth()->id())->where('status', 'pending')->count(),
            'total_amount_paid' => Transaction::where('user_id', auth()->id())
                ->where('status', 'paid')
                ->sum('amount'),
        ];

        return Inertia::render('user/transactions/index', [
            'transactions' => $transactions,
            'stats' => $stats,
            'filters' => [
                'status' => $request->status ?? 'all',
                'search' => $request->search ?? '',
            ],
        ]);
    }

    /**
     * Show transaction detail
     */
    public function show(Transaction $transaction): Response
    {
        // Ensure user owns this transaction
        if ($transaction->user_id !== auth()->id()) {
            abort(403, 'Akses tidak diizinkan');
        }

        $transaction->load(['pricingPackage', 'bank']);

        return Inertia::render('user/transactions/show', [
            'transaction' => [
                'id' => $transaction->id,
                'invoice_number' => $transaction->invoice_number,
                'merchant_order_id' => $transaction->merchant_order_id,
                'package_name' => $transaction->pricingPackage?->name ?? '-',
                'bank_name' => $transaction->bank?->name ?? '-',
                'bank_code' => $transaction->bank?->code ?? '-',
                'amount' => $transaction->amount,
                'formatted_amount' => 'Rp ' . number_format($transaction->amount, 0, ',', '.'),
                'status' => $transaction->status,
                'status_label' => $this->getStatusLabel($transaction->status),
                'status_color' => $this->getStatusColor($transaction->status),
                'payment_method' => $transaction->payment_method,
                'payment_code' => $transaction->payment_code,
                'va_number' => $transaction->va_number,
                'payment_url' => $transaction->payment_url,
                'proof_image' => $transaction->proof_image,
                'notes' => $transaction->notes,
                'created_at' => $transaction->created_at->format('d/m/Y H:i'),
                'paid_at' => $transaction->paid_at?->format('d/m/Y H:i'),
                'expired_at' => $transaction->expired_at?->format('d/m/Y H:i'),
            ],
        ]);
    }

    /**
     * Get status label in Indonesian
     */
    private function getStatusLabel(string $status): string
    {
        return match ($status) {
            'pending' => 'Menunggu Pembayaran',
            'paid' => 'Lunas',
            'failed' => 'Gagal',
            'expired' => 'Kedaluwarsa',
            'cancelled' => 'Dibatalkan',
            default => ucfirst($status),
        };
    }

    /**
     * Get status color for badge
     */
    private function getStatusColor(string $status): string
    {
        return match ($status) {
            'pending' => 'yellow',
            'paid' => 'green',
            'failed' => 'red',
            'expired' => 'gray',
            'cancelled' => 'gray',
            default => 'gray',
        };
    }
}
