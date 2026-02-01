<!DOCTYPE html>
<html lang="id">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{ $subject ?? 'ChatCepat Notification' }}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333333;
            background-color: #f4f4f4;
        }

        .email-wrapper {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
        }

        /* Header */
        .email-header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 30px 20px;
            text-align: center;
        }

        .email-header img {
            max-width: 180px;
            height: auto;
        }

        /* Body */
        .email-body {
            padding: 40px 30px;
        }

        .greeting {
            font-size: 24px;
            font-weight: 600;
            color: #1a202c;
            margin-bottom: 20px;
        }

        .content {
            font-size: 16px;
            color: #4a5568;
            margin-bottom: 20px;
        }

        .content p {
            margin-bottom: 15px;
        }

        .content strong {
            color: #2d3748;
            font-weight: 600;
        }

        /* Button */
        .button-container {
            text-align: center;
            margin: 30px 0;
        }

        .button {
            display: inline-block;
            padding: 14px 32px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: #ffffff !important;
            text-decoration: none;
            border-radius: 8px;
            font-weight: 600;
            font-size: 16px;
            transition: transform 0.2s;
        }

        .button:hover {
            transform: translateY(-2px);
        }

        /* Info Box */
        .info-box {
            background-color: #f7fafc;
            border-left: 4px solid #667eea;
            padding: 20px;
            margin: 20px 0;
            border-radius: 4px;
        }

        .info-box p {
            margin-bottom: 8px;
        }

        /* Footer */
        .email-footer {
            background-color: #2d3748;
            color: #cbd5e0;
            padding: 30px 20px;
            text-align: center;
            font-size: 14px;
        }

        .email-footer .website-name {
            font-size: 20px;
            font-weight: 700;
            color: #ffffff;
            margin-bottom: 10px;
        }

        .email-footer .tagline {
            color: #a0aec0;
            margin-bottom: 20px;
        }

        .email-footer .links {
            margin: 20px 0;
        }

        .email-footer .links a {
            color: #667eea;
            text-decoration: none;
            margin: 0 10px;
        }

        .email-footer .copyright {
            color: #718096;
            font-size: 12px;
            margin-top: 20px;
        }

        /* Responsive */
        @media only screen and (max-width: 600px) {
            .email-body {
                padding: 30px 20px;
            }

            .greeting {
                font-size: 20px;
            }

            .content {
                font-size: 14px;
            }

            .button {
                padding: 12px 24px;
                font-size: 14px;
            }
        }
    </style>
</head>

<body>
    <div class="email-wrapper">
        <!-- Header with Logo -->
        <div class="email-header">
            @if(isset($settings) && $settings->logo)
                <img src="{{ asset('storage/' . $settings->logo) }}" alt="{{ $settings->app_name ?? 'ChatCepat' }}">
            @else
                <img src="{{ asset('images/logo-white.png') }}" alt="ChatCepat">
            @endif
        </div>

        <!-- Email Body -->
        <div class="email-body">
            @yield('content')
        </div>

        <!-- Footer -->
        <div class="email-footer">
            <div class="website-name">
                {{ $settings->app_name ?? 'ChatCepat' }}
            </div>
            <div class="tagline">
                {{ $settings->footer_tagline ?? 'Omnichannel + CRM' }}
            </div>

            <div class="links">
                <a href="{{ url('/') }}">Beranda</a>
                <a href="{{ url('/pricing') }}">Harga</a>
                <a href="{{ url('/contact') }}">Kontak</a>
            </div>

            <div class="copyright">
                &copy; {{ date('Y') }} {{ $settings->app_name ?? 'ChatCepat' }}. All rights reserved.
            </div>
        </div>
    </div>
</body>

</html>