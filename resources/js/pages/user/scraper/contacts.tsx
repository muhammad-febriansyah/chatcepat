import { Head, router, Link } from '@inertiajs/react';
import UserLayout from '@/layouts/user/user-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, Download, Loader2, CheckCircle2, XCircle, Clock, AlertTriangle, ExternalLink, Search, ChevronLeft, ChevronRight, Trash2, Upload, FileSpreadsheet, Facebook, Instagram, MessageCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
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
import { Badge } from '@/components/ui/badge';

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
    const [activeTab, setActiveTab] = useState('meta');
    const [searchQuery, setSearchQuery] = useState('');
    const [importFile, setImportFile] = useState<File | null>(null);

    // Meta scraping states
    const [isScrapingMeta, setIsScrapingMeta] = useState(false);
    const [metaPlatform, setMetaPlatform] = useState<'whatsapp' | 'facebook' | 'instagram' | null>(null);
    const [metaContacts, setMetaContacts] = useState<any[]>([]);
    const [metaStats, setMetaStats] = useState<any>(null);
    const [metaAlertMessage, setMetaAlertMessage] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

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

    // Load Meta stats and contacts when Meta tab is active
    useEffect(() => {
        if (activeTab === 'meta') {
            loadMetaStats();
        }
    }, [activeTab]);

    const loadMetaStats = async () => {
        try {
            const response = await fetch('/user/scraper/meta/stats');
            const data = await response.json();
            if (data.success) {
                setMetaStats(data.data);
            }
        } catch (error) {
            console.error('Error loading Meta stats:', error);
        }
    };

    const loadMetaContacts = async (platform?: string) => {
        try {
            const url = platform ? `/user/scraper/meta/contacts?platform=${platform}` : '/user/scraper/meta/contacts';
            const response = await fetch(url);
            const data = await response.json();
            if (data.success) {
                setMetaContacts(data.data.data);
            }
        } catch (error) {
            console.error('Error loading Meta contacts:', error);
        }
    };

    const handleMetaScrape = async (platform: 'whatsapp' | 'facebook' | 'instagram') => {
        setIsScrapingMeta(true);
        setMetaPlatform(platform);
        setMetaAlertMessage(null);

        try {
            const endpoint = platform === 'whatsapp' ? 'whatsapp-cloud' : platform;
            const response = await fetch(`/user/contacts/scrape/${endpoint}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
            });

            const data = await response.json();

            if (data.success) {
                setMetaAlertMessage({
                    type: 'success',
                    message: data.message
                });
                // Reload stats and contacts
                loadMetaStats();
                loadMetaContacts(platform);
            } else {
                setMetaAlertMessage({
                    type: 'error',
                    message: data.error || 'Gagal scraping kontak'
                });
            }
        } catch (error) {
            setMetaAlertMessage({
                type: 'error',
                message: 'Terjadi kesalahan saat scraping kontak.'
            });
        } finally {
            setIsScrapingMeta(false);
            setMetaPlatform(null);
        }
    };

    return (
        <UserLayout>
            <Head title="Scraping Kontak WhatsApp" />

            <div className="space-y-6">
                {/* Header */}
                <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-green-500/10 via-green-500/5 to-transparent p-6 border">
                    <div className="absolute inset-0 bg-grid-white/10 [mask-image:radial-gradient(white,transparent_85%)]" />
                    <div className="relative">
                        <h1 className="text-3xl font-bold tracking-tight text-foreground">
                            Scraping Kontak WhatsApp
                        </h1>
                        <p className="text-muted-foreground mt-1">
                            Ambil kontak dari WhatsApp Cloud API (Official Meta Business)
                        </p>
                    </div>
                </div>

                {/* Tabs */}
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="meta" className="flex items-center gap-2">
                            <MessageCircle className="size-4" />
                            Scraping WhatsApp
                            {metaStats && metaStats.whatsapp > 0 && (
                                <span className="ml-1 inline-flex items-center justify-center rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                                    {metaStats.whatsapp}
                                </span>
                            )}
                        </TabsTrigger>
                        <TabsTrigger value="import" className="flex items-center gap-2">
                            <Upload className="size-4" />
                            Import Excel
                        </TabsTrigger>
                    </TabsList>

                    {/* Tab 1: WhatsApp Cloud API (Official) */}
                    <TabsContent value="meta" className="space-y-6 mt-6">
                        {/* Info Alert */}
                        <Alert className="bg-green-50 border-green-300">
                            <AlertDescription className="text-green-900">
                                <p className="font-medium mb-2">Scraping Kontak dari WhatsApp Cloud API</p>
                                <p className="text-sm">
                                    Scraping kontak dari WhatsApp Business API (Official Meta).
                                    Pastikan Anda sudah setup WhatsApp Business di <Link href="/user/meta/settings" className="underline font-medium">Meta Settings</Link>.
                                </p>
                            </AlertDescription>
                        </Alert>

                        {/* Alert Messages */}
                        {metaAlertMessage && (
                            <Alert
                                className={metaAlertMessage.type === 'error'
                                    ? 'bg-red-50 border-red-300'
                                    : 'bg-green-50 border-green-300'
                                }
                            >
                                <AlertDescription className={`flex items-center gap-2 ${metaAlertMessage.type === 'error' ? 'text-red-900' : 'text-green-900'}`}>
                                    {metaAlertMessage.type === 'success' ? (
                                        <CheckCircle2 className="size-4 flex-shrink-0" />
                                    ) : (
                                        <XCircle className="size-4 flex-shrink-0" />
                                    )}
                                    <span>{metaAlertMessage.message}</span>
                                </AlertDescription>
                            </Alert>
                        )}

                        <div className="grid gap-4 md:grid-cols-3">
                            {/* WhatsApp */}
                            <Card className="overflow-hidden border-2">
                                <div className="h-1 bg-gradient-to-r from-green-500 to-emerald-500" />
                                <CardHeader className="pb-2">
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="text-lg flex items-center gap-2">
                                            <MessageCircle className="size-5 text-green-600" />
                                            WhatsApp
                                        </CardTitle>
                                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Cloud API</Badge>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="text-2xl font-bold">{metaStats?.whatsapp || 0} <span className="text-sm font-normal text-muted-foreground">kontak</span></div>
                                    <Button
                                        onClick={() => handleMetaScrape('whatsapp')}
                                        disabled={isScrapingMeta}
                                        className="w-full"
                                        size="sm"
                                        variant="outline"
                                    >
                                        {isScrapingMeta && metaPlatform === 'whatsapp' ? (
                                            <Loader2 className="size-4 animate-spin" />
                                        ) : (
                                            <>
                                                <Download className="mr-2 size-4" />
                                                Scrape WhatsApp
                                            </>
                                        )}
                                    </Button>
                                </CardContent>
                            </Card>

                            {/* Facebook */}
                            <Card className="overflow-hidden border-2">
                                <div className="h-1 bg-gradient-to-r from-blue-500 to-indigo-500" />
                                <CardHeader className="pb-2">
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="text-lg flex items-center gap-2">
                                            <Facebook className="size-5 text-blue-600" />
                                            Facebook
                                        </CardTitle>
                                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Messenger</Badge>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="text-2xl font-bold">{metaStats?.facebook || 0} <span className="text-sm font-normal text-muted-foreground">kontak</span></div>
                                    <Button
                                        onClick={() => handleMetaScrape('facebook')}
                                        disabled={isScrapingMeta}
                                        className="w-full"
                                        size="sm"
                                        variant="outline"
                                    >
                                        {isScrapingMeta && metaPlatform === 'facebook' ? (
                                            <Loader2 className="size-4 animate-spin" />
                                        ) : (
                                            <>
                                                <Download className="mr-2 size-4" />
                                                Scrape Facebook
                                            </>
                                        )}
                                    </Button>
                                </CardContent>
                            </Card>

                            {/* Instagram */}
                            <Card className="overflow-hidden border-2">
                                <div className="h-1 bg-gradient-to-r from-pink-500 to-rose-500" />
                                <CardHeader className="pb-2">
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="text-lg flex items-center gap-2">
                                            <Instagram className="size-5 text-pink-600" />
                                            Instagram
                                        </CardTitle>
                                        <Badge variant="outline" className="bg-pink-50 text-pink-700 border-pink-200">Direct</Badge>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="text-2xl font-bold">{metaStats?.instagram || 0} <span className="text-sm font-normal text-muted-foreground">kontak</span></div>
                                    <Button
                                        onClick={() => handleMetaScrape('instagram')}
                                        disabled={isScrapingMeta}
                                        className="w-full"
                                        size="sm"
                                        variant="outline"
                                    >
                                        {isScrapingMeta && metaPlatform === 'instagram' ? (
                                            <Loader2 className="size-4 animate-spin" />
                                        ) : (
                                            <>
                                                <Download className="mr-2 size-4" />
                                                Scrape Instagram
                                            </>
                                        )}
                                    </Button>
                                </CardContent>
                            </Card>
                        </div>

                        {/* WhatsApp Contacts Table */}
                        {metaContacts.length > 0 && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Users className="size-5 text-green-600" />
                                        Daftar Kontak WhatsApp
                                    </CardTitle>
                                    <CardDescription>
                                        Kontak yang berhasil di-scrape dari WhatsApp Cloud API
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="rounded-md border">
                                        <table className="w-full text-sm">
                                            <thead className="bg-muted/50">
                                                <tr>
                                                    <th className="px-4 py-3 text-left font-medium">Nomor WhatsApp</th>
                                                    <th className="px-4 py-3 text-left font-medium">Nama</th>
                                                    <th className="px-4 py-3 text-left font-medium">Username</th>
                                                    <th className="px-4 py-3 text-left font-medium">Terakhir Chat</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {metaContacts.map((contact, index) => (
                                                    <tr key={contact.id} className={index % 2 === 0 ? 'bg-white dark:bg-transparent' : 'bg-muted/20'}>
                                                        <td className="px-4 py-3 font-mono text-xs">{contact.identifier}</td>
                                                        <td className="px-4 py-3">{contact.name || '-'}</td>
                                                        <td className="px-4 py-3">{contact.username || '-'}</td>
                                                        <td className="px-4 py-3 text-muted-foreground text-xs">{contact.last_message_at}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* How it works */}
                        <Card className="border-dashed">
                            <CardHeader>
                                <CardTitle>Cara Kerja Scraping WhatsApp</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
                                    <li>Setup WhatsApp Business Account di <Link href="/user/meta/settings" className="underline font-medium text-primary">Meta Settings</Link></li>
                                    <li>Klik tombol "Mulai Scraping Kontak WhatsApp"</li>
                                    <li>Sistem akan mengambil kontak dari history percakapan WhatsApp Business Anda</li>
                                    <li>Kontak disimpan otomatis ke database (auto-update jika sudah ada)</li>
                                    <li>Data kontak siap digunakan untuk broadcast atau campaign</li>
                                </ol>
                                <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                                    <p className="text-sm text-amber-900">
                                        <strong>Catatan:</strong> WhatsApp Cloud API hanya menyediakan kontak dari user yang pernah chat dengan WhatsApp Business Anda. Tidak bisa scrape semua kontak di phonebook.
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Tab 3: Import Excel */}
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
                                                            <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded ${session.status === 'connected'
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
                </Tabs>
            </div>
        </UserLayout>
    );
}
