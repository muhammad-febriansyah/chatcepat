import { Head, router } from '@inertiajs/react'
import OwnerLayout from '@/layouts/owner/owner-layout'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
    ArrowLeft,
    User,
    Phone,
    MapPin,
    Building2,
    Hash,
    Calendar,
    MessageCircle,
    Radio,
    Wifi,
    WifiOff,
    Receipt,
    CheckCircle,
    Clock,
    XCircle,
    AlertCircle,
    Mail,
    ShieldCheck,
} from 'lucide-react'

interface WhatsappSession {
    id: number
    name: string
    phone_number: string | null
    status: string
    is_active: boolean
    last_connected_at: string | null
    created_at: string
}

interface Transaction {
    id: number
    invoice_number: string
    amount: string
    status: string
    payment_method: string | null
    created_at: string
    pricing_package: { name: string } | null
}

interface UserDetail {
    id: number
    name: string
    email: string
    phone: string | null
    address: string | null
    nama_bisnis: string | null
    kategori_bisnis: string | null
    avatar: string | null
    role: string
    email_verified_at: string | null
    last_login_at: string | null
    created_at: string
    updated_at: string
    whatsapp_sessions: WhatsappSession[]
    transactions: Transaction[]
}

interface ActivityStats {
    total_messages: number
    total_broadcasts: number
    total_sessions: number
    active_sessions: number
}

interface UserShowProps {
    user: UserDetail
    activityStats: ActivityStats
}

const txStatusConfig: Record<string, { label: string; color: string; icon: React.ElementType }> = {
    pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-700', icon: Clock },
    paid: { label: 'Lunas', color: 'bg-green-100 text-green-700', icon: CheckCircle },
    failed: { label: 'Gagal', color: 'bg-red-100 text-red-700', icon: XCircle },
    expired: { label: 'Kadaluarsa', color: 'bg-gray-100 text-gray-700', icon: AlertCircle },
}

function formatDate(dateStr: string | null) {
    if (!dateStr) return '-'
    return new Date(dateStr).toLocaleDateString('id-ID', {
        day: 'numeric', month: 'long', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
    })
}

function InfoRow({ label, value }: { label: React.ReactNode; value: React.ReactNode }) {
    return (
        <div className="flex items-start justify-between py-2.5 gap-4">
            <span className="text-sm text-muted-foreground shrink-0">{label}</span>
            <span className="text-sm font-medium text-right">{value ?? '-'}</span>
        </div>
    )
}

function SectionTitle({ icon: Icon, title }: { icon: React.ElementType; title: string }) {
    return (
        <div className="flex items-center gap-2 pb-3">
            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <Icon className="h-4 w-4 text-primary" />
            </div>
            <h3 className="font-semibold text-base">{title}</h3>
        </div>
    )
}

function getInitials(name: string) {
    return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
}

export default function OwnerUserShow({ user, activityStats }: UserShowProps) {
    const isSubscriptionActive = user.transactions.some(
        t => t.status === 'paid' && /* check via latest paid */ true
    )
    const latestPaidTx = user.transactions
        .filter(t => t.status === 'paid')
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0]

    return (
        <OwnerLayout>
            <Head title={`Detail Pengguna - ${user.name}`} />

            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-3">
                    <Button variant="outline" size="sm" onClick={() => router.visit('/owner/users')}>
                        <ArrowLeft className="h-4 w-4 mr-1.5" />
                        Kembali
                    </Button>
                    <div>
                        <h1 className="text-xl font-bold">Detail Pengguna</h1>
                        <p className="text-sm text-muted-foreground mt-0.5">{user.email}</p>
                    </div>
                </div>
                <Badge variant="outline" className="capitalize w-fit">{user.role}</Badge>
            </div>

            {/* Profile Banner */}
            <div className="rounded-2xl border bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 p-6">
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
                    <Avatar className="h-20 w-20 border-4 border-background shadow-md">
                        {user.avatar && <AvatarImage src={`/storage/${user.avatar}`} alt={user.name} />}
                        <AvatarFallback className="bg-gradient-to-br from-purple-500 to-indigo-500 text-white text-2xl font-bold">
                            {getInitials(user.name)}
                        </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 text-center sm:text-left">
                        <h2 className="text-2xl font-bold">{user.name}</h2>
                        <p className="text-muted-foreground">{user.email}</p>
                        {user.nama_bisnis && (
                            <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1.5 justify-center sm:justify-start">
                                <Building2 className="h-3.5 w-3.5" />
                                {user.nama_bisnis}
                            </p>
                        )}
                        <div className="flex flex-wrap gap-2 mt-3 justify-center sm:justify-start">
                            <Badge variant="secondary">#{user.id}</Badge>
                            {user.email_verified_at ? (
                                <Badge className="bg-green-100 text-green-700 hover:bg-green-100 gap-1">
                                    <ShieldCheck className="h-3 w-3" /> Email Terverifikasi
                                </Badge>
                            ) : (
                                <Badge variant="secondary" className="gap-1 text-muted-foreground">
                                    Email Belum Verifikasi
                                </Badge>
                            )}
                            {latestPaidTx && (
                                <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 gap-1">
                                    <CheckCircle className="h-3 w-3" /> Berlangganan
                                </Badge>
                            )}
                        </div>
                    </div>
                    {/* Quick stats */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full sm:w-auto mt-2 sm:mt-0">
                        <div className="rounded-xl bg-background border p-3 text-center">
                            <p className="text-xl font-bold">{activityStats.total_sessions}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">Sesi WA</p>
                        </div>
                        <div className="rounded-xl bg-background border p-3 text-center">
                            <p className="text-xl font-bold text-green-600">{activityStats.active_sessions}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">Aktif</p>
                        </div>
                        <div className="rounded-xl bg-background border p-3 text-center">
                            <p className="text-xl font-bold">{activityStats.total_messages}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">Pesan</p>
                        </div>
                        <div className="rounded-xl bg-background border p-3 text-center">
                            <p className="text-xl font-bold">{activityStats.total_broadcasts}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">Broadcast</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                {/* Left — 2 cols */}
                <div className="lg:col-span-2 space-y-6">

                    {/* WhatsApp Sessions */}
                    <Card>
                        <CardHeader className="pb-2">
                            <SectionTitle icon={MessageCircle} title={`Sesi WhatsApp (${user.whatsapp_sessions.length})`} />
                        </CardHeader>
                        <CardContent>
                            {user.whatsapp_sessions.length > 0 ? (
                                <div className="space-y-3">
                                    {user.whatsapp_sessions.map((session) => {
                                        const isConnected = session.status === 'connected'
                                        return (
                                            <div key={session.id} className="flex items-center justify-between p-3 rounded-lg border bg-muted/30">
                                                <div className="flex items-center gap-3">
                                                    <div className={`h-9 w-9 rounded-full flex items-center justify-center shrink-0 ${isConnected ? 'bg-green-100' : 'bg-gray-100'}`}>
                                                        {isConnected
                                                            ? <Wifi className="h-4 w-4 text-green-600" />
                                                            : <WifiOff className="h-4 w-4 text-gray-500" />
                                                        }
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-medium">{session.name}</p>
                                                        <p className="text-xs text-muted-foreground">{session.phone_number || 'Belum terhubung'}</p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <Badge className={isConnected ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}>
                                                        {isConnected ? 'Terhubung' : session.status}
                                                    </Badge>
                                                    {session.last_connected_at && (
                                                        <p className="text-xs text-muted-foreground mt-1">
                                                            {new Date(session.last_connected_at).toLocaleDateString('id-ID')}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            ) : (
                                <div className="py-8 text-center text-muted-foreground text-sm">
                                    Belum ada sesi WhatsApp
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Transactions */}
                    <Card>
                        <CardHeader className="pb-2">
                            <SectionTitle icon={Receipt} title={`Riwayat Transaksi (${user.transactions.length})`} />
                        </CardHeader>
                        <CardContent>
                            {user.transactions.length > 0 ? (
                                <div className="space-y-3">
                                    {user.transactions.map((tx) => {
                                        const s = txStatusConfig[tx.status] || txStatusConfig.pending
                                        const TxIcon = s.icon
                                        return (
                                            <div
                                                key={tx.id}
                                                className="flex items-center justify-between p-3 rounded-lg border bg-muted/30 cursor-pointer hover:bg-muted/60 transition-colors"
                                                onClick={() => router.visit(`/owner/transactions/${tx.id}`)}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className={`h-9 w-9 rounded-full flex items-center justify-center shrink-0 ${s.color}`}>
                                                        <TxIcon className="h-4 w-4" />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-medium font-mono">{tx.invoice_number}</p>
                                                        <p className="text-xs text-muted-foreground">
                                                            {tx.pricing_package?.name || '-'} · {new Date(tx.created_at).toLocaleDateString('id-ID')}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-sm font-bold">Rp {Number(tx.amount).toLocaleString('id-ID')}</p>
                                                    <Badge className={`mt-1 text-xs ${s.color}`}>{s.label}</Badge>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            ) : (
                                <div className="py-8 text-center text-muted-foreground text-sm">
                                    Belum ada transaksi
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Right — 1 col */}
                <div className="space-y-6">
                    {/* Personal Info */}
                    <Card>
                        <CardHeader className="pb-2">
                            <SectionTitle icon={User} title="Informasi Pribadi" />
                        </CardHeader>
                        <CardContent className="space-y-0">
                            <InfoRow
                                label={<span className="flex items-center gap-1.5"><Mail className="h-3.5 w-3.5" />Email</span>}
                                value={user.email}
                            />
                            {user.phone && (
                                <>
                                    <Separator />
                                    <InfoRow
                                        label={<span className="flex items-center gap-1.5"><Phone className="h-3.5 w-3.5" />Telepon</span>}
                                        value={user.phone}
                                    />
                                </>
                            )}
                            {user.nama_bisnis && (
                                <>
                                    <Separator />
                                    <InfoRow
                                        label={<span className="flex items-center gap-1.5"><Building2 className="h-3.5 w-3.5" />Bisnis</span>}
                                        value={user.nama_bisnis}
                                    />
                                </>
                            )}
                            {user.address && (
                                <>
                                    <Separator />
                                    <InfoRow
                                        label={<span className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" />Alamat</span>}
                                        value={user.address}
                                    />
                                </>
                            )}
                            <Separator />
                            <InfoRow
                                label={<span className="flex items-center gap-1.5"><Hash className="h-3.5 w-3.5" />User ID</span>}
                                value={`#${user.id}`}
                            />
                            <Separator />
                            <InfoRow
                                label={<span className="flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" />Bergabung</span>}
                                value={formatDate(user.created_at)}
                            />
                            {user.last_login_at && (
                                <>
                                    <Separator />
                                    <InfoRow label="Login Terakhir" value={formatDate(user.last_login_at)} />
                                </>
                            )}
                        </CardContent>
                    </Card>

                    {/* Subscription Status */}
                    <Card className={`border-l-4 ${latestPaidTx ? 'border-l-green-500' : 'border-l-gray-300'}`}>
                        <CardHeader className="pb-2">
                            <SectionTitle icon={ShieldCheck} title="Status Langganan" />
                        </CardHeader>
                        <CardContent>
                            {latestPaidTx ? (
                                <div className="space-y-3">
                                    <div className="flex items-center gap-3 p-3 rounded-lg bg-green-50">
                                        <CheckCircle className="h-5 w-5 text-green-600 shrink-0" />
                                        <div>
                                            <p className="text-sm font-semibold text-green-700">Berlangganan Aktif</p>
                                            <p className="text-xs text-green-600">{latestPaidTx.pricing_package?.name}</p>
                                        </div>
                                    </div>
                                    <InfoRow label="Paket" value={latestPaidTx.pricing_package?.name || '-'} />
                                    <Separator />
                                    <InfoRow label="Dibayar" value={formatDate(latestPaidTx.created_at)} />
                                    <Separator />
                                    <InfoRow label="Invoice" value={
                                        <button
                                            className="font-mono text-xs text-primary hover:underline"
                                            onClick={() => router.visit(`/owner/transactions/${latestPaidTx.id}`)}
                                        >
                                            {latestPaidTx.invoice_number}
                                        </button>
                                    } />
                                </div>
                            ) : (
                                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                                    <AlertCircle className="h-5 w-5 text-muted-foreground shrink-0" />
                                    <p className="text-sm text-muted-foreground">Tidak ada langganan aktif</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Activity Summary */}
                    <Card>
                        <CardHeader className="pb-2">
                            <SectionTitle icon={Radio} title="Ringkasan Aktivitas" />
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="rounded-xl bg-blue-50 p-3 text-center">
                                    <p className="text-2xl font-bold text-blue-600">{activityStats.total_sessions}</p>
                                    <p className="text-xs text-muted-foreground mt-1">Sesi WA</p>
                                </div>
                                <div className="rounded-xl bg-green-50 p-3 text-center">
                                    <p className="text-2xl font-bold text-green-600">{activityStats.active_sessions}</p>
                                    <p className="text-xs text-muted-foreground mt-1">Sesi Aktif</p>
                                </div>
                                <div className="rounded-xl bg-purple-50 p-3 text-center">
                                    <p className="text-2xl font-bold text-purple-600">{activityStats.total_messages}</p>
                                    <p className="text-xs text-muted-foreground mt-1">Total Pesan</p>
                                </div>
                                <div className="rounded-xl bg-orange-50 p-3 text-center">
                                    <p className="text-2xl font-bold text-orange-600">{activityStats.total_broadcasts}</p>
                                    <p className="text-xs text-muted-foreground mt-1">Broadcast</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </OwnerLayout>
    )
}
