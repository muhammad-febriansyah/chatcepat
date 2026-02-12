import { Head, router, Link } from '@inertiajs/react';
import { logger } from '@/utils/logger';
import axios from 'axios';
import UserLayout from '@/layouts/user/user-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, Download, Loader2, CheckCircle2, XCircle, Clock, AlertTriangle, ExternalLink, Search, ChevronLeft, ChevronRight, Trash2, Upload, FileSpreadsheet, MessageCircle, RefreshCw, Shield, Smartphone, WifiOff } from 'lucide-react';
import { useState, useEffect } from 'react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

interface Session {
    id: number;
    session_id: string;
    name: string;
    phone_number: string;
    status: string;
}

interface Contact {
    id: number;
    phone_number: string;
    display_name: string;
    push_name: string;
    session_name: string;
    metadata?: {
        source?: string;
        fromGroup?: string;
        isLidFormat?: boolean;
    };
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
    const [alertMessage, setAlertMessage] = useState<{ type: 'success' | 'error' | 'warning'; message: string } | null>(null);
    const [scrapeResult, setScrapeResult] = useState<{
        totalScraped: number;
        totalSaved: number;
        lidContacts?: number;
        realPhoneContacts?: number;
    } | null>(null);
    const [importResult, setImportResult] = useState<{ imported: number; skipped: number } | null>(null);
    const [activeTab, setActiveTab] = useState('whatsapp');
    const [searchQuery, setSearchQuery] = useState('');
    const [importFile, setImportFile] = useState<File | null>(null);
    const [scrapingProgress, setScrapingProgress] = useState(0);

    // Check if any session is connected
    const hasConnectedSession = sessions.some(s => s.status === 'connected');
    const connectedSessions = sessions.filter(s => s.status === 'connected');
    const selectedSessionObj = sessions.find(s => s.session_id === selectedSession);
    const isSelectedSessionConnected = selectedSessionObj?.status === 'connected';

    // Filter contacts by search query
    const filteredContacts = contacts?.data.filter(contact =>
        contact.phone_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
        contact.display_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        contact.push_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
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

        if (!isSelectedSessionConnected) {
            setAlertMessage({
                type: 'error',
                message: 'Session belum terhubung. Hubungkan session terlebih dahulu di halaman WhatsApp Management.'
            });
            return;
        }

        setIsScraping(true);
        setAlertMessage(null);
        setScrapeResult(null);
        setScrapingProgress(10);

        try {
            // Simulate progress
            const progressInterval = setInterval(() => {
                setScrapingProgress(prev => Math.min(prev + 5, 90));
            }, 500);

            const response = await axios.post('/user/contacts/scrape', {
                session_id: selectedSession
            });

            clearInterval(progressInterval);
            setScrapingProgress(100);

            const data = response.data;

            if (data.success) {
                const result = {
                    totalScraped: data.data.total_scraped,
                    totalSaved: data.data.total_saved,
                };
                setScrapeResult(result);

                // Check for LID warning in message
                const hasLidWarning = data.data.message?.toLowerCase().includes('lid');

                setAlertMessage({
                    type: hasLidWarning ? 'warning' : 'success',
                    message: data.message || `Berhasil! ${data.data.total_saved} kontak berhasil disimpan dari ${data.data.total_scraped} kontak yang ditemukan`
                });

                // Reload contacts after a delay
                setTimeout(() => {
                    router.reload({ only: ['contacts', 'stats'], preserveScroll: true });
                }, 1000);
            } else {
                setAlertMessage({
                    type: 'error',
                    message: data.error || 'Gagal mengambil kontak'
                });
            }
        } catch (error: any) {
            const errorMessage = error.response?.data?.error || error.response?.data?.message || 'Terjadi kesalahan saat mengambil kontak. Pastikan WhatsApp Gateway sedang berjalan.';
            setAlertMessage({
                type: 'error',
                message: errorMessage
            });
        } finally {
            setIsScraping(false);
            setScrapingProgress(0);
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

            const response = await axios.post('/user/contacts/import', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            const data = response.data;

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
                <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-green-500/10 via-green-500/5 to-transparent p-6 border">
                    <div className="absolute inset-0 bg-grid-white/10 [mask-image:radial-gradient(white,transparent_85%)]" />
                    <div className="relative">
                        <div className="flex items-start justify-between">
                            <div>
                                <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
                                    <MessageCircle className="size-8 text-green-600" />
                                    Scraping Kontak WhatsApp
                                </h1>
                                <p className="text-muted-foreground mt-1">
                                    Ambil kontak dari WhatsApp menggunakan Baileys Gateway (Non-Official)
                                </p>
                            </div>
                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300">
                                <Shield className="size-3 mr-1" />
                                Baileys Gateway
                            </Badge>
                        </div>
                    </div>
                </div>

                {/* Session Warning */}
                {!hasConnectedSession && (
                    <Alert className="border-amber-300 bg-amber-50">
                        <AlertTriangle className="size-5 text-amber-600" />
                        <AlertTitle className="text-amber-900 font-semibold">Tidak Ada Session Terhubung</AlertTitle>
                        <AlertDescription className="text-amber-800">
                            Anda belum memiliki session WhatsApp yang terhubung.
                            <Link href="/user/whatsapp" className="underline font-medium ml-1">
                                Hubungkan session WhatsApp terlebih dahulu
                            </Link> untuk mulai scraping kontak.
                        </AlertDescription>
                    </Alert>
                )}

                {/* Stats Cards */}
                {stats && (
                    <div className="grid gap-4 md:grid-cols-2">
                        <Card className="border-2">
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">Total Kontak</p>
                                        <p className="text-3xl font-bold text-green-600">{stats.total_contacts.toLocaleString('id-ID')}</p>
                                    </div>
                                    <div className="p-3 rounded-xl bg-green-100">
                                        <Users className="size-8 text-green-600" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="border-2">
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">Kontak dengan Nama</p>
                                        <p className="text-3xl font-bold text-blue-600">{stats.with_name.toLocaleString('id-ID')}</p>
                                    </div>
                                    <div className="p-3 rounded-xl bg-blue-100">
                                        <CheckCircle2 className="size-8 text-blue-600" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {/* Tabs */}
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="whatsapp" className="flex items-center gap-2">
                            <MessageCircle className="size-4" />
                            Scraping WhatsApp
                        </TabsTrigger>
                        <TabsTrigger value="import" className="flex items-center gap-2">
                            <Upload className="size-4" />
                            Import Excel
                        </TabsTrigger>
                    </TabsList>

                    {/* Tab 1: WhatsApp Baileys Scraping */}
                    <TabsContent value="whatsapp" className="space-y-6 mt-6">
                        {/* Scraping Card */}
                        <Card className="overflow-hidden border-2">
                            <div className="h-1 bg-gradient-to-r from-green-500 to-emerald-500" />
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Smartphone className="size-5 text-green-600" />
                                    Scrape Kontak dari WhatsApp
                                </CardTitle>
                                <CardDescription>
                                    Ambil kontak dari store kontak, chat history, dan member group WhatsApp Anda
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {/* Alert Messages */}
                                {alertMessage && activeTab === 'whatsapp' && (
                                    <Alert
                                        className={
                                            alertMessage.type === 'error' ? 'bg-red-50 border-red-300' :
                                            alertMessage.type === 'warning' ? 'bg-amber-50 border-amber-300' :
                                            'bg-green-50 border-green-300'
                                        }
                                    >
                                        <AlertDescription className={`flex items-center gap-2 ${
                                            alertMessage.type === 'error' ? 'text-red-900' :
                                            alertMessage.type === 'warning' ? 'text-amber-900' :
                                            'text-green-900'
                                        }`}>
                                            {alertMessage.type === 'success' || alertMessage.type === 'warning' ? (
                                                <CheckCircle2 className="size-4 flex-shrink-0" />
                                            ) : (
                                                <XCircle className="size-4 flex-shrink-0" />
                                            )}
                                            <span>{alertMessage.message}</span>
                                        </AlertDescription>
                                    </Alert>
                                )}

                                {/* Scrape Result */}
                                {scrapeResult && (
                                    <div className="grid gap-4 md:grid-cols-2">
                                        <Card className="bg-green-50 border-green-200">
                                            <CardContent className="pt-6">
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <p className="text-sm font-medium text-green-900">Total Ditemukan</p>
                                                        <p className="text-3xl font-bold text-green-700">{scrapeResult.totalScraped}</p>
                                                    </div>
                                                    <Search className="size-8 text-green-600" />
                                                </div>
                                            </CardContent>
                                        </Card>
                                        <Card className="bg-blue-50 border-blue-200">
                                            <CardContent className="pt-6">
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <p className="text-sm font-medium text-blue-900">Berhasil Disimpan</p>
                                                        <p className="text-3xl font-bold text-blue-700">{scrapeResult.totalSaved}</p>
                                                    </div>
                                                    <CheckCircle2 className="size-8 text-blue-600" />
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </div>
                                )}

                                {/* Session Selection */}
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Pilih WhatsApp Session</label>
                                    <Select value={selectedSession} onValueChange={handleSessionChange} disabled={!hasConnectedSession}>
                                        <SelectTrigger className="h-12">
                                            <SelectValue placeholder={hasConnectedSession ? "Pilih session untuk scraping..." : "Tidak ada session terhubung"} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {connectedSessions.map((session) => (
                                                <SelectItem key={session.id} value={session.session_id}>
                                                    <div className="flex items-center gap-2">
                                                        <Smartphone className="size-4 text-green-600" />
                                                        <span className="font-medium">{session.name}</span>
                                                        <span className="text-xs text-muted-foreground">({session.phone_number})</span>
                                                        <Badge className="bg-green-100 text-green-700 text-xs">Connected</Badge>
                                                    </div>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {selectedSessionObj && !isSelectedSessionConnected && (
                                        <p className="text-sm text-red-600 flex items-center gap-1">
                                            <WifiOff className="size-3" />
                                            Session ini tidak terhubung. Pilih session yang status-nya "connected".
                                        </p>
                                    )}
                                </div>

                                {/* Progress Bar */}
                                {isScraping && scrapingProgress > 0 && (
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-muted-foreground">Proses Scraping...</span>
                                            <span className="font-medium">{scrapingProgress}%</span>
                                        </div>
                                        <Progress value={scrapingProgress} className="h-2" />
                                    </div>
                                )}

                                {/* Scrape Button */}
                                <Button
                                    onClick={handleScrapeContacts}
                                    disabled={isScraping || !selectedSession || !hasConnectedSession}
                                    className="w-full h-12 text-base bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                                    size="lg"
                                >
                                    {isScraping ? (
                                        <>
                                            <Loader2 className="mr-2 size-5 animate-spin" />
                                            Sedang scraping kontak...
                                        </>
                                    ) : (
                                        <>
                                            <Download className="mr-2 size-5" />
                                            Mulai Scraping Kontak
                                        </>
                                    )}
                                </Button>
                            </CardContent>
                        </Card>

                        {/* How it works */}
                        <Card className="border-dashed">
                            <CardHeader>
                                <CardTitle>Cara Kerja Scraping WhatsApp (Baileys)</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
                                        <li>Pastikan WhatsApp session sudah terhubung (scan QR code)</li>
                                        <li>Pilih session yang akan digunakan untuk scraping</li>
                                        <li>Klik tombol "Mulai Scraping Kontak"</li>
                                        <li>Sistem akan mengambil kontak dari 3 sumber:
                                            <ul className="list-disc list-inside ml-6 mt-2 space-y-1">
                                                <li><strong>Contact Store</strong> - Kontak yang tersimpan di WhatsApp</li>
                                                <li><strong>Chat List</strong> - Kontak dari daftar chat Anda</li>
                                                <li><strong>Group Members</strong> - Member dari semua group yang Anda ikuti</li>
                                            </ul>
                                        </li>
                                        <li>Kontak disimpan otomatis ke database (auto-update jika sudah ada)</li>
                                    </ol>
                                    <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                        <p className="text-sm text-blue-900 font-medium mb-2">💡 Tips:</p>
                                        <ul className="text-sm text-blue-800 space-y-1 ml-4">
                                            <li>• Scraping dari group member akan memberikan hasil paling banyak</li>
                                            <li>• Tunggu minimal 30 menit antara 2 scraping untuk menghindari rate limit</li>
                                            <li>• Kontak dengan format LID akan dicoba diresolve ke nomor asli</li>
                                        </ul>
                                    </div>
                                    <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                                        <p className="text-sm text-amber-900">
                                            <strong>⚠️ Peringatan:</strong> Gunakan fitur ini dengan bijak. Scraping terlalu sering dapat menyebabkan akun WhatsApp Anda diblokir oleh WhatsApp. Disarankan maksimal 3-5 kali scraping per hari.
                                        </p>
                                    </div>
                                </div>
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
