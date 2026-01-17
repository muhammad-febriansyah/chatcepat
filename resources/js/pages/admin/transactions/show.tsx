import { Head, router } from '@inertiajs/react'
import AdminLayout from '@/layouts/admin/admin-layout'
import { PageHeader } from '@/components/admin/common/page-header'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { ArrowLeft, User, Package, CreditCard, Calendar, FileText, Image } from 'lucide-react'
import { Transaction } from './columns'
import { useState } from 'react'

interface TransactionShowProps {
    transaction: Transaction
}

const statusConfig = {
    pending: { label: 'Pending', variant: 'warning' as const },
    paid: { label: 'Lunas', variant: 'success' as const },
    failed: { label: 'Gagal', variant: 'destructive' as const },
    expired: { label: 'Kadaluarsa', variant: 'secondary' as const },
}

export default function TransactionShow({ transaction }: TransactionShowProps) {
    const [status, setStatus] = useState(transaction.status)
    const [notes, setNotes] = useState(transaction.notes || '')
    const [isUpdating, setIsUpdating] = useState(false)

    const handleBack = () => {
        router.visit('/admin/transactions')
    }

    const handleUpdateStatus = () => {
        setIsUpdating(true)
        router.put(`/admin/transactions/${transaction.id}/status`, {
            status,
            notes
        }, {
            preserveScroll: true,
            onFinish: () => setIsUpdating(false)
        })
    }

    const handleDelete = () => {
        if (confirm('Apakah Anda yakin ingin menghapus transaksi ini?')) {
            router.delete(`/admin/transactions/${transaction.id}`)
        }
    }

    return (
        <AdminLayout>
            <Head title={`Transaksi ${transaction.invoice_number}`} />

            <PageHeader
                title={`Detail Transaksi`}
                description={transaction.invoice_number}
                action={
                    <Button variant="outline" onClick={handleBack}>
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Kembali
                    </Button>
                }
            />

            <div className="grid gap-6 md:grid-cols-2">
                {/* Transaction Info */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <FileText className="h-5 w-5" />
                            Informasi Transaksi
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Invoice</span>
                            <span className="font-mono font-medium">{transaction.invoice_number}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Status</span>
                            <Badge variant={statusConfig[transaction.status].variant}>
                                {statusConfig[transaction.status].label}
                            </Badge>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Jumlah</span>
                            <span className="font-bold text-lg">
                                Rp {Number(transaction.amount).toLocaleString('id-ID')}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Metode Pembayaran</span>
                            <span>{transaction.payment_method}</span>
                        </div>
                        {transaction.bank && (
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Bank</span>
                                <span>{transaction.bank.nama_bank}</span>
                            </div>
                        )}
                        {transaction.va_number && (
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">VA Number</span>
                                <span className="font-mono">{transaction.va_number}</span>
                            </div>
                        )}
                        {transaction.reference && (
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Reference</span>
                                <span className="font-mono text-sm">{transaction.reference}</span>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* User Info */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <User className="h-5 w-5" />
                            Informasi Pengguna
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Nama</span>
                            <span className="font-medium">{transaction.user?.name}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Email</span>
                            <span>{transaction.user?.email}</span>
                        </div>
                    </CardContent>
                </Card>

                {/* Package Info */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Package className="h-5 w-5" />
                            Paket yang Dibeli
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Nama Paket</span>
                            <span className="font-medium">{transaction.pricing_package?.name || '-'}</span>
                        </div>
                    </CardContent>
                </Card>

                {/* Dates */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Calendar className="h-5 w-5" />
                            Waktu
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Dibuat</span>
                            <span>
                                {new Date(transaction.created_at).toLocaleDateString('id-ID', {
                                    day: 'numeric',
                                    month: 'long',
                                    year: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                })}
                            </span>
                        </div>
                        {transaction.paid_at && (
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Dibayar</span>
                                <span>
                                    {new Date(transaction.paid_at).toLocaleDateString('id-ID', {
                                        day: 'numeric',
                                        month: 'long',
                                        year: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit',
                                    })}
                                </span>
                            </div>
                        )}
                        {transaction.expired_at && (
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Kadaluarsa</span>
                                <span>
                                    {new Date(transaction.expired_at).toLocaleDateString('id-ID', {
                                        day: 'numeric',
                                        month: 'long',
                                        year: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit',
                                    })}
                                </span>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Proof Image */}
                {transaction.proof_image && (
                    <Card className="md:col-span-2">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Image className="h-5 w-5" />
                                Bukti Pembayaran
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex justify-center">
                                <img
                                    src={`/storage/${transaction.proof_image}`}
                                    alt="Bukti Pembayaran"
                                    className="max-w-md rounded-lg border shadow-sm"
                                />
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Update Status */}
                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <CreditCard className="h-5 w-5" />
                            Update Status
                        </CardTitle>
                        <CardDescription>
                            Ubah status transaksi dan tambahkan catatan jika diperlukan
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label>Status</Label>
                                <Select value={status} onValueChange={(value: any) => setStatus(value)}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="pending">Pending</SelectItem>
                                        <SelectItem value="paid">Lunas</SelectItem>
                                        <SelectItem value="failed">Gagal</SelectItem>
                                        <SelectItem value="expired">Kadaluarsa</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Catatan</Label>
                                <Textarea
                                    placeholder="Tambahkan catatan..."
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <Button onClick={handleUpdateStatus} disabled={isUpdating}>
                                {isUpdating ? 'Menyimpan...' : 'Simpan Perubahan'}
                            </Button>
                            <Button variant="destructive" onClick={handleDelete}>
                                Hapus Transaksi
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AdminLayout>
    )
}
