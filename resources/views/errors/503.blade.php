<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>503 - Sedang Maintenance</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            background-color: #F7F8FD;
            color: #1a1a1a;
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            padding: 20px;
        }
        .error-container {
            text-align: center;
            max-width: 500px;
            width: 100%;
        }
        .error-icon {
            width: 120px;
            height: 120px;
            margin: 0 auto 32px;
            background-color: #2547F9;
            border-radius: 24px;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 8px 24px rgba(37, 71, 249, 0.15);
        }
        .error-icon svg {
            width: 64px;
            height: 64px;
            color: white;
        }
        .error-code {
            font-size: 72px;
            font-weight: 700;
            color: #2547F9;
            line-height: 1;
            margin-bottom: 16px;
            font-family: 'Space Grotesk', 'Inter', sans-serif;
        }
        .error-title {
            font-size: 24px;
            font-weight: 600;
            color: #1a1a1a;
            margin-bottom: 12px;
        }
        .error-message {
            font-size: 16px;
            color: #6b7280;
            line-height: 1.6;
            margin-bottom: 32px;
        }
        .btn-primary {
            display: inline-block;
            padding: 14px 32px;
            background-color: #2547F9;
            color: white;
            text-decoration: none;
            border-radius: 12px;
            font-weight: 500;
            font-size: 16px;
            transition: all 0.2s;
            box-shadow: 0 4px 12px rgba(37, 71, 249, 0.2);
        }
        .btn-primary:hover {
            background-color: #1d39c7;
            box-shadow: 0 6px 16px rgba(37, 71, 249, 0.3);
            transform: translateY(-2px);
        }
        @media (max-width: 640px) {
            .error-code {
                font-size: 56px;
            }
            .error-title {
                font-size: 20px;
            }
        }
    </style>
</head>
<body>
    <div class="error-container">
        <div class="error-icon">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
        </div>
        <div class="error-code">503</div>
        <h1 class="error-title">Sedang Maintenance</h1>
        <p class="error-message">
            Kami sedang melakukan maintenance untuk meningkatkan layanan.
            Mohon coba lagi beberapa saat lagi. Terima kasih atas kesabaran Anda.
        </p>
        <div>
            <a href="javascript:window.location.reload()" class="btn-primary">Coba Lagi</a>
        </div>
    </div>
</body>
</html>
