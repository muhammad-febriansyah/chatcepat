import { Head, Link } from '@inertiajs/react';
import UserLayout from '@/layouts/user/user-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Calendar, Monitor, MapPin, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

interface ActivityLog {
    id: number;
    action: string;
    action_label: string;
    resource_type: string | null;
    resource_type_label: string | null;
    resource_id: number | null;
    resource_name: string | null;
    description: string;
    old_values: Record<string, any> | null;
    new_values: Record<string, any> | null;
    metadata: Record<string, any> | null;
    ip_address: string;
    user_agent: string;
    device_type: string;
    browser: string;
    platform: string;
    is_successful: boolean;
    error_message: string | null;
    created_at: string;
    created_at_human: string;
    user: {
        id: number;
        name: string;
        email: string;
    };
}

interface Props {
    log: ActivityLog;
}

export default function ActivityLogShow({ log }: Props) {
    const getActionBadgeVariant = (action: string): 'default' | 'secondary' | 'destructive' | 'outline' => {
        if (action === 'create') return 'default';
        if (action === 'update') return 'secondary';
        if (action === 'delete') return 'destructive';
        if (action === 'login') return 'outline';
        return 'secondary';
    };

    const renderJsonDiff = (oldValues: Record<string, any> | null, newValues: Record<string, any> | null) => {
        if (!oldValues && !newValues) {
            return <p className="text-sm text-muted-foreground">Tidak ada perubahan data</p>;
        }

        const allKeys = new Set([
            ...Object.keys(oldValues || {}),
            ...Object.keys(newValues || {})
        ]);

        return (
            <div className="space-y-2">
                {Array.from(allKeys).map((key) => {
                    const oldValue = oldValues?.[key];
                    const newValue = newValues?.[key];
                    const hasChanged = JSON.stringify(oldValue) !== JSON.stringify(newValue);

                    if (key === 'password' || key === 'password_confirmation') {
                        return null; // Don't show sensitive data
                    }

                    return (
                        <div key={key} className="grid grid-cols-3 gap-4 text-sm border-b pb-2">
                            <div className="font-medium">{key}</div>
                            <div className={oldValue !== undefined && hasChanged ? 'text-red-600 line-through' : ''}>
                                {oldValue !== undefined ? (
                                    typeof oldValue === 'object' ? (
                                        <code className="text-xs">{JSON.stringify(oldValue)}</code>
                                    ) : (
                                        String(oldValue)
                                    )
                                ) : (
                                    <span className="text-muted-foreground">-</span>
                                )}
                            </div>
                            <div className={newValue !== undefined && hasChanged ? 'text-green-600 font-medium' : ''}>
                                {newValue !== undefined ? (
                                    typeof newValue === 'object' ? (
                                        <code className="text-xs">{JSON.stringify(newValue)}</code>
                                    ) : (
                                        String(newValue)
                                    )
                                ) : (
                                    <span className="text-muted-foreground">-</span>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        );
    };

    return (
        <UserLayout>
            <Head title={`Detail Log #${log.id}`} />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="icon" asChild>
                        <Link href="/user/activity-logs">
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold">Detail Log Aktivitas</h1>
                        <p className="text-muted-foreground">
                            Log ID: #{log.id}
                        </p>
                    </div>
                </div>

                {/* Status Card */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div className="space-y-1">
                                <CardTitle className="text-2xl">{log.description}</CardTitle>
                                <CardDescription>{log.created_at_human}</CardDescription>
                            </div>
                            <div className="flex items-center gap-2">
                                <Badge variant={getActionBadgeVariant(log.action)} className="text-base">
                                    {log.action_label}
                                </Badge>
                                {log.is_successful ? (
                                    <Badge variant="default" className="bg-green-500 text-base">
                                        <CheckCircle className="h-4 w-4 mr-1" />
                                        Berhasil
                                    </Badge>
                                ) : (
                                    <Badge variant="destructive" className="text-base">
                                        <XCircle className="h-4 w-4 mr-1" />
                                        Gagal
                                    </Badge>
                                )}
                            </div>
                        </div>
                    </CardHeader>
                </Card>

                {/* Error Message */}
                {!log.is_successful && log.error_message && (
                    <Card className="border-red-200 bg-red-50">
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <AlertCircle className="h-5 w-5 text-red-500" />
                                <CardTitle className="text-lg text-red-700">Error Message</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-red-600">{log.error_message}</p>
                        </CardContent>
                    </Card>
                )}

                <div className="grid gap-6 md:grid-cols-2">
                    {/* Resource Info */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Resource Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Resource Type</p>
                                <p className="text-base">{log.resource_type_label || '-'}</p>
                            </div>
                            <Separator />
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Resource ID</p>
                                <p className="text-base font-mono">{log.resource_id || '-'}</p>
                            </div>
                            <Separator />
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Resource Name</p>
                                <p className="text-base">{log.resource_name || '-'}</p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Request Context */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Request Context</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">IP Address</p>
                                <div className="flex items-center gap-2">
                                    <MapPin className="h-4 w-4 text-muted-foreground" />
                                    <p className="text-base font-mono">{log.ip_address}</p>
                                </div>
                            </div>
                            <Separator />
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Device</p>
                                <div className="flex items-center gap-2">
                                    <Monitor className="h-4 w-4 text-muted-foreground" />
                                    <p className="text-base capitalize">{log.device_type}</p>
                                </div>
                            </div>
                            <Separator />
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Browser & Platform</p>
                                <p className="text-base">{log.browser} on {log.platform}</p>
                            </div>
                            <Separator />
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Timestamp</p>
                                <div className="flex items-center gap-2">
                                    <Calendar className="h-4 w-4 text-muted-foreground" />
                                    <p className="text-base">
                                        {new Date(log.created_at).toLocaleString('id-ID', {
                                            dateStyle: 'full',
                                            timeStyle: 'medium',
                                        })}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Data Changes */}
                {(log.old_values || log.new_values) && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Data Changes</CardTitle>
                            <CardDescription>
                                {log.action === 'create' && 'New data created'}
                                {log.action === 'update' && 'Changed values (old → new)'}
                                {log.action === 'delete' && 'Deleted data'}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-3 gap-4 text-sm font-semibold border-b pb-2 mb-4">
                                <div>Field</div>
                                <div>Old Value</div>
                                <div>New Value</div>
                            </div>
                            {renderJsonDiff(log.old_values, log.new_values)}
                        </CardContent>
                    </Card>
                )}

                {/* Metadata */}
                {log.metadata && Object.keys(log.metadata).length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Additional Metadata</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <pre className="text-xs bg-muted p-4 rounded-lg overflow-x-auto">
                                {JSON.stringify(log.metadata, null, 2)}
                            </pre>
                        </CardContent>
                    </Card>
                )}

                {/* User Agent */}
                <Card>
                    <CardHeader>
                        <CardTitle>User Agent</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <code className="text-xs break-all">{log.user_agent}</code>
                    </CardContent>
                </Card>
            </div>
        </UserLayout>
    );
}
