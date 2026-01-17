import PageHeader from '@/components/page-header';
import HomeLayout from '@/layouts/home-layout';
import { Calendar, Tag, User, ArrowRight, Search, Clock, Sparkles, X } from 'lucide-react';
import { Link, router } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';

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

interface PaginatedPosts {
    data: Post[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    links: {
        url: string | null;
        label: string;
        active: boolean;
    }[];
}

interface BlogProps {
    canRegister?: boolean;
    posts: PaginatedPosts;
    filters: {
        search?: string;
    };
}


export default function Blog({ canRegister = true, posts, filters }: BlogProps) {
    const [searchQuery, setSearchQuery] = useState(filters.search || '');
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

    useEffect(() => {
        setSearchQuery(filters.search || '');
    }, [filters.search]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get('/blog', { search: searchQuery }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

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

    // Get unique categories from posts
    const categories = Array.from(
        new Set(posts.data.map((post) => post.category).filter(Boolean))
    ).reduce((acc, category) => {
        if (!acc.find((c) => c.id === category.id)) {
            acc.push(category);
        }
        return acc;
    }, [] as BlogCategory[]);

    // Filter posts by category
    const filteredPosts = selectedCategory
        ? posts.data.filter((post) => post.category?.slug === selectedCategory)
        : posts.data;

    // Check if post is new (published within last 7 days)
    const isNewPost = (publishedAt: string) => {
        const published = new Date(publishedAt);
        const now = new Date();
        const diffTime = Math.abs(now.getTime() - published.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays <= 7;
    };

    return (
        <HomeLayout title="Blog" canRegister={canRegister}>
            <PageHeader
                title="Blog"
                description="Artikel, tips, dan insights terbaru seputar CRM dan bisnis digital"
                breadcrumbs={[
                    { name: 'Home', href: '/' },
                    { name: 'Blog' },
                ]}
            />

            {/* Blog Content */}
            <div className="bg-gradient-to-b from-white to-slate-50 px-4 py-12 sm:px-6 sm:py-16 lg:py-20">
                <div className="container mx-auto max-w-7xl">
                    {/* Search Bar */}
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, ease: 'easeOut' }}
                        className="mb-8 sm:mb-12"
                    >
                        <div className="relative mx-auto max-w-2xl overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-lg">
                            {/* Decorative blur */}
                            <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-blue-500/10 blur-3xl"></div>
                            <div className="pointer-events-none absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-indigo-500/10 blur-3xl"></div>

                            <form onSubmit={handleSearch} className="relative">
                                <div className="relative">
                                    <input
                                        type="text"
                                        placeholder="Cari artikel blog..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full border-0 bg-transparent px-6 py-5 pl-14 text-base outline-none ring-0 transition-all placeholder:text-slate-400 focus:outline-none"
                                    />
                                    <Search className="absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                                    {searchQuery && (
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setSearchQuery('');
                                                router.get('/blog', {}, {
                                                    preserveState: true,
                                                    preserveScroll: true,
                                                });
                                            }}
                                            className="absolute right-5 top-1/2 -translate-y-1/2 rounded-lg p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
                                        >
                                            <X className="h-5 w-5" />
                                        </button>
                                    )}
                                </div>
                            </form>
                        </div>
                        {filters.search && (
                            <motion.p
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="mt-4 text-center text-sm text-slate-600"
                            >
                                Menampilkan hasil untuk: <span className="font-semibold text-blue-600">"{filters.search}"</span>
                                {posts.total > 0 && <span> ({posts.total} artikel ditemukan)</span>}
                            </motion.p>
                        )}
                    </motion.div>

                    {/* Category Filter */}
                    {categories.length > 0 && !filters.search && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.3, delay: 0.1 }}
                            className="mb-8 sm:mb-10"
                        >
                            <div className="flex flex-wrap items-center justify-center gap-3">
                                <button
                                    onClick={() => setSelectedCategory(null)}
                                    className={`rounded-full border-2 px-5 py-2.5 text-sm font-semibold transition-all ${
                                        !selectedCategory
                                            ? 'border-blue-600 bg-blue-600 text-white shadow-lg shadow-blue-200'
                                            : 'border-slate-200 bg-white text-slate-700 hover:border-blue-300 hover:text-blue-600'
                                    }`}
                                >
                                    Semua Artikel
                                </button>
                                {categories.map((category) => (
                                    <button
                                        key={category.id}
                                        onClick={() => setSelectedCategory(category.slug)}
                                        className={`rounded-full border-2 px-5 py-2.5 text-sm font-semibold transition-all ${
                                            selectedCategory === category.slug
                                                ? 'border-blue-600 bg-blue-600 text-white shadow-lg shadow-blue-200'
                                                : 'border-slate-200 bg-white text-slate-700 hover:border-blue-300 hover:text-blue-600'
                                        }`}
                                    >
                                        {category.name}
                                    </button>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    <AnimatePresence mode="wait">
                        {filteredPosts.length > 0 ? (
                            <div key="posts">
                                {/* Posts Grid */}
                                <div className="mb-12 grid gap-6 sm:gap-8 md:grid-cols-2 lg:grid-cols-3">
                                    {filteredPosts.map((post, index) => {
                                        if (!post || !post.slug) return null;

                                        const isNew = isNewPost(post.published_at);
                                        const readingTime = calculateReadingTime(post.content);

                                        return (
                                            <article
                                                key={post.id}
                                                className="group relative overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-lg transition-all duration-300 hover:-translate-y-2 hover:border-blue-200 hover:shadow-2xl"
                                            >
                                                {/* Decorative blur effects */}
                                                <div className="pointer-events-none absolute -right-20 -top-20 h-40 w-40 rounded-full bg-blue-500/5 blur-3xl transition-opacity duration-500 group-hover:opacity-100 opacity-60"></div>
                                                <div className="pointer-events-none absolute -bottom-20 -left-20 h-40 w-40 rounded-full bg-indigo-500/5 blur-3xl transition-opacity duration-500 group-hover:opacity-100 opacity-60"></div>

                                                {/* Top accent bar */}
                                                <div className="absolute left-0 right-0 top-0 h-1 bg-gradient-to-r from-blue-600 to-indigo-600 opacity-0 transition-opacity group-hover:opacity-100"></div>

                                                {/* New Badge */}
                                                {isNew && (
                                                    <div className="absolute right-4 top-4 z-10">
                                                        <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 px-3 py-1 text-xs font-semibold text-white shadow-lg">
                                                            <Sparkles className="h-3 w-3 fill-white" />
                                                            Baru
                                                        </span>
                                                    </div>
                                                )}

                                                {/* Featured Image */}
                                                {post.featured_image ? (
                                                    <div className="aspect-video overflow-hidden bg-slate-100">
                                                        <img
                                                            src={`/storage/${post.featured_image}`}
                                                            alt={post.title}
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
                                                <div className="relative p-6 sm:p-8">
                                                    {/* Meta Info */}
                                                    <div className="mb-4 flex flex-wrap items-center gap-3 text-xs sm:text-sm text-slate-600">
                                                        <span className="flex items-center gap-1.5">
                                                            <Calendar className="h-4 w-4 text-blue-600" />
                                                            {formatDate(post.published_at)}
                                                        </span>
                                                        <span className="flex items-center gap-1.5">
                                                            <Clock className="h-4 w-4 text-indigo-600" />
                                                            {readingTime} min
                                                        </span>
                                                        {post.category && (
                                                            <span className="ml-auto flex items-center gap-1.5 rounded-full bg-gradient-to-r from-blue-50 to-indigo-50 px-3 py-1 text-xs font-semibold text-blue-700">
                                                                <Tag className="h-3.5 w-3.5" />
                                                                {post.category.name}
                                                            </span>
                                                        )}
                                                    </div>

                                                    {/* Title */}
                                                    <h2 className="mb-3 line-clamp-2 text-xl font-bold text-slate-900 transition-colors group-hover:text-blue-600 sm:text-2xl">
                                                        {post.title}
                                                    </h2>

                                                    {/* Excerpt */}
                                                    <p className="mb-6 line-clamp-3 text-sm leading-relaxed text-slate-600 sm:text-base">
                                                        {post.excerpt}
                                                    </p>

                                                    {/* Author & Read More */}
                                                    <div className="flex items-center justify-between border-t border-slate-100 pt-4">
                                                        <div className="flex items-center gap-2.5 text-sm">
                                                            <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 text-xs font-bold text-white shadow-md">
                                                                {(post.author?.name || 'A').charAt(0).toUpperCase()}
                                                            </div>
                                                            <span className="font-semibold text-slate-700">{post.author?.name || 'Anonymous'}</span>
                                                        </div>
                                                        <Link
                                                            href={`/blog/${post.slug}`}
                                                            className="inline-flex items-center gap-1.5 font-semibold text-blue-600 transition-all hover:gap-3"
                                                        >
                                                            Baca
                                                            <ArrowRight className="h-4 w-4" />
                                                        </Link>
                                                    </div>
                                                </div>
                                            </article>
                                        );
                                    })}
                                </div>

                                {/* Pagination */}
                                {!selectedCategory && posts.last_page > 1 && (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: 0.2, duration: 0.3 }}
                                        className="flex items-center justify-center gap-2"
                                    >
                                        {posts.links
                                            .filter((link) => link && typeof link === 'object')
                                            .map((link, idx) => {
                                                // If no URL, render as disabled span
                                                if (!link.url) {
                                                    return (
                                                        <span
                                                            key={`pagination-${idx}`}
                                                            className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-slate-400 shadow-sm"
                                                            dangerouslySetInnerHTML={{
                                                                __html: link.label,
                                                            }}
                                                        />
                                                    );
                                                }

                                                // Render active/clickable link
                                                return (
                                                    <Link
                                                        key={`pagination-${idx}`}
                                                        href={String(link.url)}
                                                        className={`rounded-xl border px-4 py-2.5 font-semibold shadow-md transition-all hover:scale-105 ${
                                                            link.active
                                                                ? 'border-blue-600 bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-blue-200'
                                                                : 'border-slate-200 bg-white text-slate-700 hover:border-blue-300 hover:text-blue-600 hover:shadow-lg'
                                                        }`}
                                                        dangerouslySetInnerHTML={{
                                                            __html: link.label,
                                                        }}
                                                    />
                                                );
                                            })}
                                    </motion.div>
                                )}
                            </div>
                        ) : (
                            <motion.div
                                key="empty"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.3 }}
                                className="py-16 text-center sm:py-20"
                            >
                                <div className="relative mx-auto max-w-2xl overflow-hidden rounded-2xl border border-slate-100 bg-white p-10 shadow-xl sm:p-12">
                                    {/* Decorative blur */}
                                    <div className="pointer-events-none absolute -right-20 -top-20 h-40 w-40 rounded-full bg-blue-500/10 blur-3xl"></div>
                                    <div className="pointer-events-none absolute -bottom-20 -left-20 h-40 w-40 rounded-full bg-indigo-500/10 blur-3xl"></div>

                                    {/* Top accent bar */}
                                    <div className="absolute left-0 right-0 top-0 h-1 bg-gradient-to-r from-blue-600 to-indigo-600"></div>

                                    <div className="relative">
                                        <div className="mb-6 inline-flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-blue-100 to-indigo-100">
                                            <svg className="h-10 w-10 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                                            </svg>
                                        </div>
                                        <h3 className="mb-3 text-xl font-bold text-slate-900 sm:text-2xl">
                                            {filters.search ? 'Tidak ada artikel yang ditemukan' : selectedCategory ? 'Tidak ada artikel dalam kategori ini' : 'Belum Ada Artikel'}
                                        </h3>
                                        <p className="mb-6 text-sm text-slate-600 sm:text-base">
                                            {filters.search
                                                ? `Tidak ada artikel yang cocok dengan pencarian "${filters.search}". Coba kata kunci lain.`
                                                : selectedCategory
                                                ? 'Belum ada artikel yang dipublikasikan dalam kategori ini.'
                                                : 'Artikel blog akan segera hadir. Nantikan konten menarik dari kami!'}
                                        </p>
                                        {(filters.search || selectedCategory) && (
                                            <button
                                                onClick={() => {
                                                    setSearchQuery('');
                                                    setSelectedCategory(null);
                                                    router.get('/blog', {}, {
                                                        preserveState: true,
                                                        preserveScroll: true,
                                                    });
                                                }}
                                                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-3 font-semibold text-white shadow-lg transition-all hover:shadow-xl hover:scale-105"
                                            >
                                                Lihat Semua Artikel
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </HomeLayout>
    );
}
