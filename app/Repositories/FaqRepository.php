<?php

namespace App\Repositories;

use App\Models\Faq;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;

class FaqRepository
{
    public function __construct(
        protected Faq $model
    ) {}

    /**
     * Get all FAQs
     */
    public function getAll(): Collection
    {
        return $this->model->latest()->get();
    }

    /**
     * Get paginated FAQs
     */
    public function getPaginated(int $perPage = 15): LengthAwarePaginator
    {
        return $this->model->latest()->paginate($perPage);
    }

    /**
     * Find FAQ by ID
     */
    public function findById(int $id): ?Faq
    {
        return $this->model->find($id);
    }

    /**
     * Find FAQ by ID or fail
     */
    public function findByIdOrFail(int $id): Faq
    {
        return $this->model->findOrFail($id);
    }

    /**
     * Create new FAQ
     */
    public function create(array $data): Faq
    {
        return $this->model->create($data);
    }

    /**
     * Update FAQ
     */
    public function update(Faq $faq, array $data): bool
    {
        return $faq->update($data);
    }

    /**
     * Delete FAQ
     */
    public function delete(Faq $faq): bool
    {
        return $faq->delete();
    }

    /**
     * Search FAQs
     */
    public function search(string $query): Collection
    {
        return $this->model
            ->where('question', 'like', "%{$query}%")
            ->orWhere('answer', 'like', "%{$query}%")
            ->latest()
            ->get();
    }
}
