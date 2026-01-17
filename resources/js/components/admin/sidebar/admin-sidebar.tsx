import { Link, usePage } from '@inertiajs/react'
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar'
import { adminNavigation, type UserRole } from '@/lib/admin/navigation'
import { SidebarHeaderContent } from './sidebar-header'
import { SidebarFooterContent } from './sidebar-footer'
import { cn } from '@/lib/utils'

interface PageProps {
    auth: {
        user: {
            role: UserRole
        }
    }
}

export function AdminSidebar() {
    const { url, props } = usePage<PageProps>()
    const userRole = props.auth?.user?.role || 'user'

    const isActive = (href: string) => {
        return url.startsWith(href)
    }

    // Filter navigation based on user role
    const filteredNavigation = adminNavigation
        .filter((group) => !group.roles || group.roles.includes(userRole))
        .map((group) => ({
            ...group,
            items: group.items.filter((item) => !item.roles || item.roles.includes(userRole)),
        }))
        .filter((group) => group.items.length > 0)

    return (
        <Sidebar className="border-r border-border/40 bg-background/95 backdrop-blur-sm">
            <SidebarHeader className="border-b border-border/40">
                <SidebarHeaderContent />
            </SidebarHeader>
            <SidebarContent className="px-2 py-3">
                {filteredNavigation.map((group, groupIndex) => (
                    <SidebarGroup key={group.title} className={cn(groupIndex > 0 && 'mt-3')}>
                        <SidebarGroupLabel className="px-3 text-[10px] font-medium uppercase tracking-widest text-muted-foreground/50 mb-1.5">
                            {group.title}
                        </SidebarGroupLabel>
                        <SidebarGroupContent>
                            <SidebarMenu className="space-y-0.5">
                                {group.items.map((item) => {
                                    const Icon = item.icon
                                    const active = isActive(item.href)

                                    // External link (target="_blank")
                                    if (item.external) {
                                        return (
                                            <SidebarMenuItem key={item.href}>
                                                <SidebarMenuButton
                                                    asChild
                                                    className={cn(
                                                        'group relative flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors duration-150',
                                                        'hover:bg-accent',
                                                        active
                                                            ? 'bg-primary/10 text-primary font-medium'
                                                            : 'text-muted-foreground hover:text-foreground'
                                                    )}
                                                >
                                                    <Link
                                                        href={item.href}
                                                        onClick={(e) => {
                                                            e.preventDefault()
                                                            window.open(item.href, '_blank')
                                                        }}
                                                    >
                                                        <Icon className={cn(
                                                            'h-4 w-4 shrink-0 transition-colors duration-150',
                                                            active ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'
                                                        )} />
                                                        <span className="flex-1 truncate">{item.title}</span>
                                                    </Link>
                                                </SidebarMenuButton>
                                            </SidebarMenuItem>
                                        )
                                    }

                                    // Internal link
                                    return (
                                        <SidebarMenuItem key={item.href}>
                                            <SidebarMenuButton
                                                asChild
                                                isActive={active}
                                                className={cn(
                                                    'group relative flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors duration-150',
                                                    'hover:bg-accent',
                                                    active
                                                        ? 'bg-primary/10 text-primary font-medium'
                                                        : 'text-muted-foreground hover:text-foreground'
                                                )}
                                            >
                                                <Link href={item.href}>
                                                    <Icon className={cn(
                                                        'h-4 w-4 shrink-0 transition-colors duration-150',
                                                        active ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'
                                                    )} />
                                                    <span className="flex-1 truncate">{item.title}</span>
                                                </Link>
                                            </SidebarMenuButton>
                                        </SidebarMenuItem>
                                    )
                                })}
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>
                ))}
            </SidebarContent>
            <SidebarFooter className="border-t border-border/40 p-2">
                <SidebarFooterContent />
            </SidebarFooter>
        </Sidebar>
    )
}
