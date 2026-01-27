import {
    LayoutDashboard,
    Settings,
    HelpCircle,
    FileText,
    FolderOpen,
    FileEdit,
    Sparkles,
    DollarSign,
    ShieldCheck,
    ScrollText,
    Target,
    Info,
    Users,
    Mail,
    MapPin,
    Map,
    Layers,
    MessageSquare,
    Radio,
    MessageCircle,
    MailOpen,
    Landmark,
    Receipt,
    Brain,
    BookOpen,
    Building,
    type LucideIcon,
} from 'lucide-react'

export type UserRole = 'admin' | 'user'

export interface AdminNavItem {
    title: string
    href: string
    icon: LucideIcon
    external?: boolean // For external links
    roles?: UserRole[] // Roles that can see this item (if undefined, visible to all)
    children?: AdminNavItem[] // For dropdown items
}

export interface AdminNavGroup {
    title: string
    items: AdminNavItem[]
    roles?: UserRole[] // Roles that can see this group (if undefined, visible to all)
}

export const adminNavigation: AdminNavGroup[] = [
    {
        title: 'Menu Utama',
        items: [
            {
                title: 'Dasbor',
                href: '/admin/dashboard',
                icon: LayoutDashboard,
            },
        ],
    },
    {
        title: 'Konten Website',
        items: [
            {
                title: 'Fitur',
                href: '/admin/features',
                icon: Sparkles,
            },
            {
                title: 'Fitur Unggulan',
                href: '/admin/fitur-unggulan',
                icon: Sparkles,
            },
            {
                title: 'Partner',
                href: '/admin/partners',
                icon: Building,
            },
            {
                title: 'Paket Harga',
                href: '/admin/pricing-packages',
                icon: DollarSign,
            },
            {
                title: 'Data Bank',
                href: '/admin/banks',
                icon: Landmark,
            },
            {
                title: 'Pertanyaan Umum',
                href: '/admin/faqs',
                icon: HelpCircle,
            },
        ],
    },
    {
        title: 'Transaksi',
        roles: ['admin'],
        items: [
            {
                title: 'Kelola Transaksi',
                href: '/admin/transactions',
                icon: Receipt,
            },
        ],
    },
    {
        title: 'Halaman Statis',
        items: [
            {
                title: 'Halaman',
                href: '/admin/pages',
                icon: FileText,
                children: [
                    {
                        title: 'Tentang Kami',
                        href: '/admin/pages/about',
                        icon: Info,
                    },
                    {
                        title: 'Visi & Misi',
                        href: '/admin/pages/vision-mission',
                        icon: Target,
                    },
                    {
                        title: 'Kebijakan Privasi',
                        href: '/admin/pages/privacy',
                        icon: ShieldCheck,
                    },
                    {
                        title: 'Syarat & Ketentuan',
                        href: '/admin/pages/terms',
                        icon: ScrollText,
                    },
                ],
            },
        ],
    },
    {
        title: 'Blog',
        items: [
            {
                title: 'Blog',
                href: '/admin/blog',
                icon: FileText,
                children: [
                    {
                        title: 'Artikel',
                        href: '/admin/blog/posts',
                        icon: FileEdit,
                    },
                    {
                        title: 'Kategori',
                        href: '/admin/blog/categories',
                        icon: FolderOpen,
                    },
                ],
            },
        ],
    },
    {
        title: 'Panduan Ekosistem',
        items: [
            {
                title: 'Panduan',
                href: '/admin/guides',
                icon: BookOpen,
                children: [
                    {
                        title: 'Artikel Panduan',
                        href: '/admin/guides/articles',
                        icon: FileEdit,
                    },
                    {
                        title: 'Kategori Panduan',
                        href: '/admin/guides/categories',
                        icon: FolderOpen,
                    },
                ],
            },
        ],
    },
    {
        title: 'WhatsApp CRM',
        roles: ['user'],
        items: [
            {
                title: 'Sessions',
                href: '/admin/whatsapp/sessions',
                icon: Radio,
            },
            {
                title: 'Broadcasts',
                href: '/admin/whatsapp/broadcasts',
                icon: MailOpen,
            },
            {
                title: 'Messages',
                href: '/admin/whatsapp/messages',
                icon: MessageCircle,
            },
            {
                title: 'Template Pesan',
                href: '/admin/whatsapp/message-templates',
                icon: MessageSquare,
            },
        ],
    },
    {
        title: 'Google Maps Scraper',
        items: [
            {
                title: 'Kategori Scraper',
                href: '/admin/scraper-categories',
                icon: Layers,
                // No roles = visible to all
            },
            {
                title: 'Full Maps View',
                href: '/admin/google-maps-scraper/maps',
                icon: Map,
                external: true,
                roles: ['user'],
            },
            {
                title: 'Data Hasil Scraping',
                href: '/admin/google-maps-scraper/results',
                icon: FileText,
                roles: ['admin'],
            },
        ],
    },
    {
        title: 'Komunikasi',
        items: [
            {
                title: 'Pesan Kontak',
                href: '/admin/contacts',
                icon: Mail,
            },
        ],
    },
    {
        title: 'AI & Chatbot',
        roles: ['admin'],
        items: [
            {
                title: 'AI Assistant Types',
                href: '/admin/ai-assistant-types',
                icon: Brain,
            },
        ],
    },
    {
        title: 'Pengguna & Pengaturan',
        items: [
            {
                title: 'Kelola Pengguna',
                href: '/admin/users',
                icon: Users,
            },
            {
                title: 'Pengaturan Web',
                href: '/admin/settings',
                icon: Settings,
            },
        ],
    },
]
