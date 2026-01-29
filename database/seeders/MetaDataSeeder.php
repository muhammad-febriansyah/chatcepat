<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\MetaDocumentation;
use App\Models\MetaMessageTemplate;
use Illuminate\Support\Str;

class MetaDataSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $this->seedDocumentation();
        $this->seedMessageTemplates();
    }

    /**
     * Seed Meta Documentation with guides
     */
    private function seedDocumentation(): void
    {
        $docs = [
            // WhatsApp Documentation
            [
                'platform' => 'whatsapp',
                'title' => 'Setup WhatsApp Cloud API',
                'slug' => 'setup-whatsapp-cloud-api',
                'content' => <<<'MD'
# Cara Setup WhatsApp Cloud API

## Langkah 1: Buat Meta App
1. Login ke [Meta for Developers](https://developers.facebook.com)
2. Klik **My Apps** → **Create App**
3. Pilih **Business** sebagai type
4. Isi nama aplikasi dan email

## Langkah 2: Tambah WhatsApp Product
1. Di dashboard app, klik **Add Product**
2. Pilih **WhatsApp** → **Set Up**
3. Pilih Business Portfolio atau buat baru

## Langkah 3: Dapatkan Credentials
1. Buka **WhatsApp** → **API Setup**
2. Copy **Phone Number ID** (contoh: 123456789012345)
3. Copy **Business Account ID** (WABA ID)
4. Generate **Access Token** (pilih permanent token)

## Langkah 4: Setup Webhook
1. Buka **WhatsApp** → **Configuration**
2. Edit **Webhook** URL:
   - URL: `https://app.balesotomatis.id/api/meta/webhook`
   - Verify Token: (dari sistem kami)
3. Subscribe ke field: `messages`, `messaging_postbacks`

## Langkah 5: Input di Sistem
1. Buka menu **Platforms** → **WhatsApp Business API**
2. Input **Phone Number ID**
3. Input **Business Account ID**
4. Input **Access Token**
5. Klik **Save** dan **Test Connection**

✅ **Selesai!** WhatsApp sudah siap digunakan.
MD,
                'video_url' => 'https://drive.google.com/file/d/1abc123xyz/preview', // Dummy video URL
                'icon' => 'MessageSquare',
                'order' => 1,
                'is_active' => true,
            ],
            [
                'platform' => 'whatsapp',
                'title' => 'Mengirim Pesan WhatsApp',
                'slug' => 'send-whatsapp-message',
                'content' => <<<'MD'
# Cara Mengirim Pesan WhatsApp

## Via CRM Chat
1. Buka **CRM Chat App**
2. Pilih kontak atau klik **New Chat**
3. Ketik pesan dan tekan **Enter**

## Via Broadcast
1. Buka **Broadcast WhatsApp**
2. Pilih kontak atau grup kontak
3. Tulis pesan atau pilih template
4. Klik **Send Broadcast**

## Via API
```bash
curl -X POST https://app.balesotomatis.id/api/whatsapp/send \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "to": "628123456789",
    "message": "Hello from API!"
  }'
```

💡 **Tips:**
- Gunakan template untuk pesan marketing
- Maksimal 1000 kontak per broadcast
- Pesan pertama harus dari user (24 hour window)
MD,
                'video_url' => 'https://drive.google.com/file/d/2xyz456abc/preview',
                'icon' => 'Send',
                'order' => 2,
                'is_active' => true,
            ],

            // Instagram Documentation
            [
                'platform' => 'instagram',
                'title' => 'Setup Instagram DM',
                'slug' => 'setup-instagram-dm',
                'content' => <<<'MD'
# Cara Setup Instagram Direct Message

## Langkah 1: Connect Instagram Business
1. Login ke [Meta Business Suite](https://business.facebook.com)
2. Klik **Accounts** → **Instagram accounts**
3. Connect akun Instagram Business Anda

## Langkah 2: Dapatkan Instagram Account ID
1. Buka **Meta for Developers** → Your App
2. Klik **Instagram** → **Basic Display**
3. Copy **Instagram Account ID**

## Langkah 3: Generate Access Token
1. Buka **Tools** → **Graph API Explorer**
2. Pilih aplikasi Anda
3. Request permissions: `instagram_basic`, `instagram_manage_messages`
4. Generate Token (pilih permanent)

## Langkah 4: Setup Webhook
1. Webhook URL sama dengan WhatsApp:
   - URL: `https://app.balesotomatis.id/api/meta/webhook`
2. Subscribe to: `messages`, `messaging_postbacks`

## Langkah 5: Input di Sistem
1. Buka **Platforms** → **DM Instagram**
2. Input **Account ID**
3. Input **Access Token**
4. **Save** dan **Test Connection**

✅ **Done!** Instagram DM ready.
MD,
                'video_url' => 'https://drive.google.com/file/d/3def789ghi/preview',
                'icon' => 'Instagram',
                'order' => 3,
                'is_active' => true,
            ],

            // Facebook Documentation
            [
                'platform' => 'facebook',
                'title' => 'Setup Facebook Messenger',
                'slug' => 'setup-facebook-messenger',
                'content' => <<<'MD'
# Cara Setup Facebook Messenger

## Langkah 1: Buat/Pilih Facebook Page
1. Buka [Facebook Pages](https://www.facebook.com/pages)
2. Buat page baru atau pilih existing page
3. Pastikan Messenger diaktifkan di page

## Langkah 2: Dapatkan Page ID
1. Buka Page Settings
2. Klik **About** di sidebar
3. Scroll ke bawah, copy **Page ID**

## Langkah 3: Generate Page Access Token
1. Buka **Meta for Developers** → Your App
2. Klik **Messenger** → **Settings**
3. Di bagian **Access Tokens**, generate token untuk page Anda
4. Copy **Page Access Token**

## Langkah 4: Setup Webhook
1. Di **Messenger Settings** → **Webhooks**
2. Subscribe page ke webhook:
   - URL: `https://app.balesotomatis.id/api/meta/webhook`
   - Verify Token: (dari sistem)
3. Subscribe to: `messages`, `messaging_postbacks`

## Langkah 5: Input di Sistem
1. Buka **Platforms** → **Facebook Messenger**
2. Input **Page ID**
3. Input **Page Access Token**
4. **Save** dan **Test Connection**

✅ **Sukses!** Facebook Messenger siap menerima pesan.

⚠️ **Catatan:**
- Page Access Token berbeda dengan User Access Token
- Token bisa expired, generate yang permanent
MD,
                'video_url' => 'https://drive.google.com/file/d/4jkl012mno/preview',
                'icon' => 'Facebook',
                'order' => 4,
                'is_active' => true,
            ],
        ];

        foreach ($docs as $doc) {
            MetaDocumentation::updateOrCreate(
                ['slug' => $doc['slug']],
                $doc
            );
        }
    }

    /**
     * Seed Message Templates
     */
    private function seedMessageTemplates(): void
    {
        $templates = [
            // Greeting Templates
            [
                'name' => 'Sapaan Selamat Datang',
                'category' => 'greeting',
                'platform' => 'all',
                'content' => 'Halo {{name}}! 👋\n\nSelamat datang di {{business_name}}. Ada yang bisa kami bantu hari ini?',
                'variables' => ['name', 'business_name'],
                'language' => 'id',
                'is_system' => true,
                'is_active' => true,
            ],
            [
                'name' => 'Salam Pembuka',
                'category' => 'greeting',
                'platform' => 'whatsapp',
                'content' => 'Hai {{name}}, terima kasih sudah menghubungi kami! 😊\n\nTim kami akan segera membalas pesan Anda.',
                'variables' => ['name'],
                'language' => 'id',
                'is_system' => true,
                'is_active' => true,
            ],

            // Follow Up Templates
            [
                'name' => 'Follow Up Pelanggan',
                'category' => 'follow_up',
                'platform' => 'all',
                'content' => 'Hai {{name}},\n\nKami ingin menindaklanjuti pesanan Anda #{{order_id}}. Apakah ada yang ingin Anda tanyakan?',
                'variables' => ['name', 'order_id'],
                'language' => 'id',
                'is_system' => true,
                'is_active' => true,
            ],
            [
                'name' => 'Reminder Pembayaran',
                'category' => 'follow_up',
                'platform' => 'whatsapp',
                'content' => 'Halo {{name}},\n\nPembayaran untuk invoice #{{invoice_number}} akan jatuh tempo pada {{due_date}}.\n\nTotal: {{amount}}\n\nSilakan lakukan pembayaran sebelum tanggal jatuh tempo. Terima kasih! 🙏',
                'variables' => ['name', 'invoice_number', 'due_date', 'amount'],
                'language' => 'id',
                'is_system' => true,
                'is_active' => true,
            ],

            // Marketing Templates
            [
                'name' => 'Promo Produk Baru',
                'category' => 'marketing',
                'platform' => 'all',
                'content' => '🎉 *PROMO SPESIAL* 🎉\n\nHai {{name}}!\n\nKenalan yuk dengan produk terbaru kami: {{product_name}}\n\n✨ Diskon {{discount}}% khusus untuk Anda!\n💰 Hanya Rp {{price}}\n⏰ Promo terbatas sampai {{end_date}}\n\nPesan sekarang: {{link}}',
                'variables' => ['name', 'product_name', 'discount', 'price', 'end_date', 'link'],
                'language' => 'id',
                'is_system' => true,
                'is_active' => true,
            ],
            [
                'name' => 'Flash Sale',
                'category' => 'marketing',
                'platform' => 'whatsapp',
                'content' => '⚡ *FLASH SALE ALERT!* ⚡\n\nHalo {{name}},\n\n{{product_name}} DISKON {{discount}}%!\n\n~~Rp {{original_price}}~~\n*Rp {{sale_price}}*\n\n⏱ Hanya {{hours}} jam lagi!\n\n👉 Beli sekarang: {{link}}\n\nJangan sampai kehabisan! 🔥',
                'variables' => ['name', 'product_name', 'discount', 'original_price', 'sale_price', 'hours', 'link'],
                'language' => 'id',
                'is_system' => true,
                'is_active' => true,
            ],

            // Support Templates
            [
                'name' => 'Konfirmasi Pesanan',
                'category' => 'support',
                'platform' => 'all',
                'content' => '✅ *Pesanan Diterima*\n\nTerima kasih {{name}}!\n\nPesanan Anda telah kami terima:\n\n📦 Order ID: #{{order_id}}\n📅 Tanggal: {{date}}\n💰 Total: {{total}}\n\nKami akan segera memproses pesanan Anda. Status pesanan dapat dilihat di: {{tracking_link}}',
                'variables' => ['name', 'order_id', 'date', 'total', 'tracking_link'],
                'language' => 'id',
                'is_system' => true,
                'is_active' => true,
            ],
            [
                'name' => 'Update Pengiriman',
                'category' => 'support',
                'platform' => 'whatsapp',
                'content' => '🚚 *Update Pengiriman*\n\nHai {{name}},\n\nPaket Anda sedang dalam perjalanan!\n\n📦 No. Resi: {{tracking_number}}\n🚚 Kurir: {{courier}}\n📍 Status: {{status}}\n⏰ Estimasi tiba: {{eta}}\n\nTracking: {{tracking_link}}',
                'variables' => ['name', 'tracking_number', 'courier', 'status', 'eta', 'tracking_link'],
                'language' => 'id',
                'is_system' => true,
                'is_active' => true,
            ],
            [
                'name' => 'Terima Kasih',
                'category' => 'support',
                'platform' => 'all',
                'content' => '🙏 *Terima Kasih*\n\nHai {{name}},\n\nTerima kasih sudah berbelanja di {{business_name}}!\n\nKami sangat menghargai kepercayaan Anda. Jika ada pertanyaan atau masukan, jangan ragu untuk menghubungi kami.\n\n⭐ Berikan rating: {{rating_link}}\n\nSampai jumpa lagi! 😊',
                'variables' => ['name', 'business_name', 'rating_link'],
                'language' => 'id',
                'is_system' => true,
                'is_active' => true,
            ],

            // Birthday/Special Occasion
            [
                'name' => 'Ucapan Ulang Tahun',
                'category' => 'special',
                'platform' => 'all',
                'content' => '🎂 *Selamat Ulang Tahun!* 🎉\n\nHai {{name}},\n\nSelamat ulang tahun yang ke-{{age}}! 🎈\n\nSebagai kado spesial, kami berikan voucher diskon {{discount}}% khusus untuk Anda.\n\nKode: {{voucher_code}}\nBerlaku sampai: {{expiry_date}}\n\nSelamat berulang tahun dan semoga panjang umur! 🎁',
                'variables' => ['name', 'age', 'discount', 'voucher_code', 'expiry_date'],
                'language' => 'id',
                'is_system' => true,
                'is_active' => true,
            ],
        ];

        foreach ($templates as $template) {
            MetaMessageTemplate::create($template);
        }
    }
}
