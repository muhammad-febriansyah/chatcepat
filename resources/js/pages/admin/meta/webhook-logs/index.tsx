import { Head, Link, router } from '@inertiajs/react';
import AdminLayout from '@/layouts/admin/admin-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
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
import {
    Activity,
    Eye,
    Trash2,
    Download,
    RefreshCw,
    Filter,
    Search,
    AlertCircle,
    CheckCircle,
    Clock,
} from 'lucide-react';
import { useState } from 'react';

interface WebhookLog {
    id: number;
    platform: string;
    event_type: string;
    sender_id: string | null;
    recipient_id: string | null;
    message_id: string | null;
    status: 'success' | 'failed' | 'pending';
    error_message: string | null;
    user: {
        id: number;
        name: string;
        email: string;
    } | null;
    created_at: string;
}

interface Stats {
    total: number;
    success: number;
    failed: number;
    pending: number;
    by_platform: Record<string, number>;
    recent_errors: Array<{
        id: number;
        platform: string;
        error_message: string;
        created_at: string;
    }>;
}

interface Props {
    logs: {
        data: WebhookLog[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    stats: Stats;
    filters: {
        platform?: string;
        status?: string;
        user_id?: string;
        date_from?: string;
        date_to?: string;
        search?: string;
    };
}

const statusConfig = {
    success: { label: 'Success', color: 'bg-green-100 text-green-700', icon: CheckCircle },
    failed: { label: 'Failed', color: 'bg-red-100 text-red-700', icon: AlertCircle },
    pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-700', icon: Clock },
};

export default function WebhookLogsIndex({ logs, stats, filters }: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [platform, setPlatform] = useState(filters.platform || 'all');
    const [status, setStatus] = useState(filters.status || 'all');
    const [dateFrom, setDateFrom] = useState(filters.date_from || '');
    const [dateTo, setDateTo] = useState(filters.date_to || '');
    const [cleanupDays, setCleanupDays] = useState('30');

    const handleFilter = () => {
        router.get(
            '/admin/meta/webhook-logs',
            {
                search: search || undefined,
                platform: platform !== 'all' ? platform : undefined,
                status: status !== 'all' ? status : undefined,
                date_from: dateFrom || undefined,
                date_to: dateTo || undefined,
            },
            { preserveState: true }
        );
    };

    const handleCleanup = () => {
        if (confirm(`Delete logs older than ${cleanupDays} days?`)) {
            router.post('/admin/meta/webhook-logs/cleanup', {
                days: parseInt(cleanupDays),
            });
        }
    };

    const handleRetry = (id: number) => {
        router.post(`/admin/meta/webhook-logs/${id}/retry`, {}, {
            preserveScroll: true,
        });
    };

    const handleDelete = (id: number) => {
        if (confirm('Delete this webhook log?')) {
            router.delete(`/admin/meta/webhook-logs/${id}`, {
                preserveScroll: true,
            });
        }
    };

    const handleExport = () => {
        window.location.href = `/admin/meta/webhook-logs-export?${new URLSearchParams({
            platform: platform !== 'all' ? platform : '',
            status: status !== 'all' ? status : '',
        }).toString()}`;
    };

    return (
        <AdminLayout>
            <Head title="Webhook Logs" />

            <div className="space-y-6">
                {/* Header */}
                <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-orange-500/10 via-red-400/5 to-transparent p-6 border">
                    <div className="absolute inset-0 bg-grid-white/10 [mask-image:radial-gradient(white,transparent_85%)]" />
                    <div className="relative flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-3">
                                <Activity className="h-8 w-8 text-orange-500" />
                                Webhook Logs
                            </h1>
                            <p className="text-muted-foreground mt-1">
                                Monitor and debug webhook events
                            </p>
                        </div>
                        <Button onClick={handleExport} variant="outline" className="gap-2">
                            <Download className="h-4 w-4" />
                            Export CSV
                        </Button>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid gap-4 md:grid-cols-4">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">Total Logs</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold">{stats.total}</div>
                        </CardContent>
                    </Card>
                    <Card className="border-l-4 border-l-green-500">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium flex items-center gap-2">
                                <CheckCircle className="h-4 w-4 text-green-500" />
                                Success
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-green-600">{stats.success}</div>
                        </CardContent>
                    </Card>
                    <Card className="border-l-4 border-l-red-500">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium flex items-center gap-2">
                                <AlertCircle className="h-4 w-4 text-red-500" />
                                Failed
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-red-600">{stats.failed}</div>
                        </CardContent>
                    </Card>
                    <Card className="border-l-4 border-l-yellow-500">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium flex items-center gap-2">
                                <Clock className="h-4 w-4 text-yellow-500" />
                                Pending
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-yellow-600">{stats.pending}</div>
                        </CardContent>
                    </Card>
                </div>

                {/* Recent Errors */}
                {stats.recent_errors.length > 0 && (
                    <Card className="border-red-200">
                        <CardHeader>
                            <CardTitle className="text-red-600 flex items-center gap-2">
                                <AlertCircle className="h-5 w-5" />
                                Recent Errors
                            </CardTitle>
                            <CardDescription>Last 5 failed webhook events</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                {stats.recent_errors.map((error) => (
                                    <div key={error.id} className="flex items-start gap-3 p-3 rounded-lg bg-red-50 border border-red-100">
                                        <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <Badge variant="secondary" className="text-xs">
                                                    {error.platform}
                                                </Badge>
                                                <span className="text-xs text-muted-foreground">
                                                    {error.created_at}
                                                </span>
                                            </div>
                                            <p className="text-sm text-red-700 truncate">
                                                {error.error_message}
                                            </p>
                                        </div>
                                        <Link href={`/admin/meta/webhook-logs/${error.id}`}>
                                            <Button variant="ghost" size="sm">
                                                <Eye className="h-4 w-4" />
                                            </Button>
                                        </Link>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Filters */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle className="flex items-center gap-2">
                                <Filter className="h-5 w-5" />
                                Filters
                            </CardTitle>
                            <div className="flex items-center gap-2">
                                <Input
                                    type="number"
                                    min="1"
                                    max="365"
                                    value={cleanupDays}
                                    onChange={(e) => setCleanupDays(e.target.value)}
                                    className="w-20"
                                    placeholder="30"
                                />
                                <Button onClick={handleCleanup} variant="destructive" size="sm">
                                    Cleanup Old Logs
                                </Button>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4 md:grid-cols-5">
                            <div className="space-y-2">
                                <Input
                                    placeholder="Search..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleFilter()}
                                />
                            </div>
                            <div className="space-y-2">
                                <Select value={platform} onValueChange={setPlatform}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Platform" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Platforms</SelectItem>
                                        <SelectItem value="whatsapp">WhatsApp</SelectItem>
                                        <SelectItem value="instagram">Instagram</SelectItem>
                                        <SelectItem value="facebook">Facebook</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Select value={status} onValueChange={setStatus}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Status</SelectItem>
                                        <SelectItem value="success">Success</SelectItem>
                                        <SelectItem value="failed">Failed</SelectItem>
                                        <SelectItem value="pending">Pending</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Input
                                    type="date"
                                    value={dateFrom}
                                    onChange={(e) => setDateFrom(e.target.value)}
                                    placeholder="From"
                                />
                            </div>
                            <div className="space-y-2">
                                <Input
                                    type="date"
                                    value={dateTo}
                                    onChange={(e) => setDateTo(e.target.value)}
                                    placeholder="To"
                                />
                            </div>
                        </div>
                        <div className="mt-4">
                            <Button onClick={handleFilter} className="gap-2">
                                <Search className="h-4 w-4" />
                                Apply Filters
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Table */}
                <Card>
                    <CardHeader>
                        <CardTitle>Webhook Logs</CardTitle>
                        <CardDescription>
                            Showing {logs.data.length} of {logs.total} logs
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {logs.data.length > 0 ? (
                            <>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Date</TableHead>
                                            <TableHead>Platform</TableHead>
                                            <TableHead>Event</TableHead>
                                            <TableHead>Sender/Recipient</TableHead>
                                            <TableHead>User</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead className="text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {logs.data.map((log) => {
                                            const stat = statusConfig[log.status];
                                            const Icon = stat.icon;
                                            return (
                                                <TableRow key={log.id}>
                                                    <TableCell className="text-xs">
                                                        {log.created_at}
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge variant="secondary" className="text-xs">
                                                            {log.platform}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell>
                                                        <code className="text-xs bg-muted px-2 py-1 rounded">
                                                            {log.event_type}
                                                        </code>
                                                    </TableCell>
                                                    <TableCell className="text-xs">
                                                        <div>
                                                            {log.sender_id && (
                                                                <div>From: {log.sender_id}</div>
                                                            )}
                                                            {log.recipient_id && (
                                                                <div>To: {log.recipient_id}</div>
                                                            )}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-xs">
                                                        {log.user ? log.user.name : 'N/A'}
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge className={stat.color}>
                                                            <Icon className="h-3 w-3 mr-1" />
                                                            {stat.label}
                                                        </Badge>
                                                        {log.error_message && (
                                                            <p className="text-xs text-red-500 mt-1 truncate max-w-xs">
                                                                {log.error_message}
                                                            </p>
                                                        )}
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <div className="flex items-center justify-end gap-2">
                                                            <Link href={`/admin/meta/webhook-logs/${log.id}`}>
                                                                <Button variant="ghost" size="sm">
                                                                    <Eye className="h-4 w-4" />
                                                                </Button>
                                                            </Link>
                                                            {log.status === 'failed' && (
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    onClick={() => handleRetry(log.id)}
                                                                >
                                                                    <RefreshCw className="h-4 w-4" />
                                                                </Button>
                                                            )}
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => handleDelete(log.id)}
                                                            >
                                                                <Trash2 className="h-4 w-4 text-red-500" />
                                                            </Button>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })}
                                    </TableBody>
                                </Table>

                                {/* Pagination */}
                                {logs.last_page > 1 && (
                                    <div className="flex items-center justify-between mt-4">
                                        <p className="text-sm text-muted-foreground">
                                            Page {logs.current_page} of {logs.last_page}
                                        </p>
                                        <div className="flex gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                disabled={logs.current_page === 1}
                                                onClick={() =>
                                                    router.get(`/admin/meta/webhook-logs?page=${logs.current_page - 1}`)
                                                }
                                            >
                                                Previous
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                disabled={logs.current_page === logs.last_page}
                                                onClick={() =>
                                                    router.get(`/admin/meta/webhook-logs?page=${logs.current_page + 1}`)
                                                }
                                            >
                                                Next
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="text-center py-12">
                                <Activity className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                                <p className="text-muted-foreground">No webhook logs found</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AdminLayout>
    );
}
