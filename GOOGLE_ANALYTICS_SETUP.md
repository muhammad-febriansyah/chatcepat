# Setup Google Analytics & Google Tag Manager

## ✅ Sudah Selesai
- Konfigurasi Google Analytics di `config/services.php`
- Script tracking sudah ditambahkan di `app.blade.php`
- Support Google Tag Manager (alternatif/advanced)

---

## 🚀 Cara Setup Google Analytics 4

### 1. Buat Google Analytics Property

1. Buka https://analytics.google.com
2. Klik **"Admin"** (gear icon di kiri bawah)
3. Pilih **"Create Property"**
4. Isi data:
   - **Property name:** ChatCepat
   - **Timezone:** (GMT+07:00) Bangkok, Hanoi, Jakarta
   - **Currency:** Indonesian Rupiah (IDR)
5. Klik **"Next"**
6. Pilih **Business details** (sesuaikan dengan bisnis Anda)
7. Klik **"Create"**
8. Accept terms & conditions
9. Pilih platform: **"Web"**
10. Isi:
    - **Website URL:** https://www.chatcepat.id
    - **Stream name:** ChatCepat Website
11. Klik **"Create stream"**

### 2. Dapatkan Measurement ID

Setelah stream dibuat, Anda akan melihat **Measurement ID** dengan format:
```
G-XXXXXXXXXX
```

Copy ID tersebut.

### 3. Tambahkan ke .env (Production)

Di server production, edit file `.env`:

```bash
nano .env
```

Tambahkan baris ini:
```env
GOOGLE_ANALYTICS_ID=G-XXXXXXXXXX
```

Ganti `G-XXXXXXXXXX` dengan Measurement ID Anda.

### 4. Clear Cache

```bash
php artisan config:clear
php artisan config:cache
```

### 5. Test Analytics

1. Buka website: https://www.chatcepat.id
2. Di Google Analytics, buka **Reports** → **Realtime**
3. Anda akan melihat visitor realtime (diri Anda sendiri)

---

## 🏷️ Setup Google Tag Manager (Opsional - Advanced)

Google Tag Manager (GTM) adalah alternatif yang lebih powerful untuk manage tracking codes tanpa edit kode.

### 1. Buat GTM Account

1. Buka https://tagmanager.google.com
2. Klik **"Create Account"**
3. Isi:
   - **Account name:** ChatCepat
   - **Country:** Indonesia
4. Setup Container:
   - **Container name:** www.chatcepat.id
   - **Target platform:** Web
5. Klik **"Create"**
6. Accept terms

### 2. Dapatkan Container ID

Anda akan melihat **Container ID** dengan format:
```
GTM-XXXXXXX
```

Copy ID tersebut.

### 3. Tambahkan ke .env

```env
GOOGLE_TAG_MANAGER_ID=GTM-XXXXXXX
```

### 4. Setup Tags di GTM

Di GTM Dashboard:
1. Klik **"Add a new tag"**
2. Pilih **"Google Analytics: GA4 Configuration"**
3. Isi **Measurement ID**: `G-XXXXXXXXXX`
4. Triggering: **All Pages**
5. Save & Publish

**Keuntungan GTM:**
- Bisa tambah tracking tanpa edit kode
- Manage Facebook Pixel, Google Ads, dll dari satu tempat
- Event tracking lebih mudah
- A/B testing integration

---

## 📊 Metrics yang Perlu Dimonitor

### 1. Acquisition (Dari mana traffic datang)
- **Organic Search** - Traffic dari Google Search (target utama SEO)
- **Direct** - Orang ketik URL langsung
- **Referral** - Link dari website lain
- **Social** - Media sosial

### 2. Engagement
- **Views** - Berapa banyak pageview
- **Average engagement time** - Berapa lama user di website
- **Bounce rate** - Persentase user yang langsung keluar

### 3. Conversions
Setup Goals di GA4:
- **Sign Up** - User register
- **Purchase** - User beli paket
- **Contact Form Submit** - User kirim form contact

---

## 🎯 Setup Conversion Tracking (Recommended)

### Event: User Registration

Di GTM atau hardcode, track event signup:

```javascript
gtag('event', 'sign_up', {
    method: 'Email'
});
```

### Event: Purchase Package

```javascript
gtag('event', 'purchase', {
    transaction_id: 'TXN-12345',
    value: 299000,
    currency: 'IDR',
    items: [{
        item_id: 'PKG-001',
        item_name: 'Paket Premium',
        price: 299000,
        quantity: 1
    }]
});
```

### Event: Contact Form

```javascript
gtag('event', 'generate_lead', {
    currency: 'IDR',
    value: 0
});
```

---

## 🔗 Link GA4 ke Google Search Console

1. Di Google Analytics, buka **Admin**
2. Pilih **Product Links** → **Search Console Links**
3. Klik **"Link"**
4. Pilih property Search Console: **chatcepat.id**
5. Submit

**Manfaat:**
- Lihat keyword apa yang membawa traffic dari Google
- Monitor CTR (Click-Through Rate) di Google Search
- Lihat halaman mana yang paling banyak impression tapi belum di-klik

---

## ✅ Checklist Setup

- [ ] Buat Google Analytics 4 property
- [ ] Copy Measurement ID (G-XXXXXXXXXX)
- [ ] Tambahkan ke .env production: `GOOGLE_ANALYTICS_ID=`
- [ ] Clear cache: `php artisan config:cache`
- [ ] Test di Realtime Analytics
- [ ] Link GA4 ke Google Search Console
- [ ] Setup conversion tracking (signup, purchase, contact)
- [ ] Monitor weekly: organic traffic trend

---

## 📈 Tips Monitoring

### Week 1-2 (Setelah Submit Sitemap)
- Cek **Google Search Console** → Coverage → lihat berapa halaman yang di-index
- Lihat impressions mulai muncul di Performance report

### Week 3-4
- Traffic organik mulai naik (sedikit)
- Lihat keyword apa yang mulai ranking

### Month 2-3
- Traffic organik meningkat signifikan
- Optimasi content berdasarkan data

---

## 🆘 Troubleshooting

### Analytics tidak track
1. Cek apakah Measurement ID benar di `.env`
2. Clear browser cache
3. Disable AdBlocker
4. Cek browser console untuk error
5. Test di Incognito mode

### GTM tidak load
1. Pastikan Container ID benar
2. Pastikan tag sudah di-publish di GTM
3. Test dengan GTM Preview mode

---

**Created:** 2026-01-26
**Project:** ChatCepat - AI CRM Platform
