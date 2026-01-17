# 🤖 Auto Reply Troubleshooting Guide

## ❌ MASALAH: Auto Reply Tidak Jalan

### Status Saat Ini:
```
✅ WhatsApp Gateway: RUNNING (port 3000)
✅ OpenAI API Key: CONFIGURED
✅ Auto Reply Settings: ENABLED
❌ WhatsApp Session: NOT CONNECTED TO GATEWAY
```

### Root Cause:
**Session di database status "connected" tapi TIDAK ADA di WhatsApp Gateway (Node.js).**

Ini terjadi karena:
1. Session hanya di-set manual ke "connected" untuk testing UI
2. Session tidak pernah benar-benar terhubung ke WhatsApp
3. Gateway tidak tahu ada session yang perlu di-handle
4. Tidak ada socket WhatsApp yang aktif untuk terima/kirim pesan

---

## ✅ SOLUSI LENGKAP - IKUTI STEP BY STEP

### 🔧 STEP 1: Reset & Prepare (SUDAH DONE ✅)

**Yang sudah dilakukan:**
```bash
✅ Session status reset ke "disconnected"
✅ Auto reply enabled: true
✅ AI assistant enabled: true
✅ AI type: customer_service
✅ Settings stored in database
```

---

### 📱 STEP 2: HUBUNGKAN SESSION KE WHATSAPP (PALING PENTING!)

#### A. Buka Browser, ke:
```
http://127.0.0.1:8000/user/whatsapp
```

#### B. Klik "Kelola Sesi" pada card "Customer Service"

#### C. Klik tombol HIJAU "Hubungkan" atau "Connect"

**Apa yang terjadi:**
1. Browser akan kirim request ke Laravel
2. Laravel akan kirim request ke WhatsApp Gateway (Node.js port 3000)
3. Gateway akan:
   - Create session di memory
   - Initialize Baileys WhatsApp client
   - Generate QR code
   - Store session di database gateway
   - Return QR code ke Laravel
4. Laravel akan update status jadi "connecting"
5. QR code akan muncul di browser

#### D. Scan QR Code dengan WhatsApp Mobile

**PENTING - Ikuti langkah ini dengan benar:**

1. **Buka WhatsApp di HP Anda**

2. **iPhone:**
   - Tap "Settings" (pojok kanan bawah)
   - Tap "Linked Devices"
   - Tap "Link a Device"
   - Scan QR code

3. **Android:**
   - Tap menu (⋮) pojok kanan atas
   - Tap "Linked Devices" / "Perangkat Tertaut"
   - Tap "Link a Device" / "Tautkan Perangkat"
   - Scan QR code

4. **Tunggu proses connecting (5-10 detik)**
   - QR code akan hilang
   - Status berubah "connecting" → "connected"
   - Nomor WhatsApp muncul (contoh: 6289697783631)
   - Dot indicator berubah hijau

5. **PENTING: Jangan logout dari WhatsApp mobile!**
   - Jika logout, session akan disconnect
   - QR code harus di-scan ulang

---

### ✅ STEP 3: VERIFIKASI SESSION CONNECTED

Setelah scan QR code, **WAJIB VERIFIKASI** bahwa session benar-benar connected:

#### A. Check di Browser (WhatsApp Management):
```
Status: Connected (hijau)
Phone: 6289697783631 (muncul)
Dot: Hijau berkedip
Last Connected: Just now
```

#### B. Check di Terminal (Backend):
```bash
# Check session di gateway
curl -s http://localhost:3000/api/sessions | python3 -m json.tool
```

**Expected Output:**
```json
{
    "success": true,
    "data": [
        {
            "id": 1,
            "userId": 2,
            "sessionId": "user_2_1767997168793_de06fe67181702bf",
            "name": "Customer Service",
            "phoneNumber": "6289697783631",
            "status": "connected",
            "isActive": true,
            "createdAt": "2026-01-10...",
            "lastConnectedAt": "2026-01-10..."
        }
    ]
}
```

**Jika masih `"data": []` berarti session BELUM BENAR-BENAR CONNECTED!**

#### C. Check Auto Reply Settings:
```bash
php artisan tinker --execute="
\$s = \App\Models\WhatsappSession::find(1);
echo 'Settings: ' . json_encode(\$s->settings, JSON_PRETTY_PRINT);
"
```

**Expected Output:**
```json
{
    "auto_reply_enabled": true,
    "ai_assistant_enabled": true,
    "ai_assistant_type": "customer_service"
}
```

---

### 🧪 STEP 4: TEST AUTO REPLY

Setelah session connected, test auto reply:

#### A. Kirim Pesan dari HP Lain ke Nomor WhatsApp yang Terhubung

**Contoh pesan:**
```
Halo, saya mau tanya tentang produk
```

#### B. Tunggu Response (max 5 detik)

**Expected behavior:**
1. Gateway menerima pesan incoming
2. Message disimpan ke database
3. Auto reply di-trigger (karena enabled)
4. AI (OpenAI) generate response
5. Response dikirim kembali via WhatsApp
6. Customer menerima balasan otomatis

#### C. Check Logs di Terminal Gateway:

**Expected logs:**
```
📥 Incoming message from 628123456789
✅ Message saved to database
🤖 Processing auto reply...
📤 AI response: "Halo! Terima kasih telah menghubungi kami..."
✅ Auto reply sent successfully
```

#### D. Check di Database:

```bash
php artisan tinker --execute="
echo 'Recent Messages:\n';
\$messages = \App\Models\WhatsappMessage::orderBy('id', 'desc')->take(5)->get();
foreach (\$messages as \$msg) {
    echo '  ' . \$msg->direction . ': ' . substr(\$msg->content, 0, 50) . '...\n';
    echo '    Auto Reply: ' . (\$msg->is_auto_reply ? 'YES' : 'NO') . '\n';
}
"
```

**Expected Output:**
```
Recent Messages:
  outgoing: Halo! Terima kasih telah menghubungi kami...
    Auto Reply: YES
  incoming: Halo, saya mau tanya tentang produk
    Auto Reply: NO
```

---

### 🐛 TROUBLESHOOTING UMUM

#### Problem 1: QR Code Tidak Muncul

**Penyebab:**
- Gateway tidak running
- Laravel tidak bisa connect ke gateway
- Firewall blocking

**Solusi:**
```bash
# Check gateway running
lsof -i :3000

# Jika tidak running, start:
cd /applications/javascript/chatcepat-wa
npm run dev

# Check logs di terminal
```

#### Problem 2: QR Code Expired

**Penyebab:**
- QR code timeout (1 menit)

**Solusi:**
- Klik tombol "Hubungkan" lagi
- QR code baru akan di-generate
- Scan QR code baru dengan cepat (< 1 menit)

#### Problem 3: Session Stuck di "connecting"

**Penyebab:**
- QR code belum di-scan
- Scan gagal
- Network issue

**Solusi:**
```bash
# Reset session
php artisan whatsapp:fix-stuck-sessions --force

# Hubungkan ulang
# Scan QR code dengan benar
```

#### Problem 4: Auto Reply Tidak Jalan (Session Connected)

**Check:**

```bash
# 1. Verify session di gateway
curl http://localhost:3000/api/sessions | python3 -m json.tool

# 2. Check auto reply settings
php artisan tinker --execute="
\$s = \App\Models\WhatsappSession::find(1);
echo json_encode(\$s->settings, JSON_PRETTY_PRINT);
"

# 3. Check OpenAI API key
grep OPENAI_API_KEY /applications/javascript/chatcepat-wa/.env

# 4. Check gateway logs
# (lihat terminal yang running npm run dev)
```

**Fix:**
```bash
# Enable auto reply
php artisan tinker --execute="
\$s = \App\Models\WhatsappSession::find(1);
\$s->settings = [
    'auto_reply_enabled' => true,
    'ai_assistant_enabled' => true,
    'ai_assistant_type' => 'customer_service'
];
\$s->save();
echo 'Auto reply enabled';
"

# Restart gateway
# Ctrl+C di terminal gateway
cd /applications/javascript/chatcepat-wa
npm run dev
```

#### Problem 5: Gateway Tidak Menerima Pesan

**Check:**

```bash
# Check message handler di gateway
# Lihat logs di terminal
# Seharusnya ada log "Incoming message from ..."
```

**Penyebab:**
- Session tidak benar-benar connected
- WhatsApp socket error
- Message handler error

**Solusi:**
```bash
# Disconnect & reconnect session
# 1. Di UI, klik "Disconnect"
# 2. Tunggu 10 detik
# 3. Klik "Hubungkan" lagi
# 4. Scan QR code lagi
```

---

### 📊 VERIFICATION CHECKLIST

Pastikan semua ini ✅ sebelum expect auto reply jalan:

**Prerequisites:**
- [ ] Gateway running (port 3000)
- [ ] OpenAI API key configured
- [ ] Database connection OK
- [ ] Laravel running (port 8000)

**Session:**
- [ ] Session di-create via UI
- [ ] QR code di-scan dengan WhatsApp mobile
- [ ] Status "connected" (hijau)
- [ ] Nomor WhatsApp muncul
- [ ] Session ada di gateway (curl check)
- [ ] Last connected timestamp recent

**Auto Reply:**
- [ ] `settings.auto_reply_enabled` = true
- [ ] `settings.ai_assistant_enabled` = true
- [ ] `settings.ai_assistant_type` = "customer_service"
- [ ] OpenAI API key valid

**Test:**
- [ ] Kirim test message dari HP lain
- [ ] Gateway logs show "Incoming message"
- [ ] Gateway logs show "Processing auto reply"
- [ ] Gateway logs show "Auto reply sent"
- [ ] Customer menerima balasan
- [ ] Message tersimpan di database

---

### 🎯 QUICK START GUIDE

**Jika mau langsung jalan, ikuti ini:**

```bash
# 1. Pastikan gateway running
cd /applications/javascript/chatcepat-wa
npm run dev
# (biarkan terminal ini jalan)

# 2. Buka tab terminal baru, enable auto reply
php artisan tinker --execute="
\$s = \App\Models\WhatsappSession::find(1);
\$s->settings = ['auto_reply_enabled' => true, 'ai_assistant_enabled' => true, 'ai_assistant_type' => 'customer_service'];
\$s->save();
"

# 3. Buka browser
# http://127.0.0.1:8000/user/whatsapp

# 4. Klik "Kelola Sesi" → "Hubungkan"

# 5. Scan QR code dengan WhatsApp mobile

# 6. Tunggu status jadi "connected"

# 7. Test: Kirim pesan dari HP lain

# 8. Lihat logs di terminal gateway
# Seharusnya ada auto reply!
```

---

### 📞 SUPPORT

Jika masih tidak jalan setelah ikuti semua step:

1. Check logs di terminal gateway (npm run dev)
2. Check Laravel logs: `tail -f storage/logs/laravel.log`
3. Check browser console (F12)
4. Verify semua checklist di atas

---

## 🎉 SUCCESS INDICATORS

**Anda tahu auto reply BERHASIL jika:**

1. ✅ Gateway logs menampilkan:
   ```
   📥 Incoming message from 628xxx
   🤖 Processing auto reply...
   📤 Auto reply sent successfully
   ```

2. ✅ Customer menerima balasan otomatis dalam 3-5 detik

3. ✅ Database `whatsapp_messages` table ada record:
   - `direction = 'outgoing'`
   - `is_auto_reply = 1`
   - `auto_reply_source = 'openai'`

4. ✅ Reply Manual page menampilkan percakapan dengan badge "Auto"

---

**GOOD LUCK! 🚀**

Remember: Session HARUS BENAR-BENAR CONNECTED ke gateway agar auto reply bisa jalan!
