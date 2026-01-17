# 🚀 Production Scraper Setup untuk Multi-User

## 📊 Arsitektur Production-Ready

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐     ┌──────────────┐
│   User 1    │────▶│              │────▶│             │────▶│   Python     │
│   User 2    │────▶│   Laravel    │────▶│    Queue    │────▶│   Scraper    │
│   User N    │────▶│  Controller  │────▶│   Worker    │────▶│     API      │
└─────────────┘     └──────────────┘     └─────────────┘     └──────────────┘
                            │                    │
                            ▼                    ▼
                    ┌──────────────┐     ┌─────────────┐
                    │    Cache     │     │  Database   │
                    │  (Redis/     │     │  (MySQL/    │
                    │  Memcached)  │     │  Postgres)  │
                    └──────────────┘     └─────────────┘
```

## ✅ Fitur yang Sudah Diimplementasikan

### 1. **Queue System (Background Processing)**
- ✅ Request tidak block UI - instant response
- ✅ Auto retry 3x jika gagal
- ✅ Timeout protection (10 menit max)
- ✅ Priority queue (Admin = high, User = default)

### 2. **Rate Limiting**
- ✅ **Regular User**: 10 requests/hour
- ✅ **Admin**: Unlimited
- ✅ Counter reset otomatis setiap jam
- ✅ HTTP 429 response saat limit exceeded

### 3. **Caching System**
- ✅ Cache hasil scraping 24 jam
- ✅ Hemat API calls & biaya
- ✅ Instant response untuk query yang sama
- ✅ Cache key berdasarkan keyword + location + kecamatan

### 4. **Duplicate Prevention**
- ✅ Check existing data sebelum insert
- ✅ Berdasarkan: name + kecamatan + user_id
- ✅ Menghindari data duplikat

### 5. **Job Status Tracking**
- ✅ Real-time status: queued → processing → completed/failed
- ✅ Progress tracking
- ✅ Error messages jika gagal
- ✅ Job ID untuk monitoring

## 🛠️ Setup Production

### 1. **Install Queue Driver (Redis - Recommended)**

```bash
# Install Redis
brew install redis  # macOS
# atau
sudo apt-get install redis-server  # Ubuntu

# Start Redis
brew services start redis  # macOS
# atau
sudo systemctl start redis  # Ubuntu

# Install PHP Redis extension
pecl install redis
```

Update `.env`:
```env
QUEUE_CONNECTION=redis
REDIS_HOST=127.0.0.1
REDIS_PASSWORD=null
REDIS_PORT=6379

CACHE_DRIVER=redis
SESSION_DRIVER=redis
```

### 2. **Update Environment Variables**

Tambahkan di `/Applications/laravel/chatcepat/.env`:

```env
# Python Scraper API (pastikan port sesuai)
PYTHON_SCRAPER_API_URL=http://localhost:5001
PYTHON_SCRAPER_API_KEY=chatcepat-secret-key-2024

# Rate Limiting
SCRAPER_RATE_LIMIT_PER_HOUR=10  # User biasa
# Admin tidak ada limit

# Queue Settings
QUEUE_CONNECTION=redis
```

### 3. **Start Queue Worker**

```bash
# Development (single worker)
php artisan queue:work --queue=high,default --tries=3 --timeout=600

# Production (dengan supervisor - recommended)
sudo apt-get install supervisor

# Buat config file: /etc/supervisor/conf.d/chatcepat-worker.conf
[program:chatcepat-worker]
process_name=%(program_name)s_%(process_num)02d
command=php /Applications/laravel/chatcepat/artisan queue:work redis --queue=high,default --sleep=3 --tries=3 --timeout=600 --max-time=3600
autostart=true
autorestart=true
stopasgroup=true
killasgroup=true
user=www-data
numprocs=4
redirect_stderr=true
stdout_logfile=/Applications/laravel/chatcepat/storage/logs/worker.log
stopwaitsecs=3600

# Reload supervisor
sudo supervisorctl reread
sudo supervisorctl update
sudo supervisorctl start chatcepat-worker:*
```

### 4. **Start Python Scraper API**

```bash
cd /Applications/python/chatcepat

# Install dependencies
pip install -r requirements.txt

# Start API
python api.py

# Atau dengan gunicorn (production)
pip install gunicorn
gunicorn -w 4 -b 0.0.0.0:5001 api:app --timeout 600
```

## 📈 Monitoring & Maintenance

### **Check Queue Status**

```bash
# Via tinker
php artisan tinker
>>> Queue::size('default')
>>> Queue::size('high')

# Via horizon (if installed)
php artisan horizon
# Access: http://localhost:8000/horizon
```

### **Check Failed Jobs**

```bash
# List failed jobs
php artisan queue:failed

# Retry failed job
php artisan queue:retry {job_id}

# Retry all failed jobs
php artisan queue:retry all

# Clear failed jobs
php artisan queue:flush
```

### **Monitor Logs**

```bash
# Laravel logs
tail -f storage/logs/laravel.log

# Queue worker logs
tail -f storage/logs/worker.log

# Python scraper logs
# Check console output atau setup logging
```

## 🎯 Rekomendasi Limit untuk Production

### **Google Places API Mode (Recommended)**

```env
# Python .env
SCRAPER_MODE=api
GOOGLE_MAPS_API_KEY=your_api_key_here
```

**Limits:**
- ✅ Max 20 results per request (default)
- ✅ Max 60 results per request (API limit)
- ✅ 10 requests/hour per user
- ✅ Cache 24 jam

**Biaya:**
- FREE tier: $200/bulan (~40,000 requests)
- Text Search: $32/1000 requests
- Place Details: $17/1000 requests
- **20 results ≈ $1** (sangat affordable!)

### **Selenium Mode (Free tapi risky)**

```env
# Python .env
SCRAPER_MODE=selenium
```

**Recommended Delays** (update `/Applications/python/chatcepat/scraper.py`):
- Page load: 4-7 detik
- Scroll: 3-6 detik
- Click: 3-6 detik
- Random delay: 2-5 detik

**Limits:**
- ⚠️ Max 30-50 results per session
- ⚠️ 5 requests/hour per user (lebih ketat!)
- ⚠️ Delay 1-2 menit antar request
- ⚠️ Consider rotating proxy

## 🔧 Scaling untuk Banyak User

### **Horizontal Scaling**

```bash
# Multiple queue workers
# Update numprocs di supervisor config
numprocs=8  # 8 workers parallel

# Multiple Python API instances (behind load balancer)
# Instance 1: port 5001
# Instance 2: port 5002
# Instance 3: port 5003
# etc...
```

### **Vertical Scaling**

```env
# Increase resources
- RAM: Min 4GB (recommended 8GB+)
- CPU: Min 2 cores (recommended 4+ cores)
- Redis: Min 1GB memory
```

### **Database Optimization**

```sql
-- Add indexes untuk faster queries
CREATE INDEX idx_user_places ON google_map_places(user_id, created_at);
CREATE INDEX idx_location ON google_map_places(kecamatan, location);
CREATE INDEX idx_name ON google_map_places(name);
```

## 📊 Pricing Estimation (Google API Mode)

**Scenario: 100 Active Users**

| Item | Usage | Cost/Month |
|------|-------|------------|
| **Regular Users** (90 users × 10 req/hr × 20 results) | ~43,200 requests | $1,500 |
| **Premium Users** (10 users × 50 req/hr × 50 results) | ~360,000 requests | $15,000 |
| **Server** (VPS 8GB RAM, 4 CPU) | - | $40 |
| **Redis** (managed, 1GB) | - | $15 |
| **Total** | - | **~$1,555 - $15,055** |

**💡 Tips Menghemat Biaya:**
1. ✅ Gunakan cache agresif (48-72 jam)
2. ✅ Implement credits system (limit per user)
3. ✅ Batch requests (combine multiple areas)
4. ✅ Peak-hours pricing (mahal di jam sibuk)
5. ✅ Self-hosted Selenium fallback untuk low-priority requests

## 🚨 Production Checklist

- [ ] Redis/queue driver installed & running
- [ ] Queue workers running (supervisor setup)
- [ ] Python scraper API running
- [ ] Rate limiting configured
- [ ] Caching enabled (Redis)
- [ ] Logging configured
- [ ] Monitoring setup (Horizon/New Relic)
- [ ] Database indexes added
- [ ] Backup strategy implemented
- [ ] Error handling tested
- [ ] Load testing completed

## 📞 Support

Jika ada masalah:
1. Check logs: `storage/logs/laravel.log`
2. Check queue: `php artisan queue:failed`
3. Check Python API: `curl http://localhost:5001/health`
4. Restart workers: `sudo supervisorctl restart chatcepat-worker:*`
