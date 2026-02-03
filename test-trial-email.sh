#!/bin/bash

# Test Script untuk Verifikasi Email Trial Registration
# File: test-trial-email.sh

echo "=========================================="
echo "Test Email Notifikasi Trial Registration"
echo "=========================================="
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}📧 Langkah-langkah testing:${NC}"
echo "1. Buka browser dan akses halaman registrasi"
echo "2. Pilih paket TRIAL"
echo "3. Isi form registrasi dengan email yang valid"
echo "4. Submit form"
echo "5. Cek inbox email Anda"
echo ""

echo -e "${YELLOW}🔍 Monitoring logs real-time...${NC}"
echo "Tekan Ctrl+C untuk berhenti"
echo ""

# Monitor logs untuk melihat email terkirim
tail -f storage/logs/laravel.log | grep --line-buffered -i "mailketing\|registration\|trial"
