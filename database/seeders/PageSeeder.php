<?php

namespace Database\Seeders;

use App\Models\Page;
use Illuminate\Database\Seeder;

class PageSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $pages = [
            [
                'title' => 'Syarat & Ketentuan',
                'slug' => 'terms',
                'excerpt' => 'Syarat dan ketentuan penggunaan layanan ChatCepat',
                'content' => $this->getTermsContent(),
                'meta_title' => 'Syarat & Ketentuan - ChatCepat',
                'meta_description' => 'Baca syarat dan ketentuan penggunaan layanan ChatCepat. Ketahui hak dan kewajiban Anda sebagai pengguna.',
                'meta_keywords' => 'syarat ketentuan, terms of service, chatcepat',
                'is_active' => true,
            ],
            [
                'title' => 'Kebijakan Privasi',
                'slug' => 'privacy',
                'excerpt' => 'Kebijakan privasi dan perlindungan data pengguna ChatCepat',
                'content' => $this->getPrivacyContent(),
                'meta_title' => 'Kebijakan Privasi - ChatCepat',
                'meta_description' => 'Kebijakan privasi ChatCepat menjelaskan bagaimana kami mengumpulkan, menggunakan, dan melindungi data pribadi Anda.',
                'meta_keywords' => 'kebijakan privasi, privacy policy, perlindungan data, chatcepat',
                'is_active' => true,
            ],
            [
                'title' => 'Tentang Kami',
                'slug' => 'about',
                'excerpt' => 'Kenali lebih dekat tentang ChatCepat dan tim kami',
                'content' => $this->getAboutContent(),
                'meta_title' => 'Tentang Kami - ChatCepat',
                'meta_description' => 'ChatCepat adalah platform komunikasi modern yang memudahkan Anda terhubung dengan siapa saja, kapan saja.',
                'meta_keywords' => 'tentang kami, about us, chatcepat, platform chat',
                'is_active' => true,
            ],
        ];

        foreach ($pages as $page) {
            Page::updateOrCreate(
                ['slug' => $page['slug']],
                $page
            );
        }
    }

    private function getTermsContent(): string
    {
        return <<<'EOT'
# Syarat & Ketentuan Penggunaan ChatCepat

**Terakhir diperbarui: 11 Desember 2025**

Selamat datang di ChatCepat! Dengan menggunakan layanan kami, Anda menyetujui syarat dan ketentuan berikut.

## 1. Penerimaan Ketentuan

Dengan mengakses dan menggunakan layanan ChatCepat, Anda menyetujui untuk terikat dengan syarat dan ketentuan ini. Jika Anda tidak setuju dengan ketentuan ini, harap tidak menggunakan layanan kami.

## 2. Deskripsi Layanan

ChatCepat adalah platform komunikasi yang menyediakan layanan pesan instan, panggilan suara, panggilan video, dan berbagi file. Kami berhak untuk memodifikasi, menangguhkan, atau menghentikan layanan kapan saja tanpa pemberitahuan sebelumnya.

## 3. Akun Pengguna

### 3.1 Pendaftaran
- Anda harus berusia minimal 17 tahun untuk membuat akun
- Anda harus memberikan informasi yang akurat dan lengkap
- Anda bertanggung jawab menjaga kerahasiaan password Anda

### 3.2 Tanggung Jawab Pengguna
- Anda bertanggung jawab atas semua aktivitas yang terjadi di akun Anda
- Anda tidak boleh berbagi akun dengan orang lain
- Anda harus segera memberitahu kami jika terjadi penggunaan akun yang tidak sah

## 4. Penggunaan Layanan yang Dapat Diterima

Anda setuju untuk TIDAK:
- Menggunakan layanan untuk tujuan ilegal
- Mengirim spam, malware, atau konten berbahaya lainnya
- Melecehkan, mengancam, atau menyakiti pengguna lain
- Menyamar sebagai orang atau entitas lain
- Mengumpulkan informasi pengguna lain tanpa izin
- Mengganggu atau merusak infrastruktur layanan
- Menggunakan bot atau sistem otomatis tanpa izin tertulis

## 5. Konten Pengguna

### 5.1 Kepemilikan
Anda mempertahankan kepemilikan atas konten yang Anda kirim melalui ChatCepat.

### 5.2 Lisensi
Dengan mengirim konten, Anda memberikan kami lisensi non-eksklusif untuk menyimpan, memproses, dan mentransmisikan konten tersebut untuk menyediakan layanan.

### 5.3 Penghapusan Konten
Kami berhak menghapus konten yang melanggar ketentuan ini atau hukum yang berlaku.

## 6. Privasi

Penggunaan data pribadi Anda diatur dalam Kebijakan Privasi kami. Dengan menggunakan layanan, Anda menyetujui pengumpulan dan penggunaan informasi sesuai kebijakan tersebut.

## 7. Hak Kekayaan Intelektual

Semua hak kekayaan intelektual dalam layanan ChatCepat adalah milik kami atau pemberi lisensi kami. Anda tidak diizinkan untuk:
- Menyalin, memodifikasi, atau mendistribusikan materi kami
- Melakukan reverse engineering terhadap layanan kami
- Menghapus atau mengubah pemberitahuan hak cipta

## 8. Pembatasan Tanggung Jawab

### 8.1 Layanan "Sebagaimana Adanya"
Layanan disediakan "sebagaimana adanya" tanpa jaminan apapun, baik tersurat maupun tersirat.

### 8.2 Batasan Ganti Rugi
Kami tidak bertanggung jawab atas kerugian tidak langsung, insidental, khusus, atau konsekuensial yang timbul dari penggunaan layanan.

## 9. Penangguhan dan Penghentian

Kami berhak untuk:
- Menangguhkan atau menghentikan akun Anda jika melanggar ketentuan ini
- Menghentikan layanan kapan saja dengan atau tanpa pemberitahuan
- Menghapus konten yang melanggar ketentuan

## 10. Perubahan Ketentuan

Kami dapat mengubah ketentuan ini kapan saja. Perubahan akan efektif setelah dipublikasikan di platform. Penggunaan layanan setelah perubahan berarti Anda menerima ketentuan baru.

## 11. Hukum yang Berlaku

Ketentuan ini diatur oleh hukum Indonesia. Setiap sengketa akan diselesaikan di pengadilan Indonesia.

## 12. Kontak

Jika Anda memiliki pertanyaan tentang ketentuan ini, hubungi kami di:
- Email: support@chatcepat.com
- Alamat: Jakarta, Indonesia

---

Dengan menggunakan ChatCepat, Anda mengakui telah membaca, memahami, dan menyetujui ketentuan ini.
EOT;
    }

    private function getPrivacyContent(): string
    {
        return <<<'EOT'
# Kebijakan Privasi ChatCepat

**Terakhir diperbarui: 11 Desember 2025**

Di ChatCepat, kami menghargai privasi Anda dan berkomitmen melindungi data pribadi Anda. Kebijakan privasi ini menjelaskan bagaimana kami mengumpulkan, menggunakan, menyimpan, dan melindungi informasi Anda.

## 1. Informasi yang Kami Kumpulkan

### 1.1 Informasi yang Anda Berikan
- **Informasi Akun**: Nama, email, nomor telepon, foto profil
- **Informasi Profil**: Bio, status, preferensi bahasa
- **Konten**: Pesan, file, foto, video yang Anda kirim
- **Kontak**: Daftar kontak yang Anda pilih untuk dibagikan

### 1.2 Informasi yang Dikumpulkan Secara Otomatis
- **Informasi Perangkat**: Model perangkat, sistem operasi, ID unik
- **Informasi Penggunaan**: Waktu akses, fitur yang digunakan, interaksi
- **Informasi Lokasi**: Alamat IP, zona waktu (jika diizinkan)
- **Cookie dan Teknologi Serupa**: Untuk meningkatkan pengalaman pengguna

### 1.3 Informasi dari Pihak Ketiga
- Login melalui media sosial (Google, Facebook)
- Integrasi dengan layanan pihak ketiga yang Anda otorisasi

## 2. Cara Kami Menggunakan Informasi Anda

Kami menggunakan informasi Anda untuk:

### 2.1 Menyediakan dan Meningkatkan Layanan
- Memfasilitasi komunikasi antar pengguna
- Menyimpan dan mengirim pesan Anda
- Menyediakan panggilan suara dan video
- Mengembangkan fitur baru

### 2.2 Keamanan dan Kepatuhan
- Mencegah penipuan dan penyalahgunaan
- Menegakkan syarat dan ketentuan kami
- Memenuhi kewajiban hukum
- Melindungi hak dan keamanan pengguna

### 2.3 Komunikasi
- Mengirim notifikasi layanan
- Memberikan dukungan pelanggan
- Menginformasikan pembaruan dan fitur baru
- Mengirim informasi promosi (dengan persetujuan)

### 2.4 Analitik dan Personalisasi
- Menganalisis penggunaan layanan
- Meningkatkan pengalaman pengguna
- Mempersonalisasi konten dan rekomendasi

## 3. Pembagian Informasi

Kami TIDAK menjual informasi pribadi Anda. Kami hanya membagikan informasi dalam situasi berikut:

### 3.1 Dengan Persetujuan Anda
Kami akan membagikan informasi ketika Anda memberikan izin eksplisit.

### 3.2 Penyedia Layanan
Kami dapat membagikan informasi dengan penyedia layanan pihak ketiga yang membantu kami mengoperasikan layanan, seperti:
- Hosting dan infrastruktur cloud
- Analitik dan monitoring
- Layanan pembayaran
- Dukungan pelanggan

### 3.3 Kepatuhan Hukum
Kami dapat mengungkapkan informasi jika:
- Diwajibkan oleh hukum atau proses hukum
- Untuk melindungi hak dan keamanan kami atau orang lain
- Untuk mencegah atau menyelidiki penipuan
- Dalam keadaan darurat yang melibatkan keselamatan

### 3.4 Transfer Bisnis
Jika terjadi merger, akuisisi, atau penjualan aset, informasi Anda dapat ditransfer ke entitas baru.

## 4. Penyimpanan dan Keamanan Data

### 4.1 Penyimpanan Data
- Data disimpan di server yang aman di Indonesia dan regional
- Pesan dapat disimpan hingga dihapus oleh pengguna
- Backup dilakukan secara berkala untuk keandalan layanan

### 4.2 Keamanan
Kami menerapkan berbagai langkah keamanan:
- Enkripsi end-to-end untuk pesan (opsional)
- Enkripsi data saat transit dan saat disimpan
- Kontrol akses yang ketat
- Monitoring keamanan 24/7
- Audit keamanan berkala

### 4.3 Retensi Data
Kami menyimpan data Anda selama akun Anda aktif atau sepanjang diperlukan untuk menyediakan layanan. Setelah penghapusan akun, data akan dihapus dalam 90 hari.

## 5. Hak Anda

Anda memiliki hak untuk:

### 5.1 Mengakses dan Mengubah
- Melihat informasi pribadi yang kami simpan
- Memperbarui informasi profil Anda
- Mengoreksi informasi yang tidak akurat

### 5.2 Menghapus
- Menghapus pesan dan konten Anda
- Menghapus akun Anda sepenuhnya
- Meminta penghapusan data tertentu

### 5.3 Mengontrol
- Mengatur preferensi privasi
- Mengelola izin aplikasi
- Berhenti berlangganan komunikasi marketing

### 5.4 Portabilitas
- Mengekspor data Anda dalam format yang dapat dibaca mesin
- Memindahkan data ke layanan lain

### 5.5 Keberatan
- Menolak pemrosesan data tertentu
- Mengajukan keluhan ke otoritas perlindungan data

## 6. Privasi Anak-Anak

ChatCepat tidak ditujukan untuk anak-anak di bawah 17 tahun. Kami tidak dengan sengaja mengumpulkan informasi pribadi dari anak-anak. Jika Anda mengetahui bahwa anak Anda telah memberikan informasi pribadi, hubungi kami untuk menghapusnya.

## 7. Transfer Data Internasional

Jika Anda mengakses layanan dari luar Indonesia, data Anda dapat ditransfer ke dan disimpan di Indonesia. Kami memastikan perlindungan yang memadai sesuai standar internasional.

## 8. Cookie dan Teknologi Pelacakan

Kami menggunakan cookie dan teknologi serupa untuk:
- Mengingat preferensi Anda
- Memahami cara Anda menggunakan layanan
- Meningkatkan keamanan
- Menyediakan konten yang relevan

Anda dapat mengontrol cookie melalui pengaturan browser Anda.

## 9. Perubahan Kebijakan Privasi

Kami dapat memperbarui kebijakan privasi ini dari waktu ke waktu. Perubahan signifikan akan diberitahukan melalui:
- Email
- Notifikasi dalam aplikasi
- Pengumuman di website

Penggunaan layanan setelah perubahan berarti Anda menerima kebijakan baru.

## 10. Kontak Kami

Jika Anda memiliki pertanyaan tentang kebijakan privasi atau ingin menggunakan hak Anda:

**Tim Privasi ChatCepat**
- Email: privacy@chatcepat.com
- Alamat: Jakarta, Indonesia
- Waktu Respon: Maksimal 30 hari

---

Terima kasih telah mempercayai ChatCepat dengan informasi Anda. Kami berkomitmen untuk melindungi privasi Anda.
EOT;
    }

    private function getAboutContent(): string
    {
        return <<<'EOT'
# Tentang ChatCepat

## Selamat Datang di ChatCepat

ChatCepat adalah platform komunikasi modern yang dirancang untuk membuat Anda tetap terhubung dengan orang-orang yang penting dalam hidup Anda. Kami percaya bahwa komunikasi yang efektif adalah kunci untuk membangun hubungan yang lebih baik, baik itu personal maupun profesional.

## Visi Kami

**"Menghubungkan Indonesia, Satu Pesan pada Satu Waktu"**

Kami bercita-cita menjadi platform komunikasi pilihan utama di Indonesia, yang tidak hanya memudahkan orang untuk berkomunikasi, tetapi juga membangun komunitas yang lebih terhubung dan produktif.

## Misi Kami

1. **Aksesibilitas**: Menyediakan layanan komunikasi yang mudah diakses oleh semua kalangan
2. **Keamanan**: Melindungi privasi dan data pengguna dengan standar keamanan tertinggi
3. **Inovasi**: Terus berinovasi untuk menghadirkan fitur-fitur yang relevan dan bermanfaat
4. **Kualitas**: Memberikan pengalaman pengguna terbaik dengan performa yang andal
5. **Komunitas**: Membangun ekosistem komunikasi yang positif dan produktif

## Fitur Utama

### 💬 Pesan Instan
Kirim pesan teks, gambar, video, dan file dengan cepat dan mudah. Dukungan untuk pesan grup hingga 5000 anggota.

### 📞 Panggilan Suara & Video
Lakukan panggilan suara dan video berkualitas tinggi dengan koneksi yang stabil, baik satu lawan satu atau dalam grup.

### 🔒 Keamanan & Privasi
Enkripsi end-to-end untuk melindungi percakapan Anda. Kontrol penuh atas data dan privasi Anda.

### 📁 Berbagi File
Kirim file hingga 2GB dengan mudah. Mendukung semua format file populer.

### 🎨 Personalisasi
Sesuaikan tampilan aplikasi dengan tema, wallpaper, dan pengaturan notifikasi sesuai preferensi Anda.

### 🤖 Chatbot & Otomasi
Integrasikan bot untuk meningkatkan produktivitas bisnis dan komunitas Anda.

## Kenapa Memilih ChatCepat?

### ⚡ Cepat dan Ringan
Aplikasi yang dioptimalkan untuk performa maksimal, bahkan di perangkat dengan spesifikasi menengah dan koneksi internet terbatas.

### 🇮🇩 Dirancang untuk Indonesia
Fitur dan interface yang disesuaikan dengan kebutuhan dan kultur pengguna Indonesia.

### 🌐 Multi-Platform
Tersedia di iOS, Android, Web, Windows, dan macOS. Sinkronisasi otomatis di semua perangkat.

### 💰 Gratis dan Tanpa Iklan
Layanan dasar sepenuhnya gratis tanpa gangguan iklan. Fitur premium tersedia untuk kebutuhan bisnis.

### 🛡️ Privasi Terjamin
Kami tidak menjual data Anda. Privasi dan keamanan adalah prioritas utama kami.

### 👥 Dukungan Lokal
Tim customer support berbahasa Indonesia yang siap membantu Anda 24/7.

## Sejarah Kami

ChatCepat didirikan pada tahun 2024 dengan visi untuk menciptakan platform komunikasi yang benar-benar memahami kebutuhan masyarakat Indonesia. Berawal dari sebuah tim kecil yang passionate tentang teknologi dan komunikasi, kami kini telah berkembang menjadi platform yang dipercaya oleh jutaan pengguna di seluruh Indonesia.

### Pencapaian Kami

- **2024**: Peluncuran versi beta dengan 10,000 pengguna awal
- **2025**: Mencapai 1 juta pengguna aktif bulanan
- **2025**: Meluncurkan enkripsi end-to-end
- **2025**: Ekspansi ke seluruh Indonesia dengan server lokal

## Tim Kami

ChatCepat dibangun oleh tim yang berdedikasi dari berbagai latar belakang - engineers, designers, product managers, dan customer support - yang semuanya bekerja sama untuk memberikan pengalaman komunikasi terbaik bagi Anda.

### Nilai-Nilai Tim Kami

- **Inovasi**: Selalu mencari cara baru untuk meningkatkan layanan
- **Integritas**: Berkomitmen pada transparansi dan kejujuran
- **Keberagaman**: Menghargai dan merayakan perbedaan
- **Kolaborasi**: Bekerja sama untuk mencapai tujuan bersama
- **Customer First**: Pengguna adalah prioritas utama kami

## Teknologi

ChatCepat dibangun dengan teknologi terkini:

- **Backend**: Laravel 12, PHP 8.3
- **Frontend**: React 19, TypeScript, Inertia.js
- **Database**: PostgreSQL, Redis
- **Cloud**: AWS, CDN global
- **Security**: SSL/TLS, End-to-end Encryption
- **Real-time**: WebSocket, Push Notifications

## Kemitraan

Kami bekerja sama dengan berbagai organisasi dan perusahaan untuk memberikan nilai lebih kepada pengguna:

- **Institusi Pendidikan**: Fasilitas komunikasi untuk kampus dan sekolah
- **UMKM**: Solusi komunikasi bisnis yang terjangkau
- **Komunitas**: Platform untuk organisasi dan kelompok hobi
- **Enterprise**: Solusi komunikasi korporat yang aman

## Tanggung Jawab Sosial

Kami percaya pada pentingnya memberikan kembali kepada masyarakat:

- **Program Edukasi Digital**: Workshop gratis tentang komunikasi digital yang aman
- **Dukungan untuk UMKM**: Menyediakan fitur bisnis gratis untuk usaha kecil
- **Konten Positif**: Kampanye melawan cyberbullying dan konten negatif
- **Ramah Lingkungan**: Infrastruktur server menggunakan energi terbarukan

## Kontak Kami

Kami senang mendengar dari Anda!

### Kantor Pusat
**PT ChatCepat Indonesia**
Jl. Sudirman No. 123
Jakarta Selatan, DKI Jakarta 12190
Indonesia

### Hubungi Kami
- **Email Umum**: hello@chatcepat.com
- **Support**: support@chatcepat.com
- **Bisnis**: business@chatcepat.com
- **Media**: press@chatcepat.com
- **Telepon**: +62 21 1234 5678

### Ikuti Kami
- Instagram: @chatcepat
- Twitter: @chatcepat
- Facebook: ChatCepat Official
- LinkedIn: ChatCepat Indonesia
- YouTube: ChatCepat Channel

## Bergabunglah dengan Kami

Kami selalu mencari talenta terbaik untuk bergabung dengan tim kami. Jika Anda passionate tentang teknologi dan ingin membuat dampak positif, kunjungi halaman karir kami di careers.chatcepat.com

---

**ChatCepat - Komunikasi Lebih Mudah, Hubungan Lebih Dekat**

Terima kasih telah menjadi bagian dari perjalanan kami. Bersama-sama, kita membangun masa depan komunikasi Indonesia yang lebih baik.
EOT;
    }
}
