import { Head, Link } from '@inertiajs/react'
import GuideLayout from '@/layouts/guide-layout'
import { GuideCategory, GuideArticle } from '@/types/guide'
import { BookOpen, FileText, ArrowRight } from 'lucide-react'

interface UserGuideCategory extends GuideCategory {
    articles: GuideArticle[]
}

interface UserGuidesIndexProps {
    categories: UserGuideCategory[]
    search?: string
}

export default function UserGuidesIndex({ categories, search }: UserGuidesIndexProps) {
    return (
        <>
            <Head title="Pusat Bantuan" />
            <GuideLayout
                title="Pusat Bantuan"
                allCategories={categories}
                currentArticleSlug=""
            >
                {/* Introduction Section */}
                <div className="mb-10 sm:mb-12">
                    <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
                        Temukan panduan dan tutorial lengkap penggunaan aplikasi ChatCepat.
                        Dokumentasi ini membantu Anda memahami fitur-fitur yang tersedia dan memecahkan masalah sehari-hari.
                    </p>
                </div>

                {/* Categories Grid */}
                <div className="space-y-12 sm:space-y-16">
                    {categories.map((category) => (
                        <div key={category.id} className="space-y-5 sm:space-y-6">
                            {/* Category Header */}
                            <div className="flex items-center gap-3 pb-4 border-b-2 border-gray-200">
                                <div className="flex size-11 sm:size-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 ring-1 ring-primary/10">
                                    {category.icon ? (
                                        <img
                                            src={`/storage/${category.icon}`}
                                            alt={category.name}
                                            className="h-6 w-6 sm:h-7 sm:w-7 object-contain"
                                            onError={(e) => {
                                                e.currentTarget.style.display = 'none'
                                                const fallback = e.currentTarget.nextElementSibling
                                                if (fallback) (fallback as HTMLElement).style.display = 'block'
                                            }}
                                        />
                                    ) : null}
                                    <BookOpen className={category.icon ? "hidden h-6 w-6 text-primary" : "h-6 w-6 text-primary"} />
                                </div>
                                <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
                                    {category.name}
                                </h2>
                            </div>

                            {/* Articles Grid */}
                            {category.articles.length > 0 ? (
                                <div className="grid gap-4 sm:gap-5 md:grid-cols-2">
                                    {category.articles.map((article) => (
                                        <Link
                                            key={article.id}
                                            href={route('user.guides.show', article.slug)}
                                            className="group relative flex flex-col p-5 sm:p-6 rounded-xl border-2 border-gray-200 bg-white hover:border-primary hover:shadow-lg hover:shadow-primary/5 transition-all duration-300"
                                        >
                                            {/* Hover gradient effect */}
                                            <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                                            <div className="relative flex items-start gap-4">
                                                <div className="flex-shrink-0 mt-1">
                                                    <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-all duration-300">
                                                        <FileText className="h-5 w-5" />
                                                    </div>
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h3 className="font-semibold text-base sm:text-lg text-foreground group-hover:text-primary transition-colors mb-2 line-clamp-2">
                                                        {article.title}
                                                    </h3>
                                                    {article.content && (
                                                        <p className="text-sm text-muted-foreground line-clamp-3 mb-3">
                                                            {article.content.replace(/[#*`]/g, '').substring(0, 120)}...
                                                        </p>
                                                    )}
                                                    <div className="flex items-center text-sm font-medium text-primary group-hover:gap-2 transition-all">
                                                        <span>Baca selengkapnya</span>
                                                        <ArrowRight className="h-4 w-4 opacity-0 group-hover:opacity-100 -ml-4 group-hover:ml-0 transition-all" />
                                                    </div>
                                                </div>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12 sm:py-16 px-4 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50/50">
                                    <div className="rounded-full bg-gray-100 p-4 mb-4 inline-flex">
                                        <FileText className="size-8 text-gray-400" />
                                    </div>
                                    <p className="text-sm text-muted-foreground italic">
                                        Belum ada artikel dalam kategori ini
                                    </p>
                                </div>
                            )}
                        </div>
                    ))}

                    {categories.length === 0 && (
                        <div className="text-center py-16 sm:py-24 px-4">
                            <div className="rounded-full bg-gray-100 p-8 mb-6 inline-flex">
                                <BookOpen className="size-16 text-gray-400" />
                            </div>
                            <h3 className="text-xl font-semibold mb-2">Tidak ada panduan ditemukan</h3>
                            <p className="text-base text-muted-foreground">
                                {search ? `Tidak ada hasil untuk pencarian "${search}"` : 'Belum ada panduan tersedia'}
                            </p>
                        </div>
                    )}
                </div>

                {/* Help Section */}
                <div className="mt-16 sm:mt-20 p-6 sm:p-8 rounded-2xl border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
                        <div className="flex-1">
                            <h3 className="text-xl sm:text-2xl font-bold mb-2 flex items-center gap-2">
                                <BookOpen className="h-6 w-6 text-primary flex-shrink-0" />
                                <span>Masih butuh bantuan?</span>
                            </h3>
                            <p className="text-muted-foreground">
                                Jika Anda tidak menemukan jawaban yang Anda cari, jangan ragu untuk menghubungi tim support kami.
                            </p>
                        </div>
                        <Link
                            href="/contact"
                            className="inline-flex items-center justify-center rounded-xl bg-primary px-6 py-3 text-base font-semibold text-primary-foreground hover:bg-primary/90 transition-all hover:shadow-lg hover:shadow-primary/20 whitespace-nowrap"
                        >
                            Hubungi Kami
                        </Link>
                    </div>
                </div>
            </GuideLayout>
        </>
    )
}
