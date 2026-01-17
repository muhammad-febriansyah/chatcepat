@extends('emails.layouts.base')

@section('title', 'Menunggu Pembayaran - ' . $transaction->invoice_number)

@section('content')
    <h1>Menunggu Pembayaran</h1>

    <p>Halo {{ $transaction->user->name }},</p>

    <p>Terima kasih telah melakukan pemesanan. Berikut adalah detail transaksi yang perlu Anda selesaikan:</p>

    <div class="info-box warning">
        <div class="info-box-title">Status Pembayaran</div>
        <span class="status-badge pending">MENUNGGU PEMBAYARAN</span>
    </div>

    <h2>Detail Transaksi</h2>

    <table class="detail-table">
        <tr>
            <td>Nomor Invoice</td>
            <td>{{ $transaction->invoice_number }}</td>
        </tr>
        <tr>
            <td>Tanggal Pemesanan</td>
            <td>{{ $transaction->created_at->format('d F Y, H:i') }} WIB</td>
        </tr>
        <tr>
            <td>Batas Pembayaran</td>
            <td style="color: #dc2626;">{{ $transaction->expired_at->format('d F Y, H:i') }} WIB</td>
        </tr>
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
        <tr class="total-row">
            <td>Total Pembayaran</td>
            <td>Rp {{ number_format($transaction->amount, 0, ',', '.') }}</td>
        </tr>
    </table>

    @if($transaction->payment_method === 'manual_transfer' && $transaction->bank)
    <h2>Informasi Rekening Tujuan</h2>

    <div class="info-box">
        <table class="detail-table" style="margin: 0;">
            <tr>
                <td>Bank</td>
                <td>{{ $transaction->bank->nama_bank }}</td>
            </tr>
            <tr>
                <td>Nomor Rekening</td>
                <td style="font-family: monospace; font-size: 16px;">{{ $transaction->bank->norek }}</td>
            </tr>
            <tr>
                <td>Atas Nama</td>
                <td>{{ $transaction->bank->atasnama }}</td>
            </tr>
        </table>
    </div>

    <p><strong>Penting:</strong> Pastikan transfer sesuai dengan nominal yang tertera untuk mempercepat proses verifikasi.</p>
    @elseif($transaction->va_number)
    <h2>Nomor Virtual Account</h2>

    <div class="info-box">
        <table class="detail-table" style="margin: 0;">
            <tr>
                <td>Nomor VA</td>
                <td style="font-family: monospace; font-size: 18px; font-weight: bold;">{{ $transaction->va_number }}</td>
            </tr>
            <tr>
                <td>Metode Pembayaran</td>
                <td>{{ ucfirst($transaction->payment_method) }}</td>
            </tr>
        </table>
    </div>
    @elseif($transaction->payment_url)
    <div style="text-align: center; margin: 25px 0;">
        <a href="{{ $transaction->payment_url }}" class="btn">Lanjutkan Pembayaran</a>
    </div>
    @endif

    <h2>Cara Pembayaran</h2>

    @if($transaction->payment_method === 'manual_transfer')
    <ol style="color: #4b5563; font-size: 14px; padding-left: 20px;">
        <li style="margin-bottom: 8px;">Transfer ke rekening di atas sesuai nominal yang tertera</li>
        <li style="margin-bottom: 8px;">Simpan bukti transfer Anda</li>
        <li style="margin-bottom: 8px;">Login ke akun Anda dan upload bukti transfer</li>
        <li style="margin-bottom: 8px;">Tunggu verifikasi dari admin (maksimal 1x24 jam)</li>
    </ol>
    @else
    <ol style="color: #4b5563; font-size: 14px; padding-left: 20px;">
        <li style="margin-bottom: 8px;">Klik tombol "Lanjutkan Pembayaran" di atas atau gunakan nomor VA yang tertera</li>
        <li style="margin-bottom: 8px;">Pilih metode pembayaran yang diinginkan</li>
        <li style="margin-bottom: 8px;">Ikuti instruksi pembayaran hingga selesai</li>
        <li style="margin-bottom: 8px;">Pembayaran akan diverifikasi secara otomatis</li>
    </ol>
    @endif

    <div style="text-align: center; margin-top: 25px;">
        <a href="{{ $appUrl }}/user/transactions" class="btn">Lihat Status Pembayaran</a>
    </div>

    <p style="margin-top: 30px;">Jika Anda mengalami kendala dalam melakukan pembayaran, silakan hubungi tim support kami.</p>

    <p>Salam hangat,<br><strong>Tim {{ $appName }}</strong></p>
@endsection
