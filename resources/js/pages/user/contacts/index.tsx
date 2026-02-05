import { Head, router } from '@inertiajs/react';
import axios from 'axios';
import UserLayout from '@/layouts/user/user-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import { columns, Contact } from './columns';
import { Users, Plus, UserPlus, Download, Loader2, RotateCcw } from 'lucide-react';
import { useState } from 'react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface Session {
    id: number;
    session_id: string;
    name: string;
    status: string;
}

interface Stats {
    total: number;
    with_name: number;
    ready_broadcast: number;
}

interface PaginatedContacts {
    data: Contact[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
}

interface ContactsPageProps {
    contacts: PaginatedContacts;
    sessions: Session[];
    stats: Stats;
    filters: {
        search?: string;
    };
}

export default function ContactsIndex({ contacts, sessions, stats, filters }: ContactsPageProps) {
    const [isScraping, setIsScraping] = useState(false);
    const [isResetting, setIsResetting] = useState(false);
    const [selectedSession, setSelectedSession] = useState<string>('');
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [alertMessage, setAlertMessage] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
    const [scrapingResult, setScrapingResult] = useState<{ scraped: number; saved: number } | null>(null);

    const handleDialogChange = (open: boolean) => {
        setIsDialogOpen(open);
        if (open) {
            // Reset state when dialog opens
            setAlertMessage(null);
            setScrapingResult(null);
        }
    };

    const handleScrapeContacts = async () => {
        if (!selectedSession) {
            setAlertMessage({
                type: 'error',
                message: 'Pilih session terlebih dahulu'
            });
            return;
        }

        setIsScraping(true);
        setAlertMessage(null);
        setScrapingResult(null);

        try {
            const response = await axios.post('/user/contacts/scrape', {
                session_id: selectedSession
            });

            const data = response.data;

            if (data.success) {
                setScrapingResult({
                    scraped: data.data.total_scraped || 0,
                    saved: data.data.total_saved || 0
                });
                setAlertMessage({
                    type: 'success',
                    message: `Berhasil! ${data.data.total_saved} kontak disimpan dari ${data.data.total_scraped} kontak yang ditemukan`
                });
                // Auto reload after 3 seconds
                setTimeout(() => {
                    handleDialogChange(false);
                    router.reload();
                }, 3000);
            } else {
                setAlertMessage({
                    type: 'error',
                    message: data.error || 'Gagal mengambil kontak'
                });
            }
        } catch (error) {
            setAlertMessage({
                type: 'error',
                message: 'Terjadi kesalahan saat mengambil kontak. Pastikan WhatsApp Gateway sedang berjalan.'
            });
        } finally {
            setIsScraping(false);
        }
    };

    const handleResetCooldown = async () => {
        if (!selectedSession) {
            setAlertMessage({
                type: 'error',
                message: 'Pilih session terlebih dahulu'
            });
            return;
        }

        setIsResetting(true);
        setAlertMessage(null);

        try {
            const response = await axios.post('/user/contacts/scrape/reset', {
                session_id: selectedSession
            });

            const data = response.data;

            if (data.success) {
                setAlertMessage({
                    type: 'success',
                    message: data.message || 'Cooldown berhasil direset. Anda bisa scraping lagi.'
                });
            } else {
                setAlertMessage({
                    type: 'error',
                    message: data.error || 'Gagal reset cooldown'
                });
            }
        } catch (error) {
            setAlertMessage({
                type: 'error',
                message: 'Terjadi kesalahan saat reset cooldown'
            });
        } finally {
            setIsResetting(false);
        }
    };

    return (
        <UserLayout>
            <Head title="Kontak WhatsApp" />

            <div className="space-y-6">
                {/* Header */}
                <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-6 border">
                    <div className="absolute inset-0 bg-grid-white/10 [mask-image:radial-gradient(white,transparent_85%)]" />
                    <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight text-foreground">
                                Kontak WhatsApp
                            </h1>
                            <p className="text-muted-foreground mt-1">
                                Kelola kontak untuk broadcast WhatsApp
                            </p>
                        </div>
                        <div className="flex flex-wrap gap-3">
                            <Dialog open={isDialogOpen} onOpenChange={handleDialogChange}>
                                <DialogTrigger asChild>
                                    <Button variant="outline" size="lg" className="gap-2">
                                        <Download className="size-4" />
                                        Scrape Kontak
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-md">
                                    <DialogHeader>
                                        <DialogTitle>Scrape Kontak WhatsApp</DialogTitle>
                                        <DialogDescription>
                                            Ambil kontak dari WhatsApp session yang aktif.
                                            <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm">
                                                <p className="font-medium text-amber-900 mb-1">⚠️ Batas Scraping (Anti-Ban)</p>
                                                <ul className="text-amber-800 space-y-1 text-xs">
                                                    <li>• Max: 3x scraping per hari</li>
                                                    <li>• Cooldown: 2 jam antar scraping</li>
                                                    <li>• Max: 200 kontak per scraping</li>
                                                    <li>• Delay: 5-12 detik (human-like)</li>
                                                </ul>
                                            </div>
                                        </DialogDescription>
                                    </DialogHeader>
                                    <div className="space-y-4 py-4">
                                        {alertMessage && (
                                            <Alert
                                                variant={alertMessage.type === 'error' ? 'destructive' : 'default'}
                                                className={alertMessage.type === 'error' ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'}
                                            >
                                                <AlertDescription className={alertMessage.type === 'error' ? 'text-red-900' : 'text-green-900'}>
                                                    {alertMessage.message}
                                                </AlertDescription>
                                            </Alert>
                                        )}
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Pilih WhatsApp Session</label>
                                            <Select value={selectedSession} onValueChange={setSelectedSession}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Pilih session..." />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {sessions.map((session) => (
                                                        <SelectItem key={session.id} value={session.session_id}>
                                                            <div className="flex items-center gap-2">
                                                                <span>{session.name}</span>
                                                                <span className={`text-xs px-2 py-0.5 rounded ${session.status === 'connected'
                                                                        ? 'bg-green-100 text-green-700'
                                                                        : 'bg-gray-100 text-gray-700'
                                                                    }`}>
                                                                    {session.status}
                                                                </span>
                                                            </div>
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        {sessions.length === 0 && (
                                            <div className="text-sm text-muted-foreground bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                                                Tidak ada session aktif. Buat session terlebih dahulu.
                                            </div>
                                        )}

                                        {/* Scraping Progress/Result */}
                                        {isScraping && (
                                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                                <div className="flex items-center gap-3">
                                                    <Loader2 className="size-5 animate-spin text-blue-600" />
                                                    <div>
                                                        <p className="font-medium text-blue-900">Sedang mengambil kontak...</p>
                                                        <p className="text-sm text-blue-700 mt-1">Proses ini membutuhkan waktu 1-2 menit</p>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {scrapingResult && !isScraping && (
                                            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                                <div className="space-y-2">
                                                    <p className="font-medium text-green-900">✅ Scraping Selesai!</p>
                                                    <div className="grid grid-cols-2 gap-3 mt-3">
                                                        <div className="bg-white rounded-lg p-3 border border-green-200">
                                                            <p className="text-sm text-gray-600">Kontak Ditemukan</p>
                                                            <p className="text-2xl font-bold text-green-700">{scrapingResult.scraped}</p>
                                                        </div>
                                                        <div className="bg-white rounded-lg p-3 border border-green-200">
                                                            <p className="text-sm text-gray-600">Kontak Disimpan</p>
                                                            <p className="text-2xl font-bold text-green-700">{scrapingResult.saved}</p>
                                                        </div>
                                                    </div>
                                                    <p className="text-xs text-green-700 mt-2">Halaman akan reload dalam 3 detik...</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    <DialogFooter className="flex-col sm:flex-row gap-2">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={handleResetCooldown}
                                            disabled={isScraping || isResetting || !selectedSession}
                                            className="text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                                        >
                                            {isResetting ? (
                                                <Loader2 className="mr-2 size-4 animate-spin" />
                                            ) : (
                                                <RotateCcw className="mr-2 size-4" />
                                            )}
                                            Reset Cooldown (Test)
                                        </Button>
                                        <div className="flex gap-2">
                                            <Button variant="outline" onClick={() => handleDialogChange(false)} disabled={isScraping}>
                                                Batal
                                            </Button>
                                            <Button onClick={handleScrapeContacts} disabled={isScraping || !selectedSession}>
                                                {isScraping ? (
                                                    <>
                                                        <Loader2 className="mr-2 size-4 animate-spin" />
                                                        Mengambil kontak...
                                                    </>
                                                ) : (
                                                    'Mulai Scrape'
                                                )}
                                            </Button>
                                        </div>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                            <Button onClick={() => router.visit('/user/contacts/create')} size="lg" className="gap-2">
                                <Plus className="size-4" />
                                Tambah Kontak
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Statistics */}
                <div className="grid gap-4 md:grid-cols-3">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Total Kontak
                            </CardTitle>
                            <Users className="size-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.total}</div>
                            <p className="text-xs text-muted-foreground">
                                Kontak tersimpan
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Siap Broadcast
                            </CardTitle>
                            <UserPlus className="size-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.ready_broadcast}</div>
                            <p className="text-xs text-muted-foreground">
                                Kontak aktif (non-group)
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Dengan Nama
                            </CardTitle>
                            <Users className="size-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.with_name}</div>
                            <p className="text-xs text-muted-foreground">
                                Kontak bernama
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Contacts Table */}
                <Card className="overflow-hidden border-2">
                    <div className="h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Users className="size-5 text-primary" />
                            Daftar Kontak
                        </CardTitle>
                        <CardDescription>
                            Kelola kontak WhatsApp untuk keperluan broadcast
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="w-full overflow-x-auto">
                            <DataTable
                                columns={columns}
                                data={contacts.data}
                                searchKey="display_name"
                                searchPlaceholder="Cari nama kontak..."
                            />
                        </div>
                    </CardContent>
                </Card>
            </div>
        </UserLayout>
    );
}
