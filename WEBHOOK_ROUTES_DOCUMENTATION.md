# 📡 DOKUMENTASI WEBHOOK ROUTES - ChatCepat

## 🗺️ Daftar Semua Webhook Routes

ChatCepat memiliki **2 webhook utama** untuk menerima events dari platform eksternal.

---

## 1️⃣ META WEBHOOK (WhatsApp Business API, Instagram, Facebook Messenger)

### 📍 Routes:

#### **GET** `/api/meta/webhook`
- **Purpose**: Webhook verification dari Meta
- **Route Name**: `api.meta.webhook.verify`
- **Controller**: `App\Http\Controllers\Api\MetaWebhookController@verify`
- **Middleware**: None (public endpoint)
- **Auth**: Menggunakan verify token

**Parameters:**
```
?hub.mode=subscribe
&hub.verify_token=chatcepat-meta-webhook-2024
&hub.challenge=1234567890
```

**Response:**
```
200 OK
{challenge_value}
```

**Digunakan untuk:**
- Meta melakukan verification saat setup webhook pertama kali
- Meta periodic verification untuk memastikan webhook masih aktif

---

#### **POST** `/api/meta/webhook`
- **Purpose**: Menerima events dari Meta (messages, status updates, dll)
- **Route Name**: `api.meta.webhook.handle`
- **Controller**: `App\Http\Controllers\Api\MetaWebhookController@handle`
- **Middleware**: None (public endpoint)
- **Auth**: Signature verification (X-Hub-Signature-256 header)

**Headers:**
```
X-Hub-Signature-256: sha256={signature}
Content-Type: application/json
```

**Payload Examples:**

**WhatsApp Message Received:**
```json
{
  "object": "whatsapp_business_account",
  "entry": [{
    "id": "WHATSAPP_BUSINESS_ACCOUNT_ID",
    "changes": [{
      "value": {
        "messaging_product": "whatsapp",
        "metadata": {
          "display_phone_number": "1234567890",
          "phone_number_id": "PHONE_NUMBER_ID"
        },
        "contacts": [{
          "profile": {
            "name": "John Doe"
          },
          "wa_id": "6281234567890"
        }],
        "messages": [{
          "from": "6281234567890",
          "id": "wamid.xxx",
          "timestamp": "1234567890",
          "text": {
            "body": "Hello"
          },
          "type": "text"
        }]
      },
      "field": "messages"
    }]
  }]
}
```

**Instagram DM Received:**
```json
{
  "object": "instagram",
  "entry": [{
    "id": "INSTAGRAM_ACCOUNT_ID",
    "time": 1234567890,
    "messaging": [{
      "sender": {
        "id": "USER_INSTAGRAM_ID"
      },
      "recipient": {
        "id": "PAGE_INSTAGRAM_ID"
      },
      "timestamp": 1234567890,
      "message": {
        "mid": "mid.xxx",
        "text": "Hello"
      }
    }]
  }]
}
```

**Facebook Messenger Message:**
```json
{
  "object": "page",
  "entry": [{
    "id": "PAGE_ID",
    "time": 1234567890,
    "messaging": [{
      "sender": {
        "id": "USER_FB_ID"
      },
      "recipient": {
        "id": "PAGE_ID"
      },
      "timestamp": 1234567890,
      "message": {
        "mid": "mid.xxx",
        "text": "Hello"
      }
    }]
  }]
}
```

**Response:**
```json
{
  "status": "ok"
}
```

**Event Types yang Di-handle:**
- ✅ WhatsApp: messages, message_status
- ✅ Instagram: messages, messaging_postbacks, messaging_seen
- ✅ Messenger: messages, messaging_postbacks, message_deliveries, message_reads

---

### 🔒 Security:

**Signature Verification:**
Webhook memverifikasi signature untuk memastikan request benar-benar dari Meta:

```php
// MetaWebhookController.php
protected function verifySignature(Request $request): bool
{
    $signature = $request->header('X-Hub-Signature-256');
    $appSecret = config('services.meta.app_secret');

    $expectedSignature = 'sha256=' . hash_hmac('sha256', $request->getContent(), $appSecret);

    return hash_equals($expectedSignature, $signature);
}
```

**Verify Token:**
- Defined in `.env`: `META_WEBHOOK_VERIFY_TOKEN=chatcepat-meta-webhook-2024`
- Digunakan saat Meta melakukan webhook verification

---

### 🌐 Production URL:

```
https://yourdomain.com/api/meta/webhook
```

### 🧪 Development URL (ngrok):

```bash
# Start ngrok
ngrok http 8000

# URL akan seperti:
https://abc123.ngrok.io/api/meta/webhook
```

---

### 📝 Setup di Meta Developer:

1. **WhatsApp:**
   - Dashboard → WhatsApp → Configuration → Webhook
   - Callback URL: `https://yourdomain.com/api/meta/webhook`
   - Verify Token: `chatcepat-meta-webhook-2024`
   - Subscribe: messages, message_status

2. **Instagram:**
   - Dashboard → Instagram → Configuration → Webhook
   - Callback URL: `https://yourdomain.com/api/meta/webhook`
   - Verify Token: `chatcepat-meta-webhook-2024`
   - Subscribe: messages, messaging_postbacks, messaging_seen

3. **Messenger:**
   - Dashboard → Messenger → Settings → Webhook
   - Callback URL: `https://yourdomain.com/api/meta/webhook`
   - Verify Token: `chatcepat-meta-webhook-2024`
   - Subscribe: messages, messaging_postbacks, message_deliveries, message_reads

---

## 2️⃣ TELEGRAM WEBHOOK

### 📍 Route:

#### **POST** `/api/telegram/webhook/{bot}`
- **Purpose**: Menerima updates dari Telegram Bot API
- **Route Name**: `api.telegram.webhook`
- **Controller**: `App\Http\Controllers\Api\TelegramWebhookController@handle`
- **Middleware**: None (public endpoint)
- **Auth**: Bot validation

**URL Pattern:**
```
POST /api/telegram/webhook/{bot_id}
```

**Example:**
```
POST /api/telegram/webhook/1
```

**Payload Example:**
```json
{
  "update_id": 123456789,
  "message": {
    "message_id": 123,
    "from": {
      "id": 987654321,
      "is_bot": false,
      "first_name": "John",
      "username": "johndoe",
      "language_code": "en"
    },
    "chat": {
      "id": 987654321,
      "first_name": "John",
      "username": "johndoe",
      "type": "private"
    },
    "date": 1234567890,
    "text": "Hello Bot!"
  }
}
```

**Response:**
```json
{
  "ok": true
}
```

**Event Types yang Di-handle:**
- ✅ message (text, photo, video, document, audio)
- ✅ edited_message
- ✅ callback_query (inline keyboard)
- ✅ inline_query (optional)

---

### 🔒 Security:

**Bot Validation:**
```php
// TelegramWebhookController.php
public function handle(Request $request, int $botId)
{
    $bot = TelegramBot::find($botId);

    if (!$bot || !$bot->is_active) {
        return response()->json(['ok' => false], 404);
    }

    // Process update...
}
```

- Webhook URL unik per bot (menggunakan bot_id)
- Bot harus exist dan active di database
- Tidak ada external authentication (Telegram server verifies by URL secret)

---

### 🌐 Production URL:

```
https://yourdomain.com/api/telegram/webhook/{bot_id}
```

### 🧪 Development URL (ngrok):

```bash
# Start ngrok
ngrok http 8000

# URL akan seperti:
https://abc123.ngrok.io/api/telegram/webhook/1
```

---

### 📝 Setup Webhook untuk Telegram Bot:

**Menggunakan Telegram Bot API:**

```bash
# Set webhook
curl -X POST "https://api.telegram.org/bot{BOT_TOKEN}/setWebhook" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://yourdomain.com/api/telegram/webhook/1"
  }'

# Get webhook info
curl "https://api.telegram.org/bot{BOT_TOKEN}/getWebhookInfo"

# Delete webhook (untuk testing dengan polling)
curl -X POST "https://api.telegram.org/bot{BOT_TOKEN}/deleteWebhook"
```

**Via Aplikasi ChatCepat:**
Setup otomatis dilakukan di `TelegramBotController@setupWebhook()` saat bot dibuat.

---

## 📊 WEBHOOK FLOW DIAGRAM

### Meta Webhook Flow:

```
Meta Platform (WhatsApp/IG/Messenger)
         │
         │ POST /api/meta/webhook
         │ (with X-Hub-Signature-256)
         ▼
  MetaWebhookController
         │
         ├─► Verify Signature
         │
         ├─► Route by object type
         │   ├─► whatsapp_business_account → handleWhatsAppWebhook()
         │   ├─► instagram → handleInstagramWebhook()
         │   └─► page → handleFacebookWebhook()
         │
         ├─► Save Message to Database
         │
         ├─► Find User by phone_number_id/page_id/instagram_id
         │
         ├─► Check Auto Reply Rules
         │
         └─► Send Auto Reply (if matched)
```

### Telegram Webhook Flow:

```
Telegram Bot API
         │
         │ POST /api/telegram/webhook/{bot_id}
         ▼
  TelegramWebhookController
         │
         ├─► Validate Bot (exists & active)
         │
         ├─► Handle Update Type
         │   ├─► message → handleMessage()
         │   ├─► edited_message → handleEditedMessage()
         │   └─► callback_query → handleCallbackQuery()
         │
         ├─► Save/Update Contact
         │
         ├─► Save Message to Database
         │
         ├─► Check Auto Reply (if enabled)
         │
         └─► Send Auto Reply via Bot API
```

---

## 🧪 TESTING WEBHOOKS

### Test Meta Webhook Locally:

```bash
# 1. Start Laravel
php artisan serve

# 2. Start ngrok
ngrok http 8000

# 3. Update webhook di Meta Developer
# Callback URL: https://abc123.ngrok.io/api/meta/webhook
# Verify Token: chatcepat-meta-webhook-2024

# 4. Send test message dari WhatsApp/Instagram/Messenger

# 5. Check logs
tail -f storage/logs/laravel.log
```

### Test Telegram Webhook Locally:

```bash
# 1. Start Laravel
php artisan serve

# 2. Start ngrok
ngrok http 8000

# 3. Set webhook via API
curl -X POST "https://api.telegram.org/bot{TOKEN}/setWebhook" \
  -d "url=https://abc123.ngrok.io/api/telegram/webhook/1"

# 4. Send message ke bot di Telegram

# 5. Check logs
tail -f storage/logs/laravel.log
```

---

## 📝 WEBHOOK LOGS

Semua webhook events di-log ke `storage/logs/laravel.log`:

```php
// Log format:
[2024-01-28 10:30:45] local.INFO: Meta Webhook received {"payload": {...}}
[2024-01-28 10:30:46] local.INFO: Processing WhatsApp message {"from": "628xxx", "text": "Hello"}
[2024-01-28 10:30:47] local.INFO: Auto reply sent {"to": "628xxx"}
```

**Untuk production**, setup monitoring:
- Log to external service (Sentry, Logtail, Papertrail)
- Alert on webhook failures
- Track delivery rates

---

## ⚙️ WEBHOOK CONFIGURATION

### Environment Variables:

```env
# Meta Webhook
META_APP_SECRET=your_app_secret
META_WEBHOOK_VERIFY_TOKEN=chatcepat-meta-webhook-2024

# Application URL (untuk webhook callbacks)
APP_URL=https://yourdomain.com
```

### Config Files:

**config/services.php:**
```php
'meta' => [
    'app_id' => env('META_APP_ID'),
    'app_secret' => env('META_APP_SECRET'),
    'webhook_verify_token' => env('META_WEBHOOK_VERIFY_TOKEN'),
],
```

---

## 🔍 TROUBLESHOOTING

### Meta Webhook Issues:

**❌ "Webhook verification failed"**
- Check verify token: `META_WEBHOOK_VERIFY_TOKEN`
- Ensure URL publicly accessible (not localhost)
- Check SSL certificate (HTTPS required)

**❌ "Invalid signature"**
- Check `META_APP_SECRET` correct
- Verify signature calculation
- Check request body not modified

**❌ "Webhook not receiving events"**
- Check webhook subscriptions di Meta Developer
- Verify URL accessible from internet
- Check firewall/security groups
- Review Meta Error Logs

### Telegram Webhook Issues:

**❌ "Webhook not set"**
```bash
# Check webhook status
curl "https://api.telegram.org/bot{TOKEN}/getWebhookInfo"
```

**❌ "Bot not found"**
- Verify bot exists di database
- Check bot is_active = true
- Verify bot_id in URL correct

**❌ "Webhook SSL error"**
- Telegram requires valid SSL certificate
- Use Let's Encrypt for free SSL
- Ngrok provides SSL automatically

---

## 📚 RELATED FILES

### Controllers:
- `app/Http/Controllers/Api/MetaWebhookController.php`
- `app/Http/Controllers/Api/TelegramWebhookController.php`

### Routes:
- `routes/api.php` (lines 36-44)

### Models:
- Meta: `MetaWhatsappMessage`, `MetaInstagramMessage`, `MetaFacebookMessage`
- Telegram: `TelegramMessage`, `TelegramContact`, `TelegramBot`

### Services:
- `app/Services/Meta/WhatsAppBusinessService.php`
- `app/Services/Meta/InstagramMessagingService.php`
- `app/Services/Meta/FacebookMessengerService.php`
- `app/Services/Telegram/TelegramBotApiService.php`

---

## ✅ CHECKLIST SETUP

### Meta Webhook:
- [ ] `META_APP_SECRET` set di `.env`
- [ ] `META_WEBHOOK_VERIFY_TOKEN` set di `.env`
- [ ] Callback URL added di Meta Developer
- [ ] Webhook verified (GET request success)
- [ ] Subscribed to events (messages, etc.)
- [ ] Test message received & logged
- [ ] Auto reply working (optional)

### Telegram Webhook:
- [ ] Telegram bot created via BotFather
- [ ] Bot token saved di database
- [ ] Webhook URL set via setWebhook API
- [ ] Test message received & logged
- [ ] Auto reply working (optional)

---

**Last Updated**: 2024-01-28
