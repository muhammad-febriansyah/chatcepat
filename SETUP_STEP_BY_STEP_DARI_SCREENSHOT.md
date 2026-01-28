# 🚀 Setup Meta Apps - Step by Step (Berdasarkan Screenshot Anda)

## 📋 OVERVIEW

Dari screenshot, saya lihat:
- ✅ App ID: 2210262782822425
- ✅ Products: Messenger, Instagram, WhatsApp sudah ditambahkan
- 🔴 App Mode: **Development** (perlu switch ke Live nanti)
- ⚠️ Webhooks belum dikonfigurasi dengan benar
- ⚠️ WhatsApp: Missing payment method (normal untuk development)

---

## 1️⃣ MESSENGER SETUP

### Screenshot 1: Messenger API Settings

#### A. Configure Webhooks

**Di halaman: Messenger → Messenger API Settings**

1. **Callback URL:**
   ```
   https://yourdomain.com/api/meta/webhook
   ```

   **ATAU untuk development (pakai ngrok):**
   ```bash
   # Install ngrok
   brew install ngrok  # Mac

   # Jalankan ngrok
   ngrok http 8000

   # Copy URL yang muncul, contoh:
   # https://abc123.ngrok.io/api/meta/webhook
   ```

2. **Verify Token:**
   ```
   chatcepat-meta-webhook-2024
   ```

   **⚠️ PENTING:** Ini harus sama dengan yang di `.env`:
   ```env
   META_WEBHOOK_VERIFY_TOKEN=chatcepat-meta-webhook-2024
   ```

3. Klik **"Verify and Save"**

4. **Subscribe to webhook fields:**
   Scroll ke bawah, centang:
   - ✅ **messages**
   - ✅ **messaging_postbacks**
   - ✅ **messaging_optins**
   - ✅ **message_deliveries**
   - ✅ **message_reads**

5. Klik **Save**

#### B. Generate Access Tokens (Step 2 di screenshot)

1. Klik **"Generate access tokens"**
2. Pilih **Facebook Page** yang ingin digunakan
3. Login dan authorize
4. Copy **Page Access Token** yang muncul
5. **JANGAN simpan di `.env`** (ini untuk admin testing saja)

   **Untuk SaaS:** User akan connect page mereka sendiri via OAuth

---

## 2️⃣ INSTAGRAM SETUP

### Screenshot 2: Instagram API Setup

#### A. Generate Access Tokens (Step 1)

1. Klik tombol **"Add account"**
2. Login dengan akun Facebook yang linked ke Instagram Business
3. Pilih **Instagram Business Account** yang ingin digunakan
4. Authorize permissions:
   - ✅ instagram_basic
   - ✅ instagram_manage_messages
   - ✅ pages_show_list
5. Copy **Access Token** yang dihasilkan
6. Copy **Instagram Account ID**

#### B. Configure Webhooks (Step 2)

**⚠️ IMPORTANT:** Screenshot menunjukkan "To receive webhooks, app mode should be set to 'Live'"

Untuk **Development Mode**, webhook tetap bisa disetup tapi dengan batasan:

1. **Callback URL:**
   ```
   https://yourdomain.com/api/meta/webhook
   ```

   **ATAU ngrok untuk local:**
   ```
   https://abc123.ngrok.io/api/meta/webhook
   ```

2. **Verify token:**
   ```
   chatcepat-meta-webhook-2024
   ```

3. Klik **"Verify and save"**

4. **Subscribe to webhook events:**
   - ✅ **messages**
   - ✅ **messaging_postbacks**
   - ✅ **message_reactions**
   - ✅ **messaging_seen**

---

## 3️⃣ WHATSAPP SETUP

### Screenshot 3: WhatsApp Business Platform - Quickstart

#### A. Missing Valid Payment Method (Warning)

**⚠️ Ini NORMAL untuk Development Mode!**

Pesan: "Free tier conversations can only be initiated by your customers."

**Artinya:**
- Anda hanya bisa **reply** messages dari customer
- **Tidak bisa initiate** conversation pertama
- Untuk production (unlimited messaging), perlu:
  1. Business Verification
  2. Payment method
  3. App Review

**Untuk Development/Testing:**
- Ignore warning ini dulu
- Gunakan test number untuk send message pertama ke app Anda
- Lalu app bisa reply (24 jam window)

#### B. Configure Where You Left Off

Klik tombol **"Configure App"**

1. Di halaman **Configuration**, setup:

   **Callback URL:**
   ```
   https://yourdomain.com/api/meta/webhook
   ```

   **Verify Token:**
   ```
   chatcepat-meta-webhook-2024
   ```

2. Klik **Verify and Save**

3. **Subscribe to webhook fields:**
   - ✅ **messages**
   - ✅ **message_status**

#### C. Get Phone Number ID & Business Account ID

Di halaman **WhatsApp → API Setup**:

1. **Test Number** (untuk development):
   - Anda akan lihat "Send and receive messages using a test number"
   - Copy **Phone Number ID** (contoh: 123456789012345)
   - Copy **WhatsApp Business Account ID**

2. **Temporary Access Token:**
   - Di section "Send and receive messages"
   - Copy **Temporary access token** (valid 24 jam)
   - Gunakan untuk testing

3. **Simpan di `.env` (untuk testing):**
   ```env
   META_WHATSAPP_PHONE_NUMBER_ID=paste_phone_id_disini
   META_WHATSAPP_BUSINESS_ACCOUNT_ID=paste_business_account_id_disini
   META_ACCESS_TOKEN=paste_temporary_token_disini
   ```

---

## 4️⃣ WEBHOOKS CENTRAL SETUP

### Screenshot 4: Webhooks Dashboard

**Saya lihat di screenshot sudah ada Callback URL:**
```
https://app.chatcepat.id/api-app/waba/callback-url/e06243fb-e6e3-43fe-9fde-9c724b74e436
```

**⚠️ INI BUKAN URL YANG BENAR UNTUK SISTEM ANDA!**

**URL yang HARUS digunakan:**
```
https://yourdomain.com/api/meta/webhook
```

**Atau untuk development:**
```
https://abc123.ngrok.io/api/meta/webhook
```

### Langkah-langkah:

1. **Select product:** Pilih product yang ingin di-setup (WhatsApp/Instagram/Messenger)

2. **Configure a webhook:**

   **Callback URL:** Ubah ke URL yang benar:
   ```
   https://yourdomain.com/api/meta/webhook
   ```

   **Verify token:**
   ```
   chatcepat-meta-webhook-2024
   ```

3. **Webhook fields:** Subscribe ke fields yang diperlukan

4. Klik **"Verify and save"**

5. **Test webhook:**
   - Scroll ke bawah
   - Klik tombol **"Test"** di samping field yang di-subscribe
   - Check Laravel logs untuk memastikan webhook diterima

---

## 5️⃣ FACEBOOK LOGIN FOR BUSINESS

### Screenshot 5: Facebook Login Settings

**⚠️ Warning:** "Facebook Login for Business requires advanced access"

### Langkah-langkah:

#### A. Client OAuth Settings

**Yang sudah correct:**
- ✅ Client OAuth login: **Yes** (enabled)
- ✅ Web OAuth login: **Yes** (enabled)
- ✅ Enforce HTTPS: **Yes** (recommended)

**Yang perlu disetup:**
- Redirect URI Validator

#### B. Add Valid OAuth Redirect URIs

1. Klik **"Settings"** di sidebar kiri
2. Scroll ke **"Client OAuth Settings"**
3. Di **"Valid OAuth Redirect URIs"**, tambahkan:
   ```
   https://yourdomain.com/meta/oauth/callback
   ```

   **Untuk development:**
   ```
   http://localhost:8000/meta/oauth/callback
   https://abc123.ngrok.io/meta/oauth/callback
   ```

4. Klik **Save Changes**

#### C. Get Advanced Access (Untuk Production)

Untuk production, Anda perlu request advanced access:

1. Klik **"Get Advanced Access"** di warning
2. Request permissions:
   - ✅ **public_profile**
   - ✅ **email**
3. Submit for App Review (nanti, setelah development selesai)

**Untuk Development:**
- Standard access sudah cukup untuk testing
- Bisa test dengan test users atau developer accounts

---

## 🔧 UPDATE .ENV FILE

Setelah semua setup, update `.env`:

```env
# ============================================
# META BUSINESS API CONFIGURATION
# ============================================

# App Credentials (dari Basic Settings)
META_APP_ID=2210262782822425
META_APP_SECRET=YOUR_APP_SECRET_HERE

# Webhook Configuration
META_WEBHOOK_VERIFY_TOKEN=chatcepat-meta-webhook-2024

# OAuth Redirect (untuk user connect accounts)
META_OAUTH_REDIRECT_URI=${APP_URL}/meta/oauth/callback

# For Development Testing (Optional)
META_ACCESS_TOKEN=YOUR_TEMPORARY_TOKEN_HERE
META_WHATSAPP_PHONE_NUMBER_ID=YOUR_PHONE_NUMBER_ID
META_WHATSAPP_BUSINESS_ACCOUNT_ID=YOUR_BUSINESS_ACCOUNT_ID
```

---

## 📝 DAPATKAN APP SECRET

**PENTING:** Anda belum mengisi `META_APP_SECRET`

### Cara dapatkan:

1. Di Meta Developer Dashboard
2. Klik **"App settings"** → **"Basic"** (sidebar kiri)
3. Scroll ke **"App secret"**
4. Klik **"Show"**
5. Masukkan password Facebook Anda
6. Copy App Secret
7. Paste ke `.env`:
   ```env
   META_APP_SECRET=paste_disini
   ```

**⚠️ JANGAN SHARE APP SECRET ke siapapun!**

---

## ✅ CHECKLIST SETUP

### Messenger:
- [ ] Webhook callback URL configured
- [ ] Verify token set: `chatcepat-meta-webhook-2024`
- [ ] Webhook verified (GET request success)
- [ ] Subscribed to: messages, messaging_postbacks
- [ ] Page connected (optional untuk testing)

### Instagram:
- [ ] Instagram account added
- [ ] Access token generated
- [ ] Webhook callback URL configured
- [ ] Verify token set
- [ ] Webhook verified
- [ ] Subscribed to: messages, messaging_postbacks

### WhatsApp:
- [ ] Webhook callback URL configured
- [ ] Verify token set
- [ ] Phone Number ID copied
- [ ] Business Account ID copied
- [ ] Temporary access token copied (untuk testing)
- [ ] Subscribed to: messages, message_status
- [ ] Test number added (untuk receive messages)

### General:
- [ ] APP_SECRET added to `.env`
- [ ] Webhook verify token sama di `.env` dan Meta Dashboard
- [ ] Valid OAuth redirect URIs added

---

## 🧪 TEST SETUP

### 1. Test Webhook Verification

```bash
# Start Laravel
php artisan serve

# Start ngrok (terminal baru)
ngrok http 8000

# Copy ngrok URL dan update di Meta Developer
# URL: https://abc123.ngrok.io/api/meta/webhook

# Verify webhook di Meta Dashboard
# Should see success message
```

### 2. Test Configuration

```bash
# Check config
php artisan meta:check-config

# Test API connection (dengan token)
php artisan meta:check-config --test
```

### 3. Test Send Message (WhatsApp)

```bash
php artisan tinker
```

```php
// Test send WhatsApp message
$response = Http::withToken(env('META_ACCESS_TOKEN'))
    ->post('https://graph.facebook.com/v21.0/' . env('META_WHATSAPP_PHONE_NUMBER_ID') . '/messages', [
        'messaging_product' => 'whatsapp',
        'to' => '6281234567890', // Ganti dengan test number Anda
        'type' => 'text',
        'text' => [
            'body' => 'Hello from ChatCepat! 🚀'
        ]
    ]);

dd($response->json());
```

### 4. Test Receive Message

1. Send message ke WhatsApp test number dari HP Anda
2. Check Laravel logs:
   ```bash
   tail -f storage/logs/laravel.log
   ```
3. Should see webhook received log

---

## 🚨 COMMON ISSUES & FIXES

### 1. "Callback URL verification failed"

**Fix:**
- Pastikan verify token **SAMA PERSIS**: `chatcepat-meta-webhook-2024`
- Check URL accessible (ngrok running)
- Check Laravel logs untuk error

### 2. "Invalid App Secret"

**Fix:**
- Double-check App Secret di Basic Settings
- Copy ulang dengan benar
- Pastikan tidak ada spasi/enter di `.env`

### 3. "Webhook not receiving events"

**Fix:**
- Check webhook subscriptions (messages, etc.)
- Verify ngrok still running
- Check Laravel logs
- Test webhook dengan "Test" button di Meta Dashboard

### 4. "To receive webhooks, app mode should be set to 'Live'"

**Untuk Development:**
- Ignore warning ini
- Webhook tetap akan work di Development mode
- Hanya ada rate limits

**Untuk Production:**
- Complete Business Verification
- Submit App Review
- Switch to Live mode

---

## 📞 NEXT STEPS

Setelah setup complete:

1. **Test semua products** (WhatsApp, Instagram, Messenger)
2. **Implement OAuth flow** untuk user connect accounts mereka
3. **Setup monitoring** (error tracking, webhook delivery)
4. **Prepare for App Review:**
   - Business Verification
   - Privacy Policy
   - Terms of Service
   - Demo video
5. **Submit untuk review**
6. **Switch to Live mode**
7. **Launch! 🚀**

---

## 📚 RESOURCES

- **Meta Developer Dashboard:** https://developers.facebook.com/apps/2210262782822425/
- **Graph API Explorer:** https://developers.facebook.com/tools/explorer/
- **Webhook Testing:** Use "Test" button di Meta Webhooks page
- **Documentation:** See SETUP_META_SAAS_COMPLETE.md

---

**Good luck! 🎉**
