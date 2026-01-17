<?php

namespace App\Repositories;

use App\Models\Post;
use Illuminate\Database\Eloquent\Collection;

class PostRepository
{
    public function __construct(
        protected Post $model
    ) {}

    public function getAll(): Collection
    {
        return $this->model->with(['category', 'author'])->latest()->get();
    }

    public function findById(int $id): ?Post
    {
        return $this->model->with(['category', 'author'])->find($id);
    }

    public function findByIdOrFail(int $id): Post
    {
        return $this->model->with(['category', 'author'])->findOrFail($id);
    }

    public function create(array $data): Post
    {
        return $this->model->create($data);
    }

    public function update(Post $post, array $data): bool
    {
        return $post->update($data);
    }

    public function delete(Post $post): bool
    {
        return $post->delete();
    }
}
