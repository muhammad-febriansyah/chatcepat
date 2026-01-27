import { Head, Link, router } from '@inertiajs/react';
import UserLayout from '@/layouts/user/user-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    MessageSquare,
    Instagram,
    Facebook,
    Plus,
    MoreVertical,
    Edit,
    Trash2,
    Copy,
    Power,
    Search,
    Zap,
    Clock,
    Filter
} from 'lucide-react';
import { useState } from 'react';
import axios from 'axios';

interface AutoReply {
    id: number;
    platform: 'whatsapp' | 'instagram' | 'facebook';
    name: string;
    trigger_type: 'keyword' | 'all' | 'greeting' | 'away';
    keywords: string[] | null;
    match_type: string;
    reply_type: string;
    reply_message: string | null;
    is_active: boolean;
    priority: number;
    usage_count: number;
    created_at: string;
}

interface PaginatedAutoReplies {
    data: AutoReply[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
}

interface Props {
    autoReplies: PaginatedAutoReplies;
    filters: {
        platform?: string;
        search?: string;
    };
}

export default function MetaAutoReplyIndex({ autoReplies, filters }: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [platform, setPlatform] = useState(filters.platform || 'all');

    const handleSearch = () => {
        router.get('/user/meta/auto-reply', {
            search: search || undefined,
            platform: platform !== 'all' ? platform : undefined,
        }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleToggleStatus = async (id: number) => {
        try {
            await axios.post(`/user/meta/auto-reply/${id}/toggle`);
            router.reload({ only: ['autoReplies'] });
        } catch (error) {
            console.error('Failed to toggle status:', error);
        }
    };

    const handleDuplicate = (id: number) => {
        router.post(`/user/meta/auto-reply/${id}/duplicate`, {}, {
            preserveScroll: true,
        });
    };

    const handleDelete = (id: number, name: string) => {
        if (confirm(`Yakin ingin menghapus auto reply "${name}"?`)) {
            router.delete(`/user/meta/auto-reply/${id}`, {
                preserveScroll: true,
            });
        }
    };

    const getPlatformIcon = (platform: string) => {
        switch (platform) {
            case 'whatsapp':
                return <MessageSquare className="h-4 w-4" />;
            case 'instagram':
                return <Instagram className="h-4 w-4" />;
            case 'facebook':
                return <Facebook className="h-4 w-4" />;
            default:
                return null;
        }
    };

    const getPlatformColor = (platform: string) => {
        switch (platform) {
            case 'whatsapp':
                return 'bg-green-500/10 text-green-600 border-green-500/20';
            case 'instagram':
                return 'bg-pink-500/10 text-pink-600 border-pink-500/20';
            case 'facebook':
                return 'bg-blue-500/10 text-blue-600 border-blue-500/20';
            default:
                return '';
        }
    };

    const getTriggerTypeLabel = (type: string) => {
        const labels = {
            keyword: 'Keyword',
            all: 'All Messages',
            greeting: 'Greeting',
            away: 'Away',
        };
        return labels[type as keyof typeof labels] || type;
    };

    return (
        <UserLayout>
            <Head title="Auto Reply" />

            <div className="space-y-6">
                {/* Header */}
                <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-6 border">
                    <div className="absolute inset-0 bg-grid-white/10 [mask-image:radial-gradient(white,transparent_85%)]" />
                    <div className="relative flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight text-foreground">
                                Auto Reply Management
                            </h1>
                            <p className="text-muted-foreground mt-1">
                                Kelola auto reply untuk WhatsApp, Instagram, dan Facebook
                            </p>
                        </div>
                        <Link href="/user/meta/auto-reply/create">
                            <Button size="lg" className="gap-2 shadow-lg hover:shadow-xl transition-all">
                                <Plus className="h-4 w-4" />
                                Create Auto Reply
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid gap-4 md:grid-cols-4">
                    <Card className="overflow-hidden border-2">
                        <div className="h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">Total Auto Replies</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold">{autoReplies.total}</div>
                        </CardContent>
                    </Card>

                    <Card className="overflow-hidden border-2">
                        <div className="h-1 bg-gradient-to-r from-green-500 to-emerald-500" />
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">Active</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold">
                                {autoReplies.data.filter(ar => ar.is_active).length}
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="overflow-hidden border-2">
                        <div className="h-1 bg-gradient-to-r from-orange-500 to-red-500" />
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">Total Usage</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold">
                                {autoReplies.data.reduce((sum, ar) => sum + ar.usage_count, 0)}
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="overflow-hidden border-2">
                        <div className="h-1 bg-gradient-to-r from-purple-500 to-indigo-500" />
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">Platforms</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex gap-2">
                                {['whatsapp', 'instagram', 'facebook'].map(p => (
                                    autoReplies.data.some(ar => ar.platform === p) && (
                                        <Badge key={p} variant="outline" className="gap-1">
                                            {getPlatformIcon(p)}
                                            {p.charAt(0).toUpperCase() + p.slice(1, 2)}
                                        </Badge>
                                    )
                                ))}
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
                                        placeholder="Search by name..."
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
                            <Button onClick={handleSearch}>
                                Apply Filters
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Auto Replies List */}
                <Card>
                    <CardHeader>
                        <CardTitle>Auto Replies</CardTitle>
                        <CardDescription>
                            Manage your automated reply rules
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {autoReplies.data.length > 0 ? (
                            <div className="space-y-3">
                                {autoReplies.data.map((autoReply) => (
                                    <div
                                        key={autoReply.id}
                                        className="flex items-center justify-between rounded-lg border p-4 transition-colors hover:bg-accent/50"
                                    >
                                        <div className="flex items-center gap-4 flex-1 min-w-0">
                                            <div className="flex flex-col gap-2">
                                                <Badge
                                                    variant="outline"
                                                    className={`gap-1 ${getPlatformColor(autoReply.platform)}`}
                                                >
                                                    {getPlatformIcon(autoReply.platform)}
                                                    {autoReply.platform}
                                                </Badge>
                                                <Badge variant="outline" className="gap-1">
                                                    <Zap className="h-3 w-3" />
                                                    Priority: {autoReply.priority}
                                                </Badge>
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <p className="font-medium truncate">{autoReply.name}</p>
                                                    {autoReply.is_active ? (
                                                        <Badge className="bg-green-500">Active</Badge>
                                                    ) : (
                                                        <Badge variant="secondary">Inactive</Badge>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                                    <span className="inline-flex items-center gap-1">
                                                        <MessageSquare className="h-3 w-3" />
                                                        {getTriggerTypeLabel(autoReply.trigger_type)}
                                                    </span>
                                                    {autoReply.keywords && autoReply.keywords.length > 0 && (
                                                        <span>Keywords: {autoReply.keywords.slice(0, 3).join(', ')}
                                                            {autoReply.keywords.length > 3 && '...'}</span>
                                                    )}
                                                    <span className="inline-flex items-center gap-1">
                                                        <Clock className="h-3 w-3" />
                                                        {autoReply.usage_count} uses
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon">
                                                    <MoreVertical className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem
                                                    onClick={() => handleToggleStatus(autoReply.id)}
                                                    className="gap-2"
                                                >
                                                    <Power className="h-4 w-4" />
                                                    {autoReply.is_active ? 'Deactivate' : 'Activate'}
                                                </DropdownMenuItem>
                                                <DropdownMenuItem asChild>
                                                    <Link
                                                        href={`/user/meta/auto-reply/${autoReply.id}/edit`}
                                                        className="gap-2"
                                                    >
                                                        <Edit className="h-4 w-4" />
                                                        Edit
                                                    </Link>
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    onClick={() => handleDuplicate(autoReply.id)}
                                                    className="gap-2"
                                                >
                                                    <Copy className="h-4 w-4" />
                                                    Duplicate
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem
                                                    onClick={() => handleDelete(autoReply.id, autoReply.name)}
                                                    className="gap-2 text-destructive"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                    Delete
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-16">
                                <div className="rounded-full bg-muted p-6 mb-4">
                                    <MessageSquare className="h-12 w-12 text-muted-foreground" />
                                </div>
                                <p className="text-base font-medium mb-2">No auto replies yet</p>
                                <p className="text-sm text-muted-foreground mb-6">
                                    Create your first auto reply to start automating responses
                                </p>
                                <Link href="/user/meta/auto-reply/create">
                                    <Button className="gap-2">
                                        <Plus className="h-4 w-4" />
                                        Create Auto Reply
                                    </Button>
                                </Link>
                            </div>
                        )}

                        {/* Pagination */}
                        {autoReplies.last_page > 1 && (
                            <div className="flex items-center justify-between mt-6 pt-6 border-t">
                                <p className="text-sm text-muted-foreground">
                                    Showing {autoReplies.data.length} of {autoReplies.total} auto replies
                                </p>
                                <div className="flex gap-2">
                                    {autoReplies.current_page > 1 && (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => router.get(`/user/meta/auto-reply?page=${autoReplies.current_page - 1}`)}
                                        >
                                            Previous
                                        </Button>
                                    )}
                                    {autoReplies.current_page < autoReplies.last_page && (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => router.get(`/user/meta/auto-reply?page=${autoReplies.current_page + 1}`)}
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
