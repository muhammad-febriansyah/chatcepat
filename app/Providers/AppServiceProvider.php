<?php

namespace App\Providers;

use App\Models\Setting;
use App\Listeners\LogAuthenticationActivity;
use Illuminate\Auth\Events\Login;
use Illuminate\Auth\Events\Logout;
use Illuminate\Auth\Events\Failed;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\View;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        if (str_starts_with(config('app.url'), 'https://')) {
            URL::forceScheme('https');
        }

        // Share settings to all views
        View::composer('*', function ($view) {
            $view->with([
                'siteName' => Setting::get('site_name', config('app.name')),
                'siteDescription' => Setting::get('site_description'),
                'siteFavicon' => Setting::get('favicon'),
                'siteLogo' => Setting::get('logo'),
            ]);
        });

        // Register authentication event listeners
        Event::listen(Login::class, [LogAuthenticationActivity::class, 'handleLogin']);
        Event::listen(Logout::class, [LogAuthenticationActivity::class, 'handleLogout']);
        Event::listen(Failed::class, [LogAuthenticationActivity::class, 'handleFailed']);
    }
}
