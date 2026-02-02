# Panduan Lengkap Backup Database di VPS

## Quick Reference

```bash
# Export database (paling simple)
mysqldump -u root -p chatcepat > backup.sql

# Export + compress
mysqldump -u root -p chatcepat | gzip > backup.sql.gz

# Export semua database
mysqldump -u root -p --all-databases > all_databases.sql

# Download langsung ke komputer lokal
ssh user@server "mysqldump -u root -pPASSWORD database | gzip" > backup.sql.gz
```

---

## Metode 1: Manual Export (Recommended untuk One-Time)

### Basic Export

```bash
# SSH ke VPS
ssh user@chatcepat.id

# Export database
mysqldump -u root -p chatcepat > backup_$(date +%Y%m%d).sql

# Input password saat diminta
```

### Export dengan Compression (Ukuran Lebih Kecil)

```bash
mysqldump -u root -p chatcepat | gzip > backup_$(date +%Y%m%d).sql.gz
```

Keuntungan compression:
- File 10x lebih kecil
- Lebih cepat download
- Hemat storage

### Export Struktur Database Saja (Tanpa Data)

```bash
mysqldump -u root -p --no-data chatcepat > struktur.sql
```

Berguna untuk:
- Setup database di development
- Dokumentasi struktur
- Migration planning

### Export Data Saja (Tanpa Struktur)

```bash
mysqldump -u root -p --no-create-info chatcepat > data_only.sql
```

### Export Tabel Tertentu

```bash
# Export beberapa tabel
mysqldump -u root -p chatcepat users transactions sessions > backup_specific.sql

# Export satu tabel
mysqldump -u root -p chatcepat users > users_only.sql
```

---

## Metode 2: Download Langsung ke Komputer Lokal

### Satu Perintah (Paling Cepat)

```bash
# Jalankan di komputer lokal (bukan di VPS)
ssh user@chatcepat.id "mysqldump -u root -p'PASSWORD' chatcepat | gzip" > backup_chatcepat_$(date +%Y%m%d).sql.gz
```

⚠️ **PENTING:** Ganti `PASSWORD` dengan password MySQL yang sebenarnya.

### Dua Step (Lebih Aman)

```bash
# 1. SSH ke VPS dan export
ssh user@chatcepat.id
mysqldump -u root -p chatcepat | gzip > ~/backup.sql.gz
exit

# 2. Download ke lokal
scp user@chatcepat.id:~/backup.sql.gz ./backup_chatcepat_$(date +%Y%m%d).sql.gz

# 3. Hapus file di server (optional)
ssh user@chatcepat.id "rm ~/backup.sql.gz"
```

---

## Metode 3: Backup Otomatis dengan Cron (Production)

### Setup Cron Job

1. **Buat script backup** (gunakan `export-db.sh` yang sudah dibuat)

2. **Upload ke VPS:**
   ```bash
   scp export-db.sh user@chatcepat.id:/var/www/chatcepat/
   ```

3. **SSH ke VPS dan setup:**
   ```bash
   ssh user@chatcepat.id
   cd /var/www/chatcepat
   chmod +x export-db.sh
   ```

4. **Edit crontab:**
   ```bash
   crontab -e
   ```

5. **Tambahkan schedule (pilih salah satu):**
   ```bash
   # Backup setiap hari jam 2 pagi
   0 2 * * * /var/www/chatcepat/export-db.sh

   # Backup setiap 6 jam
   0 */6 * * * /var/www/chatcepat/export-db.sh

   # Backup setiap hari Minggu jam 3 pagi
   0 3 * * 0 /var/www/chatcepat/export-db.sh
   ```

6. **Cek cron log:**
   ```bash
   cat storage/backups/backup.log
   ```

### Cron Schedule Reference

```
* * * * *
│ │ │ │ │
│ │ │ │ └─ Day of week (0-7, 0 = Sunday)
│ │ │ └─── Month (1-12)
│ │ └───── Day of month (1-31)
│ └─────── Hour (0-23)
└───────── Minute (0-59)
```

Contoh:
- `0 2 * * *` = Setiap hari jam 02:00
- `*/30 * * * *` = Setiap 30 menit
- `0 */4 * * *` = Setiap 4 jam
- `0 0 * * 0` = Setiap minggu (Minggu jam 00:00)

---

## Metode 4: Menggunakan Laravel Package

### Install Spatie Backup (Recommended)

```bash
composer require spatie/laravel-backup
php artisan vendor:publish --provider="Spatie\Backup\BackupServiceProvider"
```

### Konfigurasi (`config/backup.php`)

```php
'backup' => [
    'name' => 'chatcepat',
    'source' => [
        'files' => [
            'include' => [
                base_path(),
            ],
            'exclude' => [
                base_path('vendor'),
                base_path('node_modules'),
            ],
        ],
        'databases' => ['mysql'],
    ],
    'destination' => [
        'disks' => ['local'],
    ],
],
```

### Usage

```bash
# Backup database + files
php artisan backup:run

# Backup only database
php artisan backup:run --only-db

# List backups
php artisan backup:list

# Clean old backups
php artisan backup:clean
```

### Setup Cron untuk Spatie Backup

```bash
# crontab -e
0 2 * * * cd /var/www/chatcepat && php artisan backup:run --only-db
0 3 * * * cd /var/www/chatcepat && php artisan backup:clean
```

---

## Metode 5: Upload ke Cloud Storage

### A. Google Drive (dengan rclone)

```bash
# 1. Install rclone
curl https://rclone.org/install.sh | sudo bash

# 2. Configure rclone
rclone config

# 3. Ikuti wizard untuk setup Google Drive
# Name: gdrive
# Storage: google drive

# 4. Test connection
rclone lsd gdrive:

# 5. Upload backup
rclone copy backup.sql.gz gdrive:ChatcePat-Backups/
```

### B. AWS S3

```bash
# 1. Install AWS CLI
sudo apt install awscli

# 2. Configure
aws configure
# Input: Access Key, Secret Key, Region

# 3. Upload
aws s3 cp backup.sql.gz s3://your-bucket/backups/
```

### C. Dropbox

```bash
# 1. Install Dropbox Uploader
cd ~
git clone https://github.com/andreafabrizi/Dropbox-Uploader.git
cd Dropbox-Uploader
chmod +x dropbox_uploader.sh

# 2. Configure
./dropbox_uploader.sh

# 3. Upload
./dropbox_uploader.sh upload backup.sql.gz /Backups/
```

---

## Restore Database

### From Uncompressed SQL

```bash
mysql -u root -p chatcepat < backup.sql
```

### From Compressed SQL

```bash
gunzip < backup.sql.gz | mysql -u root -p chatcepat
```

### Restore Tabel Tertentu

```bash
mysql -u root -p chatcepat < users_only.sql
```

### Restore dengan Drop Database Dulu

```bash
mysql -u root -p -e "DROP DATABASE IF EXISTS chatcepat; CREATE DATABASE chatcepat;"
mysql -u root -p chatcepat < backup.sql
```

---

## Best Practices

### 1. Retention Policy

Simpan backup dengan strategi ini:

```bash
# Daily backups: 7 hari terakhir
# Weekly backups: 4 minggu terakhir
# Monthly backups: 12 bulan terakhir

# Script untuk cleanup otomatis
find /backups/daily -name "*.sql.gz" -mtime +7 -delete
find /backups/weekly -name "*.sql.gz" -mtime +28 -delete
find /backups/monthly -name "*.sql.gz" -mtime +365 -delete
```

### 2. Verifikasi Backup

Selalu test restore backup:

```bash
# Restore ke database temporary
mysql -u root -p -e "CREATE DATABASE test_restore;"
gunzip < backup.sql.gz | mysql -u root -p test_restore

# Cek jumlah tabel
mysql -u root -p -e "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'test_restore';"

# Hapus database temporary
mysql -u root -p -e "DROP DATABASE test_restore;"
```

### 3. Security

```bash
# Encrypt backup sebelum upload
gpg --symmetric --cipher-algo AES256 backup.sql.gz

# Decrypt saat butuh restore
gpg --decrypt backup.sql.gz.gpg | gunzip | mysql -u root -p chatcepat
```

### 4. Monitoring

Setup notifikasi jika backup gagal:

```bash
# Tambahkan di backup script
if [ $? -ne 0 ]; then
    # Kirim email
    echo "Backup failed!" | mail -s "DB Backup Failed" admin@chatcepat.id

    # Atau Telegram
    curl -X POST "https://api.telegram.org/bot$TOKEN/sendMessage" \
         -d chat_id="$CHAT_ID" \
         -d text="⚠️ Database backup GAGAL!"
fi
```

### 5. Storage Management

```bash
# Cek ukuran backup folder
du -sh /var/www/chatcepat/storage/backups

# Cek 10 file terbesar
ls -lhS /var/www/chatcepat/storage/backups | head -11

# Hapus backup lebih dari 30 hari
find /var/www/chatcepat/storage/backups -name "*.sql.gz" -mtime +30 -delete
```

---

## Troubleshooting

### Error: "Access denied for user"

```bash
# Cek user MySQL
mysql -u root -p -e "SELECT user, host FROM mysql.user;"

# Grant privileges
mysql -u root -p -e "GRANT ALL PRIVILEGES ON chatcepat.* TO 'username'@'localhost';"
```

### Error: "mysqldump: command not found"

```bash
# Install MySQL client
sudo apt update
sudo apt install mysql-client
```

### Backup Terlalu Lama

```bash
# Export tanpa lock tables (hati-hati, bisa inconsistent)
mysqldump -u root -p --single-transaction --quick chatcepat > backup.sql

# Export dengan multiple threads (jika database besar)
mydumper -u root -p PASSWORD -B chatcepat -o /backups/chatcepat
```

### File Backup Terlalu Besar

```bash
# Export per tabel
for table in $(mysql -u root -p chatcepat -e "SHOW TABLES;" | tail -n +2); do
    mysqldump -u root -p chatcepat $table | gzip > ${table}.sql.gz
done
```

---

## Rekomendasi untuk ChatCepat

### Production Setup

1. **Daily Backup:**
   ```bash
   0 2 * * * /var/www/chatcepat/backup-cron.sh
   ```

2. **Upload ke Cloud:**
   - Setup rclone dengan Google Drive
   - Upload backup otomatis setiap selesai

3. **Retention:**
   - Keep 7 hari daily backups
   - Keep 4 minggu weekly backups
   - Keep 12 bulan monthly backups

4. **Monitoring:**
   - Setup Telegram notification
   - Alert jika backup gagal
   - Alert jika disk space <10GB

5. **Test Restore:**
   - Test restore seminggu sekali
   - Verifikasi data integrity

### Script Lengkap

Gunakan `backup-cron.sh` yang sudah dibuat, lalu tambahkan upload ke cloud:

```bash
# Setelah backup berhasil, upload ke Google Drive
if [ $? -eq 0 ]; then
    rclone copy "$BACKUP_FILE" gdrive:ChatCepat-Backups/$(date +%Y-%m)/
    echo "✅ Uploaded to Google Drive"
fi
```

---

## Resources

- [MySQL Backup Documentation](https://dev.mysql.com/doc/refman/8.0/en/backup-and-recovery.html)
- [Spatie Laravel Backup](https://spatie.be/docs/laravel-backup)
- [rclone Documentation](https://rclone.org/docs/)
- [AWS S3 CLI](https://docs.aws.amazon.com/cli/latest/userguide/cli-services-s3.html)
