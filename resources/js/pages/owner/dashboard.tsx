import { Head, usePage } from '@inertiajs/react'
import OwnerLayout from '@/layouts/owner/owner-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
    Users,
    DollarSign,
    MessageCircle,
    Radio,
    MapPin,
    CheckCircle,
    TrendingUp,
} from 'lucide-react'
import type { SharedData } from '@/types'
import { useEffect, useState, lazy, Suspense } from 'react'
import type { Props as ApexChartProps } from 'react-apexcharts'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'

const ApexChart = lazy(() => import('react-apexcharts'))

function Chart(props: ApexChartProps) {
    return (
        <Suspense fallback={<div className="h-[300px] flex items-center justify-center text-muted-foreground">Loading chart...</div>}>
            <ApexChart {...props} />
        </Suspense>
    )
}

interface OwnerStats {
    users: {
        total: number
        active: number
        new: number
    }
    whatsapp: {
        total_sessions: number
        active_sessions: number
        total_messages: number
        messages_this_month: number
    }
    broadcasts: {
        total: number
        completed: number
        scheduled: number
    }
    scraping: {
        total_places: number
        total_contacts: number
        total_groups: number
    }
    revenue: {
        monthly: number
        yearly: number
    }
}

interface TopUser {
    id: number
    name: string
    email: string
    sessions_count: number
    contacts_count: number
    broadcasts_count: number
}

interface RecentUser {
    id: number
    name: string
    email: string
    created_at: string
}

interface RecentBroadcast {
    id: number
    name: string
    status: string
    created_at: string
    session?: { name: string }
}

interface DashboardProps {
    stats: OwnerStats
    charts: {
        user_growth: Record<string, number>
        messages: Record<string, number>
    }
    topUsers: TopUser[]
    recentUsers: RecentUser[]
    recentBroadcasts: RecentBroadcast[]
}

export default function OwnerDashboard({ stats, charts, topUsers, recentUsers, recentBroadcasts }: DashboardProps) {
    const { auth } = usePage<SharedData>().props
    const [isClient, setIsClient] = useState(false)

    useEffect(() => {
        setIsClient(true)
    }, [])

    const currentHour = new Date().getHours()
    const greeting = currentHour < 12 ? 'Selamat pagi' : currentHour < 18 ? 'Selamat siang' : 'Selamat malam'

    // Prepare chart data
    const userGrowthLabels = Object.keys(charts.user_growth)
    const userGrowthData = Object.values(charts.user_growth)

    const messagesLabels = Object.keys(charts.messages)
    const messagesData = Object.values(charts.messages)

    const userGrowthOptions: ApexCharts.ApexOptions = {
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
        stroke: { curve: 'smooth', width: 3 },
        dataLabels: { enabled: false },
        xaxis: {
            categories: userGrowthLabels,
            labels: { style: { colors: '#64748b', fontSize: '12px' } },
            axisBorder: { show: false },
            axisTicks: { show: false },
        },
        yaxis: {
            labels: { style: { colors: '#64748b', fontSize: '12px' } },
        },
        grid: { borderColor: '#e2e8f0', strokeDashArray: 4 },
        tooltip: { y: { formatter: (v) => `${v} pengguna` } },
    }

    const messagesOptions: ApexCharts.ApexOptions = {
        chart: {
            type: 'bar',
            toolbar: { show: false },
            fontFamily: 'inherit',
        },
        colors: ['#8b5cf6'],
        plotOptions: {
            bar: { borderRadius: 6, columnWidth: '60%' },
        },
        dataLabels: { enabled: false },
        xaxis: {
            categories: messagesLabels,
            labels: { style: { colors: '#64748b', fontSize: '12px' } },
            axisBorder: { show: false },
            axisTicks: { show: false },
        },
        yaxis: {
            labels: { style: { colors: '#64748b', fontSize: '12px' } },
        },
        grid: { borderColor: '#e2e8f0', strokeDashArray: 4 },
    }

    return (
        <OwnerLayout>
            <Head title="Owner Dashboard" />

            {/* Welcome Banner */}
            <div className="rounded-2xl border bg-gradient-to-r from-primary to-primary/80 p-6 md:p-8 text-primary-foreground shadow-lg">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold">
                            {greeting}, {auth.user.name}! 👋
                        </h1>
                        <p className="text-primary-foreground/80 mt-1">
                            Selamat datang di Owner Dashboard. Pantau performa platform Anda.
                        </p>
                    </div>
                    <div className="text-right">
                        <p className="text-sm text-primary-foreground/70">Revenue Bulan Ini</p>
                        <p className="text-3xl font-bold">
                            Rp {stats.revenue.monthly.toLocaleString('id-ID')}
                        </p>
                    </div>
                </div>
            </div>

            {/* Stat Cards */}
            <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
                <Card className="border-l-4 border-l-blue-500 hover:shadow-md transition-shadow">
                    <CardContent className="p-5">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground font-medium">Total Pengguna</p>
                                <p className="text-3xl font-bold mt-1">{stats.users.total}</p>
                                <p className="text-xs text-muted-foreground mt-1">+{stats.users.new} baru (30 hari)</p>
                            </div>
                            <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                                <Users className="h-6 w-6 text-blue-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-l-4 border-l-green-500 hover:shadow-md transition-shadow">
                    <CardContent className="p-5">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground font-medium">Revenue Bulan Ini</p>
                                <p className="text-2xl font-bold mt-1">
                                    Rp {(stats.revenue.monthly / 1000000).toFixed(1)}jt
                                </p>
                                <p className="text-xs text-muted-foreground mt-1">
                                    Tahun ini: Rp {(stats.revenue.yearly / 1000000).toFixed(1)}jt
                                </p>
                            </div>
                            <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                                <DollarSign className="h-6 w-6 text-green-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-l-4 border-l-purple-500 hover:shadow-md transition-shadow">
                    <CardContent className="p-5">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground font-medium">WA Sessions Aktif</p>
                                <p className="text-3xl font-bold mt-1">{stats.whatsapp.active_sessions}</p>
                                <p className="text-xs text-muted-foreground mt-1">dari {stats.whatsapp.total_sessions} total</p>
                            </div>
                            <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center">
                                <MessageCircle className="h-6 w-6 text-purple-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-l-4 border-l-orange-500 hover:shadow-md transition-shadow">
                    <CardContent className="p-5">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground font-medium">Total Pesan</p>
                                <p className="text-3xl font-bold mt-1">{stats.whatsapp.total_messages.toLocaleString()}</p>
                                <p className="text-xs text-muted-foreground mt-1">+{stats.whatsapp.messages_this_month.toLocaleString()} bulan ini</p>
                            </div>
                            <div className="h-12 w-12 rounded-full bg-orange-100 flex items-center justify-center">
                                <TrendingUp className="h-6 w-6 text-orange-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Charts */}
            <div className="grid gap-6 lg:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Pertumbuhan Pengguna</CardTitle>
                        <CardDescription>12 bulan terakhir</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {isClient && (
                            <Chart
                                type="area"
                                options={userGrowthOptions}
                                series={[{ name: 'Pengguna Baru', data: userGrowthData }]}
                                height={300}
                            />
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Pesan WhatsApp</CardTitle>
                        <CardDescription>7 hari terakhir</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {isClient && (
                            <Chart
                                type="bar"
                                options={messagesOptions}
                                series={[{ name: 'Pesan', data: messagesData }]}
                                height={300}
                            />
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Tables */}
            <div className="grid gap-6 lg:grid-cols-2">
                {/* Recent Users */}
                <Card>
                    <CardHeader>
                        <CardTitle>Pengguna Terbaru</CardTitle>
                        <CardDescription>10 pengguna yang baru bergabung</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Nama</TableHead>
                                    <TableHead>Email</TableHead>
                                    <TableHead>Bergabung</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {recentUsers.slice(0, 5).map((user) => (
                                    <TableRow key={user.id}>
                                        <TableCell className="font-medium">{user.name}</TableCell>
                                        <TableCell className="text-muted-foreground text-sm">{user.email}</TableCell>
                                        <TableCell className="text-muted-foreground text-sm">
                                            {new Date(user.created_at).toLocaleDateString('id-ID')}
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {recentUsers.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={3} className="text-center text-muted-foreground py-6">
                                            Belum ada pengguna
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                {/* Top Users */}
                <Card>
                    <CardHeader>
                        <CardTitle>Pengguna Paling Aktif</CardTitle>
                        <CardDescription>Berdasarkan jumlah sesi WhatsApp</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Nama</TableHead>
                                    <TableHead className="text-right">Sesi</TableHead>
                                    <TableHead className="text-right">Broadcast</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {topUsers.slice(0, 5).map((user) => (
                                    <TableRow key={user.id}>
                                        <TableCell>
                                            <div>
                                                <p className="font-medium">{user.name}</p>
                                                <p className="text-xs text-muted-foreground">{user.email}</p>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right">{user.sessions_count}</TableCell>
                                        <TableCell className="text-right">{user.broadcasts_count}</TableCell>
                                    </TableRow>
                                ))}
                                {topUsers.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={3} className="text-center text-muted-foreground py-6">
                                            Belum ada data
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>

            {/* Quick Stats */}
            <div className="grid gap-4 grid-cols-2 md:grid-cols-3">
                <Card>
                    <CardContent className="p-5">
                        <div className="flex items-center gap-4">
                            <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                                <Radio className="h-5 w-5 text-indigo-600" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Total Broadcast</p>
                                <p className="text-2xl font-bold">{stats.broadcasts.total}</p>
                                <p className="text-xs text-muted-foreground">{stats.broadcasts.completed} selesai</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-5">
                        <div className="flex items-center gap-4">
                            <div className="h-10 w-10 rounded-full bg-pink-100 flex items-center justify-center">
                                <MapPin className="h-5 w-5 text-pink-600" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Tempat di-scrape</p>
                                <p className="text-2xl font-bold">{stats.scraping.total_places.toLocaleString()}</p>
                                <p className="text-xs text-muted-foreground">{stats.scraping.total_contacts.toLocaleString()} kontak</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-5">
                        <div className="flex items-center gap-4">
                            <div className="h-10 w-10 rounded-full bg-teal-100 flex items-center justify-center">
                                <CheckCircle className="h-5 w-5 text-teal-600" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Pengguna Aktif</p>
                                <p className="text-2xl font-bold">{stats.users.active}</p>
                                <p className="text-xs text-muted-foreground">7 hari terakhir</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </OwnerLayout>
    )
}
