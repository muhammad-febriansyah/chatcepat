#!/bin/bash

# Backup Script untuk Cron Job
# Setup cron: crontab -e
# Tambahkan: 0 2 * * * /path/to/backup-cron.sh

# Path ke project Laravel
PROJECT_PATH="/var/www/chatcepat"
cd "$PROJECT_PATH"

# Load .env
export $(cat .env | grep -v '^#' | xargs)

# Folder backup
BACKUP_DIR="$PROJECT_PATH/storage/backups"
mkdir -p "$BACKUP_DIR"

# Timestamp
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/backup_${DB_DATABASE}_${DATE}.sql.gz"

# Export dan compress
mysqldump -h "$DB_HOST" \
          -P "$DB_PORT" \
          -u "$DB_USERNAME" \
          -p"$DB_PASSWORD" \
          "$DB_DATABASE" | gzip > "$BACKUP_FILE"

# Check status
if [ $? -eq 0 ]; then
    echo "[$(date)] ✅ Backup berhasil: $BACKUP_FILE" >> "$BACKUP_DIR/backup.log"

    # Hapus backup lebih dari 30 hari
    find "$BACKUP_DIR" -name "*.sql.gz" -mtime +30 -delete

    # Optional: Upload ke cloud storage (Google Drive, Dropbox, S3, dll)
    # rclone copy "$BACKUP_FILE" remote:backups/
else
    echo "[$(date)] ❌ Backup gagal!" >> "$BACKUP_DIR/backup.log"

    # Optional: Kirim notifikasi error
    # curl -X POST https://api.telegram.org/botTOKEN/sendMessage \
    #      -d chat_id=YOUR_CHAT_ID \
    #      -d text="Database backup GAGAL!"
fi

# Cleanup file log yang terlalu besar (>10MB)
if [ -f "$BACKUP_DIR/backup.log" ]; then
    LOG_SIZE=$(stat -f%z "$BACKUP_DIR/backup.log" 2>/dev/null || stat -c%s "$BACKUP_DIR/backup.log" 2>/dev/null)
    if [ "$LOG_SIZE" -gt 10485760 ]; then
        tail -n 1000 "$BACKUP_DIR/backup.log" > "$BACKUP_DIR/backup.log.tmp"
        mv "$BACKUP_DIR/backup.log.tmp" "$BACKUP_DIR/backup.log"
    fi
fi
