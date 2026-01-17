import { Search, Command } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { router, usePage } from '@inertiajs/react'
import {
    CommandDialog,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from '@/components/ui/command'
import { adminNavigation, type UserRole } from '@/lib/admin/navigation'

interface PageProps {
    auth: {
        user: {
            role: UserRole
        }
    }
}

export function SearchBar() {
    const [open, setOpen] = useState(false)
    const { props } = usePage<PageProps>()
    const userRole = props.auth?.user?.role || 'user'

    // Filter navigation based on user role
    const filteredNavigation = adminNavigation
        .filter((group) => !group.roles || group.roles.includes(userRole))
        .map((group) => ({
            ...group,
            items: group.items.filter((item) => !item.roles || item.roles.includes(userRole)),
        }))
        .filter((group) => group.items.length > 0)

    useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
                e.preventDefault()
                setOpen((open) => !open)
            }
        }

        document.addEventListener('keydown', down)
        return () => document.removeEventListener('keydown', down)
    }, [])

    const handleSelect = (href: string, external?: boolean) => {
        setOpen(false)
        if (external) {
            window.open(href, '_blank')
        } else {
            router.visit(href)
        }
    }

    return (
        <>
            <Button
                variant="outline"
                onClick={() => setOpen(true)}
                className={cn(
                    'relative h-9 w-9 sm:w-[180px] lg:w-[280px] justify-start rounded-lg',
                    'bg-muted/50 border-transparent hover:bg-muted',
                    'text-muted-foreground text-sm font-normal'
                )}
            >
                <Search className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline-flex">Cari menu, halaman...</span>
                <kbd className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 hidden lg:inline-flex h-5 select-none items-center gap-0.5 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
                    <Command className="h-3 w-3" />
                    <span>K</span>
                </kbd>
            </Button>

            <CommandDialog open={open} onOpenChange={setOpen}>
                <CommandInput placeholder="Cari menu, halaman..." />
                <CommandList>
                    <CommandEmpty>Tidak ada hasil ditemukan.</CommandEmpty>
                    {filteredNavigation.map((group) => (
                        <CommandGroup key={group.title} heading={group.title}>
                            {group.items.map((item) => {
                                const Icon = item.icon
                                return (
                                    <CommandItem
                                        key={item.href}
                                        value={`${item.title} ${group.title}`}
                                        onSelect={() => handleSelect(item.href, item.external)}
                                        className="cursor-pointer"
                                    >
                                        <Icon className="mr-2 h-4 w-4" />
                                        <span>{item.title}</span>
                                        {item.external && (
                                            <span className="ml-auto text-xs text-muted-foreground">
                                                External
                                            </span>
                                        )}
                                    </CommandItem>
                                )
                            })}
                        </CommandGroup>
                    ))}
                </CommandList>
            </CommandDialog>
        </>
    )
}
