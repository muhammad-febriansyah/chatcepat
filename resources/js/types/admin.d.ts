export interface WebSetting {
    id: number
    key: string
    value: string
    type: 'text' | 'textarea' | 'number' | 'boolean' | 'json' | 'image' | 'file'
    group: string
    description?: string
    created_at: string
    updated_at: string
}

export interface Faq {
    id: number
    question: string
    answer: string
    category: string
    order: number
    is_active: boolean
    created_at: string
    updated_at: string
}

export interface Page {
    id: number
    title: string
    slug: string
    content: string
    excerpt?: string
    meta_title?: string
    meta_description?: string
    meta_keywords?: string
    is_active: boolean
    created_at: string
    updated_at: string
}

export interface BlogCategory {
    id: number
    name: string
    slug: string
    description?: string
    image?: string
    meta_title?: string
    meta_description?: string
    order: number
    is_active: boolean
    posts_count?: number
    created_at: string
    updated_at: string
}

export interface BlogPost {
    id: number
    blog_category_id: number
    user_id: number
    title: string
    slug: string
    excerpt?: string
    content: string
    featured_image?: string
    meta_title?: string
    meta_description?: string
    meta_keywords?: string
    views: number
    status: 'draft' | 'published' | 'archived'
    published_at?: string
    created_at: string
    updated_at: string
    category?: BlogCategory
    author?: import('./index').User
}

export interface DashboardStats {
    total_faqs: number
    total_pages: number
    total_blog_categories: number
    total_blog_posts: number
    total_published_posts: number
    total_draft_posts: number
}

export interface AdminSharedData {
    auth: {
        user: import('./index').User
    }
    stats?: DashboardStats
}
