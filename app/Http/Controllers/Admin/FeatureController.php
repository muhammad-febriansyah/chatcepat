<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreFeatureRequest;
use App\Http\Requests\Admin\UpdateFeatureRequest;
use App\Services\FeatureService;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class FeatureController extends Controller
{
    public function __construct(
        protected FeatureService $featureService
    ) {}

    public function index(): Response
    {
        $features = $this->featureService->getAllFeatures();

        return Inertia::render('admin/features/index', [
            'features' => $features,
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('admin/features/create');
    }

    public function store(StoreFeatureRequest $request): RedirectResponse
    {
        $data = $request->validated();

        $this->featureService->createFeature($data);

        return redirect()
            ->route('admin.features.index')
            ->with('success', 'Fitur berhasil ditambahkan!');
    }

    public function edit(int $id): Response
    {
        $feature = $this->featureService->getFeatureById($id);

        return Inertia::render('admin/features/edit', [
            'feature' => $feature,
        ]);
    }

    public function update(UpdateFeatureRequest $request, int $id): RedirectResponse
    {
        $data = $request->validated();

        $this->featureService->updateFeature($id, $data);

        return redirect()
            ->route('admin.features.index')
            ->with('success', 'Fitur berhasil diperbarui!');
    }

    public function destroy(int $id): RedirectResponse
    {
        $this->featureService->deleteFeature($id);

        return redirect()
            ->route('admin.features.index')
            ->with('success', 'Fitur berhasil dihapus!');
    }
}
