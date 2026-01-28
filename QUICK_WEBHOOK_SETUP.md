# ⚡ Quick Setup: Update Webhook ke Production

## 🎯 URL WEBHOOK BARU

```
https://www.chatcepat.id/api/meta/webhook
```

**Verify Token:**
```
chatcepat-meta-webhook-2024
```

---

## ✅ YANG SUDAH SAYA LAKUKAN

1. ✅ Update `APP_URL` → `https://www.chatcepat.id`
2. ✅ Update `APP_ENV` → `production`
3. ✅ Update `APP_DEBUG` → `false`
4. ✅ Tambah `META_OAUTH_REDIRECT_URI`
5. ✅ Clear config cache

---

## 🚀 YANG HARUS ANDA LAKUKAN SEKARANG

### 1. Isi App Secret (WAJIB!)

```bash
# 1. Buka Meta Developer
# https://developers.facebook.com/apps/2210262782822425/settings/basic/

# 2. Copy App Secret (klik "Show")

# 3. Edit .env, isi:
META_APP_SECRET=paste_app_secret_disini

# 4. Clear cache
php artisan config:clear
```

---

### 2. Update Webhook di Meta Developer

Buka setiap product dan update webhook:

#### **A. WhatsApp**
https://developers.facebook.com/apps/2210262782822425/whatsapp-business/wa-dev-quickstart/

**Langkah:**
1. Klik **WhatsApp** → **Configuration**
2. Di **Webhooks**, klik **"Edit"**
3. Isi:
   - **Callback URL:** `https://www.chatcepat.id/api/meta/webhook`
   - **Verify Token:** `chatcepat-meta-webhook-2024`
4. Klik **"Verify and Save"**
5. Subscribe: ✅ messages, ✅ message_status
6. **Save**

#### **B. Instagram**
https://developers.facebook.com/apps/2210262782822425/instagram-business/API-Setup/

**Langkah:**
1. Klik **Instagram** → **API Setup**
2. Scroll ke **"Configure webhooks"**
3. Isi:
   - **Callback URL:** `https://www.chatcepat.id/api/meta/webhook`
   - **Verify Token:** `chatcepat-meta-webhook-2024`
4. Klik **"Verify and Save"**
5. Subscribe: ✅ messages, ✅ messaging_postbacks
6. **Save**

#### **C. Messenger**
https://developers.facebook.com/apps/2210262782822425/messenger/messenger_api_settings/

**Langkah:**
1. Klik **Messenger** → **Messenger API Settings**
2. Di **Webhooks**, klik **"Edit"**
3. Isi:
   - **Callback URL:** `https://www.chatcepat.id/api/meta/webhook`
   - **Verify Token:** `chatcepat-meta-webhook-2024`
4. Klik **"Verify and Save"**
5. Subscribe: ✅ messages, ✅ messaging_postbacks
6. **Save**

---

### 3. Update OAuth Redirect URI

https://developers.facebook.com/apps/2210262782822425/business-login/settings/

**Langkah:**
1. Di **Valid OAuth Redirect URIs**, tambahkan:
   ```
   https://www.chatcepat.id/meta/oauth/callback
   ```
2. Klik **"Save Changes"**

---

### 4. Test Webhook

```bash
# Test webhook configuration
php artisan meta:test-webhook
```

**Expected output:**
```
✓ URL is accessible
✓ Webhook verification successful
✓ SSL certificate is valid
```

**Jika ada error:**
- Check SSL certificate
- Check server accessible dari internet
- Check verify token correct

---

## 🎉 SELESAI!

Webhook sudah siap untuk production!

**Next steps:**
1. Send test message ke WhatsApp/Instagram/Messenger
2. Check logs: `tail -f storage/logs/laravel.log`
3. Verify webhook events diterima

---

## 📚 DOKUMENTASI LENGKAP

- `WEBHOOK_PRODUCTION_SETUP.md` - Setup lengkap dengan troubleshooting
- `SETUP_META_SAAS_COMPLETE.md` - Complete SaaS guide
- `WEBHOOK_ROUTES_DOCUMENTATION.md` - Technical documentation

---

## 🆘 JIKA ADA MASALAH

```bash
# Test webhook
php artisan meta:test-webhook

# Check configuration
php artisan meta:check-config --test

# Check logs
tail -f storage/logs/laravel.log
```

**Support:**
- Meta Developer Community: https://developers.facebook.com/community/
- Check `WEBHOOK_PRODUCTION_SETUP.md` untuk troubleshooting lengkap
