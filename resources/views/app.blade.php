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
            h1, h2, h3, h4, h5, h6 {
                font-family: 'Space Grotesk', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif !important;
            }
            .font-display {
                font-family: 'Space Grotesk', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif !important;
            }
        </style>

        <title inertia>{{ $siteName ?? config('app.name', 'CekatAI') }}</title>

        {{-- SEO Meta Tags --}}
        <meta name="description" content="{{ $siteDescription ?? 'Platform CRM berbasis AI untuk mengelola bisnis lebih cerdas.' }}">
        <meta name="keywords" content="CRM, AI CRM, Customer Relationship Management, Sales Pipeline, Lead Management, Business Automation">
        <meta name="author" content="{{ $siteName ?? config('app.name', 'CekatAI') }}">
        <meta name="robots" content="index, follow">

        {{-- Canonical URL --}}
        <link rel="canonical" href="{{ url()->current() }}">

        {{-- Open Graph / Facebook --}}
        <meta property="og:type" content="website">
        <meta property="og:url" content="{{ url()->current() }}">
        <meta property="og:title" content="{{ $siteName ?? config('app.name', 'CekatAI') }} - AI CRM Platform">
        <meta property="og:description" content="{{ $siteDescription ?? 'Platform CRM berbasis AI untuk mengelola bisnis lebih cerdas' }}">
        @if($siteLogo)
            <meta property="og:image" content="{{ asset('storage/' . $siteLogo) }}">
        @else
            <meta property="og:image" content="{{ asset('images/og-image.png') }}">
        @endif

        {{-- Twitter --}}
        <meta property="twitter:card" content="summary_large_image">
        <meta property="twitter:url" content="{{ url()->current() }}">
        <meta property="twitter:title" content="{{ $siteName ?? config('app.name', 'CekatAI') }} - AI CRM Platform">
        <meta property="twitter:description" content="{{ $siteDescription ?? 'Platform CRM berbasis AI untuk mengelola bisnis lebih cerdas' }}">
        @if($siteLogo)
            <meta property="twitter:image" content="{{ asset('storage/' . $siteLogo) }}">
        @else
            <meta property="twitter:image" content="{{ asset('images/og-image.png') }}">
        @endif

        {{-- Favicons --}}
        @if($siteFavicon)
            <link rel="icon" href="{{ asset('storage/' . $siteFavicon) }}" type="image/x-icon">
            <link rel="shortcut icon" href="{{ asset('storage/' . $siteFavicon) }}" type="image/x-icon">
        @else
            <link rel="icon" href="/favicon.ico" sizes="any">
            <link rel="icon" href="/favicon.svg" type="image/svg+xml">
        @endif
        <link rel="apple-touch-icon" href="/apple-touch-icon.png">
        <link rel="manifest" href="/site.webmanifest">

        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link rel="preload" as="style" href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@400;500;600;700&display=swap">
        <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" media="print" onload="this.media='all'">
        <noscript>
            <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
        </noscript>

        {{-- Structured Data - Schema.org --}}
        <script type="application/ld+json">
        {
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": "{{ $page['props']['settings']['site_name'] ?? config('app.name', 'CekatAI') }}",
            "url": "{{ url('/') }}",
            "logo": "{{ $page['props']['settings']['logo'] ? asset('storage/' . $page['props']['settings']['logo']) : asset('images/logo.png') }}",
            "description": "{{ $page['props']['settings']['site_description'] ?? 'Platform CRM berbasis AI untuk mengelola bisnis lebih cerdas' }}",
            @if($page['props']['settings']['contact_email'] ?? null)
            "email": "{{ $page['props']['settings']['contact_email'] }}",
            @endif
            @if($page['props']['settings']['contact_phone'] ?? null)
            "telephone": "{{ $page['props']['settings']['contact_phone'] }}",
            @endif
            @if($page['props']['settings']['address'] ?? null)
            "address": {
                "@type": "PostalAddress",
                "streetAddress": "{{ $page['props']['settings']['address'] }}"
            },
            @endif
            "contactPoint": {
                "@type": "ContactPoint",
                "contactType": "Customer Service",
                "url": "{{ url('/contact') }}"
                @if($page['props']['settings']['contact_email'] ?? null)
                ,"email": "{{ $page['props']['settings']['contact_email'] }}"
                @endif
                @if($page['props']['settings']['contact_phone'] ?? null)
                ,"telephone": "{{ $page['props']['settings']['contact_phone'] }}"
                @endif
            },
            "sameAs": [
                @if($page['props']['settings']['facebook_url'] ?? null)
                "{{ $page['props']['settings']['facebook_url'] }}",
                @endif
                @if($page['props']['settings']['twitter_url'] ?? null)
                "{{ $page['props']['settings']['twitter_url'] }}",
                @endif
                @if($page['props']['settings']['instagram_url'] ?? null)
                "{{ $page['props']['settings']['instagram_url'] }}",
                @endif
                @if($page['props']['settings']['linkedin_url'] ?? null)
                "{{ $page['props']['settings']['linkedin_url'] }}",
                @endif
                @if($page['props']['settings']['tiktok_url'] ?? null)
                "{{ $page['props']['settings']['tiktok_url'] }}",
                @endif
                "{{ url('/') }}"
            ]
        }
        </script>

        @routes
        @viteReactRefresh
        @vite(['resources/js/app.tsx', "resources/js/pages/{$page['component']}.tsx"])
        @inertiaHead
    </head>
    <body class="font-sans antialiased">
        @inertia
    </body>
</html>
