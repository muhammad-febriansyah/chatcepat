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

    const generateBreadcrumbs = () => {
        const paths = url.split('/').filter(Boolean)

        // Remove 'admin' from paths and generate breadcrumbs
        const adminIndex = paths.indexOf('admin')
        if (adminIndex === -1) return []

        const breadcrumbs = paths.slice(adminIndex).map((path, index, array) => {
            const href = '/admin' + (index > 0 ? '/' + array.slice(1, index + 1).join('/') : '')
            const label = path === 'admin'
                ? 'Dashboard'
                : path.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')

            return { href, label }
        })

        return breadcrumbs
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
