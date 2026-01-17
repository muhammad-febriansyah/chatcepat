import { Head, router, Link } from '@inertiajs/react';
import UserLayout from '@/layouts/user/user-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, Download, Loader2, CheckCircle2, XCircle, Clock, AlertTriangle, ExternalLink, Search, ChevronLeft, ChevronRight, Trash2, Upload, FileSpreadsheet } from 'lucide-react';
import { useState } from 'react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';

interface Session {
    id: number;
    session_id: string;
    name: string;
    status: string;
}

interface Contact {
    id: number;
    phone_number: string;
    display_name: string;
    session_name: string;
    created_at: string;
}

interface PaginatedContacts {
    data: Contact[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
}

interface ContactsScraperProps {
    sessions: Session[];
    contacts?: PaginatedContacts;
    stats?: {
        total_contacts: number;
        with_name: number;
    };
}

export default function ContactsScraper({ sessions, contacts, stats }: ContactsScraperProps) {
    const [isScraping, setIsScraping] = useState(false);
    const [isImporting, setIsImporting] = useState(false);
    const [selectedSession, setSelectedSession] = useState<string>('');
    const [selectedSessionId, setSelectedSessionId] = useState<number | null>(null);
    const [alertMessage, setAlertMessage] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
    const [scrapeResult, setScrapeResult] = useState<{ totalScraped: number; totalSaved: number } | null>(null);
    const [importResult, setImportResult] = useState<{ imported: number; skipped: number } | null>(null);
    const [activeTab, setActiveTab] = useState('scrape');
    const [searchQuery, setSearchQuery] = useState('');
    const [importFile, setImportFile] = useState<File | null>(null);

    // Check if any session is connected
    const hasConnectedSession = sessions.some(s => s.status === 'connected');
    const selectedSessionObj = sessions.find(s => s.session_id === selectedSession);
    const isSelectedSessionConnected = selectedSessionObj?.status === 'connected';

    // Filter contacts by search query
    const filteredContacts = contacts?.data.filter(contact =>
        contact.phone_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
        contact.display_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        contact.session_name.toLowerCase().includes(searchQuery.toLowerCase())
    ) || [];

    // Pagination handlers
    const handlePageChange = (page: number) => {
        router.get('/user/scraper/contacts', { page }, { preserveState: true, preserveScroll: true });
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
        setScrapeResult(null);

        try {
            const response = await fetch('/user/contacts/scrape', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify({ session_id: selectedSession }),
            });

            const data = await response.json();

            if (data.success) {
                setScrapeResult({
                    totalScraped: data.data.total_scraped,
                    totalSaved: data.data.total_saved,
                });
                setAlertMessage({
                    type: 'success',
                    message: `Berhasil! ${data.data.total_saved} kontak berhasil disimpan dari ${data.data.total_scraped} kontak yang ditemukan`
                });
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

    const handleImportContacts = async () => {
        if (!importFile || !selectedSessionId) {
            setAlertMessage({
                type: 'error',
                message: 'Pilih file dan session terlebih dahulu'
            });
            return;
        }

        setIsImporting(true);
        setAlertMessage(null);
        setImportResult(null);

        try {
            const formData = new FormData();
            formData.append('file', importFile);
            formData.append('session_id', selectedSessionId.toString());

            const response = await fetch('/user/contacts/import', {
                method: 'POST',
                headers: {
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: formData,
            });

            const data = await response.json();

            if (data.success) {
                setImportResult({
                    imported: data.data.imported,
                    skipped: data.data.skipped,
                });
                setAlertMessage({
                    type: 'success',
                    message: data.message
                });
                setImportFile(null);
                // Refresh the page to show new contacts
                router.reload({ only: ['contacts', 'stats'] });
            } else {
                setAlertMessage({
                    type: 'error',
                    message: data.error || 'Gagal import kontak'
                });
            }
        } catch (error) {
            setAlertMessage({
                type: 'error',
                message: 'Terjadi kesalahan saat import kontak.'
            });
        } finally {
            setIsImporting(false);
        }
    };

    const handleSessionChange = (sessionId: string) => {
        setSelectedSession(sessionId);
        const session = sessions.find(s => s.session_id === sessionId);
        setSelectedSessionId(session?.id || null);
    };

    return (
        <UserLayout>
            <Head title="Scraping Kontak WhatsApp" />

            <div className="space-y-6">
                {/* Header */}
                <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-6 border">
                    <div className="absolute inset-0 bg-grid-white/10 [mask-image:radial-gradient(white,transparent_85%)]" />
                    <div className="relative">
                        <h1 className="text-3xl font-bold tracking-tight text-foreground">
                            Scraping Kontak WhatsApp
                        </h1>
                        <p className="text-muted-foreground mt-1">
                            Ambil semua kontak dari WhatsApp session yang terhubung
                        </p>
                    </div>
                </div>

                {/* Tabs */}
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="scrape" className="flex items-center gap-2">
                            <Download className="size-4" />
                            Scraping
                        </TabsTrigger>
                        <TabsTrigger value="import" className="flex items-center gap-2">
                            <Upload className="size-4" />
                            Import Excel
                        </TabsTrigger>
                        <TabsTrigger value="results" className="flex items-center gap-2">
                            <Users className="size-4" />
                            Hasil
                            {stats && stats.total_contacts > 0 && (
                                <span className="ml-1 inline-flex items-center justify-center rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                                    {stats.total_contacts}
                                </span>
                            )}
                        </TabsTrigger>
                    </TabsList>

                    {/* Tab 1: Scraping */}
                    <TabsContent value="scrape" className="space-y-6 mt-6">
                        {/* Info Cards */}
                        <div className="grid gap-4 md:grid-cols-3">
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">
                                        Rate Limit
                                    </CardTitle>
                                    <Clock className="size-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold text-green-600">3x / Hari</div>
                                    <p className="text-xs text-muted-foreground">
                                        Maksimal scraping per hari (Profil Aman)
                                    </p>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">
                                        Cooldown
                                    </CardTitle>
                                    <Clock className="size-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold text-blue-600">2 Jam</div>
                                    <p className="text-xs text-muted-foreground">
                                        Waktu tunggu antar scraping
                                    </p>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">
                                        Max Kontak
                                    </CardTitle>
                                    <Users className="size-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold text-purple-600">200</div>
                                    <p className="text-xs text-muted-foreground">
                                        Kontak per sesi scraping (Anti-Ban)
                                    </p>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Scraping Form */}
                        <Card className="overflow-hidden border-2">
                            <div className="h-1 bg-gradient-to-r from-green-500 to-blue-500" />
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Download className="size-5 text-primary" />
                                    Mulai Scraping Kontak
                                </CardTitle>
                                <CardDescription>
                                    Pilih WhatsApp session dan mulai proses scraping. Proses ini membutuhkan waktu beberapa menit tergantung jumlah kontak.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {/* Warning if no connected sessions */}
                                {!hasConnectedSession && (
                                    <Alert className="bg-amber-50 border-amber-300">
                                        <AlertTriangle className="size-4 text-amber-600" />
                                        <AlertDescription className="text-amber-900">
                                            <p className="font-medium mb-2">Session WhatsApp belum terhubung</p>
                                            <p className="text-sm mb-3">
                                                Untuk melakukan scraping kontak, Anda harus menghubungkan session WhatsApp terlebih dahulu dengan scan QR code.
                                            </p>
                                            <Link href="/user/whatsapp">
                                                <Button variant="outline" size="sm" className="gap-2 bg-white">
                                                    <ExternalLink className="size-3" />
                                                    Buka WhatsApp Management
                                                </Button>
                                            </Link>
                                        </AlertDescription>
                                    </Alert>
                                )}

                                {/* Success/Error Messages */}
                                {alertMessage && (
                                    <Alert
                                        className={alertMessage.type === 'error'
                                            ? 'bg-red-50 border-red-300'
                                            : 'bg-green-50 border-green-300'
                                        }
                                    >
                                        <AlertDescription className={`flex items-center gap-2 ${alertMessage.type === 'error' ? 'text-red-900' : 'text-green-900'}`}>
                                            {alertMessage.type === 'success' ? (
                                                <CheckCircle2 className="size-4 flex-shrink-0" />
                                            ) : (
                                                <XCircle className="size-4 flex-shrink-0" />
                                            )}
                                            <span>{alertMessage.message}</span>
                                        </AlertDescription>
                                    </Alert>
                                )}

                                {scrapeResult && (
                                    <Card className="bg-green-50 border-green-200">
                                        <CardContent className="pt-6">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="text-sm font-medium text-green-900">Total Kontak Ditemukan</p>
                                                    <p className="text-3xl font-bold text-green-700">{scrapeResult.totalScraped}</p>
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-green-900">Berhasil Disimpan</p>
                                                    <p className="text-3xl font-bold text-green-700">{scrapeResult.totalSaved}</p>
                                                </div>
                                            </div>
                                            <Button
                                                onClick={() => setActiveTab('results')}
                                                className="w-full mt-4"
                                                variant="outline"
                                            >
                                                Lihat Hasil Scraping
                                            </Button>
                                        </CardContent>
                                    </Card>
                                )}

                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Pilih WhatsApp Session</label>
                                        <Select value={selectedSession} onValueChange={setSelectedSession} disabled={sessions.length === 0}>
                                            <SelectTrigger className="h-12">
                                                <SelectValue placeholder="Pilih session yang terhubung..." />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {sessions.map((session) => (
                                                    <SelectItem
                                                        key={session.id}
                                                        value={session.session_id}
                                                        disabled={session.status !== 'connected'}
                                                    >
                                                        <div className="flex items-center gap-2">
                                                            <span className="font-medium">{session.name}</span>
                                                            {session.status === 'connected' ? (
                                                                <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded bg-green-100 text-green-700 font-medium">
                                                                    <CheckCircle2 className="size-3" />
                                                                    Connected
                                                                </span>
                                                            ) : (
                                                                <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded bg-gray-100 text-gray-600">
                                                                    <XCircle className="size-3" />
                                                                    {session.status}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>

                                        {/* Warning if selected session is disconnected */}
                                        {selectedSession && !isSelectedSessionConnected && (
                                            <Alert className="bg-red-50 border-red-300">
                                                <XCircle className="size-4 text-red-600" />
                                                <AlertDescription className="text-red-900">
                                                    <p className="font-medium mb-1">Session yang dipilih belum terhubung</p>
                                                    <p className="text-sm">
                                                        Silakan pilih session dengan status "Connected" atau hubungkan session ini terlebih dahulu.
                                                    </p>
                                                </AlertDescription>
                                            </Alert>
                                        )}

                                        {sessions.length === 0 && (
                                            <div className="text-sm text-amber-900 bg-amber-50 border border-amber-200 rounded-lg p-3">
                                                Tidak ada session aktif. Buat dan hubungkan session WhatsApp terlebih dahulu.
                                            </div>
                                        )}
                                    </div>

                                    <Alert className="bg-blue-50 border-blue-200">
                                        <AlertDescription className="text-blue-900 text-sm">
                                            Proses scraping menggunakan sistem anti-ban dengan delay 5-12 detik antar request untuk menghindari pemblokiran dari WhatsApp. Total waktu: 1-2 menit untuk 200 kontak.
                                        </AlertDescription>
                                    </Alert>

                                    <Button
                                        onClick={handleScrapeContacts}
                                        disabled={isScraping || !selectedSession || !isSelectedSessionConnected || sessions.length === 0}
                                        className="w-full h-12 text-base"
                                        size="lg"
                                    >
                                        {isScraping ? (
                                            <>
                                                <Loader2 className="mr-2 size-5 animate-spin" />
                                                Sedang mengambil kontak...
                                            </>
                                        ) : (
                                            <>
                                                <Download className="mr-2 size-5" />
                                                Mulai Scraping Kontak
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>

                        {/* How it works */}
                        <Card className="border-dashed">
                            <CardHeader>
                                <CardTitle>Cara Kerja Scraping</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
                                    <li>Pilih WhatsApp session yang sudah terhubung</li>
                                    <li>Klik tombol "Mulai Scraping Kontak"</li>
                                    <li>Sistem akan mengambil semua kontak dari WhatsApp Anda</li>
                                    <li>Kontak akan disimpan otomatis ke database dengan user_id Anda</li>
                                    <li>Kontak duplikat akan diupdate, bukan diduplikasi</li>
                                    <li>Setelah selesai, lihat hasilnya di tab "Hasil Scraping"</li>
                                </ol>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Tab 2: Import Excel */}
                    <TabsContent value="import" className="space-y-6 mt-6">
                        <Card className="overflow-hidden border-2">
                            <div className="h-1 bg-gradient-to-r from-blue-500 to-purple-500" />
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <FileSpreadsheet className="size-5 text-primary" />
                                    Import Kontak dari Excel/CSV
                                </CardTitle>
                                <CardDescription>
                                    Upload file Excel atau CSV berisi daftar kontak WhatsApp. Format: phone_number, display_name
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {/* Alert Messages */}
                                {alertMessage && activeTab === 'import' && (
                                    <Alert
                                        className={alertMessage.type === 'error'
                                            ? 'bg-red-50 border-red-300'
                                            : 'bg-green-50 border-green-300'
                                        }
                                    >
                                        <AlertDescription className={`flex items-center gap-2 ${alertMessage.type === 'error' ? 'text-red-900' : 'text-green-900'}`}>
                                            {alertMessage.type === 'success' ? (
                                                <CheckCircle2 className="size-4 flex-shrink-0" />
                                            ) : (
                                                <XCircle className="size-4 flex-shrink-0" />
                                            )}
                                            <span>{alertMessage.message}</span>
                                        </AlertDescription>
                                    </Alert>
                                )}

                                {importResult && (
                                    <Card className="bg-green-50 border-green-200">
                                        <CardContent className="pt-6">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="text-sm font-medium text-green-900">Berhasil Import</p>
                                                    <p className="text-3xl font-bold text-green-700">{importResult.imported}</p>
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-green-900">Dilewati</p>
                                                    <p className="text-3xl font-bold text-amber-600">{importResult.skipped}</p>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                )}

                                <div className="space-y-4">
                                    {/* Download Template */}
                                    <div className="flex items-center justify-between p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                        <div>
                                            <p className="font-medium text-blue-900">Download Template</p>
                                            <p className="text-sm text-blue-700">Download file template CSV untuk format yang benar</p>
                                        </div>
                                        <a href="/user/contacts/template" download>
                                            <Button variant="outline" size="sm" className="gap-2">
                                                <Download className="size-4" />
                                                Template CSV
                                            </Button>
                                        </a>
                                    </div>

                                    {/* Session Selection */}
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Pilih WhatsApp Session</label>
                                        <Select value={selectedSession} onValueChange={handleSessionChange}>
                                            <SelectTrigger className="h-12">
                                                <SelectValue placeholder="Pilih session untuk menyimpan kontak..." />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {sessions.map((session) => (
                                                    <SelectItem key={session.id} value={session.session_id}>
                                                        <div className="flex items-center gap-2">
                                                            <span className="font-medium">{session.name}</span>
                                                            <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded ${
                                                                session.status === 'connected'
                                                                    ? 'bg-green-100 text-green-700'
                                                                    : 'bg-gray-100 text-gray-600'
                                                            }`}>
                                                                {session.status}
                                                            </span>
                                                        </div>
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    {/* File Upload */}
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Upload File Excel/CSV</label>
                                        <div className="border-2 border-dashed rounded-lg p-6 text-center hover:border-primary/50 transition-colors">
                                            <input
                                                type="file"
                                                accept=".xlsx,.xls,.csv"
                                                onChange={(e) => setImportFile(e.target.files?.[0] || null)}
                                                className="hidden"
                                                id="file-upload"
                                            />
                                            <label htmlFor="file-upload" className="cursor-pointer">
                                                <Upload className="size-10 mx-auto text-muted-foreground mb-2" />
                                                {importFile ? (
                                                    <div>
                                                        <p className="font-medium text-primary">{importFile.name}</p>
                                                        <p className="text-sm text-muted-foreground">
                                                            {(importFile.size / 1024).toFixed(1)} KB
                                                        </p>
                                                    </div>
                                                ) : (
                                                    <div>
                                                        <p className="font-medium">Klik untuk upload file</p>
                                                        <p className="text-sm text-muted-foreground">
                                                            Format: .xlsx, .xls, .csv (max 10MB)
                                                        </p>
                                                    </div>
                                                )}
                                            </label>
                                        </div>
                                    </div>

                                    <Button
                                        onClick={handleImportContacts}
                                        disabled={isImporting || !importFile || !selectedSessionId}
                                        className="w-full h-12 text-base"
                                        size="lg"
                                    >
                                        {isImporting ? (
                                            <>
                                                <Loader2 className="mr-2 size-5 animate-spin" />
                                                Sedang mengimport...
                                            </>
                                        ) : (
                                            <>
                                                <Upload className="mr-2 size-5" />
                                                Import Kontak
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Format Guide */}
                        <Card className="border-dashed">
                            <CardHeader>
                                <CardTitle>Format File Excel/CSV</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <p className="text-sm text-muted-foreground">
                                        File harus memiliki header di baris pertama. Kolom yang didukung:
                                    </p>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm border">
                                            <thead className="bg-muted/50">
                                                <tr>
                                                    <th className="px-4 py-2 text-left border">Kolom</th>
                                                    <th className="px-4 py-2 text-left border">Keterangan</th>
                                                    <th className="px-4 py-2 text-left border">Contoh</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                <tr>
                                                    <td className="px-4 py-2 border font-mono">phone_number</td>
                                                    <td className="px-4 py-2 border">Nomor telepon (wajib)</td>
                                                    <td className="px-4 py-2 border">6281234567890 atau 081234567890</td>
                                                </tr>
                                                <tr>
                                                    <td className="px-4 py-2 border font-mono">display_name</td>
                                                    <td className="px-4 py-2 border">Nama kontak (opsional)</td>
                                                    <td className="px-4 py-2 border">John Doe</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                    <Alert className="bg-amber-50 border-amber-200">
                                        <AlertDescription className="text-amber-900 text-sm">
                                            Nomor dengan awalan 0 akan otomatis dikonversi ke format 62 (Indonesia).
                                            Contoh: 081234567890 → 6281234567890
                                        </AlertDescription>
                                    </Alert>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Tab 3: Results */}
                    <TabsContent value="results" className="space-y-6 mt-6">
                        {/* Stats Cards */}
                        <div className="grid gap-4 md:grid-cols-2">
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">
                                        Total Kontak
                                    </CardTitle>
                                    <Users className="size-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{stats?.total_contacts || 0}</div>
                                    <p className="text-xs text-muted-foreground">
                                        Kontak tersimpan di database
                                    </p>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">
                                        Dengan Nama
                                    </CardTitle>
                                    <CheckCircle2 className="size-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold text-green-600">{stats?.with_name || 0}</div>
                                    <p className="text-xs text-muted-foreground">
                                        Kontak dengan nama tersimpan
                                    </p>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Search and Actions */}
                        <Card>
                            <CardHeader>
                                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                    <div>
                                        <CardTitle className="flex items-center gap-2">
                                            <Users className="size-5 text-primary" />
                                            Daftar Kontak
                                        </CardTitle>
                                        <CardDescription>
                                            Semua kontak hasil scraping WhatsApp Anda
                                        </CardDescription>
                                    </div>
                                    <div className="flex items-center gap-2 w-full sm:w-auto">
                                        <div className="relative flex-1 sm:w-64">
                                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                                            <Input
                                                placeholder="Cari kontak..."
                                                value={searchQuery}
                                                onChange={(e) => setSearchQuery(e.target.value)}
                                                className="pl-9"
                                            />
                                        </div>
                                        <Link href="/user/contacts">
                                            <Button variant="outline" size="sm" className="gap-2">
                                                <ExternalLink className="size-4" />
                                                Master Data
                                            </Button>
                                        </Link>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                {contacts && contacts.data.length > 0 ? (
                                    <>
                                        <div className="rounded-md border">
                                            <table className="w-full text-sm">
                                                <thead className="bg-muted/50">
                                                    <tr>
                                                        <th className="px-4 py-3 text-left font-medium">No. Telepon</th>
                                                        <th className="px-4 py-3 text-left font-medium">Nama</th>
                                                        <th className="px-4 py-3 text-left font-medium">Session</th>
                                                        <th className="px-4 py-3 text-left font-medium">Tanggal</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {(searchQuery ? filteredContacts : contacts.data).map((contact, index) => (
                                                        <tr key={contact.id} className={index % 2 === 0 ? 'bg-white dark:bg-transparent' : 'bg-muted/20'}>
                                                            <td className="px-4 py-3 font-mono">{contact.phone_number}</td>
                                                            <td className="px-4 py-3">{contact.display_name}</td>
                                                            <td className="px-4 py-3">{contact.session_name}</td>
                                                            <td className="px-4 py-3 text-muted-foreground">{contact.created_at}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>

                                        {/* Pagination */}
                                        {!searchQuery && contacts.last_page > 1 && (
                                            <div className="mt-4 flex items-center justify-between">
                                                <span className="text-sm text-muted-foreground">
                                                    Menampilkan {contacts.data.length} dari {contacts.total} kontak
                                                </span>
                                                <div className="flex items-center gap-2">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => handlePageChange(contacts.current_page - 1)}
                                                        disabled={contacts.current_page === 1}
                                                    >
                                                        <ChevronLeft className="size-4" />
                                                        Sebelumnya
                                                    </Button>
                                                    <span className="text-sm text-muted-foreground">
                                                        Halaman {contacts.current_page} dari {contacts.last_page}
                                                    </span>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => handlePageChange(contacts.current_page + 1)}
                                                        disabled={contacts.current_page === contacts.last_page}
                                                    >
                                                        Selanjutnya
                                                        <ChevronRight className="size-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        )}

                                        {/* Search results info */}
                                        {searchQuery && (
                                            <div className="mt-4 text-sm text-muted-foreground">
                                                Ditemukan {filteredContacts.length} kontak dari pencarian "{searchQuery}"
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-12">
                                        <Users className="size-12 text-muted-foreground/50 mb-4" />
                                        <h3 className="text-lg font-medium text-muted-foreground">Belum Ada Kontak</h3>
                                        <p className="text-sm text-muted-foreground/70 mt-1 text-center">
                                            Mulai scraping untuk mengambil kontak dari WhatsApp Anda
                                        </p>
                                        <Button
                                            onClick={() => setActiveTab('scrape')}
                                            className="mt-4"
                                            variant="outline"
                                        >
                                            <Download className="mr-2 size-4" />
                                            Mulai Scraping
                                        </Button>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </UserLayout>
    );
}
