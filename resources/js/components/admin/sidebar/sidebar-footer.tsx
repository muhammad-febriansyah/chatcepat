import { usePage, router } from '@inertiajs/react'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ChevronUp, User, LogOut, Settings } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import type { User as UserType } from '@/types'
import { cn } from '@/lib/utils'

export function SidebarFooterContent() {
    const { auth } = usePage().props as { auth: { user: UserType } }

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map(word => word[0])
            .join('')
            .toUpperCase()
            .slice(0, 2)
    }

    const handleLogout = () => {
        router.post('/logout')
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button className={cn(
                    'w-full flex items-center gap-2.5 rounded-lg p-2.5 transition-colors duration-150',
                    'hover:bg-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-ring'
                )}>
                    <Avatar className="h-9 w-9 border-2 border-primary/20">
                        {auth.user.avatar && (
                            <AvatarImage src={`/storage/${auth.user.avatar}`} alt={auth.user.name} />
                        )}
                        <AvatarFallback className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground text-sm font-semibold">
                            {getInitials(auth.user.name)}
                        </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 text-left min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">
                            {auth.user.name}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                            {auth.user.email}
                        </p>
                    </div>
                    <ChevronUp className="h-4 w-4 text-muted-foreground shrink-0" />
                </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
                side="top"
                align="start"
                className="w-[--radix-popper-anchor-width] mb-2"
            >
                <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                        <p className="text-sm font-semibold">{auth.user.name}</p>
                        <p className="text-xs text-muted-foreground">{auth.user.email}</p>
                    </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                    onClick={() => router.visit(`/admin/users/${auth.user.id}/edit`)}
                    className="cursor-pointer"
                >
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                    onClick={() => router.visit('/admin/settings')}
                    className="cursor-pointer"
                >
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Pengaturan</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                    onClick={handleLogout}
                    className="cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10"
                >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Keluar</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
