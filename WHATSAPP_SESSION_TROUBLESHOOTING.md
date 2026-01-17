# 🔧 WhatsApp Session Troubleshooting Guide

## ❌ Problem: "Tidak Ada Sesi Terhubung" di Halaman Broadcast

### Gejala:
- Halaman broadcast menampilkan error: "Anda perlu memiliki minimal 1 sesi WhatsApp yang terhubung"
- Padahal sudah ada sesi WhatsApp yang dibuat
- Sesi berstatus "connecting" tapi tidak pernah menjadi "connected"

### Penyebab:
Session dibuat di database Laravel tapi tidak terbuat di WhatsApp Gateway (Node.js backend), sehingga:
- Status stuck di "connecting"
- Tidak ada QR code yang generated
- Session tidak bisa digunakan untuk broadcast

---

## ✅ SOLUSI 1: Reconnect Session (Via Web UI)

### Langkah-langkah:

1. **Buka WhatsApp Management**
   ```
   http://127.0.0.1:8000/user/whatsapp
   ```

2. **Klik "Kelola Sesi"** pada session yang stuck

3. **Klik tombol "Hubungkan"** atau "Connect"
   - System akan otomatis:
     - Membuat session di gateway jika belum ada
     - Generate QR code baru
     - Update status ke "connecting"

4. **Scan QR Code** dengan WhatsApp mobile
   - Buka WhatsApp di HP
   - Tap menu (3 titik) → Linked Devices → Link a Device
   - Scan QR code yang muncul

5. **Tunggu status berubah jadi "connected"**
   - Refresh halaman jika perlu
   - Status akan otomatis update dari gateway

6. **Coba akses broadcast lagi**
   ```
   http://127.0.0.1:8000/user/broadcast
   ```

---

## ✅ SOLUSI 2: Fix Via Artisan Command (Untuk Admin)

Jika session stuck dalam status "connecting" atau "qr_pending":

### Check stuck sessions:
```bash
php artisan whatsapp:fix-stuck-sessions
```

Output:
```
🔍 Checking for stuck WhatsApp sessions...
Found 1 stuck session(s):

+----+-------------------+------------------+------------+-------------------+
| ID | User              | Name             | Status     | Updated           |
+----+-------------------+------------------+------------+-------------------+
| 1  | Muhamad Febrian   | Customer Service | connecting | 2 hours ago       |
+----+-------------------+------------------+------------+-------------------+

Do you want to reset these sessions to disconnected status? (yes/no) [yes]:
```

Type `yes` dan Enter:
```
  ✓ Fixed session: Customer Service
✅ Successfully fixed 1 session(s).

💡 Users can now reconnect their sessions from WhatsApp Management page.
```

### Force fix (semua session connecting):
```bash
php artisan whatsapp:fix-stuck-sessions --force
```

---

## ✅ SOLUSI 3: Manual Database Update

Jika command tidak berhasil, update manual via tinker:

```bash
php artisan tinker
```

Jalankan:
```php
// Fix specific session by ID
$session = \App\Models\WhatsappSession::find(1);
$session->update([
    'status' => 'disconnected',
    'qr_code' => null,
    'qr_expires_at' => null
]);

// Or fix all stuck sessions
\App\Models\WhatsappSession::whereIn('status', ['connecting', 'qr_pending'])
    ->update([
        'status' => 'disconnected',
        'qr_code' => null,
        'qr_expires_at' => null
    ]);
```

---

## 🔍 DEBUGGING: Check Session Status

### 1. Check Database:
```bash
php artisan tinker --execute="
echo \App\Models\WhatsappSession::where('user_id', 2)
    ->get(['id', 'name', 'status', 'updated_at'])
    ->toJson(JSON_PRETTY_PRINT);
"
```

### 2. Check Gateway:
```bash
# Check if gateway is running
curl http://localhost:3000/health

# Check specific session in gateway
curl http://localhost:3000/api/sessions/[session-id]
```

### 3. Check Logs:
```bash
# Laravel logs
tail -f storage/logs/laravel.log

# Gateway logs (if running with npm run dev)
# Check terminal output
```

---

## 🚨 TROUBLESHOOTING LANJUTAN

### Error: "Gateway connection failed"

**Penyebab:** WhatsApp Gateway (Node.js) tidak running

**Solusi:**
```bash
cd /applications/javascript/chatcepat-wa
npm run dev
```

Pastikan output menampilkan:
```
✅ MySQL connection pool created
✅ MySQL connection test successful
✅ Socket.IO server initialized
🚀 Server running on http://localhost:3000
```

---

### Error: "Session not found in gateway"

**Penyebab:** Session ada di database tapi tidak ada di gateway

**Solusi:**
1. Fix session status (gunakan command atau manual update)
2. Reconnect via UI (klik "Hubungkan")
3. System akan otomatis create session di gateway

---

### Session terkoneksi tapi broadcast tetap error

**Check:**
1. Status session benar-benar "connected"?
   ```bash
   php artisan tinker --execute="
   echo \App\Models\WhatsappSession::find(1)->status;
   "
   ```

2. Session active di gateway?
   ```bash
   curl http://localhost:3000/api/sessions/[session-id]
   ```

3. Refresh halaman broadcast (Ctrl/Cmd + R)

4. Clear cache:
   ```bash
   php artisan cache:clear
   php artisan config:clear
   ```

---

## 📋 CHECKLIST UNTUK SESSION YANG SEHAT

Session WhatsApp yang sehat harus memenuhi:

- [ ] Status: `connected` (bukan connecting/qr_pending/disconnected)
- [ ] Phone number: Terisi (contoh: 6289697783631)
- [ ] Last connected: Dalam 24 jam terakhir
- [ ] Exists in gateway: ✅ (bisa dicek via API)
- [ ] QR code: `null` (sudah tidak perlu QR lagi)

### Check session health:
```bash
php artisan tinker --execute="
\$s = \App\Models\WhatsappSession::find(1);
echo 'Status: ' . \$s->status . PHP_EOL;
echo 'Phone: ' . \$s->phone_number . PHP_EOL;
echo 'Last Connected: ' . \$s->last_connected_at . PHP_EOL;
echo 'QR Code: ' . (\$s->qr_code ? 'YES (need scan)' : 'NO (connected)') . PHP_EOL;
"
```

---

## 🛠️ PREVENTIVE MEASURES

### 1. Pastikan Gateway Selalu Running

Gunakan PM2 untuk auto-restart:
```bash
cd /applications/javascript/chatcepat-wa
npm install -g pm2
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### 2. Monitor Session Status

Setup cron job untuk auto-fix stuck sessions:
```bash
# Edit crontab
crontab -e

# Add this line (run every hour)
0 * * * * cd /Applications/laravel/chatcepat && php artisan whatsapp:fix-stuck-sessions --force --no-interaction
```

### 3. Regular Health Check

```bash
# Check gateway health
curl http://localhost:3000/health

# Check active sessions
curl http://localhost:3000/api/sessions?active=true
```

---

## 📞 QUICK REFERENCE

### Common Commands:
```bash
# Fix stuck sessions
php artisan whatsapp:fix-stuck-sessions

# Force fix all
php artisan whatsapp:fix-stuck-sessions --force

# Check session in database
php artisan tinker --execute="
echo \App\Models\WhatsappSession::all()->toJson(JSON_PRETTY_PRINT);
"

# Restart gateway
cd /applications/javascript/chatcepat-wa && npm run dev

# Clear Laravel cache
php artisan cache:clear && php artisan config:clear
```

### Important URLs:
- WhatsApp Management: http://127.0.0.1:8000/user/whatsapp
- Broadcast Page: http://127.0.0.1:8000/user/broadcast
- Gateway API: http://localhost:3000/api
- Gateway Health: http://localhost:3000/health

---

## ✅ VERIFICATION STEPS

Setelah fix, verify dengan langkah ini:

1. **Check database**
   ```bash
   php artisan tinker --execute="
   echo \App\Models\WhatsappSession::where('status', 'connected')->count() . ' connected sessions';
   "
   ```

2. **Check broadcast page**
   - Buka: http://127.0.0.1:8000/user/broadcast
   - Harus melihat session di dropdown
   - Tidak ada error "Tidak Ada Sesi Terhubung"

3. **Test send message**
   - Pilih session
   - Pilih kontak
   - Kirim test message
   - Check delivery

---

**🎉 Done! Session WhatsApp Anda seharusnya sudah bisa digunakan untuk broadcast.**

Jika masih ada masalah, check logs atau hubungi developer.
