<?php

namespace App\Services;

use Illuminate\Support\Facades\View;

class SeoService
{
    protected array $meta = [];
    protected array $schema = [];

    /**
     * Set page title
     */
    public function setTitle(string $title, bool $appendSiteName = true): self
    {
        $siteName = config('app.name', 'Chatcepat');
        $this->meta['title'] = $appendSiteName ? "{$title} - {$siteName}" : $title;
        return $this;
    }

    /**
     * Set page description
     */
    public function setDescription(string $description): self
    {
        $this->meta['description'] = $description;
        return $this;
    }

    /**
     * Set keywords
     */
    public function setKeywords(string|array $keywords): self
    {
        $this->meta['keywords'] = is_array($keywords) ? implode(', ', $keywords) : $keywords;
        return $this;
    }

    /**
     * Set Open Graph image
     */
    public function setImage(string $image): self
    {
        $this->meta['image'] = $image;
        return $this;
    }

    /**
     * Set canonical URL
     */
    public function setCanonical(string $url): self
    {
        $this->meta['canonical'] = $url;
        return $this;
    }

    /**
     * Set robots meta
     */
    public function setRobots(string $robots): self
    {
        $this->meta['robots'] = $robots;
        return $this;
    }

    /**
     * Add Article schema for blog posts
     */
    public function addArticleSchema(array $data): self
    {
        $this->schema[] = [
            '@context' => 'https://schema.org',
            '@type' => 'Article',
            'headline' => $data['title'] ?? '',
            'description' => $data['description'] ?? '',
            'image' => $data['image'] ?? '',
            'datePublished' => $data['published_at'] ?? now()->toIso8601String(),
            'dateModified' => $data['updated_at'] ?? now()->toIso8601String(),
            'author' => [
                '@type' => 'Person',
                'name' => $data['author'] ?? config('app.name'),
            ],
            'publisher' => [
                '@type' => 'Organization',
                'name' => config('app.name', 'Chatcepat'),
                'logo' => [
                    '@type' => 'ImageObject',
                    'url' => asset('images/logo.png'),
                ],
            ],
        ];
        return $this;
    }

    /**
     * Add Product schema
     */
    public function addProductSchema(array $data): self
    {
        $this->schema[] = [
            '@context' => 'https://schema.org',
            '@type' => 'Product',
            'name' => $data['name'] ?? '',
            'description' => $data['description'] ?? '',
            'image' => $data['image'] ?? '',
            'offers' => [
                '@type' => 'Offer',
                'price' => $data['price'] ?? 0,
                'priceCurrency' => $data['currency'] ?? 'IDR',
                'availability' => 'https://schema.org/InStock',
            ],
        ];
        return $this;
    }

    /**
     * Add FAQ schema
     */
    public function addFaqSchema(array $faqs): self
    {
        $questions = [];
        foreach ($faqs as $faq) {
            $questions[] = [
                '@type' => 'Question',
                'name' => $faq['question'] ?? '',
                'acceptedAnswer' => [
                    '@type' => 'Answer',
                    'text' => $faq['answer'] ?? '',
                ],
            ];
        }

        $this->schema[] = [
            '@context' => 'https://schema.org',
            '@type' => 'FAQPage',
            'mainEntity' => $questions,
        ];
        return $this;
    }

    /**
     * Add Breadcrumb schema
     */
    public function addBreadcrumbSchema(array $items): self
    {
        $breadcrumbs = [];
        foreach ($items as $index => $item) {
            $breadcrumbs[] = [
                '@type' => 'ListItem',
                'position' => $index + 1,
                'name' => $item['name'] ?? '',
                'item' => $item['url'] ?? '',
            ];
        }

        $this->schema[] = [
            '@context' => 'https://schema.org',
            '@type' => 'BreadcrumbList',
            'itemListElement' => $breadcrumbs,
        ];
        return $this;
    }

    /**
     * Get all meta data
     */
    public function getMeta(): array
    {
        return $this->meta;
    }

    /**
     * Get all schema data
     */
    public function getSchema(): array
    {
        return $this->schema;
    }

    /**
     * Share meta data to views
     */
    public function share(): void
    {
        View::share([
            'seoMeta' => $this->meta,
            'seoSchema' => $this->schema,
        ]);
    }
}
