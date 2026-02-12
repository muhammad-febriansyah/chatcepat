import {
    LayoutDashboard,
    Users,
    Receipt,
    type LucideIcon,
} from 'lucide-react'

export interface OwnerNavItem {
    title: string
    href: string
    icon: LucideIcon
    external?: boolean
    children?: OwnerNavItem[]
}

export interface OwnerNavGroup {
    title: string
    items: OwnerNavItem[]
}

export const ownerNavigation: OwnerNavGroup[] = [
    {
        title: 'Menu Utama',
        items: [
            {
                title: 'Dasbor',
                href: '/owner/dashboard',
                icon: LayoutDashboard,
            },
        ],
    },
    {
        title: 'Laporan',
        items: [
            {
                title: 'Pengguna',
                href: '/owner/users',
                icon: Users,
            },
            {
                title: 'Transaksi',
                href: '/owner/transactions',
                icon: Receipt,
            },
        ],
    },
]
