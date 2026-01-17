<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreFaqRequest;
use App\Http\Requests\Admin\UpdateFaqRequest;
use App\Services\FaqService;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class FaqController extends Controller
{
    public function __construct(
        protected FaqService $faqService
    ) {}

    /**
     * Display a listing of FAQs
     */
    public function index(): Response
    {
        $faqs = $this->faqService->getAllFaqs();

        return Inertia::render('admin/faqs/index', [
            'faqs' => $faqs,
        ]);
    }

    /**
     * Show the form for creating a new FAQ
     */
    public function create(): Response
    {
        return Inertia::render('admin/faqs/create');
    }

    /**
     * Store a newly created FAQ
     */
    public function store(StoreFaqRequest $request): RedirectResponse
    {
        $this->faqService->createFaq($request->validated());

        return redirect()
            ->route('admin.faqs.index')
            ->with('success', 'FAQ berhasil ditambahkan!');
    }

    /**
     * Show the form for editing the specified FAQ
     */
    public function edit(int $id): Response
    {
        $faq = $this->faqService->getFaqById($id);

        return Inertia::render('admin/faqs/edit', [
            'faq' => $faq,
        ]);
    }

    /**
     * Update the specified FAQ
     */
    public function update(UpdateFaqRequest $request, int $id): RedirectResponse
    {
        $this->faqService->updateFaq($id, $request->validated());

        return redirect()
            ->route('admin.faqs.index')
            ->with('success', 'FAQ berhasil diperbarui!');
    }

    /**
     * Remove the specified FAQ
     */
    public function destroy(int $id): RedirectResponse
    {
        $this->faqService->deleteFaq($id);

        return redirect()
            ->route('admin.faqs.index')
            ->with('success', 'FAQ berhasil dihapus!');
    }
}
