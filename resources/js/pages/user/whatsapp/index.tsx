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
} from 'lucide-react';

interface WhatsAppSession {
    id: number;
    session_id: string;
    phone_number: string;
    name: string;
    status: 'connected' | 'disconnected' | 'qr_pending' | 'failed';
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

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'connected':
                return (
                    <Badge className="flex items-center gap-1 bg-green-500 hover:bg-green-600">
                        <CheckCircle2 className="size-3" />
                        Terhubung
                    </Badge>
                );
            case 'qr_pending':
                return (
                    <Badge className="flex items-center gap-1 bg-yellow-500 hover:bg-yellow-600">
                        <Clock className="size-3" />
                        Menunggu QR
                    </Badge>
                );
            case 'disconnected':
                return (
                    <Badge
                        variant="secondary"
                        className="flex items-center gap-1"
                    >
                        <WifiOff className="size-3" />
                        Terputus
                    </Badge>
                );
            case 'failed':
                return (
                    <Badge
                        variant="destructive"
                        className="flex items-center gap-1"
                    >
                        <AlertCircle className="size-3" />
                        Gagal
                    </Badge>
                );
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    return (
        <UserLayout>
            <Head title="WhatsApp Management" />

            <div className="space-y-6">
                {/* Header with gradient background */}
                <div className="relative overflow-hidden rounded-lg bg-gradient-to-r from-green-500 to-emerald-600 p-8 text-white shadow-lg">
                    <div className="relative z-10 flex items-center justify-between">
                        <div>
                            <div className="mb-2 flex items-center gap-3">
                                <div className="rounded-lg bg-white/20 p-2 backdrop-blur-sm">
                                    <MessageSquare className="size-6" />
                                </div>
                                <h1 className="text-3xl font-bold tracking-tight">
                                    WhatsApp Management
                                </h1>
                            </div>
                            <p className="mt-2 flex items-center gap-2 text-green-50">
                                <span>
                                    Kelola sesi WhatsApp Anda dengan mudah
                                </span>
                                {userRole !== 'admin' && (
                                    <Badge
                                        variant="secondary"
                                        className="border-white/30 bg-white/20 text-white"
                                    >
                                        {sessions.length}/{sessionLimit} Sesi
                                    </Badge>
                                )}
                            </p>
                        </div>
                        {canCreateMore ? (
                            <Link href="/user/whatsapp/create">
                                <Button
                                    size="lg"
                                    className="bg-white text-green-600 shadow-md hover:bg-green-50"
                                >
                                    <Plus className="mr-2 size-5" />
                                    Buat Sesi Baru
                                </Button>
                            </Link>
                        ) : (
                            <Button
                                size="lg"
                                disabled
                                className="bg-white/50 text-green-800"
                                title="Anda sudah mencapai batas maksimal sesi"
                            >
                                <Plus className="mr-2 size-5" />
                                Buat Sesi Baru
                            </Button>
                        )}
                    </div>
                    {/* Decorative elements */}
                    <div className="absolute top-0 right-0 -mt-4 -mr-4 size-32 rounded-full bg-white/10 blur-3xl"></div>
                    <div className="absolute bottom-0 left-0 -mb-4 -ml-4 size-24 rounded-full bg-white/10 blur-2xl"></div>
                </div>

                {/* Session Limit Warning */}
                {!canCreateMore && userRole !== 'admin' && (
                    <Card className="border-yellow-500 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-950 dark:to-orange-950">
                        <CardContent className="pt-6">
                            <div className="flex items-start gap-3">
                                <AlertCircle className="mt-0.5 size-5 flex-shrink-0 text-yellow-600 dark:text-yellow-400" />
                                <div>
                                    <p className="mb-1 font-semibold text-yellow-900 dark:text-yellow-100">
                                        Batas Sesi Tercapai
                                    </p>
                                    <p className="text-sm text-yellow-800 dark:text-yellow-200">
                                        Anda sudah mencapai batas maksimal{' '}
                                        {sessionLimit} sesi WhatsApp untuk akun
                                        user biasa. Untuk membuat lebih banyak
                                        sesi, silakan hubungi admin atau upgrade
                                        ke akun premium.
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Sessions List */}
                {sessions.length > 0 ? (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {sessions.map((session) => (
                            <Card
                                key={session.id}
                                className="group border-l-4 border-l-green-500 transition-all duration-300 hover:shadow-lg"
                            >
                                <CardHeader className="pb-3">
                                    <div className="mb-3 flex items-start justify-between">
                                        <div className="flex flex-1 items-start gap-3">
                                            <div
                                                className={`rounded-lg p-2 ${session.status === 'connected' ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'}`}
                                            >
                                                <Phone className="size-5" />
                                            </div>
                                            <div className="min-w-0 flex-1 space-y-1">
                                                <CardTitle className="truncate text-lg transition-colors group-hover:text-green-600">
                                                    {session.name}
                                                </CardTitle>
                                                <CardDescription className="flex items-center gap-1">
                                                    <Phone className="size-3" />
                                                    {session.phone_number}
                                                </CardDescription>
                                            </div>
                                        </div>
                                        {getStatusBadge(session.status)}
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {/* Stats */}
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="rounded-lg border border-blue-100 bg-gradient-to-br from-blue-50 to-cyan-50 p-3 dark:border-blue-900 dark:from-blue-950/50 dark:to-cyan-950/50">
                                            <div className="mb-1 flex items-center gap-2">
                                                <MessageSquare className="size-4 text-blue-600 dark:text-blue-400" />
                                                <span className="text-xs text-muted-foreground">
                                                    Pesan
                                                </span>
                                            </div>
                                            <p className="text-xl font-bold text-blue-600 dark:text-blue-400">
                                                {session.messages_count || 0}
                                            </p>
                                        </div>
                                        <div className="rounded-lg border border-purple-100 bg-gradient-to-br from-purple-50 to-pink-50 p-3 dark:border-purple-900 dark:from-purple-950/50 dark:to-pink-950/50">
                                            <div className="mb-1 flex items-center gap-2">
                                                <Calendar className="size-4 text-purple-600 dark:text-purple-400" />
                                                <span className="text-xs text-muted-foreground">
                                                    Dibuat
                                                </span>
                                            </div>
                                            <p className="text-xs font-medium text-purple-600 dark:text-purple-400">
                                                {format(
                                                    new Date(
                                                        session.created_at,
                                                    ),
                                                    'dd MMM yyyy',
                                                    { locale: id },
                                                )}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex gap-2 pt-2">
                                        <Link
                                            href={`/user/whatsapp/${session.id}`}
                                            className="flex-1"
                                        >
                                            <Button
                                                variant="default"
                                                className="w-full bg-green-600 hover:bg-green-700"
                                                size="sm"
                                            >
                                                <Eye className="mr-2 size-4" />
                                                Kelola Sesi
                                            </Button>
                                        </Link>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="text-destructive hover:bg-red-50 hover:text-destructive dark:hover:bg-red-950/20"
                                            onClick={() =>
                                                handleDelete(session.id)
                                            }
                                        >
                                            <Trash2 className="size-4" />
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <Card className="border-2 border-dashed bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
                        <CardContent className="flex flex-col items-center justify-center py-20">
                            <div className="mb-4 rounded-full bg-green-100 p-4 dark:bg-green-900/30">
                                <MessageSquare className="size-16 text-green-600 dark:text-green-400" />
                            </div>
                            <h3 className="mb-2 text-center text-2xl font-bold">
                                Belum Ada Sesi WhatsApp
                            </h3>
                            <p className="mb-6 max-w-md text-center text-muted-foreground">
                                Mulai dengan membuat sesi WhatsApp pertama Anda
                                untuk mengelola pesan dan kontak dengan mudah
                            </p>
                            <Link href="/user/whatsapp/create">
                                <Button
                                    size="lg"
                                    className="bg-green-600 shadow-md hover:bg-green-700"
                                >
                                    <Plus className="mr-2 size-5" />
                                    Buat Sesi Pertama
                                </Button>
                            </Link>
                            <div className="mt-8 flex items-center gap-8 text-sm text-muted-foreground">
                                <div className="flex items-center gap-2">
                                    <CheckCircle2 className="size-4 text-green-600" />
                                    <span>Mudah digunakan</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <CheckCircle2 className="size-4 text-green-600" />
                                    <span>Aman & Terpercaya</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <CheckCircle2 className="size-4 text-green-600" />
                                    <span>Kelola Pesan</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </UserLayout>
    );
}
