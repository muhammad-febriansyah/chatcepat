<?php

namespace App\Http\Middleware;

use Illuminate\Foundation\Http\Middleware\VerifyCsrfToken as Middleware;

class VerifyCsrfToken extends Middleware
{
    /**
     * The URIs that should be excluded from CSRF verification.
     *
     * @var array<int, string>
     */
    protected $except = [
        '/logout', // User logout is safe to exclude - it only destroys session, no data modification
        '/agent/logout', // Agent logout is also safe to exclude
        '/login', // Login excluded to prevent 419 errors when session expires on login page
    ];
}
