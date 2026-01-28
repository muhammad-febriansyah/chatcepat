# ✅ Setup Webhook Meta Developer - YANG BENAR

## 🎯 PENTING: .env LOKAL TETAP DEVELOPMENT

**.env lokal Anda TIDAK PERLU DIUBAH!**

File `.env` lokal tetap:
```env
APP_ENV=local
APP_DEBUG=true
APP_URL=http://127.0.0.1:8000
```

---

## 📍 YANG PERLU DIKONFIGURASI

**Hanya update di Meta Developer Dashboard menggunakan URL production:**

### Webhook URL Production:
```
https://www.chatcepat.id/api/meta/webhook
```

### Verify Token:
```
chatcepat-meta-webhook-2024
```

---

## 🔧 SETUP DI META DEVELOPER DASHBOARD

### 1. WhatsApp

**URL:** https://developers.facebook.com/apps/2210262782822425/whatsapp-business/wa-dev-quickstart/

**Langkah:**
1. Klik **WhatsApp** → **Configuration**
2. Di bagian **Webhooks**, klik **"Edit"**
3. Isi form:
   - **Callback URL:** `https://www.chatcepat.id/api/meta/webhook`
   - **Verify Token:** `chatcepat-meta-webhook-2024`
4. Klik **"Verify and Save"**
5. Subscribe to events:
   - ✅ **messages**
   - ✅ **message_status**
6. Klik **"Save"**

---

### 2. Instagram

**URL:** https://developers.facebook.com/apps/2210262782822425/instagram-business/API-Setup/

**Langkah:**
1. Klik **Instagram** → **API Setup**
2. Scroll ke **"2. Configure webhooks"**
3. Isi form:
   - **Callback URL:** `https://www.chatcepat.id/api/meta/webhook`
   - **Verify Token:** `chatcepat-meta-webhook-2024`
4. Klik **"Verify and Save"**
5. Subscribe to events:
   - ✅ **messages**
   - ✅ **messaging_postbacks**
   - ✅ **messaging_seen**
6. Klik **"Save"**

---

### 3. Messenger

**URL:** https://developers.facebook.com/apps/2210262782822425/messenger/messenger_api_settings/

**Langkah:**
1. Klik **Messenger** → **Messenger API Settings**
2. Di bagian **"1. Configure webhooks"**, klik **"Edit"**
3. Isi form:
   - **Callback URL:** `https://www.chatcepat.id/api/meta/webhook`
   - **Verify Token:** `chatcepat-meta-webhook-2024`
4. Klik **"Verify and Save"**
5. Subscribe to events:
   - ✅ **messages**
   - ✅ **messaging_postbacks**
   - ✅ **messaging_optins**
   - ✅ **message_deliveries**
   - ✅ **message_reads**
6. Klik **"Save"**

---

### 4. OAuth Redirect URI (Facebook Login)

**URL:** https://developers.facebook.com/apps/2210262782822425/business-login/settings/

**Langkah:**
1. Di **"Valid OAuth Redirect URIs"**, tambahkan:
   ```
   https://www.chatcepat.id/meta/oauth/callback
   ```
2. Klik **"Save Changes"**

---

## ⚠️ YANG MASIH PERLU DIISI DI .env

**Hanya 1 yang wajib:**

```env
# Di .env lokal Anda, isi:
META_APP_SECRET=your_app_secret_here
```

**Cara dapatkan:**
1. Buka: https://developers.facebook.com/apps/2210262782822425/settings/basic/
2. Klik **"Show"** di sebelah **App secret**
3. Copy dan paste ke `.env`

---

## 📋 CHECKLIST

Setup di Meta Developer:
- [ ] WhatsApp webhook → `https://www.chatcepat.id/api/meta/webhook`
- [ ] Instagram webhook → `https://www.chatcepat.id/api/meta/webhook`
- [ ] Messenger webhook → `https://www.chatcepat.id/api/meta/webhook`
- [ ] OAuth redirect URI → `https://www.chatcepat.id/meta/oauth/callback`
- [ ] All verify tokens → `chatcepat-meta-webhook-2024`
- [ ] Subscribe to events (messages, etc.)

Di .env lokal:
- [ ] `META_APP_SECRET` filled

---

## 🎯 RINGKASAN

**Di Meta Developer Dashboard:**
- Gunakan URL production: `https://www.chatcepat.id/api/meta/webhook`
- Verify token: `chatcepat-meta-webhook-2024`

**Di .env lokal Anda:**
- Tetap development mode
- Hanya isi `META_APP_SECRET`

**Di production server:**
- Server production punya .env sendiri dengan `APP_URL=https://www.chatcepat.id`
- Webhook akan hit ke production server, bukan local

---

## ✅ DONE!

Setelah setup di Meta Developer Dashboard, webhook akan:
- Receive events di production server (`https://www.chatcepat.id`)
- .env lokal tetap untuk development
- Test lokal pakai ngrok (opsional)

---

**Maaf untuk kebingungan tadi! 🙏**
