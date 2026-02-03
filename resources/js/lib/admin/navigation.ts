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
    Activity,
    MessagesSquare,
    UserCog,
    Megaphone,
    Bot,
    Reply,
    Send,
    Facebook,
    Instagram,
    Database,
    TrendingUp,
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
            {
                title: 'Message Templates',
                href: '/admin/meta/templates',
                icon: MessageSquare,
                roles: ['admin'],
            },
            {
                title: 'Webhook Logs',
                href: '/admin/meta/webhook-logs',
                icon: Activity,
                roles: ['admin'],
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
                // Admin juga bisa akses
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
        // Biarkan visible ke semua role
        items: [
            {
                title: 'AI Assistant Types',
                href: '/admin/ai-assistant-types',
                icon: Brain,
            },
        ],
    },
    {
        title: 'Fitur User - CRM & Chat',
        // Fitur user yang bisa diakses admin (unlimited)
        items: [
            {
                title: 'CRM Chat App',
                href: '/user/crm-chat',
                icon: MessageSquare,
            },
            {
                title: 'Widget Live Chat',
                href: '/user/widget',
                icon: MessagesSquare,
            },
            {
                title: 'Human Agent',
                href: '/user/human-agents',
                icon: UserCog,
            },
        ],
    },
    {
        title: 'Fitur User - Marketing',
        // Fitur marketing & broadcast user
        items: [
            {
                title: 'Scraping Contacts',
                href: '/user/scraper',
                icon: Users,
                children: [
                    {
                        title: 'dari Google Maps',
                        href: '/user/scraper',
                        icon: MapPin,
                    },
                    {
                        title: 'dari Contacts HP',
                        href: '/user/scraper/contacts',
                        icon: Users,
                    },
                    {
                        title: 'dari Group WhatsApp',
                        href: '/user/scraper/groups',
                        icon: MessageCircle,
                    },
                ],
            },
            {
                title: 'Broadcast Pesan',
                href: '/user/broadcast',
                icon: Megaphone,
                children: [
                    {
                        title: 'Broadcast WhatsApp',
                        href: '/user/broadcast',
                        icon: MessageCircle,
                    },
                    {
                        title: 'Broadcast Group WA',
                        href: '/user/broadcast/groups',
                        icon: Users,
                    },
                    {
                        title: 'Up Selling',
                        href: '/user/upselling',
                        icon: TrendingUp,
                    },
                ],
            },
        ],
    },
    {
        title: 'Fitur User - Automasi',
        // Fitur chatbot & automasi
        items: [
            {
                title: 'Chat Otomatis',
                href: '/user/chatbot',
                icon: Bot,
                children: [
                    {
                        title: 'Auto Reply Manual',
                        href: '/user/reply-manual',
                        icon: Reply,
                    },
                    {
                        title: 'Chatbot AI Cerdas',
                        href: '/user/chatbot',
                        icon: Bot,
                    },
                ],
            },
        ],
    },
    {
        title: 'Fitur User - Platform',
        // Kelola platforms
        items: [
            {
                title: 'Kelola Platforms',
                href: '/user/whatsapp',
                icon: Layers,
                children: [
                    {
                        title: 'WhatsApp Personal',
                        href: '/user/whatsapp',
                        icon: MessageCircle,
                    },
                    {
                        title: 'WhatsApp Business API',
                        href: '/user/meta/settings',
                        icon: MessageCircle,
                    },
                    {
                        title: 'Telegram',
                        href: '/user/telegram',
                        icon: Send,
                    },
                    {
                        title: 'Facebook Messenger',
                        href: '/user/meta/messenger',
                        icon: Facebook,
                    },
                    {
                        title: 'DM Instagram',
                        href: '/user/meta/instagram',
                        icon: Instagram,
                    },
                ],
            },
            {
                title: 'Template Pesan',
                href: '/user/templates?type=whatsapp',
                icon: FileText,
            },
            {
                title: 'Master Data',
                href: '/user/contacts',
                icon: Database,
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
