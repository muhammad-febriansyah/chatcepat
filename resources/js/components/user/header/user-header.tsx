import { Fragment } from 'react'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { Separator } from '@/components/ui/separator'
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { usePage, router } from '@inertiajs/react'
import { Bell, Settings, LogOut, UserCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export function UserHeader() {
    const { url, props } = usePage<{ auth: { user: { id: number; name: string; email: string; role: string; avatar: string | null } } }>()

    // Generate breadcrumbs from URL (strip query string first)
    const pathWithoutQuery = url.split('?')[0]
    const pathSegments = pathWithoutQuery.split('/').filter(Boolean)

    const getBreadcrumbLabel = (segment: string): string => {
        const labels: Record<string, string> = {
            'user': 'User',
            'dashboard': 'Dashboard',
            'whatsapp': 'WhatsApp',
            'scraper': 'Scraping',
            'account': 'Pengaturan',
            'messages': 'Pesan',
            'contacts': 'Kontak',
            'maps': 'Peta',
            'create': 'Buat Baru',
            'payment': 'Pembayaran',
            'return': 'Status Pembayaran',
            'transactions': 'Riwayat Transaksi',
            'topup': 'Top Up',
            'broadcast': 'Broadcast',
            'groups': 'Group',
            'chatbot': 'Chatbot',
            'templates': 'Template',
            'reply-manual': 'Reply Manual',
            'edit': 'Edit',
        }
        // Check if segment is a numeric ID
        if (/^\d+$/.test(segment)) {
            return 'Detail'
        }
        return labels[segment] || segment
    }

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
        <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center gap-2 border-b bg-white px-4">
            <SidebarTrigger className="-ml-1 hover:bg-accent" />
            <Separator orientation="vertical" className="mr-2 h-6" />
            <Breadcrumb>
                <BreadcrumbList>
                    {pathSegments.map((segment, index) => {
                        const isLast = index === pathSegments.length - 1
                        const href = '/' + pathSegments.slice(0, index + 1).join('/')

                        return (
                            <Fragment key={`breadcrumb-${index}-${segment}`}>
                                <BreadcrumbItem>
                                    {!isLast ? (
                                        <BreadcrumbLink
                                            href={href}
                                            className="font-medium transition-colors hover:text-primary"
                                        >
                                            {getBreadcrumbLabel(segment)}
                                        </BreadcrumbLink>
                                    ) : (
                                        <BreadcrumbPage className="font-semibold text-foreground">
                                            {getBreadcrumbLabel(segment)}
                                        </BreadcrumbPage>
                                    )}
                                </BreadcrumbItem>
                                {!isLast && <BreadcrumbSeparator />}
                            </Fragment>
                        )
                    })}
                </BreadcrumbList>
            </Breadcrumb>

            <div className="ml-auto flex items-center gap-3">
                {/* Notification Bell Dropdown */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="relative rounded-full">
                            <Bell className="size-5" />
                            <span className="absolute -top-0.5 -right-0.5 flex size-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                                3
                            </span>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-80">
                        <DropdownMenuLabel>Notifikasi</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <div className="max-h-[300px] overflow-y-auto">
                            <DropdownMenuItem className="flex flex-col items-start py-3 cursor-pointer">
                                <p className="text-sm font-medium">Sesi WhatsApp Terhubung</p>
                                <p className="text-xs text-muted-foreground mt-1">
                                    Sesi WhatsApp baru berhasil terhubung
                                </p>
                                <p className="text-xs text-muted-foreground mt-1">2 jam yang lalu</p>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="flex flex-col items-start py-3 cursor-pointer">
                                <p className="text-sm font-medium">Scraping Selesai</p>
                                <p className="text-xs text-muted-foreground mt-1">
                                    Data scraping 50 tempat telah selesai
                                </p>
                                <p className="text-xs text-muted-foreground mt-1">5 jam yang lalu</p>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="flex flex-col items-start py-3 cursor-pointer">
                                <p className="text-sm font-medium">Pesan Baru</p>
                                <p className="text-xs text-muted-foreground mt-1">
                                    Anda menerima 10 pesan baru
                                </p>
                                <p className="text-xs text-muted-foreground mt-1">1 hari yang lalu</p>
                            </DropdownMenuItem>
                        </div>
                    </DropdownMenuContent>
                </DropdownMenu>

                <Separator orientation="vertical" className="h-8" />

                {/* User Avatar Dropdown */}
                <DropdownMenu>
                    <DropdownMenuTrigger className="focus:outline-none">
                        <div className="flex items-center gap-3 rounded-lg hover:bg-muted/50 transition-colors p-1.5 cursor-pointer">
                            <Avatar className="size-9">
                                <AvatarImage src={props.auth.user.avatar || undefined} alt={props.auth.user.name} />
                                <AvatarFallback className="bg-primary/10 text-primary">
                                    {getInitials(props.auth.user.name)}
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col items-start">
                                <span className="text-sm font-semibold leading-none">{props.auth.user.name}</span>
                                <span className="text-xs text-muted-foreground mt-1">
                                    {props.auth.user.role === 'admin' ? 'Admin' : 'User'}
                                </span>
                            </div>
                        </div>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                        <DropdownMenuLabel>
                            <div className="flex flex-col space-y-1">
                                <p className="text-sm font-medium leading-none">{props.auth.user.name}</p>
                                <p className="text-xs leading-none text-muted-foreground">
                                    {props.auth.user.email}
                                </p>
                            </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => router.visit('/user/dashboard')}>
                            <UserCircle className="mr-2 size-4" />
                            Dashboard
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => router.visit('/user/account')}>
                            <Settings className="mr-2 size-4" />
                            Pengaturan Akun
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={handleLogout} variant="destructive">
                            <LogOut className="mr-2 size-4" />
                            Keluar
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    )
}
