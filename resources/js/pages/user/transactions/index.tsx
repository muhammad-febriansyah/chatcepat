import { Head, router } from '@inertiajs/react';
import UserLayout from '@/layouts/user/user-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
    Receipt,
    Search,
    ChevronLeft,
    ChevronRight,
    CreditCard,
    CheckCircle2,
    Clock,
    XCircle,
    Eye,
    Filter,
    TrendingUp,
} from 'lucide-react';
import { useState } from 'react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

interface Transaction {
    id: number;
    invoice_number: string;
    package_name: string;
    bank_name: string;
    amount: number;
    formatted_amount: string;
    status: string;
    status_label: string;
    status_color: string;
    payment_method: string;
    va_number: string | null;
    created_at: string;
    paid_at: string | null;
    expired_at: string | null;
}

interface PaginatedTransactions {
    data: Transaction[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
}

interface TransactionHistoryProps {
    transactions: PaginatedTransactions;
    stats: {
        total_transactions: number;
        total_paid: number;
        total_pending: number;
        total_amount_paid: number;
    };
    filters: {
        status: string;
        search: string;
    };
}

export default function TransactionHistory({ transactions, stats, filters }: TransactionHistoryProps) {
    const [searchQuery, setSearchQuery] = useState(filters.search);
    const [statusFilter, setStatusFilter] = useState(filters.status);

    const handleSearch = () => {
        router.get('/user/transactions', {
            search: searchQuery,
            status: statusFilter,
        }, { preserveState: true });
    };

    const handleStatusChange = (value: string) => {
        setStatusFilter(value);
        router.get('/user/transactions', {
            search: searchQuery,
            status: value,
        }, { preserveState: true });
    };

    const handlePageChange = (page: number) => {
        router.get('/user/transactions', {
            page,
            search: searchQuery,
            status: statusFilter,
        }, { preserveState: true });
    };

    const getStatusBadge = (status: string, label: string) => {
        const variants: Record<string, string> = {
            pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
            paid: 'bg-green-100 text-green-800 border-green-200',
            failed: 'bg-red-100 text-red-800 border-red-200',
            expired: 'bg-gray-100 text-gray-800 border-gray-200',
            cancelled: 'bg-gray-100 text-gray-800 border-gray-200',
        };

        const icons: Record<string, React.ReactNode> = {
            pending: <Clock className="size-3 mr-1" />,
            paid: <CheckCircle2 className="size-3 mr-1" />,
            failed: <XCircle className="size-3 mr-1" />,
            expired: <XCircle className="size-3 mr-1" />,
            cancelled: <XCircle className="size-3 mr-1" />,
        };

        return (
            <Badge variant="outline" className={`${variants[status] || variants.cancelled} flex items-center`}>
                {icons[status]}
                {label}
            </Badge>
        );
    };

    const formatCurrency = (amount: number) => {
        return 'Rp ' + new Intl.NumberFormat('id-ID').format(amount);
    };

    return (
        <UserLayout>
            <Head title="Riwayat Transaksi" />

            <div className="space-y-6">
                {/* Header */}
                <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-blue-500/10 via-blue-500/5 to-transparent p-6 border">
                    <div className="absolute inset-0 bg-grid-white/10 [mask-image:radial-gradient(white,transparent_85%)]" />
                    <div className="relative">
                        <h1 className="text-3xl font-bold tracking-tight text-foreground">
                            Riwayat Transaksi
                        </h1>
                        <p className="text-muted-foreground mt-1">
                            Lihat semua riwayat transaksi dan pembayaran Anda
                        </p>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid gap-4 md:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Transaksi</CardTitle>
                            <Receipt className="size-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.total_transactions}</div>
                            <p className="text-xs text-muted-foreground">Semua transaksi</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Transaksi Lunas</CardTitle>
                            <CheckCircle2 className="size-4 text-green-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-600">{stats.total_paid}</div>
                            <p className="text-xs text-muted-foreground">Pembayaran berhasil</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Menunggu Bayar</CardTitle>
                            <Clock className="size-4 text-yellow-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-yellow-600">{stats.total_pending}</div>
                            <p className="text-xs text-muted-foreground">Belum dibayar</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Dibayar</CardTitle>
                            <TrendingUp className="size-4 text-blue-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-blue-600">
                                {formatCurrency(stats.total_amount_paid)}
                            </div>
                            <p className="text-xs text-muted-foreground">Akumulasi pembayaran</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Transaction List */}
                <Card>
                    <CardHeader>
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                            <div>
                                <CardTitle className="flex items-center gap-2">
                                    <Receipt className="size-5 text-primary" />
                                    Daftar Transaksi
                                </CardTitle>
                                <CardDescription>
                                    Semua riwayat transaksi pembayaran Anda
                                </CardDescription>
                            </div>
                            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Cari invoice..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                        className="pl-9 w-full sm:w-48"
                                    />
                                </div>
                                <Select value={statusFilter} onValueChange={handleStatusChange}>
                                    <SelectTrigger className="w-full sm:w-40">
                                        <Filter className="size-4 mr-2" />
                                        <SelectValue placeholder="Filter status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Semua Status</SelectItem>
                                        <SelectItem value="pending">Menunggu</SelectItem>
                                        <SelectItem value="paid">Lunas</SelectItem>
                                        <SelectItem value="failed">Gagal</SelectItem>
                                        <SelectItem value="expired">Kedaluwarsa</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {transactions.data.length > 0 ? (
                            <>
                                <div className="rounded-md border overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead className="bg-muted/50">
                                            <tr>
                                                <th className="px-4 py-3 text-left font-medium">Invoice</th>
                                                <th className="px-4 py-3 text-left font-medium">Paket</th>
                                                <th className="px-4 py-3 text-left font-medium">Metode</th>
                                                <th className="px-4 py-3 text-right font-medium">Jumlah</th>
                                                <th className="px-4 py-3 text-center font-medium">Status</th>
                                                <th className="px-4 py-3 text-left font-medium">Tanggal</th>
                                                <th className="px-4 py-3 text-center font-medium">Aksi</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {transactions.data.map((transaction, index) => (
                                                <tr
                                                    key={transaction.id}
                                                    className={index % 2 === 0 ? 'bg-white dark:bg-transparent' : 'bg-muted/20'}
                                                >
                                                    <td className="px-4 py-3">
                                                        <div className="font-medium text-primary">
                                                            {transaction.invoice_number}
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <div className="font-medium">{transaction.package_name}</div>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <div className="flex items-center gap-2">
                                                            <CreditCard className="size-4 text-muted-foreground" />
                                                            <span>{transaction.bank_name}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3 text-right font-semibold">
                                                        {transaction.formatted_amount}
                                                    </td>
                                                    <td className="px-4 py-3 text-center">
                                                        {getStatusBadge(transaction.status, transaction.status_label)}
                                                    </td>
                                                    <td className="px-4 py-3 text-muted-foreground">
                                                        {transaction.created_at}
                                                    </td>
                                                    <td className="px-4 py-3 text-center">
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => router.visit(`/user/transactions/${transaction.id}`)}
                                                        >
                                                            <Eye className="size-4" />
                                                        </Button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Pagination */}
                                {transactions.last_page > 1 && (
                                    <div className="mt-4 flex items-center justify-between">
                                        <span className="text-sm text-muted-foreground">
                                            Menampilkan {transactions.data.length} dari {transactions.total} transaksi
                                        </span>
                                        <div className="flex items-center gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handlePageChange(transactions.current_page - 1)}
                                                disabled={transactions.current_page === 1}
                                            >
                                                <ChevronLeft className="size-4" />
                                                Sebelumnya
                                            </Button>
                                            <span className="text-sm text-muted-foreground">
                                                Halaman {transactions.current_page} dari {transactions.last_page}
                                            </span>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handlePageChange(transactions.current_page + 1)}
                                                disabled={transactions.current_page === transactions.last_page}
                                            >
                                                Selanjutnya
                                                <ChevronRight className="size-4" />
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-12">
                                <Receipt className="size-12 text-muted-foreground/50 mb-4" />
                                <h3 className="text-lg font-medium text-muted-foreground">Belum Ada Transaksi</h3>
                                <p className="text-sm text-muted-foreground/70 mt-1 text-center">
                                    Anda belum memiliki riwayat transaksi
                                </p>
                                <Button
                                    onClick={() => router.visit('/user/topup')}
                                    className="mt-4"
                                    variant="outline"
                                >
                                    <CreditCard className="mr-2 size-4" />
                                    Upgrade Paket
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </UserLayout>
    );
}
