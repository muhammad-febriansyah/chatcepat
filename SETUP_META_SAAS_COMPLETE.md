# 🚀 Complete Setup Guide: Meta Business API untuk Sistem SaaS

## 📖 Overview

Sistem ChatCepat adalah **Multi-Tenant SaaS** dimana:
- **1 Meta App** (milik Anda) digunakan oleh **semua users**
- Setiap user **connect account mereka sendiri** (WhatsApp Business, Instagram, Facebook Page)
- User authenticate via **OAuth** untuk authorize app Anda
- Token disimpan **per-user** di database
- Setiap request menggunakan **token user masing-masing**

---

## 🏗️ Architecture

```
┌─────────────────┐
│   Meta App      │  ← APP_ID & APP_SECRET (Global - di .env)
│  (ChatCepat)    │
└────────┬────────┘
         │
         ├── User 1 → WhatsApp Account 1 + Instagram 1 + Page 1
         ├── User 2 → WhatsApp Account 2 + Instagram 2 + Page 2
         ├── User 3 → WhatsApp Account 3 + Instagram 3 + Page 3
         └── User N → WhatsApp Account N + Instagram N + Page N
```

---

## ✅ CHECKLIST SETUP

### A. Meta Developer Dashboard (Your App)

#### 1. App Basic Settings
- [x] App sudah dibuat ✓ (ID: 2210262782822425)
- [ ] App Secret → copy ke `.env` → `META_APP_SECRET=`
- [ ] App Domain → tambahkan domain production Anda
- [ ] Privacy Policy URL → buat dan tambahkan
- [ ] Terms of Service URL → buat dan tambahkan
- [ ] App Icon (1024x1024) → upload

#### 2. Products Added
- [x] Messenger ✓
- [x] Instagram ✓
- [x] WhatsApp ✓
- [x] Webhooks ✓
- [x] Facebook Login for Business ✓

#### 3. Webhooks Configuration
**Callback URL**: `https://yourdomain.com/api/meta/webhook`
**Verify Token**: `chatcepat-meta-webhook-2024`

**Subscribe untuk setiap product:**
- **WhatsApp**: messages, message_status
- **Instagram**: messages, messaging_postbacks, messaging_seen
- **Messenger**: messages, messaging_postbacks, messaging_optins, message_deliveries, message_reads

#### 4. App Mode
- Status saat ini: **Development** 🔴
- Target: **Live** 🟢 (setelah app review)

---

### B. Meta Business Suite Setup

#### 1. Create Meta Business Account
1. Buka https://business.facebook.com/
2. Create Business Account
3. Isi informasi bisnis

#### 2. Business Verification ⚠️ PENTING untuk Production
**Required Documents:**
- Business registration document
- Phone number verification
- Email verification
- Business address

**Proses:**
1. Meta Business Suite → Settings → Business Info
2. Start Verification
3. Upload documents
4. Tunggu approval (1-5 hari kerja)

**Catatan:** Tanpa business verification, app tidak bisa ke Live mode!

#### 3. Create System User (for Production)
**Purpose:** Generate never-expire tokens untuk production

**Steps:**
1. Meta Business Suite → Business Settings
2. Users → System Users
3. Add System User → "ChatCepat API"
4. Role: Admin

**Generate Token:**
1. Click system user → Generate New Token
2. App: ChatCepat
3. Token Expiration: **Never expire**
4. Permissions:
   - whatsapp_business_management
   - whatsapp_business_messaging
   - instagram_basic
   - instagram_manage_messages
   - pages_messaging
   - pages_manage_metadata
   - business_management
5. Generate Token → Copy → Save di `.env`

**Assign Assets:**
1. WhatsApp Accounts → Assign to System User (Full control)
2. Facebook Pages → Assign to System User (Admin role)
3. Instagram Accounts → Assign to System User (Full control)

---

### C. Laravel Application Setup

#### 1. Update `.env` file

```env
# ============================================
# META BUSINESS API CONFIGURATION
# ============================================

# App Credentials (Global - same for all users)
META_APP_ID=2210262782822425
META_APP_SECRET=YOUR_APP_SECRET_HERE
META_WEBHOOK_VERIFY_TOKEN=chatcepat-meta-webhook-2024

# OAuth Redirect URL
META_OAUTH_REDIRECT_URI=${APP_URL}/meta/oauth/callback

# For Development/Testing (Optional - Admin setup)
# These are used as fallback or for admin testing
META_ACCESS_TOKEN=YOUR_SYSTEM_USER_TOKEN
META_WHATSAPP_PHONE_NUMBER_ID=
META_WHATSAPP_BUSINESS_ACCOUNT_ID=
META_INSTAGRAM_ACCOUNT_ID=
META_FACEBOOK_PAGE_ID=
META_FACEBOOK_PAGE_ACCESS_TOKEN=

# Webhook Route
# https://yourdomain.com/api/meta/webhook
```

#### 2. Update `config/services.php`

```php
'meta' => [
    'app_id' => env('META_APP_ID'),
    'app_secret' => env('META_APP_SECRET'),
    'webhook_verify_token' => env('META_WEBHOOK_VERIFY_TOKEN'),
    'oauth_redirect_uri' => env('META_OAUTH_REDIRECT_URI'),
    'graph_api_version' => env('META_GRAPH_API_VERSION', 'v21.0'),
],
```

#### 3. Database Migration

Migration sudah ada untuk users table:
```php
// users table columns:
'meta_whatsapp_phone_number_id'
'meta_whatsapp_business_account_id'
'meta_instagram_account_id'
'meta_facebook_page_id'
'meta_facebook_page_access_token'
'meta_access_token'
```

**Run migration:**
```bash
php artisan migrate
```

#### 4. Routes Setup

Routes sudah ada di `routes/web.php`:
```php
// Meta Integration Settings & OAuth
Route::prefix('meta')->name('meta.')->group(function () {
    Route::prefix('settings')->name('settings.')->group(function () {
        Route::get('/', [MetaSettingsController::class, 'index']);
        Route::post('/whatsapp', [MetaSettingsController::class, 'updateWhatsApp']);
        Route::post('/instagram', [MetaSettingsController::class, 'updateInstagram']);
        Route::post('/facebook', [MetaSettingsController::class, 'updateFacebook']);
    });
});
```

**Webhooks route** di `routes/api.php`:
```php
// Meta Webhook (no auth - public endpoint)
Route::post('/meta/webhook', [MetaWebhookController::class, 'handle']);
Route::get('/meta/webhook', [MetaWebhookController::class, 'verify']);
```

---

### D. Implement OAuth Flow (Multi-Tenant)

#### 1. Create OAuth Controller

Buat `app/Http/Controllers/User/MetaOAuthController.php`:

```php
<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class MetaOAuthController extends Controller
{
    public function redirectToProvider()
    {
        $appId = config('services.meta.app_id');
        $redirectUri = config('services.meta.oauth_redirect_uri');

        $scopes = [
            'whatsapp_business_management',
            'whatsapp_business_messaging',
            'instagram_basic',
            'instagram_manage_messages',
            'pages_messaging',
            'pages_manage_metadata',
            'pages_show_list',
        ];

        $url = "https://www.facebook.com/v21.0/dialog/oauth?" . http_build_query([
            'client_id' => $appId,
            'redirect_uri' => $redirectUri,
            'scope' => implode(',', $scopes),
            'state' => csrf_token(),
        ]);

        return redirect($url);
    }

    public function handleCallback(Request $request)
    {
        $code = $request->code;

        // Exchange code for access token
        $response = Http::get('https://graph.facebook.com/v21.0/oauth/access_token', [
            'client_id' => config('services.meta.app_id'),
            'client_secret' => config('services.meta.app_secret'),
            'redirect_uri' => config('services.meta.oauth_redirect_uri'),
            'code' => $code,
        ]);

        $data = $response->json();
        $accessToken = $data['access_token'];

        // Get user's Facebook Pages
        $pagesResponse = Http::get('https://graph.facebook.com/v21.0/me/accounts', [
            'access_token' => $accessToken,
        ]);

        $pages = $pagesResponse->json()['data'];

        // Store in session for user to select
        session(['meta_pages' => $pages, 'meta_access_token' => $accessToken]);

        return redirect()->route('user.meta.settings.select-page');
    }
}
```

#### 2. Add Routes

```php
Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/meta/oauth', [MetaOAuthController::class, 'redirectToProvider'])
        ->name('meta.oauth');
    Route::get('/meta/oauth/callback', [MetaOAuthController::class, 'handleCallback'])
        ->name('meta.oauth.callback');
});
```

---

### E. Webhook Setup

#### 1. Test Webhook Locally (Development)

**Use ngrok:**
```bash
ngrok http 8000
```

Copy ngrok URL (e.g., `https://abc123.ngrok.io`)

**Update Meta Developer:**
1. Webhook Callback URL: `https://abc123.ngrok.io/api/meta/webhook`
2. Verify Token: `chatcepat-meta-webhook-2024`
3. Verify and Save

#### 2. Production Webhook

**Requirements:**
- HTTPS (SSL certificate)
- Publicly accessible URL
- Fast response (< 5 seconds)

**URL:** `https://yourdomain.com/api/meta/webhook`

**Webhook Handler** sudah ada di:
`app/Http/Controllers/Api/MetaWebhookController.php`

---

### F. App Review Process

#### 1. Prerequisites
- [x] Products added
- [ ] Business Verification completed
- [ ] Privacy Policy URL added
- [ ] App Icon uploaded
- [ ] Test users created

#### 2. Permissions to Request

**WhatsApp:**
- whatsapp_business_messaging
- whatsapp_business_management

**Instagram:**
- instagram_manage_messages
- instagram_basic

**Messenger:**
- pages_messaging
- pages_manage_metadata

#### 3. Submission Materials

**Required:**
1. **App Description** - Jelaskan use case ChatCepat SaaS
2. **Demo Video** (max 5 min) - Show:
   - User signup → connect WhatsApp/IG/Messenger
   - Send & receive messages
   - Auto-reply feature
   - Broadcast feature
3. **Test Users** - Provide credentials
4. **Use Case Details** - Explain how each permission is used
5. **Privacy Policy** - Must cover data handling

#### 4. Timeline
- Submission → Review → Approval/Rejection
- Typical: **1-3 weeks**
- Jika rejected: fix issues → resubmit

---

## 🧪 TESTING CHECKLIST

### Development Mode Testing

#### WhatsApp:
- [ ] Send message to test number
- [ ] Receive webhook for incoming message
- [ ] Verify message delivery status
- [ ] Test media (image, document)
- [ ] Test quick replies

#### Instagram:
- [ ] Reply to DM
- [ ] Receive webhook for incoming DM
- [ ] Test media messages
- [ ] Test quick replies

#### Messenger:
- [ ] Send message from page
- [ ] Receive webhook for incoming message
- [ ] Test button templates
- [ ] Test quick replies
- [ ] Test postbacks

### Multi-Tenant Testing:
- [ ] User A connects WhatsApp → can send messages
- [ ] User B connects different WhatsApp → isolated
- [ ] Webhooks route to correct user
- [ ] Tokens don't leak between users

---

## 🔐 SECURITY BEST PRACTICES

### 1. Token Management
- ✅ Store tokens encrypted in database
- ✅ Never expose in frontend/logs
- ✅ Rotate tokens periodically
- ✅ Use system user tokens for production

### 2. Webhook Security
- ✅ Verify webhook signature (already implemented)
- ✅ Validate verify token
- ✅ Use HTTPS only
- ✅ Rate limiting

### 3. User Privacy
- ✅ Get explicit consent
- ✅ Clear privacy policy
- ✅ Allow users to disconnect
- ✅ Delete data on request
- ✅ Comply with GDPR/local laws

---

## 📊 MONITORING & ANALYTICS

### What to Monitor:
1. **Webhook delivery rate** - Should be > 95%
2. **API error rates** - Check for token expirations
3. **Message delivery success** - Track failed messages
4. **User connections** - Monitor OAuth success rate

### Logging:
Sudah ada ActivityLog di aplikasi untuk track:
- User connections
- Message sent/received
- API errors
- Webhook events

---

## 🚀 GO LIVE CHECKLIST

### Before Switching to Live Mode:

- [ ] Business Verification: ✅ Approved
- [ ] App Review: ✅ Approved for all permissions
- [ ] Privacy Policy: ✅ Published & linked
- [ ] Terms of Service: ✅ Published & linked
- [ ] Production domain: ✅ Added to app settings
- [ ] Webhooks: ✅ Configured for production URL
- [ ] SSL Certificate: ✅ Valid
- [ ] System User Token: ✅ Generated & tested
- [ ] Testing: ✅ All features work in development
- [ ] Monitoring: ✅ Setup (error tracking, logging)
- [ ] Rate Limiting: ✅ Implemented
- [ ] Data Backup: ✅ Configured

### After Going Live:
1. Switch App Mode: Development → **Live**
2. Monitor for 24-48 hours
3. Check webhook delivery
4. Verify user connections working
5. Monitor error logs
6. User feedback

---

## 📚 ADDITIONAL RESOURCES

### Documentation:
- **WhatsApp Cloud API**: https://developers.facebook.com/docs/whatsapp/cloud-api
- **Instagram Messaging**: https://developers.facebook.com/docs/messenger-platform/instagram
- **Messenger Platform**: https://developers.facebook.com/docs/messenger-platform
- **Graph API**: https://developers.facebook.com/docs/graph-api

### Graph API Explorer:
https://developers.facebook.com/tools/explorer/

### Testing Tools:
- ngrok: https://ngrok.com/
- Postman: https://www.postman.com/

---

## ❓ TROUBLESHOOTING

### Common Issues:

**1. "Invalid OAuth Redirect URI"**
- Solution: Add redirect URI di Meta App Settings → Basic → App Domains

**2. "Webhook verification failed"**
- Solution: Check verify token matches META_WEBHOOK_VERIFY_TOKEN

**3. "Token expired"**
- Solution: Use long-lived token or system user token

**4. "Permission denied"**
- Solution: Check if permission approved in app review

**5. "Webhook not receiving events"**
- Solution:
  - Check webhook subscriptions
  - Verify SSL certificate
  - Check callback URL is public
  - Review server logs

---

## 📞 SUPPORT

Jika ada issues:
1. Check Meta Developer Dashboard → App Settings → Error Logs
2. Check Laravel logs: `storage/logs/laravel.log`
3. Test dengan Graph API Explorer
4. Meta Developer Community: https://developers.facebook.com/community/

---

## ✨ NEXT STEPS

Setelah setup complete:
1. **Implement OAuth UI** - Add "Connect" buttons di frontend
2. **Test dengan real users** - Beta testing
3. **Submit App Review** - Dengan semua materials
4. **Monitor & Optimize** - Track performance
5. **Scale** - Handle increasing users
6. **Marketing** - Launch 🚀

---

**Good luck dengan SaaS ChatCepat Anda! 🎉**
