import { Head, router } from '@inertiajs/react'
import AdminLayout from '@/layouts/admin/admin-layout'
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
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
    DollarSign,
    Clock,
    CheckCircle,
    XCircle,
    AlertCircle,
    Search,
    MoreHorizontal,
    Eye,
    Receipt,
    TrendingUp,
    Users,
    CreditCard,
    Filter,
    RefreshCw,
} from 'lucide-react'
import { useState } from 'react'
import { Transaction } from './columns'
import { cn } from '@/lib/utils'

interface TransactionsIndexProps {
    transactions: {
        data: Transaction[]
        current_page: number
        last_page: number
        per_page: number
        total: number
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
    }
}

const statusConfig = {
    pending: {
        label: 'Pending',
        color: 'bg-yellow-100 text-yellow-700 border-yellow-200',
        iconColor: 'text-yellow-500',
        bgColor: 'bg-yellow-500',
        icon: Clock,
    },
    paid: {
        label: 'Lunas',
        color: 'bg-green-100 text-green-700 border-green-200',
        iconColor: 'text-green-500',
        bgColor: 'bg-green-500',
        icon: CheckCircle,
    },
    failed: {
        label: 'Gagal',
        color: 'bg-red-100 text-red-700 border-red-200',
        iconColor: 'text-red-500',
        bgColor: 'bg-red-500',
        icon: XCircle,
    },
    expired: {
        label: 'Kadaluarsa',
        color: 'bg-gray-100 text-gray-700 border-gray-200',
        iconColor: 'text-gray-500',
        bgColor: 'bg-gray-500',
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

export default function TransactionsIndex({ transactions, stats, filters }: TransactionsIndexProps) {
    const [search, setSearch] = useState(filters.search)

    const handleStatusFilter = (status: string) => {
        router.get('/admin/transactions', {
            status,
            search: filters.search
        }, {
            preserveState: true,
            preserveScroll: true,
        })
    }

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault()
        router.get('/admin/transactions', {
            status: filters.status,
            search
        }, {
            preserveState: true,
            preserveScroll: true,
        })
    }

    const handleRefresh = () => {
        router.reload()
    }

    const handleView = (id: number) => {
        router.visit(`/admin/transactions/${id}`)
    }

    const handleUpdateStatus = (id: number, status: string) => {
        router.put(`/admin/transactions/${id}/status`, { status }, {
            preserveScroll: true,
        })
    }

    return (
        <AdminLayout>
            <Head title="Kelola Transaksi" />

            {/* Header Section */}
            <div className="rounded-2xl border bg-gradient-to-r from-primary to-primary/80 p-6 md:p-8 text-primary-foreground shadow-lg mb-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="h-14 w-14 rounded-xl bg-white/20 flex items-center justify-center">
                            <Receipt className="h-7 w-7" />
                        </div>
                        <div>
                            <h1 className="text-2xl md:text-3xl font-bold">Kelola Transaksi</h1>
                            <p className="text-primary-foreground/80 mt-1">
                                {transactions.total} transaksi terdaftar
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="text-right">
                            <p className="text-sm text-primary-foreground/70">Total Revenue</p>
                            <p className="text-2xl md:text-3xl font-bold">
                                Rp {Number(stats.total_revenue || 0).toLocaleString('id-ID')}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Statistics Cards */}
            <div className="grid gap-4 grid-cols-2 lg:grid-cols-4 mb-6">
                <Card className="border-l-4 border-l-blue-500 hover:shadow-md transition-shadow">
                    <CardContent className="p-5">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground font-medium">Total Transaksi</p>
                                <p className="text-3xl font-bold mt-1">{stats.total}</p>
                            </div>
                            <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                                <CreditCard className="h-6 w-6 text-blue-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-l-4 border-l-yellow-500 hover:shadow-md transition-shadow">
                    <CardContent className="p-5">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground font-medium">Pending</p>
                                <p className="text-3xl font-bold mt-1 text-yellow-600">{stats.pending}</p>
                            </div>
                            <div className="h-12 w-12 rounded-full bg-yellow-100 flex items-center justify-center">
                                <Clock className="h-6 w-6 text-yellow-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-l-4 border-l-green-500 hover:shadow-md transition-shadow">
                    <CardContent className="p-5">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground font-medium">Lunas</p>
                                <p className="text-3xl font-bold mt-1 text-green-600">{stats.paid}</p>
                            </div>
                            <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                                <CheckCircle className="h-6 w-6 text-green-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-l-4 border-l-red-500 hover:shadow-md transition-shadow">
                    <CardContent className="p-5">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground font-medium">Gagal / Expired</p>
                                <p className="text-3xl font-bold mt-1 text-red-600">{stats.failed + stats.expired}</p>
                            </div>
                            <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
                                <XCircle className="h-6 w-6 text-red-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Filters & Search */}
            <Card className="mb-6">
                <CardContent className="p-4">
                    <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
                        {/* Status Filter Tabs */}
                        <div className="flex flex-wrap gap-2">
                            {filterTabs.map((tab) => {
                                const Icon = tab.icon
                                const isActive = filters.status === tab.value
                                const count = tab.value === 'all' ? stats.total :
                                    tab.value === 'pending' ? stats.pending :
                                    tab.value === 'paid' ? stats.paid :
                                    tab.value === 'failed' ? stats.failed :
                                    stats.expired

                                return (
                                    <Button
                                        key={tab.value}
                                        variant={isActive ? 'default' : 'outline'}
                                        size="sm"
                                        onClick={() => handleStatusFilter(tab.value)}
                                        className={cn(
                                            'gap-2',
                                            isActive && 'shadow-md'
                                        )}
                                    >
                                        <Icon className={cn('h-4 w-4', !isActive && tab.color)} />
                                        {tab.label}
                                        <Badge
                                            variant={isActive ? 'secondary' : 'outline'}
                                            className="ml-1 h-5 px-1.5 text-xs"
                                        >
                                            {count}
                                        </Badge>
                                    </Button>
                                )
                            })}
                        </div>

                        {/* Search & Refresh */}
                        <div className="flex gap-2 w-full lg:w-auto">
                            <form onSubmit={handleSearch} className="flex-1 lg:w-80">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Cari invoice atau nama..."
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        className="pl-9"
                                    />
                                </div>
                            </form>
                            <Button variant="outline" size="icon" onClick={handleRefresh}>
                                <RefreshCw className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Transactions Table */}
            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="text-lg">Daftar Transaksi</CardTitle>
                    <CardDescription>
                        Menampilkan {transactions.data.length} dari {transactions.total} transaksi
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
                                        const status = statusConfig[transaction.status]
                                        const StatusIcon = status.icon

                                        return (
                                            <TableRow
                                                key={transaction.id}
                                                className="hover:bg-muted/50 cursor-pointer"
                                                onClick={() => handleView(transaction.id)}
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
                                                <TableCell>
                                                    <p className="text-sm">
                                                        {transaction.payment_method === 'manual'
                                                            ? `Manual${transaction.bank ? ` - ${transaction.bank.nama_bank}` : ''}`
                                                            : transaction.payment_method}
                                                    </p>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge className={cn('gap-1', status.color)}>
                                                        <StatusIcon className="h-3 w-3" />
                                                        {status.label}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <p className="text-sm text-muted-foreground">
                                                        {new Date(transaction.created_at).toLocaleDateString('id-ID', {
                                                            day: 'numeric',
                                                            month: 'short',
                                                            year: 'numeric',
                                                        })}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {new Date(transaction.created_at).toLocaleTimeString('id-ID', {
                                                            hour: '2-digit',
                                                            minute: '2-digit',
                                                        })}
                                                    </p>
                                                </TableCell>
                                                <TableCell onClick={(e) => e.stopPropagation()}>
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                                                <MoreHorizontal className="h-4 w-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            <DropdownMenuLabel>Aksi</DropdownMenuLabel>
                                                            <DropdownMenuItem onClick={() => handleView(transaction.id)}>
                                                                <Eye className="mr-2 h-4 w-4" />
                                                                Lihat Detail
                                                            </DropdownMenuItem>
                                                            <DropdownMenuSeparator />
                                                            <DropdownMenuLabel>Ubah Status</DropdownMenuLabel>
                                                            {transaction.status !== 'paid' && (
                                                                <DropdownMenuItem onClick={() => handleUpdateStatus(transaction.id, 'paid')}>
                                                                    <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                                                                    Tandai Lunas
                                                                </DropdownMenuItem>
                                                            )}
                                                            {transaction.status !== 'pending' && (
                                                                <DropdownMenuItem onClick={() => handleUpdateStatus(transaction.id, 'pending')}>
                                                                    <Clock className="mr-2 h-4 w-4 text-yellow-500" />
                                                                    Tandai Pending
                                                                </DropdownMenuItem>
                                                            )}
                                                            {transaction.status !== 'failed' && (
                                                                <DropdownMenuItem onClick={() => handleUpdateStatus(transaction.id, 'failed')}>
                                                                    <XCircle className="mr-2 h-4 w-4 text-red-500" />
                                                                    Tandai Gagal
                                                                </DropdownMenuItem>
                                                            )}
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </TableCell>
                                            </TableRow>
                                        )
                                    })
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={8} className="h-32 text-center">
                                            <div className="flex flex-col items-center gap-2 text-muted-foreground">
                                                <Receipt className="h-10 w-10 opacity-50" />
                                                <p>Tidak ada transaksi ditemukan</p>
                                                {filters.status !== 'all' && (
                                                    <Button
                                                        variant="link"
                                                        size="sm"
                                                        onClick={() => handleStatusFilter('all')}
                                                    >
                                                        Lihat semua transaksi
                                                    </Button>
                                                )}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    {/* Pagination Info */}
                    {transactions.total > 0 && (
                        <div className="flex items-center justify-between mt-4 text-sm text-muted-foreground">
                            <p>
                                Menampilkan {((transactions.current_page - 1) * transactions.per_page) + 1} - {Math.min(transactions.current_page * transactions.per_page, transactions.total)} dari {transactions.total} transaksi
                            </p>
                            <p>
                                Halaman {transactions.current_page} dari {transactions.last_page}
                            </p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </AdminLayout>
    )
}
