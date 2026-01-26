<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">

<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="csrf-token" content="{{ csrf_token() }}">

    {{-- Inline style to set the HTML background color based on our theme in app.css --}}
    <style>
        html {
            background-color: oklch(1 0 0);
        }

        body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif !important;
        }

        h1,
        h2,
        h3,
        h4,
        h5,
        h6 {
            font-family: 'Space Grotesk', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif !important;
        }

        .font-display {
            font-family: 'Space Grotesk', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif !important;
        }
    </style>

    <title inertia>{{ $page['props']['settings']['site_name'] ?? config('app.name', 'CekatAI') }}</title>

    {{-- SEO Meta Tags --}}
    <meta name="description"
        content="{{ $page['props']['settings']['site_description'] ?? 'Platform CRM berbasis AI untuk mengelola bisnis lebih cerdas.' }}">
    <meta name="keywords"
        content="CRM, AI CRM, Customer Relationship Management, Sales Pipeline, Lead Management, Business Automation">
    <meta name="author" content="{{ $page['props']['settings']['site_name'] ?? config('app.name', 'CekatAI') }}">
    <meta name="robots" content="index, follow">

    {{-- Canonical URL --}}
    <link rel="canonical" href="{{ url()->current() }}">

    {{-- Open Graph / Facebook --}}
    <meta property="og:type" content="website">
    <meta property="og:url" content="{{ url()->current() }}">
    <meta property="og:title"
        content="{{ $page['props']['settings']['site_name'] ?? config('app.name', 'CekatAI') }} - AI CRM Platform">
    <meta property="og:description"
        content="{{ $page['props']['settings']['site_description'] ?? 'Platform CRM berbasis AI untuk mengelola bisnis lebih cerdas' }}">
    @if (!empty($page['props']['settings']['logo']))
        <meta property="og:image" content="{{ asset('storage/' . $page['props']['settings']['logo']) }}">
    @else
        <meta property="og:image" content="{{ asset('images/og-image.png') }}">
    @endif

    {{-- Twitter --}}
    <meta property="twitter:card" content="summary_large_image">
    <meta property="twitter:url" content="{{ url()->current() }}">
    <meta property="twitter:title"
        content="{{ $page['props']['settings']['site_name'] ?? config('app.name', 'CekatAI') }} - AI CRM Platform">
    <meta property="twitter:description"
        content="{{ $page['props']['settings']['site_description'] ?? 'Platform CRM berbasis AI untuk mengelola bisnis lebih cerdas' }}">
    @if (!empty($page['props']['settings']['logo']))
        <meta property="twitter:image" content="{{ asset('storage/' . $page['props']['settings']['logo']) }}">
    @else
        <meta property="twitter:image" content="{{ asset('images/og-image.png') }}">
    @endif

    {{-- Favicons --}}
    <link rel="icon" href="/favicon.ico">
    <link rel="icon" type="image/png" href="{{ asset('favicon.png') }}">
    <link rel="shortcut icon" href="/favicon.ico">
    <link rel="apple-touch-icon" href="{{ asset('favicon.png') }}">
    <link rel="manifest" href="/site.webmanifest">

    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link rel="preload" as="style"
        href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@400;500;600;700&display=swap">
    <link
        href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@400;500;600;700&display=swap"
        rel="stylesheet" media="print" onload="this.media='all'">
    <noscript>
        <link
            href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@400;500;600;700&display=swap"
            rel="stylesheet">
    </noscript>

    {{-- Structured Data - Schema.org --}}
    @php
        $schema = [
            '@context' => 'https://schema.org',
            '@type' => 'Organization',
            'name' => $page['props']['settings']['site_name'] ?? config('app.name', 'CekatAI'),
            'url' => url('/'),
            'logo' => $page['props']['settings']['logo']
                ? asset('storage/' . $page['props']['settings']['logo'])
                : asset('images/logo.png'),
            'description' =>
                $page['props']['settings']['site_description'] ??
                'Platform CRM berbasis AI untuk mengelola bisnis lebih cerdas',
        ];

        if (!empty($page['props']['settings']['contact_email'])) {
            $schema['email'] = $page['props']['settings']['contact_email'];
        }
        if (!empty($page['props']['settings']['contact_phone'])) {
            $schema['telephone'] = $page['props']['settings']['contact_phone'];
        }
        if (!empty($page['props']['settings']['address'])) {
            $schema['address'] = [
                '@type' => 'PostalAddress',
                'streetAddress' => $page['props']['settings']['address'],
            ];
        }

        $contactPoint = [
            '@type' => 'ContactPoint',
            'contactType' => 'Customer Service',
            'url' => url('/contact'),
        ];
        if (!empty($page['props']['settings']['contact_email'])) {
            $contactPoint['email'] = $page['props']['settings']['contact_email'];
        }
        if (!empty($page['props']['settings']['contact_phone'])) {
            $contactPoint['telephone'] = $page['props']['settings']['contact_phone'];
        }
        $schema['contactPoint'] = $contactPoint;

        $sameAs = [];
        if (!empty($page['props']['settings']['facebook_url'])) {
            $sameAs[] = $page['props']['settings']['facebook_url'];
        }
        if (!empty($page['props']['settings']['twitter_url'])) {
            $sameAs[] = $page['props']['settings']['twitter_url'];
        }
        if (!empty($page['props']['settings']['instagram_url'])) {
            $sameAs[] = $page['props']['settings']['instagram_url'];
        }
        if (!empty($page['props']['settings']['linkedin_url'])) {
            $sameAs[] = $page['props']['settings']['linkedin_url'];
        }
        if (!empty($page['props']['settings']['tiktok_url'])) {
            $sameAs[] = $page['props']['settings']['tiktok_url'];
        }
        if (!empty($sameAs)) {
            $schema['sameAs'] = $sameAs;
        }
    @endphp
    <script type="application/ld+json">
        {!! json_encode($schema, JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT) !!}
        </script>

    {{-- Google Analytics --}}
    @if (config('services.google_analytics.tracking_id'))
        <script async src="https://www.googletagmanager.com/gtag/js?id={{ config('services.google_analytics.tracking_id') }}">
        </script>
        <script>
            window.dataLayer = window.dataLayer || [];

            function gtag() {
                dataLayer.push(arguments);
            }
            gtag('js', new Date());
            gtag('config', '{{ config('services.google_analytics.tracking_id') }}');
        </script>
    @endif

    {{-- Google Tag Manager --}}
    @if (config('services.google_tag_manager.container_id'))
        <script>
            (function(w, d, s, l, i) {
                w[l] = w[l] || [];
                w[l].push({
                    'gtm.start': new Date().getTime(),
                    event: 'gtm.js'
                });
                var f = d.getElementsByTagName(s)[0],
                    j = d.createElement(s),
                    dl = l != 'dataLayer' ? '&l=' + l : '';
                j.async = true;
                j.src =
                    'https://www.googletagmanager.com/gtm.js?id=' + i + dl;
                f.parentNode.insertBefore(j, f);
            })(window, document, 'script', 'dataLayer', '{{ config('services.google_tag_manager.container_id') }}');
        </script>
    @endif

    @routes
    @viteReactRefresh
    @vite(['resources/js/app.tsx', "resources/js/pages/{$page['component']}.tsx"])
    @inertiaHead
</head>

<body class="font-sans antialiased">
    {{-- Google Tag Manager (noscript) --}}
    @if (config('services.google_tag_manager.container_id'))
        <noscript><iframe
                src="https://www.googletagmanager.com/ns.html?id={{ config('services.google_tag_manager.container_id') }}"
                height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>
    @endif

    @inertia
</body>

</html>
