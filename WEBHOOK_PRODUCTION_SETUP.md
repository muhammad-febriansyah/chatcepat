# 🚀 Meta Webhook Production Setup - ChatCepat

## 📍 URL WEBHOOK PRODUCTION

```
https://www.chatcepat.id/api/meta/webhook
```

**Verify Token:**
```
chatcepat-meta-webhook-2024
```

---

## ✅ KONFIGURASI SUDAH DIPERBAIKI

### 1. Environment Configuration

File `.env` sudah diupdate:

```env
# Application
APP_ENV=production
APP_DEBUG=false
APP_URL=https://www.chatcepat.id

# Meta Business API
META_APP_ID=2210262782822425
META_APP_SECRET=                              # ⚠️ HARUS DIISI!
META_WEBHOOK_VERIFY_TOKEN=chatcepat-meta-webhook-2024
META_OAUTH_REDIRECT_URI=https://www.chatcepat.id/meta/oauth/callback
META_GRAPH_API_VERSION=v21.0
```

**⚠️ PENTING:** Anda HARUS mengisi `META_APP_SECRET`!

### 2. Routes Configuration

Routes sudah correct di `routes/api.php`:

```php
// Meta Webhook - For WhatsApp Business API, Instagram, Facebook
Route::get('/api/meta/webhook', [MetaWebhookController::class, 'verify']);
Route::post('/api/meta/webhook', [MetaWebhookController::class, 'handle']);

// Telegram Webhook
Route::post('/telegram/webhook/{bot}', [TelegramWebhookController::class, 'handle']);
```

---

## 🔧 LANGKAH-LANGKAH SETUP DI META DEVELOPER

### Step 1: Dapatkan App Secret

1. Buka: https://developers.facebook.com/apps/2210262782822425/settings/basic/
2. Klik **"Show"** di sebelah **App secret**
3. Copy App Secret
4. Update `.env`:
   ```bash
   META_APP_SECRET=paste_app_secret_disini
   ```
5. Clear cache:
   ```bash
   php artisan config:clear
   ```

---

### Step 2: Update Webhook - WhatsApp Business

**URL:** https://developers.facebook.com/apps/2210262782822425/whatsapp-business/wa-dev-quickstart/

1. Klik **WhatsApp** di sidebar kiri
2. Klik **Configuration** atau **API Setup**
3. Di bagian **Webhooks**, klik **"Configure App"** atau **"Edit"**

**Configuration:**
```
Callback URL: https://www.chatcepat.id/api/meta/webhook
Verify Token: chatcepat-meta-webhook-2024
```

4. Klik **"Verify and Save"**

   **Expected Response:**
   - ✅ "Webhook verified successfully"
   - ✅ Green checkmark appears

5. **Subscribe to webhook fields:**
   - ✅ **messages**
   - ✅ **message_status**

6. Klik **"Save"**

---

### Step 3: Update Webhook - Instagram

**URL:** https://developers.facebook.com/apps/2210262782822425/instagram-business/API-Setup/

1. Klik **Instagram** di sidebar kiri
2. Klik **API setup with Instagram login**
3. Scroll ke **"2. Configure webhooks"**

**Configuration:**
```
Callback URL: https://www.chatcepat.id/api/meta/webhook
Verify Token: chatcepat-meta-webhook-2024
```

4. Klik **"Verify and Save"**

5. **Subscribe to webhook fields:**
   - ✅ **messages**
   - ✅ **messaging_postbacks**
   - ✅ **messaging_seen**
   - ✅ **message_reactions**

6. Klik **"Save"**

---

### Step 4: Update Webhook - Messenger

**URL:** https://developers.facebook.com/apps/2210262782822425/messenger/messenger_api_settings/

1. Klik **Messenger** di sidebar kiri
2. Klik **Messenger API Settings**
3. Scroll ke **"1. Configure webhooks"**

**Configuration:**
```
Callback URL: https://www.chatcepat.id/api/meta/webhook
Verify Token: chatcepat-meta-webhook-2024
```

4. Klik **"Verify and Save"**

5. **Subscribe to webhook fields:**
   - ✅ **messages**
   - ✅ **messaging_postbacks**
   - ✅ **messaging_optins**
   - ✅ **message_deliveries**
   - ✅ **message_reads**

6. Klik **"Save"**

---

### Step 5: Central Webhooks Page (Alternative)

**URL:** https://developers.facebook.com/apps/2210262782822425/webhooks/

Di halaman ini, Anda bisa setup semua webhooks dalam satu tempat:

1. **Select product:** Pilih product (WhatsApp/Instagram/Messenger)
2. **Callback URL:** `https://www.chatcepat.id/api/meta/webhook`
3. **Verify token:** `chatcepat-meta-webhook-2024`
4. Klik **"Verify and save"**
5. Subscribe to events
6. Klik **"Save"**

---

## 🧪 TEST WEBHOOK CONFIGURATION

### Method 1: Artisan Command (Recommended)

```bash
# Test webhook configuration
php artisan meta:test-webhook

# Test with custom URL
php artisan meta:test-webhook --url=https://www.chatcepat.id/api/meta/webhook
```

**Output yang diharapkan:**
```
╔═══════════════════════════════════════════════════════════╗
║         META WEBHOOK CONFIGURATION TEST                  ║
╚═══════════════════════════════════════════════════════════╝

📋 Configuration:
   Webhook URL: https://www.chatcepat.id/api/meta/webhook
   Verify Token: chatcepat-meta-webhook-2024

1️⃣  Testing webhook URL accessibility...
   ✓ URL is accessible (Status: 200)

2️⃣  Testing webhook verification (GET)...
   ✓ Webhook verification successful
     → Verify token is correct
     → Challenge response is correct

3️⃣  Checking SSL certificate...
   ✓ SSL certificate is valid
     → HTTPS connection successful

✅ Test completed!
```

### Method 2: Manual Testing dengan cURL

**Test GET (Verification):**
```bash
curl -X GET "https://www.chatcepat.id/api/meta/webhook?hub.mode=subscribe&hub.verify_token=chatcepat-meta-webhook-2024&hub.challenge=test123"
```

**Expected response:**
```
test123
```

**Test POST (Receive event):**
```bash
curl -X POST https://www.chatcepat.id/api/meta/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "object": "whatsapp_business_account",
    "entry": [{
      "id": "test",
      "changes": [{
        "value": {
          "messaging_product": "whatsapp",
          "metadata": {
            "display_phone_number": "1234567890",
            "phone_number_id": "test"
          },
          "messages": [{
            "from": "628123456789",
            "id": "test",
            "timestamp": "1234567890",
            "text": {
              "body": "Test message"
            },
            "type": "text"
          }]
        },
        "field": "messages"
      }]
    }]
  }'
```

### Method 3: Test di Meta Developer Dashboard

1. Buka Webhooks page
2. Di bagian **Webhook fields**, klik **"Test"** di sebelah field yang sudah di-subscribe
3. Meta akan send test event ke webhook Anda
4. Check Laravel logs untuk verify event diterima:
   ```bash
   tail -f storage/logs/laravel.log
   ```

---

## 🔒 SECURITY CHECKLIST

### SSL Certificate

- ✅ Domain harus menggunakan HTTPS
- ✅ SSL certificate harus valid
- ✅ Certificate tidak expired
- ✅ Certificate dari trusted CA (Let's Encrypt, DigiCert, dll)

**Check SSL:**
```bash
curl -I https://www.chatcepat.id/api/meta/webhook
```

### Webhook Security

File `app/Http/Controllers/Api/MetaWebhookController.php` sudah implement:

1. **Signature Verification** (X-Hub-Signature-256)
2. **Verify Token Validation**
3. **Request Logging**

**Jangan disable security features ini!**

---

## 📝 UPDATE FACEBOOK LOGIN OAUTH REDIRECT

Untuk fitur OAuth (user connect accounts mereka), update di Meta Developer:

**URL:** https://developers.facebook.com/apps/2210262782822425/business-login/settings/

Di **"Valid OAuth Redirect URIs"**, tambahkan:
```
https://www.chatcepat.id/meta/oauth/callback
```

Klik **"Save Changes"**

---

## 🚨 TROUBLESHOOTING

### ❌ "Callback URL verification failed"

**Possible causes:**
1. Verify token salah
2. SSL certificate issue
3. Server tidak accessible dari internet
4. Firewall blocking Meta IPs

**Fix:**
```bash
# 1. Check verify token
php artisan tinker --execute="echo config('services.meta.webhook_verify_token');"

# 2. Test webhook
php artisan meta:test-webhook

# 3. Check SSL
curl -I https://www.chatcepat.id/api/meta/webhook

# 4. Check logs
tail -f storage/logs/laravel.log
```

### ❌ "Webhook not receiving events"

**Possible causes:**
1. Webhook tidak di-subscribe ke events yang benar
2. App mode masih Development (rate limited)
3. Server error (500)

**Fix:**
1. Check webhook subscriptions di Meta Dashboard
2. Check Laravel logs: `storage/logs/laravel.log`
3. Test dengan "Test" button di Meta Webhooks page
4. Check server status: `php artisan up`

### ❌ "Invalid signature"

**Possible causes:**
1. APP_SECRET salah
2. Request body modified/corrupted

**Fix:**
```bash
# Verify APP_SECRET
php artisan tinker --execute="echo config('services.meta.app_secret');"

# Check webhook handler
tail -f storage/logs/laravel.log | grep "Invalid webhook signature"
```

---

## 📊 MONITORING

### Log Webhook Events

All webhook events logged to `storage/logs/laravel.log`:

```bash
# Watch logs in real-time
tail -f storage/logs/laravel.log

# Filter Meta webhook logs
tail -f storage/logs/laravel.log | grep "Meta Webhook"

# Check last 100 lines
tail -100 storage/logs/laravel.log
```

### Monitor Webhook Health

```bash
# Check webhook status
php artisan meta:test-webhook

# Check Meta configuration
php artisan meta:check-config --test
```

### Setup Alerts (Recommended for Production)

**Option 1: Log Management Service**
- Logtail (https://logtail.com/)
- Papertrail (https://papertrailapp.com/)
- Sentry (https://sentry.io/)

**Option 2: Custom Monitoring**
Create monitoring endpoint:
```php
Route::get('/api/health/webhook', function () {
    return response()->json([
        'webhook_url' => config('app.url') . '/api/meta/webhook',
        'verify_token_set' => !empty(config('services.meta.webhook_verify_token')),
        'app_secret_set' => !empty(config('services.meta.app_secret')),
        'ssl_enabled' => str_starts_with(config('app.url'), 'https'),
    ]);
});
```

---

## 🎯 PRODUCTION CHECKLIST

### Before Going Live:

- [ ] `APP_ENV=production` ✓
- [ ] `APP_DEBUG=false` ✓
- [ ] `APP_URL=https://www.chatcepat.id` ✓
- [ ] `META_APP_SECRET` filled in `.env`
- [ ] SSL certificate valid
- [ ] Webhooks configured in Meta Dashboard:
  - [ ] WhatsApp webhook
  - [ ] Instagram webhook
  - [ ] Messenger webhook
- [ ] Webhook subscriptions correct
- [ ] OAuth redirect URI added
- [ ] Tested with `php artisan meta:test-webhook`
- [ ] Business Verification completed (for Meta)
- [ ] App Review submitted (if needed)

### After Setup:

- [ ] Send test message to WhatsApp
- [ ] Send test DM to Instagram
- [ ] Send test message to Messenger
- [ ] Check logs for webhook events
- [ ] Verify auto-reply working (if enabled)
- [ ] Monitor for 24 hours
- [ ] Setup error alerting

---

## 📞 SUPPORT

### Meta Developer Support:
- Developer Community: https://developers.facebook.com/community/
- Bug Reports: https://developers.facebook.com/support/bugs/

### Check App Status:
- Meta Platform Status: https://developers.facebook.com/status/

### Laravel Logs:
```bash
tail -f storage/logs/laravel.log
```

---

## 📚 RELATED COMMANDS

```bash
# Test webhook
php artisan meta:test-webhook

# Check Meta configuration
php artisan meta:check-config

# Check Meta configuration with API test
php artisan meta:check-config --test

# Clear caches
php artisan config:clear
php artisan cache:clear

# View routes
php artisan route:list --path=webhook

# Check logs
tail -f storage/logs/laravel.log
```

---

## 📖 DOCUMENTATION REFERENCES

- [SETUP_META_SAAS_COMPLETE.md](SETUP_META_SAAS_COMPLETE.md) - Complete SaaS setup guide
- [SETUP_META_WHATSAPP.md](SETUP_META_WHATSAPP.md) - WhatsApp specific setup
- [SETUP_META_INSTAGRAM.md](SETUP_META_INSTAGRAM.md) - Instagram specific setup
- [SETUP_META_MESSENGER.md](SETUP_META_MESSENGER.md) - Messenger specific setup
- [WEBHOOK_ROUTES_DOCUMENTATION.md](WEBHOOK_ROUTES_DOCUMENTATION.md) - Webhook technical docs

---

**Last Updated**: 2026-01-28
**Production URL**: https://www.chatcepat.id/
**Webhook URL**: https://www.chatcepat.id/api/meta/webhook
**Verify Token**: chatcepat-meta-webhook-2024
