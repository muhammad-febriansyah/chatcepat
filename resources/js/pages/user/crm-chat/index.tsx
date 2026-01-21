import { Head, Link, router } from '@inertiajs/react';
import UserLayout from '@/layouts/user/user-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    MessageCircle,
    Instagram,
    MessagesSquare,
    CheckCircle2,
    XCircle,
    Settings,
    Plug,
    ArrowRight
} from 'lucide-react';

interface CrmChannel {
    id: number;
    platform: string;
    name: string | null;
    status: string;
    phone_number: string | null;
    account_id: string | null;
    webhook_verified: boolean;
    last_sync_at: string | null;
}

interface CrmChatIndexProps {
    channels: {
        whatsapp_cloud: CrmChannel | null;
        instagram: CrmChannel | null;
        messenger: CrmChannel | null;
    };
}

export default function CrmChatIndex({ channels }: CrmChatIndexProps) {
    const platforms = [
        {
            key: 'whatsapp_cloud',
            name: 'WhatsApp Cloud API',
            description: 'Hubungkan ke WhatsApp Business Platform melalui Meta Cloud API',
            icon: MessageCircle,
            color: 'from-green-500 to-emerald-600',
            bgColor: 'bg-green-50',
            iconColor: 'text-green-600',
            channel: channels.whatsapp_cloud,
            connectUrl: '/user/crm-chat/connect/whatsapp',
        },
        {
            key: 'instagram',
            name: 'Instagram',
            description: 'Kelola pesan Instagram Direct dari dashboard',
            icon: Instagram,
            color: 'from-pink-500 to-purple-600',
            bgColor: 'bg-pink-50',
            iconColor: 'text-pink-600',
            channel: channels.instagram,
            connectUrl: '/user/crm-chat/connect/instagram',
        },
        {
            key: 'messenger',
            name: 'Facebook Messenger',
            description: 'Balas pesan Facebook Messenger dari satu tempat',
            icon: MessagesSquare,
            color: 'from-blue-500 to-indigo-600',
            bgColor: 'bg-blue-50',
            iconColor: 'text-blue-600',
            channel: channels.messenger,
            connectUrl: '/user/crm-chat/connect/messenger',
        },
    ];

    const handleDisconnect = (channelId: number) => {
        if (confirm('Apakah Anda yakin ingin memutuskan koneksi ini?')) {
            router.delete(`/user/crm-chat/disconnect/${channelId}`);
        }
    };

    return (
        <UserLayout>
            <Head title="CRM Chat App" />

            <div className="space-y-6">
                {/* Header with Gradient */}
                <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-6 border">
                    <div className="absolute inset-0 bg-grid-white/10 [mask-image:radial-gradient(white,transparent_85%)]" />
                    <div className="relative">
                        <h1 className="text-3xl font-bold tracking-tight text-foreground">CRM Chat App</h1>
                        <p className="text-muted-foreground mt-1">
                            Hubungkan dan kelola semua channel komunikasi dari satu dashboard
                        </p>
                    </div>
                </div>

                {/* WhatsApp Unofficial Section */}
                <Card className="overflow-hidden border-2 hover:shadow-lg transition-all duration-300">
                    <div className="h-1.5 bg-gradient-to-r from-green-400 to-green-600" />
                    <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                            <div className="p-3 rounded-xl bg-green-50">
                                <MessageCircle className="size-6 text-green-500" />
                            </div>
                            <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100">
                                Non-Official
                            </Badge>
                        </div>
                        <CardTitle className="text-xl mt-3">WhatsApp Personal (Non-Official)</CardTitle>
                        <CardDescription className="text-sm">
                            Hubungkan nomor WhatsApp personal via QR Code. Cocok untuk usaha kecil tanpa WhatsApp Business API.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-0">
                        <Button
                            className="w-full bg-gradient-to-r from-green-400 to-green-600 hover:opacity-90"
                            onClick={() => router.visit('/user/whatsapp')}
                        >
                            <Plug className="size-4 mr-2" />
                            Kelola WhatsApp Personal
                            <ArrowRight className="size-4 ml-2" />
                        </Button>
                    </CardContent>
                </Card>

                {/* Official Platforms Section Title */}
                <div className="pt-4">
                    <h2 className="text-xl font-semibold text-foreground">Platform Official (Meta API)</h2>
                    <p className="text-muted-foreground text-sm mt-1">
                        Koneksi resmi melalui Meta Business Platform
                    </p>
                </div>

                {/* Platform Cards */}
                <div className="grid gap-6 md:grid-cols-3">
                    {platforms.map((platform) => {
                        const Icon = platform.icon;
                        const isConnected = platform.channel?.status === 'connected';

                        return (
                            <Card key={platform.key} className="overflow-hidden border-2 hover:shadow-lg transition-all duration-300">
                                <div className={`h-1.5 bg-gradient-to-r ${platform.color}`} />
                                <CardHeader className="pb-3">
                                    <div className="flex items-start justify-between">
                                        <div className={`p-3 rounded-xl ${platform.bgColor}`}>
                                            <Icon className={`size-6 ${platform.iconColor}`} />
                                        </div>
                                        {isConnected ? (
                                            <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
                                                <CheckCircle2 className="size-3 mr-1" />
                                                Terhubung
                                            </Badge>
                                        ) : (
                                            <Badge variant="secondary" className="bg-gray-100 text-gray-600">
                                                <XCircle className="size-3 mr-1" />
                                                Belum Terhubung
                                            </Badge>
                                        )}
                                    </div>
                                    <CardTitle className="text-lg mt-3">{platform.name}</CardTitle>
                                    <CardDescription className="text-sm">
                                        {platform.description}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="pt-0">
                                    {isConnected && platform.channel ? (
                                        <div className="space-y-3">
                                            <div className="p-3 bg-muted rounded-lg text-sm">
                                                <p className="font-medium">{platform.channel.name}</p>
                                                {platform.channel.phone_number && (
                                                    <p className="text-muted-foreground text-xs mt-1">
                                                        ID: {platform.channel.phone_number}
                                                    </p>
                                                )}
                                                {platform.channel.account_id && (
                                                    <p className="text-muted-foreground text-xs mt-1">
                                                        Account: {platform.channel.account_id}
                                                    </p>
                                                )}
                                            </div>
                                            <div className="flex gap-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="flex-1"
                                                    onClick={() => router.visit(platform.connectUrl)}
                                                >
                                                    <Settings className="size-4 mr-1" />
                                                    Pengaturan
                                                </Button>
                                                <Button
                                                    variant="destructive"
                                                    size="sm"
                                                    onClick={() => handleDisconnect(platform.channel!.id)}
                                                >
                                                    Putuskan
                                                </Button>
                                            </div>
                                        </div>
                                    ) : (
                                        <Button
                                            className={`w-full bg-gradient-to-r ${platform.color} hover:opacity-90`}
                                            onClick={() => router.visit(platform.connectUrl)}
                                        >
                                            <Plug className="size-4 mr-2" />
                                            Hubungkan
                                            <ArrowRight className="size-4 ml-2" />
                                        </Button>
                                    )}
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>

                {/* Info Section */}
                <Card className="border-2">
                    <div className="h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <MessageCircle className="size-5 text-primary" />
                            Tentang CRM Chat App
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p className="text-muted-foreground">
                            CRM Chat App memungkinkan Anda menghubungkan berbagai platform messaging ke dalam satu dashboard terpadu.
                            Kelola semua percakapan dari WhatsApp, Instagram, dan Facebook Messenger tanpa perlu berpindah-pindah aplikasi.
                        </p>
                        <div className="grid gap-4 md:grid-cols-3">
                            <div className="p-4 rounded-lg bg-green-50 border border-green-200">
                                <h4 className="font-semibold text-green-800 mb-1">WhatsApp Cloud API</h4>
                                <p className="text-sm text-green-700">
                                    Gunakan akun WhatsApp Business Platform resmi dari Meta
                                </p>
                            </div>
                            <div className="p-4 rounded-lg bg-pink-50 border border-pink-200">
                                <h4 className="font-semibold text-pink-800 mb-1">Instagram DM</h4>
                                <p className="text-sm text-pink-700">
                                    Kelola pesan Instagram Direct dari akun bisnis Anda
                                </p>
                            </div>
                            <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
                                <h4 className="font-semibold text-blue-800 mb-1">Facebook Messenger</h4>
                                <p className="text-sm text-blue-700">
                                    Balas pesan dari halaman Facebook Anda
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </UserLayout>
    );
}
