@extends('emails.layout')

@section('content')
    <div class="greeting">
        Halo {{ $user->name }}
    </div>

    <div class="content">
        <p>Terima kasih telah mendaftar di <strong>{{ $settings->site_name ?? 'ChatCepat' }}</strong>. Akun Anda telah
            berhasil dibuat.</p>

        @if($transaction && $transaction->status === 'paid' && $transaction->payment_method === 'free_trial')
            {{-- Trial package activated --}}
            <div class="info-box" style="background-color: #d1fae5; border-left: 4px solid #10b981;">
                <p><strong>🎉 Paket Trial Anda Telah Aktif!</strong></p>
                <p>Paket: <strong>{{ $transaction->pricingPackage->name ?? 'Trial' }}</strong></p>
                <p>Masa aktif hingga: <strong>{{ $transaction->subscription_expires_at ? $transaction->subscription_expires_at->format('d M Y') : '-' }}</strong></p>
            </div>

            <p>Anda sekarang dapat menggunakan semua fitur yang tersedia di paket trial. Mari mulai eksplorasi!</p>

            <div class="button-container">
                <a href="{{ url('/user/dashboard') }}" class="button">Mulai Sekarang</a>
            </div>

        @elseif($transaction)
            {{-- Pending payment --}}
            <div class="info-box">
                <p><strong>Informasi Pembayaran:</strong></p>
                <p>Paket: <strong>{{ $transaction->pricingPackage->name ?? 'Paket' }}</strong></p>
                <p>Harga: <strong>Rp {{ number_format($transaction->amount, 0, ',', '.') }}</strong></p>
                <p>Order ID: <strong>{{ $transaction->merchant_order_id }}</strong></p>
            </div>

            <p><strong>Instruksi Pembayaran:</strong></p>
            <ol style="margin-left: 20px; margin-bottom: 20px;">
                <li>Klik tombol di bawah untuk melihat detail transaksi</li>
                <li>Pilih metode pembayaran yang Anda inginkan</li>
                <li>Selesaikan pembayaran sesuai instruksi</li>
                <li>Akun Anda akan aktif otomatis setelah pembayaran dikonfirmasi</li>
            </ol>

            <div class="button-container">
                <a href="{{ url('/user/transactions/' . $transaction->id) }}" class="button">Lihat Detail Pembayaran</a>
            </div>

            <p style="text-align: center; color: #e53e3e; font-size: 14px;">
                Link pembayaran akan kadaluarsa dalam 24 jam
            </p>
        @else
            {{-- No transaction (fallback) --}}
            <p>Anda dapat mulai menggunakan {{ $settings->site_name ?? 'ChatCepat' }} sekarang.</p>

            <div class="button-container">
                <a href="{{ url('/user/dashboard') }}" class="button">Mulai Sekarang</a>
            </div>
        @endif

        <p>Jika Anda memiliki pertanyaan, jangan ragu untuk menghubungi tim support kami.</p>
    </div>
@endsection