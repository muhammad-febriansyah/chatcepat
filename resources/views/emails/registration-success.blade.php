@extends('emails.layout')

@section('content')
    <div class="greeting">
        Halo {{ $user->name }}
    </div>

    <div class="content">
        <p>Terima kasih telah mendaftar di <strong>{{ $settings->app_name ?? 'ChatCepat' }}</strong>. Akun Anda telah
            berhasil dibuat.</p>

        @if($transaction)
            <div class="info-box">
                <p><strong>Informasi Pembayaran:</strong></p>
                <p>Paket: <strong>{{ $transaction->package->name }}</strong></p>
                <p>Harga: <strong>Rp {{ number_format($transaction->amount, 0, ',', '.') }}</strong></p>
                <p>Order ID: <strong>{{ $transaction->merchant_order_id }}</strong></p>
            </div>

            <p><strong>Instruksi Pembayaran:</strong></p>
            <ol style="margin-left: 20px; margin-bottom: 20px;">
                <li>Klik tombol di bawah untuk melanjutkan pembayaran</li>
                <li>Pilih metode pembayaran yang Anda inginkan</li>
                <li>Selesaikan pembayaran sesuai instruksi</li>
                <li>Akun Anda akan aktif otomatis setelah pembayaran dikonfirmasi</li>
            </ol>

            <div class="button-container">
                <a href="{{ $transaction->payment_url }}" class="button">Bayar Sekarang</a>
            </div>

            <p style="text-align: center; color: #e53e3e; font-size: 14px;">
                Link pembayaran akan kadaluarsa dalam 24 jam
            </p>
        @else
            <p>Anda dapat mulai menggunakan {{ $settings->app_name ?? 'ChatCepat' }} dengan fitur trial gratis.</p>

            <div class="button-container">
                <a href="{{ url('/user/dashboard') }}" class="button">Mulai Sekarang</a>
            </div>
        @endif

        <p>Jika Anda memiliki pertanyaan, jangan ragu untuk menghubungi tim support kami.</p>
    </div>
@endsection