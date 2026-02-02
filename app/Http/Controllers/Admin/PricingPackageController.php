<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StorePricingPackageRequest;
use App\Http\Requests\Admin\UpdatePricingPackageRequest;
use App\Services\PricingPackageService;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class PricingPackageController extends Controller
{
    public function __construct(
        protected PricingPackageService $pricingPackageService
    ) {
    }

    public function index(): Response
    {
        $packages = $this->pricingPackageService->getAllPackages();

        return Inertia::render('admin/pricing-packages/index', [
            'packages' => $packages,
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('admin/pricing-packages/create');
    }

    public function store(StorePricingPackageRequest $request): RedirectResponse
    {
        $data = $request->validated();

        $this->pricingPackageService->createPackage($data);

        return redirect()
            ->route('admin.pricing-packages.index')
            ->with('success', 'Paket harga berhasil ditambahkan!');
    }

    public function edit(int $id): Response
    {
        $package = $this->pricingPackageService->getPackageById($id);

        \Illuminate\Support\Facades\Log::info('Edit Pricing Package', [
            'id' => $id,
            'raw_price' => $package->getRawOriginal('price'),
            'cast_price' => $package->price,
        ]);

        return Inertia::render('admin/pricing-packages/edit', [
            'package' => $package,
        ]);
    }

    public function update(UpdatePricingPackageRequest $request, int $id): RedirectResponse
    {
        $data = $request->validated();

        $this->pricingPackageService->updatePackage($id, $data);

        return redirect()
            ->route('admin.pricing-packages.index')
            ->with('success', 'Paket harga berhasil diperbarui!');
    }

    public function destroy(int $id): RedirectResponse
    {
        $this->pricingPackageService->deletePackage($id);

        return redirect()
            ->route('admin.pricing-packages.index')
            ->with('success', 'Paket harga berhasil dihapus!');
    }
}
