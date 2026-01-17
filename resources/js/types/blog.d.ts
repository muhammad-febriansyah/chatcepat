import { User } from './index'

export interface BlogCategory {
    id: number
    name: string
    slug: string
    description: string | null
    posts_count?: number
    created_at: string
    updated_at: string
}

export interface Post {
    id: number
    blog_category_id: number
    user_id: number
    title: string
    slug: string
    excerpt: string | null
    content: string
    status: 'draft' | 'published'
    views: number
    published_at: string | null
    created_at: string
    updated_at: string
    category?: BlogCategory
    author?: User
}

export interface BlogCategoryFormData {
    name: string
    description?: string
}

export interface PostFormData {
    blog_category_id: number | string
    title: string
    excerpt?: string
    content: string
    status: 'draft' | 'published'
}
