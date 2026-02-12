import { SidebarTrigger } from '@/components/ui/sidebar'
import { Separator } from '@/components/ui/separator'
import { Breadcrumbs } from './breadcrumbs'
import { Bell } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { usePage, router } from '@inertiajs/react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { LogOut, LayoutDashboard, User } from 'lucide-react'

interface AuthUser {
    id: number
    name: string
    email: string
    avatar?: string
    role?: string
}

export function OwnerHeader() {
    const { auth } = usePage<{ auth: { user: AuthUser } }>().props

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map(word => word[0])
            .join('')
            .toUpperCase()
            .slice(0, 2)
    }

    const handleLogout = () => {
        router.post('/logout', {}, {
            onError: () => window.location.href = '/login'
        })
    }

    return (
        <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-4 border-b border-border/50 bg-background/95 backdrop-blur-md supports-[backdrop-filter]:bg-background/80 px-4 md:px-6">
            {/* Left Section */}
            <div className="flex items-center gap-3">
                <SidebarTrigger className="h-9 w-9 rounded-lg hover:bg-muted transition-colors" />
                <Separator orientation="vertical" className="h-6 hidden md:block" />
                <div className="hidden md:block">
                    <Breadcrumbs />
                </div>
            </div>

            {/* Right Section */}
            <div className="ml-auto flex items-center gap-2">
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 rounded-lg text-muted-foreground hover:text-foreground relative"
                >
                    <Bell className="h-5 w-5" />
                </Button>

                <Separator orientation="vertical" className="h-6 mx-1 hidden sm:block" />

                {/* User Menu */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <button className="flex items-center gap-2 rounded-xl p-1.5 pr-3 hover:bg-muted/80 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/20">
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
                                <span className="text-[11px] text-muted-foreground leading-none mt-1">Owner</span>
                            </div>
                        </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                        <DropdownMenuLabel className="font-normal">
                            <div className="flex flex-col space-y-1">
                                <p className="text-sm font-semibold">{auth.user.name}</p>
                                <p className="text-xs text-muted-foreground">{auth.user.email}</p>
                            </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            onClick={() => router.visit('/owner/dashboard')}
                            className="cursor-pointer"
                        >
                            <LayoutDashboard className="mr-2 h-4 w-4" />
                            <span>Dashboard</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            onClick={() => router.visit('/owner/profile')}
                            className="cursor-pointer"
                        >
                            <User className="mr-2 h-4 w-4" />
                            <span>Profil Saya</span>
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
            </div>
        </header>
    )
}
