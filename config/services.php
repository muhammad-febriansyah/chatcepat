<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as Mailgun, Postmark, AWS and more. This file provides the de facto
    | location for this type of information, allowing packages to have
    | a conventional file to locate the various service credentials.
    |
    */

    'postmark' => [
        'key' => env('POSTMARK_API_KEY'),
    ],

    'resend' => [
        'key' => env('RESEND_API_KEY'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    'slack' => [
        'notifications' => [
            'bot_user_oauth_token' => env('SLACK_BOT_USER_OAUTH_TOKEN'),
            'channel' => env('SLACK_BOT_USER_DEFAULT_CHANNEL'),
        ],
    ],

    'whatsapp_gateway' => [
        'url' => env('WHATSAPP_GATEWAY_URL', 'http://localhost:3000'),
    ],

    'telegram_service' => [
        'url' => env('TELEGRAM_SERVICE_URL', 'http://localhost:8001'),
        'secret_key' => env('TELEGRAM_SERVICE_SECRET_KEY', ''),
    ],

    'duitku' => [
        'merchant_code' => env('DUITKU_MERCHANT_CODE'),
        'api_key' => env('DUITKU_API_KEY'),
        'callback_url' => env('DUITKU_CALLBACK_URL'),
        'return_url' => env('DUITKU_RETURN_URL'),
        'sandbox' => env('DUITKU_SANDBOX', true),
    ],

    'openai' => [
        'api_key' => env('OPENAI_API_KEY'),
        'model' => env('OPENAI_MODEL', 'gpt-4o-mini'),
        'max_tokens' => env('OPENAI_MAX_TOKENS', 500),
        'temperature' => env('OPENAI_TEMPERATURE', 0.7),
    ],

    'rajaongkir' => [
        'key' => env('RAJAONGKIR_API_KEY_SHIPPING', ''),
    ],

    'google_analytics' => [
        'tracking_id' => env('GOOGLE_ANALYTICS_ID'),
    ],

    'google_tag_manager' => [
        'container_id' => env('GOOGLE_TAG_MANAGER_ID'),
    ],

    'meta' => [
        'app_id' => env('META_APP_ID'),
        'app_secret' => env('META_APP_SECRET'),
        'webhook_verify_token' => env('META_WEBHOOK_VERIFY_TOKEN', 'chatcepat-meta-webhook-2024'),
        'oauth_redirect_uri' => env('META_OAUTH_REDIRECT_URI'),
        'graph_api_version' => env('META_GRAPH_API_VERSION', 'v21.0'),
        'graph_api_url' => 'https://graph.facebook.com',
    ],

];
