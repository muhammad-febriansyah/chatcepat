import UserLayout from '@/layouts/user/user-layout';
import { Head, Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Mail, CheckCircle, XCircle, Clock, Loader2, Info, Users, ExternalLink, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';

interface SmtpSetting {
    id: number;
    name: string;
    from_address: string;
}

interface UserEmail {
    id: number;
    email: string;
}

interface MessageTemplate {
    id: number;
    name: string;
}

interface EmailBroadcast {
    id: number;
    subject: string;
    content: string;
    total_recipients: number;
    sent_count: number;
    failed_count: number;
    status: string;
    recipient_emails: string[];
    failed_emails: Array<{ email: string; error: string }> | null;
    started_at: string | null;
    completed_at: string | null;
    created_at: string;
    smtp_setting: SmtpSetting | null;
    user_email: UserEmail | null;
    template: MessageTemplate | null;
}

interface Props {
    broadcast: EmailBroadcast;
}

export default function EmailBroadcastShow({ broadcast }: Props) {
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
                <Icon className={cn("size-3", status === 'processing' && "animate-spin")} />
                {config.label}
            </Badge>
        );
    };

    const formatDate = (dateString: string | null) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleString('id-ID', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const successRate = broadcast.total_recipients > 0
        ? ((broadcast.sent_count / broadcast.total_recipients) * 100).toFixed(1)
        : '0';

    return (
        <UserLayout>
            <Head title={`Detail Broadcast: ${broadcast.subject}`} />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <Link href="/user/email-broadcast/history">
                            <Button variant="ghost" size="sm" className="mb-2">
                                <ArrowLeft className="mr-2 size-4" />
                                Kembali ke Riwayat
                            </Button>
                        </Link>
                        <h1 className="text-3xl font-bold tracking-tight">{broadcast.subject}</h1>
                        <div className="flex items-center gap-2 mt-2">
                            {getStatusBadge(broadcast.status)}
                            <span className="text-muted-foreground text-sm">
                                ID: #{broadcast.id} • Dibuat pada {formatDate(broadcast.created_at)}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="grid gap-6 md:grid-cols-3">
                    {/* Summary Stats */}
                    <Card className="md:col-span-3">
                        <CardHeader className="pb-4">
                            <CardTitle className="text-lg">Ringkasan Pengiriman</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                                <div className="space-y-1 p-4 rounded-lg bg-primary/5 border border-primary/10">
                                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Total Penerima</p>
                                    <div className="flex items-center gap-2">
                                        <Users className="size-4 text-primary" />
                                        <p className="text-2xl font-bold">{broadcast.total_recipients}</p>
                                    </div>
                                </div>
                                <div className="space-y-1 p-4 rounded-lg bg-green-500/5 border border-green-500/10">
                                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Berhasil</p>
                                    <div className="flex items-center gap-2">
                                        <CheckCircle className="size-4 text-green-600" />
                                        <p className="text-2xl font-bold text-green-600">{broadcast.sent_count}</p>
                                    </div>
                                </div>
                                <div className="space-y-1 p-4 rounded-lg bg-destructive/5 border border-destructive/10">
                                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Gagal</p>
                                    <div className="flex items-center gap-2">
                                        <XCircle className="size-4 text-destructive" />
                                        <p className="text-2xl font-bold text-destructive">{broadcast.failed_count}</p>
                                    </div>
                                </div>
                                <div className="space-y-1 p-4 rounded-lg bg-blue-500/5 border border-blue-500/10">
                                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Success Rate</p>
                                    <div className="flex items-center gap-2">
                                        <Info className="size-4 text-blue-600" />
                                        <p className="text-2xl font-bold text-blue-600">{successRate}%</p>
                                    </div>
                                </div>
                            </div>

                            {broadcast.status === 'processing' && (
                                <div className="mt-6 space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span>Progres Pengiriman</span>
                                        <span>{successRate}%</span>
                                    </div>
                                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-primary transition-all duration-500"
                                            style={{ width: `${successRate}%` }}
                                        />
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Details Column */}
                    <div className="md:col-span-2 space-y-6">
                        {/* Configuration Info */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <Settings className="size-5" />
                                    Konfigurasi Pengiriman
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <p className="text-sm text-muted-foreground">Metode Pengirim</p>
                                        <p className="font-medium">
                                            {broadcast.user_email ? 'Mailketing (Verified Email)' : 'SMTP Connection'}
                                        </p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-sm text-muted-foreground">Email Pengirim (From)</p>
                                        <p className="font-medium">
                                            {broadcast.user_email ? broadcast.user_email.email : (broadcast.smtp_setting?.from_address || '-')}
                                        </p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-sm text-muted-foreground">Template Digunakan</p>
                                        <p className="font-medium">{broadcast.template?.name || 'Tanpa Template'}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-sm text-muted-foreground">Waktu Mulai</p>
                                        <p className="font-medium">{formatDate(broadcast.started_at)}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-sm text-muted-foreground">Waktu Selesai</p>
                                        <p className="font-medium">{formatDate(broadcast.completed_at)}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Message Preview */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <Mail className="size-5" />
                                    Konten Pesan
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div>
                                        <p className="text-sm text-muted-foreground mb-1">Subject</p>
                                        <p className="p-3 rounded-lg bg-muted/50 font-medium">
                                            {broadcast.subject}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground mb-2">Isi Email</p>
                                        <div
                                            className="p-4 rounded-lg border bg-white dark:bg-zinc-950 overflow-auto max-h-[500px]"
                                            dangerouslySetInnerHTML={{ __html: broadcast.content }}
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Recipients Sidebar */}
                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Penerima</CardTitle>
                                <CardDescription>
                                    Daftar semua email penerima
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                                    {broadcast.recipient_emails.map((email, idx) => {
                                        const failure = broadcast.failed_emails?.find(f => f.email === email);
                                        return (
                                            <div key={idx} className="flex flex-col p-2 rounded-lg border bg-muted/30">
                                                <div className="flex items-center justify-between gap-2">
                                                    <span className="text-sm font-medium truncate">{email}</span>
                                                    {broadcast.status === 'completed' && (
                                                        failure ? (
                                                            <XCircle className="size-3.5 text-destructive shrink-0" />
                                                        ) : (
                                                            <CheckCircle className="size-3.5 text-green-500 shrink-0" />
                                                        )
                                                    )}
                                                </div>
                                                {failure && (
                                                    <p className="text-[10px] text-destructive mt-1 leading-tight">
                                                        Error: {failure.error}
                                                    </p>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </UserLayout>
    );
}
