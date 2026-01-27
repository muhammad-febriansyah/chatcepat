import { Head } from '@inertiajs/react';
import UserLayout from '@/layouts/user/user-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Instagram,
    Settings,
    TrendingUp,
    TrendingDown,
    MessageCircle,
    ArrowRight,
    Send,
    Users
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
    content: string | null;
    direction: 'inbound' | 'outbound';
    status: string;
    created_at: string;
}

interface Props {
    stats: MessageStats;
    recentMessages: RecentMessage[];
    hasInstagramConfigured: boolean;
}

export default function InstagramDMIndex({ stats, recentMessages, hasInstagramConfigured }: Props) {
    return (
        <UserLayout>
            <Head title="Instagram DM" />

            <div className="space-y-6">
                {/* Header */}
                <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-pink-500/10 via-rose-400/5 to-transparent p-6 border">
                    <div className="absolute inset-0 bg-grid-white/10 [mask-image:radial-gradient(white,transparent_85%)]" />
                    <div className="relative flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight text-foreground">
                                Instagram Direct Messages
                            </h1>
                            <p className="text-muted-foreground mt-1">
                                Manage your Instagram DM conversations
                            </p>
                        </div>
                        <Link href="/user/meta/settings">
                            <Button size="lg" variant="outline" className="gap-2">
                                <Settings className="h-4 w-4" />
                                Configure Platform
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Overall Stats */}
                <div className="grid gap-4 md:grid-cols-4">
                    <Card className="overflow-hidden border-2">
                        <div className="h-1 bg-gradient-to-r from-pink-500 to-rose-600" />
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">Total Messages</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold">
                                {stats.total}
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="overflow-hidden border-2">
                        <div className="h-1 bg-gradient-to-r from-pink-500 to-purple-500" />
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium flex items-center gap-2">
                                Sent <TrendingUp className="h-4 w-4 text-pink-500" />
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold">
                                {stats.sent}
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
                                {stats.received}
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="overflow-hidden border-2">
                        <div className="h-1 bg-gradient-to-r from-purple-500 to-indigo-500" />
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">Status</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-lg font-bold">
                                {hasInstagramConfigured ? (
                                    <Badge variant="default" className="bg-green-500">Connected</Badge>
                                ) : (
                                    <Badge variant="secondary">Not Connected</Badge>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Instagram DM Card */}
                <Card className="overflow-hidden">
                    <div className="h-1 bg-gradient-to-r from-pink-500 to-rose-600" />
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-pink-500/10">
                                    <Instagram className="h-5 w-5 text-pink-500" />
                                </div>
                                <div>
                                    <CardTitle className="text-lg">Instagram Direct Messages</CardTitle>
                                    <CardDescription className="text-xs">
                                        {hasInstagramConfigured ? (
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
                        {hasInstagramConfigured ? (
                            <>
                                {/* Stats */}
                                <div className="grid grid-cols-3 gap-2 mb-4">
                                    <div className="text-center p-2 rounded-lg bg-muted">
                                        <p className="text-xs text-muted-foreground">Total</p>
                                        <p className="text-lg font-bold">{stats.total}</p>
                                    </div>
                                    <div className="text-center p-2 rounded-lg bg-pink-500/10">
                                        <p className="text-xs text-muted-foreground">Sent</p>
                                        <p className="text-lg font-bold text-pink-600">{stats.sent}</p>
                                    </div>
                                    <div className="text-center p-2 rounded-lg bg-green-500/10">
                                        <p className="text-xs text-muted-foreground">Received</p>
                                        <p className="text-lg font-bold text-green-600">{stats.received}</p>
                                    </div>
                                </div>

                                {/* Recent Messages */}
                                {recentMessages.length > 0 ? (
                                    <>
                                        <p className="text-sm font-medium mb-2">Recent Messages</p>
                                        <div className="space-y-2 mb-4">
                                            {recentMessages.slice(0, 3).map((message) => (
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
                                                            {message.content || '[Media]'}
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
                                    Instagram DM is not configured yet
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

                {/* Quick Actions */}
                <Card>
                    <CardHeader>
                        <CardTitle>Quick Actions</CardTitle>
                        <CardDescription>
                            Shortcuts to common Instagram DM tasks
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
                                    <Users className="h-4 w-4" />
                                    View Contacts
                                </Button>
                            </Link>
                            <Link href="/user/meta/auto-reply">
                                <Button variant="outline" className="w-full gap-2">
                                    <MessageCircle className="h-4 w-4" />
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
