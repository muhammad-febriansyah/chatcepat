import { PropsWithChildren, useState } from 'react'
import { Link, usePage } from '@inertiajs/react'
import { ChevronRight, BookOpen, Menu, X, Search, Copy } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface TableOfContentsItem {
    id: string
    title: string
    level: number
}

interface GuideLayoutProps extends PropsWithChildren {
    title: string
    category?: {
        id: number
        name: string
        slug: string
    }
    tableOfContents?: TableOfContentsItem[]
    allCategories?: Array<{
        id: number
        name: string
        slug: string
        icon?: string
        articles: Array<{
            id: number
            title: string
            slug: string
        }>
    }>
    currentArticleSlug?: string
    showSearch?: boolean
    searchValue?: string
}

export default function GuideLayout({
    children,
    title,
    category,
    tableOfContents = [],
    allCategories = [],
    currentArticleSlug
}: GuideLayoutProps) {
    const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)
    const [expandedCategories, setExpandedCategories] = useState<number[]>(
        allCategories.map(cat => cat.id)
    )
    const [searchQuery, setSearchQuery] = useState('')
    const { settings } = usePage<{ settings: { logo?: string; site_name?: string } }>().props

    const toggleCategory = (categoryId: number) => {
        setExpandedCategories(prev =>
            prev.includes(categoryId)
                ? prev.filter(id => id !== categoryId)
                : [...prev, categoryId]
        )
    }

    // Filter categories and articles based on search query
    const filteredCategories = allCategories.map(cat => ({
        ...cat,
        articles: cat.articles.filter(article =>
            article.title.toLowerCase().includes(searchQuery.toLowerCase())
        )
    })).filter(cat =>
        searchQuery === '' ||
        cat.articles.length > 0 ||
        cat.name.toLowerCase().includes(searchQuery.toLowerCase())
    )

    const [copied, setCopied] = useState(false)

    const copyToClipboard = async () => {
        const url = window.location.href

        try {
            // Try modern clipboard API first
            if (navigator.clipboard && window.isSecureContext) {
                await navigator.clipboard.writeText(url)
            } else {
                // Fallback for HTTP or older browsers
                const textArea = document.createElement('textarea')
                textArea.value = url
                textArea.style.position = 'fixed'
                textArea.style.left = '-999999px'
                textArea.style.top = '-999999px'
                document.body.appendChild(textArea)
                textArea.focus()
                textArea.select()
                document.execCommand('copy')
                textArea.remove()
            }
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        } catch (err) {
            console.error('Failed to copy:', err)
            // Even if error, try fallback
            const textArea = document.createElement('textarea')
            textArea.value = url
            textArea.style.position = 'fixed'
            textArea.style.left = '-999999px'
            document.body.appendChild(textArea)
            textArea.focus()
            textArea.select()
            try {
                document.execCommand('copy')
                setCopied(true)
                setTimeout(() => setCopied(false), 2000)
            } catch (e) {
                console.error('Fallback copy failed:', e)
            }
            textArea.remove()
        }
    }

    return (
        <div className="min-h-screen bg-[#fafafa]">
            {/* Header */}
            <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-sm">
                <div className="flex h-14 items-center px-4 sm:px-6">
                    {/* Mobile Menu Button */}
                    <Button
                        variant="ghost"
                        size="icon"
                        className="mr-2 lg:hidden"
                        onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
                    >
                        {mobileSidebarOpen ? (
                            <X className="h-5 w-5" />
                        ) : (
                            <Menu className="h-5 w-5" />
                        )}
                    </Button>

                    <div className="flex items-center flex-1">
                        <Link href="/user/guides" className="flex items-center mr-4 sm:mr-6">
                            {settings?.logo ? (
                                <img
                                    src={`/storage/${settings.logo}`}
                                    alt={settings.site_name || 'Logo'}
                                    className="h-8 w-auto sm:h-9 object-cover"
                                    onError={(e) => {
                                        e.currentTarget.style.display = 'none'
                                        const fallback = e.currentTarget.nextElementSibling
                                        if (fallback) (fallback as HTMLElement).style.display = 'block'
                                    }}
                                />
                            ) : null}
                            <BookOpen className={cn(
                                "h-7 w-7 sm:h-8 sm:w-8 text-primary",
                                settings?.logo && "hidden"
                            )} />
                        </Link>
                        <nav className="hidden sm:flex items-center space-x-4 text-sm text-muted-foreground">
                            <Link href="/user/dashboard" className="hover:text-foreground transition-colors">
                                Dashboard
                            </Link>
                            <ChevronRight className="h-3.5 w-3.5" />
                            <span className="text-foreground font-medium">Panduan</span>
                        </nav>
                    </div>
                </div>
            </header>

            <div className="flex-1">
                <div className="flex max-w-[1800px] mx-auto">
                    {/* Mobile Sidebar Overlay */}
                    {mobileSidebarOpen && (
                        <div
                            className="fixed inset-0 z-40 bg-black/30 lg:hidden"
                            onClick={() => setMobileSidebarOpen(false)}
                        />
                    )}

                    {/* Left Sidebar - Navigation */}
                    <aside className={cn(
                        "fixed top-14 z-40 h-[calc(100vh-3.5rem)] w-72 shrink-0 overflow-y-auto bg-white border-r transition-transform duration-200 ease-in-out lg:sticky lg:block lg:translate-x-0",
                        mobileSidebarOpen ? "translate-x-0" : "-translate-x-full"
                    )}>
                        <div className="flex flex-col h-full">
                            {/* Sidebar Header */}
                            <div className="p-4 border-b">
                                <div className="flex items-center gap-2 mb-3">
                                    <div className="flex items-center justify-center w-8 h-8 rounded bg-blue-100">
                                        <BookOpen className="h-4 w-4 text-blue-600" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h2 className="text-sm font-semibold text-foreground truncate">
                                            Documentation
                                        </h2>
                                        <p className="text-xs text-muted-foreground truncate">
                                            {settings?.site_name || 'ChatCepat'}
                                        </p>
                                    </div>
                                </div>

                                {/* Search Input */}
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        type="text"
                                        placeholder="Cari artikel..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="pl-9 h-9 text-sm bg-gray-50 border-gray-200"
                                    />
                                </div>
                            </div>

                            {/* Navigation */}
                            <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                                {filteredCategories.map((cat) => {
                                    const isExpanded = expandedCategories.includes(cat.id)
                                    return (
                                        <div key={cat.id} className="space-y-1">
                                            <button
                                                onClick={() => toggleCategory(cat.id)}
                                                className="flex items-center gap-2 w-full px-2 py-1.5 text-sm font-medium text-foreground hover:bg-gray-100 rounded transition-colors"
                                            >
                                                <ChevronRight className={cn(
                                                    "h-4 w-4 transition-transform",
                                                    isExpanded && "rotate-90"
                                                )} />
                                                <span className="flex-1 text-left uppercase text-xs tracking-wide">
                                                    {cat.name}
                                                </span>
                                            </button>
                                            {isExpanded && (
                                                <div className="ml-2 pl-4 border-l-2 border-gray-200 space-y-0.5">
                                                    {cat.articles.map((article) => (
                                                        <Link
                                                            key={article.id}
                                                            href={route('user.guides.show', article.slug)}
                                                            onClick={() => setMobileSidebarOpen(false)}
                                                            className={cn(
                                                                "block px-3 py-1.5 text-sm rounded transition-colors",
                                                                currentArticleSlug === article.slug
                                                                    ? "text-blue-600 font-medium bg-blue-50 border-l-2 border-blue-600 -ml-[2px] pl-[10px]"
                                                                    : "text-gray-700 hover:text-foreground hover:bg-gray-50"
                                                            )}
                                                        >
                                                            {article.title}
                                                        </Link>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    )
                                })}
                            </nav>

                            {/* Sidebar Footer */}
                            <div className="p-4 border-t">
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                    <BookOpen className="h-4 w-4" />
                                    <span>Powered by {settings?.site_name || 'ChatCepat'}</span>
                                </div>
                            </div>
                        </div>
                    </aside>

                    {/* Main Content */}
                    <main className={cn(
                        "flex-1 min-w-0 bg-white",
                        tableOfContents.length > 0 ? "xl:mr-64" : ""
                    )}>
                        <div className="mx-auto w-full max-w-4xl px-8 py-12 sm:px-12 lg:px-16 min-h-[calc(100vh-3.5rem)]">
                            {/* Category Badge */}
                            {category && (
                                <div className="mb-4">
                                    <span className="text-sm text-blue-600 font-medium">
                                        {category.name}
                                    </span>
                                </div>
                            )}

                            {/* Article Header */}
                            <div className="mb-10">
                                <div className="flex items-start justify-between gap-4">
                                    <h1 className="text-4xl sm:text-5xl font-bold text-foreground tracking-tight leading-tight">
                                        {title}
                                    </h1>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={copyToClipboard}
                                        className={cn(
                                            "flex-shrink-0 mt-2 transition-colors",
                                            copied && "bg-green-50 border-green-200 text-green-600"
                                        )}
                                    >
                                        {copied ? (
                                            <>
                                                <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                </svg>
                                                Copied!
                                            </>
                                        ) : (
                                            <>
                                                <Copy className="h-4 w-4 mr-2" />
                                                Copy
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </div>

                            {/* Article Content */}
                            <div className="prose prose-slate prose-lg max-w-none prose-headings:font-bold prose-headings:tracking-tight prose-h1:text-4xl prose-h2:text-3xl prose-h2:mt-12 prose-h2:mb-6 prose-h3:text-2xl prose-h3:mt-10 prose-h3:mb-4 prose-p:text-[17px] prose-p:leading-8 prose-p:text-gray-700 prose-p:mb-6 prose-li:text-[17px] prose-li:leading-8 prose-li:text-gray-700 prose-strong:font-semibold prose-strong:text-gray-900 prose-a:text-blue-600 prose-a:font-medium prose-a:no-underline hover:prose-a:underline prose-ul:my-6 prose-ol:my-6">
                                {children}
                            </div>
                        </div>
                    </main>

                    {/* Right Sidebar - Table of Contents */}
                    {tableOfContents.length > 0 && (
                        <aside className="fixed top-14 right-0 z-30 hidden h-[calc(100vh-3.5rem)] w-64 shrink-0 overflow-y-auto border-l bg-white py-8 xl:block">
                            <div className="px-6">
                                <h4 className="text-sm font-semibold text-foreground mb-4">
                                    On this page
                                </h4>
                                <nav>
                                    <ul className="space-y-2 text-sm">
                                        {tableOfContents.map((item) => (
                                            <li key={item.id}>
                                                <a
                                                    href={`#${item.id}`}
                                                    className={cn(
                                                        "block text-gray-600 hover:text-blue-600 transition-colors",
                                                        item.level === 2 && "pl-0",
                                                        item.level === 3 && "pl-4",
                                                        item.level === 4 && "pl-8"
                                                    )}
                                                >
                                                    {item.title}
                                                </a>
                                            </li>
                                        ))}
                                    </ul>
                                </nav>
                            </div>
                        </aside>
                    )}
                </div>
            </div>
        </div>
    )
}
