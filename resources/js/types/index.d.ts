import { InertiaLinkProps } from '@inertiajs/react';
import { LucideIcon } from 'lucide-react';

export interface Auth {
    user: User;
}

export interface BreadcrumbItem {
    title: string;
    href: string;
}

export interface NavGroup {
    title: string;
    items: NavItem[];
}

export interface NavItem {
    title: string;
    href: NonNullable<InertiaLinkProps['href']>;
    icon?: LucideIcon | null;
    isActive?: boolean;
}

export interface Settings {
    site_name: string;
    site_description: string;
    contact_email: string;
    contact_phone: string;
    address: string;
    facebook_url: string;
    twitter_url: string;
    instagram_url: string;
    linkedin_url: string;
    tiktok_url: string;
    meta_keywords: string;
    meta_description: string;
    logo: string;
    favicon: string;
    [key: string]: unknown;
}

export interface SharedData {
    name: string;
    quote: { message: string; author: string };
    auth: Auth;
    settings: Settings;
    sidebarOpen: boolean;
    [key: string]: unknown;
}

export type FeatureKey =
    | 'crm_chat'
    | 'scraper_gmaps'
    | 'scraper_contacts'
    | 'scraper_groups'
    | 'broadcast_wa'
    | 'broadcast_group'
    | 'reply_manual'
    | 'chatbot_ai'
    | 'platforms'
    | 'templates'
    | 'master_data';

export interface Subscription {
    transaction_id: number;
    package_id: number;
    package_name: string;
    package_slug: string;
    features: string[];
    feature_keys: FeatureKey[];
    paid_at: string;
    expires_at: string;
    days_remaining: number;
}

export interface SubscriptionInfo {
    has_subscription: boolean;
    subscription: Subscription | null;
}

export interface User {
    id: number;
    name: string;
    email: string;
    avatar?: string;
    email_verified_at: string | null;
    two_factor_enabled?: boolean;
    subscription?: SubscriptionInfo;
    created_at: string;
    updated_at: string;
    [key: string]: unknown; // This allows for additional properties...
}
