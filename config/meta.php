<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Meta App Configuration
    |--------------------------------------------------------------------------
    |
    | Configuration for Meta Business API integration (WhatsApp, Instagram, Facebook)
    |
    */

    'app_id' => env('META_APP_ID'),
    'app_secret' => env('META_APP_SECRET'),
    'access_token' => env('META_ACCESS_TOKEN'),
    'webhook_verify_token' => env('META_WEBHOOK_VERIFY_TOKEN'),

    /*
    |--------------------------------------------------------------------------
    | WhatsApp Business API
    |--------------------------------------------------------------------------
    */

    'whatsapp' => [
        'phone_number_id' => env('META_WHATSAPP_PHONE_NUMBER_ID'),
        'business_account_id' => env('META_WHATSAPP_BUSINESS_ACCOUNT_ID'),
        'api_version' => 'v21.0',
        'base_url' => 'https://graph.facebook.com',
    ],

    /*
    |--------------------------------------------------------------------------
    | Instagram Business API
    |--------------------------------------------------------------------------
    */

    'instagram' => [
        'account_id' => env('META_INSTAGRAM_ACCOUNT_ID'),
        'api_version' => 'v21.0',
        'base_url' => 'https://graph.facebook.com',
    ],

    /*
    |--------------------------------------------------------------------------
    | Facebook Page API
    |--------------------------------------------------------------------------
    */

    'facebook' => [
        'page_id' => env('META_FACEBOOK_PAGE_ID'),
        'page_access_token' => env('META_FACEBOOK_PAGE_ACCESS_TOKEN'),
        'api_version' => 'v21.0',
        'base_url' => 'https://graph.facebook.com',
    ],

];
