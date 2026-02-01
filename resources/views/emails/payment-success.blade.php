@extends('emails.layout')

@section('content')
    <div class="greeting">
        Halo {{ $user->name }}
    </div>

    <div class="content">
        <p>Pembayaran Anda telah berhasil dikonfirmasi.</p>

        <div class="info-box">
            <p><strong>Detail Transaksi:</strong></p>
            <p>Order ID: <strong>{{ $transaction->merchant_order_id }}</strong></p>
            <p>Paket: <strong>{{ $transaction->package->name }}</strong></p>
            <p>Jumlah: <strong>Rp {{ number_format($transaction->amount, 0, ',', '.') }}</strong></p>
            <p>Tanggal: <strong>{{ $transaction->paid_at?->format('d F Y H:i') }}</strong></p>
            <p>Metode Pembayaran: <strong>{{ $transaction->payment_method ?? 'Duitku' }}</strong></p>
        </div>

        <div class="info-box" style="border-left-color: #48bb78;">
            <p><strong>Status Langganan:</strong></p>
            <p>Paket Anda: <strong>{{ $transaction->package->name }}</strong></p>
            <p>Berlaku hingga:
                <strong>{{ $transaction->subscription?->expires_at?->format('d F Y') ?? 'Lifetime' }}</strong></p>
        </div>

        <p>Akun Anda sekarang sudah aktif dan siap digunakan.</p>

        <div class="button-container">
            <a href="{{ url('/user/dashboard') }}" class="button">Masuk ke Dashboard</a>
        </div>

        <p>Terima kasih telah mempercayai {{ $settings->app_name ?? 'ChatCepat' }} untuk kebutuhan bisnis Anda.</p>
    </div>
@endsection