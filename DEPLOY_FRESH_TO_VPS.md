# 🚀 Fresh Deploy ChatCepat ke VPS dari GitHub

## ⚠️ BACKUP DULU SEBELUM REMOVE!

**WAJIB backup ini sebelum hapus aplikasi lama:**

### 1. Backup Database

```bash
# SSH ke VPS
ssh user@www.chatcepat.id

# Backup database
mysqldump -u root -p chatcepat > ~/backup_chatcepat_$(date +%Y%m%d).sql

# Atau dengan user database biasa
mysqldump -u db_user -p chatcepat > ~/backup_chatcepat_$(date +%Y%m%d).sql

# Verify backup berhasil
ls -lh ~/backup_chatcepat_*.sql
```

### 2. Backup .env File

```bash
# Masuk ke folder aplikasi
cd /var/www/chatcepat  # atau path aplikasi Anda

# Copy .env ke backup
cp .env ~/backup_env_chatcepat_$(date +%Y%m%d)

# Verify backup
cat ~/backup_env_chatcepat_*
```

### 3. Backup Uploaded Files/Storage

```bash
# Backup storage (uploaded files, photos, dll)
cd /var/www/chatcepat

# Tar compress storage
tar -czf ~/backup_storage_chatcepat_$(date +%Y%m%d).tar.gz storage/app/public

# Verify backup
ls -lh ~/backup_storage_*.tar.gz
```

### 4. Backup Semua Sekaligus (Recommended)

```bash
#!/bin/bash
# Save as backup_chatcepat.sh

BACKUP_DIR=~/chatcepat_backup_$(date +%Y%m%d_%H%M%S)
APP_DIR=/var/www/chatcepat  # Sesuaikan dengan path Anda
DB_NAME=chatcepat
DB_USER=root  # Sesuaikan

echo "Creating backup directory..."
mkdir -p $BACKUP_DIR

echo "Backing up database..."
mysqldump -u $DB_USER -p $DB_NAME > $BACKUP_DIR/database.sql

echo "Backing up .env file..."
cp $APP_DIR/.env $BACKUP_DIR/.env

echo "Backing up storage..."
tar -czf $BACKUP_DIR/storage.tar.gz -C $APP_DIR storage/app/public

echo "Backing up uploaded files..."
if [ -d "$APP_DIR/public/uploads" ]; then
    tar -czf $BACKUP_DIR/uploads.tar.gz -C $APP_DIR public/uploads
fi

echo "Backup completed!"
echo "Backup location: $BACKUP_DIR"
ls -lh $BACKUP_DIR
```

**Jalankan:**
```bash
chmod +x backup_chatcepat.sh
./backup_chatcepat.sh
```

---

## 🗑️ REMOVE APLIKASI LAMA

### 1. Stop Web Server & Services

```bash
# Stop Nginx
sudo systemctl stop nginx

# Stop PHP-FPM
sudo systemctl stop php8.3-fpm  # Sesuaikan versi PHP

# Stop queue workers (jika ada)
sudo supervisorctl stop chatcepat-worker:*

# Atau jika pakai systemd
sudo systemctl stop chatcepat-worker
```

### 2. Remove Folder Aplikasi

```bash
# Masuk ke parent directory
cd /var/www

# Rename dulu (lebih aman daripada langsung hapus)
sudo mv chatcepat chatcepat_old_$(date +%Y%m%d)

# Atau langsung hapus (HATI-HATI!)
# sudo rm -rf chatcepat
```

**⚠️ JANGAN hapus database!** Database tetap disimpan.

---

## 📥 CLONE FRESH DARI GITHUB

### 1. Clone Repository

```bash
# Masuk ke web root
cd /var/www

# Clone dari GitHub
sudo git clone https://github.com/username/chatcepat.git chatcepat

# Atau jika private repo
sudo git clone git@github.com:username/chatcepat.git chatcepat

# Masuk ke folder
cd chatcepat
```

### 2. Set Permissions

```bash
# Set owner ke www-data (Nginx/Apache user)
sudo chown -R www-data:www-data /var/www/chatcepat

# Set permissions
sudo find /var/www/chatcepat -type f -exec chmod 644 {} \;
sudo find /var/www/chatcepat -type d -exec chmod 755 {} \;

# Storage & bootstrap/cache harus writable
sudo chmod -R 775 /var/www/chatcepat/storage
sudo chmod -R 775 /var/www/chatcepat/bootstrap/cache
```

---

## ⚙️ SETUP APLIKASI

### 1. Install Dependencies

```bash
cd /var/www/chatcepat

# Install Composer dependencies
composer install --no-dev --optimize-autoloader

# Install NPM dependencies (jika perlu)
npm install
npm run build
```

### 2. Restore .env File

```bash
# Copy .env dari backup
cp ~/backup_env_chatcepat_* /var/www/chatcepat/.env

# Atau buat .env baru dari .env.example
cp .env.example .env

# Generate APP_KEY (jika buat baru)
php artisan key:generate
```

### 3. Update .env Configuration

Edit `.env` dan pastikan konfigurasi benar:

```env
APP_NAME=ChatCepat
APP_ENV=production
APP_DEBUG=false
APP_URL=https://www.chatcepat.id

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=chatcepat
DB_USERNAME=your_db_user
DB_PASSWORD=your_db_password

# Meta Webhook
META_WEBHOOK_VERIFY_TOKEN=chatcepat-meta-webhook-2026
META_APP_ID=2210262782822425
META_APP_SECRET=your_app_secret
```

### 4. Run Migrations

```bash
# Run migrations
php artisan migrate

# Atau jika database sudah ada, skip migration
# Database sudah punya data dari backup
```

### 5. Restore Storage Files

```bash
# Extract storage backup
tar -xzf ~/chatcepat_backup_*/storage.tar.gz -C /var/www/chatcepat

# Create symbolic link
php artisan storage:link

# Set permissions
sudo chown -R www-data:www-data /var/www/chatcepat/storage
sudo chmod -R 775 /var/www/chatcepat/storage
```

### 6. Clear & Optimize Cache

```bash
php artisan config:clear
php artisan cache:clear
php artisan route:clear
php artisan view:clear

# Optimize untuk production
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan optimize
```

---

## 🌐 RESTART WEB SERVER

```bash
# Restart PHP-FPM
sudo systemctl restart php8.3-fpm

# Restart Nginx
sudo systemctl restart nginx

# Start queue workers (jika ada)
sudo supervisorctl start chatcepat-worker:*

# Check status
sudo systemctl status nginx
sudo systemctl status php8.3-fpm
```

---

## ✅ VERIFY DEPLOYMENT

### 1. Check Website

```bash
# Test homepage
curl -I https://www.chatcepat.id

# Expected: HTTP/1.1 200 OK
```

### 2. Check Logs

```bash
# Check Laravel logs
tail -f /var/www/chatcepat/storage/logs/laravel.log

# Check Nginx error log
sudo tail -f /var/log/nginx/error.log

# Check PHP-FPM log
sudo tail -f /var/log/php8.3-fpm.log
```

### 3. Test Webhook

```bash
# Test Meta webhook
curl "https://www.chatcepat.id/api/meta/webhook?hub.mode=subscribe&hub.verify_token=chatcepat-meta-webhook-2026&hub.challenge=test123"

# Expected response: test123
```

---

## 🔧 TROUBLESHOOTING

### Error: Permission Denied

```bash
# Fix permissions
sudo chown -R www-data:www-data /var/www/chatcepat
sudo chmod -R 775 /var/www/chatcepat/storage
sudo chmod -R 775 /var/www/chatcepat/bootstrap/cache
```

### Error: 500 Internal Server Error

```bash
# Check logs
tail -100 /var/www/chatcepat/storage/logs/laravel.log

# Clear cache
php artisan config:clear
php artisan cache:clear

# Check .env file
cat /var/www/chatcepat/.env
```

### Error: Database Connection Failed

```bash
# Test database connection
mysql -u db_user -p -e "USE chatcepat; SELECT COUNT(*) FROM users;"

# Check .env database credentials
grep "DB_" /var/www/chatcepat/.env
```

### Webhook Still 404

```bash
# Check routes
php artisan route:list | grep webhook

# Clear route cache
php artisan route:clear
php artisan route:cache

# Restart services
sudo systemctl restart php8.3-fpm nginx
```

---

## 📋 DEPLOYMENT CHECKLIST

**Backup:**
- [x] Database backed up
- [x] .env backed up
- [x] Storage files backed up

**Remove Old:**
- [x] Web server stopped
- [x] Old folder renamed/removed

**Deploy New:**
- [x] Clone from GitHub
- [x] Set permissions
- [x] Install dependencies
- [x] Restore .env
- [x] Restore storage files
- [x] Run migrations (if needed)
- [x] Clear & optimize cache

**Restart:**
- [x] PHP-FPM restarted
- [x] Nginx restarted
- [x] Queue workers restarted

**Verify:**
- [x] Website accessible
- [x] Webhook working
- [x] Login working
- [x] Database connected
- [x] No errors in logs

---

## 🚀 COMPLETE SCRIPT

Save as `deploy_fresh.sh`:

```bash
#!/bin/bash

# Configuration
APP_DIR="/var/www/chatcepat"
BACKUP_DIR=~/chatcepat_backup_$(date +%Y%m%d_%H%M%S)
DB_NAME="chatcepat"
DB_USER="root"
GITHUB_REPO="https://github.com/username/chatcepat.git"
PHP_VERSION="8.3"

echo "================================================"
echo "ChatCepat Fresh Deployment Script"
echo "================================================"
echo ""

# Step 1: Backup
echo "Step 1: Creating backup..."
mkdir -p $BACKUP_DIR

echo "  - Backing up database..."
mysqldump -u $DB_USER -p $DB_NAME > $BACKUP_DIR/database.sql

echo "  - Backing up .env..."
cp $APP_DIR/.env $BACKUP_DIR/.env

echo "  - Backing up storage..."
tar -czf $BACKUP_DIR/storage.tar.gz -C $APP_DIR storage/app/public

echo "  ✓ Backup completed: $BACKUP_DIR"
echo ""

# Step 2: Stop services
echo "Step 2: Stopping services..."
sudo systemctl stop nginx
sudo systemctl stop php${PHP_VERSION}-fpm
echo "  ✓ Services stopped"
echo ""

# Step 3: Remove old app
echo "Step 3: Removing old application..."
cd /var/www
sudo mv chatcepat chatcepat_old_$(date +%Y%m%d)
echo "  ✓ Old app renamed"
echo ""

# Step 4: Clone fresh
echo "Step 4: Cloning from GitHub..."
sudo git clone $GITHUB_REPO chatcepat
cd chatcepat
echo "  ✓ Cloned successfully"
echo ""

# Step 5: Set permissions
echo "Step 5: Setting permissions..."
sudo chown -R www-data:www-data /var/www/chatcepat
sudo chmod -R 775 storage bootstrap/cache
echo "  ✓ Permissions set"
echo ""

# Step 6: Install dependencies
echo "Step 6: Installing dependencies..."
composer install --no-dev --optimize-autoloader
npm install && npm run build
echo "  ✓ Dependencies installed"
echo ""

# Step 7: Restore configuration
echo "Step 7: Restoring configuration..."
cp $BACKUP_DIR/.env /var/www/chatcepat/.env
tar -xzf $BACKUP_DIR/storage.tar.gz -C /var/www/chatcepat
php artisan storage:link
echo "  ✓ Configuration restored"
echo ""

# Step 8: Optimize
echo "Step 8: Optimizing application..."
php artisan config:clear
php artisan cache:clear
php artisan route:clear
php artisan view:clear
php artisan config:cache
php artisan route:cache
php artisan optimize
echo "  ✓ Optimization complete"
echo ""

# Step 9: Restart services
echo "Step 9: Restarting services..."
sudo systemctl restart php${PHP_VERSION}-fpm
sudo systemctl restart nginx
echo "  ✓ Services restarted"
echo ""

# Step 10: Verify
echo "Step 10: Verifying deployment..."
echo "  - Website status:"
curl -I https://www.chatcepat.id | head -1
echo "  - Webhook status:"
curl -s "https://www.chatcepat.id/api/meta/webhook?hub.mode=subscribe&hub.verify_token=chatcepat-meta-webhook-2026&hub.challenge=test" | head -1
echo ""

echo "================================================"
echo "✅ Deployment Complete!"
echo "================================================"
echo ""
echo "Backup location: $BACKUP_DIR"
echo "Old app location: /var/www/chatcepat_old_$(date +%Y%m%d)"
echo ""
echo "Next steps:"
echo "  1. Test website: https://www.chatcepat.id"
echo "  2. Check logs: tail -f storage/logs/laravel.log"
echo "  3. Verify webhook in Meta Developer"
echo ""
```

**Usage:**
```bash
# Make executable
chmod +x deploy_fresh.sh

# Run
./deploy_fresh.sh
```

---

## 📚 ADDITIONAL NOTES

### If Using Git (Recommended)

Untuk deployment berikutnya, gunakan git pull:

```bash
cd /var/www/chatcepat
git pull origin main
composer install --no-dev
npm run build
php artisan migrate
php artisan config:cache
php artisan route:cache
sudo systemctl restart php8.3-fpm nginx
```

### Queue Workers

Jika pakai queue workers dengan Supervisor:

```bash
# Stop workers
sudo supervisorctl stop chatcepat-worker:*

# Update code, then restart
sudo supervisorctl start chatcepat-worker:*

# Or restart all
sudo supervisorctl restart chatcepat-worker:*
```

### Cron Jobs

Pastikan cron job Laravel scheduler tetap jalan:

```bash
# Check crontab
crontab -l

# Should have:
# * * * * * cd /var/www/chatcepat && php artisan schedule:run >> /dev/null 2>&1
```

---

**Good luck dengan fresh deployment! 🚀**
