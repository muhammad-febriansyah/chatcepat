import { Head, router } from '@inertiajs/react'
import OwnerLayout from '@/layouts/owner/owner-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import {
    Clock,
    CheckCircle,
    XCircle,
    AlertCircle,
    Search,
    Receipt,
    CreditCard,
    RefreshCw,
    Eye,
    FileSpreadsheet,
    FileText,
    CalendarDays,
} from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/lib/utils'

interface Transaction {
    id: number
    invoice_number: string
    amount: string
    payment_method?: string
    status: string
    created_at: string
    user?: {
        name: string
        email: string
    }
    pricing_package?: {
        name: string
    }
}

interface TransactionsIndexProps {
    transactions: {
        data: Transaction[]
        current_page: number
        last_page: number
        per_page: number
        total: number
        from: number
        to: number
    }
    stats: {
        total: number
        pending: number
        paid: number
        failed: number
        expired: number
        total_revenue: string
    }
    filters: {
        status: string
        search: string
        dateFrom: string
        dateTo: string
    }
}

const statusConfig: Record<string, { label: string; color: string; icon: React.ElementType }> = {
    pending: {
        label: 'Pending',
        color: 'bg-yellow-100 text-yellow-700 border-yellow-200',
        icon: Clock,
    },
    paid: {
        label: 'Lunas',
        color: 'bg-green-100 text-green-700 border-green-200',
        icon: CheckCircle,
    },
    failed: {
        label: 'Gagal',
        color: 'bg-red-100 text-red-700 border-red-200',
        icon: XCircle,
    },
    expired: {
        label: 'Kadaluarsa',
        color: 'bg-gray-100 text-gray-700 border-gray-200',
        icon: AlertCircle,
    },
}

const filterTabs = [
    { value: 'all', label: 'Semua', icon: Receipt },
    { value: 'pending', label: 'Pending', icon: Clock, color: 'text-yellow-500' },
    { value: 'paid', label: 'Lunas', icon: CheckCircle, color: 'text-green-500' },
    { value: 'failed', label: 'Gagal', icon: XCircle, color: 'text-red-500' },
    { value: 'expired', label: 'Expired', icon: AlertCircle, color: 'text-gray-500' },
]

export default function OwnerTransactionsIndex({ transactions, stats, filters }: TransactionsIndexProps) {
    const [search, setSearch] = useState(filters.search || '')
    const [dateFrom, setDateFrom] = useState(filters.dateFrom || '')
    const [dateTo, setDateTo] = useState(filters.dateTo || '')

    const navigate = (params: Record<string, string | number>) => {
        router.get('/owner/transactions', {
            status: filters.status || 'all',
            search: filters.search || '',
            date_from: filters.dateFrom || '',
            date_to: filters.dateTo || '',
            ...params,
        })
    }

    const handleStatusFilter = (status: string) => {
        navigate({ status, search: search })
    }

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault()
        navigate({ search })
    }

    const handleDateFilter = (e: React.FormEvent) => {
        e.preventDefault()
        navigate({ date_from: dateFrom, date_to: dateTo })
    }

    const handleClearDates = () => {
        setDateFrom('')
        setDateTo('')
        navigate({ date_from: '', date_to: '' })
    }

    const handlePageChange = (page: number) => {
        navigate({ page })
    }

    const buildExportUrl = (format: 'excel' | 'pdf') => {
        const params = new URLSearchParams()
        if (filters.search) params.set('search', filters.search)
        if (filters.status && filters.status !== 'all') params.set('status', filters.status)
        if (filters.dateFrom) params.set('date_from', filters.dateFrom)
        if (filters.dateTo) params.set('date_to', filters.dateTo)
        const qs = params.toString()
        return `/owner/transactions/export/${format}${qs ? '?' + qs : ''}`
    }

    const hasDateFilter = filters.dateFrom || filters.dateTo

    return (
        <OwnerLayout>
            <Head title="Laporan Transaksi" />

            {/* Header */}
            <div className="rounded-2xl border bg-gradient-to-r from-primary to-primary/80 p-6 md:p-8 text-primary-foreground shadow-lg">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="h-14 w-14 rounded-xl bg-white/20 flex items-center justify-center">
                            <Receipt className="h-7 w-7" />
                        </div>
                        <div>
                            <h1 className="text-2xl md:text-3xl font-bold">Laporan Transaksi</h1>
                            <p className="text-primary-foreground/80 mt-1">
                                {transactions.total} transaksi terdaftar
                            </p>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-sm text-primary-foreground/70">Total Revenue</p>
                        <p className="text-2xl md:text-3xl font-bold">
                            Rp {Number(stats.total_revenue || 0).toLocaleString('id-ID')}
                        </p>
                    </div>
                </div>
            </div>

            {/* Stat Cards */}
            <div className="flex flex-wrap gap-3">
                <Card className="flex-1 min-w-[140px] border-l-4 border-l-blue-500 hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between gap-3">
                            <div>
                                <p className="text-xs text-muted-foreground font-medium">Total</p>
                                <p className="text-2xl font-bold mt-0.5">{stats.total}</p>
                            </div>
                            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                                <CreditCard className="h-5 w-5 text-blue-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="flex-1 min-w-[140px] border-l-4 border-l-yellow-500 hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between gap-3">
                            <div>
                                <p className="text-xs text-muted-foreground font-medium">Pending</p>
                                <p className="text-2xl font-bold mt-0.5 text-yellow-600">{stats.pending}</p>
                            </div>
                            <div className="h-10 w-10 rounded-full bg-yellow-100 flex items-center justify-center shrink-0">
                                <Clock className="h-5 w-5 text-yellow-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="flex-1 min-w-[140px] border-l-4 border-l-green-500 hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between gap-3">
                            <div>
                                <p className="text-xs text-muted-foreground font-medium">Lunas</p>
                                <p className="text-2xl font-bold mt-0.5 text-green-600">{stats.paid}</p>
                            </div>
                            <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                                <CheckCircle className="h-5 w-5 text-green-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="flex-1 min-w-[140px] border-l-4 border-l-red-500 hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between gap-3">
                            <div>
                                <p className="text-xs text-muted-foreground font-medium">Gagal / Expired</p>
                                <p className="text-2xl font-bold mt-0.5 text-red-600">{stats.failed + stats.expired}</p>
                            </div>
                            <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                                <XCircle className="h-5 w-5 text-red-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Filters & Search */}
            <Card>
                <CardContent className="p-4 space-y-3">
                    {/* Row 1: Status tabs + Export buttons */}
                    <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex flex-wrap gap-1.5">
                            {filterTabs.map((tab) => {
                                const Icon = tab.icon
                                const isActive = (filters.status || 'all') === tab.value
                                const count = tab.value === 'all' ? stats.total :
                                    tab.value === 'pending' ? stats.pending :
                                    tab.value === 'paid' ? stats.paid :
                                    tab.value === 'failed' ? stats.failed :
                                    stats.expired

                                return (
                                    <button
                                        key={tab.value}
                                        type="button"
                                        onClick={() => handleStatusFilter(tab.value)}
                                        className={cn(
                                            'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium border transition-colors',
                                            isActive
                                                ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                                                : 'bg-background text-foreground border-border hover:bg-muted'
                                        )}
                                    >
                                        <Icon className="h-3.5 w-3.5" />
                                        {tab.label}
                                        <span className={cn(
                                            'ml-0.5 rounded-full px-1.5 py-0.5 text-xs font-semibold',
                                            isActive ? 'bg-white/20 text-white' : 'bg-muted text-muted-foreground'
                                        )}>
                                            {count}
                                        </span>
                                    </button>
                                )
                            })}
                        </div>

                        <div className="flex gap-2 shrink-0">
                            <button
                                type="button"
                                onClick={() => { window.location.href = buildExportUrl('excel') }}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium border border-green-200 text-green-700 bg-background hover:bg-green-50 transition-colors"
                            >
                                <FileSpreadsheet className="h-3.5 w-3.5" />
                                Excel
                            </button>
                            <button
                                type="button"
                                onClick={() => { window.location.href = buildExportUrl('pdf') }}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium border border-red-200 text-red-700 bg-background hover:bg-red-50 transition-colors"
                            >
                                <FileText className="h-3.5 w-3.5" />
                                PDF
                            </button>
                        </div>
                    </div>

                    {/* Divider */}
                    <div className="border-t" />

                    {/* Row 2: Date filter + Search */}
                    <div className="flex flex-wrap items-end gap-3">
                        <form onSubmit={handleDateFilter} className="flex flex-wrap items-end gap-2">
                            <div className="flex flex-col gap-1">
                                <label className="text-xs text-muted-foreground font-medium flex items-center gap-1">
                                    <CalendarDays className="h-3 w-3" />
                                    Dari Tanggal
                                </label>
                                <Input
                                    type="date"
                                    value={dateFrom}
                                    onChange={(e) => setDateFrom(e.target.value)}
                                    className="h-8 w-36 text-sm"
                                />
                            </div>
                            <div className="flex flex-col gap-1">
                                <label className="text-xs text-muted-foreground font-medium">Sampai Tanggal</label>
                                <Input
                                    type="date"
                                    value={dateTo}
                                    onChange={(e) => setDateTo(e.target.value)}
                                    className="h-8 w-36 text-sm"
                                />
                            </div>
                            <Button type="submit" size="sm" variant="secondary" className="h-8">
                                Terapkan
                            </Button>
                            {hasDateFilter && (
                                <Button type="button" size="sm" variant="ghost" className="h-8 text-muted-foreground" onClick={handleClearDates}>
                                    Reset
                                </Button>
                            )}
                        </form>

                        <form onSubmit={handleSearch} className="flex gap-2 flex-1 justify-end">
                            <Input
                                placeholder="Cari invoice atau nama..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="h-8 text-sm w-full max-w-xs"
                            />
                            <Button type="submit" size="sm" className="h-8 gap-1.5 shrink-0">
                                <Search className="h-3.5 w-3.5" />
                                Cari
                            </Button>
                            <Button type="button" variant="outline" size="icon" className="h-8 w-8 shrink-0" onClick={() => router.reload()}>
                                <RefreshCw className="h-3.5 w-3.5" />
                            </Button>
                        </form>
                    </div>

                    {hasDateFilter && (
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <CalendarDays className="h-3 w-3 text-primary" />
                            Filter aktif:
                            {filters.dateFrom && <strong className="text-foreground">{filters.dateFrom}</strong>}
                            {filters.dateFrom && filters.dateTo && '–'}
                            {filters.dateTo && <strong className="text-foreground">{filters.dateTo}</strong>}
                        </p>
                    )}
                </CardContent>
            </Card>

            {/* Table */}
            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="text-lg">Daftar Transaksi</CardTitle>
                    <CardDescription>
                        Menampilkan {transactions.from ?? 0}–{transactions.to ?? 0} dari {transactions.total} transaksi
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="rounded-lg border overflow-hidden">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-muted/50">
                                    <TableHead className="font-semibold">Invoice</TableHead>
                                    <TableHead className="font-semibold">Pengguna</TableHead>
                                    <TableHead className="font-semibold">Paket</TableHead>
                                    <TableHead className="font-semibold">Jumlah</TableHead>
                                    <TableHead className="font-semibold">Metode</TableHead>
                                    <TableHead className="font-semibold">Status</TableHead>
                                    <TableHead className="font-semibold">Tanggal</TableHead>
                                    <TableHead className="w-[50px]"></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {transactions.data.length > 0 ? (
                                    transactions.data.map((transaction) => {
                                        const status = statusConfig[transaction.status] || statusConfig['pending']
                                        const StatusIcon = status.icon

                                        return (
                                            <TableRow
                                                key={transaction.id}
                                                className="hover:bg-muted/50 cursor-pointer"
                                                onClick={() => router.visit(`/owner/transactions/${transaction.id}`)}
                                            >
                                                <TableCell>
                                                    <div className="font-mono text-sm font-medium">
                                                        {transaction.invoice_number}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-3">
                                                        <div className="h-9 w-9 rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center text-white font-semibold text-sm">
                                                            {transaction.user?.name?.charAt(0).toUpperCase() || '?'}
                                                        </div>
                                                        <div>
                                                            <p className="font-medium">{transaction.user?.name}</p>
                                                            <p className="text-xs text-muted-foreground">
                                                                {transaction.user?.email}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="outline" className="font-normal">
                                                        {transaction.pricing_package?.name || '-'}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <p className="font-semibold">
                                                        Rp {Number(transaction.amount).toLocaleString('id-ID')}
                                                    </p>
                                                </TableCell>
                                                <TableCell className="text-muted-foreground text-sm capitalize">
                                                    {transaction.payment_method || '-'}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge className={cn('gap-1', status.color)}>
                                                        <StatusIcon className="h-3 w-3" />
                                                        {status.label}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-muted-foreground text-sm">
                                                    {new Date(transaction.created_at).toLocaleDateString('id-ID')}
                                                </TableCell>
                                                <TableCell onClick={(e) => e.stopPropagation()}>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 text-muted-foreground hover:text-foreground"
                                                        onClick={() => router.visit(`/owner/transactions/${transaction.id}`)}
                                                    >
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        )
                                    })
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                                            Tidak ada transaksi ditemukan
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    {/* Pagination */}
                    {transactions.last_page > 1 && (
                        <div className="flex items-center justify-between mt-4">
                            <p className="text-sm text-muted-foreground">
                                Halaman {transactions.current_page} dari {transactions.last_page}
                            </p>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={transactions.current_page === 1}
                                    onClick={() => handlePageChange(transactions.current_page - 1)}
                                >
                                    Sebelumnya
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={transactions.current_page === transactions.last_page}
                                    onClick={() => handlePageChange(transactions.current_page + 1)}
                                >
                                    Berikutnya
                                </Button>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </OwnerLayout>
    )
}
