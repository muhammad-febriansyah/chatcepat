import { Head, Link } from '@inertiajs/react';
import UserLayout from '@/layouts/user/user-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    TrendingUp,
    Plus,
    BarChart3,
    DollarSign,
    Target,
    Eye,
    Edit,
    Trash2,
    ToggleLeft,
    ToggleRight,
} from 'lucide-react';
import { useState } from 'react';

interface Campaign {
    id: number;
    name: string;
    product_name: string;
    trigger_type: string;
    discount_percentage: number;
    conversions: number;
    revenue: number;
    is_active: boolean;
    created_at: string;
}

interface Statistics {
    total_campaigns: number;
    active_campaigns: number;
    total_conversions: number;
    total_revenue: number;
}

interface Props {
    user: any;
    campaigns: Campaign[];
    products: any[];
    statistics: Statistics;
}

export default function UpSellingIndex({ user, campaigns = [], products = [], statistics }: Props) {
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(amount);
    };

    const getTriggerLabel = (type: string) => {
        const labels: Record<string, string> = {
            after_purchase: 'Setelah Pembelian',
            cart_abandonment: 'Keranjang Ditinggalkan',
            browsing: 'Sedang Browsing',
        };
        return labels[type] || type;
    };

    return (
        <UserLayout>
            <Head title="Up Selling" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Up Selling</h1>
                        <p className="text-muted-foreground mt-1">
                            Tingkatkan penjualan dengan campaign up selling otomatis
                        </p>
                    </div>
                    <Link href={route('user.upselling.create')}>
                        <Button className="gap-2">
                            <Plus className="size-4" />
                            Buat Campaign
                        </Button>
                    </Link>
                </div>

                {/* Statistics Cards */}
                <div className="grid gap-6 md:grid-cols-4">
                    <Card className="overflow-hidden border-2">
                        <div className="h-1 bg-gradient-to-r from-blue-500 to-cyan-500" />
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">Total Campaign</CardTitle>
                            <Target className="size-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold">{statistics.total_campaigns}</div>
                            <p className="text-xs text-muted-foreground mt-1">
                                {statistics.active_campaigns} aktif
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="overflow-hidden border-2">
                        <div className="h-1 bg-gradient-to-r from-green-500 to-emerald-500" />
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">Campaign Aktif</CardTitle>
                            <ToggleRight className="size-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold">{statistics.active_campaigns}</div>
                            <p className="text-xs text-muted-foreground mt-1">
                                Sedang berjalan
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="overflow-hidden border-2">
                        <div className="h-1 bg-gradient-to-r from-purple-500 to-pink-500" />
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">Total Konversi</CardTitle>
                            <TrendingUp className="size-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold">{statistics.total_conversions}</div>
                            <p className="text-xs text-muted-foreground mt-1">
                                Dari semua campaign
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="overflow-hidden border-2">
                        <div className="h-1 bg-gradient-to-r from-orange-500 to-red-500" />
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                            <DollarSign className="size-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold">
                                {formatCurrency(statistics.total_revenue)}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                                Dari up selling
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Campaigns List */}
                <Card>
                    <CardHeader className="border-b">
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle>Daftar Campaign</CardTitle>
                                <CardDescription className="mt-1">
                                    Kelola campaign up selling Anda
                                </CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="pt-6">
                        {campaigns.length > 0 ? (
                            <div className="space-y-3">
                                {campaigns.map((campaign) => (
                                    <div
                                        key={campaign.id}
                                        className="flex items-center justify-between rounded-lg border p-4 transition-colors hover:bg-accent/50"
                                    >
                                        <div className="flex items-center gap-4 flex-1">
                                            <div className={`flex size-12 items-center justify-center rounded-lg ${
                                                campaign.is_active ? 'bg-green-500/10' : 'bg-gray-500/10'
                                            }`}>
                                                <TrendingUp className={`size-6 ${
                                                    campaign.is_active ? 'text-green-600' : 'text-gray-600'
                                                }`} />
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2">
                                                    <h3 className="font-semibold">{campaign.name}</h3>
                                                    <Badge variant={campaign.is_active ? 'default' : 'secondary'}>
                                                        {campaign.is_active ? 'Aktif' : 'Nonaktif'}
                                                    </Badge>
                                                </div>
                                                <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                                                    <span className="flex items-center gap-1">
                                                        <Target className="size-3" />
                                                        {getTriggerLabel(campaign.trigger_type)}
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <TrendingUp className="size-3" />
                                                        {campaign.discount_percentage}% diskon
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <BarChart3 className="size-3" />
                                                        {campaign.conversions} konversi
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <DollarSign className="size-3" />
                                                        {formatCurrency(campaign.revenue)}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Button variant="outline" size="sm">
                                                <Eye className="size-4 mr-1" />
                                                Detail
                                            </Button>
                                            <Link href={route('user.upselling.edit', campaign.id)}>
                                                <Button variant="outline" size="sm">
                                                    <Edit className="size-4 mr-1" />
                                                    Edit
                                                </Button>
                                            </Link>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-16">
                                <div className="rounded-full bg-muted p-6 mb-4">
                                    <TrendingUp className="size-12 text-muted-foreground" />
                                </div>
                                <p className="text-base font-medium mb-2">Belum ada campaign up selling</p>
                                <p className="text-sm text-muted-foreground mb-6 text-center max-w-md">
                                    Buat campaign up selling untuk meningkatkan penjualan dengan menawarkan produk
                                    yang relevan kepada pelanggan Anda
                                </p>
                                <Link href={route('user.upselling.create')}>
                                    <Button className="gap-2">
                                        <Plus className="size-4" />
                                        Buat Campaign Pertama
                                    </Button>
                                </Link>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Info Card */}
                <Card className="bg-blue-50 border-blue-200">
                    <CardContent className="pt-6">
                        <div className="flex gap-4">
                            <div className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-blue-500/10">
                                <TrendingUp className="size-6 text-blue-600" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-blue-900 mb-1">Cara Kerja Up Selling</h3>
                                <p className="text-sm text-blue-800">
                                    Campaign up selling akan otomatis menawarkan produk yang relevan kepada pelanggan
                                    berdasarkan trigger yang Anda tentukan. Sistem akan mengirim pesan WhatsApp dengan
                                    penawaran spesial untuk meningkatkan nilai transaksi.
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </UserLayout>
    );
}
