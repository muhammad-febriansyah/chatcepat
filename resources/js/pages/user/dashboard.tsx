import { Head, Link } from '@inertiajs/react';
import UserLayout from '@/layouts/user/user-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
    MessageSquare,
    Plus,
    Megaphone,
    FileText,
    Play,
    Clock,
    ArrowUpCircle
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

interface Subscription {
    transaction_id: number;
    package_id: number;
    package_name: string;
    package_slug: string;
    features: string[];
    feature_keys: string[];
    paid_at: string;
    expires_at: string;
    days_remaining: number;
}

interface Limits {
    whatsapp_sessions: number | 'unlimited';
    telegram_bots: number | 'unlimited';
}

interface DashboardProps {
    user: UserData;
    subscription: Subscription | null;
    limits: Limits;
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

export default function Dashboard({ user, subscription, limits, stats, recentSessions, recentPlaces, recentBroadcasts }: DashboardProps) {
    // Format limits for display
    const formatLimit = (limit: number | 'unlimited') => {
        return limit === 'unlimited' ? '∞' : limit;
    };

    // Check if user is on trial
    const isTrialUser = subscription && subscription.package_slug === 'trial';
    const daysRemaining = subscription ? Math.ceil(subscription.days_remaining) : 0;

    return (
        <UserLayout>
            <Head title="Dashboard" />

            <div className="space-y-8">
                {/* Trial Countdown Alert */}
                {isTrialUser && daysRemaining > 0 && (
                    <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-amber-500/20 via-orange-500/10 to-transparent p-6 border-2 border-amber-500/50">
                        <div className="flex items-center gap-4">
                            <div className="flex size-12 items-center justify-center rounded-lg bg-amber-500/20">
                                <Clock className="size-6 text-amber-600" />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-lg font-semibold text-amber-900">
                                    Masa Trial Anda akan berakhir dalam {daysRemaining} hari
                                </h3>
                                <p className="text-sm text-amber-700">
                                    Segera lakukan Upgrade Paket untuk menggunakan fitur-fitur terbaik dari ChatCepat.
                                </p>
                            </div>
                            <Link href="/user/topup">
                                <Button className="gap-2 bg-amber-600 hover:bg-amber-700">
                                    <ArrowUpCircle className="size-4" />
                                    Upgrade Sekarang
                                </Button>
                            </Link>
                        </div>
                    </div>
                )}

                {/* Welcome Section */}
                <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-6 border">
                    <div className="absolute inset-0 bg-grid-white/10 [mask-image:radial-gradient(white,transparent_85%)]" />
                    <div className="relative flex items-center justify-between">
                        <div className="flex flex-col gap-2">
                            <h1 className="text-3xl font-bold tracking-tight text-foreground">
                                Selamat datang kembali, {user.name}! 👋
                            </h1>
                            <div className="flex flex-col gap-1">
                                <p className="text-muted-foreground">
                                    Berikut adalah ringkasan akun Anda hari ini
                                </p>
                                <div className="flex items-center gap-2">
                                    <span className="inline-flex items-center gap-1 text-sm text-muted-foreground">
                                        <MessageSquare className="size-3" />
                                        <span>
                                            {stats.whatsapp.connected_sessions > 0 ? 'Akun WhatsApp Business' : 'WhatsApp'}
                                        </span>
                                    </span>
                                    <Badge variant={stats.whatsapp.connected_sessions > 0 ? 'default' : 'secondary'} className={stats.whatsapp.connected_sessions > 0 ? 'bg-green-500/10 text-green-600 hover:bg-green-500/20 border-green-500/20 shadow-none' : ''}>
                                        {stats.whatsapp.connected_sessions > 0 ? 'Terhubung' : 'Tidak Terhubung'}
                                    </Badge>
                                </div>
                            </div>
                        </div>
                        <Link href="/user/broadcast">
                            <Button size="lg" className="gap-2 shadow-lg hover:shadow-xl transition-all">
                                <Plus className="size-4" />
                                Mulai Broadcast
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Main Stats Cards */}
                <div className="grid gap-6 md:grid-cols-3">
                    {/* Broadcasts */}
                    <Card className="overflow-hidden border-2">
                        <div className="h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">
                                Broadcast
                            </CardTitle>
                            <Badge variant="secondary" className="text-xs">
                                30 hari
                            </Badge>
                        </CardHeader>
                        <CardContent>
                            <div className="text-4xl font-bold">{stats.email_broadcast.total}</div>
                            <p className="text-xs text-muted-foreground mt-1">
                                30 hari terakhir
                            </p>
                        </CardContent>
                    </Card>

                    {/* WA Devices */}
                    <Card className="overflow-hidden border-2">
                        <div className="h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">
                                Perangkat WA
                            </CardTitle>
                            <Badge variant="secondary" className="text-xs">
                                Kuota
                            </Badge>
                        </CardHeader>
                        <CardContent>
                            <div className="text-4xl font-bold">
                                {stats.whatsapp.connected_sessions} / {formatLimit(limits.whatsapp_sessions)}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                                {subscription ? `Paket ${subscription.package_name}` : 'Tidak ada paket aktif'}
                            </p>
                        </CardContent>
                    </Card>

                    {/* Auto Reply / Chatbot */}
                    <Card className="overflow-hidden border-2">
                        <div className="h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">
                                Auto Reply
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-4xl font-bold">
                                {stats.templates.whatsapp} / {formatLimit(limits.whatsapp_sessions)}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                                Template per device
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Active Broadcasts */}
                <Card className="overflow-hidden border-2">
                    <div className="h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />
                    <CardHeader className="border-b">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-lg">Broadcast Aktif</CardTitle>
                            <div className="flex gap-2">
                                <Button variant={recentBroadcasts.some(b => b.status === 'completed') ? 'default' : 'secondary'} size="sm">
                                    Resmi
                                </Button>
                                <Button variant="outline" size="sm">
                                    Tidak Resmi
                                </Button>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="pt-6">
                        {recentBroadcasts.length > 0 ? (
                            <div className="space-y-3">
                                {recentBroadcasts.map((broadcast) => (
                                    <div
                                        key={broadcast.id}
                                        className="flex items-center justify-between rounded-lg border p-4 transition-colors hover:bg-accent/50"
                                    >
                                        <div className="flex items-center gap-4 flex-1 min-w-0">
                                            <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
                                                <Megaphone className="size-5 text-primary" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-medium truncate">{broadcast.subject}</p>
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
                                                    ? 'Diproses'
                                                    : broadcast.status === 'failed'
                                                        ? 'Gagal'
                                                        : 'Pending'}
                                        </Badge>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-16">
                                <div className="rounded-full bg-muted p-6 mb-4">
                                    <FileText className="size-12 text-muted-foreground" />
                                </div>
                                <p className="text-base font-medium mb-2">Tidak ada broadcast aktif</p>
                                <p className="text-sm text-muted-foreground mb-6">
                                    Mulai broadcast resmi via WhatsApp Cloud API.
                                </p>
                                <div className="flex gap-3">
                                    <Link href="/user/broadcast">
                                        <Button variant="outline" className="gap-2">
                                            <Play className="size-4" />
                                            Cara Mulai Broadcast
                                        </Button>
                                    </Link>
                                    <Link href="/user/broadcast">
                                        <Button className="gap-2">
                                            Buat Broadcast Resmi
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </UserLayout>
    );
}
