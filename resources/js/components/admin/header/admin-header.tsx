import { SidebarTrigger } from '@/components/ui/sidebar'
import { Separator } from '@/components/ui/separator'
import { Breadcrumbs } from './breadcrumbs'
import { SearchBar } from './search-bar'
import { UserMenu } from './user-menu'
import { Bell, HelpCircle, UserPlus, AlertTriangle, CheckCircle, FileText, MessageCircleQuestion, Phone, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { router } from '@inertiajs/react'

export function AdminHeader() {
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
                            <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                                4
                            </span>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-80">
                        <DropdownMenuLabel className="flex items-center justify-between">
                            <span>Notifikasi</span>
                            <Button variant="ghost" size="sm" className="h-auto p-0 text-xs text-primary hover:text-primary/80">
                                Tandai semua dibaca
                            </Button>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <div className="max-h-[350px] overflow-y-auto">
                            <DropdownMenuItem className="flex items-start gap-3 py-3 cursor-pointer">
                                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-green-100 text-green-600">
                                    <UserPlus className="h-4 w-4" />
                                </div>
                                <div className="flex-1 space-y-1">
                                    <p className="text-sm font-medium">User Baru Terdaftar</p>
                                    <p className="text-xs text-muted-foreground">
                                        John Doe baru saja mendaftar sebagai user baru
                                    </p>
                                    <p className="text-xs text-muted-foreground">5 menit yang lalu</p>
                                </div>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="flex items-start gap-3 py-3 cursor-pointer">
                                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-yellow-100 text-yellow-600">
                                    <AlertTriangle className="h-4 w-4" />
                                </div>
                                <div className="flex-1 space-y-1">
                                    <p className="text-sm font-medium">Peringatan Sistem</p>
                                    <p className="text-xs text-muted-foreground">
                                        Penggunaan disk mencapai 80%, pertimbangkan untuk membersihkan data
                                    </p>
                                    <p className="text-xs text-muted-foreground">1 jam yang lalu</p>
                                </div>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="flex items-start gap-3 py-3 cursor-pointer">
                                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                                    <CheckCircle className="h-4 w-4" />
                                </div>
                                <div className="flex-1 space-y-1">
                                    <p className="text-sm font-medium">Backup Selesai</p>
                                    <p className="text-xs text-muted-foreground">
                                        Backup otomatis database berhasil dilakukan
                                    </p>
                                    <p className="text-xs text-muted-foreground">3 jam yang lalu</p>
                                </div>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="flex items-start gap-3 py-3 cursor-pointer">
                                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-green-100 text-green-600">
                                    <UserPlus className="h-4 w-4" />
                                </div>
                                <div className="flex-1 space-y-1">
                                    <p className="text-sm font-medium">User Baru Terdaftar</p>
                                    <p className="text-xs text-muted-foreground">
                                        Jane Smith baru saja mendaftar sebagai user baru
                                    </p>
                                    <p className="text-xs text-muted-foreground">1 hari yang lalu</p>
                                </div>
                            </DropdownMenuItem>
                        </div>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            className="justify-center text-primary cursor-pointer"
                            onClick={() => router.visit('/admin/notifications')}
                        >
                            Lihat Semua Notifikasi
                        </DropdownMenuItem>
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
