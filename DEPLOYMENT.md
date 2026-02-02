# 🚀 Deployment Guide - ChatCepat

## Setelah Git Pull

Jalankan perintah berikut setelah melakukan `git pull`:

```bash
# 1. Pull perubahan terbaru
git pull origin main

# 2. Install/Update dependencies
composer install --no-dev --optimize-autoloader
npm install --production

# 3. Build assets production
npm run build

# 4. Clear semua cache Laravel
php artisan config:clear
php artisan cache:clear
php artisan route:clear
php artisan view:clear
php artisan optimize

# 5. Restart queue worker
php artisan queue:restart

# 6. Verifikasi scheduler
php artisan schedule:list
```

## Environment Variables

Pastikan `.env` sudah dikonfigurasi dengan benar:

```env
# Session Configuration (Penting untuk fix 419 error)
SESSION_LIFETIME=720  # 12 jam
SESSION_DRIVER=database

# Queue Configuration
QUEUE_CONNECTION=database  # atau redis untuk production

# Cache Configuration
CACHE_STORE=database  # atau redis untuk production
```

## Cron Job Setup (WAJIB)

Scheduler Laravel membutuhkan cron job untuk berjalan otomatis.

### Production Server (Linux/Ubuntu)

```bash
# Edit crontab
crontab -e

# Tambahkan baris ini (sesuaikan path):
* * * * * cd /path/to/chatcepat && php artisan schedule:run >> /dev/null 2>&1

# Verifikasi
crontab -l
```

### Development (Local)

```bash
# Jalankan scheduler dalam foreground
php artisan schedule:work
```

## Scheduled Tasks

Aplikasi ini memiliki 3 scheduled tasks:

| Command | Schedule | Description |
|---------|----------|-------------|
| `broadcasts:process-scheduled` | Every minute | Proses broadcast WhatsApp yang terjadwal |
| `reminders:trial-expiry` | Daily at 09:00 | Kirim reminder trial expiry ke user |
| `reminders:subscription-renewal` | Daily at 09:00 | Kirim reminder renewal subscription |

## Queue Workers

Aplikasi menggunakan queue untuk background jobs:

```bash
# Development
php artisan queue:listen --tries=1

# Production (gunakan supervisor)
php artisan queue:work --tries=3 --timeout=90
```

### Supervisor Configuration (Production)

Buat file `/etc/supervisor/conf.d/chatcepat-worker.conf`:

```ini
[program:chatcepat-worker]
process_name=%(program_name)s_%(process_num)02d
command=php /path/to/chatcepat/artisan queue:work --sleep=3 --tries=3 --max-time=3600
autostart=true
autorestart=true
stopasgroup=true
killasgroup=true
user=www-data
numprocs=2
redirect_stderr=true
stdout_logfile=/path/to/chatcepat/storage/logs/worker.log
stopwaitsecs=3600
```

Reload supervisor:
```bash
sudo supervisorctl reread
sudo supervisorctl update
sudo supervisorctl start chatcepat-worker:*
```

## Build Optimization

Build menggunakan code-splitting untuk performance optimal:

- **vendor-react-core**: React & React-DOM (220KB)
- **vendor-icons-lucide**: Lucide icons (796KB)
- **vendor-charts**: ApexCharts (584KB)
- **vendor-editor**: TipTap editor (355KB)
- **vendor-maps**: Leaflet maps (150KB)
- Dan chunks lainnya...

## Troubleshooting

### 419 Page Expired Error
```bash
php artisan config:clear
php artisan cache:clear
# Clear browser cache (Ctrl+F5)
```

### Assets tidak load
```bash
npm run build
php artisan view:clear
```

### Scheduler tidak jalan
```bash
# Cek cron job
crontab -l

# Cek log
tail -f storage/logs/laravel.log

# Test manual
php artisan schedule:run
```

### Queue tidak diproses
```bash
# Restart queue worker
php artisan queue:restart

# Cek failed jobs
php artisan queue:failed

# Retry failed jobs
php artisan queue:retry all
```

## Performance Tips

1. **Use Redis** untuk session, cache, dan queue di production
2. **Enable OPcache** di PHP
3. **Use CDN** untuk static assets
4. **Enable Gzip** compression di web server
5. **Use Queue** untuk heavy tasks

## Security Checklist

- [ ] `.env` tidak di-commit ke git
- [ ] `APP_DEBUG=false` di production
- [ ] HTTPS enabled
- [ ] Database credentials aman
- [ ] API keys tersimpan di `.env`
- [ ] File permissions correct (755 folders, 644 files)
- [ ] `storage` dan `bootstrap/cache` writable

## Contact

Untuk pertanyaan deployment, hubungi tim development.

---

Last Updated: 2026-02-02
