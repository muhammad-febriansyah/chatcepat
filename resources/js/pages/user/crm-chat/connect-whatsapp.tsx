import { Head, Link, useForm, router } from '@inertiajs/react';
import UserLayout from '@/layouts/user/user-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, MessageCircle, Info, Key, Phone, Shield, Building } from 'lucide-react';
import { FormEvent } from 'react';

interface CrmChannel {
    id: number;
    name: string | null;
    phone_number: string | null;
    account_id: string | null;
    credentials: {
        phone_number_id?: string;
        waba_id?: string;
        verify_token?: string;
    } | null;
}

interface ConnectWhatsAppProps {
    channel: CrmChannel | null;
}

export default function ConnectWhatsApp({ channel }: ConnectWhatsAppProps) {
    const { data, setData, post, processing, errors } = useForm({
        name: channel?.name || '',
        phone_number_id: channel?.credentials?.phone_number_id || '',
        waba_id: channel?.credentials?.waba_id || '',
        access_token: '',
        verify_token: channel?.credentials?.verify_token || '',
    });

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        post('/user/crm-chat/connect/whatsapp');
    };

    return (
        <UserLayout>
            <Head title="Hubungkan WhatsApp Cloud API" />

            <div className="space-y-6">
                {/* Header */}
                <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-green-500/10 via-green-500/5 to-transparent p-6 border">
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
                            <div className="p-3 rounded-xl bg-green-100">
                                <MessageCircle className="size-6 text-green-600" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold tracking-tight text-foreground">
                                    WhatsApp Cloud API
                                </h1>
                                <p className="text-muted-foreground text-sm">
                                    Hubungkan ke Meta Business Platform
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Info Alert */}
                <Alert className="bg-blue-50 border-blue-200">
                    <Info className="size-4 text-blue-600" />
                    <AlertDescription className="text-blue-800">
                        Untuk menggunakan WhatsApp Cloud API, Anda perlu memiliki akun Meta Business dan WhatsApp Business Account yang sudah terverifikasi.
                        <a
                            href="https://developers.facebook.com/docs/whatsapp/cloud-api/get-started"
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
                    <div className="h-1.5 bg-gradient-to-r from-green-500 to-emerald-600" />
                    <CardHeader>
                        <CardTitle>Konfigurasi WhatsApp Cloud API</CardTitle>
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
                                    placeholder="Contoh: WhatsApp Bisnis Utama"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                />
                                {errors.name && (
                                    <p className="text-sm text-destructive">{errors.name}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="phone_number_id" className="flex items-center gap-2">
                                    <Phone className="size-4" />
                                    Phone Number ID
                                </Label>
                                <Input
                                    id="phone_number_id"
                                    placeholder="Contoh: 123456789012345"
                                    value={data.phone_number_id}
                                    onChange={(e) => setData('phone_number_id', e.target.value)}
                                />
                                <p className="text-xs text-muted-foreground">
                                    Dapatkan dari WhatsApp &gt; API Setup di Meta Developer Console
                                </p>
                                {errors.phone_number_id && (
                                    <p className="text-sm text-destructive">{errors.phone_number_id}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="waba_id" className="flex items-center gap-2">
                                    <Building className="size-4" />
                                    WhatsApp Business Account ID
                                </Label>
                                <Input
                                    id="waba_id"
                                    placeholder="Contoh: 123456789012345"
                                    value={data.waba_id}
                                    onChange={(e) => setData('waba_id', e.target.value)}
                                />
                                <p className="text-xs text-muted-foreground">
                                    WABA ID dari Meta Business Suite
                                </p>
                                {errors.waba_id && (
                                    <p className="text-sm text-destructive">{errors.waba_id}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="access_token" className="flex items-center gap-2">
                                    <Key className="size-4" />
                                    Permanent Access Token
                                </Label>
                                <Input
                                    id="access_token"
                                    type="password"
                                    placeholder="Masukkan access token..."
                                    value={data.access_token}
                                    onChange={(e) => setData('access_token', e.target.value)}
                                />
                                <p className="text-xs text-muted-foreground">
                                    Generate permanent token dari System Users di Meta Business Settings
                                </p>
                                {errors.access_token && (
                                    <p className="text-sm text-destructive">{errors.access_token}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="verify_token" className="flex items-center gap-2">
                                    <Shield className="size-4" />
                                    Verify Token (untuk Webhook)
                                </Label>
                                <Input
                                    id="verify_token"
                                    placeholder="Contoh: my_secret_verify_token"
                                    value={data.verify_token}
                                    onChange={(e) => setData('verify_token', e.target.value)}
                                />
                                <p className="text-xs text-muted-foreground">
                                    Token custom untuk verifikasi webhook. Simpan ini untuk konfigurasi webhook.
                                </p>
                                {errors.verify_token && (
                                    <p className="text-sm text-destructive">{errors.verify_token}</p>
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
                                    className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                                >
                                    {processing ? 'Menyimpan...' : channel ? 'Update Koneksi' : 'Hubungkan WhatsApp'}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </UserLayout>
    );
}
