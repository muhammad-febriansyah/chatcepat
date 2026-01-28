#!/bin/bash

# ============================================
# ChatCepat Quick Fresh Deploy Script
# ============================================
# Usage: ./QUICK_REDEPLOY.sh
# ============================================

# Configuration - EDIT THESE!
APP_DIR="/var/www/chatcepat"
GITHUB_REPO="https://github.com/username/chatcepat.git"  # Ganti dengan repo Anda
DB_NAME="chatcepat"
DB_USER="root"
PHP_VERSION="8.3"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}================================================${NC}"
echo -e "${GREEN}ChatCepat Fresh Deployment${NC}"
echo -e "${GREEN}================================================${NC}"
echo ""

# Check if running as root or with sudo
if [[ $EUID -eq 0 ]]; then
   echo -e "${RED}Don't run this script as root! Use your regular user.${NC}"
   exit 1
fi

# Step 1: Backup
echo -e "${YELLOW}Step 1: Creating backup...${NC}"
BACKUP_DIR=~/chatcepat_backup_$(date +%Y%m%d_%H%M%S)
mkdir -p $BACKUP_DIR

echo "  Backing up database..."
mysqldump -u $DB_USER -p $DB_NAME > $BACKUP_DIR/database.sql

if [ -f "$APP_DIR/.env" ]; then
    echo "  Backing up .env..."
    cp $APP_DIR/.env $BACKUP_DIR/.env
fi

if [ -d "$APP_DIR/storage/app/public" ]; then
    echo "  Backing up storage..."
    tar -czf $BACKUP_DIR/storage.tar.gz -C $APP_DIR storage/app/public
fi

echo -e "  ${GREEN}✓ Backup completed: $BACKUP_DIR${NC}"
echo ""

# Step 2: Stop services
echo -e "${YELLOW}Step 2: Stopping services...${NC}"
sudo systemctl stop nginx
sudo systemctl stop php${PHP_VERSION}-fpm
echo -e "  ${GREEN}✓ Services stopped${NC}"
echo ""

# Step 3: Remove old app
echo -e "${YELLOW}Step 3: Removing old application...${NC}"
cd /var/www
if [ -d "chatcepat" ]; then
    sudo mv chatcepat chatcepat_old_$(date +%Y%m%d)
    echo -e "  ${GREEN}✓ Old app renamed to chatcepat_old_$(date +%Y%m%d)${NC}"
else
    echo -e "  ${YELLOW}! No existing app found${NC}"
fi
echo ""

# Step 4: Clone fresh
echo -e "${YELLOW}Step 4: Cloning from GitHub...${NC}"
sudo git clone $GITHUB_REPO chatcepat
cd chatcepat
echo -e "  ${GREEN}✓ Cloned successfully${NC}"
echo ""

# Step 5: Set permissions
echo -e "${YELLOW}Step 5: Setting permissions...${NC}"
sudo chown -R www-data:www-data $APP_DIR
sudo find $APP_DIR -type f -exec chmod 644 {} \;
sudo find $APP_DIR -type d -exec chmod 755 {} \;
sudo chmod -R 775 $APP_DIR/storage
sudo chmod -R 775 $APP_DIR/bootstrap/cache
echo -e "  ${GREEN}✓ Permissions set${NC}"
echo ""

# Step 6: Install dependencies
echo -e "${YELLOW}Step 6: Installing dependencies...${NC}"
cd $APP_DIR
composer install --no-dev --optimize-autoloader
npm install
npm run build
echo -e "  ${GREEN}✓ Dependencies installed${NC}"
echo ""

# Step 7: Restore configuration
echo -e "${YELLOW}Step 7: Restoring configuration...${NC}"
if [ -f "$BACKUP_DIR/.env" ]; then
    sudo cp $BACKUP_DIR/.env $APP_DIR/.env
    echo -e "  ${GREEN}✓ .env restored${NC}"
else
    echo -e "  ${RED}✗ No .env backup found!${NC}"
    echo "  Creating .env from .env.example..."
    sudo cp $APP_DIR/.env.example $APP_DIR/.env
    sudo php artisan key:generate
    echo -e "  ${YELLOW}! Please edit .env manually!${NC}"
fi

if [ -f "$BACKUP_DIR/storage.tar.gz" ]; then
    sudo tar -xzf $BACKUP_DIR/storage.tar.gz -C $APP_DIR
    echo -e "  ${GREEN}✓ Storage restored${NC}"
fi

sudo php artisan storage:link
sudo chown -R www-data:www-data $APP_DIR/storage
echo ""

# Step 8: Optimize
echo -e "${YELLOW}Step 8: Optimizing application...${NC}"
cd $APP_DIR
php artisan config:clear
php artisan cache:clear
php artisan route:clear
php artisan view:clear
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan optimize
echo -e "  ${GREEN}✓ Optimization complete${NC}"
echo ""

# Step 9: Restart services
echo -e "${YELLOW}Step 9: Restarting services...${NC}"
sudo systemctl restart php${PHP_VERSION}-fpm
sudo systemctl restart nginx
echo -e "  ${GREEN}✓ Services restarted${NC}"
echo ""

# Step 10: Verify
echo -e "${YELLOW}Step 10: Verifying deployment...${NC}"
sleep 2

echo "  Testing website..."
STATUS=$(curl -s -o /dev/null -w "%{http_code}" https://www.chatcepat.id)
if [ "$STATUS" = "200" ]; then
    echo -e "  ${GREEN}✓ Website is UP (HTTP $STATUS)${NC}"
else
    echo -e "  ${RED}✗ Website returned HTTP $STATUS${NC}"
fi

echo "  Testing webhook..."
WEBHOOK_RESPONSE=$(curl -s "https://www.chatcepat.id/api/meta/webhook?hub.mode=subscribe&hub.verify_token=chatcepat-meta-webhook-2026&hub.challenge=test123")
if [ "$WEBHOOK_RESPONSE" = "test123" ]; then
    echo -e "  ${GREEN}✓ Webhook is working${NC}"
else
    echo -e "  ${RED}✗ Webhook not working (Response: $WEBHOOK_RESPONSE)${NC}"
fi
echo ""

# Summary
echo -e "${GREEN}================================================${NC}"
echo -e "${GREEN}✅ Deployment Complete!${NC}"
echo -e "${GREEN}================================================${NC}"
echo ""
echo -e "${YELLOW}Backup location:${NC} $BACKUP_DIR"
echo -e "${YELLOW}Old app location:${NC} /var/www/chatcepat_old_$(date +%Y%m%d)"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo "  1. Test website: https://www.chatcepat.id"
echo "  2. Test login: https://www.chatcepat.id/login"
echo "  3. Check logs: tail -f $APP_DIR/storage/logs/laravel.log"
echo "  4. Verify webhook in Meta Developer Dashboard"
echo ""
echo -e "${YELLOW}If webhook not working:${NC}"
echo "  - Edit .env and add: META_WEBHOOK_VERIFY_TOKEN=chatcepat-meta-webhook-2026"
echo "  - Run: php artisan config:clear"
echo "  - Restart: sudo systemctl restart nginx php${PHP_VERSION}-fpm"
echo ""
