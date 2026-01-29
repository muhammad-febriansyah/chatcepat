import { Head, Link } from '@inertiajs/react';
import AdminLayout from '@/layouts/admin/admin-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, CheckCircle, AlertCircle, Clock } from 'lucide-react';

interface WebhookLog {
    id: number;
    platform: string;
    event_type: string;
    sender_id: string | null;
    recipient_id: string | null;
    message_id: string | null;
    status: 'success' | 'failed' | 'pending';
    payload: any;
    response: any;
    error_message: string | null;
    user: {
        id: number;
        name: string;
        email: string;
    } | null;
    created_at: string;
}

interface Props {
    log: WebhookLog;
}

const statusConfig = {
    success: { label: 'Success', color: 'bg-green-100 text-green-700', icon: CheckCircle },
    failed: { label: 'Failed', color: 'bg-red-100 text-red-700', icon: AlertCircle },
    pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-700', icon: Clock },
};

export default function WebhookLogShow({ log }: Props) {
    const stat = statusConfig[log.status];
    const Icon = stat.icon;

    return (
        <AdminLayout>
            <Head title={`Webhook Log #${log.id}`} />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">
                            Webhook Log #{log.id}
                        </h1>
                        <p className="text-muted-foreground mt-1">
                            Detailed webhook event information
                        </p>
                    </div>
                    <Link href="/admin/meta/webhook-logs">
                        <Button variant="outline" className="gap-2">
                            <ArrowLeft className="h-4 w-4" />
                            Back to Logs
                        </Button>
                    </Link>
                </div>

                {/* Overview */}
                <Card>
                    <CardHeader>
                        <CardTitle>Overview</CardTitle>
                        <CardDescription>Basic webhook information</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4 md:grid-cols-2">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Platform</p>
                                <Badge variant="secondary" className="mt-1">
                                    {log.platform}
                                </Badge>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Event Type</p>
                                <code className="text-sm bg-muted px-2 py-1 rounded mt-1 inline-block">
                                    {log.event_type}
                                </code>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Status</p>
                                <Badge className={`${stat.color} mt-1`}>
                                    <Icon className="h-3 w-3 mr-1" />
                                    {stat.label}
                                </Badge>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Created At</p>
                                <p className="text-sm mt-1">{log.created_at}</p>
                            </div>
                            {log.sender_id && (
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Sender ID</p>
                                    <p className="text-sm mt-1 font-mono">{log.sender_id}</p>
                                </div>
                            )}
                            {log.recipient_id && (
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Recipient ID</p>
                                    <p className="text-sm mt-1 font-mono">{log.recipient_id}</p>
                                </div>
                            )}
                            {log.message_id && (
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Message ID</p>
                                    <p className="text-sm mt-1 font-mono">{log.message_id}</p>
                                </div>
                            )}
                            {log.user && (
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">User</p>
                                    <p className="text-sm mt-1">{log.user.name}</p>
                                    <p className="text-xs text-muted-foreground">{log.user.email}</p>
                                </div>
                            )}
                        </div>

                        {log.error_message && (
                            <div className="mt-4 p-4 rounded-lg bg-red-50 border border-red-200">
                                <p className="text-sm font-medium text-red-700 mb-2">Error Message</p>
                                <p className="text-sm text-red-600">{log.error_message}</p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Payload */}
                <Card>
                    <CardHeader>
                        <CardTitle>Request Payload</CardTitle>
                        <CardDescription>Webhook request data received</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <pre className="p-4 rounded-lg bg-muted overflow-x-auto text-xs font-mono">
                            {JSON.stringify(log.payload, null, 2)}
                        </pre>
                    </CardContent>
                </Card>

                {/* Response */}
                {log.response && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Response</CardTitle>
                            <CardDescription>Webhook processing response</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <pre className="p-4 rounded-lg bg-muted overflow-x-auto text-xs font-mono">
                                {JSON.stringify(log.response, null, 2)}
                            </pre>
                        </CardContent>
                    </Card>
                )}
            </div>
        </AdminLayout>
    );
}
