# Setup Email untuk Production

## Kenapa Email Penting?

Meskipun email verification saat ini tidak wajib, Anda tetap perlu email untuk:
- Password reset
- Notifikasi penting ke user
- Email marketing/newsletter (jika ada)

## Konfigurasi Email untuk Production

### Opsi 1: Gmail SMTP (Mudah, Gratis)

```env
MAIL_MAILER=smtp
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-app-password  # Bukan password biasa!
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=your-email@gmail.com
MAIL_FROM_NAME="${APP_NAME}"
```

**Cara Buat App Password Gmail:**
1. Buka https://myaccount.google.com/security
2. Enable "2-Step Verification"
3. Cari "App passwords"
4. Generate password untuk "Mail"
5. Copy password yang di-generate

### Opsi 2: Mailgun (Recommended untuk Production)

```env
MAIL_MAILER=mailgun
MAILGUN_DOMAIN=mg.chatcepat.id
MAILGUN_SECRET=your-mailgun-api-key
MAILGUN_ENDPOINT=api.mailgun.net
MAIL_FROM_ADDRESS=noreply@chatcepat.id
MAIL_FROM_NAME="${APP_NAME}"
```

**Keuntungan Mailgun:**
- ✅ 5,000 email gratis/bulan
- ✅ Deliverability tinggi
- ✅ Tracking & analytics
- ✅ Dedicated IP (paid plan)

**Setup Mailgun:**
1. Daftar di https://mailgun.com
2. Verify domain (mg.chatcepat.id)
3. Add DNS records (MX, TXT, CNAME)
4. Copy API key

### Opsi 3: AWS SES (Untuk Scale Besar)

```env
MAIL_MAILER=ses
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_DEFAULT_REGION=ap-southeast-1
MAIL_FROM_ADDRESS=noreply@chatcepat.id
MAIL_FROM_NAME="${APP_NAME}"
```

**Keuntungan AWS SES:**
- ✅ Sangat murah ($0.10 per 1000 emails)
- ✅ Scalable
- ✅ Reliable

## Testing Email Configuration

Setelah setup, test dengan artisan command:

```bash
php artisan tinker

# Test send email
Mail::raw('Test email dari ChatCepat', function ($message) {
    $message->to('your-email@gmail.com')
            ->subject('Test Email');
});

# Cek hasilnya
>>> Email sent successfully!
```

## Mengaktifkan Email Verification (Opsional)

Jika ingin memaksa user verify email sebelum bisa login:

### 1. Uncomment MustVerifyEmail di User Model

```php
// File: app/Models/User.php

use Illuminate\Contracts\Auth\MustVerifyEmail;  // Uncomment ini

class User extends Authenticatable implements MustVerifyEmail  // Tambah implements
{
    // ...
}
```

### 2. Tambahkan Middleware di Routes

```php
// File: routes/web.php

Route::middleware(['auth', 'verified'])->group(function () {
    // Routes yang butuh email verification
    Route::get('/dashboard', ...);
});
```

### 3. Customize Email Template (Opsional)

```bash
php artisan vendor:publish --tag=laravel-mail

# Edit: resources/views/vendor/mail/html/themes/default.css
```

## Troubleshooting Email

### Error: "Connection timeout"
- ✅ Cek firewall/port 587 terbuka
- ✅ Pastikan MAIL_HOST benar
- ✅ Coba port 465 dengan MAIL_ENCRYPTION=ssl

### Error: "Authentication failed"
- ✅ Cek username/password benar
- ✅ Untuk Gmail, pastikan pakai App Password
- ✅ Cek 2FA sudah enabled

### Email Masuk Spam
- ✅ Setup SPF record di DNS
- ✅ Setup DKIM record
- ✅ Setup DMARC record
- ✅ Gunakan dedicated domain email (bukan Gmail)

### Testing Deliverability

Gunakan tools ini:
- https://www.mail-tester.com/ (cek spam score)
- https://mxtoolbox.com/ (cek DNS records)
- https://www.gmass.co/smtp-test (test SMTP connection)

## Monitoring Email

### Log Email yang Terkirim

```php
// File: app/Providers/AppServiceProvider.php

use Illuminate\Support\Facades\Mail;
use Illuminate\Mail\Events\MessageSent;

public function boot()
{
    // Log semua email yang terkirim
    Event::listen(MessageSent::class, function ($event) {
        \Log::info('Email sent', [
            'to' => $event->message->getTo(),
            'subject' => $event->message->getSubject(),
        ]);
    });
}
```

## Rekomendasi untuk ChatCepat

Untuk production chatcepat.id, saya rekomendasikan:

1. **Gunakan Mailgun** (free tier cukup untuk startup)
2. **Setup custom domain** (noreply@chatcepat.id lebih professional)
3. **Enable SPF, DKIM, DMARC** (untuk deliverability)
4. **Monitoring** dengan Mailgun dashboard
5. **Keep email verification optional** untuk sekarang (biar user gak ribet)

## Resources

- [Laravel Mail Documentation](https://laravel.com/docs/mail)
- [Mailgun Documentation](https://documentation.mailgun.com/)
- [AWS SES Documentation](https://docs.aws.amazon.com/ses/)
- [Email Deliverability Best Practices](https://sendgrid.com/blog/email-deliverability-best-practices/)
