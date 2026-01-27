# Panduan Lengkap Setup Meta Apps untuk User Role
## ChatCepat SaaS Platform

---

## 📋 DAFTAR ISI

1. [Flow User (Bukan Admin)](#flow-user-bukan-admin)
2. [Setup Meta Developer Console](#setup-meta-developer-console)
3. [Konfigurasi WhatsApp Business API](#konfigurasi-whatsapp-business-api)
4. [Konfigurasi Instagram Messaging API](#konfigurasi-instagram-messaging-api)
5. [Konfigurasi Facebook Messenger API](#konfigurasi-facebook-messenger-api)
6. [Setup Webhook](#setup-webhook)
7. [Konfigurasi di ChatCepat](#konfigurasi-di-chatcepat)
8. [Fitur-Fitur yang Tersedia](#fitur-fitur-yang-tersedia)

---

## 👤 FLOW USER (BUKAN ADMIN)

### Ringkasan Flow:

```
STEP 1: SETUP AWAL (Sekali saja)
├─ Login ke ChatCepat
├─ Ke menu Settings > Meta Apps
├─ Setup kredensial dari Meta Developer Console
│  ├─ WhatsApp: Phone Number ID, Business Account ID, Access Token
│  ├─ Instagram: Account ID, Access Token
│  └─ Facebook: Page ID, Page Access Token
└─ Test koneksi untuk setiap platform

STEP 2: AUTO REPLY (Opsional)
├─ Buat aturan auto reply
├─ Pilih platform (WA/IG/FB)
├─ Set trigger (keyword/greeting/all messages)
├─ Set response (text/image/video/template)
├─ Set jam kerja (opsional)
└─ Aktifkan

STEP 3: CONTACT MANAGEMENT
├─ Import kontak dari Excel
├─ Buat grup kontak
├─ Tambah custom fields & tags
└─ Manage kontak otomatis dari chat masuk

STEP 4: BROADCAST
├─ Buat broadcast campaign
├─ Pilih penerima (semua/grup/pilihan)
├─ Set pesan & media
├─ Kirim sekarang atau jadwalkan
└─ Monitor statistik real-time

STEP 5: MESSAGING
├─ View riwayat chat
├─ Balas pesan manual
├─ Kirim pesan template
└─ Track status (terkirim/dibaca)
```

### Detail Flow untuk User:

#### A. HALAMAN YANG BISA DIAKSES USER

```
/user/meta/settings
├─ Setup WhatsApp credentials
├─ Setup Instagram credentials
├─ Setup Facebook credentials
├─ Test connection untuk setiap platform
└─ Disconnect platform

/user/meta/auto-reply
├─ List semua auto reply rules milik user
├─ Create new auto reply
├─ Edit/Delete auto reply
├─ Toggle active/inactive
├─ Duplicate auto reply
└─ View statistics (berapa kali digunakan)

/user/meta/broadcast
├─ List semua broadcast milik user
├─ Create new broadcast
├─ View detail broadcast & statistik
├─ Cancel broadcast (jika scheduled)
└─ Delete broadcast

/user/meta/contacts
├─ List semua kontak milik user
├─ Create/Edit/Delete kontak
├─ Import kontak dari Excel
├─ Export kontak ke Excel
├─ Create contact groups
├─ Add custom fields & tags
├─ Block/Unblock kontak
└─ Bulk delete

/user/meta/messages
├─ View riwayat pesan per platform
├─ Send message manual (WhatsApp/Instagram/Facebook)
├─ Filter by platform/date/contact
└─ Track message status
```

#### B. HAK AKSES USER

**✅ User BISA:**
- View hanya data miliknya sendiri
- Create auto reply/broadcast/contact baru
- Edit/Delete hanya miliknya
- Send message ke contacts miliknya
- Import/Export contacts miliknya
- View statistics miliknya

**❌ User TIDAK BISA:**
- Lihat data user lain
- Edit/Delete data user lain
- Akses admin panel
- Change global settings
- View system logs

#### C. KEAMANAN & ISOLASI DATA

Sistem menggunakan **Laravel Authorization Policies**:

```php
// Contoh: User hanya bisa update auto reply miliknya
if ($autoReply->user_id !== auth()->id()) {
    abort(403, 'Unauthorized');
}
```

Semua query di-filter otomatis:

```php
// User hanya melihat auto reply miliknya
MetaAutoReply::where('user_id', auth()->id())->get();
```

---

## 🏢 SETUP META DEVELOPER CONSOLE

### STEP 1: Buat Aplikasi Meta

**Screenshot yang Anda berikan menunjukkan aplikasi "ChatCepat" sudah dibuat!**

Informasi dari screenshot:
- **App Name:** ChatCepat
- **App ID:** 2210262782822425
- **App Mode:** Development → **Live**
- **App Type:** Business

### LANGKAH-LANGKAH:

#### 1.1 Akses Meta Developer Console

```
URL: https://developers.facebook.com/apps/
```

Yang terlihat di screenshot Anda:
- Dashboard sudah terbuka
- App "ChatCepat" sudah dalam mode Development
- App ID: 2210262782822425

#### 1.2 Add Products ke Aplikasi

Di sidebar kiri screenshot Anda terlihat:
- **Products** → Add Product
- **Facebook Login for Business** (sudah ada)
- **WhatsApp** (perlu dikonfigurasi)
- **Instagram** (perlu dikonfigurasi)

**Langkah untuk menambahkan produk:**

1. Klik **"Add Product"** di bagian Products
2. Pilih produk yang ingin ditambahkan:
   - ✅ **WhatsApp** → Klik "Set Up"
   - ✅ **Instagram** → Klik "Set Up"
   - ✅ **Messenger** (Facebook sudah otomatis included)

#### 1.3 Get App Secret

1. Klik **App settings** di sidebar
2. Klik **Basic**
3. Copy **App ID** dan **App Secret**
4. Simpan untuk digunakan di `.env`:

```env
META_APP_ID=2210262782822425
META_APP_SECRET=your_app_secret_here
```

---

## 📱 KONFIGURASI WHATSAPP BUSINESS API

### STEP 2: Setup WhatsApp

#### 2.1 Buka WhatsApp Product

1. Di sidebar, expand **"WhatsApp"**
2. Klik **"Getting Started"** atau **"API Setup"**

#### 2.2 Buat atau Hubungkan Business Account

**Opsi A: Buat Business Account Baru**
```
1. Klik "Create Business Account"
2. Isi nama bisnis
3. Pilih kategori bisnis
4. Verifikasi
```

**Opsi B: Gunakan Business Account yang Ada**
```
1. Klik "Use Existing Business Account"
2. Pilih dari dropdown
3. Authorize access
```

#### 2.3 Dapatkan Test Phone Number (Development)

Untuk mode Development, Meta menyediakan test phone number:

```
1. Di "WhatsApp" → "Getting Started"
2. Lihat bagian "Send and receive messages"
3. Ada test phone number (contoh: +1 555 0100)
4. Copy Phone Number ID
```

**Screenshot akan menampilkan:**
```
┌─────────────────────────────────────┐
│ Send and receive messages           │
│                                     │
│ From: +1 555 0100                   │
│ Phone number ID: 123456789012345    │
│                                     │
│ To: [Your WhatsApp Number]          │
│ Message template: hello_world       │
│                                     │
│ [Send Message]                      │
└─────────────────────────────────────┘
```

#### 2.4 Dapatkan Kredensial WhatsApp

Copy informasi berikut:

1. **Phone Number ID:**
   ```
   Location: WhatsApp → API Setup → Phone Number ID
   Format: 123456789012345
   ```

2. **WhatsApp Business Account ID:**
   ```
   Location: WhatsApp → API Setup → Business Account ID
   Format: 123456789012345
   ```

3. **Access Token (Temporary - untuk development):**
   ```
   Location: WhatsApp → API Setup → Temporary Access Token
   Format: EAAxxxxxxxxxxxxxxxxxxxxxxxx
   Valid: 24 jam (untuk testing)
   ```

   **⚠️ PENTING:** Token temporary hanya valid 24 jam!

   **Untuk Produksi, gunakan System User Token:**

   1. Pergi ke **Business Settings** (klik ikon gear di kanan atas)
   2. Klik **Users** → **System Users**
   3. Klik **Add** → Buat system user baru
   4. Assign assets → Pilih WhatsApp Business Account
   5. Generate token → Pilih permissions:
      - `whatsapp_business_management`
      - `whatsapp_business_messaging`
   6. Copy token (token ini permanent)

#### 2.5 Simpan Kredensial di `.env`

```env
# WhatsApp Business API
META_WHATSAPP_PHONE_NUMBER_ID=123456789012345
META_WHATSAPP_BUSINESS_ACCOUNT_ID=123456789012345
META_ACCESS_TOKEN=EAAxxxxxxxxxxxxxxxxxxxxxxxx
```

---

## 📸 KONFIGURASI INSTAGRAM MESSAGING API

### STEP 3: Setup Instagram

#### 3.1 Buka Instagram Product

1. Di sidebar Meta Developer Console, expand **"Instagram"**
2. Klik **"Getting Started"** atau **"Basic Display"**

**⚠️ REQUIREMENT:**
- Instagram account harus **Business Account** atau **Creator Account**
- Account harus terhubung ke Facebook Page

#### 3.2 Connect Instagram to Facebook Page

1. Buka **Facebook Page Settings**
2. Pergi ke **Instagram**
3. Klik **Connect Account**
4. Login dengan Instagram Business Account
5. Authorize connection

#### 3.3 Enable Instagram Messaging

1. Di Meta Developer Console → **Instagram** → **Messenger API**
2. Klik **Get Started**
3. Select Facebook Page yang terhubung dengan Instagram
4. Subscribe to webhooks (nanti di step webhook)

#### 3.4 Dapatkan Instagram Credentials

1. **Instagram Account ID:**
   ```
   Location: Instagram → Settings → Instagram accounts
   Format: 17841400000000000 (17 digits)
   ```

2. **Page Access Token:**
   ```
   Location: Tools → Graph API Explorer

   Steps:
   1. Select Application: ChatCepat
   2. Select User or Page → Pilih Facebook Page yang connected
   3. Get Page Access Token
   4. Permissions needed:
      - instagram_basic
      - instagram_manage_messages
      - instagram_manage_comments
      - pages_manage_metadata
      - pages_read_engagement
   5. Click "Generate Access Token"
   6. Copy token
   ```

   **Untuk permanent token:**
   ```
   1. Tools → Access Token Debugger
   2. Paste token
   3. Click "Debug"
   4. Click "Extend Access Token"
   5. Copy extended token (valid 60 days)

   Atau gunakan System User Token (permanent):
   - Business Settings → System Users
   - Generate token dengan permissions di atas
   ```

#### 3.5 Simpan Kredensial di `.env`

```env
# Instagram Messaging API
META_INSTAGRAM_ACCOUNT_ID=17841400000000000
META_ACCESS_TOKEN=EAAxxxxxxxxxxxxxxxxxxxxxxxx
```

---

## 💬 KONFIGURASI FACEBOOK MESSENGER API

### STEP 4: Setup Facebook Messenger

#### 4.1 Buka Messenger Product

Messenger otomatis included di aplikasi Business type.

1. Di sidebar, cari **"Messenger"**
2. Klik **"Settings"**

#### 4.2 Select Facebook Page

1. Klik **"Add or Remove Pages"**
2. Pilih Facebook Page yang ingin digunakan
3. Klik **"Add Page"**
4. Authorize permissions:
   - `pages_messaging`
   - `pages_manage_metadata`
   - `pages_read_engagement`

#### 4.3 Dapatkan Facebook Credentials

1. **Facebook Page ID:**
   ```
   Location: Facebook Page → About → More Info

   Atau via Graph API Explorer:
   1. Graph API Explorer → GET request
   2. Endpoint: /me/accounts
   3. Response akan contain page ID dan page access token
   ```

2. **Page Access Token:**
   ```
   Location: Messenger → Settings → Access Tokens

   Steps:
   1. Messenger Settings
   2. Scroll ke "Access Tokens" section
   3. Select your Facebook Page
   4. Click "Generate Token"
   5. Authorize
   6. Copy Page Access Token
   ```

   **⚠️ Token by default tidak permanent!**

   **Untuk permanent token:**
   ```
   Method 1: Via System User (RECOMMENDED)
   1. Business Settings → System Users
   2. Create system user
   3. Assign Facebook Page asset
   4. Generate token dengan permissions:
      - pages_messaging
      - pages_manage_metadata
      - pages_read_engagement
   5. Token ini permanent!

   Method 2: Exchange untuk long-lived token
   1. Tools → Access Token Debugger
   2. Paste short-lived token
   3. "Extend Access Token"
   4. Token valid 60 hari
   ```

#### 4.4 Simpan Kredensial di `.env`

```env
# Facebook Messenger API
META_FACEBOOK_PAGE_ID=123456789012345
META_FACEBOOK_PAGE_ACCESS_TOKEN=EAAxxxxxxxxxxxxxxxxxxxxxxxx
```

---

## 🔗 SETUP WEBHOOK

### STEP 5: Konfigurasi Webhook

Webhook digunakan untuk menerima pesan masuk, status updates, dll.

#### 5.1 Setup Webhook di Meta Developer Console

**Untuk WhatsApp:**

1. Pergi ke **WhatsApp** → **Configuration**
2. Di section **Webhook**, klik **Edit**
3. Isi Callback URL:
   ```
   https://yourdomain.com/api/meta/webhook
   ```
4. Isi Verify Token (password yang Anda tentukan):
   ```
   your_secret_verify_token_12345
   ```
5. Klik **Verify and Save**
6. Subscribe to webhook fields:
   - ✅ `messages` (untuk menerima pesan)
   - ✅ `message_status` (untuk status: delivered, read, failed)

7. Klik **Subscribe**

**Untuk Instagram:**

1. Pergi ke **Instagram** → **Configuration**
2. Setup sama seperti WhatsApp:
   - Callback URL: `https://yourdomain.com/api/meta/webhook`
   - Verify Token: `your_secret_verify_token_12345`
3. Subscribe to webhook fields:
   - ✅ `messages`
   - ✅ `messaging_postbacks`
   - ✅ `message_reads`

**Untuk Facebook Messenger:**

1. Pergi ke **Messenger** → **Settings** → **Webhooks**
2. Klik **Add Callback URL**
3. Isi:
   - Callback URL: `https://yourdomain.com/api/meta/webhook`
   - Verify Token: `your_secret_verify_token_12345`
4. Klik **Verify and Save**
5. Subscribe to page:
   - Select your Facebook Page
   - Klik **Subscribe**
6. Subscribe to webhook fields:
   - ✅ `messages`
   - ✅ `messaging_postbacks`
   - ✅ `message_reads`
   - ✅ `message_deliveries`

#### 5.2 Simpan Verify Token di `.env`

```env
# Webhook Configuration
META_WEBHOOK_VERIFY_TOKEN=your_secret_verify_token_12345
```

#### 5.3 Verifikasi Webhook

Meta akan melakukan GET request ke URL Anda:

```
GET https://yourdomain.com/api/meta/webhook?
    hub.mode=subscribe&
    hub.challenge=1234567890&
    hub.verify_token=your_secret_verify_token_12345
```

ChatCepat akan otomatis respond dengan `hub.challenge` jika verify token cocok.

Jika berhasil, status webhook akan menjadi **"Active" ✅**

#### 5.4 Test Webhook

Setelah webhook active, test dengan:

1. **WhatsApp:** Kirim pesan ke test phone number
2. **Instagram:** Send DM ke Instagram Business Account
3. **Facebook:** Send message ke Facebook Page

Cek di logs bahwa webhook menerima data.

---

## ⚙️ KONFIGURASI DI CHATCEPAT

### STEP 6: Setup Credentials di ChatCepat

#### 6.1 Login sebagai User

```
1. Login ke ChatCepat
2. Role: User (bukan admin)
```

#### 6.2 Pergi ke Settings

```
URL: https://yourdomain.com/user/meta/settings
```

Interface akan menampilkan 3 tab:
```
┌─────────────────────────────────────────┐
│ Meta Platform Settings                  │
├─────────────────────────────────────────┤
│ [WhatsApp]  [Instagram]  [Facebook]     │
├─────────────────────────────────────────┤
│ WhatsApp Business API                   │
│                                         │
│ Phone Number ID                         │
│ ┌─────────────────────────────────────┐ │
│ │ 123456789012345                     │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ Business Account ID                     │
│ ┌─────────────────────────────────────┐ │
│ │ 123456789012345                     │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ Access Token                            │
│ ┌─────────────────────────────────────┐ │
│ │ ****************************abc123  │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ [Test Connection]  [Save]               │
└─────────────────────────────────────────┘
```

#### 6.3 Isi Kredensial WhatsApp

```
Phone Number ID: 123456789012345
Business Account ID: 123456789012345
Access Token: EAAxxxxxxxxxxxxxxxxxxxxxxxx
```

Klik **Test Connection**:
- ✅ Success: "WhatsApp connection successful!"
- ❌ Failed: "Failed to connect. Please check your credentials."

Jika success, klik **Save**.

#### 6.4 Isi Kredensial Instagram

Switch ke tab **Instagram**:

```
Instagram Account ID: 17841400000000000
Access Token: EAAxxxxxxxxxxxxxxxxxxxxxxxx
```

Klik **Test Connection** → Klik **Save**

#### 6.5 Isi Kredensial Facebook

Switch ke tab **Facebook**:

```
Facebook Page ID: 123456789012345
Page Access Token: EAAxxxxxxxxxxxxxxxxxxxxxxxx
```

Klik **Test Connection** → Klik **Save**

#### 6.6 Verifikasi di Database

Sistem akan menyimpan ke `users` table:

```sql
UPDATE users SET
  meta_whatsapp_phone_number_id = '123456789012345',
  meta_whatsapp_business_account_id = '123456789012345',
  meta_instagram_account_id = '17841400000000000',
  meta_facebook_page_id = '123456789012345',
  meta_facebook_page_access_token = 'EAAxxxxxxxxxxxxxxxxxxxxxxxx',
  meta_access_token = 'EAAxxxxxxxxxxxxxxxxxxxxxxxx'
WHERE id = {user_id};
```

**Security:** Token di-encrypt di database!

---

## 🎯 FITUR-FITUR YANG TERSEDIA

### FITUR 1: Auto Reply

#### Cara Menggunakan:

1. **Pergi ke Auto Reply**
   ```
   URL: /user/meta/auto-reply
   ```

2. **Klik "Create New Auto Reply"**

3. **Isi Form:**

   ```
   ┌─────────────────────────────────────────┐
   │ Create Auto Reply                       │
   ├─────────────────────────────────────────┤
   │ Platform                                │
   │ ○ WhatsApp  ○ Instagram  ○ Facebook     │
   │                                         │
   │ Trigger Type                            │
   │ ● Keyword  ○ Greeting  ○ Away  ○ All    │
   │                                         │
   │ Keywords (comma-separated)              │
   │ ┌─────────────────────────────────────┐ │
   │ │ harga, price, info                  │ │
   │ └─────────────────────────────────────┘ │
   │                                         │
   │ Match Type                              │
   │ ● Contains  ○ Exact  ○ Starts  ○ Ends   │
   │                                         │
   │ Reply Type                              │
   │ ● Text  ○ Image  ○ Template             │
   │                                         │
   │ Reply Message                           │
   │ ┌─────────────────────────────────────┐ │
   │ │ Halo! Terima kasih atas pertanyaan  │ │
   │ │ Anda tentang harga produk kami.     │ │
   │ │ Silakan kunjungi: website.com       │ │
   │ └─────────────────────────────────────┘ │
   │                                         │
   │ Business Hours (Optional)               │
   │ Days: [✓] Mon [✓] Tue ... [✓] Fri       │
   │ Start: 09:00  End: 18:00                │
   │                                         │
   │ Priority (1-10): 5                      │
   │                                         │
   │ [✓] Reply only to first message         │
   │ [✓] Active                              │
   │                                         │
   │ [Cancel]  [Save]                        │
   └─────────────────────────────────────────┘
   ```

4. **Klik Save**

#### Cara Kerja Auto Reply:

```
Customer kirim: "Halo, berapa harga produk A?"
                    ↓
Webhook ChatCepat menerima pesan
                    ↓
Cek auto reply rules user
                    ↓
Match keyword "harga" (contains)
                    ↓
Cek business hours (jika diset)
                    ↓
Kirim auto reply: "Halo! Terima kasih..."
                    ↓
Increment usage count
```

#### Trigger Types:

- **Keyword:** Reply jika pesan mengandung keyword tertentu
- **Greeting:** Reply jika pesan adalah sapaan (hi, hello, halo, dll)
- **Away:** Reply jika di luar jam kerja
- **All:** Reply untuk semua pesan masuk

#### Match Types:

- **Contains:** Keyword ada di mana saja dalam pesan
- **Exact:** Pesan harus persis sama dengan keyword
- **Starts With:** Pesan dimulai dengan keyword
- **Ends With:** Pesan diakhiri dengan keyword

---

### FITUR 2: Broadcast

#### Cara Menggunakan:

1. **Pergi ke Broadcast**
   ```
   URL: /user/meta/broadcast
   ```

2. **Klik "Create New Broadcast"**

3. **Isi Form:**

   ```
   ┌─────────────────────────────────────────┐
   │ Create Broadcast Campaign               │
   ├─────────────────────────────────────────┤
   │ Campaign Name                           │
   │ ┌─────────────────────────────────────┐ │
   │ │ Promo Lebaran 2026                  │ │
   │ └─────────────────────────────────────┘ │
   │                                         │
   │ Platform                                │
   │ ● WhatsApp  ○ Instagram  ○ Facebook     │
   │                                         │
   │ Message Type                            │
   │ ● Text  ○ Image  ○ Template             │
   │                                         │
   │ Message Content                         │
   │ ┌─────────────────────────────────────┐ │
   │ │ 🎉 PROMO LEBARAN 2026! 🎉           │ │
   │ │                                     │ │
   │ │ Diskon 50% untuk semua produk!      │ │
   │ │ Buruan order sebelum kehabisan!     │ │
   │ │                                     │ │
   │ │ Kunjungi: website.com/promo         │ │
   │ └─────────────────────────────────────┘ │
   │                                         │
   │ Recipients                              │
   │ ● All Contacts                          │
   │ ○ Specific Groups                       │
   │ ○ Selected Contacts                     │
   │                                         │
   │ Total Recipients: 1,234 contacts        │
   │                                         │
   │ Schedule                                │
   │ ● Send Now                              │
   │ ○ Schedule for later                    │
   │                                         │
   │ [Cancel]  [Send Broadcast]              │
   └─────────────────────────────────────────┘
   ```

4. **Klik Send Broadcast**

#### Monitoring Broadcast:

Setelah broadcast terkirim, lihat statistik real-time:

```
┌─────────────────────────────────────────┐
│ Promo Lebaran 2026                      │
├─────────────────────────────────────────┤
│ Status: Completed                       │
│ Platform: WhatsApp                      │
│ Sent at: 2026-01-27 14:30:00           │
├─────────────────────────────────────────┤
│ Statistics:                             │
│                                         │
│ Total Recipients:   1,234               │
│ ✅ Sent:            1,230  (99.7%)      │
│ ❌ Failed:              4  (0.3%)       │
│ 📨 Delivered:       1,150  (93.5%)      │
│ 👁️ Read:             890  (72.3%)       │
│                                         │
│ [View Details]  [Export Report]         │
└─────────────────────────────────────────┘
```

#### Rate Limiting:

Sistem otomatis implement rate limiting:
- **WhatsApp:** 1 message per second (sesuai Meta policy)
- **Instagram:** 1 message per second
- **Facebook:** 1 message per second

---

### FITUR 3: Contact Management

#### Cara Menggunakan:

1. **Pergi ke Contacts**
   ```
   URL: /user/meta/contacts
   ```

2. **Import Kontak dari Excel:**

   ```
   File format (.xlsx atau .csv):

   name      | phone          | email              | tags
   ----------|----------------|--------------------|----------
   John Doe  | 628123456789   | john@email.com     | customer,vip
   Jane Doe  | 628987654321   | jane@email.com     | prospect
   ```

   Upload file → Klik Import

3. **Create Contact Group:**

   ```
   ┌─────────────────────────────────────────┐
   │ Create Contact Group                    │
   ├─────────────────────────────────────────┤
   │ Group Name                              │
   │ ┌─────────────────────────────────────┐ │
   │ │ VIP Customers                       │ │
   │ └─────────────────────────────────────┘ │
   │                                         │
   │ Description                             │
   │ ┌─────────────────────────────────────┐ │
   │ │ High-value customers with 10+       │ │
   │ │ transactions                        │ │
   │ └─────────────────────────────────────┘ │
   │                                         │
   │ Platform                                │
   │ ● WhatsApp  ○ Instagram  ○ Facebook     │
   │                                         │
   │ Color Tag                               │
   │ [🔴] [🟠] [🟡] [🟢] [🔵] [🟣]           │
   │                                         │
   │ [Cancel]  [Save]                        │
   └─────────────────────────────────────────┘
   ```

4. **Add Contacts to Group:**

   - Select contacts dari list
   - Klik "Add to Group"
   - Pilih group
   - Klik Save

#### Auto Contact Creation:

Kontak otomatis dibuat saat:
- Ada pesan masuk pertama kali dari nomor/user baru
- Webhook menerima pesan → Sistem cek apakah contact exists
- Jika tidak ada → Create contact baru otomatis

---

### FITUR 4: Messaging

#### Cara Menggunakan:

1. **Pergi ke Messages**
   ```
   URL: /user/meta/messages
   ```

2. **View Message History:**

   ```
   ┌─────────────────────────────────────────┐
   │ Messages                                │
   ├─────────────────────────────────────────┤
   │ [WhatsApp] [Instagram] [Facebook]       │
   ├─────────────────────────────────────────┤
   │ Search: ┌──────────────┐  [🔍]          │
   │         └──────────────┘                │
   │                                         │
   │ ┌─────────────────────────────────────┐ │
   │ │ 📱 628123456789                     │ │
   │ │ John Doe                            │ │
   │ │ Last message: 5 minutes ago         │ │
   │ │ "Terima kasih untuk infonya"        │ │
   │ └─────────────────────────────────────┘ │
   │                                         │
   │ ┌─────────────────────────────────────┐ │
   │ │ 📱 628987654321                     │ │
   │ │ Jane Doe                            │ │
   │ │ Last message: 1 hour ago            │ │
   │ │ "Berapa harga produk A?"            │ │
   │ └─────────────────────────────────────┘ │
   │                                         │
   └─────────────────────────────────────────┘
   ```

3. **Send Manual Reply:**

   Klik contact → Chat window terbuka:

   ```
   ┌─────────────────────────────────────────┐
   │ Chat with John Doe                      │
   │ 📱 628123456789                         │
   ├─────────────────────────────────────────┤
   │                                         │
   │      Halo, berapa harga produk A?   📱  │
   │      10:30 AM  ✓✓                       │
   │                                         │
   │  📱  Harganya Rp 100.000 kak            │
   │      10:31 AM  ✓✓ (Auto Reply)          │
   │                                         │
   │      Terima kasih untuk infonya      📱  │
   │      10:35 AM  ✓✓                       │
   │                                         │
   ├─────────────────────────────────────────┤
   │ Type message...                         │
   │ ┌─────────────────────────────────────┐ │
   │ │                                     │ │
   │ └─────────────────────────────────────┘ │
   │ [📎] [😊] [📸]              [Send ➤]    │
   └─────────────────────────────────────────┘
   ```

#### Message Status:

- ✓ Sent
- ✓✓ Delivered
- ✓✓ (blue) Read

---

## 📊 STATISTIK & MONITORING

### Auto Reply Statistics

```
┌─────────────────────────────────────────┐
│ Auto Reply Performance                  │
├─────────────────────────────────────────┤
│ Keyword: "harga, price, info"           │
│ Total Usage: 1,234 times                │
│ Success Rate: 98.5%                     │
│ Avg Response Time: 0.5s                 │
│                                         │
│ Top Trigger Times:                      │
│ 📊 10:00 - 12:00  (35%)                 │
│ 📊 14:00 - 16:00  (40%)                 │
│ 📊 19:00 - 21:00  (25%)                 │
└─────────────────────────────────────────┘
```

### Broadcast Analytics

```
┌─────────────────────────────────────────┐
│ Broadcast Performance                   │
├─────────────────────────────────────────┤
│ Campaign: Promo Lebaran 2026            │
│                                         │
│ Delivery Rate:    99.7%  ✅             │
│ Open Rate:        72.3%  ⭐             │
│ Click Rate:       15.2%  🔗             │
│ Conversion Rate:   8.5%  💰             │
│                                         │
│ Revenue Generated: Rp 50,000,000        │
│ ROI: 450%                               │
└─────────────────────────────────────────┘
```

---

## 🔒 KEAMANAN

### Data Isolation

Setiap user memiliki:
- ✅ Kredensial terpisah
- ✅ Auto reply terpisah
- ✅ Broadcast terpisah
- ✅ Kontak terpisah
- ✅ Pesan terpisah

### Authorization

```php
// Setiap request di-check
if ($autoReply->user_id !== auth()->id()) {
    abort(403, 'Unauthorized');
}
```

### Token Security

- Token di-encrypt di database
- Token di-mask di UI (hanya 8 char terakhir visible)
- Webhook signature verification (HMAC-SHA256)

---

## 🚀 NEXT STEPS UNTUK USER

### Langkah-Langkah Setelah Setup:

1. **✅ Setup Credentials** (Meta Developer Console → ChatCepat Settings)
2. **✅ Test Connection** untuk semua platform
3. **✅ Configure Webhook** di Meta Developer Console
4. **✅ Create First Auto Reply** untuk testing
5. **✅ Import Contacts** dari Excel atau manual
6. **✅ Send Test Broadcast** ke 1-2 kontak
7. **✅ Monitor Statistics**
8. **✅ Optimize Auto Reply** based on usage
9. **✅ Scale Broadcasts** ke lebih banyak kontak
10. **✅ Enjoy!** 🎉

---

## ❓ TROUBLESHOOTING

### Problem 1: Webhook Tidak Menerima Pesan

**Solusi:**
```
1. Cek webhook URL di Meta Developer Console
2. Pastikan URL menggunakan HTTPS (bukan HTTP)
3. Verify token harus sama dengan .env
4. Cek firewall/server tidak block Meta IPs
5. Test webhook dengan Meta's "Test" button
```

### Problem 2: Auto Reply Tidak Terkirim

**Solusi:**
```
1. Cek auto reply status = active
2. Cek keyword matching (case-sensitive?)
3. Cek business hours setting
4. Cek access token masih valid
5. Cek logs untuk error messages
```

### Problem 3: Broadcast Failed

**Solusi:**
```
1. Cek recipient contacts valid
2. Cek access token masih valid
3. Cek message format sesuai platform
4. Cek rate limiting (max 1/second)
5. Cek quota Meta API
```

### Problem 4: Token Expired

**Solusi:**
```
1. Gunakan System User Token (permanent)
2. Atau extend short-lived token
3. Update token di Settings
4. Test connection ulang
```

---

## 📞 SUPPORT

Jika ada masalah:
1. Cek documentation ini
2. Cek logs di server
3. Contact admin/developer

---

**🎉 SELAMAT! Sistem Meta Apps SaaS ChatCepat siap digunakan!**
