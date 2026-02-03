<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\User;
use App\Models\Transaction;
use App\Models\UserSubscription;
use App\Models\PricingPackage;
use App\Services\MailketingService;
use App\Models\Setting;

class TestEmailNotifications extends Command
{
    protected $signature = 'email:test {email}';
    protected $description = 'Test all 6 email notifications';

    public function handle(MailketingService $mailketing)
    {
        $email = $this->argument('email');
        $siteName = Setting::get('site_name', 'ChatCepat');

        $this->info("🚀 Mengirim test email via Mailketing ke: {$email}\n");

        // Helper function to send email
        $sendEmail = function($subject, $content) use ($mailketing, $email) {
            $result = $mailketing->send($email, $subject, $content);
            return $result;
        };

        // 1. Registration Success
        $this->info('1️⃣  Notifikasi Registrasi Berhasil...');
        $template = Setting::get('mail_template_registration_success') ?? '<p>Halo {user_name},</p><p>Selamat! Akun Anda di {site_name} telah berhasil dibuat.</p><p>Langkah terakhir adalah melakukan pembayaran sebesar <b>{payment_amount}</b> untuk mengaktifkan paket Anda.</p>';
        $content = str_replace(
            ['{user_name}', '{site_name}', '{payment_amount}', '{payment_link}'],
            ['Muhammad Febrian', $siteName, 'Rp 150.000', url('/payment/TEST-'.time())],
            $template
        );
        $sendEmail('Selamat Datang di ' . $siteName, $content);
        $this->line('   ✅ Dikirim!');

        // 2. Payment Success
        $this->info('2️⃣  Notifikasi Pembayaran Berhasil...');
        $template = Setting::get('mail_template_payment_success') ?? '<p>Halo {user_name},</p><p>Terima kasih! Pembayaran Anda telah kami terima.</p><p>Paket <b>{package_name}</b> Anda telah aktif dan siap digunakan.</p><p>ID Transaksi: <b>#{transaction_id}</b></p>';
        $content = str_replace(
            ['{user_name}', '{site_name}', '{transaction_id}', '{package_name}'],
            ['Muhammad Febrian', $siteName, 'TRX-'.strtoupper(bin2hex(random_bytes(4))), 'Pro Package'],
            $template
        );
        $sendEmail('Pembayaran Berhasil Diterima - ' . $siteName, $content);
        $this->line('   ✅ Dikirim!');

        // 3. Password Changed
        $this->info('3️⃣  Notifikasi Ganti Password...');
        $template = Setting::get('mail_template_password_change') ?? '<p>Halo {user_name},</p><p>Kami memberitahu Anda bahwa kata sandi akun {site_name} Anda baru saja diubah pada <b>{date_time}</b>.</p><p>Jika Anda tidak merasa melakukan perubahan ini, segera hubungi tim dukungan kami.</p>';
        $content = str_replace(
            ['{user_name}', '{site_name}', '{date_time}'],
            ['Muhammad Febrian', $siteName, now()->format('d M Y H:i')],
            $template
        );
        $sendEmail('Keamanan: Kata Sandi Anda Telah Diubah - ' . $siteName, $content);
        $this->line('   ✅ Dikirim!');

        // 4. Upgrade Success
        $this->info('4️⃣  Notifikasi Berhasil Upgrade...');
        $template = Setting::get('mail_template_upgrade_success') ?? '<p>Halo {user_name},</p><p>Selamat! Paket Anda telah berhasil di-upgrade dari <b>{old_package_name}</b> menjadi <b>{new_package_name}</b>.</p><p>Sekarang Anda memiliki akses ke fitur-fitur yang lebih lengkap.</p>';
        $content = str_replace(
            ['{user_name}', '{site_name}', '{new_package_name}', '{old_package_name}'],
            ['Muhammad Febrian', $siteName, 'Enterprise Package', 'Basic Package'],
            $template
        );
        $sendEmail('Selamat! Upgrade Paket Berhasil - ' . $siteName, $content);
        $this->line('   ✅ Dikirim!');

        // 5. Trial Expiry Reminder
        $this->info('5️⃣  Notifikasi Trial Akan Berakhir (3 hari)...');
        $template = Setting::get('mail_template_trial_reminder') ?? '<p>Halo {user_name},</p><p>Masa trial gratis Anda di {site_name} akan berakhir dalam <b>{days_left} hari</b>.</p><p>Agar tetap bisa menikmati akses tanpa gangguan, silakan pilih paket berlangganan yang sesuai.</p>';
        $content = str_replace(
            ['{user_name}', '{site_name}', '{days_left}'],
            ['Muhammad Febrian', $siteName, '3'],
            $template
        );
        $sendEmail('PENTING: Masa Trial Berakhir dalam 3 Hari - ' . $siteName, $content);
        $this->line('   ✅ Dikirim!');

        // 6. Subscription Renewal Reminder
        $this->info('6️⃣  Notifikasi Paket Akan Berakhir (7 hari)...');
        $template = Setting::get('mail_template_package_reminder') ?? '<p>Halo {user_name},</p><p>Kami ingin mengingatkan bahwa paket <b>{package_name}</b> Anda akan berakhir pada <b>{expiry_date}</b>.</p><p>Pastikan saldo Anda mencukupi untuk perpanjangan otomatis atau lakukan perpanjangan manual.</p>';
        $content = str_replace(
            ['{user_name}', '{site_name}', '{package_name}', '{expiry_date}'],
            ['Muhammad Febrian', $siteName, 'Pro Package', now()->addDays(7)->format('d M Y')],
            $template
        );
        $sendEmail('Pengingat: Masa Aktif Paket Segera Berakhir - ' . $siteName, $content);
        $this->line('   ✅ Dikirim!');

        $this->newLine();
        $this->info('✨ Selesai! Semua 6 notifikasi berhasil dikirim.');
        $this->warn('📬 Cek inbox email: ' . $email);
        $this->warn('⚠️  Jangan lupa cek folder Spam/Junk!');
        $this->newLine();
        $this->comment('ℹ️  Email dikirim via queue. Jalankan: php artisan queue:work');

        return 0;
    }
}
