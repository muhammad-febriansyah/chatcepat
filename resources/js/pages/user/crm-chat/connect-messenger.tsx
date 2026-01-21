import { Head, useForm, router } from '@inertiajs/react';
import UserLayout from '@/layouts/user/user-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, MessagesSquare, Info, Key, Building, Shield } from 'lucide-react';
import { FormEvent } from 'react';

interface CrmChannel {
    id: number;
    name: string | null;
    account_id: string | null;
    credentials: {
        page_id?: string;
        app_secret?: string;
    } | null;
}

interface ConnectMessengerProps {
    channel: CrmChannel | null;
}

export default function ConnectMessenger({ channel }: ConnectMessengerProps) {
    const { data, setData, post, processing, errors } = useForm({
        name: channel?.name || '',
        page_id: channel?.credentials?.page_id || '',
        page_access_token: '',
        app_secret: channel?.credentials?.app_secret || '',
    });

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        post('/user/crm-chat/connect/messenger');
    };

    return (
        <UserLayout>
            <Head title="Hubungkan Facebook Messenger" />

            <div className="space-y-6">
                {/* Header */}
                <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-blue-500/10 via-indigo-500/5 to-transparent p-6 border">
                    <div className="absolute inset-0 bg-grid-white/10 [mask-image:radial-gradient(white,transparent_85%)]" />
                    <div className="relative flex items-center gap-4">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => router.visit('/user/crm-chat')}
                            className="hover:bg-white/50"
                        >
                            <ArrowLeft className="size-5" />
                        </Button>
                        <div className="flex items-center gap-3">
                            <div className="p-3 rounded-xl bg-blue-100">
                                <MessagesSquare className="size-6 text-blue-600" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold tracking-tight text-foreground">
                                    Facebook Messenger
                                </h1>
                                <p className="text-muted-foreground text-sm">
                                    Hubungkan Facebook Page untuk Messenger
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Info Alert */}
                <Alert className="bg-blue-50 border-blue-200">
                    <Info className="size-4 text-blue-600" />
                    <AlertDescription className="text-blue-800">
                        Untuk menggunakan Messenger API, Anda perlu memiliki Facebook Page dan Facebook App yang sudah dikonfigurasi.
                        <a
                            href="https://developers.facebook.com/docs/messenger-platform/getting-started"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-medium underline ml-1"
                        >
                            Pelajari lebih lanjut
                        </a>
                    </AlertDescription>
                </Alert>

                {/* Form Card */}
                <Card className="border-2">
                    <div className="h-1.5 bg-gradient-to-r from-blue-500 to-indigo-600" />
                    <CardHeader>
                        <CardTitle>Konfigurasi Facebook Messenger</CardTitle>
                        <CardDescription>
                            Masukkan kredensial dari Meta Developer Console
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div className="space-y-2">
                                <Label htmlFor="name" className="flex items-center gap-2">
                                    <Building className="size-4" />
                                    Nama Channel
                                </Label>
                                <Input
                                    id="name"
                                    placeholder="Contoh: Messenger Halaman Utama"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                />
                                {errors.name && (
                                    <p className="text-sm text-destructive">{errors.name}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="page_id" className="flex items-center gap-2">
                                    <Building className="size-4" />
                                    Facebook Page ID
                                </Label>
                                <Input
                                    id="page_id"
                                    placeholder="Contoh: 123456789012345"
                                    value={data.page_id}
                                    onChange={(e) => setData('page_id', e.target.value)}
                                />
                                <p className="text-xs text-muted-foreground">
                                    ID halaman Facebook yang akan menerima pesan
                                </p>
                                {errors.page_id && (
                                    <p className="text-sm text-destructive">{errors.page_id}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="page_access_token" className="flex items-center gap-2">
                                    <Key className="size-4" />
                                    Page Access Token
                                </Label>
                                <Input
                                    id="page_access_token"
                                    type="password"
                                    placeholder="Masukkan page access token..."
                                    value={data.page_access_token}
                                    onChange={(e) => setData('page_access_token', e.target.value)}
                                />
                                <p className="text-xs text-muted-foreground">
                                    Token dengan permission pages_messaging
                                </p>
                                {errors.page_access_token && (
                                    <p className="text-sm text-destructive">{errors.page_access_token}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="app_secret" className="flex items-center gap-2">
                                    <Shield className="size-4" />
                                    App Secret
                                </Label>
                                <Input
                                    id="app_secret"
                                    type="password"
                                    placeholder="Masukkan app secret..."
                                    value={data.app_secret}
                                    onChange={(e) => setData('app_secret', e.target.value)}
                                />
                                <p className="text-xs text-muted-foreground">
                                    App Secret dari Facebook App untuk verifikasi webhook signature
                                </p>
                                {errors.app_secret && (
                                    <p className="text-sm text-destructive">{errors.app_secret}</p>
                                )}
                            </div>

                            <div className="flex gap-3 pt-4">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => router.visit('/user/crm-chat')}
                                >
                                    Batal
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={processing}
                                    className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
                                >
                                    {processing ? 'Menyimpan...' : channel ? 'Update Koneksi' : 'Hubungkan Messenger'}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </UserLayout>
    );
}
