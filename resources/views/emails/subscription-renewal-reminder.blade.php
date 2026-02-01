@extends('emails.layout')

@section('content')
    <div class="greeting">
        {{ $daysRemaining <= 3 ? 'PENTING!' : 'Pengingat' }} Halo {{ $user->name }}
    </div>

    <div class="content">
        <p>Paket langganan <strong>{{ $subscription->package->name }}</strong> Anda akan berakhir dalam <strong
                style="color: #e53e3e;">{{ $daysRemaining }} hari</strong> lagi.</p>

        <div class="info-box">
            <p><strong>Detail Langganan:</strong></p>
            <p>Paket: <strong>{{ $subscription->package->name }}</strong></p>
            <p>Tanggal Berakhir: <strong style="color: #e53e3e;">{{ $subscription->expires_at->format('d F Y') }}</strong>
            </p>
            <p>Slot WhatsApp: <strong>{{ $subscription->package->whatsapp_slots }}</strong></p>
            <p>Slot Telegram: <strong>{{ $subscription->package->telegram_slots }}</strong></p>
        </div>

        <p>Perpanjang sekarang agar tidak kehilangan akses ke fitur-fitur premium.</p>

        <div class="info-box" style="border-left-color: #48bb78;">
            <p><strong>Keuntungan Perpanjangan:</strong></p>
            <ul style="margin-left: 20px;">
                <li>Tidak ada gangguan layanan</li>
                <li>Semua data dan konfigurasi tetap tersimpan</li>
                <li>Dapatkan diskon untuk perpanjangan tahunan</li>
                <li>Support prioritas tetap aktif</li>
            </ul>
        </div>

        <div class="button-container">
            <a href="{{ url('/user/pricing') }}" class="button">Perpanjang Sekarang</a>
        </div>

        <p style="font-size: 14px; color: #718096;">
            Jangan biarkan bisnis Anda terganggu. Perpanjang langganan Anda hari ini.
        </p>
    </div>
@endsection