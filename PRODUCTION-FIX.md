# 🚨 Production Emergency Fix

## Critical Issues Fixed

### 1. .env Configuration Errors
- ❌ `SESSION_LIFETIME=480` → ✅ `SESSION_LIFETIME=1440` (24 hours for 419 prevention)
- ❌ `DB_DATABASE='chatcepat'` with quotes → ✅ `DB_DATABASE=chatcepat` without quotes
- ❌ `DB_USERNAME='chatcepat'` with quotes → ✅ `DB_USERNAME=chatcepat` without quotes
- ❌ Missing `SESSION_SAME_SITE` → ✅ Added `SESSION_SAME_SITE=lax`
- ❌ Missing `MAIL_FROM_ADDRESS` → ✅ Added `MAIL_FROM_ADDRESS=noreply@chatcepat.id`

### 2. Service Provider Cache Corruption (500 Error)
- Error: "Target class [view] does not exist"
- Cause: Corrupted bootstrap/cache files

---

## 🔧 Deployment Steps

### Step 1: Backup Current .env
```bash
cd /var/www/chatcepat
cp .env .env.backup.$(date +%Y%m%d_%H%M%S)
```

### Step 2: Replace .env File
Upload the corrected `.env.production` file to server and rename:
```bash
# On your local machine, copy the file to server:
scp .env.production root@your-server:/var/www/chatcepat/.env.production.new

# On the server:
cd /var/www/chatcepat
mv .env.production.new .env
```

**Or manually edit on server:**
```bash
nano /var/www/chatcepat/.env
```
Then make these changes:
- Change `SESSION_LIFETIME=480` to `SESSION_LIFETIME=1440`
- Remove quotes from `DB_DATABASE='chatcepat'` → `DB_DATABASE=chatcepat`
- Remove quotes from `DB_USERNAME='chatcepat'` → `DB_USERNAME=chatcepat`
- Add line: `SESSION_SAME_SITE=lax`
- Add line: `MAIL_FROM_ADDRESS=noreply@chatcepat.id`

### Step 3: Clear ALL Caches (Fix 500 Error)
```bash
cd /var/www/chatcepat

# Remove corrupted cache files
rm -rf bootstrap/cache/*.php
rm -rf storage/framework/cache/*
rm -rf storage/framework/views/*
rm -rf storage/framework/sessions/*

# Regenerate optimized autoload
composer dump-autoload --optimize

# Rebuild configuration cache
php artisan config:clear
php artisan config:cache

# Clear other caches
php artisan cache:clear
php artisan view:clear
php artisan route:clear
php artisan route:cache

# Verify permissions
chown -R www-data:www-data storage bootstrap/cache
chmod -R 775 storage bootstrap/cache
```

### Step 4: Restart Services
```bash
# Restart PHP-FPM
systemctl restart php8.3-fpm

# Restart Nginx
systemctl restart nginx

# Restart queue workers
php artisan queue:restart
```

### Step 5: Verify Fix
```bash
# Check Laravel can boot
php artisan about

# Check logs for errors
tail -50 storage/logs/laravel.log

# Test the website
curl -I https://www.chatcepat.id
```

---

## ✅ Verification Checklist

- [ ] Website loads without 500 error
- [ ] Login works without 419 error
- [ ] Registration works without 419 error
- [ ] Sessions persist for 24 hours
- [ ] No "Target class [view] does not exist" errors in logs

---

## 🆘 If Still Getting 500 Error

Try these additional steps:

```bash
# Nuclear option - rebuild everything
cd /var/www/chatcepat

# Clear EVERYTHING
php artisan optimize:clear
rm -rf bootstrap/cache/*
rm -rf storage/framework/cache/*
rm -rf storage/framework/views/*

# Reinstall dependencies
composer install --no-dev --optimize-autoloader

# Rebuild
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Restart
systemctl restart php8.3-fpm nginx
```

---

## 📊 Expected Results

After these fixes:
- ✅ No more 419 "Page Expired" errors (24-hour sessions + 10-min CSRF refresh)
- ✅ No more 500 "Target class [view] does not exist" errors
- ✅ Database connection works properly (no quote issues)
- ✅ Sessions work correctly with proper SameSite policy

---

## 🔍 Monitor After Deployment

```bash
# Watch Laravel logs in real-time
tail -f storage/logs/laravel.log

# Watch Nginx error logs
tail -f /var/log/nginx/error.log

# Check session storage
php artisan tinker
>>> DB::table('sessions')->count();
```

---

## ⚠️ Important Notes

1. **SESSION_LIFETIME=1440** means sessions last 24 hours (prevents 419)
2. **CSRF auto-refresh every 10 minutes** is already in code (all layouts + register page)
3. **Event-based refresh** on tab visibility/focus is already implemented
4. **SESSION_DOMAIN=.chatcepat.id** is correct for subdomain cookie sharing
5. **SESSION_SECURE_COOKIE=true** is correct for HTTPS production

---

## 📝 Changes Summary

| Setting | Old Value | New Value | Reason |
|---------|-----------|-----------|--------|
| SESSION_LIFETIME | 480 | 1440 | Prevent 419 errors (24h sessions) |
| DB_DATABASE | 'chatcepat' | chatcepat | Remove invalid quotes |
| DB_USERNAME | 'chatcepat' | chatcepat | Remove invalid quotes |
| SESSION_SAME_SITE | (missing) | lax | Required for security |
| MAIL_FROM_ADDRESS | (missing) | noreply@chatcepat.id | Required for emails |

**All other settings remain unchanged.**
