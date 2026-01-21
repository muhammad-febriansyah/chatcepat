<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\JsonResponse;

class ProductController extends Controller
{
    /**
     * Display products list
     */
    public function index(Request $request): Response
    {
        $user = auth()->user();

        $query = Product::where('user_id', $user->id)
            ->latest();

        // Filter by category
        if ($request->filled('category')) {
            $query->where('category', $request->category);
        }

        // Filter by status
        if ($request->filled('status')) {
            $query->where('is_active', $request->status === 'active');
        }

        // Search
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('code', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%");
            });
        }

        $products = $query->get();

        // Get unique categories for filter
        $categories = Product::where('user_id', $user->id)
            ->whereNotNull('category')
            ->distinct()
            ->pluck('category');

        return Inertia::render('user/products/index', [
            'products' => $products,
            'categories' => $categories,
            'filters' => $request->only(['category', 'status', 'search']),
        ]);
    }

    /**
     * Show create form
     */
    public function create(): Response
    {
        $categories = Product::where('user_id', auth()->id())
            ->whereNotNull('category')
            ->distinct()
            ->pluck('category');

        return Inertia::render('user/products/create', [
            'categories' => $categories,
        ]);
    }

    /**
     * Store new product
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:200',
            'code' => 'nullable|string|max:50',
            'price' => 'required|numeric|min:0',
            'sale_price' => 'nullable|numeric|min:0',
            'description' => 'nullable|string|max:5000',
            'short_description' => 'nullable|string|max:500',
            'image_url' => 'nullable|url|max:500',
            'category' => 'nullable|string|max:100',
            'message_template' => 'nullable|string|max:2000',
            'stock' => 'nullable|integer|min:0',
            'is_active' => 'boolean',
        ]);

        $validated['user_id'] = auth()->id();
        $validated['is_active'] = $validated['is_active'] ?? true;

        Product::create($validated);

        return redirect()->route('user.products.index')
            ->with('success', 'Produk berhasil ditambahkan.');
    }

    /**
     * Show edit form
     */
    public function edit(Product $product): Response
    {
        if ($product->user_id !== auth()->id()) {
            abort(403, 'Unauthorized');
        }

        $categories = Product::where('user_id', auth()->id())
            ->whereNotNull('category')
            ->distinct()
            ->pluck('category');

        return Inertia::render('user/products/edit', [
            'product' => $product,
            'categories' => $categories,
        ]);
    }

    /**
     * Update product
     */
    public function update(Request $request, Product $product): RedirectResponse
    {
        if ($product->user_id !== auth()->id()) {
            abort(403, 'Unauthorized');
        }

        $validated = $request->validate([
            'name' => 'required|string|max:200',
            'code' => 'nullable|string|max:50',
            'price' => 'required|numeric|min:0',
            'sale_price' => 'nullable|numeric|min:0',
            'description' => 'nullable|string|max:5000',
            'short_description' => 'nullable|string|max:500',
            'image_url' => 'nullable|url|max:500',
            'category' => 'nullable|string|max:100',
            'message_template' => 'nullable|string|max:2000',
            'stock' => 'nullable|integer|min:0',
            'is_active' => 'boolean',
        ]);

        $product->update($validated);

        return redirect()->route('user.products.index')
            ->with('success', 'Produk berhasil diperbarui.');
    }

    /**
     * Delete product
     */
    public function destroy(Product $product): RedirectResponse
    {
        if ($product->user_id !== auth()->id()) {
            abort(403, 'Unauthorized');
        }

        $product->delete();

        return redirect()->route('user.products.index')
            ->with('success', 'Produk berhasil dihapus.');
    }

    /**
     * Get product message (for auto-reply)
     */
    public function getMessage(Product $product): JsonResponse
    {
        if ($product->user_id !== auth()->id()) {
            abort(403, 'Unauthorized');
        }

        return response()->json([
            'success' => true,
            'data' => [
                'product' => $product,
                'message' => $product->generateWhatsAppMessage(),
                'image_url' => $product->image_url,
            ],
        ]);
    }

    /**
     * API: Get products for selection (used in auto-reply form)
     */
    public function getProducts(Request $request): JsonResponse
    {
        $products = Product::where('user_id', auth()->id())
            ->active()
            ->select('id', 'name', 'code', 'price', 'sale_price', 'image_url', 'category')
            ->orderBy('name')
            ->get()
            ->map(function ($product) {
                return [
                    'id' => $product->id,
                    'name' => $product->name,
                    'code' => $product->code,
                    'price' => $product->price,
                    'display_price' => $product->display_price,
                    'image_url' => $product->image_url,
                    'category' => $product->category,
                ];
            });

        return response()->json([
            'success' => true,
            'data' => $products,
        ]);
    }

    /**
     * Toggle product status
     */
    public function toggleStatus(Product $product): RedirectResponse
    {
        if ($product->user_id !== auth()->id()) {
            abort(403, 'Unauthorized');
        }

        $product->update(['is_active' => !$product->is_active]);

        $status = $product->is_active ? 'diaktifkan' : 'dinonaktifkan';

        return redirect()->back()
            ->with('success', "Produk berhasil {$status}.");
    }

    /**
     * Duplicate product
     */
    public function duplicate(Product $product): RedirectResponse
    {
        if ($product->user_id !== auth()->id()) {
            abort(403, 'Unauthorized');
        }

        $newProduct = $product->replicate();
        $newProduct->name = $product->name . ' (Copy)';
        $newProduct->code = $product->code ? $product->code . '-COPY' : null;
        $newProduct->save();

        return redirect()->route('user.products.index')
            ->with('success', 'Produk berhasil diduplikasi.');
    }
}
