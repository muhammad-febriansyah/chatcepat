<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Models\PricingPackage;
use Inertia\Inertia;

class TopUpController extends Controller
{
    /**
     * Display top up page with pricing packages
     */
    public function index()
    {
        $packages = PricingPackage::active()
            ->ordered()
            ->get();

        return Inertia::render('user/topup', [
            'packages' => $packages,
        ]);
    }
}
