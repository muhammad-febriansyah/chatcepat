# Integrasi Payment Gateway Duitku

Dokumentasi lengkap untuk integrasi payment gateway Duitku dengan redirect URL.

## Konfigurasi

### 1. Environment Variables (.env)

```env
DUITKU_MERCHANT_CODE=DS24599
DUITKU_API_KEY=55400c20e955301e9eab5bc01413ef2a
DUITKU_CALLBACK_URL="${APP_URL}/payment/callback"
DUITKU_RETURN_URL="${APP_URL}/payment/return"
DUITKU_SANDBOX=true
```

**Catatan:**
- `DUITKU_SANDBOX=true` untuk testing/sandbox mode
- `DUITKU_SANDBOX=false` untuk production mode

### 2. Database Migration

Migration untuk tabel `transactions` sudah dibuat dan dijalankan. Tabel ini menyimpan:
- Data transaksi
- Informasi customer
- Response dari Duitku
- Status pembayaran
- Dan lain-lain

## Struktur File

### 1. Model
- `app/Models/Transaction.php` - Model untuk transaksi

### 2. Service
- `app/Services/DuitkuService.php` - Service untuk integrasi dengan Duitku API

### 3. Controller
- `app/Http/Controllers/PaymentController.php` - Controller untuk handle payment

### 4. Routes
Routes sudah ditambahkan di `routes/web.php`:

**Routes dengan Auth:**
- `GET /payment` - Halaman pembayaran
- `POST /payment/create` - Membuat transaksi pembayaran
- `GET /payment/transactions` - Riwayat transaksi
- `GET /payment/transactions/{id}` - Detail transaksi
- `GET /payment/check-status/{id}` - Cek status pembayaran

**Routes tanpa Auth (untuk callback):**
- `POST /payment/callback` - Callback dari Duitku
- `GET /payment/return` - Return URL setelah pembayaran

## Cara Penggunaan

### 1. Membuat Halaman Payment (Frontend)

Buat file Inertia/React component di `resources/js/Pages/payment/index.tsx`:

```tsx
import React, { useState } from 'react';
import { useForm } from '@inertiajs/react';

export default function PaymentIndex({ package, paymentMethods }) {
    const { data, setData, post, processing } = useForm({
        package_id: package?.id,
        payment_method: '',
        customer_name: '',
        email: '',
        phone: '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();

        post(route('payment.create'), {
            onSuccess: (response) => {
                // Redirect ke payment URL dari Duitku
                if (response.props?.data?.payment_url) {
                    window.location.href = response.props.data.payment_url;
                }
            },
        });
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-2xl font-bold mb-6">Pembayaran</h1>

            <form onSubmit={handleSubmit}>
                {/* Package Info */}
                {package && (
                    <div className="mb-6">
                        <h2 className="text-xl font-semibold">{package.name}</h2>
                        <p className="text-gray-600">{package.description}</p>
                        <p className="text-2xl font-bold mt-2">
                            Rp {Number(package.price).toLocaleString('id-ID')}
                        </p>
                    </div>
                )}

                {/* Customer Info */}
                <div className="mb-4">
                    <label className="block mb-2">Nama Lengkap</label>
                    <input
                        type="text"
                        value={data.customer_name}
                        onChange={(e) => setData('customer_name', e.target.value)}
                        className="w-full border rounded px-4 py-2"
                        required
                    />
                </div>

                <div className="mb-4">
                    <label className="block mb-2">Email</label>
                    <input
                        type="email"
                        value={data.email}
                        onChange={(e) => setData('email', e.target.value)}
                        className="w-full border rounded px-4 py-2"
                        required
                    />
                </div>

                <div className="mb-4">
                    <label className="block mb-2">No. Telepon (Opsional)</label>
                    <input
                        type="tel"
                        value={data.phone}
                        onChange={(e) => setData('phone', e.target.value)}
                        className="w-full border rounded px-4 py-2"
                    />
                </div>

                {/* Payment Method */}
                <div className="mb-6">
                    <label className="block mb-2">Metode Pembayaran</label>
                    <select
                        value={data.payment_method}
                        onChange={(e) => setData('payment_method', e.target.value)}
                        className="w-full border rounded px-4 py-2"
                        required
                    >
                        <option value="">Pilih Metode Pembayaran</option>
                        {paymentMethods.map((method) => (
                            <option key={method.paymentMethod} value={method.paymentMethod}>
                                {method.paymentName} - Biaya: Rp {method.totalFee.toLocaleString('id-ID')}
                            </option>
                        ))}
                    </select>
                </div>

                <button
                    type="submit"
                    disabled={processing}
                    className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50"
                >
                    {processing ? 'Memproses...' : 'Bayar Sekarang'}
                </button>
            </form>
        </div>
    );
}
```

### 2. Membuat Halaman Return (Frontend)

Buat file `resources/js/Pages/payment/return.tsx`:

```tsx
import React from 'react';
import { Link } from '@inertiajs/react';

export default function PaymentReturn({ transaction, status, message }) {
    return (
        <div className="container mx-auto px-4 py-8">
            <div className="max-w-md mx-auto">
                <div className={`p-6 rounded-lg ${
                    status === 'success' ? 'bg-green-100' :
                    status === 'pending' ? 'bg-yellow-100' :
                    'bg-red-100'
                }`}>
                    <h1 className="text-2xl font-bold mb-4">
                        {status === 'success' ? '✓ Pembayaran Berhasil' :
                         status === 'pending' ? '⏳ Pembayaran Pending' :
                         '✗ Pembayaran Gagal'}
                    </h1>

                    <p className="mb-4">{message}</p>

                    <div className="border-t pt-4 mt-4">
                        <p className="text-sm text-gray-600">Invoice: {transaction.invoice_number}</p>
                        <p className="text-sm text-gray-600">
                            Total: Rp {Number(transaction.amount).toLocaleString('id-ID')}
                        </p>
                        <p className="text-sm text-gray-600">Status: {transaction.status}</p>
                    </div>

                    <div className="mt-6">
                        <Link
                            href={route('payment.transactions')}
                            className="block w-full text-center bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
                        >
                            Lihat Riwayat Transaksi
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
```

### 3. Link dari Pricing Page

Di halaman pricing, tambahkan link untuk membayar:

```tsx
// Contoh button di pricing page
<Link
    href={route('payment.index', { package_id: package.id })}
    className="bg-blue-600 text-white px-6 py-2 rounded"
>
    Pilih Paket
</Link>
```

## Flow Pembayaran

1. **User memilih paket** di halaman pricing
2. **Redirect ke halaman payment** (`/payment?package_id=xxx`)
3. **User mengisi data** (nama, email, telepon) dan memilih metode pembayaran
4. **Submit form** akan membuat transaksi dan mendapat payment URL dari Duitku
5. **Redirect ke Duitku** untuk melakukan pembayaran
6. **Setelah bayar**, user akan di-redirect kembali ke aplikasi (`/payment/return`)
7. **Duitku mengirim callback** ke `/payment/callback` untuk update status transaksi
8. **User melihat hasil** pembayaran di halaman return

## Testing di Sandbox Mode

Untuk testing, gunakan payment method yang tersedia di Duitku Sandbox:

### Virtual Account Testing:
- **BCA VA**: Gunakan nominal ending 000 untuk sukses (contoh: 10000, 50000)
- **Mandiri VA**: Gunakan nominal ending 000 untuk sukses
- **BNI VA**: Gunakan nominal ending 000 untuk sukses

### E-Wallet Testing:
- **OVO**: Gunakan nomor testing dari Duitku
- **DANA**: Gunakan nomor testing dari Duitku
- **ShopeePay**: Gunakan nomor testing dari Duitku

Lihat dokumentasi lengkap Duitku untuk testing: https://docs.duitku.com/

## Callback URL Configuration

**PENTING:** Pastikan callback URL sudah di-set di dashboard Duitku:

1. Login ke dashboard Duitku: https://passport.duitku.com/ (production) atau https://sandbox.duitku.com/ (sandbox)
2. Masuk ke menu **Settings** > **Callback URL**
3. Set callback URL: `https://yourdomain.com/payment/callback`
4. Set return URL: `https://yourdomain.com/payment/return`

## Monitoring & Logging

Semua aktivitas payment gateway akan dicatat di Laravel log (`storage/logs/laravel.log`):

- Request ke Duitku API
- Response dari Duitku API
- Callback dari Duitku
- Error yang terjadi

## Status Transaksi

Status yang tersedia:
- `pending` - Menunggu pembayaran
- `paid` - Pembayaran berhasil
- `failed` - Pembayaran gagal
- `expired` - Transaksi kadaluarsa
- `cancelled` - Transaksi dibatalkan

## Security

1. **Signature Verification**: Semua callback dari Duitku akan diverifikasi signaturenya
2. **CSRF Protection**: Routes payment menggunakan CSRF protection Laravel
3. **Authorization**: User hanya bisa melihat transaksi miliknya sendiri

## API Methods yang Tersedia

### DuitkuService Methods:

```php
// Membuat transaksi
$duitkuService->createTransaction($data);

// Mendapatkan metode pembayaran
$duitkuService->getPaymentMethods($amount);

// Cek status transaksi
$duitkuService->checkTransactionStatus($merchantOrderId);

// Verifikasi callback
$duitkuService->verifyCallback($callbackData);

// Handle callback
$duitkuService->handleCallback($callbackData);
```

### Transaction Model Methods:

```php
// Mark as paid
$transaction->markAsPaid();

// Mark as failed
$transaction->markAsFailed();

// Mark as expired
$transaction->markAsExpired();

// Check status
$transaction->isPending();
$transaction->isPaid();

// Generate unique numbers
Transaction::generateInvoiceNumber();
Transaction::generateMerchantOrderId();
```

## Troubleshooting

### 1. Callback tidak masuk
- Pastikan callback URL sudah benar di dashboard Duitku
- Cek firewall/security yang mungkin block request dari Duitku
- Lihat log di `storage/logs/laravel.log`

### 2. Signature invalid
- Pastikan API key dan merchant code sudah benar
- Jangan ada whitespace di API key

### 3. Payment URL tidak muncul
- Cek log untuk melihat response dari Duitku
- Pastikan semua parameter required sudah terisi

## Referensi

- Dokumentasi Duitku API: https://docs.duitku.com/
- Dashboard Sandbox: https://sandbox.duitku.com/
- Dashboard Production: https://passport.duitku.com/
