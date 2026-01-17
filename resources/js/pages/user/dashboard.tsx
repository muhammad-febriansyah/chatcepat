import { Head, Link } from '@inertiajs/react';
import UserLayout from '@/layouts/user/user-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
    MessageSquare,
    MapPin,
    Users,
    TrendingUp,
    Activity,
    ArrowUpRight,
    Database,
    FileText,
    Mail,
    Settings,
    Send,
    CheckCircle,
    Plus,
    Megaphone,
    Bot,
    MessageCircle,
    ArrowRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface UserData {
    name: string;
    email: string;
    phone: string | null;
    nama_bisnis: string | null;
    kategori_bisnis: string | null;
    address: string | null;
}

interface WhatsAppSession {
    id: number;
    session_id: string;
    phone_number: string;
    name: string;
    status: string;
    messages_count?: number;
}

interface ScrapedPlace {
    id: number;
    name: string;
    location: string;
    category?: {
        name: string;
    };
}

interface EmailBroadcastItem {
    id: number;
    subject: string;
    total_recipients: number;
    sent_count: number;
    status: string;
    created_at: string;
    smtp_setting: {
        name: string;
        from_address: string;
    } | null;
}

interface DashboardProps {
    user: UserData;
    stats: {
        whatsapp: {
            total_sessions: number;
            connected_sessions: number;
            total_messages: number;
        };
        scraping: {
            total_places: number;
        };
        contacts: {
            total: number;
        };
        templates: {
            total: number;
            whatsapp: number;
            email: number;
        };
        smtp: {
            total: number;
            verified: number;
            has_active: boolean;
        };
        email_broadcast: {
            total: number;
            completed: number;
        };
    };
    recentSessions: WhatsAppSession[];
    recentPlaces: ScrapedPlace[];
    recentBroadcasts: EmailBroadcastItem[];
}

export default function Dashboard({ user, stats, recentSessions, recentPlaces, recentBroadcasts }: DashboardProps) {
    const quickActions = [
        {
            title: 'Kirim Broadcast WA',
            description: 'Kirim pesan ke banyak kontak',
            icon: Megaphone,
            href: '/user/broadcast',
            color: 'bg-primary/10 text-primary',
        },
        {
            title: 'Broadcast Email',
            description: 'Kirim email massal',
            icon: Mail,
            href: '/user/email-broadcast',
            color: 'bg-blue-50 text-blue-600',
        },
        {
            title: 'Scraping Maps',
            description: 'Cari data bisnis',
            icon: MapPin,
            href: '/user/scraper/create',
            color: 'bg-orange-50 text-orange-600',
        },
        {
            title: 'Chatbot AI',
            description: 'Aktifkan auto reply',
            icon: Bot,
            href: '/user/chatbot',
            color: 'bg-purple-50 text-purple-600',
        },
    ];

    return (
        <UserLayout>
            <Head title="Dashboard" />

            <div className="space-y-8">
                {/* Welcome Section */}
                <div className="flex flex-col gap-2">
                    <h1 className="text-4xl font-bold tracking-tight">
                        Halo, {user.name} 👋
                    </h1>
                    <p className="text-lg text-muted-foreground">
                        {user.nama_bisnis ? (
                            <>Selamat datang kembali di <span className="font-semibold text-foreground">{user.nama_bisnis}</span></>
                        ) : (
                            'Kelola aktivitas WhatsApp dan Email broadcast Anda dengan mudah'
                        )}
                    </p>
                </div>

                {/* Quick Actions */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {quickActions.map((action) => (
                        <Link key={action.href} href={action.href}>
                            <Card className="group cursor-pointer transition-all hover:shadow-lg hover:scale-105">
                                <CardHeader className="flex flex-row items-center gap-4 pb-2">
                                    <div className={`rounded-xl p-3 ${action.color}`}>
                                        <action.icon className="size-6" />
                                    </div>
                                    <div className="flex-1">
                                        <CardTitle className="text-base group-hover:text-primary transition-colors">
                                            {action.title}
                                        </CardTitle>
                                        <CardDescription className="text-xs mt-0.5">
                                            {action.description}
                                        </CardDescription>
                                    </div>
                                    <ArrowRight className="size-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                                </CardHeader>
                            </Card>
                        </Link>
                    ))}
                </div>

                {/* Stats Cards */}
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                    {/* WhatsApp Sessions */}
                    <Card className="border-l-4 border-l-primary">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <div className="space-y-1">
                                <CardTitle className="text-sm font-medium text-muted-foreground">
                                    WhatsApp Sessions
                                </CardTitle>
                                <div className="text-3xl font-bold">{stats.whatsapp.total_sessions}</div>
                            </div>
                            <div className="rounded-xl bg-primary/10 p-3">
                                <MessageSquare className="size-6 text-primary" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center gap-2">
                                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                    {stats.whatsapp.connected_sessions} aktif
                                </Badge>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Contacts */}
                    <Card className="border-l-4 border-l-blue-500">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <div className="space-y-1">
                                <CardTitle className="text-sm font-medium text-muted-foreground">
                                    Total Kontak
                                </CardTitle>
                                <div className="text-3xl font-bold">{stats.contacts.total}</div>
                            </div>
                            <div className="rounded-xl bg-blue-50 p-3">
                                <Database className="size-6 text-blue-600" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground">
                                Master data kontak
                            </p>
                        </CardContent>
                    </Card>

                    {/* Templates */}
                    <Card className="border-l-4 border-l-purple-500">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <div className="space-y-1">
                                <CardTitle className="text-sm font-medium text-muted-foreground">
                                    Template Pesan
                                </CardTitle>
                                <div className="text-3xl font-bold">{stats.templates.total}</div>
                            </div>
                            <div className="rounded-xl bg-purple-50 p-3">
                                <FileText className="size-6 text-purple-600" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center gap-2">
                                <Badge variant="outline" className="text-xs">
                                    {stats.templates.whatsapp} WA
                                </Badge>
                                <Badge variant="outline" className="text-xs">
                                    {stats.templates.email} Email
                                </Badge>
                            </div>
                        </CardContent>
                    </Card>

                    {/* SMTP Settings */}
                    <Card className="border-l-4 border-l-orange-500">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <div className="space-y-1">
                                <CardTitle className="text-sm font-medium text-muted-foreground">
                                    SMTP Settings
                                </CardTitle>
                                <div className="text-3xl font-bold">{stats.smtp.total}</div>
                            </div>
                            <div className="rounded-xl bg-orange-50 p-3">
                                <Settings className="size-6 text-orange-600" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <Badge variant={stats.smtp.has_active ? 'default' : 'secondary'} className={stats.smtp.has_active ? 'bg-green-500' : ''}>
                                {stats.smtp.has_active ? 'Active' : 'No Active SMTP'}
                            </Badge>
                        </CardContent>
                    </Card>

                    {/* Scraping Data */}
                    <Card className="border-l-4 border-l-cyan-500">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <div className="space-y-1">
                                <CardTitle className="text-sm font-medium text-muted-foreground">
                                    Data Scraping
                                </CardTitle>
                                <div className="text-3xl font-bold">{stats.scraping.total_places}</div>
                            </div>
                            <div className="rounded-xl bg-cyan-50 p-3">
                                <MapPin className="size-6 text-cyan-600" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground">
                                Tempat tersimpan
                            </p>
                        </CardContent>
                    </Card>

                    {/* Email Broadcasts */}
                    <Card className="border-l-4 border-l-pink-500">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <div className="space-y-1">
                                <CardTitle className="text-sm font-medium text-muted-foreground">
                                    Email Broadcast
                                </CardTitle>
                                <div className="text-3xl font-bold">{stats.email_broadcast.total}</div>
                            </div>
                            <div className="rounded-xl bg-pink-50 p-3">
                                <Send className="size-6 text-pink-600" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center gap-2">
                                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                    <CheckCircle className="size-3 mr-1" />
                                    {stats.email_broadcast.completed} selesai
                                </Badge>
                            </div>
                        </CardContent>
                    </Card>

                    {/* WhatsApp Messages */}
                    <Card className="border-l-4 border-l-indigo-500">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <div className="space-y-1">
                                <CardTitle className="text-sm font-medium text-muted-foreground">
                                    Total Pesan WA
                                </CardTitle>
                                <div className="text-3xl font-bold">{stats.whatsapp.total_messages}</div>
                            </div>
                            <div className="rounded-xl bg-indigo-50 p-3">
                                <Activity className="size-6 text-indigo-600" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground">
                                Terkirim & diterima
                            </p>
                        </CardContent>
                    </Card>

                    {/* Account Status */}
                    <Card className="border-l-4 border-l-green-500">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <div className="space-y-1">
                                <CardTitle className="text-sm font-medium text-muted-foreground">
                                    Status Akun
                                </CardTitle>
                                <div className="text-3xl font-bold">Aktif</div>
                            </div>
                            <div className="rounded-xl bg-green-50 p-3">
                                <TrendingUp className="size-6 text-green-600" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <Badge variant="secondary">
                                {user.kategori_bisnis || 'User Regular'}
                            </Badge>
                        </CardContent>
                    </Card>
                </div>

                {/* Recent Activities */}
                <div className="grid gap-6 md:grid-cols-2">
                    {/* Recent WhatsApp Sessions */}
                    <Card className="shadow-sm">
                        <CardHeader className="border-b">
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="text-lg">Sesi WhatsApp</CardTitle>
                                    <CardDescription className="mt-1">
                                        Aktivitas terbaru
                                    </CardDescription>
                                </div>
                                <Link href="/user/whatsapp">
                                    <Button variant="ghost" size="sm" className="gap-1">
                                        Lihat Semua
                                        <ArrowUpRight className="size-3" />
                                    </Button>
                                </Link>
                            </div>
                        </CardHeader>
                        <CardContent className="pt-6">
                            {recentSessions.length > 0 ? (
                                <div className="space-y-3">
                                    {recentSessions.map((session) => (
                                        <div
                                            key={session.id}
                                            className="flex items-center justify-between rounded-xl border p-4 transition-colors hover:bg-accent/50"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="flex size-12 items-center justify-center rounded-full bg-primary/10">
                                                    <MessageSquare className="size-5 text-primary" />
                                                </div>
                                                <div>
                                                    <p className="font-semibold">{session.name}</p>
                                                    <p className="text-sm text-muted-foreground">
                                                        {session.phone_number}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <div className="text-right">
                                                    <p className="text-sm font-medium">{session.messages_count || 0}</p>
                                                    <p className="text-xs text-muted-foreground">pesan</p>
                                                </div>
                                                <Badge
                                                    variant={session.status === 'connected' ? 'default' : 'secondary'}
                                                    className={
                                                        session.status === 'connected'
                                                            ? 'bg-green-500'
                                                            : session.status === 'qr_pending'
                                                            ? 'bg-yellow-500'
                                                            : ''
                                                    }
                                                >
                                                    {session.status === 'connected'
                                                        ? 'Aktif'
                                                        : session.status === 'qr_pending'
                                                        ? 'Pending'
                                                        : 'Offline'}
                                                </Badge>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-12">
                                    <div className="rounded-full bg-muted p-4 mb-4">
                                        <MessageSquare className="size-8 text-muted-foreground" />
                                    </div>
                                    <p className="text-sm font-medium mb-1">Belum ada sesi WhatsApp</p>
                                    <p className="text-sm text-muted-foreground mb-4">Mulai dengan membuat sesi baru</p>
                                    <Link href="/user/whatsapp">
                                        <Button size="sm">
                                            <Plus className="size-4 mr-2" />
                                            Buat Sesi Baru
                                        </Button>
                                    </Link>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Recent Email Broadcasts */}
                    <Card className="shadow-sm">
                        <CardHeader className="border-b">
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="text-lg">Email Broadcast</CardTitle>
                                    <CardDescription className="mt-1">
                                        Broadcast terbaru
                                    </CardDescription>
                                </div>
                                <Link href="/user/email-broadcast/history">
                                    <Button variant="ghost" size="sm" className="gap-1">
                                        Lihat Semua
                                        <ArrowUpRight className="size-3" />
                                    </Button>
                                </Link>
                            </div>
                        </CardHeader>
                        <CardContent className="pt-6">
                            {recentBroadcasts.length > 0 ? (
                                <div className="space-y-3">
                                    {recentBroadcasts.map((broadcast) => (
                                        <div
                                            key={broadcast.id}
                                            className="flex items-center justify-between rounded-xl border p-4 transition-colors hover:bg-accent/50"
                                        >
                                            <div className="flex items-center gap-4 flex-1 min-w-0">
                                                <div className="flex size-12 items-center justify-center rounded-full bg-pink-50">
                                                    <Mail className="size-5 text-pink-600" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-semibold truncate">{broadcast.subject}</p>
                                                    <p className="text-sm text-muted-foreground">
                                                        {broadcast.sent_count}/{broadcast.total_recipients} terkirim
                                                    </p>
                                                </div>
                                            </div>
                                            <Badge
                                                variant={broadcast.status === 'completed' ? 'default' : 'secondary'}
                                                className={
                                                    broadcast.status === 'completed'
                                                        ? 'bg-green-500'
                                                        : broadcast.status === 'processing'
                                                        ? 'bg-blue-500'
                                                        : broadcast.status === 'failed'
                                                        ? 'bg-red-500'
                                                        : ''
                                                }
                                            >
                                                {broadcast.status === 'completed'
                                                    ? 'Selesai'
                                                    : broadcast.status === 'processing'
                                                    ? 'Proses'
                                                    : broadcast.status === 'failed'
                                                    ? 'Gagal'
                                                    : 'Pending'}
                                            </Badge>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-12">
                                    <div className="rounded-full bg-muted p-4 mb-4">
                                        <Mail className="size-8 text-muted-foreground" />
                                    </div>
                                    <p className="text-sm font-medium mb-1">Belum ada broadcast email</p>
                                    <p className="text-sm text-muted-foreground mb-4">Mulai kirim email broadcast</p>
                                    <Link href="/user/email-broadcast">
                                        <Button size="sm">
                                            <Plus className="size-4 mr-2" />
                                            Kirim Broadcast
                                        </Button>
                                    </Link>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Recent Scraped Places */}
                <Card className="shadow-sm">
                    <CardHeader className="border-b">
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="text-lg">Hasil Scraping Terbaru</CardTitle>
                                <CardDescription className="mt-1">
                                    Data Google Maps yang baru di-scrape
                                </CardDescription>
                            </div>
                            <Link href="/user/scraper">
                                <Button variant="ghost" size="sm" className="gap-1">
                                    Lihat Semua
                                    <ArrowUpRight className="size-3" />
                                </Button>
                            </Link>
                        </div>
                    </CardHeader>
                    <CardContent className="pt-6">
                        {recentPlaces.length > 0 ? (
                            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                                {recentPlaces.map((place) => (
                                    <div
                                        key={place.id}
                                        className="flex items-center gap-4 rounded-xl border p-4 transition-colors hover:bg-accent/50"
                                    >
                                        <div className="flex size-12 items-center justify-center rounded-full bg-orange-50 shrink-0">
                                            <MapPin className="size-5 text-orange-600" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-semibold truncate">{place.name}</p>
                                            <p className="text-sm text-muted-foreground truncate">
                                                {place.location}
                                            </p>
                                            {place.category && (
                                                <Badge variant="outline" className="mt-1 text-xs">
                                                    {place.category.name}
                                                </Badge>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-12">
                                <div className="rounded-full bg-muted p-4 mb-4">
                                    <MapPin className="size-8 text-muted-foreground" />
                                </div>
                                <p className="text-sm font-medium mb-1">Belum ada hasil scraping</p>
                                <p className="text-sm text-muted-foreground mb-4">Mulai scraping tempat baru dari Google Maps</p>
                                <Link href="/user/scraper/create">
                                    <Button size="sm">
                                        <Plus className="size-4 mr-2" />
                                        Mulai Scraping
                                    </Button>
                                </Link>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </UserLayout>
    );
}
