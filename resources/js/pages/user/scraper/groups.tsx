import { Head, router, Link } from '@inertiajs/react';
import { logger } from '@/utils/logger';
import axios from 'axios';
import UserLayout from '@/layouts/user/user-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, Download, Loader2, CheckCircle2, XCircle, Clock, Search, ChevronLeft, ChevronRight, Shield, Lock, Unlock, MessageSquare, Eye, Phone, UserCircle, X, AlertCircle, Facebook, MessageCircle } from 'lucide-react';
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
import { Badge } from '@/components/ui/badge';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';

interface Session {
    id: number;
    session_id: string;
    name: string;
    status: string;
}

interface Group {
    id: number;
    group_jid: string;
    name: string;
    description: string | null;
    participants_count: number;
    admins_count: number;
    is_announce: boolean;
    is_locked: boolean;
    session_name: string;
    formatted_date: string;
    platform: string;
}

interface GroupMember {
    id: number;
    phone_number: string | null;
    display_name: string;
    is_admin: boolean;
    is_super_admin: boolean;
    is_lid_format: boolean;
    identifier: string;
}

interface PaginatedGroups {
    data: Group[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
}

interface GroupsScraperProps {
    sessions: Session[];
    groups?: PaginatedGroups;
    stats?: {
        total_groups: number;
        total_participants: number;
    };
}

export default function GroupsScraper({ sessions, groups, stats }: GroupsScraperProps) {
    const [isScraping, setIsScraping] = useState(false);
    const [selectedSession, setSelectedSession] = useState<string>('');
    const [alertMessage, setAlertMessage] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
    const [scrapeResult, setScrapeResult] = useState<{ totalScraped: number; totalSaved: number } | null>(null);
    const [activeTab, setActiveTab] = useState('meta');
    const [searchQuery, setSearchQuery] = useState('');

    // Members modal state
    const [membersModalOpen, setMembersModalOpen] = useState(false);
    const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
    const [members, setMembers] = useState<GroupMember[]>([]);
    const [membersStats, setMembersStats] = useState<{ total: number; with_phone: number; admins: number } | null>(null);
    const [isLoadingMembers, setIsLoadingMembers] = useState(false);
    const [isScrapingMembers, setIsScrapingMembers] = useState(false);
    const [memberSearchQuery, setMemberSearchQuery] = useState('');

    // Check if any session is connected
    const hasConnectedSession = sessions.some(s => s.status === 'connected');
    const selectedSessionObj = sessions.find(s => s.session_id === selectedSession);
    const isSelectedSessionConnected = selectedSessionObj?.status === 'connected';

    // Filter groups by search query
    const filteredGroups = groups?.data.filter(group =>
        group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        group.session_name.toLowerCase().includes(searchQuery.toLowerCase())
    ) || [];

    // Filter members by search query
    const filteredMembers = members.filter(member =>
        member.display_name.toLowerCase().includes(memberSearchQuery.toLowerCase()) ||
        (member.phone_number && member.phone_number.includes(memberSearchQuery))
    );

    // Pagination handlers
    const handlePageChange = (page: number) => {
        router.get('/user/scraper/groups', { page }, { preserveState: true, preserveScroll: true });
    };

    const [isScrapingMeta, setIsScrapingMeta] = useState(false);
    const [metaAlertMessage, setMetaAlertMessage] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

    const handleScrapeGroups = async () => {
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
            const response = await axios.post('/user/groups/scrape', {
                session_id: selectedSession
            });
            const data = response.data;

            if (data.success) {
                setScrapeResult({
                    totalScraped: data.data.total_scraped,
                    totalSaved: data.data.total_saved,
                });
                setAlertMessage({
                    type: 'success',
                    message: `Berhasil! ${data.data.total_saved} grup berhasil disimpan dari ${data.data.total_scraped} grup yang ditemukan`
                });
                // Refresh page to show new groups
                router.reload({ only: ['groups', 'stats'] });
            } else {
                setAlertMessage({
                    type: 'error',
                    message: data.error || 'Gagal mengambil grup'
                });
            }
        } catch (error) {
            setAlertMessage({
                type: 'error',
                message: 'Terjadi kesalahan saat mengambil grup. Pastikan WhatsApp Gateway sedang berjalan.'
            });
        } finally {
            setIsScraping(false);
        }
    };

    const handleMetaScrapeGroups = async () => {
        setIsScrapingMeta(true);
        setMetaAlertMessage(null);

        try {
            const response = await axios.post('/user/groups/scrape/whatsapp-cloud');
            const data = response.data;

            if (data.success) {
                setMetaAlertMessage({
                    type: 'success',
                    message: data.message
                });
                // Refresh page
                router.reload({ only: ['groups', 'stats'] });
            } else {
                setMetaAlertMessage({
                    type: 'error',
                    message: data.error || 'Gagal mengambil grup dari Cloud API'
                });
            }
        } catch (error) {
            setMetaAlertMessage({
                type: 'error',
                message: 'Terjadi kesalahan saat mengambil grup dari Cloud API.'
            });
        } finally {
            setIsScrapingMeta(false);
        }
    };

    const handleViewMembers = async (group: Group) => {
        setSelectedGroup(group);
        setMembersModalOpen(true);
        setIsLoadingMembers(true);
        setMembers([]);
        setMembersStats(null);
        setMemberSearchQuery('');

        try {
            const response = await axios.get(`/user/groups/${group.id}/members`);
            const data = response.data;

            if (data.success) {
                setMembers(data.data.members);
                setMembersStats(data.data.stats);
            }
        } catch (error) {
            logger.error('Error fetching members:', error);
        } finally {
            setIsLoadingMembers(false);
        }
    };

    const handleScrapeMembers = async () => {
        if (!selectedGroup) return;

        setIsScrapingMembers(true);

        try {
            const response = await axios.post(`/user/groups/${selectedGroup.id}/members/scrape`);
            const data = response.data;

            if (data.success) {
                // Refresh members list
                setMembers(data.data.members.map((m: any) => ({
                    id: 0,
                    phone_number: m.phoneNumber,
                    display_name: m.displayName || m.pushName || '-',
                    is_admin: m.isAdmin,
                    is_super_admin: m.isSuperAdmin,
                    is_lid_format: m.isLidFormat,
                    identifier: m.phoneNumber || (m.isLidFormat ? 'LID' : m.participantJid),
                })));
                setMembersStats({
                    total: data.data.totalMembers,
                    with_phone: data.data.totalWithPhone,
                    admins: data.data.members.filter((m: any) => m.isAdmin).length,
                });
                // Refresh page to update participants count
                router.reload({ only: ['groups', 'stats'] });
            } else {
                alert(data.error || 'Gagal mengambil anggota grup');
            }
        } catch (error) {
            logger.error('Error scraping members:', error);
            alert('Terjadi kesalahan. Pastikan WhatsApp Gateway berjalan dan session terhubung.');
        } finally {
            setIsScrapingMembers(false);
        }
    };

    return (
        <UserLayout>
            <Head title="Scraping Grup WhatsApp" />

            <div className="space-y-6">
                {/* Header */}
                <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-green-500/10 via-green-500/5 to-transparent p-6 border">
                    <div className="absolute inset-0 bg-grid-white/10 [mask-image:radial-gradient(white,transparent_85%)]" />
                    <div className="relative">
                        <h1 className="text-3xl font-bold tracking-tight text-foreground">
                            Scraping Grup WhatsApp
                        </h1>
                        <p className="text-muted-foreground mt-1">
                            Informasi tentang limitasi WhatsApp Cloud API untuk scraping groups
                        </p>
                    </div>
                </div>

                {/* Tabs */}
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="meta" className="flex items-center gap-2">
                            <Download className="size-4" />
                            Mulai Scraping
                        </TabsTrigger>
                        <TabsTrigger value="results" className="flex items-center gap-2">
                            <Users className="size-4" />
                            Hasil Scraping
                            {stats && stats.total_groups > 0 && (
                                <span className="ml-1 inline-flex items-center justify-center rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                                    {stats.total_groups}
                                </span>
                            )}
                        </TabsTrigger>
                    </TabsList>

                    {/* Tab 1: Scraping Methods */}
                    <TabsContent value="meta" className="space-y-6 mt-6">
                        {/* Global Alert Messages */}
                        {(alertMessage || metaAlertMessage) && (
                            <div className="space-y-2">
                                {alertMessage && (
                                    <Alert className={alertMessage.type === 'error' ? 'bg-red-50 border-red-300' : 'bg-green-50 border-green-300'}>
                                        <AlertDescription className={`flex items-center gap-2 ${alertMessage.type === 'error' ? 'text-red-900' : 'text-green-900'}`}>
                                            {alertMessage.type === 'success' ? <CheckCircle2 className="size-4" /> : <XCircle className="size-4" />}
                                            <span>{alertMessage.message}</span>
                                        </AlertDescription>
                                    </Alert>
                                )}
                                {metaAlertMessage && (
                                    <Alert className={metaAlertMessage.type === 'error' ? 'bg-red-50 border-red-300' : 'bg-green-50 border-green-300'}>
                                        <AlertDescription className={`flex items-center gap-2 ${metaAlertMessage.type === 'error' ? 'text-red-900' : 'text-green-900'}`}>
                                            {metaAlertMessage.type === 'success' ? <CheckCircle2 className="size-4" /> : <XCircle className="size-4" />}
                                            <span>{metaAlertMessage.message}</span>
                                        </AlertDescription>
                                    </Alert>
                                )}
                            </div>
                        )}

                        <div className="grid gap-6 md:grid-cols-2">
                            {/* Card 1: WhatsApp Web (Baileys) */}
                            <Card className="overflow-hidden border-2 flex flex-col">
                                <div className="h-1 bg-gradient-to-r from-blue-500 to-indigo-500" />
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="flex items-center gap-2">
                                            <MessageCircle className="size-5 text-blue-600" />
                                            WhatsApp Web
                                        </CardTitle>
                                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Session Based</Badge>
                                    </div>
                                    <CardDescription>
                                        Scrape grup menggunakan koneksi WhatsApp Web (QR Scan).
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4 flex-1">
                                    <div className="space-y-2">
                                        <label className="text-xs font-medium text-muted-foreground">Pilih Session</label>
                                        <Select value={selectedSession} onValueChange={setSelectedSession}>
                                            <SelectTrigger className="w-full">
                                                <SelectValue placeholder="Pilih session..." />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {sessions.map((session) => (
                                                    <SelectItem key={session.id} value={session.session_id}>
                                                        <div className="flex items-center gap-2">
                                                            <span className="font-medium">{session.name}</span>
                                                            <span className={`text-[10px] px-1.5 py-0.5 rounded ${session.status === 'connected' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                                                                {session.status}
                                                            </span>
                                                        </div>
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="p-3 bg-blue-50/50 rounded-lg border border-blue-100">
                                        <p className="text-[11px] text-blue-900 leading-relaxed">
                                            <strong>Kelebihan:</strong> Mendukung semua jenis grup tanpa verifikasi bisnis.<br />
                                            <strong>Kekurangan:</strong> Memerlukan session aktif dan rentan terhadap limitasi WhatsApp Web.
                                        </p>
                                    </div>
                                </CardContent>
                                <CardFooter>
                                    <Button
                                        onClick={handleScrapeGroups}
                                        disabled={isScraping || !selectedSession}
                                        className="w-full"
                                    >
                                        {isScraping ? (
                                            <>
                                                <Loader2 className="mr-2 size-4 animate-spin" />
                                                Loading...
                                            </>
                                        ) : (
                                            <>
                                                <Download className="mr-2 size-4" />
                                                Mulai Scrape (Baileys)
                                            </>
                                        )}
                                    </Button>
                                </CardFooter>
                            </Card>

                            {/* Card 2: WhatsApp Cloud API (Meta) */}
                            <Card className="overflow-hidden border-2 flex flex-col">
                                <div className="h-1 bg-gradient-to-r from-green-500 to-emerald-500" />
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="flex items-center gap-2">
                                            <MessageCircle className="size-5 text-green-600" />
                                            WhatsApp Cloud
                                        </CardTitle>
                                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Official API</Badge>
                                    </div>
                                    <CardDescription>
                                        Scrape grup menggunakan Official WhatsApp Business API.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4 flex-1">
                                    <Alert className="bg-amber-50 border-amber-200 py-2">
                                        <AlertCircle className="size-4 text-amber-600" />
                                        <AlertDescription className="text-[11px] text-amber-900">
                                            Memerlukan status <strong>Official Business Account (OBA)</strong>. Akun bisnis biasa tidak dapat menggunakan fitur ini.
                                        </AlertDescription>
                                    </Alert>
                                    <div className="p-3 bg-green-50/50 rounded-lg border border-green-100">
                                        <p className="text-[11px] text-green-900 leading-relaxed">
                                            <strong>Kelebihan:</strong> Stabil, resmi, dan didukung penuh oleh Meta.<br />
                                            <strong>Kekurangan:</strong> Proses verifikasi bisnis sulit (OBA required).
                                        </p>
                                    </div>
                                </CardContent>
                                <CardFooter>
                                    <Button
                                        onClick={handleMetaScrapeGroups}
                                        disabled={isScrapingMeta}
                                        className="w-full"
                                        variant="outline"
                                    >
                                        {isScrapingMeta ? (
                                            <>
                                                <Loader2 className="mr-2 size-4 animate-spin" />
                                                Loading...
                                            </>
                                        ) : (
                                            <>
                                                <Shield className="mr-2 size-4" />
                                                Mulai Scrape (Cloud API)
                                            </>
                                        )}
                                    </Button>
                                </CardFooter>
                            </Card>
                        </div>

                        <Card className="bg-muted/30 border-dashed">
                            <CardContent className="pt-6">
                                <div className="text-center">
                                    <p className="text-sm text-muted-foreground">
                                        Tips: Gunakan <strong>WhatsApp Web</strong> jika Anda ingin scraping cepat tanpa verifikasi Meta Business.
                                    </p>
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
                                    <CardTitle className="text-sm font-medium">Total Grup</CardTitle>
                                    <Users className="size-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{stats?.total_groups || 0}</div>
                                    <p className="text-xs text-muted-foreground">Grup tersimpan di database</p>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Total Anggota</CardTitle>
                                    <Users className="size-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold text-green-600">{stats?.total_participants || 0}</div>
                                    <p className="text-xs text-muted-foreground">Total anggota dari semua grup</p>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Search and List */}
                        <Card>
                            <CardHeader>
                                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                    <div>
                                        <CardTitle className="flex items-center gap-2">
                                            <Users className="size-5 text-primary" />
                                            Daftar Grup
                                        </CardTitle>
                                        <CardDescription>
                                            Semua grup hasil scraping WhatsApp Anda
                                        </CardDescription>
                                    </div>
                                    <div className="relative w-full sm:w-64">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                                        <Input
                                            placeholder="Cari grup..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="pl-9"
                                        />
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                {groups && groups.data.length > 0 ? (
                                    <>
                                        <div className="rounded-md border overflow-x-auto">
                                            <table className="w-full text-sm">
                                                <thead className="bg-muted/50">
                                                    <tr>
                                                        <th className="px-4 py-3 text-left font-medium">Nama Grup</th>
                                                        <th className="px-4 py-3 text-left font-medium text-center">Platform</th>
                                                        <th className="px-4 py-3 text-left font-medium">Anggota</th>
                                                        <th className="px-4 py-3 text-left font-medium">Admin</th>
                                                        <th className="px-4 py-3 text-left font-medium">Status</th>
                                                        <th className="px-4 py-3 text-left font-medium">Tanggal</th>
                                                        <th className="px-4 py-3 text-center font-medium">Aksi</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {(searchQuery ? filteredGroups : groups.data).map((group, index) => (
                                                        <tr key={group.id} className={index % 2 === 0 ? 'bg-white dark:bg-transparent' : 'bg-muted/20'}>
                                                            <td className="px-4 py-3">
                                                                <div className="font-medium">{group.name}</div>
                                                                {group.description && (
                                                                    <div className="text-xs text-muted-foreground truncate max-w-[200px]">
                                                                        {group.description}
                                                                    </div>
                                                                )}
                                                            </td>
                                                            <td className="px-4 py-3 text-center">
                                                                {group.platform === 'whatsapp_cloud' ? (
                                                                    <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-green-200">Cloud API</Badge>
                                                                ) : (
                                                                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Baileys</Badge>
                                                                )}
                                                            </td>
                                                            <td className="px-4 py-3">
                                                                <div className="flex items-center gap-1">
                                                                    <Users className="size-4 text-muted-foreground" />
                                                                    <span className="font-medium">{group.participants_count}</span>
                                                                </div>
                                                            </td>
                                                            <td className="px-4 py-3">
                                                                <div className="flex items-center gap-1">
                                                                    <Shield className="size-4 text-blue-500" />
                                                                    <span>{group.admins_count}</span>
                                                                </div>
                                                            </td>
                                                            <td className="px-4 py-3">
                                                                <div className="flex flex-wrap gap-1">
                                                                    {group.is_announce && (
                                                                        <Badge variant="secondary" className="text-[10px] h-5">
                                                                            Announce
                                                                        </Badge>
                                                                    )}
                                                                    {group.is_locked ? (
                                                                        <Badge variant="outline" className="text-[10px] h-5">
                                                                            Locked
                                                                        </Badge>
                                                                    ) : (
                                                                        <Badge variant="outline" className="text-[10px] h-5 text-green-600">
                                                                            Open
                                                                        </Badge>
                                                                    )}
                                                                </div>
                                                            </td>
                                                            <td className="px-4 py-3 text-muted-foreground text-xs">{group.formatted_date}</td>
                                                            <td className="px-4 py-3 text-center">
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    onClick={() => handleViewMembers(group)}
                                                                    className="gap-1"
                                                                >
                                                                    <Eye className="size-4" />
                                                                    Anggota
                                                                </Button>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>

                                        {/* Pagination */}
                                        {!searchQuery && groups.last_page > 1 && (
                                            <div className="mt-4 flex items-center justify-between">
                                                <span className="text-sm text-muted-foreground">
                                                    Menampilkan {groups.data.length} dari {groups.total} grup
                                                </span>
                                                <div className="flex items-center gap-2">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => handlePageChange(groups.current_page - 1)}
                                                        disabled={groups.current_page === 1}
                                                    >
                                                        <ChevronLeft className="size-4" />
                                                        Sebelumnya
                                                    </Button>
                                                    <span className="text-sm text-muted-foreground">
                                                        Halaman {groups.current_page} dari {groups.last_page}
                                                    </span>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => handlePageChange(groups.current_page + 1)}
                                                        disabled={groups.current_page === groups.last_page}
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
                                                Ditemukan {filteredGroups.length} grup dari pencarian "{searchQuery}"
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-12">
                                        <Users className="size-12 text-muted-foreground/50 mb-4" />
                                        <h3 className="text-lg font-medium text-muted-foreground">Belum Ada Grup</h3>
                                        <p className="text-sm text-muted-foreground/70 mt-1 text-center max-w-md">
                                            Meta Business API tidak menyediakan fitur scraping groups.
                                            Lihat tab "Info Meta Apps" untuk informasi lengkap.
                                        </p>
                                        <Button
                                            onClick={() => setActiveTab('meta')}
                                            className="mt-4"
                                            variant="outline"
                                        >
                                            <AlertCircle className="mr-2 size-4" />
                                            Lihat Info
                                        </Button>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>

            {/* Members Modal */}
            <Dialog open={membersModalOpen} onOpenChange={setMembersModalOpen}>
                <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Users className="size-5" />
                            Anggota Grup: {selectedGroup?.name}
                        </DialogTitle>
                        <DialogDescription>
                            Daftar anggota grup WhatsApp
                        </DialogDescription>
                    </DialogHeader>

                    <div className="flex-1 overflow-hidden flex flex-col">
                        {/* Stats */}
                        {membersStats && (
                            <div className="grid grid-cols-3 gap-3 mb-4">
                                <div className="bg-muted/50 rounded-lg p-3 text-center">
                                    <div className="text-xl font-bold">{membersStats.total}</div>
                                    <div className="text-xs text-muted-foreground">Total</div>
                                </div>
                                <div className="bg-green-50 rounded-lg p-3 text-center">
                                    <div className="text-xl font-bold text-green-600">{membersStats.with_phone}</div>
                                    <div className="text-xs text-muted-foreground">Dengan Nomor</div>
                                </div>
                                <div className="bg-blue-50 rounded-lg p-3 text-center">
                                    <div className="text-xl font-bold text-blue-600">{membersStats.admins}</div>
                                    <div className="text-xs text-muted-foreground">Admin</div>
                                </div>
                            </div>
                        )}

                        {/* Actions */}
                        <div className="flex gap-2 mb-4">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                                <Input
                                    placeholder="Cari anggota..."
                                    value={memberSearchQuery}
                                    onChange={(e) => setMemberSearchQuery(e.target.value)}
                                    className="pl-9"
                                />
                            </div>
                            <Button
                                onClick={handleScrapeMembers}
                                disabled={isScrapingMembers}
                                variant="default"
                            >
                                {isScrapingMembers ? (
                                    <>
                                        <Loader2 className="mr-2 size-4 animate-spin" />
                                        Mengambil...
                                    </>
                                ) : (
                                    <>
                                        <Download className="mr-2 size-4" />
                                        Ambil Anggota
                                    </>
                                )}
                            </Button>
                        </div>

                        {/* Members List */}
                        <div className="flex-1 overflow-y-auto border rounded-lg">
                            {isLoadingMembers ? (
                                <div className="flex items-center justify-center py-12">
                                    <Loader2 className="size-8 animate-spin text-muted-foreground" />
                                </div>
                            ) : members.length > 0 ? (
                                <table className="w-full text-sm">
                                    <thead className="bg-muted/50 sticky top-0">
                                        <tr>
                                            <th className="px-4 py-2 text-left font-medium">Nama</th>
                                            <th className="px-4 py-2 text-left font-medium">Nomor/ID</th>
                                            <th className="px-4 py-2 text-center font-medium">Role</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredMembers.map((member, index) => (
                                            <tr key={index} className={index % 2 === 0 ? 'bg-white dark:bg-transparent' : 'bg-muted/20'}>
                                                <td className="px-4 py-2">
                                                    <div className="flex items-center gap-2">
                                                        <UserCircle className="size-5 text-muted-foreground" />
                                                        <span>{member.display_name}</span>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-2">
                                                    {member.phone_number ? (
                                                        <div className="flex items-center gap-1 text-green-600">
                                                            <Phone className="size-3" />
                                                            <span>{member.phone_number}</span>
                                                        </div>
                                                    ) : (
                                                        <span className="text-muted-foreground text-xs">
                                                            {member.is_lid_format ? 'LID (Private)' : '-'}
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-4 py-2 text-center">
                                                    {member.is_super_admin ? (
                                                        <Badge className="bg-purple-100 text-purple-700">Owner</Badge>
                                                    ) : member.is_admin ? (
                                                        <Badge className="bg-blue-100 text-blue-700">Admin</Badge>
                                                    ) : (
                                                        <Badge variant="outline">Member</Badge>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-12">
                                    <Users className="size-10 text-muted-foreground/50 mb-3" />
                                    <p className="text-muted-foreground">Belum ada data anggota</p>
                                    <p className="text-xs text-muted-foreground mt-1">Klik "Ambil Anggota" untuk mengambil data</p>
                                </div>
                            )}
                        </div>

                        {/* Info about LID */}
                        {members.length > 0 && membersStats && membersStats.with_phone < membersStats.total && (
                            <Alert className="mt-4 bg-amber-50 border-amber-200">
                                <AlertDescription className="text-amber-900 text-xs">
                                    Beberapa anggota menampilkan "LID (Private)" karena WhatsApp menyembunyikan nomor telepon untuk privasi. Hanya nomor yang sudah tersimpan di kontak atau pernah chat yang bisa ditampilkan.
                                </AlertDescription>
                            </Alert>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </UserLayout>
    );
}
