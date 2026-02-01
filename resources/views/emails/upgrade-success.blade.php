@extends('emails.layout')

@section('content')
    <div class="greeting">
        Halo {{ $user->name }}
    </div>

    <div class="content">
        <p>Selamat! Paket langganan Anda telah berhasil di-upgrade.</p>

        <div class="info-box">
            <p><strong>Detail Upgrade:</strong></p>
            <p>Paket Lama: <strong>{{ $oldPackage }}</strong></p>
            <p>Paket Baru: <strong>{{ $subscription->package->name }}</strong></p>
            <p>Berlaku hingga: <strong>{{ $subscription->expires_at?->format('d F Y') ?? 'Lifetime' }}</strong></p>
        </div>

        <p><strong>Fitur Baru yang Tersedia:</strong></p>
        <ul style="margin-left: 20px; margin-bottom: 20px;">
            <li>Slot WhatsApp: <strong>{{ $subscription->package->whatsapp_slots }}</strong></li>
            <li>Slot Telegram: <strong>{{ $subscription->package->telegram_slots }}</strong></li>
            <li>AI Credit: <strong>{{ number_format($subscription->package->ai_credits, 0, ',', '.') }}</strong></li>
            <li>Broadcast Limit:
                <strong>{{ number_format($subscription->package->broadcast_limit, 0, ',', '.') }}/hari</strong></li>
        </ul>

        <p>Nikmati fitur-fitur premium Anda sekarang.</p>

        <div class="button-container">
            <a href="{{ url('/user/dashboard') }}" class="button">Mulai Gunakan</a>
        </div>

        <p>Terima kasih telah mempercayai {{ $settings->app_name ?? 'ChatCepat' }}.</p>
    </div>
@endsection