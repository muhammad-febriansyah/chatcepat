<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>@yield('title', $appName)</title>
    <style>
        /* Reset */
        body, table, td, p, a, li, blockquote {
            -webkit-text-size-adjust: 100%;
            -ms-text-size-adjust: 100%;
        }
        table, td {
            mso-table-lspace: 0pt;
            mso-table-rspace: 0pt;
        }
        img {
            -ms-interpolation-mode: bicubic;
            border: 0;
            height: auto;
            line-height: 100%;
            outline: none;
            text-decoration: none;
        }

        /* Base styles */
        body {
            margin: 0;
            padding: 0;
            width: 100%;
            background-color: #f4f4f7;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            line-height: 1.6;
            color: #333333;
        }

        .email-wrapper {
            width: 100%;
            background-color: #f4f4f7;
            padding: 30px 0;
        }

        .email-container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
        }

        /* Header */
        .email-header {
            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
            padding: 30px 40px;
            text-align: center;
        }

        .email-header img {
            max-height: 50px;
            width: auto;
        }

        .email-header .app-name {
            color: #ffffff;
            font-size: 24px;
            font-weight: 700;
            margin: 0;
            letter-spacing: -0.5px;
        }

        /* Body */
        .email-body {
            padding: 40px;
        }

        .email-body h1 {
            color: #1f2937;
            font-size: 24px;
            font-weight: 700;
            margin: 0 0 20px 0;
        }

        .email-body h2 {
            color: #374151;
            font-size: 18px;
            font-weight: 600;
            margin: 25px 0 15px 0;
        }

        .email-body p {
            color: #4b5563;
            font-size: 15px;
            margin: 0 0 15px 0;
        }

        /* Info box */
        .info-box {
            background-color: #f9fafb;
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
        }

        .info-box.success {
            background-color: #ecfdf5;
            border-color: #a7f3d0;
        }

        .info-box.warning {
            background-color: #fffbeb;
            border-color: #fde68a;
        }

        .info-box-title {
            font-size: 14px;
            font-weight: 600;
            color: #374151;
            margin-bottom: 10px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        /* Table */
        .detail-table {
            width: 100%;
            border-collapse: collapse;
            margin: 15px 0;
        }

        .detail-table tr {
            border-bottom: 1px solid #e5e7eb;
        }

        .detail-table tr:last-child {
            border-bottom: none;
        }

        .detail-table td {
            padding: 12px 0;
            font-size: 14px;
        }

        .detail-table td:first-child {
            color: #6b7280;
            width: 40%;
        }

        .detail-table td:last-child {
            color: #1f2937;
            font-weight: 500;
            text-align: right;
        }

        .detail-table .total-row td {
            border-top: 2px solid #e5e7eb;
            padding-top: 15px;
            font-size: 16px;
            font-weight: 700;
        }

        .detail-table .total-row td:last-child {
            color: #059669;
        }

        /* Button */
        .btn {
            display: inline-block;
            padding: 14px 28px;
            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
            color: #ffffff !important;
            text-decoration: none;
            border-radius: 8px;
            font-weight: 600;
            font-size: 15px;
            text-align: center;
            margin: 20px 0;
        }

        .btn:hover {
            background: linear-gradient(135deg, #059669 0%, #047857 100%);
        }

        /* Status badge */
        .status-badge {
            display: inline-block;
            padding: 6px 14px;
            border-radius: 20px;
            font-size: 13px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        .status-badge.success {
            background-color: #d1fae5;
            color: #065f46;
        }

        .status-badge.pending {
            background-color: #fef3c7;
            color: #92400e;
        }

        /* Footer */
        .email-footer {
            background-color: #f9fafb;
            padding: 30px 40px;
            text-align: center;
            border-top: 1px solid #e5e7eb;
        }

        .email-footer p {
            color: #6b7280;
            font-size: 13px;
            margin: 0 0 10px 0;
        }

        .email-footer a {
            color: #059669;
            text-decoration: none;
        }

        .email-footer .social-links {
            margin: 15px 0;
        }

        .email-footer .social-links a {
            display: inline-block;
            margin: 0 8px;
            color: #9ca3af;
        }

        .email-footer .copyright {
            font-size: 12px;
            color: #9ca3af;
            margin-top: 15px;
        }

        /* Responsive */
        @media only screen and (max-width: 600px) {
            .email-container {
                width: 100% !important;
                margin: 0 !important;
                border-radius: 0 !important;
            }

            .email-header,
            .email-body,
            .email-footer {
                padding: 25px 20px !important;
            }

            .email-body h1 {
                font-size: 20px !important;
            }

            .detail-table td {
                display: block;
                width: 100% !important;
                text-align: left !important;
            }

            .detail-table td:first-child {
                padding-bottom: 5px;
            }

            .detail-table td:last-child {
                padding-top: 0;
                padding-bottom: 15px;
            }
        }
    </style>
</head>
<body>
    <div class="email-wrapper">
        <table class="email-container" role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" align="center">
            <!-- Header -->
            <tr>
                <td class="email-header">
                    @if($logoUrl)
                        <img src="{{ $logoUrl }}" alt="{{ $appName }}" style="max-height: 50px; width: auto;">
                    @else
                        <h1 class="app-name">{{ $appName }}</h1>
                    @endif
                </td>
            </tr>

            <!-- Body -->
            <tr>
                <td class="email-body">
                    @yield('content')
                </td>
            </tr>

            <!-- Footer -->
            <tr>
                <td class="email-footer">
                    <p>Butuh bantuan? Hubungi kami di <a href="mailto:{{ $supportEmail }}">{{ $supportEmail }}</a></p>
                    <p>Atau kunjungi <a href="{{ $appUrl }}">{{ $appUrl }}</a></p>
                    <div class="copyright">
                        <p>&copy; {{ date('Y') }} {{ $appName }}. All rights reserved.</p>
                        <p>Email ini dikirim secara otomatis, mohon tidak membalas email ini.</p>
                    </div>
                </td>
            </tr>
        </table>
    </div>
</body>
</html>
