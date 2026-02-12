import { Head, useForm, router, Link } from '@inertiajs/react';
import { logger } from '@/utils/logger';
import UserLayout from '@/layouts/user/user-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { User, Lock, Shield, Camera, Eye, EyeOff, Mail, Phone as PhoneIcon, MapPin, Briefcase, Building2, Calendar, Save, Info, Settings } from 'lucide-react';
import { FormEventHandler, useRef, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface UserData {
    id: number;
    name: string;
    email: string;
    phone: string | null;
    address: string | null;
    nama_bisnis: string | null;
    kategori_bisnis: string | null;
    kategori_bisnis_name?: string | null;
    role: string;
    avatar: string | null;
    created_at: string;
}

interface BusinessCategory {
    id: string;
    name: string;
}

interface UserEmail {
    id: number;
    email: string;
    status: 'pending' | 'approved' | 'rejected';
    verified_at: string | null;
    approved_at: string | null;
    approved_by: string | null;
    rejection_reason: string | null;
    notes: string | null;
    created_at: string;
}

interface SmtpSetting {
    id: number;
    name: string;
    host: string;
    port: number;
    username: string;
    encryption: string;
    from_address: string;
    from_name: string;
    is_active: boolean;
    is_verified: boolean;
    verified_at: string | null;
    created_at: string;
}

interface AccountIndexProps {
    user: UserData;
    businessCategories: BusinessCategory[];
    emails: UserEmail[];
    smtpSettings: SmtpSetting[];
}

export default function AccountIndex({ user, businessCategories, emails, smtpSettings }: AccountIndexProps) {
    const [avatarPreview, setAvatarPreview] = useState<string | null>(user.avatar);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const profileForm = useForm({
        name: user.name || '',
        phone: user.phone || '',
        address: user.address || '',
        nama_bisnis: user.nama_bisnis || '',
        kategori_bisnis: user.kategori_bisnis || '',
    });

    const passwordForm = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    const handleProfileSubmit: FormEventHandler = (e) => {
        e.preventDefault();
        profileForm.put('/user/account/profile', {
            preserveScroll: true,
        });
    };

    const handlePasswordSubmit: FormEventHandler = (e) => {
        e.preventDefault();
        passwordForm.put('/user/account/password', {
            preserveScroll: true,
            onSuccess: () => {
                passwordForm.reset();
            },
        });
    };

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            alert('File harus berupa gambar');
            return;
        }

        // Validate file size (max 2MB)
        if (file.size > 2 * 1024 * 1024) {
            alert('Ukuran file maksimal 2MB');
            return;
        }

        // Create preview first
        const reader = new FileReader();
        reader.onload = (event) => {
            const imageDataUrl = event.target?.result as string;
            setAvatarPreview(imageDataUrl);

            // Upload avatar after preview is set using router.post with FormData
            const formData = new FormData();
            formData.append('avatar', file);
            formData.append('_method', 'POST');

            // Use router.post with FormData
            router.post('/user/account/avatar', formData, {
                preserveScroll: true,
                onSuccess: () => {
                    logger.log('Avatar uploaded successfully');
                },
                onError: (errors) => {
                    setAvatarPreview(user.avatar);
                    alert('Gagal upload avatar. Silakan coba lagi.');
                    logger.error('Upload error:', errors);
                },
                onFinish: () => {
                    if (fileInputRef.current) {
                        fileInputRef.current.value = '';
                    }
                },
            });
        };

        reader.onerror = () => {
            alert('Error membaca file. Silakan coba lagi.');
        };

        reader.readAsDataURL(file);
    };

    const handleAvatarClick = () => {
        fileInputRef.current?.click();
    };

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map(word => word[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    return (
        <UserLayout>
            <Head title="Pengaturan Akun" />

            <div className="space-y-6">
                {/* Header with Gradient */}
                <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-6 border">
                    <div className="absolute inset-0 bg-grid-white/10 [mask-image:radial-gradient(white,transparent_85%)]" />
                    <div className="relative">
                        <h1 className="text-3xl font-bold tracking-tight text-foreground">
                            Pengaturan Akun
                        </h1>
                        <p className="text-muted-foreground mt-1">
                            Kelola informasi profil dan keamanan akun Anda
                        </p>
                    </div>
                </div>

                {/* Account Profile Card */}
                <Card className="overflow-hidden border-2">
                    <div className="h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />
                    <CardContent className="pt-6">
                        <div className="flex flex-col md:flex-row md:items-start gap-6">
                            {/* Avatar Section */}
                            <div className="flex flex-col items-center gap-3">
                                <div className="relative group">
                                    <Avatar className="size-28 border-4 border-background ring-2 ring-primary/10">
                                        <AvatarImage src={avatarPreview || undefined} alt={user.name} />
                                        <AvatarFallback className="bg-gradient-to-br from-primary to-primary/70 text-primary-foreground text-3xl font-bold">
                                            {getInitials(user.name)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <button
                                        type="button"
                                        onClick={handleAvatarClick}
                                        className="absolute inset-0 flex items-center justify-center rounded-full bg-black/60 opacity-0 group-hover:opacity-100 transition-all cursor-pointer backdrop-blur-sm"
                                    >
                                        <div className="text-center">
                                            <Camera className="size-7 text-white mx-auto mb-1" />
                                            <span className="text-xs text-white font-medium">Upload</span>
                                        </div>
                                    </button>
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/*"
                                        onChange={handleAvatarChange}
                                        className="hidden"
                                    />
                                </div>
                                <p className="text-xs text-muted-foreground text-center max-w-[140px]">
                                    Klik untuk mengubah foto profil (max 2MB)
                                </p>
                            </div>

                            {/* User Info Section */}
                            <div className="flex-1 space-y-4">
                                <div>
                                    <h3 className="text-2xl font-bold">{user.name}</h3>
                                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                                        <Badge variant={user.role === 'admin' ? 'default' : 'secondary'} className="text-xs">
                                            {user.role === 'admin' ? '👑 Admin' : '👤 User'}
                                        </Badge>
                                        {user.kategori_bisnis_name && (
                                            <Badge variant="outline" className="text-xs">
                                                <Building2 className="size-3 mr-1" />
                                                {user.kategori_bisnis_name}
                                            </Badge>
                                        )}
                                    </div>
                                </div>

                                <div className="grid gap-3 md:grid-cols-2">
                                    <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                                        <div className="flex size-10 items-center justify-center rounded-lg bg-blue-500/10">
                                            <Mail className="size-5 text-blue-600" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs text-muted-foreground">Email</p>
                                            <p className="text-sm font-medium truncate">{user.email}</p>
                                        </div>
                                    </div>

                                    {user.phone && (
                                        <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                                            <div className="flex size-10 items-center justify-center rounded-lg bg-green-500/10">
                                                <PhoneIcon className="size-5 text-green-600" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-xs text-muted-foreground">Telepon</p>
                                                <p className="text-sm font-medium truncate">{user.phone}</p>
                                            </div>
                                        </div>
                                    )}

                                    {user.nama_bisnis && (
                                        <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                                            <div className="flex size-10 items-center justify-center rounded-lg bg-purple-500/10">
                                                <Briefcase className="size-5 text-purple-600" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-xs text-muted-foreground">Bisnis</p>
                                                <p className="text-sm font-medium truncate">{user.nama_bisnis}</p>
                                            </div>
                                        </div>
                                    )}

                                    <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                                        <div className="flex size-10 items-center justify-center rounded-lg bg-orange-500/10">
                                            <Calendar className="size-5 text-orange-600" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs text-muted-foreground">Bergabung</p>
                                            <p className="text-sm font-medium truncate">{user.created_at}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Settings Tabs */}
                <Tabs defaultValue="profile" className="w-full">
                    <TabsList className="grid w-full max-w-2xl grid-cols-4 h-12">
                        <TabsTrigger value="profile" className="gap-2">
                            <User className="size-4" />
                            Informasi Profil
                        </TabsTrigger>
                        <TabsTrigger value="email" className="gap-2">
                            <Mail className="size-4" />
                            Verifikasi Email
                        </TabsTrigger>
                        {/* <TabsTrigger value="smtp" className="gap-2">
                            <Settings className="size-4" />
                            SMTP
                        </TabsTrigger> */}
                        <TabsTrigger value="security" className="gap-2">
                            <Lock className="size-4" />
                            Keamanan
                        </TabsTrigger>
                    </TabsList>

                    {/* Profile Tab */}
                    <TabsContent value="profile" className="mt-6">
                        <Card className="overflow-hidden border-2">
                            <div className="h-1 bg-gradient-to-r from-blue-500 to-purple-500" />
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <User className="size-5 text-primary" />
                                    Informasi Profil
                                </CardTitle>
                                <CardDescription>
                                    Perbarui informasi profil dan bisnis Anda
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleProfileSubmit} className="space-y-6">
                                    <div className="grid gap-6 md:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label htmlFor="name" className="flex items-center gap-2">
                                                <User className="size-4 text-muted-foreground" />
                                                Nama Lengkap <span className="text-destructive">*</span>
                                            </Label>
                                            <Input
                                                id="name"
                                                type="text"
                                                value={profileForm.data.name}
                                                onChange={(e) => profileForm.setData('name', e.target.value)}
                                                required
                                                className={profileForm.errors.name ? 'border-destructive' : ''}
                                            />
                                            {profileForm.errors.name && (
                                                <p className="text-sm text-destructive">
                                                    {profileForm.errors.name}
                                                </p>
                                            )}
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="phone" className="flex items-center gap-2">
                                                <PhoneIcon className="size-4 text-muted-foreground" />
                                                Nomor Telepon
                                            </Label>
                                            <Input
                                                id="phone"
                                                type="tel"
                                                value={profileForm.data.phone}
                                                onChange={(e) => profileForm.setData('phone', e.target.value)}
                                                placeholder="628123456789"
                                                className={profileForm.errors.phone ? 'border-destructive' : ''}
                                            />
                                            {profileForm.errors.phone && (
                                                <p className="text-sm text-destructive">
                                                    {profileForm.errors.phone}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="address" className="flex items-center gap-2">
                                            <MapPin className="size-4 text-muted-foreground" />
                                            Alamat
                                        </Label>
                                        <Input
                                            id="address"
                                            type="text"
                                            value={profileForm.data.address}
                                            onChange={(e) => profileForm.setData('address', e.target.value)}
                                            placeholder="Alamat lengkap Anda"
                                            className={profileForm.errors.address ? 'border-destructive' : ''}
                                        />
                                        {profileForm.errors.address && (
                                            <p className="text-sm text-destructive">
                                                {profileForm.errors.address}
                                            </p>
                                        )}
                                    </div>

                                    <div className="grid gap-6 md:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label htmlFor="nama_bisnis" className="flex items-center gap-2">
                                                <Briefcase className="size-4 text-muted-foreground" />
                                                Nama Bisnis
                                            </Label>
                                            <Input
                                                id="nama_bisnis"
                                                type="text"
                                                value={profileForm.data.nama_bisnis}
                                                onChange={(e) =>
                                                    profileForm.setData('nama_bisnis', e.target.value)
                                                }
                                                placeholder="Nama bisnis Anda"
                                                className={profileForm.errors.nama_bisnis ? 'border-destructive' : ''}
                                            />
                                            {profileForm.errors.nama_bisnis && (
                                                <p className="text-sm text-destructive">
                                                    {profileForm.errors.nama_bisnis}
                                                </p>
                                            )}
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="kategori_bisnis" className="flex items-center gap-2">
                                                <Building2 className="size-4 text-muted-foreground" />
                                                Kategori Bisnis
                                            </Label>
                                            <Select
                                                value={profileForm.data.kategori_bisnis}
                                                onValueChange={(value) =>
                                                    profileForm.setData('kategori_bisnis', value)
                                                }
                                            >
                                                <SelectTrigger className={profileForm.errors.kategori_bisnis ? 'border-destructive' : ''}>
                                                    <SelectValue placeholder="Pilih kategori bisnis" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {businessCategories.map((category) => (
                                                        <SelectItem key={category.id} value={category.id}>
                                                            {category.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            {profileForm.errors.kategori_bisnis && (
                                                <p className="text-sm text-destructive">
                                                    {profileForm.errors.kategori_bisnis}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex justify-end pt-2">
                                        <Button type="submit" disabled={profileForm.processing} size="lg" className="gap-2">
                                            <Save className="size-4" />
                                            {profileForm.processing ? 'Menyimpan...' : 'Simpan Perubahan'}
                                        </Button>
                                    </div>
                                </form>
                            </CardContent>
                        </Card>
                    </TabsContent>
                    {/* Email Verification Tab */}
                    <TabsContent value="email" className="mt-6">
                        <Card className="overflow-hidden border-2">
                            <div className="h-1 bg-gradient-to-r from-red-500 to-pink-500" />
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle className="flex items-center gap-2">
                                            <Mail className="size-5 text-primary" />
                                            Verifikasi Email
                                        </CardTitle>
                                        <CardDescription>
                                            Kelola identitas pengirim email Anda
                                        </CardDescription>
                                    </div>
                                    <Link href="/user/email-settings">
                                        <Button variant="outline" size="sm">
                                            Kelola Selengkapnya
                                        </Button>
                                    </Link>
                                </div>
                            </CardHeader>
                            <CardContent>
                                {emails.length === 0 ? (
                                    <div className="text-center py-8">
                                        <Mail className="size-12 mx-auto text-muted-foreground mb-4" />
                                        <p className="text-muted-foreground">Belum ada email yang didaftarkan</p>
                                        <Link href="/user/email-settings">
                                            <Button variant="link">Tambah Email Sekarang</Button>
                                        </Link>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {emails.map((email) => (
                                            <div key={email.id} className="flex items-center justify-between p-4 rounded-lg border bg-muted/30">
                                                <div className="flex items-center gap-3">
                                                    <Mail className="size-4 text-muted-foreground" />
                                                    <div>
                                                        <p className="font-medium">{email.email}</p>
                                                        <p className="text-xs text-muted-foreground">Ditambahkan pada {email.created_at}</p>
                                                    </div>
                                                </div>
                                                <Badge
                                                    variant={email.status === 'approved' ? 'default' : email.status === 'pending' ? 'secondary' : 'destructive'}
                                                    className={email.status === 'approved' ? 'bg-green-500' : ''}
                                                >
                                                    {email.status === 'approved' ? 'Disetujui' : email.status === 'pending' ? 'Menunggu' : 'Ditolak'}
                                                </Badge>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* SMTP Settings Tab - HIDDEN */}
                    {/* <TabsContent value="smtp" className="mt-6">
                        <Card className="overflow-hidden border-2">
                            <div className="h-1 bg-gradient-to-r from-blue-500 to-cyan-500" />
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle className="flex items-center gap-2">
                                            <Settings className="size-5 text-primary" />
                                            SMTP Settings
                                        </CardTitle>
                                        <CardDescription>
                                            Konfigurasi server email untuk pengiriman
                                        </CardDescription>
                                    </div>
                                    <Link href="/user/smtp-settings">
                                        <Button variant="outline" size="sm">
                                            Kelola SMTP
                                        </Button>
                                    </Link>
                                </div>
                            </CardHeader>
                            <CardContent>
                                {smtpSettings.length === 0 ? (
                                    <div className="text-center py-8">
                                        <Settings className="size-12 mx-auto text-muted-foreground mb-4" />
                                        <p className="text-muted-foreground">Belum ada SMTP yang dikonfigurasi</p>
                                        <Link href="/user/smtp-settings">
                                            <Button variant="link">Atur SMTP Sekarang</Button>
                                        </Link>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {smtpSettings.map((smtp) => (
                                            <div key={smtp.id} className="flex items-center justify-between p-4 rounded-lg border bg-muted/30">
                                                <div className="flex items-center gap-3">
                                                    <Settings className="size-4 text-muted-foreground" />
                                                    <div>
                                                        <p className="font-medium">{smtp.name}</p>
                                                        <p className="text-xs text-muted-foreground">{smtp.host}:{smtp.port}</p>
                                                    </div>
                                                </div>
                                                <div className="flex gap-2">
                                                    {smtp.is_active && <Badge variant="default" className="bg-blue-500 text-[10px]">Aktif</Badge>}
                                                    <Badge variant={smtp.is_verified ? 'default' : 'secondary'} className={smtp.is_verified ? 'bg-green-500' : ''}>
                                                        {smtp.is_verified ? 'Terverifikasi' : 'Belum Verifikasi'}
                                                    </Badge>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent> */}

                    {/* Security Tab */}
                    <TabsContent value="security" className="mt-6 space-y-6">
                        <Card className="overflow-hidden border-2">
                            <div className="h-1 bg-gradient-to-r from-red-500 to-orange-500" />
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Lock className="size-5 text-primary" />
                                    Ubah Password
                                </CardTitle>
                                <CardDescription>
                                    Pastikan akun Anda menggunakan password yang kuat untuk keamanan
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handlePasswordSubmit} className="space-y-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="current_password">Password Saat Ini</Label>
                                        <div className="relative">
                                            <Input
                                                id="current_password"
                                                type={showCurrentPassword ? "text" : "password"}
                                                value={passwordForm.data.current_password}
                                                onChange={(e) =>
                                                    passwordForm.setData('current_password', e.target.value)
                                                }
                                                placeholder="Masukkan password saat ini"
                                                required
                                                className="pr-10"
                                            />
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                            >
                                                {showCurrentPassword ? (
                                                    <EyeOff className="size-4 text-muted-foreground" />
                                                ) : (
                                                    <Eye className="size-4 text-muted-foreground" />
                                                )}
                                            </Button>
                                        </div>
                                        {passwordForm.errors.current_password && (
                                            <p className="text-sm text-destructive">
                                                {passwordForm.errors.current_password}
                                            </p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="password">Password Baru</Label>
                                        <div className="relative">
                                            <Input
                                                id="password"
                                                type={showNewPassword ? "text" : "password"}
                                                value={passwordForm.data.password}
                                                onChange={(e) => passwordForm.setData('password', e.target.value)}
                                                placeholder="Masukkan password baru"
                                                required
                                                className="pr-10"
                                            />
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                                onClick={() => setShowNewPassword(!showNewPassword)}
                                            >
                                                {showNewPassword ? (
                                                    <EyeOff className="size-4 text-muted-foreground" />
                                                ) : (
                                                    <Eye className="size-4 text-muted-foreground" />
                                                )}
                                            </Button>
                                        </div>
                                        {passwordForm.errors.password && (
                                            <p className="text-sm text-destructive">
                                                {passwordForm.errors.password}
                                            </p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="password_confirmation">
                                            Konfirmasi Password Baru
                                        </Label>
                                        <div className="relative">
                                            <Input
                                                id="password_confirmation"
                                                type={showConfirmPassword ? "text" : "password"}
                                                value={passwordForm.data.password_confirmation}
                                                onChange={(e) =>
                                                    passwordForm.setData('password_confirmation', e.target.value)
                                                }
                                                placeholder="Konfirmasi password baru"
                                                required
                                                className="pr-10"
                                            />
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            >
                                                {showConfirmPassword ? (
                                                    <EyeOff className="size-4 text-muted-foreground" />
                                                ) : (
                                                    <Eye className="size-4 text-muted-foreground" />
                                                )}
                                            </Button>
                                        </div>
                                    </div>

                                    <div className="flex justify-end pt-2">
                                        <Button type="submit" disabled={passwordForm.processing} size="lg" className="gap-2">
                                            <Lock className="size-4" />
                                            {passwordForm.processing ? 'Mengubah...' : 'Ubah Password'}
                                        </Button>
                                    </div>
                                </form>
                            </CardContent>
                        </Card>

                        {/* Account Type Info */}
                        <Card className="overflow-hidden border-2">
                            <div className="h-1 bg-gradient-to-r from-green-500 to-teal-500" />
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Shield className="size-5 text-primary" />
                                    Tipe Akun & Batasan
                                </CardTitle>
                                <CardDescription>
                                    Informasi tentang tipe akun dan fitur yang tersedia
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                                        <div className="flex items-center gap-3">
                                            <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
                                                <Shield className="size-5 text-primary" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium">Status Akun</p>
                                                <p className="text-xs text-muted-foreground">Tipe akun Anda saat ini</p>
                                            </div>
                                        </div>
                                        <Badge variant={user.role === 'admin' ? 'default' : 'secondary'} className="text-sm">
                                            {user.role === 'admin' ? '👑 Admin' : '👤 User Biasa'}
                                        </Badge>
                                    </div>

                                    {user.role !== 'admin' && (
                                        <div className="rounded-lg border-2 border-orange-200 bg-orange-50 p-5 dark:border-orange-900 dark:bg-orange-950">
                                            <div className="flex items-start gap-3">
                                                <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-orange-500/10">
                                                    <Info className="size-5 text-orange-600" />
                                                </div>
                                                <div className="flex-1 space-y-3">
                                                    <div>
                                                        <h4 className="font-semibold text-orange-900 dark:text-orange-100">
                                                            Batasan Akun User
                                                        </h4>
                                                        <p className="text-sm text-orange-800 dark:text-orange-200 mt-1">
                                                            Akun Anda memiliki beberapa batasan berikut:
                                                        </p>
                                                    </div>
                                                    <ul className="space-y-2 text-sm text-orange-800 dark:text-orange-200">
                                                        <li className="flex items-start gap-2">
                                                            <span className="mt-0.5">•</span>
                                                            <span>Maksimal 1 sesi WhatsApp aktif</span>
                                                        </li>
                                                        <li className="flex items-start gap-2">
                                                            <span className="mt-0.5">•</span>
                                                            <span>Rate limit untuk scraping Google Maps</span>
                                                        </li>
                                                        <li className="flex items-start gap-2">
                                                            <span className="mt-0.5">•</span>
                                                            <span>Batasan jumlah broadcast per hari</span>
                                                        </li>
                                                    </ul>
                                                    <div className="pt-2">
                                                        <p className="text-sm font-medium text-orange-900 dark:text-orange-100">
                                                            💡 Hubungi admin untuk upgrade ke akun premium dan hapus semua batasan!
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </UserLayout >
    );
}
