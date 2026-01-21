import { Head, useForm, router } from '@inertiajs/react';
import UserLayout from '@/layouts/user/user-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, Instagram, Info, Key, Building } from 'lucide-react';
import { FormEvent } from 'react';

interface CrmChannel {
    id: number;
    name: string | null;
    account_id: string | null;
    credentials: {
        instagram_account_id?: string;
        page_id?: string;
    } | null;
}

interface ConnectInstagramProps {
    channel: CrmChannel | null;
}

export default function ConnectInstagram({ channel }: ConnectInstagramProps) {
    const { data, setData, post, processing, errors } = useForm({
        name: channel?.name || '',
        instagram_account_id: channel?.credentials?.instagram_account_id || '',
        page_id: channel?.credentials?.page_id || '',
        access_token: '',
    });

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        post('/user/crm-chat/connect/instagram');
    };

    return (
        <UserLayout>
            <Head title="Hubungkan Instagram" />

            <div className="space-y-6">
                {/* Header */}
                <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-pink-500/10 via-purple-500/5 to-transparent p-6 border">
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
                            <div className="p-3 rounded-xl bg-gradient-to-br from-pink-100 to-purple-100">
                                <Instagram className="size-6 text-pink-600" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold tracking-tight text-foreground">
                                    Instagram
                                </h1>
                                <p className="text-muted-foreground text-sm">
                                    Hubungkan Instagram Business Account
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Info Alert */}
                <Alert className="bg-pink-50 border-pink-200">
                    <Info className="size-4 text-pink-600" />
                    <AlertDescription className="text-pink-800">
                        Untuk menggunakan Instagram Messaging API, akun Instagram Anda harus berupa akun bisnis dan terhubung ke Facebook Page.
                        <a
                            href="https://developers.facebook.com/docs/instagram-api/getting-started"
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
                    <div className="h-1.5 bg-gradient-to-r from-pink-500 to-purple-600" />
                    <CardHeader>
                        <CardTitle>Konfigurasi Instagram</CardTitle>
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
                                    placeholder="Contoh: Instagram Bisnis Utama"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                />
                                {errors.name && (
                                    <p className="text-sm text-destructive">{errors.name}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="instagram_account_id" className="flex items-center gap-2">
                                    <Instagram className="size-4" />
                                    Instagram Business Account ID
                                </Label>
                                <Input
                                    id="instagram_account_id"
                                    placeholder="Contoh: 17841400123456789"
                                    value={data.instagram_account_id}
                                    onChange={(e) => setData('instagram_account_id', e.target.value)}
                                />
                                <p className="text-xs text-muted-foreground">
                                    ID akun Instagram Business yang terhubung ke Facebook Page
                                </p>
                                {errors.instagram_account_id && (
                                    <p className="text-sm text-destructive">{errors.instagram_account_id}</p>
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
                                    ID halaman Facebook yang terhubung ke Instagram
                                </p>
                                {errors.page_id && (
                                    <p className="text-sm text-destructive">{errors.page_id}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="access_token" className="flex items-center gap-2">
                                    <Key className="size-4" />
                                    Page Access Token
                                </Label>
                                <Input
                                    id="access_token"
                                    type="password"
                                    placeholder="Masukkan access token..."
                                    value={data.access_token}
                                    onChange={(e) => setData('access_token', e.target.value)}
                                />
                                <p className="text-xs text-muted-foreground">
                                    Access token dengan permission instagram_manage_messages
                                </p>
                                {errors.access_token && (
                                    <p className="text-sm text-destructive">{errors.access_token}</p>
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
                                    className="flex-1 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700"
                                >
                                    {processing ? 'Menyimpan...' : channel ? 'Update Koneksi' : 'Hubungkan Instagram'}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </UserLayout>
    );
}
