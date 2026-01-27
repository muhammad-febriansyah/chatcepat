import { Head } from '@inertiajs/react';
import UserLayout from '@/layouts/user/user-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    MessageSquare,
    Instagram,
    Facebook,
    Settings,
    Send,
    TrendingUp,
    TrendingDown,
    MessageCircle,
    ArrowRight
} from 'lucide-react';
import { Link } from '@inertiajs/react';

interface MessageStats {
    total: number;
    sent: number;
    received: number;
}

interface RecentMessage {
    id: number;
    from: string;
    to: string;
    type: string;
    content: string | null;
    direction: 'inbound' | 'outbound';
    status: string;
    created_at: string;
}

interface Props {
    stats: {
        whatsapp: MessageStats;
        instagram: MessageStats;
        facebook: MessageStats;
    };
    recentMessages: {
        whatsapp: RecentMessage[];
        instagram: RecentMessage[];
        facebook: RecentMessage[];
    };
    hasWhatsAppConfigured: boolean;
    hasInstagramConfigured: boolean;
    hasFacebookConfigured: boolean;
}

export default function MetaMessagesIndex({ stats, recentMessages, hasWhatsAppConfigured, hasInstagramConfigured, hasFacebookConfigured }: Props) {
    const platforms = [
        {
            id: 'whatsapp',
            name: 'WhatsApp',
            icon: MessageSquare,
            configured: hasWhatsAppConfigured,
            stats: stats.whatsapp,
            messages: recentMessages.whatsapp,
            color: 'from-green-500 to-emerald-600',
            bgColor: 'bg-green-500/10',
            textColor: 'text-green-600',
        },
        {
            id: 'instagram',
            name: 'Instagram',
            icon: Instagram,
            configured: hasInstagramConfigured,
            stats: stats.instagram,
            messages: recentMessages.instagram,
            color: 'from-pink-500 to-rose-600',
            bgColor: 'bg-pink-500/10',
            textColor: 'text-pink-600',
        },
        {
            id: 'facebook',
            name: 'Facebook',
            icon: Facebook,
            configured: hasFacebookConfigured,
            stats: stats.facebook,
            messages: recentMessages.facebook,
            color: 'from-blue-500 to-indigo-600',
            bgColor: 'bg-blue-500/10',
            textColor: 'text-blue-600',
        },
    ];

    return (
        <UserLayout>
            <Head title="Messages" />

            <div className="space-y-6">
                {/* Header */}
                <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-6 border">
                    <div className="absolute inset-0 bg-grid-white/10 [mask-image:radial-gradient(white,transparent_85%)]" />
                    <div className="relative flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight text-foreground">
                                Messages Dashboard
                            </h1>
                            <p className="text-muted-foreground mt-1">
                                View and manage messages across all platforms
                            </p>
                        </div>
                        <Link href="/user/meta/settings">
                            <Button size="lg" variant="outline" className="gap-2">
                                <Settings className="h-4 w-4" />
                                Configure Platforms
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Overall Stats */}
                <div className="grid gap-4 md:grid-cols-4">
                    <Card className="overflow-hidden border-2">
                        <div className="h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">Total Messages</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold">
                                {stats.whatsapp.total + stats.instagram.total + stats.facebook.total}
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="overflow-hidden border-2">
                        <div className="h-1 bg-gradient-to-r from-blue-500 to-cyan-500" />
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium flex items-center gap-2">
                                Sent <TrendingUp className="h-4 w-4 text-blue-500" />
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold">
                                {stats.whatsapp.sent + stats.instagram.sent + stats.facebook.sent}
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="overflow-hidden border-2">
                        <div className="h-1 bg-gradient-to-r from-green-500 to-emerald-500" />
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium flex items-center gap-2">
                                Received <TrendingDown className="h-4 w-4 text-green-500" />
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold">
                                {stats.whatsapp.received + stats.instagram.received + stats.facebook.received}
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="overflow-hidden border-2">
                        <div className="h-1 bg-gradient-to-r from-purple-500 to-indigo-500" />
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">Platforms</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold">
                                {[hasWhatsAppConfigured, hasInstagramConfigured, hasFacebookConfigured].filter(Boolean).length} / 3
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Platform Cards */}
                <div className="grid gap-6 md:grid-cols-3">
                    {platforms.map((platform) => {
                        const Icon = platform.icon;
                        return (
                            <Card key={platform.id} className="overflow-hidden">
                                <div className={`h-1 bg-gradient-to-r ${platform.color}`} />
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className={`p-2 rounded-lg ${platform.bgColor}`}>
                                                <Icon className={`h-5 w-5 ${platform.textColor}`} />
                                            </div>
                                            <div>
                                                <CardTitle className="text-lg">{platform.name}</CardTitle>
                                                <CardDescription className="text-xs">
                                                    {platform.configured ? (
                                                        <Badge variant="default" className="mt-1 bg-green-500">
                                                            Connected
                                                        </Badge>
                                                    ) : (
                                                        <Badge variant="secondary" className="mt-1">
                                                            Not Configured
                                                        </Badge>
                                                    )}
                                                </CardDescription>
                                            </div>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    {platform.configured ? (
                                        <>
                                            {/* Stats */}
                                            <div className="grid grid-cols-3 gap-2 mb-4">
                                                <div className="text-center p-2 rounded-lg bg-muted">
                                                    <p className="text-xs text-muted-foreground">Total</p>
                                                    <p className="text-lg font-bold">{platform.stats.total}</p>
                                                </div>
                                                <div className="text-center p-2 rounded-lg bg-blue-500/10">
                                                    <p className="text-xs text-muted-foreground">Sent</p>
                                                    <p className="text-lg font-bold text-blue-600">{platform.stats.sent}</p>
                                                </div>
                                                <div className="text-center p-2 rounded-lg bg-green-500/10">
                                                    <p className="text-xs text-muted-foreground">Received</p>
                                                    <p className="text-lg font-bold text-green-600">{platform.stats.received}</p>
                                                </div>
                                            </div>

                                            {/* Recent Messages */}
                                            {platform.messages.length > 0 ? (
                                                <>
                                                    <p className="text-sm font-medium mb-2">Recent Messages</p>
                                                    <div className="space-y-2 mb-4">
                                                        {platform.messages.slice(0, 3).map((message) => (
                                                            <div
                                                                key={message.id}
                                                                className="flex items-start gap-2 p-2 rounded-lg bg-muted/50 text-sm"
                                                            >
                                                                <MessageCircle className="h-4 w-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                                                                <div className="flex-1 min-w-0">
                                                                    <div className="flex items-center gap-2 mb-1">
                                                                        <Badge variant={message.direction === 'outbound' ? 'default' : 'secondary'} className="text-xs">
                                                                            {message.direction === 'outbound' ? 'Sent' : 'Received'}
                                                                        </Badge>
                                                                        <span className="text-xs text-muted-foreground">
                                                                            {message.direction === 'outbound' ? message.to : message.from}
                                                                        </span>
                                                                    </div>
                                                                    <p className="text-xs truncate">
                                                                        {message.content || `[${message.type}]`}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </>
                                            ) : (
                                                <div className="text-center py-4">
                                                    <p className="text-sm text-muted-foreground">No messages yet</p>
                                                </div>
                                            )}

                                            <Button className="w-full gap-2" variant="outline">
                                                View All Messages
                                                <ArrowRight className="h-4 w-4" />
                                            </Button>
                                        </>
                                    ) : (
                                        <div className="text-center py-8">
                                            <p className="text-sm text-muted-foreground mb-4">
                                                {platform.name} is not configured yet
                                            </p>
                                            <Link href="/user/meta/settings">
                                                <Button size="sm" className="gap-2">
                                                    <Settings className="h-4 w-4" />
                                                    Configure Now
                                                </Button>
                                            </Link>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>

                {/* Quick Actions */}
                <Card>
                    <CardHeader>
                        <CardTitle>Quick Actions</CardTitle>
                        <CardDescription>
                            Shortcuts to common messaging tasks
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-3 md:grid-cols-4">
                            <Link href="/user/meta/broadcast/create">
                                <Button variant="outline" className="w-full gap-2">
                                    <Send className="h-4 w-4" />
                                    Create Broadcast
                                </Button>
                            </Link>
                            <Link href="/user/meta/contacts">
                                <Button variant="outline" className="w-full gap-2">
                                    <MessageCircle className="h-4 w-4" />
                                    View Contacts
                                </Button>
                            </Link>
                            <Link href="/user/meta/auto-reply">
                                <Button variant="outline" className="w-full gap-2">
                                    <MessageSquare className="h-4 w-4" />
                                    Auto Replies
                                </Button>
                            </Link>
                            <Link href="/user/meta/settings">
                                <Button variant="outline" className="w-full gap-2">
                                    <Settings className="h-4 w-4" />
                                    Settings
                                </Button>
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </UserLayout>
    );
}
