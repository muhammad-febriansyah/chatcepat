# Panduan Setup SEO - ChatCepat

## Status Implementasi

### ✅ Sudah Selesai

1. **File Verifikasi Google Search Console**
   - File: `public/google91cc6e73279be508.html`
   - Status: Sudah tersedia

2. **Meta Tags Dasar**
   - Title, Description, Keywords
   - Open Graph (Facebook)
   - Twitter Cards
   - Canonical URL
   - Lokasi: `resources/views/app.blade.php`

3. **Sitemap XML**
   - Controller: `app/Http/Controllers/SitemapController.php`
   - Routes:
     - `/sitemap.xml` - Sitemap index
     - `/sitemap-main.xml` - Halaman statis
     - `/sitemap-blog.xml` - Blog posts

4. **robots.txt**
   - File: `public/robots.txt`
   - Sudah dikonfigurasi dengan sitemap URL

5. **Structured Data (Schema.org)**
   - Organization schema untuk homepage
   - Lokasi: `resources/views/app.blade.php`

6. **SEO Service**
   - Class: `app/Services/SeoService.php`
   - Fitur:
     - Dynamic meta tags
     - Article schema (blog)
     - Product schema
     - FAQ schema
     - Breadcrumb schema

---

## Langkah-Langkah Selanjutnya

### 1. Verifikasi Google Search Console

1. Pastikan aplikasi sudah di-deploy ke production
2. Akses: https://www.chatcepat.id/google91cc6e73279be508.html
3. Pastikan file bisa diakses (tidak 404)
4. Kembali ke Google Search Console
5. Klik tombol **VERIFY**
6. Tunggu konfirmasi verifikasi berhasil

### 2. Submit Sitemap ke Google Search Console

Setelah verifikasi berhasil:

1. Di Google Search Console, pilih property **chatcepat.id**
2. Menu: **Sitemaps** (di sidebar kiri)
3. Tambahkan sitemap URL: `https://www.chatcepat.id/sitemap.xml`
4. Klik **Submit**

### 3. Test Sitemap di Browser

```bash
# Test di browser atau curl
curl https://www.chatcepat.id/sitemap.xml
curl https://www.chatcepat.id/sitemap-main.xml
curl https://www.chatcepat.id/sitemap-blog.xml
```

### 4. Implementasi SEO Service di Controller (Opsional)

Untuk halaman yang membutuhkan meta tags khusus, gunakan SEO Service:

**Contoh di Blog Post Controller:**

```php
use App\Services\SeoService;

public function show($slug, SeoService $seo)
{
    $post = Post::where('slug', $slug)->firstOrFail();

    // Set meta tags
    $seo->setTitle($post->title)
        ->setDescription($post->excerpt)
        ->setImage(asset('storage/' . $post->featured_image))
        ->setCanonical(url('/blog/' . $post->slug));

    // Add Article schema
    $seo->addArticleSchema([
        'title' => $post->title,
        'description' => $post->excerpt,
        'image' => asset('storage/' . $post->featured_image),
        'published_at' => $post->published_at,
        'updated_at' => $post->updated_at,
        'author' => $post->author->name ?? 'ChatCepat Team',
    ]);

    // Add Breadcrumb
    $seo->addBreadcrumbSchema([
        ['name' => 'Home', 'url' => url('/')],
        ['name' => 'Blog', 'url' => url('/blog')],
        ['name' => $post->title, 'url' => url('/blog/' . $post->slug)],
    ]);

    $seo->share();

    return Inertia::render('blog-detail', [
        'post' => $post,
    ]);
}
```

### 5. Update app.blade.php untuk SEO Service (Opsional)

Jika menggunakan SEO Service, update `resources/views/app.blade.php`:

```blade
@if(isset($seoMeta))
    <title>{{ $seoMeta['title'] ?? config('app.name') }}</title>
    <meta name="description" content="{{ $seoMeta['description'] ?? 'Platform CRM berbasis AI' }}">

    @if(isset($seoMeta['canonical']))
        <link rel="canonical" href="{{ $seoMeta['canonical'] }}">
    @endif
@else
    <title inertia>{{ $siteName ?? config('app.name', 'CekatAI') }}</title>
    <meta name="description" content="{{ $siteDescription ?? 'Platform CRM berbasis AI' }}">
    <link rel="canonical" href="{{ url()->current() }}">
@endif

{{-- Schema dari SEO Service --}}
@if(isset($seoSchema) && count($seoSchema) > 0)
    @foreach($seoSchema as $schema)
        <script type="application/ld+json">
        {!! json_encode($schema, JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT) !!}
        </script>
    @endforeach
@endif
```

### 6. Setup Google Analytics & Google Tag Manager (Rekomendasi)

**Google Analytics 4:**

1. Buat property di https://analytics.google.com
2. Dapatkan Measurement ID (format: G-XXXXXXXXXX)
3. Tambahkan ke `resources/views/app.blade.php`:

```blade
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
</script>
```

**Google Tag Manager:**

Alternatif yang lebih fleksibel:

```blade
<!-- Google Tag Manager -->
<script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-XXXXXXX');</script>
<!-- End Google Tag Manager -->
```

### 7. Test SEO dengan Tools

**a. Google Rich Results Test:**
- URL: https://search.google.com/test/rich-results
- Test URL: https://www.chatcepat.id

**b. PageSpeed Insights:**
- URL: https://pagespeed.web.dev/
- Test performa & SEO

**c. Schema Validator:**
- URL: https://validator.schema.org/
- Validasi structured data

**d. Mobile-Friendly Test:**
- URL: https://search.google.com/test/mobile-friendly

### 8. Optimasi Tambahan (Rekomendasi)

1. **Optimize Images:**
   - Gunakan WebP format
   - Implementasi lazy loading
   - Add alt text pada semua gambar

2. **Page Speed:**
   - Minify CSS/JS (sudah otomatis di Laravel Vite)
   - Enable compression (gzip/brotli) di server
   - Cache static assets

3. **Meta Tags per Halaman:**
   - Pricing page: highlight pricing schema
   - FAQ page: FAQ schema (sudah ada di SEO Service)
   - Contact page: LocalBusiness schema

4. **Internal Linking:**
   - Link dari blog ke halaman produk
   - Link dari homepage ke halaman penting

---

## Checklist Final

- [ ] Deploy aplikasi ke production
- [ ] Verifikasi file Google bisa diakses
- [ ] Klik VERIFY di Google Search Console
- [ ] Submit sitemap.xml
- [ ] Setup Google Analytics
- [ ] Test dengan Google Rich Results
- [ ] Test mobile-friendly
- [ ] Test PageSpeed Insights
- [ ] Monitor di Google Search Console (indexing progress)
- [ ] Submit URL penting untuk indexing cepat

---

## Monitoring SEO

Setelah setup selesai, monitor melalui:

1. **Google Search Console:**
   - Coverage (halaman yang diindex)
   - Performance (impressions, clicks, CTR)
   - Sitemap status
   - Mobile usability

2. **Google Analytics:**
   - Organic traffic
   - User behavior
   - Conversion tracking

3. **Weekly Tasks:**
   - Publish blog content (1-2 artikel/minggu)
   - Update sitemap otomatis
   - Monitor keyword rankings
   - Fix SEO issues dari Search Console

---

## Support & Resources

- Google Search Console: https://search.google.com/search-console
- Google Analytics: https://analytics.google.com
- Schema.org: https://schema.org
- SEO Service Code: `app/Services/SeoService.php`
- Sitemap Controller: `app/Http/Controllers/SitemapController.php`

---

**Dibuat oleh:** Claude AI Assistant
**Tanggal:** {{ date('Y-m-d') }}
**Project:** ChatCepat - AI CRM Platform
