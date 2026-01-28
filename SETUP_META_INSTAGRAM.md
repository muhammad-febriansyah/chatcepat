# Setup Instagram Business API untuk SaaS

## 1. Prerequisites

### Konversi ke Instagram Business Account:
1. Instagram Anda harus **Business** atau **Creator** account
2. Link Instagram ke Facebook Page
3. Link Facebook Page ke Meta Business Suite

### Langkah-langkah:
1. Buka Instagram app → **Settings** → **Account type and tools**
2. Pilih **Switch to Professional Account**
3. Pilih **Business**
4. Connect ke Facebook Page Anda

## 2. Dapatkan Instagram Business Account ID

### Di Meta Developer Dashboard:
1. Klik **Instagram** → **Settings**
2. Atau gunakan Graph API Explorer:
   ```
   GET /me/accounts
   ```
3. Dari response, dapatkan Facebook Page ID
4. Kemudian get Instagram Business Account:
   ```
   GET /{facebook-page-id}?fields=instagram_business_account
   ```
5. Copy **Instagram Business Account ID**
6. Paste ke `.env`:
   ```
   META_INSTAGRAM_ACCOUNT_ID=your_instagram_account_id
   ```

## 3. Required Permissions

### Untuk Instagram Messaging:
- ✅ instagram_basic
- ✅ instagram_manage_messages
- ✅ instagram_manage_comments
- ✅ pages_manage_metadata
- ✅ pages_read_engagement
- ✅ pages_show_list

## 4. Setup Webhooks untuk Instagram

### Di Meta Developer Dashboard:
1. Klik **Instagram** → **Configuration**
2. Di bagian **Webhook**, klik **Edit**
3. Isi:
   - **Callback URL**: `https://yourdomain.com/api/meta/webhook`
   - **Verify Token**: `chatcepat-meta-webhook-2024`
4. Subscribe to webhook fields:
   - ✅ messages
   - ✅ messaging_postbacks
   - ✅ message_reactions
   - ✅ messaging_seen

## 5. Generate Page Access Token

### Cara 1: Menggunakan Graph API Explorer
1. Buka https://developers.facebook.com/tools/explorer/
2. Pilih App: **ChatCepat**
3. Pilih **User or Page** → Select Page yang linked ke Instagram
4. Get Token → pilih permissions yang diperlukan
5. Generate Access Token
6. **IMPORTANT**: Extend token ke long-lived token (60 days)

### Cara 2: System User Token (Recommended for SaaS)
1. Ikuti langkah di SETUP_META_WHATSAPP.md
2. Gunakan permissions:
   - ✅ instagram_basic
   - ✅ instagram_manage_messages
   - ✅ pages_manage_metadata
   - ✅ pages_show_list
3. Assign Facebook Page ke System User

## 6. Test Instagram Messaging

### Test dengan Graph API:
```bash
# Get Instagram Account Info
curl -X GET "https://graph.facebook.com/v21.0/{instagram-account-id}?fields=id,username,profile_picture_url&access_token=YOUR_TOKEN"

# Get Conversations
curl -X GET "https://graph.facebook.com/v21.0/me/conversations?platform=instagram&access_token=YOUR_TOKEN"
```

## 7. Setup untuk Multi-Tenant (SaaS)

### Database Schema:
Setiap user punya field:
```php
'meta_instagram_account_id' => 'string|nullable'
'meta_facebook_page_id' => 'string|nullable'
'meta_facebook_page_access_token' => 'text|nullable'
'meta_access_token' => 'text|nullable'
```

### OAuth Flow untuk User:
1. User klik "Connect Instagram" di `/user/meta/settings`
2. Redirect ke Facebook OAuth
3. User authorize app
4. Callback menyimpan:
   - Facebook Page ID
   - Page Access Token
   - Instagram Business Account ID

## 8. Important Notes

### Instagram Messaging Requirements:
1. Hanya bisa reply messages dari user (24 jam window)
2. Tidak bisa initiate conversation pertama
3. Harus Instagram Business atau Creator account
4. Must be linked to Facebook Page

### Rate Limits:
- **Development**: 200 API calls per hour per user
- **Production**: Higher limits setelah app review

### Features yang Bisa Digunakan:
- ✅ Reply to Instagram DMs
- ✅ Get message history
- ✅ Send images, videos
- ✅ Quick replies
- ✅ Message reactions
- ✅ Read receipts

### Features yang TIDAK Bisa:
- ❌ Initiate first message
- ❌ Message after 24 hours (outside window)
- ❌ Story replies (berbeda API)

## 9. App Review Requirements

Untuk production, submit untuk review:

### Data Required:
1. **App Privacy Policy URL**
2. **App Terms of Service URL**
3. **Business Verification** (Meta Business Manager)
4. **Demo Video** showing Instagram messaging feature
5. **Test User Credentials**

### Permissions to Request:
- instagram_manage_messages
- pages_manage_metadata
- pages_messaging

### Timeline:
- Review process: 1-3 minggu
- Bisa di-reject jika tidak memenuhi Facebook Platform Policy

## 10. Webhook Handler

Aplikasi sudah punya webhook handler di:
`app/Http/Controllers/Api/MetaWebhookController.php`

Webhook akan handle:
- Incoming Instagram messages
- Message status updates
- Reactions
- Story mentions (jika di-enable)

## 11. Testing Tips

### Use Test Instagram Account:
1. Create test user di Meta Developer → **Roles** → **Test Users**
2. Link test Instagram account
3. Test messaging tanpa affect production account
