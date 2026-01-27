<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class UpSellingController extends Controller
{
    /**
     * Display up selling campaigns page
     */
    public function index(): Response
    {
        return Inertia::render('user/upselling/index', [
            'user' => auth()->user(),
            'campaigns' => [], // TODO: Get up selling campaigns from database
            'products' => [], // TODO: Get products for up selling
            'statistics' => [
                'total_campaigns' => 0,
                'active_campaigns' => 0,
                'total_conversions' => 0,
                'total_revenue' => 0,
            ],
        ]);
    }

    /**
     * Show create campaign form
     */
    public function create(): Response
    {
        return Inertia::render('user/upselling/create', [
            'user' => auth()->user(),
            'products' => [], // TODO: Get products
            'templates' => [], // TODO: Get message templates
        ]);
    }

    /**
     * Store new up selling campaign
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'product_id' => 'required|exists:products,id',
            'trigger_type' => 'required|in:after_purchase,cart_abandonment,browsing',
            'message' => 'required|string',
            'discount_percentage' => 'nullable|numeric|min:0|max:100',
            'valid_until' => 'nullable|date|after:now',
            'is_active' => 'boolean',
        ]);

        // TODO: Create up selling campaign
        // $campaign = auth()->user()->upSellingCampaigns()->create($validated);

        return redirect()->route('user.upselling.index')
            ->with('success', 'Campaign up selling berhasil dibuat!');
    }

    /**
     * Show edit campaign form
     */
    public function edit($id): Response
    {
        // TODO: Get campaign by ID
        // $campaign = auth()->user()->upSellingCampaigns()->findOrFail($id);

        return Inertia::render('user/upselling/edit', [
            'user' => auth()->user(),
            'campaign' => [], // $campaign
            'products' => [], // TODO: Get products
            'templates' => [], // TODO: Get message templates
        ]);
    }

    /**
     * Update up selling campaign
     */
    public function update(Request $request, $id)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'product_id' => 'required|exists:products,id',
            'trigger_type' => 'required|in:after_purchase,cart_abandonment,browsing',
            'message' => 'required|string',
            'discount_percentage' => 'nullable|numeric|min:0|max:100',
            'valid_until' => 'nullable|date|after:now',
            'is_active' => 'boolean',
        ]);

        // TODO: Update campaign
        // $campaign = auth()->user()->upSellingCampaigns()->findOrFail($id);
        // $campaign->update($validated);

        return redirect()->route('user.upselling.index')
            ->with('success', 'Campaign up selling berhasil diupdate!');
    }

    /**
     * Delete up selling campaign
     */
    public function destroy($id)
    {
        // TODO: Delete campaign
        // $campaign = auth()->user()->upSellingCampaigns()->findOrFail($id);
        // $campaign->delete();

        return redirect()->back()->with('success', 'Campaign up selling berhasil dihapus!');
    }

    /**
     * Toggle campaign active status
     */
    public function toggle($id)
    {
        // TODO: Toggle campaign status
        // $campaign = auth()->user()->upSellingCampaigns()->findOrFail($id);
        // $campaign->update(['is_active' => !$campaign->is_active]);

        return redirect()->back()->with('success', 'Status campaign berhasil diubah!');
    }
}
