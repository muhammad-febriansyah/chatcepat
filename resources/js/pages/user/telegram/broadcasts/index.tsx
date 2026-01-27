import { Head, Link } from '@inertiajs/react';
import UserLayout from '@/layouts/user/user-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Megaphone, Plus, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface Broadcast {
    id: number;
    name: string;
    message_type: string;
    message_content: string;
    status: 'draft' | 'scheduled' | 'processing' | 'completed' | 'failed';
    total_recipients: number;
    sent_count: number;
    failed_count: number;
    created_at: string;
    telegram_bot: {
        name: string;
        username: string;
    };
}

interface Props {
    broadcasts: {
        data: Broadcast[];
    };
}

export default function TelegramBroadcasts({ broadcasts }: Props) {
    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'completed':
                return <Badge className="bg-green-500"><CheckCircle2 className="mr-1 h-3 w-3" />Completed</Badge>;
            case 'processing':
                return <Badge className="bg-blue-500"><Clock className="mr-1 h-3 w-3" />Processing</Badge>;
            case 'failed':
                return <Badge variant="destructive"><XCircle className="mr-1 h-3 w-3" />Failed</Badge>;
            default:
                return <Badge variant="secondary">{status}</Badge>;
        }
    };

    return (
        <UserLayout>
            <Head title="Broadcasts" />

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">Broadcasts</h1>
                        <p className="text-muted-foreground mt-2">
                            Manage your broadcast campaigns
                        </p>
                    </div>
                    <Button asChild>
                        <Link href="/user/telegram/broadcasts/create">
                            <Plus className="mr-2 h-4 w-4" />
                            New Broadcast
                        </Link>
                    </Button>
                </div>

                {broadcasts.data.length === 0 ? (
                    <Card>
                        <CardContent className="flex flex-col items-center justify-center py-12">
                            <Megaphone className="h-16 w-16 text-muted-foreground mb-4" />
                            <h3 className="text-lg font-semibold mb-2">No Broadcasts Yet</h3>
                            <p className="text-sm text-muted-foreground mb-4">
                                Create your first broadcast campaign
                            </p>
                            <Button asChild>
                                <Link href="/user/telegram/broadcasts/create">
                                    <Plus className="mr-2 h-4 w-4" />
                                    Create Broadcast
                                </Link>
                            </Button>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-4">
                        {broadcasts.data.map((broadcast) => {
                            const successRate = broadcast.total_recipients > 0
                                ? (broadcast.sent_count / broadcast.total_recipients) * 100
                                : 0;

                            return (
                                <Card key={broadcast.id}>
                                    <CardHeader>
                                        <div className="flex items-start justify-between">
                                            <div className="space-y-1">
                                                <CardTitle className="text-xl">{broadcast.name}</CardTitle>
                                                <CardDescription>
                                                    via {broadcast.telegram_bot.name} (@{broadcast.telegram_bot.username})
                                                </CardDescription>
                                            </div>
                                            {getStatusBadge(broadcast.status)}
                                        </div>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="p-3 rounded-lg bg-muted/50">
                                            <p className="text-sm line-clamp-2">{broadcast.message_content}</p>
                                        </div>

                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                            <div>
                                                <p className="text-sm text-muted-foreground">Total Recipients</p>
                                                <p className="text-2xl font-bold">{broadcast.total_recipients}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-muted-foreground">Sent</p>
                                                <p className="text-2xl font-bold text-green-600">{broadcast.sent_count}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-muted-foreground">Failed</p>
                                                <p className="text-2xl font-bold text-red-600">{broadcast.failed_count}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-muted-foreground">Success Rate</p>
                                                <p className="text-2xl font-bold">{successRate.toFixed(1)}%</p>
                                            </div>
                                        </div>

                                        {broadcast.status === 'processing' && (
                                            <div className="space-y-2">
                                                <div className="flex justify-between text-sm">
                                                    <span>Progress</span>
                                                    <span>{broadcast.sent_count + broadcast.failed_count} / {broadcast.total_recipients}</span>
                                                </div>
                                                <Progress value={((broadcast.sent_count + broadcast.failed_count) / broadcast.total_recipients) * 100} />
                                            </div>
                                        )}

                                        <div className="flex items-center justify-between pt-2 border-t">
                                            <p className="text-sm text-muted-foreground">
                                                Created {new Date(broadcast.created_at).toLocaleString()}
                                            </p>
                                            <Button variant="outline" size="sm" asChild>
                                                <Link href={`/user/telegram/broadcasts/${broadcast.id}`}>
                                                    View Details
                                                </Link>
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                )}
            </div>
        </UserLayout>
    );
}
