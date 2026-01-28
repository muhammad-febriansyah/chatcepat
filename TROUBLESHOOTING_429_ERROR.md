# 🔧 Troubleshooting: 429 TOO MANY REQUESTS Error

## ❓ Apa itu Error 429?

Error **429 TOO MANY REQUESTS** berarti Anda telah melebihi batas rate limiting yang ditetapkan Laravel.

### Kenapa Terjadi?

Di aplikasi ChatCepat, rate limiting diatur di `app/Providers/FortifyServiceProvider.php`:

```php
RateLimiter::for('login', function (Request $request) {
    $throttleKey = Str::transliterate(Str::lower($request->input(Fortify::username())) . '|' . $request->ip());

    return Limit::perMinutes(5, 3)->by($throttleKey);
});
```

**Limit Default:**
- **3 login attempts** dalam **5 menit**
- Per kombinasi: **email + IP address**

**Contoh:**
- Jika Anda mencoba login dengan `admin@example.com` dari IP `127.0.0.1` sebanyak 3x dan gagal
- Attempt ke-4 akan di-block dengan error 429
- Harus tunggu 5 menit atau clear cache

---

## ✅ SOLUSI

### 1. Quick Fix (Clear Cache)

```bash
# Clear semua cache
php artisan cache:clear
php artisan config:clear

# Clear rate limit cache via tinker
php artisan tinker --execute="Cache::flush(); echo 'Rate limit cleared\n';"
```

### 2. Tunggu 5 Menit

Cara paling simple: tunggu 5 menit, rate limit akan reset otomatis.

### 3. Ubah Rate Limiting (Development Only)

**⚠️ HANYA untuk development, JANGAN untuk production!**

Edit `app/Providers/FortifyServiceProvider.php` line 173-177:

**Development (lebih longgar):**
```php
RateLimiter::for('login', function (Request $request) {
    $throttleKey = Str::transliterate(Str::lower($request->input(Fortify::username())) . '|' . $request->ip());

    // 100 attempts per minute (untuk development)
    return Limit::perMinutes(1, 100)->by($throttleKey);
});
```

**Production (ketat untuk security):**
```php
RateLimiter::for('login', function (Request $request) {
    $throttleKey = Str::transliterate(Str::lower($request->input(Fortify::username())) . '|' . $request->ip());

    // 5 attempts per 5 minutes (lebih secure)
    return Limit::perMinutes(5, 5)->by($throttleKey);
});
```

Setelah edit, jalankan:
```bash
php artisan config:clear
php artisan cache:clear
```

---

## 🔒 KENAPA RATE LIMITING PENTING?

Rate limiting melindungi aplikasi dari:

1. **Brute Force Attacks** - Hacker mencoba login berulang-ulang dengan password berbeda
2. **DDoS Attacks** - Flooding server dengan request
3. **Credential Stuffing** - Menggunakan leaked credentials dari database breach
4. **Bot Attacks** - Automated attacks dari scripts/bots

**Jangan disable rate limiting di production!**

---

## 📊 RATE LIMITING DI APLIKASI

### Routes yang Menggunakan Rate Limiting:

1. **Login** (`/login`)
   - Limit: 3 attempts / 5 minutes
   - Key: email + IP address

2. **Two-Factor Authentication** (`/two-factor-challenge`)
   - Limit: 5 attempts / minute
   - Key: session ID

3. **API Routes** (jika ada)
   - Check `app/Http/Kernel.php` untuk throttle middleware

---

## 🧪 TESTING RATE LIMITING

### Test Rate Limit:

```php
// Via tinker
php artisan tinker
```

```php
// Simulate multiple login attempts
for ($i = 1; $i <= 5; $i++) {
    echo "Attempt $i\n";

    $response = \Illuminate\Support\Facades\Http::post('http://127.0.0.1:8000/login', [
        'email' => 'test@example.com',
        'password' => 'wrongpassword',
    ]);

    echo "Status: " . $response->status() . "\n";

    if ($response->status() === 429) {
        echo "❌ Rate limited!\n";
        break;
    }
}
```

### Check Rate Limit Status:

```php
use Illuminate\Support\Facades\RateLimiter;

$key = 'test@example.com|127.0.0.1';
$attempts = RateLimiter::attempts($key);
$remaining = RateLimiter::remaining($key, 3);

echo "Attempts: $attempts\n";
echo "Remaining: $remaining\n";
```

### Clear Rate Limit untuk Specific User:

```php
use Illuminate\Support\Facades\RateLimiter;

$key = 'test@example.com|127.0.0.1';
RateLimiter::clear($key);

echo "Rate limit cleared for $key\n";
```

---

## 🚨 PRODUCTION BEST PRACTICES

### 1. Monitor Rate Limiting

Setup monitoring untuk track:
- Berapa banyak users kena rate limit
- IP addresses yang sering kena rate limit
- Pattern serangan brute force

### 2. Customize Error Page

Buat custom error page untuk 429:

Create `resources/views/errors/429.blade.php`:

```blade
<!DOCTYPE html>
<html>
<head>
    <title>Too Many Requests</title>
</head>
<body>
    <h1>Too Many Login Attempts</h1>
    <p>You have exceeded the maximum number of login attempts.</p>
    <p>Please try again in {{ $retryAfter ?? 5 }} minutes.</p>
</body>
</html>
```

### 3. Log Failed Attempts

Di `FortifyServiceProvider.php`, tambahkan logging:

```php
RateLimiter::for('login', function (Request $request) {
    $throttleKey = Str::transliterate(Str::lower($request->input(Fortify::username())) . '|' . $request->ip());

    $limit = Limit::perMinutes(5, 3)->by($throttleKey);

    // Log when rate limit exceeded
    if (RateLimiter::tooManyAttempts($throttleKey, 3)) {
        \Log::warning('Rate limit exceeded', [
            'email' => $request->input('email'),
            'ip' => $request->ip(),
            'attempts' => RateLimiter::attempts($throttleKey),
        ]);
    }

    return $limit;
});
```

### 4. Notify Admin

Setup alert untuk suspicious activity:

```php
use App\Notifications\SuspiciousLoginAttempts;

if (RateLimiter::attempts($throttleKey) >= 5) {
    // Notify admin
    $admin = User::where('role', 'admin')->first();
    $admin->notify(new SuspiciousLoginAttempts($request->ip(), $request->input('email')));
}
```

---

## 🛠️ ADVANCED CONFIGURATION

### Dynamic Rate Limiting Based on User

```php
RateLimiter::for('login', function (Request $request) {
    $email = $request->input(Fortify::username());
    $user = User::where('email', $email)->first();

    // Trusted users (admins) get more attempts
    if ($user && $user->role === 'admin') {
        return Limit::perMinutes(5, 10)->by($email . '|' . $request->ip());
    }

    // Regular users
    return Limit::perMinutes(5, 3)->by($email . '|' . $request->ip());
});
```

### IP Whitelist (Bypass Rate Limiting)

```php
RateLimiter::for('login', function (Request $request) {
    // Whitelist IPs (office, trusted IPs)
    $whitelistedIPs = ['127.0.0.1', '192.168.1.1'];

    if (in_array($request->ip(), $whitelistedIPs)) {
        return Limit::none(); // No rate limiting
    }

    $throttleKey = Str::transliterate(Str::lower($request->input(Fortify::username())) . '|' . $request->ip());
    return Limit::perMinutes(5, 3)->by($throttleKey);
});
```

---

## 📋 CHECKLIST

### When You Get 429 Error:

- [ ] Wait 5 minutes (simplest solution)
- [ ] OR clear cache: `php artisan cache:clear`
- [ ] OR clear specific rate limit via tinker
- [ ] Check logs: `storage/logs/laravel.log`
- [ ] Verify credentials correct
- [ ] Check if IP blocked

### For Production Setup:

- [ ] Keep rate limiting enabled (security)
- [ ] Monitor failed login attempts
- [ ] Setup custom 429 error page
- [ ] Log suspicious activities
- [ ] Setup alerts for admins
- [ ] Consider CAPTCHA after X failed attempts
- [ ] Implement account lockout after Y attempts

---

## 🔗 RELATED FILES

- `app/Providers/FortifyServiceProvider.php` - Rate limiting configuration
- `config/fortify.php` - Fortify settings
- `app/Http/Kernel.php` - Global middleware & throttle
- `.env` - Cache driver configuration

---

## 📚 REFERENCES

- Laravel Rate Limiting: https://laravel.com/docs/11.x/rate-limiting
- Laravel Fortify: https://laravel.com/docs/11.x/fortify
- Security Best Practices: https://laravel.com/docs/11.x/authentication

---

**Last Updated**: 2026-01-28
