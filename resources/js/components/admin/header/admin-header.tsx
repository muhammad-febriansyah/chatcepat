import { Fragment } from 'react'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { Separator } from '@/components/ui/separator'
import { Breadcrumbs } from './breadcrumbs'
import { SearchBar } from './search-bar'
import { UserMenu } from './user-menu'
import { Bell, HelpCircle, CheckCircle, Clock, XCircle, Receipt, FileText, MessageCircleQuestion, Phone, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { router, usePage } from '@inertiajs/react'

interface Notification {
    id: number;
    type: string;
    title: string;
    message: string;
    amount?: string;
    status: string;
    color: string;
    payment_method: string;
    time: string;
    url: string;
}

export function AdminHeader() {
    const { props } = usePage<{ notifications: Notification[] }>()
    const notifications = props.notifications || []

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
                <SearchBar />

                {/* Notification Dropdown */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-9 w-9 rounded-lg text-muted-foreground hover:text-foreground relative"
                        >
                            <Bell className="h-5 w-5" />
                            {notifications.length > 0 && (
                                <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                                    {notifications.length}
                                </span>
                            )}
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-80">
                        <DropdownMenuLabel>Transaksi Terbaru</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <div className="max-h-[350px] overflow-y-auto">
                            {notifications.length > 0 ? (
                                notifications.map((notif, index) => (
                                    <Fragment key={notif.id}>
                                        <DropdownMenuItem
                                            className="flex items-start gap-3 py-3 cursor-pointer"
                                            onClick={() => router.visit(notif.url)}
                                        >
                                            <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                                                notif.color === 'green' ? 'bg-green-100 text-green-600' :
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
                                                {notif.amount && (
                                                    <p className="text-xs font-medium text-primary">{notif.amount}</p>
                                                )}
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
                                    onClick={() => router.visit('/admin/transactions')}
                                >
                                    Lihat Semua Transaksi
                                </DropdownMenuItem>
                            </>
                        )}
                    </DropdownMenuContent>
                </DropdownMenu>

                {/* Help/Bantuan Dropdown */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-9 w-9 rounded-lg text-muted-foreground hover:text-foreground hidden sm:flex"
                        >
                            <HelpCircle className="h-5 w-5" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                        <DropdownMenuLabel>Pusat Bantuan</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="cursor-pointer" onClick={() => router.visit('/admin/docs')}>
                            <FileText className="mr-2 h-4 w-4" />
                            Dokumentasi
                        </DropdownMenuItem>
                        <DropdownMenuItem className="cursor-pointer" onClick={() => router.visit('/admin/faq')}>
                            <MessageCircleQuestion className="mr-2 h-4 w-4" />
                            FAQ
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            className="cursor-pointer"
                            onClick={() => window.open('https://wa.me/6281234567890', '_blank')}
                        >
                            <Phone className="mr-2 h-4 w-4" />
                            Hubungi Support
                            <ExternalLink className="ml-auto h-3 w-3 text-muted-foreground" />
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>

                <Separator orientation="vertical" className="h-6 mx-1 hidden sm:block" />

                <UserMenu />
            </div>
        </header>
    )
}
