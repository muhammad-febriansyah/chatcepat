# 🗑️ Delete & Redeploy ChatCepat - Simple Way

## ⚡ CARA PALING CEPAT (Langsung Delete)

### 1. SSH ke VPS

```bash
ssh user@www.chatcepat.id
```

### 2. Stop Services

```bash
sudo systemctl stop nginx
sudo systemctl stop php8.3-fpm  # atau versi PHP Anda
```

### 3. Backup .env Aja (Cepat)

```bash
# Backup cuma .env file (penting!)
cp /var/www/chatcepat/.env ~/env_backup
```

### 4. Delete Langsung!

```bash
# Masuk ke folder
cd /var/www

# Delete langsung folder chatcepat
sudo rm -rf chatcepat
```

**Done!** Folder chatcepat sudah terhapus!

---

## 🚀 REDEPLOY FRESH

### 5. Clone dari GitHub

```bash
# Masih di /var/www
cd /var/www

# Clone fresh
sudo git clone https://github.com/username/chatcepat.git chatcepat

# Ganti "username/chatcepat" dengan repo Anda
```

### 6. Setup Permissions

```bash
# Set owner
sudo chown -R www-data:www-data /var/www/chatcepat

# Set permissions
sudo chmod -R 775 /var/www/chatcepat/storage
sudo chmod -R 775 /var/www/chatcepat/bootstrap/cache
```

### 7. Install Dependencies

```bash
cd /var/www/chatcepat

# Composer
composer install --no-dev --optimize-autoloader

# NPM
npm install
npm run build
```

### 8. Restore .env

```bash
# Copy .env dari backup
sudo cp ~/env_backup /var/www/chatcepat/.env

# Atau buat baru
# sudo cp .env.example .env
# sudo php artisan key:generate
```

### 9. Setup Laravel

```bash
# Storage link
php artisan storage:link

# Clear & cache
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan optimize
```

### 10. Restart Services

```bash
sudo systemctl restart php8.3-fpm
sudo systemctl restart nginx
```

### 11. Test

```bash
# Test website
curl -I https://www.chatcepat.id

# Test webhook
curl "https://www.chatcepat.id/api/meta/webhook?hub.mode=subscribe&hub.verify_token=chatcepat-meta-webhook-2026&hub.challenge=test"
```

---

## ⚡ ONE-LINER (Copy Paste Aja!)

Edit dulu bagian `GITHUB_REPO`, lalu copy-paste ke VPS:

```bash
GITHUB_REPO="https://github.com/username/chatcepat.git" && \
cp /var/www/chatcepat/.env ~/env_backup && \
sudo systemctl stop nginx php8.3-fpm && \
cd /var/www && \
sudo rm -rf chatcepat && \
sudo git clone $GITHUB_REPO chatcepat && \
cd chatcepat && \
sudo chown -R www-data:www-data . && \
sudo chmod -R 775 storage bootstrap/cache && \
composer install --no-dev --optimize-autoloader && \
npm install && npm run build && \
sudo cp ~/env_backup .env && \
php artisan storage:link && \
php artisan config:cache && \
php artisan route:cache && \
php artisan optimize && \
sudo systemctl restart php8.3-fpm nginx && \
curl -I https://www.chatcepat.id && \
echo "✅ Done!"
```

---

## 📋 SUPER SIMPLE CHECKLIST

```bash
# 1. Backup .env
cp /var/www/chatcepat/.env ~/env_backup

# 2. Stop services
sudo systemctl stop nginx php8.3-fpm

# 3. Delete
cd /var/www
sudo rm -rf chatcepat

# 4. Clone
sudo git clone https://github.com/username/chatcepat.git chatcepat

# 5. Setup
cd chatcepat
sudo chown -R www-data:www-data .
sudo chmod -R 775 storage bootstrap/cache
composer install --no-dev --optimize-autoloader
npm install && npm run build

# 6. Restore .env
sudo cp ~/env_backup .env

# 7. Laravel setup
php artisan storage:link
php artisan config:cache
php artisan route:cache
php artisan optimize

# 8. Restart
sudo systemctl restart php8.3-fpm nginx

# 9. Test
curl -I https://www.chatcepat.id
```

---

## ⚠️ CATATAN PENTING:

**Yang TIDAK terhapus:**
- ✅ Database (tetap aman, tidak terhapus)
- ✅ .env (sudah di-backup)

**Yang terhapus:**
- ❌ Folder aplikasi chatcepat
- ❌ Uploaded files di storage (jika ada)

**Jadi:**
- Database tetap ada
- User tetap ada
- Data tetap ada
- Tinggal clone ulang kode aja

---

## 🎯 RINGKASAN

**Delete:** `sudo rm -rf chatcepat`

**Redeploy:** Clone dari GitHub

**Done!** Simple! 🚀

---

**Database tidak perlu ditouch karena sudah ada!**
