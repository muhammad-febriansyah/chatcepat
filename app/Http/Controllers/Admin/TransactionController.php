<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Transaction;
use App\Mail\PaymentSuccessNotification;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class TransactionController extends Controller
{
    public function index(Request $request): Response
    {
        $query = Transaction::with(['user', 'pricingPackage', 'bank'])
            ->orderBy('created_at', 'desc');

        // Filter by status
        if ($request->has('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        // Search by invoice number or user name
        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('invoice_number', 'like', "%{$search}%")
                    ->orWhereHas('user', function ($q) use ($search) {
                        $q->where('name', 'like', "%{$search}%")
                            ->orWhere('email', 'like', "%{$search}%");
                    });
            });
        }

        $transactions = $query->paginate(15)->withQueryString();

        // Get statistics
        $stats = [
            'total' => Transaction::count(),
            'pending' => Transaction::where('status', 'pending')->count(),
            'paid' => Transaction::where('status', 'paid')->count(),
            'failed' => Transaction::where('status', 'failed')->count(),
            'expired' => Transaction::where('status', 'expired')->count(),
            'total_revenue' => Transaction::where('status', 'paid')->sum('amount'),
        ];

        return Inertia::render('admin/transactions/index', [
            'transactions' => $transactions,
            'stats' => $stats,
            'filters' => [
                'status' => $request->status ?? 'all',
                'search' => $request->search ?? '',
            ],
        ]);
    }

    public function show(int $id): Response
    {
        $transaction = Transaction::with(['user', 'pricingPackage', 'bank'])->findOrFail($id);

        return Inertia::render('admin/transactions/show', [
            'transaction' => $transaction,
        ]);
    }

    public function updateStatus(Request $request, int $id): RedirectResponse
    {
        $transaction = Transaction::findOrFail($id);

        $validated = $request->validate([
            'status' => ['required', 'string', 'in:pending,paid,failed,expired'],
            'notes' => ['nullable', 'string', 'max:500'],
        ]);

        $wasNotPaid = $transaction->status !== 'paid';

        // Use markAsPaid() for 'paid' status to handle subscription extension
        if ($validated['status'] === 'paid' && $wasNotPaid) {
            $transaction->markAsPaid();

            // Refresh transaction to get updated data
            $transaction->refresh();

            // Send payment success email notification
            try {
                $customerEmail = $transaction->customer_info['email'] ?? $transaction->user->email;
                Mail::to($customerEmail)->send(new PaymentSuccessNotification($transaction));
                Log::info('Payment success email sent (admin approve)', [
                    'transaction_id' => $transaction->id,
                    'email' => $customerEmail,
                ]);
            } catch (\Exception $e) {
                Log::error('Failed to send payment success email (admin approve)', [
                    'transaction_id' => $transaction->id,
                    'error' => $e->getMessage(),
                ]);
                // Don't fail if email fails
            }
        } else {
            $transaction->update([
                'status' => $validated['status'],
            ]);
        }

        // Update notes if provided
        if (isset($validated['notes'])) {
            $transaction->update(['notes' => $validated['notes']]);
        }

        return redirect()
            ->back()
            ->with('success', 'Status transaksi berhasil diperbarui!');
    }

    public function destroy(int $id): RedirectResponse
    {
        $transaction = Transaction::findOrFail($id);

        // Delete proof image if exists
        if ($transaction->proof_image) {
            Storage::disk('public')->delete($transaction->proof_image);
        }

        $transaction->delete();

        return redirect()
            ->route('admin.transactions.index')
            ->with('success', 'Transaksi berhasil dihapus!');
    }
}
