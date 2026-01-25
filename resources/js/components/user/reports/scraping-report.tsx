import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { Loader2, Database, MapPin, Users, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';

interface ScrapingReportData {
    total_scraped: number;
    google_maps: number;
    whatsapp_contacts: number;
    whatsapp_groups: number;
    breakdown: Array<{
        type: string;
        count: number;
        percentage: number;
    }>;
    chart_data: Array<{
        date: string;
        google_maps: number;
        contacts: number;
        groups: number;
    }>;
}

export default function ScrapingReport() {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<ScrapingReportData | null>(null);
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
            const response = await axios.get('/user/reports/scraping', { params });
            setData(response.data);
        } catch (error) {
            console.error('Failed to fetch scraping report:', error);
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
                    <CardTitle>Laporan Scraping</CardTitle>
                    <CardDescription>Statistik data scraping dari berbagai sumber</CardDescription>
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
                        <CardTitle className="text-sm font-medium">Total Data Scraped</CardTitle>
                        <Database className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{data.total_scraped.toLocaleString('id-ID')}</div>
                        <p className="text-xs text-muted-foreground mt-1">Semua sumber data</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Google Maps</CardTitle>
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{data.google_maps.toLocaleString('id-ID')}</div>
                        <p className="text-xs text-muted-foreground mt-1">Tempat bisnis</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Kontak WhatsApp</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{data.whatsapp_contacts.toLocaleString('id-ID')}</div>
                        <p className="text-xs text-muted-foreground mt-1">Kontak individu</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Grup WhatsApp</CardTitle>
                        <MessageSquare className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{data.whatsapp_groups.toLocaleString('id-ID')}</div>
                        <p className="text-xs text-muted-foreground mt-1">Grup chat</p>
                    </CardContent>
                </Card>
            </div>

            {/* Breakdown */}
            <Card>
                <CardHeader>
                    <CardTitle>Breakdown by Type</CardTitle>
                    <CardDescription>Distribusi data berdasarkan sumber</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {data.breakdown.map((item) => (
                            <div key={item.type} className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <div className="space-y-1">
                                        <p className="text-sm font-medium">{item.type}</p>
                                        <p className="text-xs text-muted-foreground">
                                            {item.count.toLocaleString('id-ID')} data
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
        </div>
    );
}
