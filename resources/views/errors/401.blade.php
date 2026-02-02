<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>401 - Tidak Terautentikasi</title>
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
        .btn-secondary {
            display: inline-block;
            padding: 14px 24px;
            background-color: transparent;
            color: #2547F9;
            text-decoration: none;
            border-radius: 12px;
            font-weight: 500;
            font-size: 16px;
            margin-left: 12px;
            transition: all 0.2s;
        }
        .btn-secondary:hover {
            background-color: rgba(37, 71, 249, 0.05);
        }
        @media (max-width: 640px) {
            .error-code {
                font-size: 56px;
            }
            .error-title {
                font-size: 20px;
            }
            .btn-primary, .btn-secondary {
                display: block;
                margin: 8px 0;
            }
        }
    </style>
</head>
<body>
    <div class="error-container">
        <div class="error-icon">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
        </div>
        <div class="error-code">401</div>
        <h1 class="error-title">Tidak Terautentikasi</h1>
        <p class="error-message">
            Anda harus login terlebih dahulu untuk mengakses halaman ini.
            Silakan login dengan akun Anda.
        </p>
        <div>
            <a href="/login" class="btn-primary">Login</a>
            <a href="/" class="btn-secondary">Kembali ke Beranda</a>
        </div>
    </div>
</body>
</html>
