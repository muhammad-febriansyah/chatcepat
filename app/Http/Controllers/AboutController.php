<?php

namespace App\Http\Controllers;

use App\Models\AboutPage;
use App\Models\Feature;
use Inertia\Inertia;
use Inertia\Response;
use Laravel\Fortify\Features;

class AboutController extends Controller
{
    /**
     * Display the about page.
     */
    public function index(): Response
    {
        $aboutPage = AboutPage::where('is_active', true)->first();
        $features = Feature::active()->ordered()->get()->toArray();

        return Inertia::render('about', [
            'aboutPage' => $aboutPage,
            'features' => array_values($features),
            'canRegister' => Features::enabled(Features::registration()),
        ]);
    }
}
