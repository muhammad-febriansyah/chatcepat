# Setup WhatsApp Cloud API untuk SaaS

## 1. Dapatkan Phone Number ID & Business Account ID

### Di Meta Developer Dashboard:
1. Klik **WhatsApp** → **Settings**
2. Klik **Add Phone Number** atau gunakan test number
3. Copy **Phone Number ID** dan **WhatsApp Business Account ID**
4. Paste ke `.env`:
   ```
   META_WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id
   META_WHATSAPP_BUSINESS_ACCOUNT_ID=your_business_account_id
   ```

## 2. Setup Webhooks untuk WhatsApp

### Di Meta Developer Dashboard:
1. Klik **WhatsApp** → **Configuration**
2. Di bagian **Webhook**, klik **Edit**
3. Isi:
   - **Callback URL**: `https://yourdomain.com/api/meta/webhook`
   - **Verify Token**: `chatcepat-meta-webhook-2024` (sesuai .env)
4. Klik **Verify and Save**
5. Subscribe to webhook fields:
   - ✅ messages
   - ✅ message_status
   - ✅ messaging_postbacks

## 3. Generate Access Token

### Untuk Development (Temporary Token):
1. Klik **WhatsApp** → **API Setup**
2. Copy **Temporary access token** (valid 24 jam)
3. Paste ke `.env`:
   ```
   META_ACCESS_TOKEN=your_temporary_token
   ```

### Untuk Production (System User Token - Recommended for SaaS):

#### A. Buat System User:
1. Buka **Meta Business Suite** → https://business.facebook.com/
2. Klik **Business Settings** → **Users** → **System Users**
3. Klik **Add** → Buat system user (nama: ChatCepat API)
4. Role: **Admin**

#### B. Generate System User Token:
1. Klik pada system user yang baru dibuat
2. Klik **Generate New Token**
3. Select App: **ChatCepat**
4. Token Expiration: **Never expire** (untuk production)
5. Permissions yang diperlukan:
   - ✅ whatsapp_business_management
   - ✅ whatsapp_business_messaging
   - ✅ business_management
6. Copy token dan simpan di `.env`:
   ```
   META_ACCESS_TOKEN=your_system_user_token
   ```

#### C. Assign WhatsApp Business Account ke System User:
1. Di Business Settings → **Accounts** → **WhatsApp Accounts**
2. Pilih WhatsApp Business Account Anda
3. Klik **Add People**
4. Pilih system user yang tadi dibuat
5. Berikan permission: **Full control**

## 4. Dapatkan App Secret

1. Di Meta Developer Dashboard → **App settings** → **Basic**
2. Klik **Show** di sebelah **App secret**
3. Copy dan paste ke `.env`:
   ```
   META_APP_SECRET=your_app_secret
   ```

## 5. Test Connection

Gunakan endpoint ini untuk test:
```bash
curl -X GET "https://graph.facebook.com/v21.0/me/phone_numbers?access_token=YOUR_ACCESS_TOKEN"
```

Atau dari aplikasi:
1. Login sebagai user
2. Buka `/user/meta/settings`
3. Isi form WhatsApp configuration
4. Klik **Test Connection**

## 6. Setup untuk Multi-Tenant (SaaS)

### Model yang sudah ada:
- Setiap user punya field:
  - `meta_whatsapp_phone_number_id`
  - `meta_whatsapp_business_account_id`
  - `meta_access_token`

### Cara kerja SaaS:
1. Admin setup META_APP_ID dan META_APP_SECRET di `.env` (global)
2. Setiap user login ke ChatCepat dan connect WhatsApp mereka
3. User OAuth ke Meta untuk authorize app
4. Token disimpan per-user di database
5. Setiap request menggunakan token user masing-masing

### Implement OAuth Flow untuk User:

Tambahkan route OAuth di `routes/web.php`:
```php
// Meta OAuth untuk User
Route::get('/meta/oauth/whatsapp', [MetaOAuthController::class, 'redirectToWhatsApp'])
    ->name('meta.oauth.whatsapp');
Route::get('/meta/oauth/callback', [MetaOAuthController::class, 'handleCallback'])
    ->name('meta.oauth.callback');
```

## 7. Important Notes

### Rate Limits:
- **Development Mode**: 250 messages per day
- **Production Mode**: Unlimited (setelah app review)

### Business Verification:
Untuk production, Meta memerlukan:
1. Business Verification
2. App Review untuk permissions
3. Pembayaran (Facebook Business Manager)

### Webhook Security:
Aplikasi sudah verify webhook signature di:
`app/Http/Controllers/Api/MetaWebhookController.php`

## 8. Move to Production

Setelah siap:
1. Di Meta Developer Dashboard → **App Mode** → Switch to **Live**
2. Submit untuk App Review (permissions: whatsapp_business_messaging)
3. Tunggu approval (1-2 minggu)
4. Setelah approved, unlimited messaging
