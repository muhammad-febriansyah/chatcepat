import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { logger } from '@/utils/logger';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { Loader2, Megaphone, Users, CheckCircle, XCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface BroadcastReportData {
    total_broadcasts: number;
    total_recipients: number;
    total_sent: number;
    total_failed: number;
    success_rate: number;
    whatsapp_stats: {
        total: number;
        recipients: number;
        sent: number;
        failed: number;
        by_status: Record<string, number>;
    };
    telegram_stats: {
        total: number;
        recipients: number;
        sent: number;
        failed: number;
        by_status: Record<string, number>;
    };
    chart_data: Array<{
        date: string;
        whatsapp: number;
        telegram: number;
    }>;
}

export default function BroadcastReport() {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<BroadcastReportData | null>(null);
    const today = new Date().toISOString().split('T')[0];
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const [startDate, setStartDate] = useState(thirtyDaysAgo);
    const [endDate, setEndDate] = useState(today);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const params = {
                start_date: startDate,
                end_date: endDate,
            };
            const response = await axios.get('/user/reports/broadcast', { params });
            setData(response.data);
        } catch (error) {
            logger.error('Failed to fetch broadcast report:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <Card>
                <CardContent className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </CardContent>
            </Card>
        );
    }

    if (!data) {
        return (
            <Card>
                <CardContent className="py-12">
                    <p className="text-center text-muted-foreground">Gagal memuat data laporan</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-6">
            {/* Date Range Filter */}
            <Card>
                <CardHeader>
                    <CardTitle>Laporan Broadcast</CardTitle>
                    <CardDescription>Statistik broadcast WhatsApp dan Telegram</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex gap-4 items-end">
                        <div className="flex-1">
                            <label className="text-sm font-medium">Tanggal Mulai</label>
                            <Input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                            />
                        </div>
                        <div className="flex-1">
                            <label className="text-sm font-medium">Tanggal Akhir</label>
                            <Input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                            />
                        </div>
                        <Button onClick={fetchData}>Filter</Button>
                    </div>
                </CardContent>
            </Card>

            {/* Overall Stats */}
            <div className="grid gap-4 md:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Broadcast</CardTitle>
                        <Megaphone className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{data.total_broadcasts}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            WA: {data.whatsapp_stats.total} | TG: {data.telegram_stats.total}
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Penerima</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{data.total_recipients.toLocaleString('id-ID')}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            WA: {data.whatsapp_stats.recipients} | TG: {data.telegram_stats.recipients}
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Terkirim</CardTitle>
                        <CheckCircle className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">{data.total_sent.toLocaleString('id-ID')}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            WA: {data.whatsapp_stats.sent} | TG: {data.telegram_stats.sent}
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Gagal</CardTitle>
                        <XCircle className="h-4 w-4 text-red-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-600">{data.total_failed.toLocaleString('id-ID')}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Success Rate: <span className="font-semibold">{data.success_rate}%</span>
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Platform Breakdown */}
            <div className="grid gap-4 md:grid-cols-2">
                {/* WhatsApp */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">WhatsApp Broadcast</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm text-muted-foreground">Total</p>
                                <p className="text-2xl font-bold">{data.whatsapp_stats.total}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Penerima</p>
                                <p className="text-2xl font-bold">{data.whatsapp_stats.recipients}</p>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span>Terkirim</span>
                                <span className="font-medium text-green-600">{data.whatsapp_stats.sent}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span>Gagal</span>
                                <span className="font-medium text-red-600">{data.whatsapp_stats.failed}</span>
                            </div>
                        </div>
                        {Object.keys(data.whatsapp_stats.by_status).length > 0 && (
                            <div className="pt-2 border-t">
                                <p className="text-sm font-medium mb-2">Status:</p>
                                <div className="flex flex-wrap gap-2">
                                    {Object.entries(data.whatsapp_stats.by_status).map(([status, count]) => (
                                        <Badge key={status} variant="outline">
                                            {status}: {count}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Telegram */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Telegram Broadcast</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm text-muted-foreground">Total</p>
                                <p className="text-2xl font-bold">{data.telegram_stats.total}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Penerima</p>
                                <p className="text-2xl font-bold">{data.telegram_stats.recipients}</p>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span>Terkirim</span>
                                <span className="font-medium text-green-600">{data.telegram_stats.sent}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span>Gagal</span>
                                <span className="font-medium text-red-600">{data.telegram_stats.failed}</span>
                            </div>
                        </div>
                        {Object.keys(data.telegram_stats.by_status).length > 0 && (
                            <div className="pt-2 border-t">
                                <p className="text-sm font-medium mb-2">Status:</p>
                                <div className="flex flex-wrap gap-2">
                                    {Object.entries(data.telegram_stats.by_status).map(([status, count]) => (
                                        <Badge key={status} variant="outline">
                                            {status}: {count}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
