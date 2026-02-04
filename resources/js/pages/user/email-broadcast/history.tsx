import UserLayout from '@/layouts/user/user-layout';
import { Head, Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Mail, CheckCircle, XCircle, Clock, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SmtpSetting {
    id: number;
    name: string;
    from_address: string;
}

interface UserEmail {
    id: number;
    email: string;
}

interface EmailBroadcast {
    id: number;
    subject: string;
    total_recipients: number;
    sent_count: number;
    failed_count: number;
    status: string;
    created_at: string;
    smtp_setting: SmtpSetting | null;
    user_email: UserEmail | null;
}

interface PaginatedBroadcasts {
    data: EmailBroadcast[];
    links: any[];
    current_page: number;
    last_page: number;
}

interface Stats {
    total: number;
    pending: number;
    processing: number;
    completed: number;
    failed: number;
}

interface Props {
    broadcasts: PaginatedBroadcasts;
    stats: Stats;
    currentStatus?: string;
}

export default function EmailBroadcastHistory({ broadcasts, stats, currentStatus }: Props) {
    const getStatusBadge = (status: string) => {
        const statusConfig = {
            pending: { variant: 'secondary' as const, icon: Clock, label: 'Pending' },
            processing: { variant: 'default' as const, icon: Loader2, label: 'Processing' },
            completed: { variant: 'default' as const, icon: CheckCircle, label: 'Completed', className: 'bg-green-500 hover:bg-green-600 text-white' },
            failed: { variant: 'destructive' as const, icon: XCircle, label: 'Failed' },
        };

        const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
        const Icon = config.icon;

        return (
            <Badge variant={config.variant} className={cn("flex items-center gap-1", (config as any).className)}>
                <Icon className="size-3" />
                {config.label}
            </Badge>
        );
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString('id-ID', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <UserLayout>
            <Head title="Email Broadcast History" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <Link href={'/user/email-broadcast'}>
                            <Button variant="ghost" size="sm" className="mb-2">
                                <ArrowLeft className="mr-2 size-4" />
                                Kembali
                            </Button>
                        </Link>
                        <h1 className="text-3xl font-bold">Broadcast History</h1>
                        <p className="text-muted-foreground mt-1">
                            Riwayat pengiriman email broadcast Anda
                        </p>
                    </div>
                </div>

                {/* Statistics */}
                <div className="grid gap-4 md:grid-cols-5">
                    <Card>
                        <CardHeader className="pb-3">
                            <CardDescription>Total</CardDescription>
                            <CardTitle className="text-3xl">{stats.total}</CardTitle>
                        </CardHeader>
                    </Card>
                    <Card>
                        <CardHeader className="pb-3">
                            <CardDescription>Pending</CardDescription>
                            <CardTitle className="text-3xl text-muted-foreground">{stats.pending}</CardTitle>
                        </CardHeader>
                    </Card>
                    <Card>
                        <CardHeader className="pb-3">
                            <CardDescription>Processing</CardDescription>
                            <CardTitle className="text-3xl text-blue-600">{stats.processing}</CardTitle>
                        </CardHeader>
                    </Card>
                    <Card>
                        <CardHeader className="pb-3">
                            <CardDescription>Completed</CardDescription>
                            <CardTitle className="text-3xl text-green-600">{stats.completed}</CardTitle>
                        </CardHeader>
                    </Card>
                    <Card>
                        <CardHeader className="pb-3">
                            <CardDescription>Failed</CardDescription>
                            <CardTitle className="text-3xl text-red-600">{stats.failed}</CardTitle>
                        </CardHeader>
                    </Card>
                </div>

                {/* Broadcast List */}
                {broadcasts.data.length === 0 ? (
                    <Card>
                        <CardContent className="flex flex-col items-center justify-center py-12">
                            <Mail className="size-12 text-muted-foreground mb-4" />
                            <h3 className="text-lg font-semibold mb-2">Belum ada broadcast</h3>
                            <p className="text-muted-foreground text-center mb-4">
                                Anda belum pernah mengirim email broadcast
                            </p>
                            <Link href={'/user/email-broadcast'}>
                                <Button>
                                    <Mail className="mr-2 size-4" />
                                    Kirim Broadcast
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-4">
                        {broadcasts.data.map((broadcast) => (
                            <Card key={broadcast.id}>
                                <CardHeader>
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <CardTitle className="text-xl">{broadcast.subject}</CardTitle>
                                                {getStatusBadge(broadcast.status)}
                                            </div>
                                            <CardDescription>
                                                Dikirim pada {formatDate(broadcast.created_at)}
                                                {broadcast.user_email && (
                                                    <> via {broadcast.user_email.email}</>
                                                )}
                                                {broadcast.smtp_setting && (
                                                    <> via {broadcast.smtp_setting.name} ({broadcast.smtp_setting.from_address})</>
                                                )}
                                            </CardDescription>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid gap-4 md:grid-cols-3">
                                        <div className="space-y-1">
                                            <p className="text-sm text-muted-foreground">Total Recipients</p>
                                            <p className="text-2xl font-bold">{broadcast.total_recipients}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-sm text-muted-foreground">Sent Successfully</p>
                                            <p className="text-2xl font-bold text-green-600">{broadcast.sent_count}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-sm text-muted-foreground">Failed</p>
                                            <p className="text-2xl font-bold text-red-600">{broadcast.failed_count}</p>
                                        </div>
                                    </div>

                                    {broadcast.status === 'completed' && broadcast.sent_count > 0 && (
                                        <div className="mt-4 pt-4 border-t">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="text-sm font-medium">Success Rate</p>
                                                    <p className="text-sm text-muted-foreground">
                                                        {((broadcast.sent_count / broadcast.total_recipients) * 100).toFixed(1)}%
                                                    </p>
                                                </div>
                                                <div className="w-full max-w-xs ml-4">
                                                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                                                        <div
                                                            className="h-full bg-green-600"
                                                            style={{
                                                                width: `${(broadcast.sent_count / broadcast.total_recipients) * 100}%`,
                                                            }}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        ))}

                        {/* Pagination */}
                        {broadcasts.last_page > 1 && (
                            <div className="flex justify-center gap-2 pt-4">
                                {broadcasts.links.map((link, index) => (
                                    <Link
                                        key={index}
                                        href={link.url || '#'}
                                        preserveState
                                        className={`px-4 py-2 rounded-md ${link.active
                                            ? 'bg-primary text-primary-foreground'
                                            : 'bg-muted hover:bg-muted/80'
                                            } ${!link.url && 'opacity-50 cursor-not-allowed'}`}
                                    >
                                        <span dangerouslySetInnerHTML={{ __html: link.label }} />
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </UserLayout>
    );
}
