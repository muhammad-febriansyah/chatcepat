<?php

namespace App\Services;

use App\Models\Transaction;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class DuitkuService
{
    protected $merchantCode;
    protected $apiKey;
    protected $baseUrl;
    protected $sandbox;

    public function __construct()
    {
        $this->merchantCode = config('services.duitku.merchant_code');
        $this->apiKey = config('services.duitku.api_key');
        $this->sandbox = config('services.duitku.sandbox', true);

        // Sandbox URL atau Production URL
        $this->baseUrl = $this->sandbox
            ? 'https://sandbox.duitku.com/webapi/api/merchant'
            : 'https://passport.duitku.com/webapi/api/merchant';
    }

    /**
     * Create payment transaction
     *
     * @param array $data
     * @return array
     */
    public function createTransaction(array $data): array
    {
        try {
            $merchantOrderId = $data['merchantOrderId'];
            $paymentAmount = $data['paymentAmount'];
            $paymentMethod = $data['paymentMethod'];
            $productDetails = $data['productDetails'];
            $email = $data['email'];
            $customerName = $data['customerName'];
            $phoneNumber = $data['phoneNumber'] ?? '';
            $itemDetails = $data['itemDetails'] ?? [];
            $customerVaName = $data['customerVaName'] ?? $customerName;
            $callbackUrl = $data['callbackUrl'] ?? config('services.duitku.callback_url');
            $returnUrl = $data['returnUrl'] ?? config('services.duitku.return_url');
            $expiryPeriod = $data['expiryPeriod'] ?? 1440; // Default 24 jam (dalam menit)

            // Generate signature
            $signature = $this->generateSignature($merchantOrderId, $paymentAmount);

            $params = [
                'merchantCode' => $this->merchantCode,
                'paymentAmount' => $paymentAmount,
                'paymentMethod' => $paymentMethod,
                'merchantOrderId' => $merchantOrderId,
                'productDetails' => $productDetails,
                'email' => $email,
                'customerVaName' => $customerVaName,
                'phoneNumber' => $phoneNumber,
                'itemDetails' => $itemDetails,
                'callbackUrl' => $callbackUrl,
                'returnUrl' => $returnUrl,
                'signature' => $signature,
                'expiryPeriod' => $expiryPeriod,
            ];

            Log::info('Duitku Create Transaction Request', $params);

            // Call Duitku API
            $response = Http::withHeaders([
                'Content-Type' => 'application/json',
            ])->post($this->baseUrl . '/v2/inquiry', $params);

            $result = $response->json();

            Log::info('Duitku Create Transaction Response', [
                'status' => $response->status(),
                'result' => $result,
            ]);

            if ($response->successful() && isset($result['statusCode']) && $result['statusCode'] === '00') {
                return [
                    'success' => true,
                    'data' => $result,
                ];
            }

            return [
                'success' => false,
                'message' => $result['statusMessage'] ?? 'Failed to create transaction',
                'data' => $result,
            ];
        } catch (\Exception $e) {
            Log::error('Duitku Create Transaction Error', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return [
                'success' => false,
                'message' => $e->getMessage(),
            ];
        }
    }

    /**
     * Get payment methods
     *
     * @param int $amount
     * @return array
     */
    public function getPaymentMethods(int $amount): array
    {
        try {
            $datetime = date('Y-m-d H:i:s');
            $signature = hash('sha256', $this->merchantCode . $amount . $datetime . $this->apiKey);

            $params = [
                'merchantcode' => $this->merchantCode,
                'amount' => $amount,
                'datetime' => $datetime,
                'signature' => $signature,
            ];

            $response = Http::get($this->baseUrl . '/paymentmethod/getpaymentmethod', $params);

            if ($response->successful()) {
                return [
                    'success' => true,
                    'data' => $response->json(),
                ];
            }

            return [
                'success' => false,
                'message' => 'Failed to get payment methods',
            ];
        } catch (\Exception $e) {
            Log::error('Duitku Get Payment Methods Error', [
                'message' => $e->getMessage(),
            ]);

            return [
                'success' => false,
                'message' => $e->getMessage(),
            ];
        }
    }

    /**
     * Check transaction status
     *
     * @param string $merchantOrderId
     * @return array
     */
    public function checkTransactionStatus(string $merchantOrderId): array
    {
        try {
            $signature = hash('sha256', $this->merchantCode . $merchantOrderId . $this->apiKey);

            $params = [
                'merchantCode' => $this->merchantCode,
                'merchantOrderId' => $merchantOrderId,
                'signature' => $signature,
            ];

            $response = Http::post($this->baseUrl . '/transactionStatus', $params);

            if ($response->successful()) {
                return [
                    'success' => true,
                    'data' => $response->json(),
                ];
            }

            return [
                'success' => false,
                'message' => 'Failed to check transaction status',
            ];
        } catch (\Exception $e) {
            Log::error('Duitku Check Transaction Status Error', [
                'message' => $e->getMessage(),
            ]);

            return [
                'success' => false,
                'message' => $e->getMessage(),
            ];
        }
    }

    /**
     * Verify callback signature
     *
     * @param array $data
     * @return bool
     */
    public function verifyCallback(array $data): bool
    {
        $merchantOrderId = $data['merchantOrderId'] ?? '';
        $resultCode = $data['resultCode'] ?? '';
        $amount = $data['amount'] ?? '';

        $calculatedSignature = hash('sha256', $this->merchantCode . $amount . $merchantOrderId . $this->apiKey);
        $receivedSignature = $data['signature'] ?? '';

        return hash_equals($calculatedSignature, $receivedSignature);
    }

    /**
     * Handle callback from Duitku
     *
     * @param array $callbackData
     * @return array
     */
    public function handleCallback(array $callbackData): array
    {
        try {
            // Verify signature
            if (!$this->verifyCallback($callbackData)) {
                Log::warning('Duitku Callback Signature Invalid', $callbackData);
                return [
                    'success' => false,
                    'message' => 'Invalid signature',
                ];
            }

            $merchantOrderId = $callbackData['merchantOrderId'];
            $resultCode = $callbackData['resultCode'];
            $reference = $callbackData['reference'] ?? null;

            // Find transaction
            $transaction = Transaction::where('merchant_order_id', $merchantOrderId)->first();

            if (!$transaction) {
                Log::warning('Duitku Callback Transaction Not Found', [
                    'merchantOrderId' => $merchantOrderId,
                ]);

                return [
                    'success' => false,
                    'message' => 'Transaction not found',
                ];
            }

            // Update transaction based on result code
            $transaction->callback_response = $callbackData;
            $transaction->reference = $reference;

            // Result code 00 = Success
            if ($resultCode === '00') {
                $transaction->markAsPaid();

                Log::info('Duitku Payment Success', [
                    'transaction_id' => $transaction->id,
                    'merchantOrderId' => $merchantOrderId,
                ]);
            } else {
                // Other result codes = Failed
                $transaction->markAsFailed();

                Log::warning('Duitku Payment Failed', [
                    'transaction_id' => $transaction->id,
                    'merchantOrderId' => $merchantOrderId,
                    'resultCode' => $resultCode,
                ]);
            }

            $transaction->save();

            return [
                'success' => true,
                'transaction' => $transaction,
            ];
        } catch (\Exception $e) {
            Log::error('Duitku Handle Callback Error', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return [
                'success' => false,
                'message' => $e->getMessage(),
            ];
        }
    }

    /**
     * Generate signature for transaction
     *
     * @param string $merchantOrderId
     * @param int $amount
     * @return string
     */
    protected function generateSignature(string $merchantOrderId, int $amount): string
    {
        return hash('sha256', $this->merchantCode . $merchantOrderId . $amount . $this->apiKey);
    }
}
