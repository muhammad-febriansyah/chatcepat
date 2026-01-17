<?php

namespace App\Http\Controllers;

use App\Models\Transaction;
use App\Models\PricingPackage;
use App\Models\Bank;
use App\Services\DuitkuService;
use App\Mail\PaymentSuccessNotification;
use App\Mail\PaymentPendingNotification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class PaymentController extends Controller
{
    protected $duitkuService;

    public function __construct(DuitkuService $duitkuService)
    {
        $this->duitkuService = $duitkuService;
    }

    /**
     * Display payment page
     */
    public function index(Request $request)
    {
        $packageId = $request->get('package_id');
        $package = null;

        if ($packageId) {
            $package = PricingPackage::findOrFail($packageId);
        }

        // Get active banks for manual payment
        $banks = Bank::active()->get();

        $user = Auth::user();

        return Inertia::render('payment/index', [
            'package' => $package,
            'banks' => $banks,
            'user' => $user ? [
                'name' => $user->name,
                'email' => $user->email,
                'phone' => $user->phone ?? '',
            ] : null,
        ]);
    }

    /**
     * Create payment transaction
     */
    public function createPayment(Request $request)
    {
        $request->validate([
            'package_id' => 'required|exists:pricing_packages,id',
            'customer_name' => 'required|string|max:255',
            'email' => 'required|email',
            'phone' => 'nullable|string|max:20',
        ]);

        try {
            DB::beginTransaction();

            $user = Auth::user();
            $package = PricingPackage::findOrFail($request->package_id);

            // Generate unique identifiers
            $invoiceNumber = Transaction::generateInvoiceNumber();
            $merchantOrderId = Transaction::generateMerchantOrderId();

            // Create transaction record
            $transaction = Transaction::create([
                'user_id' => $user->id,
                'pricing_package_id' => $package->id,
                'invoice_number' => $invoiceNumber,
                'merchant_order_id' => $merchantOrderId,
                'amount' => $package->price,
                'payment_method' => 'duitku', // Will be updated after user selects payment method
                'status' => 'pending',
                'customer_info' => [
                    'name' => $request->customer_name,
                    'email' => $request->email,
                    'phone' => $request->phone,
                ],
                'expired_at' => now()->addDay(), // 24 hours expiry
            ]);

            // Prepare data for Duitku - using createInvoice (no payment method required)
            $duitkuData = [
                'merchantOrderId' => $merchantOrderId,
                'paymentAmount' => (int) $package->price,
                'productDetails' => $package->name . ' - ' . $package->description,
                'email' => $request->email,
                'customerName' => $request->customer_name,
                'phoneNumber' => $request->phone ?? '',
                'itemDetails' => [
                    [
                        'name' => $package->name,
                        'price' => (int) $package->price,
                        'quantity' => 1,
                    ],
                ],
                'customerVaName' => $request->customer_name,
                'callbackUrl' => config('services.duitku.callback_url'),
                'returnUrl' => config('services.duitku.return_url') . '?order_id=' . $merchantOrderId,
                'expiryPeriod' => 1440, // 24 hours in minutes
            ];

            // Create invoice via Duitku (user will select payment method on Duitku page)
            $result = $this->duitkuService->createInvoice($duitkuData);

            if (!$result['success']) {
                DB::rollBack();

                return response()->json([
                    'success' => false,
                    'message' => $result['message'] ?? 'Failed to create payment',
                ], 400);
            }

            $duitkuResponse = $result['data'];

            // Update transaction with Duitku response
            $transaction->update([
                'reference' => $duitkuResponse['reference'] ?? null,
                'payment_url' => $duitkuResponse['paymentUrl'] ?? null,
                'va_number' => $duitkuResponse['vaNumber'] ?? null,
                'qr_string' => $duitkuResponse['qrString'] ?? null,
            ]);

            DB::commit();

            // Send payment pending email notification
            try {
                $customerEmail = $request->email;
                Mail::to($customerEmail)->send(new PaymentPendingNotification($transaction));
                Log::info('Payment pending email sent', ['transaction_id' => $transaction->id, 'email' => $customerEmail]);
            } catch (\Exception $e) {
                Log::error('Failed to send payment pending email', [
                    'transaction_id' => $transaction->id,
                    'error' => $e->getMessage(),
                ]);
                // Don't fail the transaction if email fails
            }

            // Redirect to Duitku payment page
            return response()->json([
                'success' => true,
                'message' => 'Payment created successfully',
                'data' => [
                    'transaction_id' => $transaction->id,
                    'payment_url' => $duitkuResponse['paymentUrl'] ?? null,
                    'reference' => $duitkuResponse['reference'] ?? null,
                ],
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Create Payment Error', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to create payment: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Create manual payment transaction (bank transfer)
     */
    public function createManualPayment(Request $request)
    {
        $request->validate([
            'package_id' => 'required|exists:pricing_packages,id',
            'bank_id' => 'required|exists:banks,id',
            'customer_name' => 'required|string|max:255',
            'email' => 'required|email',
            'phone' => 'nullable|string|max:20',
            'proof_image' => 'required|image|mimes:jpeg,png,jpg,pdf|max:5120', // 5MB max
        ]);

        try {
            DB::beginTransaction();

            $user = Auth::user();
            $package = PricingPackage::findOrFail($request->package_id);
            $bank = Bank::findOrFail($request->bank_id);

            // Upload proof image
            $proofPath = $request->file('proof_image')->store('payment-proofs', 'public');

            // Generate unique identifiers
            $invoiceNumber = Transaction::generateInvoiceNumber();
            $merchantOrderId = Transaction::generateMerchantOrderId();

            // Create transaction record
            $transaction = Transaction::create([
                'user_id' => $user->id,
                'pricing_package_id' => $package->id,
                'bank_id' => $bank->id,
                'invoice_number' => $invoiceNumber,
                'merchant_order_id' => $merchantOrderId,
                'amount' => $package->price,
                'payment_method' => 'manual_transfer',
                'proof_image' => $proofPath,
                'status' => 'pending', // Admin will verify
                'customer_info' => [
                    'name' => $request->customer_name,
                    'email' => $request->email,
                    'phone' => $request->phone,
                    'bank' => $bank->nama_bank,
                    'account_number' => $bank->norek,
                    'account_holder' => $bank->atasnama,
                ],
                'expired_at' => now()->addDays(3), // 3 days for admin verification
            ]);

            DB::commit();

            // Send payment pending email notification
            try {
                $customerEmail = $request->email;
                Mail::to($customerEmail)->send(new PaymentPendingNotification($transaction));
                Log::info('Manual payment pending email sent', ['transaction_id' => $transaction->id, 'email' => $customerEmail]);
            } catch (\Exception $e) {
                Log::error('Failed to send manual payment pending email', [
                    'transaction_id' => $transaction->id,
                    'error' => $e->getMessage(),
                ]);
                // Don't fail the transaction if email fails
            }

            return response()->json([
                'success' => true,
                'message' => 'Pembayaran manual berhasil dibuat. Menunggu verifikasi admin.',
                'data' => [
                    'transaction_id' => $transaction->id,
                    'invoice_number' => $invoiceNumber,
                ],
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Create Manual Payment Error', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Gagal membuat pembayaran manual: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Handle callback from Duitku
     */
    public function callback(Request $request)
    {
        try {
            Log::info('Duitku Callback Received', $request->all());

            $callbackData = $request->all();

            // Handle callback using service
            $result = $this->duitkuService->handleCallback($callbackData);

            if ($result['success']) {
                // Send payment success email if transaction exists and is paid
                if (isset($result['transaction']) && $result['transaction']->status === 'paid') {
                    try {
                        $transaction = $result['transaction'];
                        $customerEmail = $transaction->customer_info['email'] ?? $transaction->user->email;
                        Mail::to($customerEmail)->send(new PaymentSuccessNotification($transaction));
                        Log::info('Payment success email sent', ['transaction_id' => $transaction->id, 'email' => $customerEmail]);
                    } catch (\Exception $e) {
                        Log::error('Failed to send payment success email', [
                            'transaction_id' => $result['transaction']->id ?? 'unknown',
                            'error' => $e->getMessage(),
                        ]);
                    }
                }

                // Return success response to Duitku
                return response()->json([
                    'success' => true,
                    'message' => 'Callback processed successfully',
                ]);
            }

            return response()->json([
                'success' => false,
                'message' => $result['message'] ?? 'Failed to process callback',
            ], 400);
        } catch (\Exception $e) {
            Log::error('Duitku Callback Error', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Internal server error',
            ], 500);
        }
    }

    /**
     * Handle return from Duitku payment page
     */
    public function return(Request $request)
    {
        $orderId = $request->get('order_id');

        if (!$orderId) {
            return redirect()->route('user.dashboard')->with('error', 'Invalid payment return');
        }

        $transaction = Transaction::where('merchant_order_id', $orderId)->first();

        if (!$transaction) {
            return redirect()->route('user.dashboard')->with('error', 'Transaction not found');
        }

        // Check transaction status from Duitku
        $statusResult = $this->duitkuService->checkTransactionStatus($orderId);

        if ($statusResult['success']) {
            $statusData = $statusResult['data'];

            // Update transaction status based on Duitku response
            if (isset($statusData['statusCode']) && $statusData['statusCode'] === '00') {
                $transaction->markAsPaid();
                $message = 'Payment successful! Thank you for your purchase.';
                $status = 'success';
            } elseif (isset($statusData['statusCode']) && $statusData['statusCode'] === '01') {
                // Still pending
                $message = 'Payment is still being processed. Please wait for confirmation.';
                $status = 'pending';
            } else {
                $transaction->markAsFailed();
                $message = 'Payment failed. Please try again.';
                $status = 'failed';
            }
        } else {
            $message = 'Unable to verify payment status.';
            $status = 'unknown';
        }

        return Inertia::render('payment/return', [
            'transaction' => $transaction->load('pricingPackage'),
            'status' => $status,
            'message' => $message,
        ]);
    }

    /**
     * Display transaction history
     */
    public function transactions()
    {
        $user = Auth::user();

        $transactions = Transaction::where('user_id', $user->id)
            ->with('pricingPackage')
            ->latest()
            ->paginate(10);

        return Inertia::render('payment/transactions', [
            'transactions' => $transactions,
        ]);
    }

    /**
     * Show transaction detail
     */
    public function show($id)
    {
        $user = Auth::user();

        $transaction = Transaction::where('user_id', $user->id)
            ->where('id', $id)
            ->with('pricingPackage')
            ->firstOrFail();

        return Inertia::render('payment/detail', [
            'transaction' => $transaction,
        ]);
    }

    /**
     * Check payment status
     */
    public function checkStatus($id)
    {
        $user = Auth::user();

        $transaction = Transaction::where('user_id', $user->id)
            ->where('id', $id)
            ->firstOrFail();

        $statusResult = $this->duitkuService->checkTransactionStatus($transaction->merchant_order_id);

        if ($statusResult['success']) {
            $statusData = $statusResult['data'];

            // Update transaction status
            if (isset($statusData['statusCode']) && $statusData['statusCode'] === '00') {
                $transaction->markAsPaid();
            } elseif (isset($statusData['statusCode']) && $statusData['statusCode'] === '02') {
                $transaction->markAsFailed();
            }

            return response()->json([
                'success' => true,
                'transaction' => $transaction->fresh(),
                'duitku_status' => $statusData,
            ]);
        }

        return response()->json([
            'success' => false,
            'message' => 'Failed to check payment status',
        ], 400);
    }
}
