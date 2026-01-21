import { Head, router, useForm } from '@inertiajs/react';
import UserLayout from '@/layouts/user/user-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Save, UserPlus, Phone, User } from 'lucide-react';
import { FormEvent } from 'react';

export default function ContactCreate() {
    const { data, setData, post, processing, errors } = useForm({
        display_name: '',
        phone_number: '',
    });

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        post('/user/contacts', {
            onSuccess: () => {
                router.visit('/user/contacts');
            },
        });
    };

    return (
        <UserLayout>
            <Head title="Tambah Kontak" />

            <div className="space-y-6">
                {/* Header */}
                <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-6 border">
                    <div className="absolute inset-0 bg-grid-white/10 [mask-image:radial-gradient(white,transparent_85%)]" />
                    <div className="relative flex items-center gap-4">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => router.visit('/user/contacts')}
                            className="hover:bg-white/50"
                        >
                            <ArrowLeft className="size-5" />
                        </Button>
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight text-foreground">
                                Tambah Kontak Baru
                            </h1>
                            <p className="text-muted-foreground mt-1">
                                Simpan kontak untuk keperluan broadcast WhatsApp
                            </p>
                        </div>
                    </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit}>
                    <div className="grid gap-6 max-w-2xl">
                        <Card className="overflow-hidden border-2">
                            <div className="h-1 bg-gradient-to-r from-blue-500 to-purple-500" />
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <UserPlus className="size-5 text-primary" />
                                    Informasi Kontak
                                </CardTitle>
                                <CardDescription>
                                    Masukkan nama dan nomor telepon kontak
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {/* Nama */}
                                <div className="space-y-2">
                                    <Label htmlFor="display_name" className="flex items-center gap-2">
                                        <User className="size-4 text-muted-foreground" />
                                        Nama Kontak
                                    </Label>
                                    <Input
                                        id="display_name"
                                        type="text"
                                        placeholder="Contoh: John Doe"
                                        value={data.display_name}
                                        onChange={(e) => setData('display_name', e.target.value)}
                                        className={errors.display_name ? 'border-destructive' : ''}
                                    />
                                    {errors.display_name && (
                                        <p className="text-sm text-destructive">{errors.display_name}</p>
                                    )}
                                    <p className="text-xs text-muted-foreground">
                                        Nama untuk mengidentifikasi kontak ini
                                    </p>
                                </div>

                                {/* Nomor Telepon */}
                                <div className="space-y-2">
                                    <Label htmlFor="phone_number" className="flex items-center gap-2">
                                        <Phone className="size-4 text-muted-foreground" />
                                        Nomor Telepon <span className="text-destructive">*</span>
                                    </Label>
                                    <Input
                                        id="phone_number"
                                        type="text"
                                        placeholder="628xxxxxxxxxx"
                                        value={data.phone_number}
                                        onChange={(e) => setData('phone_number', e.target.value)}
                                        className={errors.phone_number ? 'border-destructive' : ''}
                                    />
                                    {errors.phone_number && (
                                        <p className="text-sm text-destructive">{errors.phone_number}</p>
                                    )}
                                    <p className="text-xs text-muted-foreground">
                                        Format: 628xxxxxxxxxx (gunakan kode negara 62 tanpa +)
                                    </p>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Action Buttons */}
                        <Card className="overflow-hidden border-2">
                            <div className="h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between gap-4">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => router.visit('/user/contacts')}
                                    >
                                        Batal
                                    </Button>
                                    <Button type="submit" disabled={processing} className="gap-2">
                                        <Save className="size-4" />
                                        {processing ? 'Menyimpan...' : 'Simpan Kontak'}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </form>
            </div>
        </UserLayout>
    );
}
