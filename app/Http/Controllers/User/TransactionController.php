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
            ->with(['pricingPackage:id,name', 'bank:id,nama_bank,norek'])
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
                'bank_name' => $transaction->bank?->nama_bank ?? $this->getPaymentMethodLabel($transaction->payment_method),
                'amount' => $transaction->amount,
                'formatted_amount' => 'Rp ' . number_format($transaction->amount, 0, ',', '.'),
                'status' => $transaction->status,
                'status_label' => $this->getStatusLabel($transaction->status),
                'status_color' => $this->getStatusColor($transaction->status),
                'payment_method' => $transaction->payment_method,
                'payment_method_label' => $this->getPaymentMethodLabel($transaction->payment_method),
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
                'bank_name' => $transaction->bank?->nama_bank ?? $this->getPaymentMethodLabel($transaction->payment_method),
                'bank_code' => $transaction->bank?->norek ?? '-',
                'amount' => $transaction->amount,
                'formatted_amount' => 'Rp ' . number_format($transaction->amount, 0, ',', '.'),
                'status' => $transaction->status,
                'status_label' => $this->getStatusLabel($transaction->status),
                'status_color' => $this->getStatusColor($transaction->status),
                'payment_method' => $transaction->payment_method,
                'payment_method_label' => $this->getPaymentMethodLabel($transaction->payment_method),
                'payment_code' => $transaction->payment_code,
                'va_number' => $transaction->va_number,
                'payment_url' => $transaction->payment_url,
                'proof_image' => $transaction->proof_image ? '/storage/' . $transaction->proof_image : null,
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

    /**
     * Get readable payment method name from Duitku code
     */
    private function getPaymentMethodLabel(?string $code): string
    {
        if (!$code) return '-';

        $methods = [
            // Virtual Account
            'BC' => 'BCA Virtual Account',
            'M1' => 'Mandiri Virtual Account',
            'M2' => 'Mandiri Virtual Account',
            'VA' => 'Maybank Virtual Account',
            'I1' => 'BNI Virtual Account',
            'B1' => 'CIMB Niaga Virtual Account',
            'BT' => 'Permata Bank Virtual Account',
            'A1' => 'ATM Bersama',
            'AG' => 'Bank Artha Graha',
            'NC' => 'Bank Neo Commerce',
            'BR' => 'BRIVA',
            'S1' => 'Bank Sahabat Sampoerna',

            // E-Wallet
            'OV' => 'OVO',
            'SA' => 'ShopeePay',
            'LQ' => 'LinkAja',
            'DA' => 'DANA',
            'LA' => 'LinkAja',
            'SP' => 'ShopeePay Later',
            'IR' => 'Indodana PayLater',

            // Retail
            'FT' => 'Pegadaian',
            'A2' => 'POS Indonesia',
            'IR' => 'Indomaret',
            'AL' => 'Alfamart',
            'PC' => 'Credit Card',

            // QRIS
            'SP' => 'ShopeePay QRIS',
            'NQ' => 'QRIS',
            'DQ' => 'DANA QRIS',
            'GQ' => 'GoPay QRIS',
            'SQ' => 'ShopeePay QRIS',
            'LF' => 'LinkAja Fixed',

            // Manual Transfer
            'manual' => 'Transfer Manual',
        ];

        return $methods[$code] ?? $code;
    }
}
