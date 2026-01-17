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
        </style>

        <title inertia>{{ $siteName ?? config('app.name', 'CekatAI') }}</title>

        {{-- SEO Meta Tags --}}
        <meta name="description" content="{{ $siteDescription ?? 'Platform CRM berbasis AI untuk mengelola bisnis lebih cerdas.' }}">
        <meta name="keywords" content="CRM, AI CRM, Customer Relationship Management, Sales Pipeline, Lead Management, Business Automation">
        <meta name="author" content="{{ $siteName ?? config('app.name', 'CekatAI') }}">
        <meta name="robots" content="index, follow">

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

        <link rel="preconnect" href="https://fonts.bunny.net">
        <link href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600" rel="stylesheet" />

        @viteReactRefresh
        @vite(['resources/js/app.tsx', "resources/js/pages/{$page['component']}.tsx"])
        @inertiaHead
    </head>
    <body class="font-sans antialiased">
        @inertia
    </body>
</html>
