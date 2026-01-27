import { Head, Link, router } from '@inertiajs/react';
import UserLayout from '@/layouts/user/user-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Megaphone,
    Plus,
    Search,
    Filter,
    Clock,
    CheckCircle2,
    XCircle,
    Loader2,
    Eye,
    Ban
} from 'lucide-react';
import { useState } from 'react';
import { format } from 'date-fns';

interface Broadcast {
    id: number;
    platform: 'whatsapp' | 'instagram' | 'facebook';
    name: string;
    message_type: string;
    status: 'draft' | 'scheduled' | 'processing' | 'completed' | 'failed';
    total_recipients: number;
    sent_count: number;
    failed_count: number;
    delivered_count: number;
    read_count: number;
    scheduled_at: string | null;
    started_at: string | null;
    completed_at: string | null;
    created_at: string;
}

interface PaginatedBroadcasts {
    data: Broadcast[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
}

interface Props {
    broadcasts: PaginatedBroadcasts;
    filters: {
        platform?: string;
        status?: string;
        search?: string;
    };
}

export default function MetaBroadcastIndex({ broadcasts, filters }: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [platform, setPlatform] = useState(filters.platform || 'all');
    const [status, setStatus] = useState(filters.status || 'all');

    const handleSearch = () => {
        router.get('/user/meta/broadcast', {
            search: search || undefined,
            platform: platform !== 'all' ? platform : undefined,
            status: status !== 'all' ? status : undefined,
        }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleCancel = (id: number) => {
        if (confirm('Are you sure you want to cancel this broadcast?')) {
            router.post(`/user/meta/broadcast/${id}/cancel`, {}, {
                preserveScroll: true,
            });
        }
    };

    const getStatusBadge = (status: string) => {
        const config = {
            draft: { label: 'Draft', className: 'bg-gray-500' },
            scheduled: { label: 'Scheduled', className: 'bg-blue-500' },
            processing: { label: 'Processing', className: 'bg-yellow-500' },
            completed: { label: 'Completed', className: 'bg-green-500' },
            failed: { label: 'Failed', className: 'bg-red-500' },
        };
        const conf = config[status as keyof typeof config] || config.draft;
        return <Badge className={conf.className}>{conf.label}</Badge>;
    };

    const getProgressPercentage = (broadcast: Broadcast) => {
        if (broadcast.total_recipients === 0) return 0;
        return Math.round((broadcast.sent_count / broadcast.total_recipients) * 100);
    };

    return (
        <UserLayout>
            <Head title="Broadcast Campaigns" />

            <div className="space-y-6">
                {/* Header */}
                <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-6 border">
                    <div className="absolute inset-0 bg-grid-white/10 [mask-image:radial-gradient(white,transparent_85%)]" />
                    <div className="relative flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight text-foreground">
                                Broadcast Campaigns
                            </h1>
                            <p className="text-muted-foreground mt-1">
                                Manage your broadcast campaigns across platforms
                            </p>
                        </div>
                        <Link href="/user/meta/broadcast/create">
                            <Button size="lg" className="gap-2 shadow-lg hover:shadow-xl transition-all">
                                <Plus className="h-4 w-4" />
                                Create Campaign
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid gap-4 md:grid-cols-4">
                    <Card className="overflow-hidden border-2">
                        <div className="h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">Total Campaigns</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold">{broadcasts.total}</div>
                        </CardContent>
                    </Card>

                    <Card className="overflow-hidden border-2">
                        <div className="h-1 bg-gradient-to-r from-green-500 to-emerald-500" />
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">Completed</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold">
                                {broadcasts.data.filter(b => b.status === 'completed').length}
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="overflow-hidden border-2">
                        <div className="h-1 bg-gradient-to-r from-yellow-500 to-orange-500" />
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">Processing</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold">
                                {broadcasts.data.filter(b => b.status === 'processing').length}
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="overflow-hidden border-2">
                        <div className="h-1 bg-gradient-to-r from-purple-500 to-indigo-500" />
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">Total Sent</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold">
                                {broadcasts.data.reduce((sum, b) => sum + b.sent_count, 0)}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Filters */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <Filter className="h-5 w-5" />
                            Filters
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex gap-3">
                            <div className="flex-1">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Search campaigns..."
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                        className="pl-10"
                                    />
                                </div>
                            </div>
                            <Select value={platform} onValueChange={setPlatform}>
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder="Platform" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Platforms</SelectItem>
                                    <SelectItem value="whatsapp">WhatsApp</SelectItem>
                                    <SelectItem value="instagram">Instagram</SelectItem>
                                    <SelectItem value="facebook">Facebook</SelectItem>
                                </SelectContent>
                            </Select>
                            <Select value={status} onValueChange={setStatus}>
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder="Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Status</SelectItem>
                                    <SelectItem value="draft">Draft</SelectItem>
                                    <SelectItem value="scheduled">Scheduled</SelectItem>
                                    <SelectItem value="processing">Processing</SelectItem>
                                    <SelectItem value="completed">Completed</SelectItem>
                                    <SelectItem value="failed">Failed</SelectItem>
                                </SelectContent>
                            </Select>
                            <Button onClick={handleSearch}>
                                Apply Filters
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Broadcasts List */}
                <Card>
                    <CardHeader>
                        <CardTitle>Campaigns</CardTitle>
                        <CardDescription>
                            View and manage your broadcast campaigns
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {broadcasts.data.length > 0 ? (
                            <div className="space-y-3">
                                {broadcasts.data.map((broadcast) => (
                                    <div
                                        key={broadcast.id}
                                        className="flex flex-col gap-3 rounded-lg border p-4 transition-colors hover:bg-accent/50"
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
                                                    <Megaphone className="size-5 text-primary" />
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <p className="font-medium">{broadcast.name}</p>
                                                        {getStatusBadge(broadcast.status)}
                                                        <Badge variant="outline" className="capitalize">
                                                            {broadcast.platform}
                                                        </Badge>
                                                    </div>
                                                    <p className="text-sm text-muted-foreground">
                                                        {broadcast.scheduled_at
                                                            ? `Scheduled: ${format(new Date(broadcast.scheduled_at), 'PPp')}`
                                                            : `Created: ${format(new Date(broadcast.created_at), 'PPp')}`}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                <Link href={`/user/meta/broadcast/${broadcast.id}`}>
                                                    <Button variant="outline" size="sm" className="gap-2">
                                                        <Eye className="h-4 w-4" />
                                                        View
                                                    </Button>
                                                </Link>
                                                {(broadcast.status === 'scheduled' || broadcast.status === 'draft') && (
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => handleCancel(broadcast.id)}
                                                        className="gap-2"
                                                    >
                                                        <Ban className="h-4 w-4" />
                                                        Cancel
                                                    </Button>
                                                )}
                                            </div>
                                        </div>

                                        {/* Progress */}
                                        {broadcast.status !== 'draft' && (
                                            <div className="space-y-2">
                                                <div className="flex items-center justify-between text-sm">
                                                    <span className="text-muted-foreground">Progress</span>
                                                    <span className="font-medium">
                                                        {broadcast.sent_count} / {broadcast.total_recipients} sent
                                                        ({getProgressPercentage(broadcast)}%)
                                                    </span>
                                                </div>
                                                <Progress value={getProgressPercentage(broadcast)} />

                                                {/* Stats */}
                                                <div className="grid grid-cols-4 gap-3 pt-2">
                                                    <div className="flex flex-col items-center p-2 rounded-lg bg-blue-500/10">
                                                        <span className="text-xs text-muted-foreground">Sent</span>
                                                        <span className="text-lg font-bold text-blue-600">
                                                            {broadcast.sent_count}
                                                        </span>
                                                    </div>
                                                    <div className="flex flex-col items-center p-2 rounded-lg bg-green-500/10">
                                                        <span className="text-xs text-muted-foreground">Delivered</span>
                                                        <span className="text-lg font-bold text-green-600">
                                                            {broadcast.delivered_count}
                                                        </span>
                                                    </div>
                                                    <div className="flex flex-col items-center p-2 rounded-lg bg-purple-500/10">
                                                        <span className="text-xs text-muted-foreground">Read</span>
                                                        <span className="text-lg font-bold text-purple-600">
                                                            {broadcast.read_count}
                                                        </span>
                                                    </div>
                                                    <div className="flex flex-col items-center p-2 rounded-lg bg-red-500/10">
                                                        <span className="text-xs text-muted-foreground">Failed</span>
                                                        <span className="text-lg font-bold text-red-600">
                                                            {broadcast.failed_count}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-16">
                                <div className="rounded-full bg-muted p-6 mb-4">
                                    <Megaphone className="h-12 w-12 text-muted-foreground" />
                                </div>
                                <p className="text-base font-medium mb-2">No broadcast campaigns yet</p>
                                <p className="text-sm text-muted-foreground mb-6">
                                    Create your first campaign to start broadcasting
                                </p>
                                <Link href="/user/meta/broadcast/create">
                                    <Button className="gap-2">
                                        <Plus className="h-4 w-4" />
                                        Create Campaign
                                    </Button>
                                </Link>
                            </div>
                        )}

                        {/* Pagination */}
                        {broadcasts.last_page > 1 && (
                            <div className="flex items-center justify-between mt-6 pt-6 border-t">
                                <p className="text-sm text-muted-foreground">
                                    Showing {broadcasts.data.length} of {broadcasts.total} campaigns
                                </p>
                                <div className="flex gap-2">
                                    {broadcasts.current_page > 1 && (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => router.get(`/user/meta/broadcast?page=${broadcasts.current_page - 1}`)}
                                        >
                                            Previous
                                        </Button>
                                    )}
                                    {broadcasts.current_page < broadcasts.last_page && (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => router.get(`/user/meta/broadcast?page=${broadcasts.current_page + 1}`)}
                                        >
                                            Next
                                        </Button>
                                    )}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </UserLayout>
    );
}
