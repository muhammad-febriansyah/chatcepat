# 🚀 Meta Business API - Quick Start Guide

## ⚡ LANGKAH CEPAT (15 Menit Setup)

### 1. Dapatkan App Secret dari Meta Developer

1. Buka: https://developers.facebook.com/apps/2210262782822425/settings/basic/
2. Klik **Show** di sebelah **App secret**
3. Copy App Secret
4. Paste ke `.env`:
   ```env
   META_APP_SECRET=paste_app_secret_disini
   ```

### 2. Setup Webhook

#### A. Development (Local Testing):
```bash
# Install ngrok
brew install ngrok  # Mac
# atau download dari https://ngrok.com/

# Jalankan ngrok
ngrok http 8000

# Copy URL (contoh: https://abc123.ngrok.io)
```

#### B. Update Meta Developer:
1. Buka: https://developers.facebook.com/apps/2210262782822425/webhooks/
2. **Callback URL**: `https://abc123.ngrok.io/api/meta/webhook`
3. **Verify Token**: `chatcepat-meta-webhook-2024`
4. Klik **Verify and Save**

#### C. Subscribe to Events:

**WhatsApp:**
1. Klik **WhatsApp** → **Configuration** → **Webhooks**
2. Subscribe: ✅ messages, ✅ message_status

**Instagram:**
1. Klik **Instagram** → **Configuration** → **Webhooks**
2. Subscribe: ✅ messages, ✅ messaging_postbacks

**Messenger:**
1. Klik **Messenger** → **Settings** → **Webhooks**
2. Subscribe: ✅ messages, ✅ messaging_postbacks

### 3. Generate Access Token (untuk Testing)

#### WhatsApp Test Token:
1. Klik **WhatsApp** → **API Setup**
2. Copy **Temporary access token**
3. Paste ke `.env`:
   ```env
   META_ACCESS_TOKEN=paste_token_disini
   ```
4. Copy **Phone Number ID**:
   ```env
   META_WHATSAPP_PHONE_NUMBER_ID=paste_phone_id_disini
   ```

### 4. Test Konfigurasi

```bash
# Check configuration
php artisan meta:check-config

# Test API connection
php artisan meta:check-config --test
```

### 5. Test Send Message

```bash
php artisan tinker
```

```php
// Test WhatsApp
$response = Http::post('https://graph.facebook.com/v21.0/' . env('META_WHATSAPP_PHONE_NUMBER_ID') . '/messages', [
    'messaging_product' => 'whatsapp',
    'to' => '6281234567890', // Ganti dengan nomor test Anda
    'type' => 'text',
    'text' => [
        'body' => 'Hello from ChatCepat! 🚀'
    ]
], [
    'Authorization' => 'Bearer ' . env('META_ACCESS_TOKEN'),
    'Content-Type' => 'application/json',
]);

dd($response->json());
```

---

## 📋 CHECKLIST MINIMAL untuk Development

- [x] App ID sudah ada (2210262782822425) ✓
- [ ] App Secret → tambahkan ke `.env`
- [ ] Webhook setup (pakai ngrok untuk local)
- [ ] Subscribe webhook events
- [ ] Test token untuk WhatsApp/Instagram/Messenger
- [ ] Test send message

---

## 🎯 UNTUK PRODUCTION (Nanti)

Ini yang perlu dilakukan sebelum launch:

### Must Have:
1. **Business Verification** di Meta Business Suite
2. **App Review** untuk permissions
3. **Privacy Policy** & **Terms of Service**
4. **System User Token** (never expire)
5. **Production domain** dengan SSL

### Nice to Have:
1. OAuth flow untuk user connect account mereka
2. Multi-tenant architecture
3. Monitoring & error tracking

---

## 🔑 ENV VARIABLES LENGKAP

Copy ke `.env` Anda:

```env
# ============================================
# META BUSINESS API (Required)
# ============================================
META_APP_ID=2210262782822425
META_APP_SECRET=
META_WEBHOOK_VERIFY_TOKEN=chatcepat-meta-webhook-2024

# For Development Testing (Optional)
META_ACCESS_TOKEN=
META_WHATSAPP_PHONE_NUMBER_ID=
META_WHATSAPP_BUSINESS_ACCOUNT_ID=
META_INSTAGRAM_ACCOUNT_ID=
META_FACEBOOK_PAGE_ID=
META_FACEBOOK_PAGE_ACCESS_TOKEN=

# OAuth (untuk Production SaaS)
META_OAUTH_REDIRECT_URI=${APP_URL}/meta/oauth/callback
META_GRAPH_API_VERSION=v21.0
```

---

## 📚 NEXT STEPS

Setelah setup basic:

1. **Baca dokumentasi lengkap:**
   - `SETUP_META_SAAS_COMPLETE.md` - Overview & architecture
   - `SETUP_META_WHATSAPP.md` - WhatsApp setup detail
   - `SETUP_META_INSTAGRAM.md` - Instagram setup detail
   - `SETUP_META_MESSENGER.md` - Messenger setup detail

2. **Test semua products:**
   - WhatsApp send/receive
   - Instagram DM
   - Messenger chat

3. **Implement OAuth** (untuk multi-tenant SaaS)

4. **Submit App Review** (untuk production)

---

## ❓ TROUBLESHOOTING CEPAT

### "Webhook verification failed"
→ Check verify token: `chatcepat-meta-webhook-2024`

### "Invalid access token"
→ Token expired, generate new token

### "Message not sent"
→ Check phone number format: +628xxx (pakai kode negara)

### "Webhook not receiving events"
→ Check ngrok masih running & URL benar

---

## 🆘 BUTUH BANTUAN?

Run command check:
```bash
php artisan meta:check-config --test
```

Check logs:
```bash
tail -f storage/logs/laravel.log
```

Meta Error Logs:
https://developers.facebook.com/apps/2210262782822425/dashboard/errors/

---

**Happy coding! 🎉**
