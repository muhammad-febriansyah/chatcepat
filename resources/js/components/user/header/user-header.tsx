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
import { Bell, Settings, LogOut, UserCircle, CheckCircle, Clock, XCircle, Receipt } from 'lucide-react'
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

interface Notification {
    id: number;
    type: string;
    title: string;
    message: string;
    status: string;
    icon: string;
    color: string;
    payment_method: string;
    time: string;
    url: string;
}

export function UserHeader() {
    const { url, props } = usePage<{
        auth?: { user?: { id: number; name: string; email: string; role: string; avatar: string | null } };
        notifications: Notification[];
    }>()
    const notifications = props.notifications || []
    const user = props.auth?.user

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
            'groups': 'Grup',
            'chatbot': 'Chatbot',
            'templates': 'Template',
            'reply-manual': 'Reply Manual',
            'edit': 'Edit',
            'contact-groups': 'Grup Kontak',
            'telegram': 'Telegram',
            'bots': 'Bot',
            'auto-replies': 'Auto Reply',
            'products': 'Katalog Produk',
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
            <Separator orientation="vertical" className="mr-2 h-6 hidden lg:block" />
            <div className="hidden lg:block">
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
            </div>

            <div className="ml-auto flex items-center gap-3">
                {/* Notification Bell Dropdown */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="relative rounded-full">
                            <Bell className="size-5" />
                            {notifications.length > 0 && (
                                <span className="absolute -top-0.5 -right-0.5 flex size-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                                    {notifications.length}
                                </span>
                            )}
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-80">
                        <DropdownMenuLabel>Riwayat Transaksi</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <div className="max-h-[300px] overflow-y-auto">
                            {notifications.length > 0 ? (
                                notifications.map((notif, index) => (
                                    <Fragment key={notif.id}>
                                        <DropdownMenuItem
                                            className="flex items-start gap-3 py-3 cursor-pointer"
                                            onClick={() => router.visit(notif.url)}
                                        >
                                            <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${notif.color === 'green' ? 'bg-green-100 text-green-600' :
                                                notif.color === 'yellow' ? 'bg-yellow-100 text-yellow-600' :
                                                    notif.color === 'red' ? 'bg-red-100 text-red-600' :
                                                        'bg-gray-100 text-gray-600'
                                                }`}>
                                                {notif.status === 'paid' ? <CheckCircle className="h-4 w-4" /> :
                                                    notif.status === 'pending' ? <Clock className="h-4 w-4" /> :
                                                        notif.status === 'failed' || notif.status === 'expired' ? <XCircle className="h-4 w-4" /> :
                                                            <Receipt className="h-4 w-4" />}
                                            </div>
                                            <div className="flex-1 space-y-1">
                                                <p className="text-sm font-medium">{notif.title}</p>
                                                <p className="text-xs text-muted-foreground">{notif.message}</p>
                                                <p className="text-xs text-muted-foreground">{notif.time}</p>
                                            </div>
                                        </DropdownMenuItem>
                                        {index < notifications.length - 1 && <DropdownMenuSeparator />}
                                    </Fragment>
                                ))
                            ) : (
                                <div className="py-6 text-center text-sm text-muted-foreground">
                                    Belum ada transaksi
                                </div>
                            )}
                        </div>
                        {notifications.length > 0 && (
                            <>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                    className="justify-center text-primary cursor-pointer"
                                    onClick={() => router.visit('/user/transactions')}
                                >
                                    Lihat Semua Transaksi
                                </DropdownMenuItem>
                            </>
                        )}
                    </DropdownMenuContent>
                </DropdownMenu>

                {user && (
                    <>
                        <Separator orientation="vertical" className="h-8" />

                        {/* User Avatar Dropdown */}
                        <DropdownMenu>
                            <DropdownMenuTrigger className="focus:outline-none">
                                <div className="flex items-center gap-3 rounded-lg hover:bg-muted/50 transition-colors p-1.5 cursor-pointer">
                                    <Avatar className="size-9">
                                        <AvatarImage src={user.avatar || undefined} alt={user.name} />
                                        <AvatarFallback className="bg-primary/10 text-primary">
                                            {getInitials(user.name)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="hidden lg:flex flex-col items-start">
                                        <span className="text-sm font-semibold leading-none">{user.name}</span>
                                        <span className="text-xs text-muted-foreground mt-1">
                                            {user.role === 'admin' ? 'Admin' : 'User'}
                                        </span>
                                    </div>
                                </div>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56">
                                <DropdownMenuLabel>
                                    <div className="flex flex-col space-y-1">
                                        <p className="text-sm font-medium leading-none">{user.name}</p>
                                        <p className="text-xs leading-none text-muted-foreground">
                                            {user.email}
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
                    </>
                )}
            </div>
        </header>
    )
}
