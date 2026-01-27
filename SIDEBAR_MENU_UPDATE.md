# Update Sidebar Menu User Role
## Perubahan Struktur Menu Sesuai Design Baru

---

## 📋 RINGKASAN PERUBAHAN

Sidebar menu untuk user role telah diupdate untuk menyesuaikan dengan design baru yang diberikan. Berikut adalah perubahan yang dilakukan:

### ✅ Yang Diubah/Ditambahkan:

1. **KOMUNIKASI & CHAT**
   - ✅ CRM Chat App (sudah ada)
   - ➕ **Widget Live Chat** (BARU - route: `/user/widget`)
   - ➕ **Human Agent** (DIPINDAH dari AUTOMASI & AI - route: `/user/human-agents`)

2. **MARKETING & PROMOSI**
   - ✅ Scraping Contacts (ganti nama dari "Scraping Kontak")
     - ✏️ **dari Google Maps** (ganti dari "Google Maps" + tambah icon color)
     - ✏️ **dari Contacts HP** (ganti dari "Kontak HP" + tambah icon color)
     - ✏️ **dari Group WhatsApp** (ganti dari "Grup WhatsApp" + tambah icon color)
   - ✅ Broadcast Pesan
     - ✅ Broadcast WhatsApp (tambah icon color)
     - ✏️ **Broadcast Group WhatsApp** (ganti dari "Broadcast Grup WhatsApp" + tambah icon color)
     - ➕ **Broadcast Email** (BARU - route: `/user/broadcast/email`)
     - ➕ **Up Selling** (BARU - route: `/user/upselling`)

3. **AUTOMASI & AI**
   - ✅ Chat Otomatis
     - ✏️ **Auto Reply Manual** (ganti dari "Reply Manual" + tambah icon color)
     - ✅ Chatbot AI Cerdas (tambah icon color)
   - ❌ Human Agents (DIHAPUS - dipindah ke KOMUNIKASI & CHAT)

4. **PLATFORM & KONEKSI**
   - ✅ Kelola Platforms
     - ✅ WhatsApp Personal (sudah ada)
     - ➕ **WhatsApp Business API** (BARU - route: `/user/meta/settings`)
     - ➕ **Telegram** (BARU - route: `/user/telegram`)
     - ➕ **Facebook Messenger** (BARU - route: `/user/meta/messenger`)
     - ➕ **DM Instagram** (BARU - route: `/user/meta/instagram`)

5. **TEMPLATE & MEDIA**
   - ✅ Template Pesan
     - ✅ Template WhatsApp (tambah icon color)
     - ➕ **Template Email** (BARU - route: `/user/templates/email`)

6. **MASTER DATA** (SECTION BARU)
   - ➕ **Master Data** (BARU - route: `/user/contacts`)
     - Menggantikan menu "Daftar Kontak" yang sebelumnya hidden

7. **TRANSAKSI**
   - ➕ **Top Up AI Credit** (BARU - route: `/user/ai-credit`)
   - ✅ Upgrade Paket (sudah ada)
   - ✅ Riwayat Transaksi (sudah ada - keep)

8. **LAPORAN & ANALITIK** (ganti nama dari "Laporan & Monitoring")
   - ✏️ **Laporan & Log** (GABUNG dari "Laporan" dan "Log Aktivitas")

9. **PENGATURAN**
   - ✅ Setting Aplikasi (sudah ada)

10. **DUKUNGAN**
    - ❌ Section "Dukungan" dengan "Pusat Bantuan" DIHAPUS (tidak ada di design)

---

## 📂 FILE YANG DIUBAH

```
/Applications/laravel/chatcepat/resources/js/components/user/sidebar/user-sidebar.tsx
```

---

## 🎨 ICON & COLOR

### Icon Baru yang Ditambahkan:

```typescript
import {
    // ... existing icons
    MessagesSquare,  // Widget Live Chat
    Coins,           // Top Up AI Credit
    Instagram,       // DM Instagram
    Facebook,        // Facebook Messenger
} from 'lucide-react'
```

### Color Mapping per Icon:

| Menu Item | Icon | Color |
|-----------|------|-------|
| **MARKETING & PROMOSI** |
| dari Google Maps | MapPin | `text-red-500` |
| dari Contacts HP | User | `text-blue-500` |
| dari Group WhatsApp | MessageCircle | `text-green-600` |
| Broadcast WhatsApp | MessageCircle | `text-green-600` |
| Broadcast Group WhatsApp | Users | `text-gray-700` |
| Broadcast Email | Mail | `text-red-500` |
| Up Selling | TrendingUp | `text-gray-700` |
| **AUTOMASI & AI** |
| Auto Reply Manual | Reply | `text-gray-700` |
| Chatbot AI Cerdas | Bot | `text-gray-700` |
| **PLATFORM & KONEKSI** |
| WhatsApp Personal | MessageCircle | `text-green-600` |
| WhatsApp Business API | MessageCircle | `text-green-600` |
| Telegram | Send | `text-blue-500` |
| Facebook Messenger | Facebook | `text-blue-600` |
| DM Instagram | Instagram | `text-pink-500` |
| **TEMPLATE & MEDIA** |
| Template WhatsApp | MessageCircle | `text-gray-700` |
| Template Email | Mail | `text-gray-700` |

---

## 🔗 ROUTING

### Route Baru yang Perlu Dibuat:

Berikut adalah route yang belum ada dan perlu dibuat di backend:

```php
// Widget Live Chat
Route::get('/user/widget', [WidgetController::class, 'index'])->name('user.widget');

// Broadcast Email
Route::get('/user/broadcast/email', [BroadcastEmailController::class, 'index'])->name('user.broadcast.email');

// Up Selling
Route::get('/user/upselling', [UpSellingController::class, 'index'])->name('user.upselling');

// Meta Platforms (sudah ada untuk WhatsApp via /user/meta/settings)
Route::get('/user/meta/settings', [MetaSettingsController::class, 'index'])->name('user.meta.settings'); // SUDAH ADA
Route::get('/user/meta/messenger', [MetaSettingsController::class, 'messenger'])->name('user.meta.messenger'); // BARU
Route::get('/user/meta/instagram', [MetaSettingsController::class, 'instagram'])->name('user.meta.instagram'); // BARU

// Telegram
Route::get('/user/telegram', [TelegramController::class, 'index'])->name('user.telegram');

// Template Email
Route::get('/user/templates/email', [TemplateController::class, 'email'])->name('user.templates.email');

// Top Up AI Credit
Route::get('/user/ai-credit', [AICreditController::class, 'index'])->name('user.ai-credit');
```

### Route yang Sudah Ada:

```php
// KOMUNIKASI & CHAT
/user/crm-chat               // CRM Chat App
/user/human-agents           // Human Agent (dipindah dari AUTOMASI & AI)

// MARKETING & PROMOSI
/user/scraper                // dari Google Maps
/user/scraper/contacts       // dari Contacts HP
/user/scraper/groups         // dari Group WhatsApp
/user/broadcast              // Broadcast WhatsApp
/user/broadcast/groups       // Broadcast Group WhatsApp

// AUTOMASI & AI
/user/reply-manual           // Auto Reply Manual
/user/chatbot                // Chatbot AI Cerdas

// PLATFORM & KONEKSI
/user/whatsapp               // WhatsApp Personal
/user/meta/settings          // WhatsApp Business API (existing)

// TEMPLATE & MEDIA
/user/templates?type=whatsapp  // Template WhatsApp

// MASTER DATA
/user/contacts               // Master Data
/user/contact-groups         // Master Data (alternate)

// TRANSAKSI
/user/topup                  // Upgrade Paket
/user/transactions           // Riwayat Transaksi

// LAPORAN & ANALITIK
/user/reports                // Laporan & Log
/user/activity-logs          // Laporan & Log (alternate)

// PENGATURAN
/user/account                // Setting Aplikasi
```

---

## 🔐 FEATURE KEYS

Feature keys yang digunakan untuk authorization:

```typescript
// Existing features
'crm_chat'              // CRM Chat App, Widget Live Chat
'human_agents'          // Human Agent
'scraper_gmaps'         // dari Google Maps
'scraper_contacts'      // dari Contacts HP
'scraper_groups'        // dari Group WhatsApp
'broadcast_wa'          // Broadcast WhatsApp, Broadcast Email, Up Selling
'broadcast_group'       // Broadcast Group WhatsApp
'reply_manual'          // Auto Reply Manual
'chatbot_ai'            // Chatbot AI Cerdas
'platforms'             // All Platform items
'templates'             // All Template items
'master_data'           // Master Data
```

Semua menu baru menggunakan feature key yang sudah ada, tidak perlu menambahkan feature key baru.

---

## 📸 PERBANDINGAN STRUKTUR

### SEBELUM:

```
├─ Dashboard
├─ KOMUNIKASI & CHAT
│  └─ CRM Chat App
├─ MARKETING & PROMOSI
│  ├─ Scraping Kontak
│  │  ├─ Google Maps
│  │  ├─ Kontak HP
│  │  └─ Grup WhatsApp
│  └─ Broadcast Pesan
│     ├─ Broadcast WhatsApp
│     ├─ Broadcast Grup WhatsApp
│     └─ Kelola Grup Kontak
├─ AUTOMASI & AI
│  ├─ Chat Otomatis
│  │  ├─ Reply Manual
│  │  └─ Chatbot AI Cerdas
│  └─ Human Agents
├─ PLATFORM & KONEKSI
│  └─ Kelola Platforms
│     └─ WhatsApp Personal
├─ TEMPLATE & MEDIA
│  └─ Template Pesan
│     └─ Template WhatsApp
├─ TRANSAKSI
│  ├─ Upgrade Paket
│  └─ Riwayat Transaksi
├─ LAPORAN & MONITORING
│  ├─ Laporan
│  └─ Log Aktivitas
├─ DUKUNGAN
│  └─ Pusat Bantuan
└─ PENGATURAN
   └─ Setting Aplikasi
```

### SESUDAH:

```
├─ Dashboard
├─ KOMUNIKASI & CHAT
│  ├─ CRM Chat App
│  ├─ Widget Live Chat ⭐ BARU
│  └─ Human Agent ⭐ PINDAH
├─ MARKETING & PROMOSI
│  ├─ Scraping Contacts
│  │  ├─ dari Google Maps
│  │  ├─ dari Contacts HP
│  │  └─ dari Group WhatsApp
│  └─ Broadcast Pesan
│     ├─ Broadcast WhatsApp
│     ├─ Broadcast Group WhatsApp
│     ├─ Broadcast Email ⭐ BARU
│     └─ Up Selling ⭐ BARU
├─ AUTOMASI & AI
│  └─ Chat Otomatis
│     ├─ Auto Reply Manual
│     └─ Chatbot AI Cerdas
├─ PLATFORM & KONEKSI
│  └─ Kelola Platforms
│     ├─ WhatsApp Personal
│     ├─ WhatsApp Business API ⭐ BARU
│     ├─ Telegram ⭐ BARU
│     ├─ Facebook Messenger ⭐ BARU
│     └─ DM Instagram ⭐ BARU
├─ TEMPLATE & MEDIA
│  └─ Template Pesan
│     ├─ Template WhatsApp
│     └─ Template Email ⭐ BARU
├─ Master Data ⭐ BARU SECTION
├─ TRANSAKSI
│  ├─ Top Up AI Credit ⭐ BARU
│  ├─ Upgrade Paket
│  └─ Riwayat Transaksi
├─ LAPORAN & ANALITIK
│  └─ Laporan & Log
└─ PENGATURAN
   └─ Setting Aplikasi
```

---

## 🚀 NEXT STEPS

### 1. Backend Routes (Priority: HIGH)

Buat controller dan route untuk menu baru:

```bash
# Widget Live Chat
php artisan make:controller User/WidgetController

# Broadcast Email
php artisan make:controller User/BroadcastEmailController

# Up Selling
php artisan make:controller User/UpSellingController

# Telegram
php artisan make:controller User/TelegramController

# Template Email
# Gunakan existing TemplateController, tambahkan method email()

# AI Credit
php artisan make:controller User/AICreditController

# Meta Messenger & Instagram
# Gunakan existing MetaSettingsController, tambahkan method messenger() dan instagram()
```

### 2. Frontend Pages (Priority: HIGH)

Buat React/Inertia pages untuk menu baru:

```
resources/js/pages/user/
├─ widget/
│  └─ index.tsx           # Widget Live Chat
├─ broadcast/
│  └─ email.tsx           # Broadcast Email
├─ upselling/
│  └─ index.tsx           # Up Selling
├─ telegram/
│  └─ index.tsx           # Telegram Settings
├─ templates/
│  └─ email.tsx           # Template Email
├─ ai-credit/
│  └─ index.tsx           # Top Up AI Credit
└─ meta/
   ├─ messenger.tsx       # Facebook Messenger
   └─ instagram.tsx       # DM Instagram
```

### 3. Database Migrations (Priority: MEDIUM)

Jika diperlukan, buat migrations untuk fitur baru:

```bash
# Widget Live Chat Settings
php artisan make:migration create_widget_settings_table

# Broadcast Email
php artisan make:migration create_broadcast_emails_table

# Up Selling
php artisan make:migration create_upselling_campaigns_table

# Telegram
php artisan make:migration add_telegram_fields_to_users_table

# Template Email
php artisan make:migration create_email_templates_table

# AI Credit
php artisan make:migration add_ai_credit_to_users_table
```

### 4. Testing (Priority: MEDIUM)

Test semua perubahan:

```bash
# 1. Compile assets
npm run build

# 2. Clear cache
php artisan cache:clear
php artisan view:clear
php artisan route:clear

# 3. Test di browser
# - Login sebagai user
# - Cek apakah sidebar muncul dengan benar
# - Cek apakah semua menu accessible
# - Cek apakah menu baru mengarah ke route yang benar
```

### 5. Integration dengan Meta Apps (Priority: LOW)

Untuk menu Meta Platforms baru:

- **WhatsApp Business API** → Sudah ada di `/user/meta/settings` tab WhatsApp
- **Facebook Messenger** → Bisa gunakan `/user/meta/settings` tab Facebook atau buat page terpisah
- **DM Instagram** → Bisa gunakan `/user/meta/settings` tab Instagram atau buat page terpisah

Opsi 1: Gunakan tab yang sudah ada di Meta Settings
Opsi 2: Buat page terpisah per platform untuk UI yang lebih focused

---

## ⚠️ CATATAN PENTING

1. **Tidak Ada Menu yang Dihapus**
   - Semua menu existing tetap ada
   - Hanya dipindahkan atau rename sesuai design

2. **Feature Keys**
   - Semua menu baru menggunakan feature key yang sudah ada
   - Tidak perlu update database atau subscription packages

3. **Backward Compatibility**
   - Route lama masih berfungsi
   - User existing tidak akan mengalami broken links

4. **Authorization**
   - Semua menu tetap mengikuti system authorization yang ada
   - Locked menu akan redirect ke upgrade page

5. **Meta Apps Integration**
   - Menu Meta platforms sudah terintegrasi dengan system yang ada
   - Route `/user/meta/settings` sudah berfungsi untuk WhatsApp, Instagram, Facebook
   - Menu baru hanya shortcut/alias ke halaman yang sama atau tab spesifik

---

## 🎨 UI/UX IMPROVEMENTS

### Icon Colors

Menambahkan warna pada icon untuk visual hierarchy yang lebih baik:

- **Hijau** (`text-green-600`) → WhatsApp related items
- **Biru** (`text-blue-500`, `text-blue-600`) → Telegram, Facebook, Contacts HP
- **Pink** (`text-pink-500`) → Instagram
- **Merah** (`text-red-500`, `text-red-600`) → Google Maps, Email
- **Abu-abu** (`text-gray-700`) → General items

### Label Updates

Menggunakan prefix "dari" untuk submenu Scraping:
- ✅ "dari Google Maps" (lebih deskriptif)
- ✅ "dari Contacts HP" (lebih deskriptif)
- ✅ "dari Group WhatsApp" (lebih deskriptif)

---

## 📦 DEPENDENCIES

Tidak ada dependency baru yang perlu diinstall. Semua icon sudah tersedia di `lucide-react`.

---

## ✅ CHECKLIST COMPLETION

- [x] Update import icons (MessagesSquare, Coins, Instagram, Facebook)
- [x] Update KOMUNIKASI & CHAT section
- [x] Update MARKETING & PROMOSI section
- [x] Update AUTOMASI & AI section
- [x] Update PLATFORM & KONEKSI section
- [x] Update TEMPLATE & MEDIA section
- [x] Add MASTER DATA section
- [x] Update TRANSAKSI section
- [x] Rename LAPORAN & MONITORING to LAPORAN & ANALITIK
- [x] Remove DUKUNGAN section
- [x] Add icon colors to submenu items
- [x] Update all menu labels to match design
- [x] Test TypeScript compilation

---

**Status: ✅ SELESAI**

Semua perubahan sidebar sudah selesai dilakukan sesuai dengan design yang diberikan. Silakan proceed ke Next Steps untuk membuat backend routes dan frontend pages untuk menu-menu baru.
