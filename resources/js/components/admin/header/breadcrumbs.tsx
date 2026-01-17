import { usePage, Link } from '@inertiajs/react'
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { Fragment } from 'react'
import { Home, ChevronRight } from 'lucide-react'

export function Breadcrumbs() {
    const { url } = usePage()

    // Label mapping for better readability
    const labelMap: Record<string, string> = {
        'admin': 'Dashboard',
        'dashboard': 'Dashboard',
        'users': 'Pengguna',
        'pricing-packages': 'Paket Harga',
        'transactions': 'Transaksi',
        'banks': 'Bank',
        'blogs': 'Blog',
        'blog-categories': 'Kategori Blog',
        'faqs': 'FAQ',
        'testimonials': 'Testimoni',
        'features': 'Fitur',
        'settings': 'Pengaturan',
        'create': 'Tambah',
        'edit': 'Edit',
    }

    const generateBreadcrumbs = () => {
        // Strip query string before processing
        const urlWithoutQuery = url.split('?')[0]
        const paths = urlWithoutQuery.split('/').filter(Boolean)

        // Remove 'admin' from paths and generate breadcrumbs
        const adminIndex = paths.indexOf('admin')
        if (adminIndex === -1) return []

        const breadcrumbs = paths.slice(adminIndex).map((path, index, array) => {
            const href = '/admin' + (index > 0 ? '/' + array.slice(1, index + 1).join('/') : '')

            // Check if path is a numeric ID - skip showing it or show "Detail"
            const isNumericId = /^\d+$/.test(path)

            let label: string
            if (labelMap[path]) {
                label = labelMap[path]
            } else if (isNumericId) {
                label = 'Detail'
            } else {
                label = path.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
            }

            return { href, label, isNumericId }
        })

        // Filter out numeric IDs if the next item is 'edit' (to avoid "Detail > Edit")
        return breadcrumbs.filter((item, index, arr) => {
            if (item.isNumericId && arr[index + 1]?.label === 'Edit') {
                return false
            }
            return true
        })
    }

    const breadcrumbs = generateBreadcrumbs()

    if (breadcrumbs.length === 0) return null

    return (
        <Breadcrumb>
            <BreadcrumbList className="flex-nowrap">
                <BreadcrumbItem>
                    <BreadcrumbLink asChild>
                        <Link
                            href="/admin/dashboard"
                            className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors"
                        >
                            <Home className="h-4 w-4" />
                            <span className="sr-only">Home</span>
                        </Link>
                    </BreadcrumbLink>
                </BreadcrumbItem>
                {breadcrumbs.map((breadcrumb, index) => (
                    <Fragment key={breadcrumb.href}>
                        <BreadcrumbSeparator>
                            <ChevronRight className="h-4 w-4 text-muted-foreground/50" />
                        </BreadcrumbSeparator>
                        {index === breadcrumbs.length - 1 ? (
                            <BreadcrumbItem>
                                <BreadcrumbPage className="font-medium text-foreground max-w-[150px] truncate">
                                    {breadcrumb.label}
                                </BreadcrumbPage>
                            </BreadcrumbItem>
                        ) : (
                            <BreadcrumbItem>
                                <BreadcrumbLink asChild>
                                    <Link
                                        href={breadcrumb.href}
                                        className="text-muted-foreground hover:text-foreground transition-colors max-w-[150px] truncate"
                                    >
                                        {breadcrumb.label}
                                    </Link>
                                </BreadcrumbLink>
                            </BreadcrumbItem>
                        )}
                    </Fragment>
                ))}
            </BreadcrumbList>
        </Breadcrumb>
    )
}
