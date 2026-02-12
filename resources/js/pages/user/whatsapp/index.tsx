import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import UserLayout from '@/layouts/user/user-layout';
import { Head, Link, router } from '@inertiajs/react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import {
    AlertCircle,
    Calendar,
    CheckCircle2,
    Clock,
    Eye,
    MessageSquare,
    Phone,
    Plus,
    Trash2,
    WifiOff,
    Smartphone,
    Wifi,
    Settings,
    Zap,
    RotateCcw,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface WhatsAppSession {
    id: number;
    session_id: string;
    phone_number: string;
    name: string;
    status: 'connected' | 'disconnected' | 'qr_pending' | 'failed' | 'connecting';
    messages_count?: number;
    created_at: string;
}

interface WhatsAppIndexProps {
    sessions: WhatsAppSession[];
    canCreateMore: boolean;
    userRole: string;
    sessionLimit: number | string;
}

export default function WhatsAppIndex({
    sessions,
    canCreateMore,
    userRole,
    sessionLimit,
}: WhatsAppIndexProps) {
    const handleDelete = (sessionId: number) => {
        if (confirm('Apakah Anda yakin ingin menghapus sesi WhatsApp ini?')) {
            router.delete(`/user/whatsapp/${sessionId}`);
        }
    };

    // Calculate max slots to show based on session limit
    const maxSlots = userRole === 'admin' ? Math.max(6, sessions.length + 3) :
        typeof sessionLimit === 'number' ? Math.max(sessionLimit, sessions.length) : 6;

    // Create array of slots with sessions and empty slots
    const slots = Array.from({ length: maxSlots }, (_, index) => {
        return sessions[index] || null;
    });

    const getStatusInfo = (status: string) => {
        switch (status) {
            case 'connected':
                return {
                    badge: <Badge className="bg-green-500 hover:bg-green-600"><Wifi className="size-3 mr-1" />Terhubung</Badge>,
                    color: 'border-green-500',
                    bg: 'bg-green-50',
                    icon: 'bg-green-100 text-green-600',
                };
            case 'qr_pending':
                return {
                    badge: <Badge className="bg-yellow-500 hover:bg-yellow-600"><Clock className="size-3 mr-1" />Menunggu QR</Badge>,
                    color: 'border-yellow-500',
                    bg: 'bg-yellow-50',
                    icon: 'bg-yellow-100 text-yellow-600',
                };
            case 'disconnected':
                return {
                    badge: <Badge variant="secondary"><WifiOff className="size-3 mr-1" />Terputus</Badge>,
                    color: 'border-gray-300',
                    bg: 'bg-gray-50',
                    icon: 'bg-gray-100 text-gray-600',
                };
            case 'connecting':
                return {
                    badge: <Badge className="bg-blue-500 hover:bg-blue-600"><RotateCcw className="size-3 mr-1 animate-spin" />Menghubungkan...</Badge>,
                    color: 'border-blue-400',
                    bg: 'bg-blue-50',
                    icon: 'bg-blue-100 text-blue-600',
                };
            case 'failed':
                return {
                    badge: <Badge variant="destructive"><AlertCircle className="size-3 mr-1" />Gagal</Badge>,
                    color: 'border-red-500',
                    bg: 'bg-red-50',
                    icon: 'bg-red-100 text-red-600',
                };
            default:
                return {
                    badge: <Badge variant="outline">{status}</Badge>,
                    color: 'border-gray-300',
                    bg: 'bg-gray-50',
                    icon: 'bg-gray-100 text-gray-600',
                };
        }
    };

    return (
        <UserLayout>
            <Head title="WhatsApp Management" />

            <div className="space-y-4">
                {/* Header */}
                <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-6 border">
                    <div className="absolute inset-0 bg-grid-white/10 [mask-image:radial-gradient(white,transparent_85%)]" />
                    <div className="relative flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight text-foreground">
                                Koneksi Platform
                            </h1>
                            <p className="text-muted-foreground mt-1">
                                Kelola koneksi WhatsApp dan status perangkat Anda
                            </p>
                        </div>
                        <div className="flex gap-3">
                            {userRole !== 'admin' && (
                                <Badge variant="secondary" className="px-3">
                                    Kuota: {sessions.length} / {sessionLimit}
                                </Badge>
                            )}
                            {canCreateMore && (
                                <Link href="/user/whatsapp/create">
                                    <Button size="lg" className="gap-2">
                                        <Plus className="size-4" />
                                        Tambah Perangkat
                                    </Button>
                                </Link>
                            )}
                        </div>
                    </div>
                </div>

                {/* Device Slots Grid */}
                <Card className="overflow-hidden border-2">
                    <div className="h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />
                    <CardHeader className="border-b pb-3">
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="flex items-center gap-2">
                                    <Smartphone className="size-5 text-primary" />
                                    Perangkat WhatsApp
                                </CardTitle>
                                <CardDescription>
                                    {sessions.filter(s => s.status === 'connected').length} dari {sessions.length} perangkat terhubung
                                </CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <div className="grid gap-3 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                            {slots.map((session, index) => (
                                session ? (
                                    // Connected/Active Session Card
                                    <Card
                                        key={session.id}
                                        className={cn(
                                            "border-l-4 transition-all hover:shadow-md cursor-pointer",
                                            getStatusInfo(session.status).color,
                                            getStatusInfo(session.status).bg
                                        )}
                                        onClick={() => router.visit(`/user/whatsapp/${session.id}`)}
                                    >
                                        <CardContent className="p-4">
                                            <div className="flex items-start justify-between mb-3">
                                                <div className={cn(
                                                    "p-2 rounded-lg",
                                                    getStatusInfo(session.status).icon
                                                )}>
                                                    <Phone className="size-5" />
                                                </div>
                                                {getStatusInfo(session.status).badge}
                                            </div>

                                            <div className="space-y-1">
                                                <h3 className="font-semibold text-base truncate">
                                                    {session.name}
                                                </h3>
                                                <p className="text-xs text-muted-foreground flex items-center gap-1">
                                                    <Phone className="size-3" />
                                                    {session.phone_number || 'Tidak ada nomor'}
                                                </p>
                                            </div>

                                            <div className="flex items-center gap-3 mt-3 pt-3 border-t text-xs text-muted-foreground">
                                                <div className="flex items-center gap-1">
                                                    <MessageSquare className="size-3" />
                                                    <span>{session.messages_count || 0}</span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <Calendar className="size-3" />
                                                    <span>
                                                        {format(new Date(session.created_at), 'dd MMM', { locale: id })}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="flex gap-2 mt-3">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="flex-1 h-8 text-xs"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        router.visit(`/user/whatsapp/${session.id}`);
                                                    }}
                                                >
                                                    <Settings className="size-3 mr-1" />
                                                    Kelola
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="flex-1 h-8 text-xs"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        router.visit(`/user/whatsapp/${session.id}/auto-replies`);
                                                    }}
                                                >
                                                    <Zap className="size-3 mr-1" />
                                                    Auto Reply
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="text-destructive hover:bg-red-50 h-8 px-2"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleDelete(session.id);
                                                    }}
                                                >
                                                    <Trash2 className="size-3" />
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ) : (
                                    // Empty Slot Card
                                    <Card
                                        key={`empty-${index}`}
                                        className="border-2 border-dashed border-gray-200 bg-gray-50/50 hover:border-green-300 hover:bg-green-50/30 transition-all"
                                    >
                                        <CardContent className="flex flex-col items-center justify-center py-8">
                                            <div className="p-3 rounded-full bg-gray-100 mb-3">
                                                <Plus className="size-6 text-gray-400" />
                                            </div>
                                            <p className="text-muted-foreground text-sm font-medium mb-3">
                                                Slot Kosong
                                            </p>
                                            {canCreateMore ? (
                                                <Link href="/user/whatsapp/create">
                                                    <Button variant="outline" size="sm">
                                                        Tambah Akun
                                                    </Button>
                                                </Link>
                                            ) : (
                                                <Button variant="outline" size="sm" disabled>
                                                    Slot Penuh
                                                </Button>
                                            )}
                                        </CardContent>
                                    </Card>
                                )
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Session Limit Warning */}
                {!canCreateMore && userRole !== 'admin' && (
                    <Card className="border-yellow-200 bg-gradient-to-r from-yellow-50 to-orange-50">
                        <CardContent className="p-4">
                            <div className="flex items-start gap-3">
                                <AlertCircle className="mt-0.5 size-4 flex-shrink-0 text-yellow-600" />
                                <div className="flex-1">
                                    <p className="mb-1 font-semibold text-sm text-yellow-900">
                                        Batas Slot Tercapai
                                    </p>
                                    <p className="text-xs text-yellow-800">
                                        Anda sudah mencapai batas maksimal {sessionLimit} slot WhatsApp.
                                        Untuk menambah slot, silakan upgrade ke paket yang lebih tinggi.
                                    </p>
                                    <Link href="/user/topup" className="mt-2 inline-block">
                                        <Button size="sm" variant="outline" className="h-8 text-xs border-yellow-600 text-yellow-700 hover:bg-yellow-100">
                                            Upgrade Paket
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Quick Tips */}
                <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
                    <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                            <div className="p-2 rounded-full bg-green-100">
                                <CheckCircle2 className="size-4 text-green-600" />
                            </div>
                            <div className="flex-1">
                                <h3 className="font-semibold text-sm text-green-900 mb-1.5">Tips Penggunaan</h3>
                                <ul className="text-xs text-green-800 space-y-0.5">
                                    <li>• Klik "Tambah Perangkat" untuk menambah WhatsApp baru</li>
                                    <li>• Scan QR Code dari aplikasi WhatsApp di HP Anda</li>
                                    <li>• Setelah terhubung, atur Auto-Reply dan fitur lainnya</li>
                                    <li>• Gunakan "Reply Manual" untuk chat langsung dengan pelanggan</li>
                                </ul>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </UserLayout>
    );
}
