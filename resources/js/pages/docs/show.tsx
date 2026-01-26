import { Head } from '@inertiajs/react'
import GuideLayout from '@/layouts/guide-layout'
import { GuideArticle, GuideCategory } from '@/types/guide'
import { useMemo } from 'react'

interface DocsCategoryWithArticles extends GuideCategory {
    articles: GuideArticle[]
}

interface DocsShowProps {
    article: GuideArticle
    relatedArticles: GuideArticle[]
    allCategories: DocsCategoryWithArticles[]
    canRegister: boolean
}

interface TableOfContentsItem {
    id: string
    title: string
    level: number
}

function generateTableOfContents(content: string): TableOfContentsItem[] {
    const lines = content.split('\n')
    const toc: TableOfContentsItem[] = []

    lines.forEach((line) => {
        // Match markdown headers: # Header, ## Header, ### Header
        const match = line.match(/^(#{1,4})\s+(.+)$/)
        if (match) {
            const level = match[1].length
            const title = match[2].trim()
            const id = title
                .toLowerCase()
                .replace(/[^a-z0-9\s-]/g, '')
                .replace(/\s+/g, '-')

            toc.push({ id, title, level })
        }
    })

    return toc
}

function parseMarkdownContent(content: string): JSX.Element[] {
    const lines = content.split('\n')
    const elements: JSX.Element[] = []
    let key = 0

    lines.forEach((line, index) => {
        // Headers
        const headerMatch = line.match(/^(#{1,6})\s+(.+)$/)
        if (headerMatch) {
            const level = headerMatch[1].length
            const text = headerMatch[2].trim()
            const id = text
                .toLowerCase()
                .replace(/[^a-z0-9\s-]/g, '')
                .replace(/\s+/g, '-')

            const HeaderTag = `h${level}` as keyof JSX.IntrinsicElements
            elements.push(
                <HeaderTag key={key++} id={id} className="scroll-mt-20">
                    {text}
                </HeaderTag>
            )
            return
        }

        // Bold text
        let processedLine = line
        processedLine = processedLine.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')

        // Lists
        const listMatch = line.match(/^[\s]*[-*]\s+(.+)$/)
        if (listMatch) {
            elements.push(
                <li key={key++} dangerouslySetInnerHTML={{ __html: listMatch[1] }} />
            )
            return
        }

        // Numbered lists
        const numberedMatch = line.match(/^[\s]*\d+\.\s+(.+)$/)
        if (numberedMatch) {
            elements.push(
                <li key={key++} dangerouslySetInnerHTML={{ __html: numberedMatch[1] }} />
            )
            return
        }

        // Empty line
        if (line.trim() === '') {
            elements.push(<br key={key++} />)
            return
        }

        // Regular paragraph
        if (processedLine) {
            elements.push(
                <p key={key++} dangerouslySetInnerHTML={{ __html: processedLine }} />
            )
        }
    })

    return elements
}

export default function DocsShow({ article, allCategories }: DocsShowProps) {
    const tableOfContents = useMemo(() => generateTableOfContents(article.content), [article.content])
    const contentElements = useMemo(() => parseMarkdownContent(article.content), [article.content])

    return (
        <>
            <Head title={article.title} />
            <GuideLayout
                title={article.title}
                category={article.category}
                tableOfContents={tableOfContents}
                allCategories={allCategories}
                currentArticleSlug={article.slug}
            >
                {/* Featured Image */}
                {article.featured_image && (
                    <div className="relative aspect-video w-full overflow-hidden rounded-lg border mb-8">
                        <img
                            src={'/storage/' + article.featured_image}
                            alt={article.title}
                            className="h-full w-full object-cover"
                        />
                    </div>
                )}

                {/* Article Content */}
                <div className="prose-headings:font-bold prose-h1:text-3xl prose-h2:text-2xl prose-h2:mt-10 prose-h2:mb-4 prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-3 prose-p:text-base prose-p:leading-7 prose-p:mb-4 prose-li:text-base prose-li:leading-7 prose-strong:font-semibold prose-strong:text-foreground">
                    {contentElements}
                </div>

                {/* Updated date */}
                <div className="mt-12 pt-6 border-t text-sm text-muted-foreground">
                    Terakhir diperbarui: {new Date(article.updated_at).toLocaleDateString('id-ID', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                    })}
                </div>
            </GuideLayout>
        </>
    )
}
