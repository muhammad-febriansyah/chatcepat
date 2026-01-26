<?php

namespace App\Http\Controllers;

use App\Models\Post;
use App\Models\GuideArticle;
use Illuminate\Http\Response;

class SitemapController extends Controller
{
    public function index()
    {
        $sitemap = '<?xml version="1.0" encoding="UTF-8"?>';
        $sitemap .= '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">';

        // Main sitemap
        $sitemap .= '<sitemap>';
        $sitemap .= '<loc>' . url('/sitemap-main.xml') . '</loc>';
        $sitemap .= '<lastmod>' . now()->toW3cString() . '</lastmod>';
        $sitemap .= '</sitemap>';

        // Blog sitemap
        $sitemap .= '<sitemap>';
        $sitemap .= '<loc>' . url('/sitemap-blog.xml') . '</loc>';
        $sitemap .= '<lastmod>' . now()->toW3cString() . '</lastmod>';
        $sitemap .= '</sitemap>';

        // Docs sitemap
        $sitemap .= '<sitemap>';
        $sitemap .= '<loc>' . url('/sitemap-docs.xml') . '</loc>';
        $sitemap .= '<lastmod>' . now()->toW3cString() . '</lastmod>';
        $sitemap .= '</sitemap>';

        $sitemap .= '</sitemapindex>';

        return response($sitemap, 200)
            ->header('Content-Type', 'text/xml');
    }

    public function main()
    {
        $sitemap = '<?xml version="1.0" encoding="UTF-8"?>';
        $sitemap .= '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">';

        // Static pages with priority and change frequency
        $pages = [
            ['url' => '/', 'priority' => '1.0', 'changefreq' => 'daily'],
            ['url' => '/about', 'priority' => '0.8', 'changefreq' => 'monthly'],
            ['url' => '/pricing', 'priority' => '0.9', 'changefreq' => 'weekly'],
            ['url' => '/blog', 'priority' => '0.8', 'changefreq' => 'daily'],
            ['url' => '/docs', 'priority' => '0.8', 'changefreq' => 'weekly'],
            ['url' => '/faq', 'priority' => '0.7', 'changefreq' => 'monthly'],
            ['url' => '/contact', 'priority' => '0.7', 'changefreq' => 'monthly'],
            ['url' => '/login', 'priority' => '0.6', 'changefreq' => 'monthly'],
            ['url' => '/register', 'priority' => '0.6', 'changefreq' => 'monthly'],
            ['url' => '/terms', 'priority' => '0.5', 'changefreq' => 'yearly'],
            ['url' => '/privacy', 'priority' => '0.5', 'changefreq' => 'yearly'],
        ];

        foreach ($pages as $page) {
            $sitemap .= '<url>';
            $sitemap .= '<loc>' . url($page['url']) . '</loc>';
            $sitemap .= '<lastmod>' . now()->toW3cString() . '</lastmod>';
            $sitemap .= '<changefreq>' . $page['changefreq'] . '</changefreq>';
            $sitemap .= '<priority>' . $page['priority'] . '</priority>';
            $sitemap .= '</url>';
        }

        $sitemap .= '</urlset>';

        return response($sitemap, 200)
            ->header('Content-Type', 'text/xml');
    }

    public function blog()
    {
        $sitemap = '<?xml version="1.0" encoding="UTF-8"?>';
        $sitemap .= '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"';
        $sitemap .= ' xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">';

        // Get all published blog posts
        $posts = Post::published()
            ->orderBy('published_at', 'desc')
            ->get();

        foreach ($posts as $post) {
            $sitemap .= '<url>';
            $sitemap .= '<loc>' . url('/blog/' . $post->slug) . '</loc>';
            $sitemap .= '<lastmod>' . $post->updated_at->toW3cString() . '</lastmod>';
            $sitemap .= '<changefreq>weekly</changefreq>';
            $sitemap .= '<priority>0.8</priority>';

            // Add image if exists
            if ($post->featured_image) {
                $sitemap .= '<image:image>';
                $sitemap .= '<image:loc>' . asset('storage/' . $post->featured_image) . '</image:loc>';
                $sitemap .= '<image:title>' . htmlspecialchars($post->title) . '</image:title>';
                $sitemap .= '</image:image>';
            }

            $sitemap .= '</url>';
        }

        $sitemap .= '</urlset>';

        return response($sitemap, 200)
            ->header('Content-Type', 'text/xml');
    }

    public function docs()
    {
        $sitemap = '<?xml version="1.0" encoding="UTF-8"?>';
        $sitemap .= '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"';
        $sitemap .= ' xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">';

        // Add docs home page
        $sitemap .= '<url>';
        $sitemap .= '<loc>' . url('/docs') . '</loc>';
        $sitemap .= '<lastmod>' . now()->toW3cString() . '</lastmod>';
        $sitemap .= '<changefreq>weekly</changefreq>';
        $sitemap .= '<priority>0.9</priority>';
        $sitemap .= '</url>';

        // Get all published guide articles
        $articles = GuideArticle::where('is_published', true)
            ->orderBy('updated_at', 'desc')
            ->get();

        foreach ($articles as $article) {
            $sitemap .= '<url>';
            $sitemap .= '<loc>' . url('/docs/' . $article->slug) . '</loc>';
            $sitemap .= '<lastmod>' . $article->updated_at->toW3cString() . '</lastmod>';
            $sitemap .= '<changefreq>monthly</changefreq>';
            $sitemap .= '<priority>0.8</priority>';

            // Add image if exists
            if ($article->featured_image) {
                $sitemap .= '<image:image>';
                $sitemap .= '<image:loc>' . asset('storage/' . $article->featured_image) . '</image:loc>';
                $sitemap .= '<image:title>' . htmlspecialchars($article->title) . '</image:title>';
                $sitemap .= '</image:image>';
            }

            $sitemap .= '</url>';
        }

        $sitemap .= '</urlset>';

        return response($sitemap, 200)
            ->header('Content-Type', 'text/xml');
    }
}
