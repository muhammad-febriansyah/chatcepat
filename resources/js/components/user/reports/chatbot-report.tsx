import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { logger } from '@/utils/logger';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { Loader2, Bot, MessageCircle, CheckCircle, XCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';

interface ChatbotReportData {
    total_rules: number;
    active_rules: number;
    inactive_rules: number;
    whatsapp_rules: number;
    telegram_rules: number;
    by_type: {
        ai: number;
        manual: number;
    };
    breakdown: Array<{
        type: string;
        count: number;
        percentage: number;
    }>;
    chart_data: Array<{
        date: string;
        whatsapp: number;
        telegram: number;
    }>;
}

export default function ChatbotReport() {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<ChatbotReportData | null>(null);
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
            const response = await axios.get('/user/reports/chatbot', { params });
            setData(response.data);
        } catch (error) {
            logger.error('Failed to fetch chatbot report:', error);
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

    const activePercentage = data.total_rules > 0 ? (data.active_rules / data.total_rules) * 100 : 0;

    return (
        <div className="space-y-6">
            {/* Date Range Filter */}
            <Card>
                <CardHeader>
                    <CardTitle>Laporan Chatbot & Auto Reply</CardTitle>
                    <CardDescription>Statistik rules dan auto reply configuration</CardDescription>
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
                        <CardTitle className="text-sm font-medium">Total Rules</CardTitle>
                        <MessageCircle className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{data.total_rules}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            WA: {data.whatsapp_rules} | TG: {data.telegram_rules}
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Rules</CardTitle>
                        <CheckCircle className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">{data.active_rules}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            {activePercentage.toFixed(1)}% dari total
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Inactive Rules</CardTitle>
                        <XCircle className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-muted-foreground">{data.inactive_rules}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            {(100 - activePercentage).toFixed(1)}% dari total
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">AI Rules</CardTitle>
                        <Bot className="h-4 w-4 text-primary" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-primary">{data.by_type.ai}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Manual: {data.by_type.manual}
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Type Breakdown */}
            <Card>
                <CardHeader>
                    <CardTitle>Reply Type Distribution</CardTitle>
                    <CardDescription>Perbandingan AI Reply vs Manual Reply</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {data.breakdown.map((item) => (
                            <div key={item.type} className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <p className="text-sm font-medium">{item.type}</p>
                                            {item.type === 'AI Reply' && (
                                                <Badge variant="default" className="text-xs">
                                                    <Bot className="h-3 w-3 mr-1" />
                                                    AI Powered
                                                </Badge>
                                            )}
                                        </div>
                                        <p className="text-xs text-muted-foreground">
                                            {item.count} rules
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-bold">{item.percentage}%</p>
                                    </div>
                                </div>
                                <Progress value={item.percentage} className="h-2" />
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Platform Distribution */}
            <div className="grid gap-4 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">WhatsApp Rules</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div>
                                <p className="text-sm text-muted-foreground">Total Rules</p>
                                <p className="text-3xl font-bold">{data.whatsapp_rules}</p>
                            </div>
                            <div className="pt-2 border-t">
                                <p className="text-xs text-muted-foreground">
                                    {data.total_rules > 0
                                        ? `${((data.whatsapp_rules / data.total_rules) * 100).toFixed(1)}% dari total rules`
                                        : 'Belum ada rules'
                                    }
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Telegram Rules</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div>
                                <p className="text-sm text-muted-foreground">Total Rules</p>
                                <p className="text-3xl font-bold">{data.telegram_rules}</p>
                            </div>
                            <div className="pt-2 border-t">
                                <p className="text-xs text-muted-foreground">
                                    {data.total_rules > 0
                                        ? `${((data.telegram_rules / data.total_rules) * 100).toFixed(1)}% dari total rules`
                                        : 'Belum ada rules'
                                    }
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
