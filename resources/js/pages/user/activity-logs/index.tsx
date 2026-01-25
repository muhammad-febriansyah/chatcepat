import { Head, router } from '@inertiajs/react';
import UserLayout from '@/layouts/user/user-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { FileText, Search, Filter, ChevronLeft, ChevronRight, Eye } from 'lucide-react';
import { useState } from 'react';

interface ActivityLog {
    id: number;
    action: string;
    action_label: string;
    resource_type: string | null;
    resource_type_label: string | null;
    resource_name: string | null;
    description: string;
    ip_address: string;
    device_type: string;
    browser: string;
    platform: string;
    is_successful: boolean;
    created_at: string;
    created_at_human: string;
}

interface FilterOption {
    value: string;
    label: string;
}

interface Props {
    logs: {
        data: ActivityLog[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
        from: number;
        to: number;
    };
    filters: {
        search?: string;
        action?: string;
        resource_type?: string;
        start_date?: string;
        end_date?: string;
    };
    filterOptions: {
        actions: FilterOption[];
        resourceTypes: FilterOption[];
    };
}

export default function ActivityLogsIndex({ logs, filters, filterOptions }: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [selectedAction, setSelectedAction] = useState(filters.action || 'all');
    const [selectedResourceType, setSelectedResourceType] = useState(filters.resource_type || 'all');
    const [startDate, setStartDate] = useState(filters.start_date || '');
    const [endDate, setEndDate] = useState(filters.end_date || '');

    const handleSearch = () => {
        router.get('/user/activity-logs', {
            search,
            action: selectedAction === 'all' ? undefined : selectedAction,
            resource_type: selectedResourceType === 'all' ? undefined : selectedResourceType,
            start_date: startDate || undefined,
            end_date: endDate || undefined,
        }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleReset = () => {
        setSearch('');
        setSelectedAction('all');
        setSelectedResourceType('all');
        setStartDate('');
        setEndDate('');
        router.get('/user/activity-logs');
    };

    const handlePageChange = (page: number) => {
        router.get('/user/activity-logs', {
            page,
            search,
            action: selectedAction === 'all' ? undefined : selectedAction,
            resource_type: selectedResourceType === 'all' ? undefined : selectedResourceType,
            start_date: startDate || undefined,
            end_date: endDate || undefined,
        }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const getActionBadgeVariant = (action: string): 'default' | 'secondary' | 'destructive' | 'outline' => {
        if (action === 'create') return 'default';
        if (action === 'update') return 'secondary';
        if (action === 'delete') return 'destructive';
        if (action === 'login') return 'outline';
        return 'secondary';
    };

    const getDeviceIcon = (deviceType: string) => {
        // Simple text representation since we don't have device icons imported
        if (deviceType === 'mobile') return '📱';
        if (deviceType === 'tablet') return '📱';
        if (deviceType === 'desktop') return '💻';
        return '❓';
    };

    return (
        <UserLayout>
            <Head title="Log Aktivitas" />

            <div className="space-y-6">
                {/* Header */}
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <FileText className="h-6 w-6 text-primary" />
                        <h1 className="text-3xl font-bold">Log Aktivitas</h1>
                    </div>
                    <p className="text-muted-foreground">
                        Riwayat lengkap semua aktivitas Anda di sistem
                    </p>
                </div>

                {/* Filters */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Filter</CardTitle>
                        <CardDescription>Cari dan filter log aktivitas</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4 md:grid-cols-5">
                            {/* Search */}
                            <div className="md:col-span-1">
                                <Input
                                    placeholder="Cari aktivitas..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                    className="w-full"
                                />
                            </div>

                            {/* Action Filter */}
                            <Select value={selectedAction} onValueChange={setSelectedAction}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Semua Aksi" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Semua Aksi</SelectItem>
                                    {filterOptions.actions.map((option) => (
                                        <SelectItem key={option.value} value={option.value}>
                                            {option.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            {/* Resource Type Filter */}
                            <Select value={selectedResourceType} onValueChange={setSelectedResourceType}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Semua Resource" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Semua Resource</SelectItem>
                                    {filterOptions.resourceTypes.map((option) => (
                                        <SelectItem key={option.value} value={option.value}>
                                            {option.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            {/* Start Date */}
                            <Input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                placeholder="Tanggal Mulai"
                            />

                            {/* End Date */}
                            <Input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                placeholder="Tanggal Akhir"
                            />
                        </div>

                        <div className="flex gap-2 mt-4">
                            <Button onClick={handleSearch} className="gap-2">
                                <Search className="h-4 w-4" />
                                Cari
                            </Button>
                            <Button onClick={handleReset} variant="outline" className="gap-2">
                                <Filter className="h-4 w-4" />
                                Reset
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Table */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle>Riwayat Aktivitas</CardTitle>
                            <Badge variant="secondary">
                                {logs.total} total log
                            </Badge>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Waktu</TableHead>
                                        <TableHead>Aksi</TableHead>
                                        <TableHead>Resource</TableHead>
                                        <TableHead>Deskripsi</TableHead>
                                        <TableHead>Device</TableHead>
                                        <TableHead>IP Address</TableHead>
                                        <TableHead className="text-right">Detail</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {logs.data.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                                                Tidak ada log aktivitas ditemukan
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        logs.data.map((log) => (
                                            <TableRow key={log.id}>
                                                <TableCell className="font-medium">
                                                    <div className="space-y-1">
                                                        <div className="text-sm">
                                                            {new Date(log.created_at).toLocaleDateString('id-ID', {
                                                                day: '2-digit',
                                                                month: 'short',
                                                                year: 'numeric',
                                                            })}
                                                        </div>
                                                        <div className="text-xs text-muted-foreground">
                                                            {new Date(log.created_at).toLocaleTimeString('id-ID', {
                                                                hour: '2-digit',
                                                                minute: '2-digit',
                                                            })}
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant={getActionBadgeVariant(log.action)}>
                                                        {log.action_label}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    {log.resource_type_label ? (
                                                        <div className="space-y-1">
                                                            <div className="text-sm">{log.resource_type_label}</div>
                                                            {log.resource_name && (
                                                                <div className="text-xs text-muted-foreground truncate max-w-[150px]">
                                                                    {log.resource_name}
                                                                </div>
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <span className="text-muted-foreground">-</span>
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="max-w-[250px] truncate text-sm">
                                                        {log.description}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2 text-sm">
                                                        <span>{getDeviceIcon(log.device_type)}</span>
                                                        <div className="space-y-1">
                                                            <div className="capitalize">{log.device_type}</div>
                                                            <div className="text-xs text-muted-foreground">
                                                                {log.browser} / {log.platform}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="font-mono text-xs">
                                                    {log.ip_address}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => router.visit(`/user/activity-logs/${log.id}`)}
                                                    >
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>

                        {/* Pagination */}
                        {logs.last_page > 1 && (
                            <div className="flex items-center justify-between mt-4">
                                <div className="text-sm text-muted-foreground">
                                    Menampilkan {logs.from} - {logs.to} dari {logs.total} log
                                </div>
                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handlePageChange(logs.current_page - 1)}
                                        disabled={logs.current_page === 1}
                                    >
                                        <ChevronLeft className="h-4 w-4" />
                                        Sebelumnya
                                    </Button>
                                    <div className="flex items-center gap-1">
                                        {Array.from({ length: Math.min(5, logs.last_page) }, (_, i) => {
                                            let page;
                                            if (logs.last_page <= 5) {
                                                page = i + 1;
                                            } else if (logs.current_page <= 3) {
                                                page = i + 1;
                                            } else if (logs.current_page >= logs.last_page - 2) {
                                                page = logs.last_page - 4 + i;
                                            } else {
                                                page = logs.current_page - 2 + i;
                                            }

                                            return (
                                                <Button
                                                    key={page}
                                                    variant={page === logs.current_page ? 'default' : 'outline'}
                                                    size="sm"
                                                    onClick={() => handlePageChange(page)}
                                                    className="w-8 h-8 p-0"
                                                >
                                                    {page}
                                                </Button>
                                            );
                                        })}
                                    </div>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handlePageChange(logs.current_page + 1)}
                                        disabled={logs.current_page === logs.last_page}
                                    >
                                        Selanjutnya
                                        <ChevronRight className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </UserLayout>
    );
}
