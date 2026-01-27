import { Head } from '@inertiajs/react';
import UserLayout from '@/layouts/user/user-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Send,
    Settings,
    TrendingUp,
    TrendingDown,
    MessageCircle,
    ArrowRight,
    Bot,
    Users,
    Megaphone
} from 'lucide-react';
import { Link } from '@inertiajs/react';

interface BotStats {
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
    created_at: string;
}

interface TelegramBot {
    id: number;
    name: string;
    username: string;
    is_active: boolean;
    auto_reply_enabled: boolean;
}

interface Props {
    stats: BotStats;
    recentMessages: RecentMessage[];
    bots: TelegramBot[];
    hasTelegramConfigured: boolean;
}

export default function TelegramIndex({ stats, recentMessages, bots, hasTelegramConfigured }: Props) {
    return (
        <UserLayout>
            <Head title="Telegram" />

            <div className="space-y-6">
                {/* Header */}
                <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-blue-500/10 via-blue-400/5 to-transparent p-6 border">
                    <div className="absolute inset-0 bg-grid-white/10 [mask-image:radial-gradient(white,transparent_85%)]" />
                    <div className="relative flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight text-foreground">
                                Telegram Bot Management
                            </h1>
                            <p className="text-muted-foreground mt-1">
                                Manage your Telegram bots and messages
                            </p>
                        </div>
                        <Link href="/user/telegram/session">
                            <Button size="lg" variant="outline" className="gap-2">
                                <Settings className="h-4 w-4" />
                                Setup Session
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Overall Stats */}
                <div className="grid gap-4 md:grid-cols-4">
                    <Card className="overflow-hidden border-2">
                        <div className="h-1 bg-gradient-to-r from-blue-500 to-cyan-500" />
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
                        <div className="h-1 bg-gradient-to-r from-blue-500 to-cyan-500" />
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium flex items-center gap-2">
                                Sent <TrendingUp className="h-4 w-4 text-blue-500" />
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
                            <CardTitle className="text-sm font-medium">Active Bots</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold">
                                {bots.filter(bot => bot.is_active).length} / {bots.length}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Telegram Bots */}
                <Card className="overflow-hidden">
                    <div className="h-1 bg-gradient-to-r from-blue-500 to-cyan-500" />
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-blue-500/10">
                                    <Send className="h-5 w-5 text-blue-500" />
                                </div>
                                <div>
                                    <CardTitle className="text-lg">Telegram Bots</CardTitle>
                                    <CardDescription className="text-xs">
                                        {hasTelegramConfigured ? (
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
                        {hasTelegramConfigured && bots.length > 0 ? (
                            <>
                                {/* Bots List */}
                                <div className="space-y-3 mb-4">
                                    {bots.map((bot) => (
                                        <div
                                            key={bot.id}
                                            className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                                        >
                                            <div className="flex items-center gap-3">
                                                <Bot className="h-5 w-5 text-blue-500" />
                                                <div>
                                                    <p className="font-medium">{bot.name}</p>
                                                    <p className="text-xs text-muted-foreground">@{bot.username}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {bot.is_active ? (
                                                    <Badge variant="default" className="bg-green-500">Active</Badge>
                                                ) : (
                                                    <Badge variant="secondary">Inactive</Badge>
                                                )}
                                                {bot.auto_reply_enabled && (
                                                    <Badge variant="outline" className="text-xs">Auto Reply</Badge>
                                                )}
                                            </div>
                                        </div>
                                    ))}
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
                                    No Telegram bots configured yet
                                </p>
                                <Link href="/user/telegram/session">
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
                            Shortcuts to common Telegram tasks
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-3 md:grid-cols-4">
                            <Link href="/user/telegram/broadcast">
                                <Button variant="outline" className="w-full gap-2">
                                    <Megaphone className="h-4 w-4" />
                                    Broadcast
                                </Button>
                            </Link>
                            <Link href="/user/telegram/bots">
                                <Button variant="outline" className="w-full gap-2">
                                    <Bot className="h-4 w-4" />
                                    Manage Bots
                                </Button>
                            </Link>
                            <Link href="/user/telegram/auto-replies">
                                <Button variant="outline" className="w-full gap-2">
                                    <MessageCircle className="h-4 w-4" />
                                    Auto Replies
                                </Button>
                            </Link>
                            <Link href="/user/telegram/session">
                                <Button variant="outline" className="w-full gap-2">
                                    <Settings className="h-4 w-4" />
                                    Session Setup
                                </Button>
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </UserLayout>
    );
}
