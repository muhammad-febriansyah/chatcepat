#!/bin/bash

# ChatCepat Deployment Script
# Usage: bash deploy.sh

echo "🚀 Starting deployment..."

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Step 1: Pull latest code
echo -e "${YELLOW}[1/7]${NC} Pulling latest code..."
git pull origin main
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Git pull failed!${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Git pull completed${NC}"

# Step 2: Install Composer dependencies
echo -e "${YELLOW}[2/7]${NC} Installing Composer dependencies..."
composer install --no-dev --optimize-autoloader --no-interaction
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Composer install failed!${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Composer install completed${NC}"

# Step 3: Install NPM dependencies
echo -e "${YELLOW}[3/7]${NC} Installing NPM dependencies..."
npm install --production
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ NPM install failed!${NC}"
    exit 1
fi
echo -e "${GREEN}✅ NPM install completed${NC}"

# Step 4: Build assets
echo -e "${YELLOW}[4/7]${NC} Building assets..."
npm run build
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Build failed!${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Build completed${NC}"

# Step 5: Clear Laravel cache
echo -e "${YELLOW}[5/7]${NC} Clearing Laravel cache..."
php artisan config:clear
php artisan cache:clear
php artisan route:cache
php artisan view:cache
echo -e "${GREEN}✅ Cache cleared${NC}"

# Step 6: Restart queue workers
echo -e "${YELLOW}[6/7]${NC} Restarting queue workers..."
php artisan queue:restart
echo -e "${GREEN}✅ Queue restarted${NC}"

# Step 7: Verify scheduler
echo -e "${YELLOW}[7/7]${NC} Verifying scheduler..."
php artisan schedule:list
echo -e "${GREEN}✅ Scheduler verified${NC}"

echo ""
echo -e "${GREEN}🎉 Deployment completed successfully!${NC}"
echo ""
echo -e "${YELLOW}📋 Post-deployment checklist:${NC}"
echo "  • Update .env if needed"
echo "  • Check cron job: crontab -l"
echo "  • Test the application"
echo ""
