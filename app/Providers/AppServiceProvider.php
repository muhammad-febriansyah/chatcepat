<?php

namespace App\Providers;

use App\Models\Setting;
use Illuminate\Support\Facades\View;
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
        // Share settings to all views
        View::composer('*', function ($view) {
            $view->with([
                'siteName' => Setting::get('site_name', config('app.name')),
                'siteDescription' => Setting::get('site_description'),
                'siteFavicon' => Setting::get('favicon'),
                'siteLogo' => Setting::get('logo'),
            ]);
        });
    }
}
