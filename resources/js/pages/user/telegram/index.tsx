import { Head, router, useForm } from '@inertiajs/react';
import UserLayout from '@/layouts/user/user-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Bot, Plus, Trash2, Users, MessageSquare, Settings, Send, Zap, Phone, Key, Loader2, CheckCircle2, Smartphone, LogOut, User, Brain, PowerCircle } from 'lucide-react';
import { useState, FormEvent, useEffect } from 'react';
import axios from 'axios';

interface TelegramBot {
    id: number;
    bot_username: string;
    bot_first_name: string;
    is_active: boolean;
    auto_reply_enabled: boolean;
    ai_enabled: boolean;
    ai_assistant_type: string;
    contacts_count: number;
    messages_count: number;
    auto_replies_count: number;
    last_webhook_at: string | null;
    created_at: string;
}

interface TelegramBotsPageProps {
    bots: TelegramBot[];
    aiAssistantTypes: Record<string, string>;
    telegramSession?: {
        logged_in: boolean;
        user?: {
            first_name: string;
            last_name?: string;
            username?: string;
            phone?: string;
        };
    };
}

type CreateStep = 'method' | 'phone' | 'otp' | 'bot-info' | 'creating' | 'success' | 'manual';

export default function TelegramBotsPage({ bots, aiAssistantTypes, telegramSession: initialSession }: TelegramBotsPageProps) {
    const [showAddDialog, setShowAddDialog] = useState(false);
    const [createStep, setCreateStep] = useState<CreateStep>('method');
    const [phone, setPhone] = useState('');
    const [otpCode, setOtpCode] = useState('');
    const [password, setPassword] = useState('');
    const [requires2FA, setRequires2FA] = useState(false);
    const [botName, setBotName] = useState('');
    const [botUsername, setBotUsername] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [createdBot, setCreatedBot] = useState<{ username: string; name: string } | null>(null);

    // Session state
    const [telegramSession, setTelegramSession] = useState(initialSession);
    const [sessionLoading, setSessionLoading] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        bot_token: '',
    });

    // Check session on mount
    useEffect(() => {
        checkSession();
    }, []);

    const checkSession = async () => {
        try {
            const response = await axios.get('/user/telegram/session/check');
            setTelegramSession(response.data);
        } catch {
            setTelegramSession({ logged_in: false });
        }
    };

    const handleLogoutSession = async () => {
        setSessionLoading(true);
        try {
            await axios.post('/user/telegram/session/logout');
            setTelegramSession({ logged_in: false });
        } catch (err) {
            console.error('Logout failed:', err);
        } finally {
            setSessionLoading(false);
        }
    };

    const resetAutoCreate = () => {
        setCreateStep('method');
        setPhone('');
        setOtpCode('');
        setPassword('');
        setBotName('');
        setBotUsername('');
        setRequires2FA(false);
        setLoading(false);
        setError('');
        setCreatedBot(null);
    };

    const handleCloseDialog = () => {
        setShowAddDialog(false);
        resetAutoCreate();
        reset();
    };

    const handleAddBot = (e: FormEvent) => {
        e.preventDefault();
        post('/user/telegram/bots', {
            onSuccess: () => {
                handleCloseDialog();
            },
        });
    };

    const handleSendCode = async (e: FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await axios.post('/user/telegram/session/send-code', { phone });
            if (response.data.success) {
                setCreateStep('otp');
            } else {
                setError(response.data.message || 'Gagal mengirim kode');
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Gagal mengirim kode verifikasi');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyCode = async (e: FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await axios.post('/user/telegram/session/verify-code', {
                code: otpCode,
                password: password || undefined,
            });

            if (response.data.requires_2fa) {
                setRequires2FA(true);
                setError('Akun memiliki 2FA, silakan masukkan password');
            } else if (response.data.success) {
                setCreateStep('bot-info');
            } else {
                setError(response.data.message || 'Kode verifikasi salah');
            }
        } catch (err: any) {
            if (err.response?.data?.requires_2fa) {
                setRequires2FA(true);
                setError('Akun memiliki 2FA, silakan masukkan password');
            } else {
                setError(err.response?.data?.message || 'Gagal memverifikasi kode');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleCreateBot = async (e: FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setCreateStep('creating');

        try {
            const response = await axios.post('/user/telegram/session/create-bot', {
                bot_name: botName,
                bot_username: botUsername,
            });

            if (response.data.success) {
                setCreatedBot(response.data.bot);
                setCreateStep('success');
                // Refresh session status and page
                checkSession();
                router.reload();
            } else {
                setError(response.data.message || 'Gagal membuat bot');
                setCreateStep('bot-info');
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Gagal membuat bot');
            setCreateStep('bot-info');
        } finally {
            setLoading(false);
        }
    };

    const handleToggleActive = (botId: number) => {
        router.post(`/user/telegram/bots/${botId}/toggle-active`);
    };

    const handleToggleAutoReply = (botId: number) => {
        router.post(`/user/telegram/bots/${botId}/toggle-auto-reply`);
    };

    const handleToggleAI = (botId: number) => {
        router.post(`/user/telegram/bots/${botId}/toggle-ai`);
    };

    const handleDeleteBot = (botId: number) => {
        router.delete(`/user/telegram/bots/${botId}`);
    };

    const renderDialogContent = () => {
        switch (createStep) {
            case 'method':
                return (
                    <>
                        <DialogHeader>
                            <DialogTitle>Tambah Bot Telegram</DialogTitle>
                            <DialogDescription>
                                Pilih metode untuk menambahkan bot
                            </DialogDescription>
                        </DialogHeader>
                        <div className="py-4 space-y-4">
                            {/* Show continue option if session is active */}
                            {telegramSession?.logged_in && telegramSession.user && (
                                <button
                                    onClick={() => setCreateStep('bot-info')}
                                    className="w-full p-4 border-2 border-green-200 bg-green-50 rounded-lg hover:bg-green-100 transition-colors text-left"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="flex size-10 items-center justify-center rounded-full bg-green-100">
                                            <CheckCircle2 className="size-5 text-green-600" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-green-700">Lanjutkan dengan Session Aktif</p>
                                            <p className="text-sm text-green-600">
                                                Login sebagai {telegramSession.user.first_name}
                                            </p>
                                        </div>
                                    </div>
                                </button>
                            )}
                            <button
                                onClick={() => setCreateStep('phone')}
                                className="w-full p-4 border rounded-lg hover:bg-muted transition-colors text-left"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="flex size-10 items-center justify-center rounded-full bg-blue-100">
                                        <Smartphone className="size-5 text-blue-600" />
                                    </div>
                                    <div>
                                        <p className="font-medium">Auto Create Bot</p>
                                        <p className="text-sm text-muted-foreground">
                                            {telegramSession?.logged_in ? 'Login ulang dengan nomor lain' : 'Buat bot otomatis via login Telegram'}
                                        </p>
                                    </div>
                                </div>
                            </button>
                            <button
                                onClick={() => setCreateStep('manual')}
                                className="w-full p-4 border rounded-lg hover:bg-muted transition-colors text-left"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="flex size-10 items-center justify-center rounded-full bg-gray-100">
                                        <Key className="size-5 text-gray-600" />
                                    </div>
                                    <div>
                                        <p className="font-medium">Input Token Manual</p>
                                        <p className="text-sm text-muted-foreground">
                                            Masukkan token dari @BotFather
                                        </p>
                                    </div>
                                </div>
                            </button>
                        </div>
                    </>
                );

            case 'phone':
                return (
                    <form onSubmit={handleSendCode}>
                        <DialogHeader>
                            <DialogTitle>Login Telegram</DialogTitle>
                            <DialogDescription>
                                Masukkan nomor telepon Telegram Anda
                            </DialogDescription>
                        </DialogHeader>
                        <div className="py-4 space-y-4">
                            <div>
                                <Label htmlFor="phone">Nomor Telepon</Label>
                                <Input
                                    id="phone"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    placeholder="+6281234567890"
                                    className="mt-2"
                                />
                                <p className="text-xs text-muted-foreground mt-1">
                                    Gunakan format internasional (+62...)
                                </p>
                            </div>
                            {error && (
                                <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
                                    {error}
                                </div>
                            )}
                            <div className="rounded-lg bg-amber-50 p-4 text-sm border border-amber-200">
                                <p className="font-medium text-amber-800">Penting:</p>
                                <p className="text-amber-700 mt-1">
                                    Akun Telegram Anda akan digunakan untuk membuat bot via BotFather.
                                    Pastikan nomor terdaftar di Telegram.
                                </p>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setCreateStep('method')}>
                                Kembali
                            </Button>
                            <Button type="submit" disabled={loading || !phone}>
                                {loading ? (
                                    <>
                                        <Loader2 className="mr-2 size-4 animate-spin" />
                                        Mengirim...
                                    </>
                                ) : (
                                    'Kirim Kode OTP'
                                )}
                            </Button>
                        </DialogFooter>
                    </form>
                );

            case 'otp':
                return (
                    <form onSubmit={handleVerifyCode}>
                        <DialogHeader>
                            <DialogTitle>Verifikasi Kode OTP</DialogTitle>
                            <DialogDescription>
                                Masukkan kode yang dikirim ke Telegram Anda
                            </DialogDescription>
                        </DialogHeader>
                        <div className="py-4 space-y-4">
                            <div>
                                <Label htmlFor="otp">Kode OTP</Label>
                                <Input
                                    id="otp"
                                    value={otpCode}
                                    onChange={(e) => setOtpCode(e.target.value)}
                                    placeholder="12345"
                                    className="mt-2 text-center text-2xl tracking-widest"
                                    maxLength={6}
                                />
                            </div>
                            {requires2FA && (
                                <div>
                                    <Label htmlFor="password">Password 2FA</Label>
                                    <Input
                                        id="password"
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="Masukkan password 2FA"
                                        className="mt-2"
                                    />
                                </div>
                            )}
                            {error && (
                                <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
                                    {error}
                                </div>
                            )}
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => {
                                setCreateStep('phone');
                                setOtpCode('');
                                setPassword('');
                                setRequires2FA(false);
                                setError('');
                            }}>
                                Kembali
                            </Button>
                            <Button type="submit" disabled={loading || !otpCode}>
                                {loading ? (
                                    <>
                                        <Loader2 className="mr-2 size-4 animate-spin" />
                                        Memverifikasi...
                                    </>
                                ) : (
                                    'Verifikasi'
                                )}
                            </Button>
                        </DialogFooter>
                    </form>
                );

            case 'bot-info':
                return (
                    <form onSubmit={handleCreateBot}>
                        <DialogHeader>
                            <DialogTitle>Informasi Bot</DialogTitle>
                            <DialogDescription>
                                Masukkan nama dan username untuk bot baru
                            </DialogDescription>
                        </DialogHeader>
                        <div className="py-4 space-y-4">
                            <div>
                                <Label htmlFor="botName">Nama Bot</Label>
                                <Input
                                    id="botName"
                                    value={botName}
                                    onChange={(e) => setBotName(e.target.value)}
                                    placeholder="My Awesome Bot"
                                    className="mt-2"
                                />
                                <p className="text-xs text-muted-foreground mt-1">
                                    Nama yang ditampilkan untuk bot (bisa menggunakan spasi)
                                </p>
                            </div>
                            <div>
                                <Label htmlFor="botUsername">Username Bot</Label>
                                <div className="flex items-center mt-2">
                                    <span className="px-3 py-2 bg-muted rounded-l-md border border-r-0 text-muted-foreground">
                                        @
                                    </span>
                                    <Input
                                        id="botUsername"
                                        value={botUsername}
                                        onChange={(e) => setBotUsername(e.target.value.replace(/[^a-zA-Z0-9_]/g, ''))}
                                        placeholder="my_awesome_bot"
                                        className="rounded-l-none"
                                    />
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">
                                    Hanya huruf, angka, dan underscore. Harus diakhiri dengan 'bot'.
                                </p>
                            </div>
                            {error && (
                                <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
                                    {error}
                                </div>
                            )}
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => {
                                setCreateStep('otp');
                                setError('');
                            }}>
                                Kembali
                            </Button>
                            <Button type="submit" disabled={loading || !botName || !botUsername}>
                                {loading ? (
                                    <>
                                        <Loader2 className="mr-2 size-4 animate-spin" />
                                        Membuat Bot...
                                    </>
                                ) : (
                                    'Buat Bot'
                                )}
                            </Button>
                        </DialogFooter>
                    </form>
                );

            case 'creating':
                return (
                    <>
                        <DialogHeader>
                            <DialogTitle>Membuat Bot...</DialogTitle>
                            <DialogDescription>
                                Mohon tunggu, sedang berkomunikasi dengan BotFather
                            </DialogDescription>
                        </DialogHeader>
                        <div className="py-12 flex flex-col items-center justify-center">
                            <Loader2 className="size-12 animate-spin text-blue-600 mb-4" />
                            <p className="text-muted-foreground text-center">
                                Proses ini mungkin memerlukan waktu beberapa detik...
                            </p>
                        </div>
                    </>
                );

            case 'success':
                return (
                    <>
                        <DialogHeader>
                            <DialogTitle>Bot Berhasil Dibuat!</DialogTitle>
                            <DialogDescription>
                                Bot Telegram Anda siap digunakan
                            </DialogDescription>
                        </DialogHeader>
                        <div className="py-8 flex flex-col items-center justify-center">
                            <div className="flex size-16 items-center justify-center rounded-full bg-green-100 mb-4">
                                <CheckCircle2 className="size-8 text-green-600" />
                            </div>
                            {createdBot && (
                                <div className="text-center">
                                    <p className="text-lg font-semibold">@{createdBot.username}</p>
                                    <p className="text-muted-foreground">{createdBot.name}</p>
                                </div>
                            )}
                        </div>
                        <DialogFooter>
                            <Button onClick={handleCloseDialog} className="w-full">
                                Selesai
                            </Button>
                        </DialogFooter>
                    </>
                );

            case 'manual':
                return (
                    <form onSubmit={handleAddBot}>
                        <DialogHeader>
                            <DialogTitle>Input Token Manual</DialogTitle>
                            <DialogDescription>
                                Masukkan token bot dari @BotFather
                            </DialogDescription>
                        </DialogHeader>
                        <div className="py-4 space-y-4">
                            <div>
                                <Label htmlFor="bot_token">Bot Token</Label>
                                <Input
                                    id="bot_token"
                                    value={data.bot_token}
                                    onChange={(e) => setData('bot_token', e.target.value)}
                                    placeholder="123456789:ABCdefGHIjklMNOpqrsTUVwxyz"
                                    className="mt-2 font-mono text-sm"
                                />
                                {errors.bot_token && (
                                    <p className="text-sm text-destructive mt-1">{errors.bot_token}</p>
                                )}
                            </div>
                            <div className="rounded-lg bg-muted p-4 text-sm space-y-2">
                                <p className="font-medium">Cara mendapatkan Bot Token:</p>
                                <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
                                    <li>Buka Telegram, cari @BotFather</li>
                                    <li>Kirim /newbot untuk buat bot baru</li>
                                    <li>Ikuti instruksi untuk memberi nama bot</li>
                                    <li>Copy token yang diberikan</li>
                                </ol>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setCreateStep('method')}>
                                Kembali
                            </Button>
                            <Button type="submit" disabled={processing}>
                                {processing ? 'Memvalidasi...' : 'Tambah Bot'}
                            </Button>
                        </DialogFooter>
                    </form>
                );

            default:
                return null;
        }
    };

    return (
        <UserLayout>
            <Head title="Telegram Bots" />

            <div className="space-y-6">
                {/* Header */}
                <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-6 border">
                    <div className="absolute inset-0 bg-grid-white/10 [mask-image:radial-gradient(white,transparent_85%)]" />
                    <div className="relative flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight text-foreground">Telegram Bots</h1>
                            <p className="text-muted-foreground mt-1">
                                Kelola bot Telegram untuk broadcast dan auto-reply
                            </p>
                        </div>
                        <Dialog open={showAddDialog} onOpenChange={(open) => {
                            setShowAddDialog(open);
                            if (!open) resetAutoCreate();
                        }}>
                            <DialogTrigger asChild>
                                <Button size="lg" className="gap-2">
                                    <Plus className="size-4" />
                                    Tambah Bot
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                {renderDialogContent()}
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>

                {/* Telegram Session Status */}
                {telegramSession?.logged_in && telegramSession.user && (
                    <Card className="overflow-hidden border-2 border-blue-200 bg-blue-50/30">
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center justify-between">
                                Status Akun Personal
                                <Badge variant="outline" className="border-blue-500 text-blue-600 bg-blue-100">
                                    Terhubung
                                </Badge>
                            </CardTitle>
                            <CardDescription>
                                Akun ini digunakan untuk membuat bot dan menjalankan fitur Userbot (Auto-Reply Personal).
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                                <div className="flex items-center gap-3 w-full">
                                    <div className="flex size-12 items-center justify-center rounded-full bg-blue-100">
                                        <User className="size-6 text-blue-600" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-semibold text-lg">
                                            {telegramSession.user.first_name} {telegramSession.user.last_name || ''}
                                        </p>
                                        <p className="text-sm text-muted-foreground font-mono">
                                            {telegramSession.user.username ? `@${telegramSession.user.username}` : telegramSession.user.phone}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
                                    <div className="flex gap-2 w-full">
                                        <Button
                                            onClick={async () => {
                                                setSessionLoading(true);
                                                try {
                                                    await axios.post('/user/telegram/session/start-auto-reply');
                                                    alert('Auto-reply personal berhasil diaktifkan!');
                                                } catch (err: any) {
                                                    alert(err.response?.data?.message || 'Gagal mengaktifkan auto-reply');
                                                } finally {
                                                    setSessionLoading(false);
                                                }
                                            }}
                                            disabled={sessionLoading}
                                            className="flex-1 bg-green-600 hover:bg-green-700"
                                            size="sm"
                                        >
                                            <Zap className="mr-2 size-4" />
                                            Start Auto-Reply
                                        </Button>

                                        <Button
                                            onClick={async () => {
                                                setSessionLoading(true);
                                                try {
                                                    await axios.post('/user/telegram/session/stop-auto-reply');
                                                    alert('Auto-reply personal dihentikan.');
                                                } catch (err: any) {
                                                    alert(err.response?.data?.message || 'Gagal menghentikan auto-reply');
                                                } finally {
                                                    setSessionLoading(false);
                                                }
                                            }}
                                            disabled={sessionLoading}
                                            variant="secondary"
                                            size="sm"
                                            className="flex-1"
                                        >
                                            <PowerCircle className="mr-2 size-4" />
                                            Stop
                                        </Button>
                                    </div>

                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <Button variant="destructive" size="sm" disabled={sessionLoading} className="w-full sm:w-auto">
                                                {sessionLoading ? (
                                                    <Loader2 className="mr-2 size-4 animate-spin" />
                                                ) : (
                                                    <LogOut className="mr-2 size-4" />
                                                )}
                                                Logout
                                            </Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>Hapus Session Telegram?</AlertDialogTitle>
                                                <AlertDialogDescription>
                                                    Session akan dihapus dari server. Fitur Userbot akan berhenti berfungsi.
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>Batal</AlertDialogCancel>
                                                <AlertDialogAction onClick={handleLogoutSession}>
                                                    Hapus Session
                                                </AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Bots List */}
                {bots.length === 0 ? (
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex flex-col items-center justify-center py-12">
                                <Bot className="size-16 text-muted-foreground mb-4" />
                                <h3 className="text-xl font-semibold mb-2">Belum Ada Bot</h3>
                                <p className="text-muted-foreground text-center mb-4">
                                    Tambahkan bot Telegram untuk mulai broadcast dan auto-reply
                                </p>
                                <Button onClick={() => setShowAddDialog(true)}>
                                    <Plus className="mr-2 size-4" />
                                    Tambah Bot Pertama
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {bots.map((bot) => (
                            <Card key={bot.id} className="flex flex-col overflow-hidden border-2">
                                <div className="h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />
                                <CardHeader>
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="flex size-12 items-center justify-center rounded-full bg-blue-100">
                                                <Bot className="size-6 text-blue-600" />
                                            </div>
                                            <div>
                                                <CardTitle className="text-lg">
                                                    @{bot.bot_username}
                                                </CardTitle>
                                                <CardDescription>
                                                    {bot.bot_first_name}
                                                </CardDescription>
                                            </div>
                                        </div>
                                        <Badge variant={bot.is_active ? 'default' : 'secondary'}>
                                            {bot.is_active ? 'Aktif' : 'Nonaktif'}
                                        </Badge>
                                    </div>
                                </CardHeader>
                                <CardContent className="flex-1 space-y-4">
                                    {/* Stats */}
                                    <div className="grid grid-cols-3 gap-2 text-center">
                                        <div className="rounded-lg bg-muted p-2">
                                            <Users className="size-4 mx-auto text-muted-foreground mb-1" />
                                            <p className="text-lg font-semibold">{bot.contacts_count}</p>
                                            <p className="text-xs text-muted-foreground">Kontak</p>
                                        </div>
                                        <div className="rounded-lg bg-muted p-2">
                                            <MessageSquare className="size-4 mx-auto text-muted-foreground mb-1" />
                                            <p className="text-lg font-semibold">{bot.messages_count}</p>
                                            <p className="text-xs text-muted-foreground">Pesan</p>
                                        </div>
                                        <div className="rounded-lg bg-muted p-2">
                                            <Zap className="size-4 mx-auto text-muted-foreground mb-1" />
                                            <p className="text-lg font-semibold">{bot.auto_replies_count}</p>
                                            <p className="text-xs text-muted-foreground">Auto Reply</p>
                                        </div>
                                    </div>

                                    {/* Toggles */}
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <Label htmlFor={`active-${bot.id}`} className="text-sm">
                                                Bot Aktif
                                            </Label>
                                            <Switch
                                                id={`active-${bot.id}`}
                                                checked={bot.is_active}
                                                onCheckedChange={() => handleToggleActive(bot.id)}
                                            />
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <Label htmlFor={`auto-reply-${bot.id}`} className="text-sm">
                                                Auto Reply
                                            </Label>
                                            <Switch
                                                id={`auto-reply-${bot.id}`}
                                                checked={bot.auto_reply_enabled}
                                                onCheckedChange={() => handleToggleAutoReply(bot.id)}
                                            />
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <Label htmlFor={`ai-${bot.id}`} className="text-sm flex items-center gap-1">
                                                <Brain className="size-3" />
                                                AI Chatbot
                                            </Label>
                                            <Switch
                                                id={`ai-${bot.id}`}
                                                checked={bot.ai_enabled}
                                                onCheckedChange={() => handleToggleAI(bot.id)}
                                            />
                                        </div>
                                    </div>

                                    {bot.ai_enabled && (
                                        <div className="text-xs text-blue-600 bg-blue-50 rounded px-2 py-1">
                                            AI: {aiAssistantTypes?.[bot.ai_assistant_type] || bot.ai_assistant_type}
                                        </div>
                                    )}

                                    {bot.last_webhook_at && (
                                        <p className="text-xs text-muted-foreground">
                                            Pesan terakhir: {bot.last_webhook_at}
                                        </p>
                                    )}

                                    {/* Actions */}
                                    <div className="flex gap-2 pt-4 border-t">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="flex-1"
                                            onClick={() => router.visit(`/user/telegram/bots/${bot.id}/auto-replies`)}
                                        >
                                            <Settings className="mr-1 size-4" />
                                            Auto Reply
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="flex-1"
                                            onClick={() => router.visit('/user/telegram/broadcast')}
                                        >
                                            <Send className="mr-1 size-4" />
                                            Broadcast
                                        </Button>
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button variant="outline" size="sm">
                                                    <Trash2 className="size-4 text-destructive" />
                                                </Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>Hapus Bot?</AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        Bot @{bot.bot_username} dan semua datanya akan dihapus. Tindakan ini tidak dapat dibatalkan.
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>Batal</AlertDialogCancel>
                                                    <AlertDialogAction
                                                        onClick={() => handleDeleteBot(bot.id)}
                                                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                                    >
                                                        Hapus
                                                    </AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </UserLayout>
    );
}
