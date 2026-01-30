import { useState, useEffect, useCallback } from 'react';
import { Head, router } from '@inertiajs/react';
import UserLayout from '@/layouts/user/user-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { DataTable } from '@/components/ui/data-table';
import { columns, Message } from './columns';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { io, Socket } from 'socket.io-client';
import {
    ArrowLeft,
    MessageSquare,
    Users,
    Wifi,
    WifiOff,
    Trash2,
    Phone,
    Calendar,
    Activity,
    RefreshCw,
    Loader2,
    CheckCircle2,
    XCircle,
    Clock,
    Smartphone,
    QrCode,
    Info,
    Send,
    Inbox,
    List,
    AlertTriangle,
    X,
    Zap,
    Bot,
    Settings,
    UserPlus
} from 'lucide-react';

interface WhatsAppSession {
    id: number;
    session_id: string;
    phone_number: string;
    name: string;
    status: 'connected' | 'disconnected' | 'qr_pending' | 'failed' | 'connecting';
    qr_code?: string;
    created_at: string;
    updated_at: string;
    messages?: Message[];
    settings?: {
        autoReplyEnabled?: boolean;
        autoSaveContacts?: boolean;
    };
}

interface ShowProps {
    session: WhatsAppSession;
    stats: {
        messages: number;
        contacts: number;
    };
    userId: number;
    gatewayUrl: string;
}

export default function WhatsAppShow({ session, stats, userId, gatewayUrl }: ShowProps) {
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [autoRefreshCounter, setAutoRefreshCounter] = useState(0);
    const [socket, setSocket] = useState<Socket | null>(null);
    const [connectionError, setConnectionError] = useState<{ message: string; code?: number } | null>(null);
    const [realtimeQRCode, setRealtimeQRCode] = useState<string | null>(null);
    const [isConnectedRealtime, setIsConnectedRealtime] = useState(false);

    // Connect to Socket.IO for real-time updates
    useEffect(() => {
        const wsUrl = gatewayUrl || 'http://localhost:3000';
        const wsUserId = userId || 1;

        console.log(`🔌 Connecting to Socket.IO at ${wsUrl} with userId ${wsUserId}`);

        const newSocket = io(wsUrl, {
            query: { userId: wsUserId },
            transports: ['websocket', 'polling'],
        });

        newSocket.on('connect', () => {
            console.log('✅ Socket.IO connected');
            // Subscribe to this session's events
            newSocket.emit('subscribe:session', session.session_id);
        });

        newSocket.on('disconnect', () => {
            console.log('❌ Socket.IO disconnected');
        });

        // Listen for QR code updates
        newSocket.on('session:qr', (data: { sessionId: string; qrCodeDataURL: string }) => {
            console.log('📱 Received QR code via WebSocket');
            if (data.sessionId === session.session_id) {
                setRealtimeQRCode(data.qrCodeDataURL);
                setConnectionError(null); // Clear any previous error
            }
        });

        // Listen for connection success
        newSocket.on('session:connected', (data: { sessionId: string; phoneNumber: string }) => {
            console.log('✅ Session connected via WebSocket');
            if (data.sessionId === session.session_id) {
                setIsConnectedRealtime(true);
                setConnectionError(null);
                setRealtimeQRCode(null);
                // Reload page to get updated data
                router.reload({ preserveScroll: true });
            }
        });

        // Listen for connection failure
        newSocket.on('session:connection_failed', (data: { sessionId: string; reason: string; errorCode?: number }) => {
            console.log('❌ Connection failed via WebSocket:', data.reason);
            if (data.sessionId === session.session_id) {
                setConnectionError({ message: data.reason, code: data.errorCode });
                setRealtimeQRCode(null);
                // Reload to get updated status
                setTimeout(() => {
                    router.reload({ preserveScroll: true });
                }, 2000);
            }
        });

        // Listen for disconnection
        newSocket.on('session:disconnected', (data: { sessionId: string; reason: string }) => {
            console.log('🔌 Session disconnected via WebSocket:', data.reason);
            if (data.sessionId === session.session_id) {
                setIsConnectedRealtime(false);
                router.reload({ preserveScroll: true });
            }
        });

        setSocket(newSocket);

        return () => {
            newSocket.emit('unsubscribe:session', session.session_id);
            newSocket.disconnect();
        };
    }, [session.session_id, gatewayUrl, userId]);

    // Auto-refresh when status is qr_pending but no QR code yet (fallback)
    useEffect(() => {
        if (session.status === 'qr_pending' && !session.qr_code && !realtimeQRCode) {
            const interval = setInterval(() => {
                setAutoRefreshCounter(prev => prev + 1);
                router.reload({ only: ['session'], preserveScroll: true });
            }, 3000); // Refresh every 3 seconds

            return () => clearInterval(interval);
        }
    }, [session.status, session.qr_code, realtimeQRCode]);

    // Use realtime QR code if available, otherwise use from props
    const displayQRCode = realtimeQRCode || session.qr_code;

    const handleConnect = () => {
        setIsRefreshing(true);
        router.post(`/user/whatsapp/${session.id}/connect`, {}, {
            onSuccess: () => {
                // Reload entire page to get updated session and QR code
                window.location.reload();
            },
            onError: () => {
                setIsRefreshing(false);
            },
        });
    };

    const handleRefreshQR = () => {
        setIsRefreshing(true);
        router.post(`/user/whatsapp/${session.id}/connect`, {}, {
            onSuccess: () => {
                // Reload entire page to get updated session and QR code
                window.location.reload();
            },
            onError: () => {
                setIsRefreshing(false);
            },
        });
    };

    const handleDisconnect = () => {
        if (confirm('Apakah Anda yakin ingin memutuskan koneksi sesi ini?')) {
            router.post(`/user/whatsapp/${session.id}/disconnect`, {}, {
                onSuccess: () => {
                    // Reload entire page to get updated session status
                    window.location.reload();
                },
            });
        }
    };

    const handleDelete = () => {
        if (confirm('Apakah Anda yakin ingin menghapus sesi WhatsApp ini?')) {
            router.delete(`/user/whatsapp/${session.id}`, {
                onSuccess: () => {
                    router.visit('/user/whatsapp');
                },
            });
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'connected':
                return (
                    <Badge className="bg-green-500 hover:bg-green-600 text-white flex items-center gap-1.5">
                        <CheckCircle2 className="size-3.5" />
                        Terhubung
                    </Badge>
                );
            case 'qr_pending':
                return (
                    <Badge className="bg-yellow-500 hover:bg-yellow-600 text-white flex items-center gap-1.5 animate-pulse">
                        <Clock className="size-3.5" />
                        Menunggu QR
                    </Badge>
                );
            case 'disconnected':
                return (
                    <Badge variant="secondary" className="flex items-center gap-1.5">
                        <XCircle className="size-3.5" />
                        Terputus
                    </Badge>
                );
            case 'failed':
                return (
                    <Badge variant="destructive" className="flex items-center gap-1.5">
                        <XCircle className="size-3.5" />
                        Gagal
                    </Badge>
                );
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'connected':
                return 'from-green-500 to-emerald-600';
            case 'qr_pending':
                return 'from-yellow-500 to-orange-500';
            case 'disconnected':
                return 'from-gray-400 to-gray-500';
            case 'failed':
                return 'from-red-500 to-red-600';
            default:
                return 'from-gray-400 to-gray-500';
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString('id-ID', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <UserLayout>
            <Head title={`Detail Sesi - ${session.name}`} />

            <div className="space-y-6 overflow-x-hidden">
                {/* Header with Gradient */}
                <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-6 border">
                    <div className="absolute inset-0 bg-grid-white/10 [mask-image:radial-gradient(white,transparent_85%)]" />
                    <div className="relative flex items-center gap-4">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => router.visit('/user/whatsapp')}
                            className="hover:bg-white/50"
                        >
                            <ArrowLeft className="size-5" />
                        </Button>
                        <div className="flex-1">
                            <h1 className="text-3xl font-bold tracking-tight text-foreground">
                                Detail Sesi WhatsApp
                            </h1>
                            <p className="text-muted-foreground mt-1">
                                Kelola dan monitor sesi WhatsApp Business Anda
                            </p>
                        </div>
                        {getStatusBadge(session.status)}
                    </div>
                </div>

                {/* Connection Error Alert */}
                {connectionError && (
                    <Alert variant="destructive" className="border-red-500 bg-red-50 dark:bg-red-950">
                        <AlertTriangle className="size-5 text-red-600 dark:text-red-400" />
                        <AlertTitle className="font-semibold text-red-900 dark:text-red-100">Gagal Menautkan WhatsApp</AlertTitle>
                        <AlertDescription className="mt-2 text-red-800 dark:text-red-200">
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="font-medium">{connectionError.message}</p>
                                    {connectionError.code && (
                                        <p className="text-xs text-red-700 dark:text-red-300 mt-1 font-mono bg-red-100 dark:bg-red-900 px-2 py-1 rounded inline-block">
                                            Error code: {connectionError.code}
                                        </p>
                                    )}
                                    <p className="text-sm mt-2">
                                        Silakan klik tombol <strong>Hubungkan</strong> untuk mencoba lagi dengan QR code baru.
                                    </p>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="shrink-0 hover:bg-red-100 dark:hover:bg-red-900 text-red-700 dark:text-red-300"
                                    onClick={() => setConnectionError(null)}
                                >
                                    <X className="size-4" />
                                </Button>
                            </div>
                        </AlertDescription>
                    </Alert>
                )}

                {/* Session Info Card - Enhanced */}
                <Card className="overflow-hidden border-2">
                    <div className={`h-2 bg-gradient-to-r ${getStatusColor(session.status)}`} />
                    <CardHeader className="space-y-4">
                        <div className="flex items-start justify-between">
                            <div className="space-y-1">
                                <CardTitle className="text-2xl flex items-center gap-2">
                                    <Smartphone className="size-6 text-primary" />
                                    {session.name}
                                </CardTitle>
                                <CardDescription className="flex items-center gap-2 font-mono text-xs">
                                    <QrCode className="size-3.5" />
                                    {session.session_id}
                                </CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* Info Grid */}
                        <div className="grid gap-4 md:grid-cols-3">
                            <div className="group relative overflow-hidden rounded-lg border bg-gradient-to-br from-blue-50/50 to-transparent p-4 transition-all hover:shadow-md">
                                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                                <div className="relative flex items-center gap-3">
                                    <div className="flex size-12 items-center justify-center rounded-xl bg-blue-500/10 ring-4 ring-blue-500/5">
                                        <Phone className="size-5 text-blue-600" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-medium text-muted-foreground">Nomor Telepon</p>
                                        <p className="font-semibold text-sm">{session.phone_number}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="group relative overflow-hidden rounded-lg border bg-gradient-to-br from-purple-50/50 to-transparent p-4 transition-all hover:shadow-md">
                                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                                <div className="relative flex items-center gap-3">
                                    <div className="flex size-12 items-center justify-center rounded-xl bg-purple-500/10 ring-4 ring-purple-500/5">
                                        <Calendar className="size-5 text-purple-600" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-medium text-muted-foreground">Dibuat</p>
                                        <p className="font-semibold text-sm">{formatDate(session.created_at)}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="group relative overflow-hidden rounded-lg border bg-gradient-to-br from-orange-50/50 to-transparent p-4 transition-all hover:shadow-md">
                                <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                                <div className="relative flex items-center gap-3">
                                    <div className="flex size-12 items-center justify-center rounded-xl bg-orange-500/10 ring-4 ring-orange-500/5">
                                        <Activity className="size-5 text-orange-600" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-medium text-muted-foreground">Terakhir Update</p>
                                        <p className="font-semibold text-sm">{formatDate(session.updated_at)}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <Separator />

                        {/* Action Buttons */}
                        <div className="flex flex-wrap gap-3">
                            {session.status === 'connected' ? (
                                <Button
                                    variant="outline"
                                    onClick={handleDisconnect}
                                    className="flex-1 sm:flex-none"
                                >
                                    <WifiOff className="mr-2 size-4" />
                                    Putuskan Koneksi
                                </Button>
                            ) : (
                                <Button
                                    onClick={handleConnect}
                                    disabled={isRefreshing}
                                    className="flex-1 sm:flex-none bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                                >
                                    {isRefreshing ? (
                                        <>
                                            <Loader2 className="mr-2 size-4 animate-spin" />
                                            Menghubungkan...
                                        </>
                                    ) : (
                                        <>
                                            <Wifi className="mr-2 size-4" />
                                            Hubungkan
                                        </>
                                    )}
                                </Button>
                            )}
                            <Button
                                variant="outline"
                                onClick={() => router.visit(`/user/whatsapp/${session.id}/auto-replies`)}
                                className="flex-1 sm:flex-none"
                            >
                                <Zap className="mr-2 size-4" />
                                Auto Reply
                            </Button>
                            <Button
                                variant="outline"
                                onClick={() => router.visit('/user/chatbot')}
                                className="flex-1 sm:flex-none"
                            >
                                <Bot className="mr-2 size-4" />
                                Chatbot AI
                            </Button>
                            <Button
                                variant="destructive"
                                onClick={handleDelete}
                                className="flex-1 sm:flex-none"
                            >
                                <Trash2 className="mr-2 size-4" />
                                Hapus Sesi
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Settings Card */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Settings className="size-5" />
                            Pengaturan Session
                        </CardTitle>
                        <CardDescription>
                            Kelola fitur otomatis untuk session ini
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-green-100">
                                    <Zap className="size-5 text-green-600" />
                                </div>
                                <div>
                                    <Label className="font-medium">Auto-Reply</Label>
                                    <p className="text-sm text-muted-foreground">
                                        Balas pesan masuk secara otomatis
                                    </p>
                                </div>
                            </div>
                            <Switch
                                checked={session.settings?.autoReplyEnabled ?? false}
                                onCheckedChange={(checked) => {
                                    router.post(`/user/whatsapp/${session.id}/settings`, {
                                        autoReplyEnabled: checked
                                    }, { preserveScroll: true });
                                }}
                            />
                        </div>
                        <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-blue-100">
                                    <UserPlus className="size-5 text-blue-600" />
                                </div>
                                <div>
                                    <Label className="font-medium">Auto-Save Kontak</Label>
                                    <p className="text-sm text-muted-foreground">
                                        Simpan kontak otomatis dari setiap chat masuk
                                    </p>
                                </div>
                            </div>
                            <Switch
                                checked={session.settings?.autoSaveContacts ?? true}
                                onCheckedChange={(checked) => {
                                    router.post(`/user/whatsapp/${session.id}/settings`, {
                                        autoSaveContacts: checked
                                    }, { preserveScroll: true });
                                }}
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* QR Code Card - Premium Design */}
                {session.status === 'qr_pending' && (
                    <Card className="overflow-hidden border-2 shadow-lg">
                        <div className="h-1 bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500" />
                        <CardHeader>
                            <div className="flex items-start justify-between">
                                <div className="space-y-1">
                                    <CardTitle className="flex items-center gap-2">
                                        <QrCode className="size-5 text-primary" />
                                        Scan QR Code WhatsApp
                                    </CardTitle>
                                    <CardDescription>
                                        {displayQRCode
                                            ? 'Scan QR code menggunakan aplikasi WhatsApp di ponsel Anda'
                                            : 'Sedang membuat QR code, mohon tunggu...'}
                                    </CardDescription>
                                </div>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleRefreshQR}
                                    disabled={isRefreshing}
                                    className="min-w-[120px]"
                                >
                                    {isRefreshing ? (
                                        <>
                                            <Loader2 className="mr-2 size-4 animate-spin" />
                                            Memuat...
                                        </>
                                    ) : (
                                        <>
                                            <RefreshCw className="mr-2 size-4" />
                                            Refresh QR
                                        </>
                                    )}
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {displayQRCode ? (
                                <div className="space-y-6">
                                    {/* QR Code Display */}
                                    <div className="relative">
                                        <div className="absolute inset-0 bg-gradient-to-r from-green-500/20 to-emerald-500/20 blur-3xl" />
                                        <div className="relative flex justify-center p-8 bg-gradient-to-br from-white to-gray-50 rounded-2xl border-2 shadow-xl">
                                            <div className="relative">
                                                <div className="absolute -inset-4 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl opacity-20 blur-xl animate-pulse" />
                                                <img
                                                    src={displayQRCode}
                                                    alt="QR Code"
                                                    className="relative size-72 rounded-xl shadow-2xl"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Instructions */}
                                    <Alert className="bg-green-50 border-green-200">
                                        <Info className="size-4 text-green-600" />
                                        <AlertDescription className="text-green-800">
                                            <div className="space-y-2">
                                                <p className="font-semibold">Cara Scan QR Code:</p>
                                                <ol className="list-decimal list-inside space-y-1 text-sm">
                                                    <li>Buka aplikasi WhatsApp di ponsel Anda</li>
                                                    <li>Ketuk menu <strong>Perangkat Tertaut</strong></li>
                                                    <li>Pilih <strong>Tautkan Perangkat</strong></li>
                                                    <li>Arahkan kamera ke QR code di atas</li>
                                                </ol>
                                            </div>
                                        </AlertDescription>
                                    </Alert>

                                    {/* Warning Alert Non Official */}
                                    <Alert className="bg-yellow-50 border-yellow-300">
                                        <AlertTriangle className="size-4 text-yellow-600" />
                                        <AlertTitle className="text-yellow-900 font-semibold">
                                            ⚠️ Peringatan Non Official
                                        </AlertTitle>
                                        <AlertDescription className="text-yellow-800">
                                            <p className="text-sm mt-1">
                                                Koneksi menggunakan <strong>Non Official</strong> berpotensi terkena banned.
                                                Jika nomor Anda sudah terhubung di WhatsApp Business Platform (WABA),
                                                <strong className="text-red-600"> dilarang keras</strong> mengkoneksikan di Non Official.
                                            </p>
                                        </AlertDescription>
                                    </Alert>

                                    {/* Status Indicator */}
                                    <div className="flex items-center justify-center gap-3 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                                        <div className="relative flex size-3">
                                            <span className="absolute inline-flex size-full rounded-full bg-yellow-400 opacity-75 animate-ping" />
                                            <span className="relative inline-flex size-3 rounded-full bg-yellow-500" />
                                        </div>
                                        <p className="text-sm font-medium text-yellow-800">
                                            Menunggu QR code di-scan...
                                        </p>
                                    </div>

                                    <p className="text-center text-xs text-muted-foreground">
                                        QR code akan otomatis refresh jika tidak berhasil terhubung
                                    </p>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center p-16 bg-gradient-to-br from-muted/50 to-muted rounded-2xl border-2 border-dashed space-y-6">
                                    <div className="relative">
                                        <div className="absolute inset-0 bg-primary/20 blur-2xl animate-pulse" />
                                        <Loader2 className="relative size-16 animate-spin text-primary" />
                                    </div>
                                    <div className="text-center space-y-2">
                                        <p className="text-lg font-semibold">Generating QR Code...</p>
                                        <p className="text-sm text-muted-foreground">
                                            Halaman akan otomatis refresh setiap 3 detik
                                        </p>
                                        {autoRefreshCounter > 0 && (
                                            <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 rounded-full">
                                                <div className="size-2 rounded-full bg-primary animate-pulse" />
                                                <p className="text-xs font-medium text-primary">
                                                    Auto-refresh: {autoRefreshCounter}x
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                )}

                {/* Statistics - Enhanced */}
                <div className="grid gap-6 md:grid-cols-2">
                    <Card className="relative overflow-hidden group hover:shadow-lg transition-all duration-300">
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Pesan</CardTitle>
                            <div className="p-2.5 rounded-xl bg-blue-500/10 ring-4 ring-blue-500/5">
                                <MessageSquare className="size-5 text-blue-600" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-blue-600">
                                {stats.messages.toLocaleString('id-ID')}
                            </div>
                            <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                                <Activity className="size-3" />
                                Pesan yang terkirim dan diterima
                            </p>
                        </CardContent>
                        <div className="h-1 bg-gradient-to-r from-blue-500 to-blue-400" />
                    </Card>

                    <Card className="relative overflow-hidden group hover:shadow-lg transition-all duration-300">
                        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Kontak</CardTitle>
                            <div className="p-2.5 rounded-xl bg-purple-500/10 ring-4 ring-purple-500/5">
                                <Users className="size-5 text-purple-600" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-purple-600">
                                {stats.contacts.toLocaleString('id-ID')}
                            </div>
                            <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                                <Users className="size-3" />
                                Kontak yang tersimpan
                            </p>
                        </CardContent>
                        <div className="h-1 bg-gradient-to-r from-purple-500 to-purple-400" />
                    </Card>
                </div>

                {/* Recent Messages */}
                {session.messages && session.messages.length > 0 && (
                    <Card className="overflow-hidden border-2">
                        <div className="h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="flex items-center gap-2">
                                        <MessageSquare className="size-5 text-primary" />
                                        Riwayat Pesan
                                    </CardTitle>
                                    <CardDescription className="mt-1">
                                        Lihat riwayat percakapan dari sesi WhatsApp ini
                                    </CardDescription>
                                </div>
                                <Badge variant="outline" className="text-lg px-4 py-2">
                                    {session.messages.length} pesan
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <Tabs defaultValue="outgoing" className="w-full">
                                <TabsList className="grid w-full max-w-md grid-cols-3 mb-4">
                                    <TabsTrigger value="all" className="flex items-center gap-2">
                                        <List className="size-4" />
                                        Semua
                                    </TabsTrigger>
                                    <TabsTrigger value="outgoing" className="flex items-center gap-2">
                                        <Send className="size-4" />
                                        Terkirim
                                    </TabsTrigger>
                                    <TabsTrigger value="incoming" className="flex items-center gap-2">
                                        <Inbox className="size-4" />
                                        Masuk
                                    </TabsTrigger>
                                </TabsList>

                                <TabsContent value="all" className="w-full overflow-x-auto">
                                    <DataTable
                                        columns={columns}
                                        data={session.messages}
                                        searchKey="content"
                                        searchPlaceholder="Cari pesan..."
                                    />
                                </TabsContent>

                                <TabsContent value="outgoing" className="w-full overflow-x-auto">
                                    <DataTable
                                        columns={columns}
                                        data={session.messages.filter(msg => msg.direction === 'outgoing')}
                                        searchKey="content"
                                        searchPlaceholder="Cari pesan terkirim..."
                                    />
                                </TabsContent>

                                <TabsContent value="incoming" className="w-full overflow-x-auto">
                                    <DataTable
                                        columns={columns}
                                        data={session.messages.filter(msg => msg.direction === 'incoming')}
                                        searchKey="content"
                                        searchPlaceholder="Cari pesan masuk..."
                                    />
                                </TabsContent>
                            </Tabs>
                        </CardContent>
                    </Card>
                )}
            </div>
        </UserLayout>
    );
}
