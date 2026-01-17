<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StorePostRequest;
use App\Http\Requests\Admin\UpdatePostRequest;
use App\Services\BlogCategoryService;
use App\Services\PostService;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class PostController extends Controller
{
    public function __construct(
        protected PostService $postService,
        protected BlogCategoryService $categoryService
    ) {}

    public function index(): Response
    {
        $posts = $this->postService->getAllPosts();

        return Inertia::render('admin/blog/posts/index', [
            'posts' => $posts,
        ]);
    }

    public function create(): Response
    {
        $categories = $this->categoryService->getAllCategories();

        return Inertia::render('admin/blog/posts/create', [
            'categories' => $categories,
        ]);
    }

    public function store(StorePostRequest $request): RedirectResponse
    {
        $data = $request->validated();

        // Add the uploaded file to data if exists
        if ($request->hasFile('featured_image')) {
            $data['featured_image'] = $request->file('featured_image');
        }

        $this->postService->createPost($data, auth()->id());

        return redirect()
            ->route('admin.blog.posts.index')
            ->with('success', 'Artikel berhasil ditambahkan!');
    }

    public function edit(int $id): Response
    {
        $post = $this->postService->getPostById($id);
        $categories = $this->categoryService->getAllCategories();

        return Inertia::render('admin/blog/posts/edit', [
            'post' => $post,
            'categories' => $categories,
        ]);
    }

    public function update(UpdatePostRequest $request, int $id): RedirectResponse
    {
        $data = $request->validated();

        // Add the uploaded file to data if exists
        if ($request->hasFile('featured_image')) {
            $data['featured_image'] = $request->file('featured_image');
        }

        $this->postService->updatePost($id, $data);

        return redirect()
            ->route('admin.blog.posts.index')
            ->with('success', 'Artikel berhasil diperbarui!');
    }

    public function destroy(int $id): RedirectResponse
    {
        $this->postService->deletePost($id);

        return redirect()
            ->route('admin.blog.posts.index')
            ->with('success', 'Artikel berhasil dihapus!');
    }
}
