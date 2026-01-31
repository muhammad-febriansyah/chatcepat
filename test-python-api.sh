#!/bin/bash

# Test Python Scraper API
echo "==================================="
echo "Python Scraper API Health Check"
echo "==================================="
echo ""

API_URL="http://localhost:5001"
API_KEY="fd79d1fa8b37385ca3018393f1fc9fa3b7384c28d063904cc1379b216928674b"

echo "1. Checking if Python API is running..."
HEALTH_RESPONSE=$(curl -s -w "\n%{http_code}" -H "X-API-Key: $API_KEY" "$API_URL/health" 2>&1)
HTTP_CODE=$(echo "$HEALTH_RESPONSE" | tail -n1)
RESPONSE_BODY=$(echo "$HEALTH_RESPONSE" | sed '$d')

if [ "$HTTP_CODE" = "200" ]; then
    echo "✅ Python API is running!"
    echo "Response: $RESPONSE_BODY"
else
    echo "❌ Python API is NOT running (HTTP $HTTP_CODE)"
    echo "Response: $RESPONSE_BODY"
    echo ""
    echo "To start Python API:"
    echo "  cd /Applications/python/chatcepat-py"
    echo "  python3 api.py"
    exit 1
fi

echo ""
echo "2. Testing scrape endpoint..."
SCRAPE_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST \
  -H "Content-Type: application/json" \
  -H "X-API-Key: $API_KEY" \
  -d '{"keyword":"restaurant","location":"Jakarta","kecamatan":"Menteng","max_results":3}' \
  "$API_URL/api/scrape" 2>&1)

HTTP_CODE=$(echo "$SCRAPE_RESPONSE" | tail -n1)
RESPONSE_BODY=$(echo "$SCRAPE_RESPONSE" | sed '$d')

if [ "$HTTP_CODE" = "200" ]; then
    echo "✅ Scrape endpoint working!"
    echo "$RESPONSE_BODY" | python3 -m json.tool 2>/dev/null || echo "$RESPONSE_BODY"
else
    echo "❌ Scrape endpoint failed (HTTP $HTTP_CODE)"
    echo "Response: $RESPONSE_BODY"
    exit 1
fi

echo ""
echo "==================================="
echo "All tests passed! ✅"
echo "==================================="
