export interface GuideCategory {
    id: number
    name: string
    slug: string
    icon?: string
    sort_order: number
    created_at: string
    updated_at: string
    articles?: GuideArticle[]
}

export interface GuideArticle {
    id: number
    guide_category_id: number
    platform?: string
    title: string
    slug: string
    content: string
    video_url?: string
    icon?: string
    sort_order: number
    is_published: boolean
    featured_image?: string
    created_at: string
    updated_at: string
    category?: GuideCategory
}
