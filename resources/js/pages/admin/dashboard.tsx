import { Head, router, usePage } from '@inertiajs/react'
import AdminLayout from '@/layouts/admin/admin-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
    Users,
    DollarSign,
    TrendingUp,
    TrendingDown,
    ShoppingCart,
    MapPin,
    Clock,
    CheckCircle,
    XCircle,
    AlertCircle,
    ArrowUpRight,
    ArrowDownRight,
    FileText,
    Sparkles,
    Eye,
} from 'lucide-react'
import type { PageProps } from '@/types'
import { useEffect, useState, lazy, Suspense } from 'react'
import type { Props as ApexChartProps } from 'react-apexcharts'

// Lazy load ApexCharts for better performance
const ApexChart = lazy(() => import('react-apexcharts'))

// Wrapper component for ApexCharts
function Chart(props: ApexChartProps) {
    return (
        <Suspense fallback={<div className="h-[300px] flex items-center justify-center text-muted-foreground">Loading chart...</div>}>
            <ApexChart {...props} />
        </Suspense>
    )
}

interface ContentStats {
    total_faqs: number
    total_pages: number
    total_features: number
    total_active_features: number
    total_pricing_packages: number
    total_active_packages: number
    total_blog_categories: number
    total_blog_posts: number
    total_published_posts: number
    total_draft_posts: number
}

interface UserStats {
    total_users: number
    total_admins: number
    total_regular_users: number
    new_users_this_month: number
    new_users_last_month: number
}

interface TransactionStats {
    total_transactions: number
    pending_transactions: number
    paid_transactions: number
    failed_transactions: number
    expired_transactions: number
    total_revenue: string
    revenue_this_month: string
    revenue_last_month: string
}

interface ScraperStats {
    total_places: number
    places_this_month: number
}

interface MonthlyData {
    month: string
    revenue?: number
    count?: number
}

interface RecentTransaction {
    id: number
    invoice_number: string
    user_name: string
    package_name: string
    amount: string
    status: string
    created_at: string
}

interface RecentUser {
    id: number
    name: string
    email: string
    role: string
    created_at: string
}

interface WhatsAppSession {
    id: number
    name: string
    status: string
    phone_number: string | null
}

interface DashboardProps {
    contentStats: ContentStats
    userStats: UserStats
    transactionStats: TransactionStats
    scraperStats: ScraperStats
    monthlyRevenue: MonthlyData[]
    monthlyTransactions: MonthlyData[]
    monthlyUsers: MonthlyData[]
    recentTransactions: RecentTransaction[]
    recentUsers: RecentUser[]
    whatsappSessions: WhatsAppSession[]
}

const statusConfig = {
    pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-700', icon: Clock },
    paid: { label: 'Lunas', color: 'bg-green-100 text-green-700', icon: CheckCircle },
    failed: { label: 'Gagal', color: 'bg-red-100 text-red-700', icon: XCircle },
    expired: { label: 'Expired', color: 'bg-gray-100 text-gray-700', icon: AlertCircle },
}

export default function Dashboard({
    contentStats,
    userStats,
    transactionStats,
    scraperStats,
    monthlyRevenue,
    monthlyTransactions,
    monthlyUsers,
    recentTransactions,
    recentUsers,
    whatsappSessions,
}: DashboardProps) {
    const { auth } = usePage<PageProps>().props
    const [isClient, setIsClient] = useState(false)

    useEffect(() => {
        setIsClient(true)
    }, [])

    // Get current hour for greeting
    const currentHour = new Date().getHours()
    const greeting = currentHour < 12 ? 'Selamat pagi' : currentHour < 18 ? 'Selamat siang' : 'Selamat malam'

    // Calculate percentage changes
    const userGrowth = userStats.new_users_last_month > 0
        ? ((userStats.new_users_this_month - userStats.new_users_last_month) / userStats.new_users_last_month * 100).toFixed(1)
        : userStats.new_users_this_month > 0 ? '100' : '0'

    const revenueGrowth = Number(transactionStats.revenue_last_month) > 0
        ? ((Number(transactionStats.revenue_this_month) - Number(transactionStats.revenue_last_month)) / Number(transactionStats.revenue_last_month) * 100).toFixed(1)
        : Number(transactionStats.revenue_this_month) > 0 ? '100' : '0'

    // Chart configurations
    const revenueChartOptions: ApexCharts.ApexOptions = {
        chart: {
            type: 'area',
            toolbar: { show: false },
            fontFamily: 'inherit',
        },
        colors: ['#3b82f6'],
        fill: {
            type: 'gradient',
            gradient: {
                shadeIntensity: 1,
                opacityFrom: 0.4,
                opacityTo: 0.1,
                stops: [0, 100],
            },
        },
        stroke: {
            curve: 'smooth',
            width: 3,
        },
        dataLabels: { enabled: false },
        xaxis: {
            categories: monthlyRevenue.map(d => d.month),
            labels: {
                style: { colors: '#64748b', fontSize: '12px' },
            },
            axisBorder: { show: false },
            axisTicks: { show: false },
        },
        yaxis: {
            labels: {
                style: { colors: '#64748b', fontSize: '12px' },
                formatter: (value) => `Rp ${(value / 1000000).toFixed(1)}jt`,
            },
        },
        grid: {
            borderColor: '#e2e8f0',
            strokeDashArray: 4,
        },
        tooltip: {
            y: {
                formatter: (value) => `Rp ${value.toLocaleString('id-ID')}`,
            },
        },
    }

    const revenueChartSeries = [{
        name: 'Revenue',
        data: monthlyRevenue.map(d => d.revenue || 0),
    }]

    const transactionChartOptions: ApexCharts.ApexOptions = {
        chart: {
            type: 'bar',
            toolbar: { show: false },
            fontFamily: 'inherit',
        },
        colors: ['#8b5cf6'],
        plotOptions: {
            bar: {
                borderRadius: 6,
                columnWidth: '60%',
            },
        },
        dataLabels: { enabled: false },
        xaxis: {
            categories: monthlyTransactions.map(d => d.month),
            labels: {
                style: { colors: '#64748b', fontSize: '12px' },
            },
            axisBorder: { show: false },
            axisTicks: { show: false },
        },
        yaxis: {
            labels: {
                style: { colors: '#64748b', fontSize: '12px' },
            },
        },
        grid: {
            borderColor: '#e2e8f0',
            strokeDashArray: 4,
        },
    }

    const transactionChartSeries = [{
        name: 'Transaksi',
        data: monthlyTransactions.map(d => d.count || 0),
    }]

    const userChartOptions: ApexCharts.ApexOptions = {
        chart: {
            type: 'line',
            toolbar: { show: false },
            fontFamily: 'inherit',
        },
        colors: ['#10b981'],
        stroke: {
            curve: 'smooth',
            width: 3,
        },
        markers: {
            size: 5,
            colors: ['#10b981'],
            strokeColors: '#fff',
            strokeWidth: 2,
        },
        dataLabels: { enabled: false },
        xaxis: {
            categories: monthlyUsers.map(d => d.month),
            labels: {
                style: { colors: '#64748b', fontSize: '12px' },
            },
            axisBorder: { show: false },
            axisTicks: { show: false },
        },
        yaxis: {
            labels: {
                style: { colors: '#64748b', fontSize: '12px' },
            },
        },
        grid: {
            borderColor: '#e2e8f0',
            strokeDashArray: 4,
        },
    }

    const userChartSeries = [{
        name: 'Pengguna Baru',
        data: monthlyUsers.map(d => d.count || 0),
    }]

    const statusDonutOptions: ApexCharts.ApexOptions = {
        chart: {
            type: 'donut',
            fontFamily: 'inherit',
        },
        colors: ['#fbbf24', '#22c55e', '#ef4444', '#94a3b8'],
        labels: ['Pending', 'Lunas', 'Gagal', 'Expired'],
        legend: {
            position: 'bottom',
            fontSize: '13px',
        },
        plotOptions: {
            pie: {
                donut: {
                    size: '70%',
                    labels: {
                        show: true,
                        total: {
                            show: true,
                            label: 'Total',
                            fontSize: '14px',
                            fontWeight: 600,
                        },
                    },
                },
            },
        },
        dataLabels: {
            enabled: false,
        },
    }

    const statusDonutSeries = [
        transactionStats.pending_transactions,
        transactionStats.paid_transactions,
        transactionStats.failed_transactions,
        transactionStats.expired_transactions,
    ]

    return (
        <AdminLayout>
            <Head title="Dasbor Admin" />

            {/* Welcome Section */}
            <div className="rounded-2xl border bg-gradient-to-r from-blue-600 to-indigo-600 p-6 md:p-8 text-white shadow-lg">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold">
                            {greeting}, {auth.user?.name || 'Admin'}!
                        </h1>
                        <p className="mt-2 text-blue-100">
                            Selamat datang di dashboard admin ChatCepat
                        </p>
                    </div>
                    <div className="flex items-center gap-6">
                        <div className="text-right">
                            <p className="text-sm text-blue-200">Total Revenue</p>
                            <p className="text-2xl md:text-3xl font-bold">
                                Rp {Number(transactionStats.total_revenue || 0).toLocaleString('id-ID')}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Key Metrics */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mt-6">
                {/* Total Users */}
                <Card className="border-l-4 border-l-blue-500">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Total Pengguna</p>
                                <p className="text-3xl font-bold mt-1">{userStats.total_users}</p>
                                <div className="flex items-center mt-2 text-sm">
                                    {Number(userGrowth) >= 0 ? (
                                        <span className="flex items-center text-green-600">
                                            <ArrowUpRight className="h-4 w-4 mr-1" />
                                            {userGrowth}%
                                        </span>
                                    ) : (
                                        <span className="flex items-center text-red-600">
                                            <ArrowDownRight className="h-4 w-4 mr-1" />
                                            {Math.abs(Number(userGrowth))}%
                                        </span>
                                    )}
                                    <span className="text-muted-foreground ml-2">vs bulan lalu</span>
                                </div>
                            </div>
                            <div className="h-14 w-14 rounded-full bg-blue-100 flex items-center justify-center">
                                <Users className="h-7 w-7 text-blue-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Revenue This Month */}
                <Card className="border-l-4 border-l-green-500">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Revenue Bulan Ini</p>
                                <p className="text-2xl font-bold mt-1">
                                    Rp {Number(transactionStats.revenue_this_month || 0).toLocaleString('id-ID')}
                                </p>
                                <div className="flex items-center mt-2 text-sm">
                                    {Number(revenueGrowth) >= 0 ? (
                                        <span className="flex items-center text-green-600">
                                            <ArrowUpRight className="h-4 w-4 mr-1" />
                                            {revenueGrowth}%
                                        </span>
                                    ) : (
                                        <span className="flex items-center text-red-600">
                                            <ArrowDownRight className="h-4 w-4 mr-1" />
                                            {Math.abs(Number(revenueGrowth))}%
                                        </span>
                                    )}
                                    <span className="text-muted-foreground ml-2">vs bulan lalu</span>
                                </div>
                            </div>
                            <div className="h-14 w-14 rounded-full bg-green-100 flex items-center justify-center">
                                <DollarSign className="h-7 w-7 text-green-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Total Transactions */}
                <Card className="border-l-4 border-l-purple-500">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Total Transaksi</p>
                                <p className="text-3xl font-bold mt-1">{transactionStats.total_transactions}</p>
                                <div className="flex items-center gap-2 mt-2">
                                    <Badge variant="warning" className="text-xs">
                                        {transactionStats.pending_transactions} pending
                                    </Badge>
                                    <Badge variant="success" className="text-xs">
                                        {transactionStats.paid_transactions} lunas
                                    </Badge>
                                </div>
                            </div>
                            <div className="h-14 w-14 rounded-full bg-purple-100 flex items-center justify-center">
                                <ShoppingCart className="h-7 w-7 text-purple-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Scraper Data */}
                <Card className="border-l-4 border-l-orange-500">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Data Scraping</p>
                                <p className="text-3xl font-bold mt-1">{scraperStats.total_places}</p>
                                <p className="text-sm text-muted-foreground mt-2">
                                    +{scraperStats.places_this_month} bulan ini
                                </p>
                            </div>
                            <div className="h-14 w-14 rounded-full bg-orange-100 flex items-center justify-center">
                                <MapPin className="h-7 w-7 text-orange-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Charts Section */}
            <div className="grid gap-6 lg:grid-cols-2 mt-6">
                {/* Revenue Chart */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <TrendingUp className="h-5 w-5 text-blue-500" />
                            Grafik Revenue
                        </CardTitle>
                        <CardDescription>Pendapatan 6 bulan terakhir</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {isClient && (
                            <Chart
                                options={revenueChartOptions}
                                series={revenueChartSeries}
                                type="area"
                                height={300}
                            />
                        )}
                    </CardContent>
                </Card>

                {/* Transaction Chart */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <ShoppingCart className="h-5 w-5 text-purple-500" />
                            Grafik Transaksi
                        </CardTitle>
                        <CardDescription>Jumlah transaksi 6 bulan terakhir</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {isClient && (
                            <Chart
                                options={transactionChartOptions}
                                series={transactionChartSeries}
                                type="bar"
                                height={300}
                            />
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* User Chart & Transaction Status */}
            <div className="grid gap-6 lg:grid-cols-2 mt-6">
                {/* User Registration Chart */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Users className="h-5 w-5 text-green-500" />
                            Registrasi Pengguna
                        </CardTitle>
                        <CardDescription>Pengguna baru 6 bulan terakhir</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {isClient && (
                            <Chart
                                options={userChartOptions}
                                series={userChartSeries}
                                type="line"
                                height={300}
                            />
                        )}
                    </CardContent>
                </Card>

                {/* Transaction Status Donut */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <FileText className="h-5 w-5 text-yellow-500" />
                            Status Transaksi
                        </CardTitle>
                        <CardDescription>Distribusi status transaksi</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {isClient && transactionStats.total_transactions > 0 ? (
                            <Chart
                                options={statusDonutOptions}
                                series={statusDonutSeries}
                                type="donut"
                                height={300}
                            />
                        ) : (
                            <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                                Belum ada data transaksi
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Recent Data Section */}
            <div className="grid gap-6 lg:grid-cols-2 mt-6">
                {/* Recent Transactions */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle>Transaksi Terbaru</CardTitle>
                            <CardDescription>5 transaksi terakhir</CardDescription>
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => router.visit('/admin/transactions')}
                        >
                            <Eye className="h-4 w-4 mr-2" />
                            Lihat Semua
                        </Button>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {recentTransactions.length > 0 ? (
                                recentTransactions.map((transaction) => {
                                    const status = statusConfig[transaction.status as keyof typeof statusConfig]
                                    return (
                                        <div
                                            key={transaction.id}
                                            className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors cursor-pointer"
                                            onClick={() => router.visit(`/admin/transactions/${transaction.id}`)}
                                        >
                                            <div className="flex-1 min-w-0">
                                                <p className="font-medium truncate">{transaction.user_name}</p>
                                                <p className="text-sm text-muted-foreground truncate">
                                                    {transaction.invoice_number}
                                                </p>
                                            </div>
                                            <div className="text-right ml-4">
                                                <p className="font-semibold">
                                                    Rp {Number(transaction.amount).toLocaleString('id-ID')}
                                                </p>
                                                <Badge className={status.color}>
                                                    {status.label}
                                                </Badge>
                                            </div>
                                        </div>
                                    )
                                })
                            ) : (
                                <div className="text-center py-8 text-muted-foreground">
                                    Belum ada transaksi
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Recent Users */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle>Pengguna Terbaru</CardTitle>
                            <CardDescription>5 pengguna terdaftar terakhir</CardDescription>
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => router.visit('/admin/users')}
                        >
                            <Eye className="h-4 w-4 mr-2" />
                            Lihat Semua
                        </Button>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {recentUsers.length > 0 ? (
                                recentUsers.map((user) => (
                                    <div
                                        key={user.id}
                                        className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold">
                                                {user.name.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="font-medium">{user.name}</p>
                                                <p className="text-sm text-muted-foreground">{user.email}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                                                {user.role}
                                            </Badge>
                                            <p className="text-xs text-muted-foreground mt-1">
                                                {user.created_at}
                                            </p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-8 text-muted-foreground">
                                    Belum ada pengguna
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Content Stats */}
            <div className="mt-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Sparkles className="h-5 w-5 text-primary" />
                            Ringkasan Konten Website
                        </CardTitle>
                        <CardDescription>Statistik konten di website Anda</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
                            <div className="text-center p-4 rounded-lg bg-muted/50">
                                <p className="text-3xl font-bold text-primary">{contentStats.total_features}</p>
                                <p className="text-sm text-muted-foreground mt-1">Fitur</p>
                            </div>
                            <div className="text-center p-4 rounded-lg bg-muted/50">
                                <p className="text-3xl font-bold text-primary">{contentStats.total_pricing_packages}</p>
                                <p className="text-sm text-muted-foreground mt-1">Paket Harga</p>
                            </div>
                            <div className="text-center p-4 rounded-lg bg-muted/50">
                                <p className="text-3xl font-bold text-primary">{contentStats.total_faqs}</p>
                                <p className="text-sm text-muted-foreground mt-1">FAQ</p>
                            </div>
                            <div className="text-center p-4 rounded-lg bg-muted/50">
                                <p className="text-3xl font-bold text-primary">{contentStats.total_pages}</p>
                                <p className="text-sm text-muted-foreground mt-1">Halaman</p>
                            </div>
                            <div className="text-center p-4 rounded-lg bg-muted/50">
                                <p className="text-3xl font-bold text-primary">{contentStats.total_blog_posts}</p>
                                <p className="text-sm text-muted-foreground mt-1">Artikel</p>
                            </div>
                            <div className="text-center p-4 rounded-lg bg-muted/50">
                                <p className="text-3xl font-bold text-primary">{contentStats.total_blog_categories}</p>
                                <p className="text-sm text-muted-foreground mt-1">Kategori Blog</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AdminLayout>
    )
}
