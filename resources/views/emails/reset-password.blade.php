@extends('emails.layout')

@section('content')
    <div class="greeting">
        Halo {{ $user->name }}
    </div>

    <div class="content">
        <p>Anda menerima email ini karena kami menerima permintaan reset password untuk akun Anda.</p>

        <p>Silakan klik tombol di bawah ini untuk mereset password Anda:</p>

        <div class="button-container">
            <a href="{{ $resetUrl }}" class="button">Reset Password</a>
        </div>

        <p>Link reset password ini akan kadaluarsa dalam 60 menit.</p>

        <div class="info-box">
            <p><strong>Penting:</strong></p>
            <p>Jika Anda tidak merasa melakukan permintaan ini, tidak ada tindakan lebih lanjut yang diperlukan. Keamanan
                akun Anda tetap terjaga.</p>
        </div>

        <p>Jika Anda kesulitan mengklik tombol "Reset Password", salin dan tempel URL di bawah ini ke browser Anda:</p>
        <p style="word-break: break-all; font-size: 12px; color: #718096;">
            {{ $resetUrl }}
        </p>

        <p>Terima kasih,<br>Tim {{ $settings->app_name ?? 'ChatCepat' }}</p>
    </div>
@endsection