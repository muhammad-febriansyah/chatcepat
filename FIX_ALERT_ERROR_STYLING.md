# Fix: Alert Error Styling - Teks Putih Tidak Terlihat

## Masalah
Alert error menampilkan teks putih atau abu-abu muda (`text-muted-foreground`) pada background merah muda, sehingga sulit dibaca.

## Screenshot Masalah
- Error code dengan teks putih/abu-abu tidak terlihat jelas di background merah
- Teks error menggunakan warna yang kontrasnya rendah

## Solusi yang Diterapkan

### 1. Fix Komponen Alert Dasar (`alert.tsx`)

**File**: `resources/js/components/ui/alert.tsx`

#### Perubahan pada `alertVariants`:
```typescript
// BEFORE (❌ Teks sulit dibaca):
destructive: "text-destructive-foreground [&>svg]:text-current *:data-[slot=alert-description]:text-destructive-foreground/80"

// AFTER (✅ Teks jelas terbaca):
destructive: "border-red-500 bg-red-50 dark:bg-red-950 text-red-900 dark:text-red-100 [&>svg]:text-red-600 dark:[&>svg]:text-red-400"
```

**Perubahan**:
- ✅ Background: `bg-red-50` (light mode) / `bg-red-950` (dark mode)
- ✅ Text: `text-red-900` (sangat gelap, kontras tinggi) / `text-red-100` (light untuk dark mode)
- ✅ Border: `border-red-500` (merah terang)
- ✅ Icon: `text-red-600` / `text-red-400` (dark mode)

#### Perubahan pada `AlertDescription`:
```typescript
// BEFORE (❌ Selalu abu-abu):
className="text-muted-foreground col-start-2 grid justify-items-start gap-1 text-sm [&_p]:leading-relaxed"

// AFTER (✅ Mewarisi warna parent):
className="col-start-2 grid justify-items-start gap-1 text-sm [&_p]:leading-relaxed text-inherit"
```

**Perubahan**:
- ❌ Removed: `text-muted-foreground` (abu-abu, sulit dibaca)
- ✅ Added: `text-inherit` (mewarisi warna dari parent alert)

### 2. Fix WhatsApp Session Error Alert (`show.tsx`)

**File**: `resources/js/pages/user/whatsapp/show.tsx`

#### Enhanced Error Alert Styling:
```tsx
<Alert variant="destructive" className="border-red-500 bg-red-50 dark:bg-red-950">
    <AlertTriangle className="size-5 text-red-600 dark:text-red-400" />
    <AlertTitle className="font-semibold text-red-900 dark:text-red-100">
        Gagal Menautkan WhatsApp
    </AlertTitle>
    <AlertDescription className="mt-2 text-red-800 dark:text-red-200">
        <div className="flex items-start justify-between">
            <div>
                <p className="font-medium">{connectionError.message}</p>
                {connectionError.code && (
                    <p className="text-xs text-red-700 dark:text-red-300 mt-1 font-mono bg-red-100 dark:bg-red-900 px-2 py-1 rounded inline-block">
                        Error code: {connectionError.code}
                    </p>
                )}
                ...
            </div>
            ...
        </div>
    </AlertDescription>
</Alert>
```

**Perubahan**:
- ✅ Title: `text-red-900` (sangat gelap, bold)
- ✅ Description: `text-red-800` (gelap, mudah dibaca)
- ✅ Error Code:
  - Warna: `text-red-700` (merah gelap)
  - Background: `bg-red-100` (merah sangat muda, seperti badge)
  - Font: `font-mono` (monospace untuk kode)
  - Style: `px-2 py-1 rounded inline-block` (badge style)
- ✅ Dark mode support untuk semua elemen

## Dampak

### ✅ Sebelum Fix:
- ❌ Teks error abu-abu/putih susah dibaca
- ❌ Error code tidak menonjol
- ❌ Kontras rendah

### ✅ Sesudah Fix:
- ✅ Teks error sangat jelas (merah gelap pada background merah muda)
- ✅ Error code menonjol dengan style badge
- ✅ Kontras tinggi, mudah dibaca
- ✅ Support dark mode
- ✅ Konsisten di semua alert destructive

## Testing

### Test Alert Error:
1. Buka halaman WhatsApp session detail
2. Trigger error 401 (connection error)
3. Pastikan:
   - ✅ Alert background merah muda (`bg-red-50`)
   - ✅ Teks error berwarna merah gelap (`text-red-900`)
   - ✅ Error code punya background badge (`bg-red-100`)
   - ✅ Semua teks mudah dibaca

### Test Other Destructive Alerts:
```tsx
<Alert variant="destructive">
    <AlertTitle>Test Title</AlertTitle>
    <AlertDescription>Test description text</AlertDescription>
</Alert>
```

Semua alert destructive sekarang otomatis menggunakan styling yang lebih baik.

## Files Changed

1. ✅ `resources/js/components/ui/alert.tsx`
   - Updated `alertVariants` untuk destructive variant
   - Updated `AlertDescription` untuk inherit text color

2. ✅ `resources/js/pages/user/whatsapp/show.tsx`
   - Enhanced error alert dengan explicit color classes
   - Added badge styling untuk error code
   - Added dark mode support

## Build & Deploy

```bash
cd /Applications/laravel/chatcepat
npm run build
```

Build berhasil tanpa error! ✅

## Checklist
- [x] Fix alert.tsx base component
- [x] Fix show.tsx error alert
- [x] Add dark mode support
- [x] Add badge styling for error code
- [x] Build frontend successfully
- [ ] Deploy ke production
- [ ] Test di production

## Notes
- Perubahan ini **backward compatible**
- Semua alert destructive di aplikasi otomatis lebih readable
- Dark mode support included
- Error code sekarang ditampilkan dengan style badge yang jelas
