<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Process scheduled WhatsApp broadcasts every minute
Schedule::command('broadcasts:process-scheduled')->everyMinute();

// Send trial expiry reminders daily at 9 AM
Schedule::command('reminders:trial-expiry')->dailyAt('09:00');

// Send subscription renewal reminders daily at 9 AM
Schedule::command('reminders:subscription-renewal')->dailyAt('09:00');
