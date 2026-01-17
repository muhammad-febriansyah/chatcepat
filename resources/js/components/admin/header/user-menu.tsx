import { usePage, router } from '@inertiajs/react'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
    DropdownMenuGroup,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { User, Settings, LogOut, Shield, ChevronDown, LayoutDashboard, ExternalLink } from 'lucide-react'
import { cn } from '@/lib/utils'

interface User {
    id: number
    name: string
    email: string
    avatar?: string
    role?: string
}

export function UserMenu() {
    const { auth } = usePage<{ auth: { user: User } }>().props

    const handleLogout = () => {
        router.post('/logout')
    }

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map(word => word[0])
            .join('')
            .toUpperCase()
            .slice(0, 2)
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button className={cn(
                    'flex items-center gap-2 rounded-xl p-1.5 pr-3',
                    'hover:bg-muted/80 transition-all duration-200',
                    'focus:outline-none focus:ring-2 focus:ring-primary/20'
                )}>
                    <Avatar className="h-8 w-8 border-2 border-primary/20 shadow-sm">
                        {auth.user.avatar && (
                            <AvatarImage src={`/storage/${auth.user.avatar}`} alt={auth.user.name} />
                        )}
                        <AvatarFallback className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground text-xs font-semibold">
                            {getInitials(auth.user.name)}
                        </AvatarFallback>
                    </Avatar>
                    <div className="hidden md:flex flex-col items-start">
                        <span className="text-sm font-semibold leading-none">{auth.user.name}</span>
                        <span className="text-[11px] text-muted-foreground leading-none mt-1">
                            {auth.user.role === 'admin' ? 'Administrator' : 'User'}
                        </span>
                    </div>
                    <ChevronDown className="h-4 w-4 text-muted-foreground hidden md:block" />
                </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64 p-2">
                <div className="flex items-center gap-3 p-2 mb-2">
                    <Avatar className="h-12 w-12 border-2 border-primary/20">
                        {auth.user.avatar && (
                            <AvatarImage src={`/storage/${auth.user.avatar}`} alt={auth.user.name} />
                        )}
                        <AvatarFallback className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground font-semibold">
                            {getInitials(auth.user.name)}
                        </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold truncate">{auth.user.name}</p>
                        <p className="text-xs text-muted-foreground truncate">{auth.user.email}</p>
                        <Badge variant="secondary" className="mt-1 text-[10px] h-5">
                            <Shield className="h-3 w-3 mr-1" />
                            {auth.user.role === 'admin' ? 'Admin' : 'User'}
                        </Badge>
                    </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                    <DropdownMenuItem
                        onClick={() => router.visit('/admin/dashboard')}
                        className="cursor-pointer rounded-lg py-2.5"
                    >
                        <LayoutDashboard className="mr-3 h-4 w-4 text-muted-foreground" />
                        <span>Dashboard</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                        onClick={() => router.visit(`/admin/users/${auth.user.id}/edit`)}
                        className="cursor-pointer rounded-lg py-2.5"
                    >
                        <User className="mr-3 h-4 w-4 text-muted-foreground" />
                        <span>Profil Saya</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                        onClick={() => router.visit('/admin/settings')}
                        className="cursor-pointer rounded-lg py-2.5"
                    >
                        <Settings className="mr-3 h-4 w-4 text-muted-foreground" />
                        <span>Pengaturan</span>
                    </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                    onClick={() => window.open('/', '_blank')}
                    className="cursor-pointer rounded-lg py-2.5"
                >
                    <ExternalLink className="mr-3 h-4 w-4 text-muted-foreground" />
                    <span>Lihat Website</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                    onClick={handleLogout}
                    className="cursor-pointer rounded-lg py-2.5 text-destructive focus:text-destructive focus:bg-destructive/10"
                >
                    <LogOut className="mr-3 h-4 w-4" />
                    <span>Keluar</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
