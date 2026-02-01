@extends('emails.layout')

@section('content')
    <div class="greeting">
        Halo {{ $user->name }}
    </div>

    <div class="content">
        <p>Password akun {{ $settings->app_name ?? 'ChatCepat' }} Anda telah berhasil diubah.</p>

        <div class="info-box" style="border-left-color: #f59e0b;">
            <p><strong>Detail Perubahan:</strong></p>
            <p>Waktu: <strong>{{ now()->format('d F Y H:i:s') }}</strong></p>
            <p>IP Address: <strong>{{ request()->ip() }}</strong></p>
            <p>Browser: <strong>{{ request()->userAgent() }}</strong></p>
        </div>

        <p style="color: #e53e3e;">
            <strong>Perhatian:</strong> Jika Anda tidak melakukan perubahan ini, segera hubungi tim support kami dan ubah
            password Anda.
        </p>

        <div class="button-container">
            <a href="{{ url('/contact') }}" class="button">Hubungi Support</a>
        </div>

        <p style="font-size: 14px; color: #718096;">
            Untuk keamanan akun Anda, jangan bagikan password ke siapapun.
        </p>
    </div>
@endsection