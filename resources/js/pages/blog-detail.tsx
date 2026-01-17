import PageHeader from '@/components/page-header';
import HomeLayout from '@/layouts/home-layout';
import { Calendar, Tag, User, Clock, Eye, ArrowLeft, ArrowRight } from 'lucide-react';
import { Link } from '@inertiajs/react';

interface BlogCategory {
    id: number;
    name: string;
    slug: string;
}

interface Author {
    id: number;
    name: string;
}

interface Post {
    id: number;
    title: string;
    slug: string;
    excerpt: string;
    content: string;
    featured_image: string | null;
    views: number;
    status: string;
    published_at: string;
    category: BlogCategory;
    author: Author;
}

interface BlogDetailProps {
    canRegister?: boolean;
    post: Post;
    relatedPosts: Post[];
}

export default function BlogDetail({ canRegister = true, post, relatedPosts }: BlogDetailProps) {
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('id-ID', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    // Calculate reading time (assuming 200 words per minute)
    const calculateReadingTime = (content: string) => {
        const words = content.split(/\s+/).length;
        const minutes = Math.ceil(words / 200);
        return minutes;
    };

    const readingTime = calculateReadingTime(post.content);

    return (
        <HomeLayout title={post.title} canRegister={canRegister}>
            <PageHeader
                title={post.title}
                description={post.excerpt}
                breadcrumbs={[
                    { name: 'Home', href: '/' },
                    { name: 'Blog', href: '/blog' },
                    { name: post.title },
                ]}
            />

            {/* Article Content */}
            <div className="bg-gradient-to-b from-white to-slate-50 px-4 py-12 sm:px-6 sm:py-16 lg:py-20">
                <div className="container mx-auto max-w-4xl">
                    {/* Back to Blog */}
                    <Link
                        href="/blog"
                        className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-blue-600 transition-all hover:gap-3 hover:text-blue-700"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Kembali ke Blog
                    </Link>

                    {/* Article Card */}
                    <article className="relative overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-xl">
                        {/* Decorative blur */}
                        <div className="pointer-events-none absolute -right-20 -top-20 h-40 w-40 rounded-full bg-blue-500/10 blur-3xl"></div>
                        <div className="pointer-events-none absolute -bottom-20 -left-20 h-40 w-40 rounded-full bg-indigo-500/10 blur-3xl"></div>

                        {/* Top accent bar */}
                        <div className="absolute left-0 right-0 top-0 h-1 bg-gradient-to-r from-blue-600 to-indigo-600"></div>

                        {/* Featured Image */}
                        {post.featured_image && (
                            <div className="aspect-video overflow-hidden bg-slate-100">
                                <img
                                    src={`/storage/${post.featured_image}`}
                                    alt={post.title}
                                    className="h-full w-full object-cover"
                                />
                            </div>
                        )}

                        {/* Article Header */}
                        <div className="relative p-8 sm:p-10 lg:p-12">
                            {/* Category Badge */}
                            {post.category && (
                                <div className="mb-6">
                                    <span className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-blue-50 to-indigo-50 px-4 py-2 text-sm font-semibold text-blue-700">
                                        <Tag className="h-4 w-4" />
                                        {post.category.name}
                                    </span>
                                </div>
                            )}

                            {/* Title */}
                            <h1 className="mb-6 text-3xl font-bold text-slate-900 sm:text-4xl lg:text-5xl">
                                {post.title}
                            </h1>

                            {/* Meta Info */}
                            <div className="mb-8 flex flex-wrap items-center gap-4 border-b border-slate-100 pb-8 text-sm text-slate-600">
                                {/* Author */}
                                <div className="flex items-center gap-2.5">
                                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 text-sm font-bold text-white shadow-md">
                                        {(post.author?.name || 'A').charAt(0).toUpperCase()}
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-xs text-slate-500">Ditulis oleh</span>
                                        <span className="font-semibold text-slate-700">{post.author?.name || 'Anonymous'}</span>
                                    </div>
                                </div>

                                <span className="text-slate-300">•</span>

                                {/* Date */}
                                <div className="flex items-center gap-2">
                                    <Calendar className="h-4 w-4 text-blue-600" />
                                    {formatDate(post.published_at)}
                                </div>

                                <span className="text-slate-300">•</span>

                                {/* Reading Time */}
                                <div className="flex items-center gap-2">
                                    <Clock className="h-4 w-4 text-indigo-600" />
                                    {readingTime} menit baca
                                </div>

                                <span className="text-slate-300">•</span>

                                {/* Views */}
                                <div className="flex items-center gap-2">
                                    <Eye className="h-4 w-4 text-purple-600" />
                                    {post.views.toLocaleString()} views
                                </div>
                            </div>

                            {/* Excerpt */}
                            {post.excerpt && (
                                <div className="mb-8 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 p-6">
                                    <p className="text-lg italic leading-relaxed text-slate-700">
                                        {post.excerpt}
                                    </p>
                                </div>
                            )}

                            {/* Content */}
                            <div
                                className="prose prose-lg prose-slate max-w-none prose-headings:font-bold prose-headings:text-slate-900 prose-p:leading-relaxed prose-p:text-slate-700 prose-a:text-blue-600 prose-a:no-underline hover:prose-a:text-blue-700 hover:prose-a:underline prose-strong:text-slate-900 prose-code:rounded prose-code:bg-slate-100 prose-code:px-1.5 prose-code:py-0.5 prose-code:text-sm prose-code:text-slate-800 prose-pre:bg-slate-900 prose-img:rounded-xl prose-img:shadow-lg"
                                dangerouslySetInnerHTML={{ __html: post.content }}
                            />
                        </div>
                    </article>

                    {/* Related Posts */}
                    {relatedPosts.length > 0 && (
                        <div className="mt-16">
                            <h2 className="mb-8 text-2xl font-bold text-slate-900 sm:text-3xl">
                                Artikel Terkait
                            </h2>

                            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                                {relatedPosts.map((relatedPost) => (
                                    <Link
                                        key={relatedPost.id}
                                        href={`/blog/${relatedPost.slug}`}
                                        className="group relative overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-lg transition-all duration-300 hover:-translate-y-2 hover:border-blue-200 hover:shadow-2xl"
                                    >
                                        {/* Decorative blur effects */}
                                        <div className="pointer-events-none absolute -right-20 -top-20 h-40 w-40 rounded-full bg-blue-500/5 blur-3xl opacity-60 transition-opacity duration-500 group-hover:opacity-100"></div>
                                        <div className="pointer-events-none absolute -bottom-20 -left-20 h-40 w-40 rounded-full bg-indigo-500/5 blur-3xl opacity-60 transition-opacity duration-500 group-hover:opacity-100"></div>

                                        {/* Top accent bar */}
                                        <div className="absolute left-0 right-0 top-0 h-1 bg-gradient-to-r from-blue-600 to-indigo-600 opacity-0 transition-opacity group-hover:opacity-100"></div>

                                        {/* Featured Image */}
                                        {relatedPost.featured_image ? (
                                            <div className="aspect-video overflow-hidden bg-slate-100">
                                                <img
                                                    src={`/storage/${relatedPost.featured_image}`}
                                                    alt={relatedPost.title}
                                                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                                                />
                                            </div>
                                        ) : (
                                            <div className="flex aspect-video items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
                                                <svg className="h-16 w-16 text-blue-400 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                                                </svg>
                                            </div>
                                        )}

                                        {/* Content */}
                                        <div className="relative p-6">
                                            {/* Category */}
                                            {relatedPost.category && (
                                                <span className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-blue-50 to-indigo-50 px-3 py-1 text-xs font-semibold text-blue-700">
                                                    <Tag className="h-3.5 w-3.5" />
                                                    {relatedPost.category.name}
                                                </span>
                                            )}

                                            {/* Title */}
                                            <h3 className="mb-2 line-clamp-2 text-lg font-bold text-slate-900 transition-colors group-hover:text-blue-600">
                                                {relatedPost.title}
                                            </h3>

                                            {/* Excerpt */}
                                            <p className="mb-4 line-clamp-2 text-sm text-slate-600">
                                                {relatedPost.excerpt}
                                            </p>

                                            {/* Read More */}
                                            <div className="flex items-center gap-1.5 text-sm font-semibold text-blue-600 transition-all group-hover:gap-3">
                                                Baca Artikel
                                                <ArrowRight className="h-4 w-4" />
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </HomeLayout>
    );
}
