<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>419 - Sesi Berakhir</title>
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
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
        </div>
        <div class="error-code">419</div>
        <h1 class="error-title">Sesi Telah Berakhir</h1>
        <p class="error-message">
            Sesi Anda telah berakhir. Silakan <strong>tekan Ctrl+Shift+R</strong>
            (atau Cmd+Shift+R di Mac) untuk memuat ulang halaman.
        </p>

        <div style="margin: 24px auto; padding: 16px; background: #fff3cd; border-radius: 12px; max-width: 400px; text-align: left; font-size: 14px; line-height: 1.6;">
            <strong style="color: #856404;">💡 Masih error setelah refresh?</strong>
            <ol style="margin: 12px 0 0 20px; color: #856404;">
                <li>Bersihkan cache browser (<strong>Ctrl+Shift+Delete</strong>)</li>
                <li>Centang "Cookies" dan "Cached images"</li>
                <li>Klik "Clear data"</li>
                <li>Tutup dan buka browser lagi</li>
            </ol>
        </div>

        <div>
            <a href="javascript:forceReload()" class="btn-primary" id="refreshBtn">
                Refresh Halaman (Auto dalam <span id="countdown">5</span>s)
            </a>
        </div>

        <script>
            let countdown = 5;
            const countdownEl = document.getElementById('countdown');
            const btn = document.getElementById('refreshBtn');

            function forceReload() {
                // Force reload dengan bypass cache
                window.location.href = window.location.href.split('?')[0] + '?t=' + Date.now();
            }

            const interval = setInterval(() => {
                countdown--;
                if (countdownEl) {
                    countdownEl.textContent = countdown;
                }

                if (countdown <= 0) {
                    clearInterval(interval);
                    forceReload();
                }
            }, 1000);

            // Stop countdown jika user klik manual
            btn.addEventListener('click', () => {
                clearInterval(interval);
            });
        </script>
    </div>
</body>
</html>
