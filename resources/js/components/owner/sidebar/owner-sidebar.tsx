import { Link, usePage } from '@inertiajs/react'
import { useState, useEffect } from 'react'
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
    SidebarMenuSub,
    SidebarMenuSubButton,
    SidebarMenuSubItem,
} from '@/components/ui/sidebar'
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { ChevronDown } from 'lucide-react'
import { ownerNavigation } from '@/lib/owner/navigation'
import { SidebarHeaderContent } from './sidebar-header'
import { SidebarFooterContent } from './sidebar-footer'
import { cn } from '@/lib/utils'

export function OwnerSidebar() {
    const { url } = usePage()
    const [openDropdowns, setOpenDropdowns] = useState<Record<string, boolean>>({})

    const isActive = (href: string) => {
        return url.startsWith(href)
    }

    const hasActiveChild = (children?: any[]) => {
        if (!children) return false
        return children.some((child) => isActive(child.href))
    }

    useEffect(() => {
        const newOpenState: Record<string, boolean> = {}
        ownerNavigation.forEach((group) => {
            group.items.forEach((item) => {
                if (item.children) {
                    const isChildActive = hasActiveChild(item.children)
                    if (isChildActive) {
                        newOpenState[item.href] = true
                    }
                }
            })
        })
        setOpenDropdowns((prev) => ({ ...prev, ...newOpenState }))
    }, [url])

    const toggleDropdown = (href: string) => {
        setOpenDropdowns((prev) => ({
            ...prev,
            [href]: !prev[href],
        }))
    }

    return (
        <Sidebar className="border-r border-border/40 bg-background/95 backdrop-blur-sm">
            <SidebarHeader className="border-b border-border/40">
                <SidebarHeaderContent />
            </SidebarHeader>
            <SidebarContent className="px-2 py-3">
                {ownerNavigation.map((group, groupIndex) => (
                    <SidebarGroup key={group.title} className={cn(groupIndex > 0 && 'mt-3')}>
                        <SidebarGroupLabel className="px-3 text-[10px] font-medium uppercase tracking-widest text-muted-foreground/50 mb-1.5">
                            {group.title}
                        </SidebarGroupLabel>
                        <SidebarGroupContent>
                            <SidebarMenu className="space-y-0.5">
                                {group.items.map((item) => {
                                    const Icon = item.icon
                                    const active = isActive(item.href)
                                    const childActive = hasActiveChild(item.children)
                                    const isOpen = openDropdowns[item.href] || false

                                    if (item.children && item.children.length > 0) {
                                        return (
                                            <Collapsible
                                                key={item.href}
                                                open={isOpen}
                                                onOpenChange={() => toggleDropdown(item.href)}
                                            >
                                                <SidebarMenuItem>
                                                    <CollapsibleTrigger asChild>
                                                        <SidebarMenuButton
                                                            className={cn(
                                                                'group relative flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-all duration-150',
                                                                'hover:bg-accent',
                                                                childActive
                                                                    ? 'bg-primary/10 text-primary font-medium'
                                                                    : 'text-muted-foreground hover:text-foreground'
                                                            )}
                                                        >
                                                            <Icon className={cn(
                                                                'h-4 w-4 shrink-0 transition-colors duration-150',
                                                                childActive ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'
                                                            )} />
                                                            <span className="flex-1 truncate">{item.title}</span>
                                                            <ChevronDown className={cn(
                                                                'h-4 w-4 shrink-0 transition-transform duration-200',
                                                                isOpen && 'rotate-180',
                                                                childActive ? 'text-primary' : 'text-muted-foreground'
                                                            )} />
                                                        </SidebarMenuButton>
                                                    </CollapsibleTrigger>
                                                    <CollapsibleContent>
                                                        <SidebarMenuSub className="ml-4 border-l pl-2 mt-1">
                                                            {item.children.map((child) => {
                                                                const ChildIcon = child.icon
                                                                const childItemActive = isActive(child.href)

                                                                return (
                                                                    <SidebarMenuSubItem key={child.href}>
                                                                        <SidebarMenuSubButton
                                                                            asChild
                                                                            isActive={childItemActive}
                                                                            className={cn(
                                                                                'group relative flex items-center gap-2.5 rounded-lg px-3 py-1.5 text-sm transition-colors duration-150',
                                                                                'hover:bg-accent',
                                                                                childItemActive
                                                                                    ? 'bg-primary/10 text-primary font-medium'
                                                                                    : 'text-muted-foreground hover:text-foreground'
                                                                            )}
                                                                        >
                                                                            <Link href={child.href}>
                                                                                <ChildIcon className={cn(
                                                                                    'h-3.5 w-3.5 shrink-0 transition-colors duration-150',
                                                                                    childItemActive ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'
                                                                                )} />
                                                                                <span className="flex-1 truncate">{child.title}</span>
                                                                            </Link>
                                                                        </SidebarMenuSubButton>
                                                                    </SidebarMenuSubItem>
                                                                )
                                                            })}
                                                        </SidebarMenuSub>
                                                    </CollapsibleContent>
                                                </SidebarMenuItem>
                                            </Collapsible>
                                        )
                                    }

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
