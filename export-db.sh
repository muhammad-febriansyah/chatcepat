#!/bin/bash

# Script untuk export database Laravel
# Usage: bash export-db.sh

# Load environment variables
set -a
source .env
set +a

# Buat folder backup jika belum ada
mkdir -p storage/backups

# Nama file backup dengan timestamp
BACKUP_FILE="storage/backups/backup_${DB_DATABASE}_$(date +%Y%m%d_%H%M%S).sql"
BACKUP_FILE_GZ="${BACKUP_FILE}.gz"

echo "🔄 Memulai export database: ${DB_DATABASE}"

# Export database
mysqldump -h "${DB_HOST}" \
          -P "${DB_PORT}" \
          -u "${DB_USERNAME}" \
          -p"${DB_PASSWORD}" \
          "${DB_DATABASE}" > "${BACKUP_FILE}"

# Check jika berhasil
if [ $? -eq 0 ]; then
    echo "✅ Export berhasil: ${BACKUP_FILE}"

    # Compress file
    gzip "${BACKUP_FILE}"
    echo "✅ File di-compress: ${BACKUP_FILE_GZ}"

    # Tampilkan ukuran file
    du -h "${BACKUP_FILE_GZ}"

    # Hapus backup lama (lebih dari 7 hari)
    find storage/backups -name "*.sql.gz" -mtime +7 -delete
    echo "🗑️  Backup lama (>7 hari) dihapus"

    echo ""
    echo "📦 Backup tersimpan di: ${BACKUP_FILE_GZ}"
else
    echo "❌ Export gagal!"
    exit 1
fi
