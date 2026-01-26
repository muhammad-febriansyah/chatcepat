#!/bin/bash

# Script untuk deploy SEO features ke production
# Jalankan di server production setelah git pull

echo "🚀 Deploying SEO Features..."

# Clear all cache
echo "📦 Clearing cache..."
php artisan cache:clear
php artisan config:clear
php artisan route:clear
php artisan view:clear

# Optimize for production
echo "⚡ Optimizing..."
php artisan config:cache
php artisan route:cache
php artisan view:cache

echo "✅ SEO Deployment Complete!"
echo ""
echo "Test URLs:"
echo "- https://www.chatcepat.id/sitemap.xml"
echo "- https://www.chatcepat.id/sitemap-main.xml"
echo "- https://www.chatcepat.id/sitemap-blog.xml"
echo "- https://www.chatcepat.id/robots.txt"
