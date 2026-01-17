<?php

namespace App\Services;

use App\Models\Post;
use App\Repositories\PostRepository;
use Illuminate\Database\Eloquent\Collection;

class PostService
{
    public function __construct(
        protected PostRepository $postRepository
    ) {}

    public function getAllPosts(): Collection
    {
        return $this->postRepository->getAll();
    }

    public function getPostById(int $id): ?Post
    {
        return $this->postRepository->findByIdOrFail($id);
    }

    public function createPost(array $data, int $userId): Post
    {
        $postData = [
            'blog_category_id' => $data['blog_category_id'],
            'user_id' => $userId,
            'title' => $data['title'],
            'excerpt' => $data['excerpt'] ?? null,
            'content' => $data['content'],
            'status' => $data['status'] ?? 'draft',
            'published_at' => $data['status'] === 'published' ? now() : null,
        ];

        // Handle image upload
        if (isset($data['featured_image'])) {
            $path = $data['featured_image']->store('blog', 'public');
            $postData['featured_image'] = $path;
        }

        return $this->postRepository->create($postData);
    }

    public function updatePost(int $id, array $data): Post
    {
        $post = $this->postRepository->findByIdOrFail($id);

        $updateData = [
            'blog_category_id' => $data['blog_category_id'],
            'title' => $data['title'],
            'excerpt' => $data['excerpt'] ?? null,
            'content' => $data['content'],
            'status' => $data['status'] ?? $post->status,
        ];

        // Handle image upload
        if (isset($data['featured_image'])) {
            // Delete old image if exists
            if ($post->featured_image && \Storage::disk('public')->exists($post->featured_image)) {
                \Storage::disk('public')->delete($post->featured_image);
            }

            $path = $data['featured_image']->store('blog', 'public');
            $updateData['featured_image'] = $path;
        }

        // Set published_at jika status berubah menjadi published
        if ($data['status'] === 'published' && $post->status !== 'published') {
            $updateData['published_at'] = now();
        }

        $this->postRepository->update($post, $updateData);

        return $post->fresh(['category', 'author']);
    }

    public function deletePost(int $id): bool
    {
        $post = $this->postRepository->findByIdOrFail($id);
        return $this->postRepository->delete($post);
    }
}
