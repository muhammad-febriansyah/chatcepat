import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { Loader2, TrendingUp, TrendingDown, Minus, Megaphone, Database, Bot } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface GeneralStats {
    broadcasts: number;
    scraped_data: number;
    auto_reply_rules: number;
}

interface Comparison {
    difference: number;
    percentage: number;
    trend: 'up' | 'down' | 'stable';
}

interface GeneralReportData {
    current: GeneralStats;
    previous: GeneralStats;
    comparison: {
        broadcasts: Comparison;
        scraped_data: Comparison;
        auto_reply_rules: Comparison;
    };
    period: {
        current_start: string;
        current_end: string;
        previous_start: string;
        previous_end: string;
    };
}

export default function GeneralReport() {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<GeneralReportData | null>(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const response = await axios.get('/user/reports/general');
            setData(response.data);
        } catch (error) {
            console.error('Failed to fetch general report:', error);
        } finally {
            setLoading(false);
        }
    };

    const getTrendIcon = (trend: string) => {
        if (trend === 'up') return <TrendingUp className="h-4 w-4 text-green-500" />;
        if (trend === 'down') return <TrendingDown className="h-4 w-4 text-red-500" />;
        return <Minus className="h-4 w-4 text-muted-foreground" />;
    };

    const getTrendBadge = (comparison: Comparison) => {
        const variant = comparison.trend === 'up' ? 'default' : comparison.trend === 'down' ? 'destructive' : 'secondary';
        const sign = comparison.difference > 0 ? '+' : '';

        return (
            <Badge variant={variant} className="ml-2">
                {sign}{comparison.percentage}%
            </Badge>
        );
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
            {/* Period Info */}
            <Card>
                <CardHeader>
                    <CardTitle>Ringkasan Aktivitas</CardTitle>
                    <CardDescription>
                        Perbandingan periode {new Date(data.period.current_start).toLocaleDateString('id-ID')} - {new Date(data.period.current_end).toLocaleDateString('id-ID')}
                    </CardDescription>
                </CardHeader>
            </Card>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-3">
                {/* Broadcasts */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Broadcast</CardTitle>
                        <Megaphone className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{data.current.broadcasts}</div>
                        <div className="flex items-center text-xs text-muted-foreground mt-1">
                            {getTrendIcon(data.comparison.broadcasts.trend)}
                            <span className="ml-1">
                                {Math.abs(data.comparison.broadcasts.difference)} dari periode sebelumnya
                            </span>
                            {getTrendBadge(data.comparison.broadcasts)}
                        </div>
                    </CardContent>
                </Card>

                {/* Scraped Data */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Data Scraped</CardTitle>
                        <Database className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{data.current.scraped_data}</div>
                        <div className="flex items-center text-xs text-muted-foreground mt-1">
                            {getTrendIcon(data.comparison.scraped_data.trend)}
                            <span className="ml-1">
                                {Math.abs(data.comparison.scraped_data.difference)} dari periode sebelumnya
                            </span>
                            {getTrendBadge(data.comparison.scraped_data)}
                        </div>
                    </CardContent>
                </Card>

                {/* Auto Reply Rules */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Auto Reply Rules</CardTitle>
                        <Bot className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{data.current.auto_reply_rules}</div>
                        <div className="flex items-center text-xs text-muted-foreground mt-1">
                            {getTrendIcon(data.comparison.auto_reply_rules.trend)}
                            <span className="ml-1">
                                {Math.abs(data.comparison.auto_reply_rules.difference)} dari periode sebelumnya
                            </span>
                            {getTrendBadge(data.comparison.auto_reply_rules)}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Comparison Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Perbandingan Detail</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div className="grid grid-cols-4 gap-4 text-sm font-medium border-b pb-2">
                            <div>Metrik</div>
                            <div className="text-right">Periode Sekarang</div>
                            <div className="text-right">Periode Sebelumnya</div>
                            <div className="text-right">Perubahan</div>
                        </div>

                        <div className="grid grid-cols-4 gap-4 text-sm">
                            <div>Broadcast</div>
                            <div className="text-right font-medium">{data.current.broadcasts}</div>
                            <div className="text-right text-muted-foreground">{data.previous.broadcasts}</div>
                            <div className="text-right">
                                {getTrendBadge(data.comparison.broadcasts)}
                            </div>
                        </div>

                        <div className="grid grid-cols-4 gap-4 text-sm">
                            <div>Data Scraped</div>
                            <div className="text-right font-medium">{data.current.scraped_data}</div>
                            <div className="text-right text-muted-foreground">{data.previous.scraped_data}</div>
                            <div className="text-right">
                                {getTrendBadge(data.comparison.scraped_data)}
                            </div>
                        </div>

                        <div className="grid grid-cols-4 gap-4 text-sm">
                            <div>Auto Reply Rules</div>
                            <div className="text-right font-medium">{data.current.auto_reply_rules}</div>
                            <div className="text-right text-muted-foreground">{data.previous.auto_reply_rules}</div>
                            <div className="text-right">
                                {getTrendBadge(data.comparison.auto_reply_rules)}
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
