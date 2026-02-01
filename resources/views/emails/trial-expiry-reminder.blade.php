@extends('emails.layout')

@section('content')
    <div class="greeting">
        {{ $daysRemaining <= 3 ? 'PENTING!' : 'Pengingat' }} Halo {{ $user->name }}
    </div>

    <div class="content">
        <p>Masa trial gratis {{ $settings->app_name ?? 'ChatCepat' }} Anda akan berakhir dalam <strong
                style="color: #e53e3e;">{{ $daysRemaining }} hari</strong> lagi.</p>

        <p>Jangan sampai kehilangan akses ke fitur-fitur premium {{ $settings->app_name ?? 'ChatCepat' }}.</p>

        <div class="info-box" style="border-left-color: #48bb78;">
            <p><strong>Keuntungan Upgrade Sekarang:</strong></p>
            <ul style="margin-left: 20px;">
                <li>Akses unlimited tanpa batasan waktu</li>
                <li>Fitur AI Chatbot yang lebih canggih</li>
                <li>Broadcast tanpa batas</li>
                <li>Support prioritas 24/7</li>
                <li>Integrasi dengan lebih banyak platform</li>
            </ul>
        </div>

        <div class="info-box" style="border-left-color: #f59e0b; background-color: #fffbeb;">
            <p><strong>Penawaran Spesial:</strong></p>
            <p>Upgrade sekarang dan dapatkan diskon hingga <strong>20%</strong> untuk paket tahunan.</p>
        </div>

        <div class="button-container">
            <a href="{{ url('/user/pricing') }}" class="button">Upgrade Sekarang</a>
        </div>

        <p style="font-size: 14px; color: #718096;">
            Jika Anda memiliki pertanyaan, tim support kami siap membantu.
        </p>
    </div>
@endsection