import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarMenuSubButton,
    SidebarMenuSubItem,
    SidebarHeader,
    SidebarFooter,
} from '@/components/ui/sidebar'
import {
    LayoutDashboard,
    MessageSquare,
    MapPin,
    Settings,
    Send,
    Users,
    Bot,
    MessageCircle,
    User,
    Megaphone,
    Mail,
    TrendingUp,
    Layers,
    FileText,
    Database,
    CreditCard,
    ArrowUpCircle,
    BarChart3,
    Receipt,
    LogOut,
    Reply,
    Lock,
    Crown,
    Package,
    UserCog,
    BookOpen,
} from 'lucide-react'
import { Link, router, usePage } from '@inertiajs/react'
import { cn } from '@/lib/utils'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { ChevronRight } from 'lucide-react'
import { useState } from 'react'
import { SharedData, FeatureKey } from '@/types'
import { Badge } from '@/components/ui/badge'

export function UserSidebar() {
    const { url, props } = usePage<SharedData>()
    const user = props.auth?.user
    const settings = props.settings
    const hasSubscription = user?.subscription?.has_subscription ?? false
    const subscription = user?.subscription?.subscription
    const featureKeys = subscription?.feature_keys ?? []

    // Check if user has access to a specific feature
    const hasFeature = (key: FeatureKey): boolean => {
        if (!hasSubscription) return false
        // If feature_keys is empty, grant all access (backward compatibility)
        if (featureKeys.length === 0) return true
        return featureKeys.includes(key)
    }

    // Helper to check if any path in array matches current URL
    const isAnyActive = (paths: string[]): boolean => {
        return paths.some(path => url.startsWith(path))
    }

    // Determine which sections should be open based on active URL
    const isScrapingActive = isAnyActive(['/user/scraper'])
    const isBroadcastActive = isAnyActive(['/user/broadcast', '/user/contact-groups'])
    const isChatbotActive = isAnyActive(['/user/chatbot', '/user/reply-manual'])
    const isPlatformsActive = isAnyActive(['/user/telegram', '/user/whatsapp'])
    const isTemplatesActive = isAnyActive(['/user/templates', '/user/products'])

    const [openSections, setOpenSections] = useState<Record<string, boolean>>({
        scraping: isScrapingActive,
        broadcast: isBroadcastActive,
        chatbot: isChatbotActive,
        platforms: isPlatformsActive,
        templates: isTemplatesActive,
    })

    const handleLogout = () => {
        router.post('/logout')
    }

    const toggleSection = (section: string) => {
        setOpenSections((prev) => ({
            ...prev,
            [section]: !prev[section],
        }))
    }

    const isActive = (path: string) => {
        return url === path || url.startsWith(path + '/')
    }

    // Handle locked feature click - redirect to upgrade page
    const handleLockedClick = (e: React.MouseEvent) => {
        e.preventDefault()
        router.visit('/user/topup')
    }

    // Locked menu button component
    const LockedMenuButton = ({ icon: Icon, label }: { icon: React.ElementType; label: string }) => (
        <SidebarMenuButton
            onClick={handleLockedClick}
            className="h-10 rounded-lg opacity-50 cursor-pointer hover:opacity-70 group"
        >
            <Icon className="size-5" />
            <span>{label}</span>
            <Lock className="ml-auto size-4 text-muted-foreground group-hover:text-primary" />
        </SidebarMenuButton>
    )

    // Locked sub menu button component
    const LockedSubMenuButton = ({ icon: Icon, label, iconColor }: { icon: React.ElementType; label: string; iconColor?: string }) => (
        <SidebarMenuSubButton
            onClick={handleLockedClick}
            className="opacity-50 cursor-pointer hover:opacity-70 group"
        >
            <Icon className={cn('size-4', iconColor)} />
            <span>{label}</span>
            <Lock className="ml-auto size-3 text-muted-foreground group-hover:text-primary" />
        </SidebarMenuSubButton>
    )

    return (
        <Sidebar className="border-r">
            <SidebarHeader className="border-b">
                <Link
                    href="/user/dashboard"
                    className="group flex items-center justify-center px-4 py-4 transition-all"
                >
                    {settings?.logo ? (
                        <img
                            src={`/storage/${settings.logo}`}
                            alt={settings.site_name || 'Logo'}
                            className="h-8 w-auto object-contain transition-transform duration-150 group-hover:scale-[1.02]"
                        />
                    ) : (
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground transition-transform duration-150 group-hover:scale-[1.02]">
                            <MessageCircle className="h-5 w-5" strokeWidth={2} />
                        </div>
                    )}
                </Link>
            </SidebarHeader>

            <SidebarContent className="px-3 py-2">
                {/* Subscription Status Badge */}
                {!hasSubscription && (
                    <div className="px-2 pb-2">
                        <div
                            onClick={() => router.visit('/user/topup')}
                            className="flex items-center gap-2 p-3 rounded-lg bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-200 cursor-pointer hover:from-amber-500/20 hover:to-orange-500/20 transition-colors"
                        >
                            <Crown className="size-5 text-amber-600" />
                            <div className="flex-1">
                                <p className="text-sm font-medium text-amber-800">Akun Belum Aktif</p>
                                <p className="text-xs text-amber-600">Upgrade untuk akses semua fitur</p>
                            </div>
                            <ChevronRight className="size-4 text-amber-600" />
                        </div>
                    </div>
                )}

                {hasSubscription && subscription && (
                    <div className="px-2 pb-2">
                        <div className="flex items-center gap-2 p-3 rounded-lg bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-200">
                            <Crown className="size-5 text-green-600" />
                            <div className="flex-1">
                                <p className="text-sm font-medium text-green-800">{subscription.package_name}</p>
                                <p className="text-xs text-green-600">
                                    {subscription.days_remaining > 0
                                        ? `${Math.ceil(subscription.days_remaining)} hari tersisa`
                                        : 'Berakhir hari ini'
                                    }
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Dashboard - Always accessible */}
                <SidebarGroup>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            <SidebarMenuItem>
                                <SidebarMenuButton
                                    asChild
                                    isActive={isActive('/user/dashboard')}
                                    className={cn(
                                        'h-10 rounded-lg',
                                        isActive('/user/dashboard')
                                            ? 'bg-primary/10 text-primary font-semibold'
                                            : ''
                                    )}
                                >
                                    <Link href="/user/dashboard">
                                        <LayoutDashboard className="size-5" />
                                        <span>Dashboard</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>



                {/* KOMUNIKASI & CHAT */}
                <SidebarGroup>
                    <SidebarGroupLabel className="text-xs text-muted-foreground uppercase tracking-wider px-2">
                        Komunikasi & Chat
                    </SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            <SidebarMenuItem>
                                {hasFeature('crm_chat') ? (
                                    <SidebarMenuButton
                                        asChild
                                        isActive={url.startsWith('/user/crm-chat')}
                                        className={cn(
                                            'h-10 rounded-lg',
                                            url.startsWith('/user/crm-chat') && 'bg-primary/10 text-primary font-semibold'
                                        )}
                                    >
                                        <Link href="/user/crm-chat">
                                            <MessageSquare className="size-5" />
                                            <span>CRM Chat App</span>
                                        </Link>
                                    </SidebarMenuButton>
                                ) : (
                                    <LockedMenuButton icon={MessageSquare} label="CRM Chat App" />
                                )}
                            </SidebarMenuItem>
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>

                {/* MARKETING & PROMOSI */}
                <SidebarGroup>
                    <SidebarGroupLabel className="text-xs text-muted-foreground uppercase tracking-wider px-2">
                        Marketing & Promosi
                    </SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {/* Scraping Contacts */}
                            <Collapsible
                                open={openSections.scraping}
                                onOpenChange={() => toggleSection('scraping')}
                            >
                                <SidebarMenuItem>
                                    <CollapsibleTrigger asChild>
                                        <SidebarMenuButton
                                            isActive={isScrapingActive}
                                            className={cn(
                                                'h-10 rounded-lg',
                                                isScrapingActive && 'bg-primary/10 text-primary font-semibold',
                                                !hasFeature('scraper_gmaps') && !hasFeature('scraper_contacts') && !hasFeature('scraper_groups') && 'opacity-50'
                                            )}
                                        >
                                            <Users className="size-5" />
                                            <span>Scraping Kontak</span>
                                            {!hasFeature('scraper_gmaps') && !hasFeature('scraper_contacts') && !hasFeature('scraper_groups') && <Lock className="size-4 text-muted-foreground" />}
                                            <ChevronRight
                                                className={cn(
                                                    'ml-auto size-4 transition-transform',
                                                    openSections.scraping && 'rotate-90'
                                                )}
                                            />
                                        </SidebarMenuButton>
                                    </CollapsibleTrigger>
                                    <CollapsibleContent>
                                        <SidebarMenuSub>
                                            <SidebarMenuSubItem>
                                                {hasFeature('scraper_gmaps') ? (
                                                    <SidebarMenuSubButton
                                                        asChild
                                                        isActive={isActive('/user/scraper')}
                                                        className={cn(
                                                            isActive('/user/scraper') && 'bg-primary/10 text-primary font-semibold'
                                                        )}
                                                    >
                                                        <Link href="/user/scraper">
                                                            <MapPin className="size-4" />
                                                            <span>Google Maps</span>
                                                        </Link>
                                                    </SidebarMenuSubButton>
                                                ) : (
                                                    <LockedSubMenuButton icon={MapPin} label="Google Maps" />
                                                )}
                                            </SidebarMenuSubItem>
                                            <SidebarMenuSubItem>
                                                {hasFeature('scraper_contacts') ? (
                                                    <SidebarMenuSubButton
                                                        asChild
                                                        isActive={isActive('/user/scraper/contacts')}
                                                        className={cn(
                                                            isActive('/user/scraper/contacts') && 'bg-primary/10 text-primary font-semibold'
                                                        )}
                                                    >
                                                        <Link href="/user/scraper/contacts">
                                                            <User className="size-4" />
                                                            <span>Kontak HP</span>
                                                        </Link>
                                                    </SidebarMenuSubButton>
                                                ) : (
                                                    <LockedSubMenuButton icon={User} label="Kontak HP" />
                                                )}
                                            </SidebarMenuSubItem>
                                            <SidebarMenuSubItem>
                                                {hasFeature('scraper_groups') ? (
                                                    <SidebarMenuSubButton
                                                        asChild
                                                        isActive={isActive('/user/scraper/groups')}
                                                        className={cn(
                                                            isActive('/user/scraper/groups') && 'bg-primary/10 text-primary font-semibold'
                                                        )}
                                                    >
                                                        <Link href="/user/scraper/groups">
                                                            <MessageCircle className="size-4" />
                                                            <span>Grup WhatsApp</span>
                                                        </Link>
                                                    </SidebarMenuSubButton>
                                                ) : (
                                                    <LockedSubMenuButton icon={MessageCircle} label="Grup WhatsApp" />
                                                )}
                                            </SidebarMenuSubItem>
                                        </SidebarMenuSub>
                                    </CollapsibleContent>
                                </SidebarMenuItem>
                            </Collapsible>

                            {/* Broadcast Pesan */}
                            <Collapsible
                                open={openSections.broadcast}
                                onOpenChange={() => toggleSection('broadcast')}
                            >
                                <SidebarMenuItem>
                                    <CollapsibleTrigger asChild>
                                        <SidebarMenuButton
                                            isActive={isBroadcastActive}
                                            className={cn(
                                                'h-10 rounded-lg',
                                                isBroadcastActive && 'bg-primary/10 text-primary font-semibold',
                                                !hasFeature('broadcast_wa') && !hasFeature('broadcast_group') && 'opacity-50'
                                            )}
                                        >
                                            <Megaphone className="size-5" />
                                            <span>Broadcast Pesan</span>
                                            {!hasFeature('broadcast_wa') && !hasFeature('broadcast_group') && <Lock className="size-4 text-muted-foreground" />}
                                            <ChevronRight
                                                className={cn(
                                                    'ml-auto size-4 transition-transform',
                                                    openSections.broadcast && 'rotate-90'
                                                )}
                                            />
                                        </SidebarMenuButton>
                                    </CollapsibleTrigger>
                                    <CollapsibleContent>
                                        <SidebarMenuSub>
                                            <SidebarMenuSubItem>
                                                {hasFeature('broadcast_wa') ? (
                                                    <SidebarMenuSubButton
                                                        asChild
                                                        isActive={isActive('/user/broadcast')}
                                                        className={cn(
                                                            isActive('/user/broadcast') && 'bg-primary/10 text-primary font-semibold'
                                                        )}
                                                    >
                                                        <Link href="/user/broadcast">
                                                            <MessageCircle className="size-4" />
                                                            <span>Broadcast WhatsApp</span>
                                                        </Link>
                                                    </SidebarMenuSubButton>
                                                ) : (
                                                    <LockedSubMenuButton icon={MessageCircle} label="Broadcast WhatsApp" />
                                                )}
                                            </SidebarMenuSubItem>
                                            <SidebarMenuSubItem>
                                                {hasFeature('broadcast_group') ? (
                                                    <SidebarMenuSubButton
                                                        asChild
                                                        isActive={isActive('/user/broadcast/groups')}
                                                        className={cn(
                                                            isActive('/user/broadcast/groups') && 'bg-primary/10 text-primary font-semibold'
                                                        )}
                                                    >
                                                        <Link href="/user/broadcast/groups">
                                                            <Users className="size-4" />
                                                            <span>Broadcast Grup WhatsApp</span>
                                                        </Link>
                                                    </SidebarMenuSubButton>
                                                ) : (
                                                    <LockedSubMenuButton icon={Users} label="Broadcast Grup WhatsApp" />
                                                )}
                                            </SidebarMenuSubItem>
                                            <SidebarMenuSubItem>
                                                {hasFeature('broadcast_wa') ? (
                                                    <SidebarMenuSubButton
                                                        asChild
                                                        isActive={isActive('/user/contact-groups')}
                                                        className={cn(
                                                            isActive('/user/contact-groups') && 'bg-primary/10 text-primary font-semibold'
                                                        )}
                                                    >
                                                        <Link href="/user/contact-groups">
                                                            <Database className="size-4" />
                                                            <span>Kelola Grup Kontak</span>
                                                        </Link>
                                                    </SidebarMenuSubButton>
                                                ) : (
                                                    <LockedSubMenuButton icon={Database} label="Kelola Grup Kontak" />
                                                )}
                                            </SidebarMenuSubItem>
                                        </SidebarMenuSub>
                                    </CollapsibleContent>
                                </SidebarMenuItem>
                            </Collapsible>
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>

                {/* AUTOMASI & AI */}
                <SidebarGroup>
                    <SidebarGroupLabel className="text-xs text-muted-foreground uppercase tracking-wider px-2">
                        Automasi & AI
                    </SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            <Collapsible
                                open={openSections.chatbot}
                                onOpenChange={() => toggleSection('chatbot')}
                            >
                                <SidebarMenuItem>
                                    <CollapsibleTrigger asChild>
                                        <SidebarMenuButton
                                            isActive={isChatbotActive}
                                            className={cn(
                                                'h-10 rounded-lg',
                                                isChatbotActive && 'bg-primary/10 text-primary font-semibold',
                                                !hasFeature('reply_manual') && !hasFeature('chatbot_ai') && 'opacity-50'
                                            )}
                                        >
                                            <Bot className="size-5" />
                                            <span>Chat Otomatis</span>
                                            {!hasFeature('reply_manual') && !hasFeature('chatbot_ai') && <Lock className="size-4 text-muted-foreground" />}
                                            <ChevronRight
                                                className={cn(
                                                    'ml-auto size-4 transition-transform',
                                                    openSections.chatbot && 'rotate-90'
                                                )}
                                            />
                                        </SidebarMenuButton>
                                    </CollapsibleTrigger>
                                    <CollapsibleContent>
                                        <SidebarMenuSub>
                                            <SidebarMenuSubItem>
                                                {hasFeature('reply_manual') ? (
                                                    <SidebarMenuSubButton
                                                        asChild
                                                        isActive={isActive('/user/reply-manual')}
                                                        className={cn(
                                                            isActive('/user/reply-manual')
                                                                ? 'bg-primary/10 text-primary font-semibold'
                                                                : ''
                                                        )}
                                                    >
                                                        <Link href="/user/reply-manual">
                                                            <Reply className="size-4" />
                                                            <span>Reply Manual</span>
                                                        </Link>
                                                    </SidebarMenuSubButton>
                                                ) : (
                                                    <LockedSubMenuButton icon={Reply} label="Reply Manual" />
                                                )}
                                            </SidebarMenuSubItem>
                                            <SidebarMenuSubItem>
                                                {hasFeature('chatbot_ai') ? (
                                                    <SidebarMenuSubButton
                                                        asChild
                                                        isActive={isActive('/user/chatbot')}
                                                        className={cn(
                                                            isActive('/user/chatbot')
                                                                ? 'bg-primary/10 text-primary font-semibold'
                                                                : ''
                                                        )}
                                                    >
                                                        <Link href="/user/chatbot">
                                                            <Bot className="size-4" />
                                                            <span>Chatbot AI Cerdas</span>
                                                        </Link>
                                                    </SidebarMenuSubButton>
                                                ) : (
                                                    <LockedSubMenuButton icon={Bot} label="Chatbot AI Cerdas" />
                                                )}
                                            </SidebarMenuSubItem>
                                        </SidebarMenuSub>
                                    </CollapsibleContent>
                                </SidebarMenuItem>
                            </Collapsible>

                            {/* Human Agents - CRM */}
                            <SidebarMenuItem>
                                {hasFeature('human_agents') ? (
                                    <SidebarMenuButton
                                        asChild
                                        isActive={url.startsWith('/user/human-agents')}
                                        className={cn(
                                            'h-10 rounded-lg',
                                            url.startsWith('/user/human-agents') && 'bg-primary/10 text-primary font-semibold'
                                        )}
                                    >
                                        <Link href="/user/human-agents">
                                            <UserCog className="size-5" />
                                            <span>Human Agents</span>
                                        </Link>
                                    </SidebarMenuButton>
                                ) : (
                                    <LockedMenuButton icon={UserCog} label="Human Agents" />
                                )}
                            </SidebarMenuItem>
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>

                {/* PLATFORM & KONEKSI */}
                <SidebarGroup>
                    <SidebarGroupLabel className="text-xs text-muted-foreground uppercase tracking-wider px-2">
                        Platform & Koneksi
                    </SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            <Collapsible
                                open={openSections.platforms}
                                onOpenChange={() => toggleSection('platforms')}
                            >
                                <SidebarMenuItem>
                                    <CollapsibleTrigger asChild>
                                        <SidebarMenuButton
                                            isActive={isPlatformsActive}
                                            className={cn(
                                                'h-10 rounded-lg',
                                                isPlatformsActive && 'bg-primary/10 text-primary font-semibold',
                                                !hasFeature('platforms') && 'opacity-50'
                                            )}
                                        >
                                            <Layers className="size-5" />
                                            <span>Kelola Platforms</span>
                                            {!hasFeature('platforms') && <Lock className="size-4 text-muted-foreground" />}
                                            <ChevronRight
                                                className={cn(
                                                    'ml-auto size-4 transition-transform',
                                                    openSections.platforms && 'rotate-90'
                                                )}
                                            />
                                        </SidebarMenuButton>
                                    </CollapsibleTrigger>
                                    <CollapsibleContent>
                                        <SidebarMenuSub>
                                            <SidebarMenuSubItem>
                                                {hasFeature('platforms') ? (
                                                    <SidebarMenuSubButton
                                                        asChild
                                                        isActive={url.startsWith('/user/whatsapp')}
                                                        className={cn(
                                                            url.startsWith('/user/whatsapp') && 'bg-primary/10 text-primary font-semibold'
                                                        )}
                                                    >
                                                        <Link href="/user/whatsapp">
                                                            <MessageCircle className="size-4 text-green-600" />
                                                            <span>WhatsApp Personal</span>
                                                        </Link>
                                                    </SidebarMenuSubButton>
                                                ) : (
                                                    <LockedSubMenuButton icon={MessageCircle} label="WhatsApp Personal" iconColor="text-green-600" />
                                                )}
                                            </SidebarMenuSubItem>
                                            <SidebarMenuSubItem>
                                                {hasFeature('platforms') ? (
                                                    <SidebarMenuSubButton
                                                        asChild
                                                        isActive={url.startsWith('/user/telegram')}
                                                        className={cn(
                                                            url.startsWith('/user/telegram') && 'bg-primary/10 text-primary font-semibold'
                                                        )}
                                                    >
                                                        <Link href="/user/telegram">
                                                            <Bot className="size-4 text-blue-500" />
                                                            <span>Telegram Bot</span>
                                                        </Link>
                                                    </SidebarMenuSubButton>
                                                ) : (
                                                    <LockedSubMenuButton icon={Bot} label="Telegram Bot" iconColor="text-blue-500" />
                                                )}
                                            </SidebarMenuSubItem>
                                        </SidebarMenuSub>
                                    </CollapsibleContent>
                                </SidebarMenuItem>
                            </Collapsible>
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>

                {/* TEMPLATE & MEDIA */}
                <SidebarGroup>
                    <SidebarGroupLabel className="text-xs text-muted-foreground uppercase tracking-wider px-2">
                        Template & Media
                    </SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            <Collapsible
                                open={openSections.templates}
                                onOpenChange={() => toggleSection('templates')}
                            >
                                <SidebarMenuItem>
                                    <CollapsibleTrigger asChild>
                                        <SidebarMenuButton
                                            isActive={isTemplatesActive}
                                            className={cn(
                                                'h-10 rounded-lg',
                                                isTemplatesActive && 'bg-primary/10 text-primary font-semibold',
                                                !hasFeature('templates') && 'opacity-50'
                                            )}
                                        >
                                            <FileText className="size-5" />
                                            <span>Template Pesan</span>
                                            {!hasFeature('templates') && <Lock className="size-4 text-muted-foreground" />}
                                            <ChevronRight
                                                className={cn(
                                                    'ml-auto size-4 transition-transform',
                                                    openSections.templates && 'rotate-90'
                                                )}
                                            />
                                        </SidebarMenuButton>
                                    </CollapsibleTrigger>
                                    <CollapsibleContent>
                                        <SidebarMenuSub>
                                            <SidebarMenuSubItem>
                                                {hasFeature('templates') ? (
                                                    <SidebarMenuSubButton
                                                        asChild
                                                        isActive={url.startsWith('/user/templates')}
                                                        className={cn(
                                                            url.startsWith('/user/templates') && 'bg-primary/10 text-primary font-semibold'
                                                        )}
                                                    >
                                                        <Link href="/user/templates?type=whatsapp">
                                                            <MessageCircle className="size-4" />
                                                            <span>Template WhatsApp</span>
                                                        </Link>
                                                    </SidebarMenuSubButton>
                                                ) : (
                                                    <LockedSubMenuButton icon={MessageCircle} label="Template WhatsApp" />
                                                )}
                                            </SidebarMenuSubItem>
                                            {/* Katalog Produk - Hidden for now
                                            <SidebarMenuSubItem>
                                                {hasFeature('templates') ? (
                                                    <SidebarMenuSubButton
                                                        asChild
                                                        isActive={url.startsWith('/user/products')}
                                                    >
                                                        <Link href="/user/products">
                                                            <Package className="size-4" />
                                                            <span>Katalog Produk</span>
                                                        </Link>
                                                    </SidebarMenuSubButton>
                                                ) : (
                                                    <LockedSubMenuButton icon={Package} label="Katalog Produk" />
                                                )}
                                            </SidebarMenuSubItem>
                                            */}
                                        </SidebarMenuSub>
                                    </CollapsibleContent>
                                </SidebarMenuItem>
                            </Collapsible>
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>

                {/* Daftar Kontak */}
                <SidebarGroup>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            <SidebarMenuItem>
                                {hasFeature('master_data') ? (
                                    <SidebarMenuButton
                                        asChild
                                        isActive={isActive('/user/contacts')}
                                        className={cn(
                                            'h-10 rounded-lg',
                                            isActive('/user/contacts') && 'bg-primary/10 text-primary font-semibold'
                                        )}
                                    >
                                        <Link href="/user/contacts">
                                            <Users className="size-5" />
                                            <span>Daftar Kontak</span>
                                        </Link>
                                    </SidebarMenuButton>
                                ) : (
                                    <LockedMenuButton icon={Users} label="Daftar Kontak" />
                                )}
                            </SidebarMenuItem>
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>

                {/* TRANSAKSI - Always accessible */}
                <SidebarGroup>
                    <SidebarGroupLabel className="text-xs text-muted-foreground uppercase tracking-wider px-2">
                        Transaksi
                    </SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            <SidebarMenuItem>
                                <SidebarMenuButton
                                    asChild
                                    isActive={isActive('/user/topup')}
                                    className={cn(
                                        'h-10 rounded-lg',
                                        isActive('/user/topup') && 'bg-primary/10 text-primary font-semibold'
                                    )}
                                >
                                    <Link href="/user/topup">
                                        <ArrowUpCircle className="size-5" />
                                        <span>Upgrade Paket</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                            <SidebarMenuItem>
                                <SidebarMenuButton
                                    asChild
                                    isActive={isActive('/user/transactions') || url.startsWith('/user/transactions/')}
                                    className={cn(
                                        'h-10 rounded-lg',
                                        (isActive('/user/transactions') || url.startsWith('/user/transactions/')) && 'bg-primary/10 text-primary font-semibold'
                                    )}
                                >
                                    <Link href="/user/transactions">
                                        <Receipt className="size-5" />
                                        <span>Riwayat Transaksi</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>

                {/* LAPORAN & MONITORING - Always accessible */}
                <SidebarGroup>
                    <SidebarGroupLabel className="text-xs text-muted-foreground uppercase tracking-wider px-2">
                        Laporan & Monitoring
                    </SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            <SidebarMenuItem>
                                <SidebarMenuButton
                                    asChild
                                    isActive={isActive('/user/reports') || url.startsWith('/user/reports/')}
                                    className={cn(
                                        'h-10 rounded-lg',
                                        (isActive('/user/reports') || url.startsWith('/user/reports/')) && 'bg-primary/10 text-primary font-semibold'
                                    )}
                                >
                                    <Link href="/user/reports">
                                        <BarChart3 className="size-5" />
                                        <span>Laporan</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                            <SidebarMenuItem>
                                <SidebarMenuButton
                                    asChild
                                    isActive={isActive('/user/activity-logs') || url.startsWith('/user/activity-logs/')}
                                    className={cn(
                                        'h-10 rounded-lg',
                                        (isActive('/user/activity-logs') || url.startsWith('/user/activity-logs/')) && 'bg-primary/10 text-primary font-semibold'
                                    )}
                                >
                                    <Link href="/user/activity-logs">
                                        <FileText className="size-5" />
                                        <span>Log Aktivitas</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>

                {/* DUKUNGAN */}
                <SidebarGroup>
                    <SidebarGroupLabel className="text-xs text-muted-foreground uppercase tracking-wider px-2">
                        Dukungan
                    </SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            <SidebarMenuItem>
                                <SidebarMenuButton
                                    asChild
                                    isActive={url.startsWith('/user/guides')}
                                    className={cn(
                                        'h-10 rounded-lg',
                                        url.startsWith('/user/guides') && 'bg-primary/10 text-primary font-semibold'
                                    )}
                                >
                                    <a href="/user/guides" target="_blank" rel="noopener noreferrer">
                                        <BookOpen className="size-5" />
                                        <span>Pusat Bantuan</span>
                                    </a>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>

                {/* PENGATURAN - Always accessible */}
                <SidebarGroup>
                    <SidebarGroupLabel className="text-xs text-muted-foreground uppercase tracking-wider px-2">
                        Pengaturan
                    </SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {/* SMTP Settings - Hidden for now
                            <SidebarMenuItem>
                                <SidebarMenuButton
                                    asChild
                                    isActive={isActive('/user/smtp-settings')}
                                    className="h-10 rounded-lg"
                                >
                                    <Link href="/user/smtp-settings">
                                        <Mail className="size-5" />
                                        <span>Pengaturan SMTP</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
*/}
                            <SidebarMenuItem>
                                <SidebarMenuButton
                                    asChild
                                    isActive={isActive('/user/account')}
                                    className={cn(
                                        'h-10 rounded-lg',
                                        isActive('/user/account') && 'bg-primary/10 text-primary font-semibold'
                                    )}
                                >
                                    <Link href="/user/account">
                                        <Settings className="size-5" />
                                        <span>Setting Aplikasi</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>

            </SidebarContent>

            <SidebarFooter className="border-t p-3">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            onClick={handleLogout}
                            className="h-10 rounded-lg hover:bg-destructive/10 hover:text-destructive"
                        >
                            <LogOut className="size-5" />
                            <span className="font-medium">Keluar</span>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
        </Sidebar>
    )
}
