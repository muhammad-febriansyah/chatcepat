<?php

namespace App\Services;

use App\Models\Faq;
use App\Repositories\FaqRepository;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;

class FaqService
{
    public function __construct(
        protected FaqRepository $faqRepository
    ) {}

    /**
     * Get all FAQs
     */
    public function getAllFaqs(): Collection
    {
        return $this->faqRepository->getAll();
    }

    /**
     * Get paginated FAQs
     */
    public function getPaginatedFaqs(int $perPage = 15): LengthAwarePaginator
    {
        return $this->faqRepository->getPaginated($perPage);
    }

    /**
     * Get FAQ by ID
     */
    public function getFaqById(int $id): ?Faq
    {
        return $this->faqRepository->findByIdOrFail($id);
    }

    /**
     * Create new FAQ
     */
    public function createFaq(array $data): Faq
    {
        return $this->faqRepository->create([
            'question' => $data['question'],
            'answer' => $data['answer'],
        ]);
    }

    /**
     * Update FAQ
     */
    public function updateFaq(int $id, array $data): Faq
    {
        $faq = $this->faqRepository->findByIdOrFail($id);

        $this->faqRepository->update($faq, [
            'question' => $data['question'],
            'answer' => $data['answer'],
        ]);

        return $faq->fresh();
    }

    /**
     * Delete FAQ
     */
    public function deleteFaq(int $id): bool
    {
        $faq = $this->faqRepository->findByIdOrFail($id);
        return $this->faqRepository->delete($faq);
    }

    /**
     * Search FAQs
     */
    public function searchFaqs(string $query): Collection
    {
        return $this->faqRepository->search($query);
    }
}
