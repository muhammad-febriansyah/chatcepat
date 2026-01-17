@extends('emails.layouts.base')

@section('title', 'Pembayaran Berhasil - ' . $transaction->invoice_number)

@section('content')
    <h1>Pembayaran Berhasil!</h1>

    <p>Halo {{ $transaction->user->name }},</p>

    <p>Terima kasih! Pembayaran Anda telah berhasil diproses. Berikut adalah detail transaksi Anda:</p>

    <div class="info-box success">
        <div class="info-box-title">Status Pembayaran</div>
        <span class="status-badge success">LUNAS</span>
    </div>

    <h2>Detail Transaksi</h2>

    <table class="detail-table">
        <tr>
            <td>Nomor Invoice</td>
            <td>{{ $transaction->invoice_number }}</td>
        </tr>
        <tr>
            <td>Tanggal Pembayaran</td>
            <td>{{ $transaction->paid_at->format('d F Y, H:i') }} WIB</td>
        </tr>
        <tr>
            <td>Metode Pembayaran</td>
            <td>{{ $transaction->payment_method === 'manual_transfer' ? 'Transfer Manual' : ucfirst($transaction->payment_method) }}</td>
        </tr>
        @if($transaction->reference)
        <tr>
            <td>Referensi</td>
            <td>{{ $transaction->reference }}</td>
        </tr>
        @endif
    </table>

    <h2>Detail Paket</h2>

    <table class="detail-table">
        <tr>
            <td>Nama Paket</td>
            <td>{{ $transaction->pricingPackage->name }}</td>
        </tr>
        <tr>
            <td>Durasi</td>
            <td>{{ $transaction->pricingPackage->period }} {{ $transaction->pricingPackage->period_unit === 'day' ? 'Hari' : ($transaction->pricingPackage->period_unit === 'month' ? 'Bulan' : 'Tahun') }}</td>
        </tr>
        <tr>
            <td>Berlaku Hingga</td>
            <td>{{ $transaction->subscription_expires_at->format('d F Y, H:i') }} WIB</td>
        </tr>
        <tr class="total-row">
            <td>Total Pembayaran</td>
            <td>Rp {{ number_format($transaction->amount, 0, ',', '.') }}</td>
        </tr>
    </table>

    <div style="text-align: center;">
        <a href="{{ $appUrl }}/user/transactions/{{ $transaction->id }}" class="btn">Lihat Detail Transaksi</a>
    </div>

    <p style="margin-top: 30px;">Paket Anda sudah aktif dan dapat langsung digunakan. Jika Anda memiliki pertanyaan, jangan ragu untuk menghubungi tim support kami.</p>

    <p>Salam hangat,<br><strong>Tim {{ $appName }}</strong></p>
@endsection
