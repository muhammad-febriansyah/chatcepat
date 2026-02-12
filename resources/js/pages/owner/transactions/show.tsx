import { Head, router } from '@inertiajs/react'
import OwnerLayout from '@/layouts/owner/owner-layout'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import {
    ArrowLeft,
    User,
    Package,
    Calendar,
    FileText,
    Clock,
    CheckCircle,
    XCircle,
    AlertCircle,
    Phone,
    MapPin,
    Building2,
    Hash,
    Receipt,
    ShieldCheck,
} from 'lucide-react'

interface Transaction {
    id: number
    invoice_number: string
    reference: string | null
    amount: string
    payment_method: string | null
    payment_code: string | null
    merchant_order_id: string | null
    va_number: string | null
    qr_string: string | null
    status: 'pending' | 'paid' | 'failed' | 'expired'
    paid_at: string | null
    expired_at: string | null
    subscription_expires_at: string | null
    proof_image: string | null
    notes: string | null
    customer_info: Record<string, any> | null
    created_at: string
    updated_at: string
    user: {
        id: number
        name: string
        email: string
        phone: string | null
        address: string | null
        nama_bisnis: string | null
        role: string
        last_login_at: string | null
        created_at: string
    } | null
    pricing_package: {
        id: number
        name: string
        slug: string
        description: string | null
        price: number
        currency: string
        period: number
        period_unit: string
        features: string[]
    } | null
    bank: {
        id: number
        nama_bank: string
    } | null
}

interface TransactionShowProps {
    transaction: Transaction
    userStats: {
        total_transactions: number
        paid_transactions: number
    }
}

const statusConfig = {
    pending: {
        label: 'Menunggu Pembayaran',
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

function formatDate(dateStr: string | null) {
    if (!dateStr) return '-'
    return new Date(dateStr).toLocaleDateString('id-ID', {
        day: 'numeric', month: 'long', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
    })
}

function InfoRow({ label, value, mono }: { label: string; value: React.ReactNode; mono?: boolean }) {
    return (
        <div className="flex items-start justify-between py-2.5 gap-4">
            <span className="text-sm text-muted-foreground shrink-0">{label}</span>
            <span className={`text-sm font-medium text-right ${mono ? 'font-mono' : ''}`}>{value ?? '-'}</span>
        </div>
    )
}

function SectionTitle({ icon: Icon, title }: { icon: React.ElementType; title: string }) {
    return (
        <div className="flex items-center gap-2 pb-3 mb-1">
            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <Icon className="h-4 w-4 text-primary" />
            </div>
            <h3 className="font-semibold text-base">{title}</h3>
        </div>
    )
}

export default function OwnerTransactionShow({ transaction, userStats }: TransactionShowProps) {
    const status = statusConfig[transaction.status] || statusConfig.pending
    const StatusIcon = status.icon

    const isSubscriptionActive = transaction.subscription_expires_at
        ? new Date(transaction.subscription_expires_at) > new Date()
        : false

    return (
        <OwnerLayout>
            <Head title={`Detail Transaksi ${transaction.invoice_number}`} />

            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-3">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.visit('/owner/transactions')}
                    >
                        <ArrowLeft className="h-4 w-4 mr-1.5" />
                        Kembali
                    </Button>
                    <div>
                        <h1 className="text-xl font-bold">Detail Transaksi</h1>
                        <p className="text-sm text-muted-foreground font-mono mt-0.5">{transaction.invoice_number}</p>
                    </div>
                </div>
                <Badge className={`gap-1.5 px-3 py-1.5 text-sm w-fit ${status.color}`}>
                    <StatusIcon className="h-4 w-4" />
                    {status.label}
                </Badge>
            </div>

            {/* Summary Banner */}
            <div className="rounded-2xl border bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 p-5">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                        <p className="text-xs text-muted-foreground mb-1">Jumlah Dibayar</p>
                        <p className="text-xl font-bold text-primary">
                            Rp {Number(transaction.amount).toLocaleString('id-ID')}
                        </p>
                    </div>
                    <div className="text-center">
                        <p className="text-xs text-muted-foreground mb-1">Metode</p>
                        <p className="text-sm font-semibold capitalize">{transaction.payment_method?.replace('_', ' ') || '-'}</p>
                    </div>
                    <div className="text-center">
                        <p className="text-xs text-muted-foreground mb-1">Paket</p>
                        <p className="text-sm font-semibold">{transaction.pricing_package?.name || '-'}</p>
                    </div>
                    <div className="text-center">
                        <p className="text-xs text-muted-foreground mb-1">Langganan</p>
                        <Badge variant="outline" className={isSubscriptionActive ? 'text-green-600 border-green-300' : 'text-muted-foreground'}>
                            {isSubscriptionActive ? 'Aktif' : 'Tidak Aktif'}
                        </Badge>
                    </div>
                </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                {/* Left Column */}
                <div className="lg:col-span-2 space-y-6">

                    {/* Transaction Detail */}
                    <Card>
                        <CardHeader className="pb-2">
                            <SectionTitle icon={Receipt} title="Detail Transaksi" />
                        </CardHeader>
                        <CardContent className="space-y-0">
                            <InfoRow label="Nomor Invoice" value={<span className="font-mono text-xs bg-muted px-2 py-0.5 rounded">{transaction.invoice_number}</span>} />
                            <Separator />
                            <InfoRow label="Merchant Order ID" value={transaction.merchant_order_id} mono />
                            <Separator />
                            <InfoRow label="Jumlah" value={
                                <span className="text-lg font-bold text-primary">
                                    Rp {Number(transaction.amount).toLocaleString('id-ID')}
                                </span>
                            } />
                            <Separator />
                            <InfoRow label="Metode Pembayaran" value={
                                <span className="capitalize">{transaction.payment_method?.replace('_', ' ') || '-'}</span>
                            } />
                            {transaction.bank && (
                                <>
                                    <Separator />
                                    <InfoRow label="Bank" value={transaction.bank.nama_bank} />
                                </>
                            )}
                            {transaction.va_number && (
                                <>
                                    <Separator />
                                    <InfoRow label="Nomor VA" value={transaction.va_number} mono />
                                </>
                            )}
                            {transaction.payment_code && (
                                <>
                                    <Separator />
                                    <InfoRow label="Kode Pembayaran" value={transaction.payment_code} mono />
                                </>
                            )}
                            {transaction.reference && (
                                <>
                                    <Separator />
                                    <InfoRow label="Referensi" value={transaction.reference} mono />
                                </>
                            )}
                            {transaction.notes && (
                                <>
                                    <Separator />
                                    <InfoRow label="Catatan" value={transaction.notes} />
                                </>
                            )}
                        </CardContent>
                    </Card>

                    {/* Package Detail */}
                    {transaction.pricing_package && (
                        <Card>
                            <CardHeader className="pb-2">
                                <SectionTitle icon={Package} title="Paket yang Dibeli" />
                            </CardHeader>
                            <CardContent className="space-y-0">
                                <InfoRow label="Nama Paket" value={
                                    <span className="font-semibold">{transaction.pricing_package.name}</span>
                                } />
                                <Separator />
                                <InfoRow label="Harga" value={
                                    `Rp ${Number(transaction.pricing_package.price).toLocaleString('id-ID')}`
                                } />
                                <Separator />
                                <InfoRow label="Durasi" value={
                                    `${transaction.pricing_package.period} ${transaction.pricing_package.period_unit === 'day' ? 'hari' : transaction.pricing_package.period_unit === 'month' ? 'bulan' : 'tahun'}`
                                } />
                                {transaction.pricing_package.description && (
                                    <>
                                        <Separator />
                                        <InfoRow label="Deskripsi" value={transaction.pricing_package.description} />
                                    </>
                                )}
                                {transaction.pricing_package.features?.length > 0 && (
                                    <>
                                        <Separator />
                                        <div className="py-3">
                                            <p className="text-sm text-muted-foreground mb-3">Fitur Termasuk</p>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                                                {transaction.pricing_package.features.map((feature, i) => (
                                                    <div key={i} className="flex items-center gap-2 text-sm">
                                                        <CheckCircle className="h-3.5 w-3.5 text-green-500 shrink-0" />
                                                        <span>{feature}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </>
                                )}
                            </CardContent>
                        </Card>
                    )}

                    {/* Proof Image */}
                    {transaction.proof_image && (
                        <Card>
                            <CardHeader className="pb-2">
                                <SectionTitle icon={FileText} title="Bukti Pembayaran" />
                            </CardHeader>
                            <CardContent>
                                <div className="flex justify-center">
                                    <img
                                        src={`/storage/${transaction.proof_image}`}
                                        alt="Bukti Pembayaran"
                                        className="max-w-sm w-full rounded-lg border shadow-sm cursor-pointer hover:opacity-90 transition-opacity"
                                        onClick={() => window.open(`/storage/${transaction.proof_image}`, '_blank')}
                                    />
                                </div>
                                <p className="text-xs text-muted-foreground text-center mt-2">
                                    Klik untuk melihat ukuran penuh
                                </p>
                            </CardContent>
                        </Card>
                    )}
                </div>

                {/* Right Column */}
                <div className="space-y-6">
                    {/* User Info */}
                    <Card>
                        <CardHeader className="pb-2">
                            <SectionTitle icon={User} title="Informasi Pengguna" />
                        </CardHeader>
                        <CardContent>
                            {transaction.user ? (
                                <div className="space-y-0">
                                    {/* Avatar */}
                                    <div className="flex items-center gap-3 pb-4">
                                        <div className="h-14 w-14 rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center text-white font-bold text-xl shrink-0">
                                            {transaction.user.name.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <p className="font-bold text-base">{transaction.user.name}</p>
                                            <p className="text-sm text-muted-foreground">{transaction.user.email}</p>
                                            <Badge variant="outline" className="mt-1 text-xs capitalize">
                                                {transaction.user.role}
                                            </Badge>
                                        </div>
                                    </div>
                                    <Separator className="mb-2" />
                                    {transaction.user.phone && (
                                        <>
                                            <InfoRow label={<span className="flex items-center gap-1.5"><Phone className="h-3.5 w-3.5" />Telepon</span> as any} value={transaction.user.phone} />
                                            <Separator />
                                        </>
                                    )}
                                    {transaction.user.nama_bisnis && (
                                        <>
                                            <InfoRow label={<span className="flex items-center gap-1.5"><Building2 className="h-3.5 w-3.5" />Bisnis</span> as any} value={transaction.user.nama_bisnis} />
                                            <Separator />
                                        </>
                                    )}
                                    {transaction.user.address && (
                                        <>
                                            <InfoRow label={<span className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" />Alamat</span> as any} value={transaction.user.address} />
                                            <Separator />
                                        </>
                                    )}
                                    <InfoRow label={<span className="flex items-center gap-1.5"><Hash className="h-3.5 w-3.5" />User ID</span> as any} value={`#${transaction.user.id}`} />
                                    <Separator />
                                    <InfoRow label="Bergabung" value={formatDate(transaction.user.created_at)} />
                                    {transaction.user.last_login_at && (
                                        <>
                                            <Separator />
                                            <InfoRow label="Login Terakhir" value={formatDate(transaction.user.last_login_at)} />
                                        </>
                                    )}
                                    {/* User transaction summary */}
                                    <Separator className="mt-2 mb-3" />
                                    <div className="grid grid-cols-2 gap-3 pt-1">
                                        <div className="rounded-lg bg-muted/50 p-3 text-center">
                                            <p className="text-xl font-bold">{userStats.total_transactions}</p>
                                            <p className="text-xs text-muted-foreground mt-0.5">Total Transaksi</p>
                                        </div>
                                        <div className="rounded-lg bg-green-50 p-3 text-center">
                                            <p className="text-xl font-bold text-green-600">{userStats.paid_transactions}</p>
                                            <p className="text-xs text-muted-foreground mt-0.5">Transaksi Lunas</p>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <p className="text-muted-foreground text-sm py-4 text-center">Data pengguna tidak ditemukan</p>
                            )}
                        </CardContent>
                    </Card>

                    {/* Timeline */}
                    <Card>
                        <CardHeader className="pb-2">
                            <SectionTitle icon={Calendar} title="Timeline" />
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <TimelineItem
                                    icon={FileText}
                                    color="blue"
                                    label="Transaksi Dibuat"
                                    date={formatDate(transaction.created_at)}
                                />
                                {transaction.paid_at && (
                                    <TimelineItem
                                        icon={CheckCircle}
                                        color="green"
                                        label="Pembayaran Diterima"
                                        date={formatDate(transaction.paid_at)}
                                    />
                                )}
                                {transaction.subscription_expires_at && (
                                    <TimelineItem
                                        icon={ShieldCheck}
                                        color={isSubscriptionActive ? 'green' : 'gray'}
                                        label={isSubscriptionActive ? 'Langganan Aktif Hingga' : 'Langganan Berakhir'}
                                        date={formatDate(transaction.subscription_expires_at)}
                                    />
                                )}
                                {transaction.expired_at && (
                                    <TimelineItem
                                        icon={XCircle}
                                        color="red"
                                        label="Transaksi Kadaluarsa"
                                        date={formatDate(transaction.expired_at)}
                                    />
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Payment Status Card */}
                    <Card className={`border-l-4 ${
                        transaction.status === 'paid' ? 'border-l-green-500' :
                        transaction.status === 'pending' ? 'border-l-yellow-500' :
                        'border-l-red-500'
                    }`}>
                        <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                                <div className={`h-10 w-10 rounded-full flex items-center justify-center shrink-0 ${
                                    transaction.status === 'paid' ? 'bg-green-100' :
                                    transaction.status === 'pending' ? 'bg-yellow-100' :
                                    'bg-red-100'
                                }`}>
                                    <StatusIcon className={`h-5 w-5 ${
                                        transaction.status === 'paid' ? 'text-green-600' :
                                        transaction.status === 'pending' ? 'text-yellow-600' :
                                        'text-red-600'
                                    }`} />
                                </div>
                                <div>
                                    <p className="font-semibold">{status.label}</p>
                                    <p className="text-xs text-muted-foreground">
                                        {transaction.status === 'paid' && 'Pembayaran telah dikonfirmasi'}
                                        {transaction.status === 'pending' && 'Menunggu konfirmasi pembayaran'}
                                        {transaction.status === 'failed' && 'Pembayaran gagal diproses'}
                                        {transaction.status === 'expired' && 'Waktu pembayaran telah habis'}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </OwnerLayout>
    )
}

function TimelineItem({
    icon: Icon,
    color,
    label,
    date,
}: {
    icon: React.ElementType
    color: 'blue' | 'green' | 'red' | 'gray'
    label: string
    date: string
}) {
    const colorMap = {
        blue: 'bg-blue-100 text-blue-600',
        green: 'bg-green-100 text-green-600',
        red: 'bg-red-100 text-red-600',
        gray: 'bg-gray-100 text-gray-600',
    }

    return (
        <div className="flex items-start gap-3">
            <div className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${colorMap[color]}`}>
                <Icon className="h-4 w-4" />
            </div>
            <div>
                <p className="text-sm font-medium">{label}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{date}</p>
            </div>
        </div>
    )
}
