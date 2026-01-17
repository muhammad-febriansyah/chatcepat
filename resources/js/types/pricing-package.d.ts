import { FeatureKey } from '@/types'

export interface PricingPackage {
    id: number
    name: string
    slug: string
    description: string
    price: string
    currency: string
    period: number
    period_unit: string
    features: string[]
    feature_keys: FeatureKey[]
    is_featured: boolean
    is_active: boolean
    order: number
    button_text: string
    button_url: string | null
    formatted_price: string
    period_text: string
    created_at: string
    updated_at: string
}

export interface PricingPackageFormData {
    name: string
    slug?: string
    description: string
    price: string | number
    currency: string
    period: number
    period_unit: string
    features: string[]
    feature_keys: FeatureKey[]
    is_featured: boolean
    is_active: boolean
    order: number
    button_text?: string
    button_url?: string | null
}
