# Setup Facebook Messenger API untuk SaaS

## 1. Prerequisites

### Persiapan Facebook Page:
1. Punya **Facebook Page** (bukan personal profile)
2. Anda admin dari page tersebut
3. Page sudah published (not draft)

### Create Facebook Page (jika belum punya):
1. Buka https://www.facebook.com/pages/create
2. Pilih kategori bisnis
3. Isi informasi page
4. Publish page

## 2. Dapatkan Facebook Page ID

### Cara 1: Dari Facebook Page
1. Buka Facebook Page Anda
2. Klik **About**
3. Scroll ke bawah, lihat **Page ID**

### Cara 2: Dari Meta Developer
1. Gunakan Graph API Explorer
2. Request:
   ```
   GET /me/accounts
   ```
3. Copy **Page ID** dari response
4. Paste ke `.env`:
   ```
   META_FACEBOOK_PAGE_ID=your_page_id
   ```

## 3. Setup Messenger Product

### Di Meta Developer Dashboard:
1. Klik **Messenger** → **Settings**
2. Scroll ke **Access Tokens**
3. Klik **Add or Remove Pages**
4. Login dan pilih Page yang akan digunakan
5. Berikan permissions:
   - ✅ Manage and access Page conversations in Messenger
   - ✅ Manage your Page
   - ✅ Read content posted on the Page
6. Generate **Page Access Token**
7. Copy token dan paste ke `.env`:
   ```
   META_FACEBOOK_PAGE_ACCESS_TOKEN=your_page_token
   ```

## 4. Required Permissions

### Untuk Messenger Platform:
- ✅ pages_messaging
- ✅ pages_manage_metadata
- ✅ pages_read_engagement
- ✅ pages_show_list

### Optional (untuk advanced features):
- pages_manage_posts (untuk posting)
- pages_read_user_content (untuk membaca comments)

## 5. Setup Webhooks untuk Messenger

### Di Meta Developer Dashboard:
1. Klik **Messenger** → **Settings**
2. Di bagian **Webhooks**, klik **Add Callback URL**
3. Isi:
   - **Callback URL**: `https://yourdomain.com/api/meta/webhook`
   - **Verify Token**: `chatcepat-meta-webhook-2024`
4. Klik **Verify and Save**
5. Subscribe to webhook fields:
   - ✅ messages
   - ✅ messaging_postbacks
   - ✅ messaging_optins
   - ✅ message_deliveries
   - ✅ message_reads
   - ✅ messaging_handovers
   - ✅ messaging_referrals

### Subscribe Page to Webhook:
Setelah add callback URL, subscribe page:
```bash
curl -X POST "https://graph.facebook.com/v21.0/{page-id}/subscribed_apps?subscribed_fields=messages,messaging_postbacks,messaging_optins,message_deliveries,message_reads&access_token={page-access-token}"
```

## 6. Generate System User Token (for SaaS)

### Untuk production SaaS:
1. Buat System User di Meta Business Suite
2. Assign Page ke System User dengan role **Admin**
3. Generate token dengan permissions:
   - ✅ pages_messaging
   - ✅ pages_manage_metadata
   - ✅ pages_show_list
4. Token tidak expire (Never expire option)

### Cara assign page ke system user:
1. **Meta Business Suite** → **Business Settings**
2. **Accounts** → **Pages**
3. Pilih page → **Assign Partners**
4. Pilih System User
5. Role: **Admin**

## 7. Test Messenger Connection

### Test dengan Graph API:
```bash
# Get Page Info
curl -X GET "https://graph.facebook.com/v21.0/{page-id}?fields=id,name,picture&access_token={page-access-token}"

# Get Conversations
curl -X GET "https://graph.facebook.com/v21.0/{page-id}/conversations?fields=id,participants,updated_time&access_token={page-access-token}"

# Send Test Message
curl -X POST "https://graph.facebook.com/v21.0/me/messages?access_token={page-access-token}" \
  -H "Content-Type: application/json" \
  -d '{
    "recipient": {"id": "{user-id}"},
    "message": {"text": "Hello from ChatCepat!"}
  }'
```

## 8. Setup untuk Multi-Tenant (SaaS)

### Database Schema:
Setiap user dapat connect multiple Facebook Pages:

```php
// users table
'meta_facebook_page_id' => 'string|nullable'
'meta_facebook_page_access_token' => 'text|nullable'
'meta_access_token' => 'text|nullable'
```

### OAuth Flow untuk User:
1. User klik **"Connect Facebook Page"** di `/user/meta/settings`
2. Redirect ke Facebook OAuth:
   ```
   https://www.facebook.com/v21.0/dialog/oauth?
     client_id={app-id}&
     redirect_uri={redirect-uri}&
     scope=pages_messaging,pages_manage_metadata,pages_show_list
   ```
3. User login dan select page
4. Callback:
   - Exchange code untuk access token
   - Get user's pages
   - Let user select which page to use
   - Save page_id dan page_access_token

### Controller sudah ada:
- `app/Http/Controllers/User/MetaSettingsController.php`
- `app/Http/Controllers/User/MetaMessagingController.php`

## 9. Important Features

### Send Message Types:
```php
// Text message
[
  "recipient" => ["id" => $userId],
  "message" => ["text" => "Hello!"]
]

// Image
[
  "recipient" => ["id" => $userId],
  "message" => [
    "attachment" => [
      "type" => "image",
      "payload" => ["url" => "https://..."]
    ]
  ]
]

// Quick Replies
[
  "recipient" => ["id" => $userId],
  "message" => [
    "text" => "Choose option:",
    "quick_replies" => [
      ["content_type" => "text", "title" => "Option 1", "payload" => "opt1"],
      ["content_type" => "text", "title" => "Option 2", "payload" => "opt2"]
    ]
  ]
]

// Button Template
[
  "recipient" => ["id" => $userId],
  "message" => [
    "attachment" => [
      "type" => "template",
      "payload" => [
        "template_type" => "button",
        "text" => "What do you want to do?",
        "buttons" => [
          ["type" => "web_url", "url" => "https://...", "title" => "Visit"],
          ["type" => "postback", "title" => "Start", "payload" => "start"]
        ]
      ]
    ]
  ]
]
```

## 10. Rate Limits

### Development Mode:
- 200 requests per hour per page
- 10 requests per second

### Production Mode (after review):
- Unlimited messaging
- Higher rate limits
- Access to advanced features

## 11. App Review Requirements

### Submit untuk Production:

#### Required Materials:
1. **Privacy Policy URL** (must be publicly accessible)
2. **App Icon** (1024x1024px)
3. **Business Verification** (verified in Meta Business Manager)
4. **Use Case Description**
5. **Demo Video** (showing Messenger integration)
6. **Test User** untuk Facebook reviewer

#### Permissions to Request:
- **pages_messaging** (REQUIRED untuk send messages)
- **pages_manage_metadata** (REQUIRED untuk webhooks)
- **pages_show_list** (untuk get pages)

#### Review Checklist:
- ✅ App follows Facebook Platform Policy
- ✅ No spammy behavior
- ✅ Clear opt-in for users
- ✅ Respect user privacy
- ✅ Handle user data securely
- ✅ Provide clear value to users

## 12. Webhook Handler

### Webhook Events yang Diterima:

```php
// Message received
{
  "sender": {"id": "123456"},
  "recipient": {"id": "page-id"},
  "timestamp": 1234567890,
  "message": {
    "mid": "mid.123",
    "text": "Hello"
  }
}

// Message delivered
{
  "delivery": {
    "mids": ["mid.123"],
    "watermark": 1234567890
  }
}

// Message read
{
  "read": {
    "watermark": 1234567890
  }
}

// Postback (button clicked)
{
  "sender": {"id": "123456"},
  "postback": {
    "payload": "start",
    "title": "Start"
  }
}
```

### Handler Location:
`app/Http/Controllers/Api/MetaWebhookController.php`

## 13. Security Best Practices

### Verify Webhook Signature:
Aplikasi sudah verify signature di webhook controller.

### Store Tokens Securely:
- Encrypt tokens di database
- Jangan expose di frontend
- Use environment variables untuk app secret

### Handle Errors:
- Retry failed messages
- Log semua errors
- Alert admin jika ada issues

## 14. Testing Tips

### Development Testing:
1. Use **Messenger Platform Test Users**
2. Create test conversations
3. Test all message types
4. Verify webhook deliveries

### Production Testing:
1. Soft launch dengan limited users
2. Monitor webhook deliveries
3. Check message delivery rates
4. User feedback

## 15. Common Issues

### "Page access token not valid":
- Token expired (extend ke long-lived token)
- Page deactivated
- User removed app access

### "Message not sent":
- User blocked page
- User not found
- Page not subscribed to app

### "Webhook not receiving events":
- Wrong verify token
- SSL certificate issues
- Callback URL not publicly accessible
- Page not subscribed to webhook fields

## 16. Next Steps

After setup:
1. Test dengan real Facebook Page
2. Implement auto-reply di `MetaAutoReplyController`
3. Setup broadcast di `MetaBroadcastController`
4. Test with users
5. Submit untuk app review
6. Launch 🚀
