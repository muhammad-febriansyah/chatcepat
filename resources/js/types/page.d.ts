export interface Page {
    id: number
    title: string
    slug: string
    content: string
    excerpt: string | null
    meta_title: string | null
    meta_description: string | null
    meta_keywords: string | null
    is_active: boolean
    created_at: string
    updated_at: string
}

export interface PageFormData {
    title: string
    content: string
    excerpt: string
    meta_title: string
    meta_description: string
    meta_keywords: string
    is_active: boolean
}
