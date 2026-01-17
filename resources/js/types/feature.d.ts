export interface Feature {
    id: number
    icon: string
    title: string
    description: string
    image: string | null
    order: number
    is_active: boolean
    created_at: string
    updated_at: string
}

export interface FeatureFormData {
    icon: string
    title: string
    description: string
    order: number
    is_active: boolean
}
