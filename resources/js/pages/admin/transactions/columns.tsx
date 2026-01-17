import { ColumnDef } from '@tanstack/react-table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { MoreHorizontal, Eye, CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react'
import { router } from '@inertiajs/react'

export interface Transaction {
    id: number
    user_id: number
    pricing_package_id: number
    bank_id: number | null
    invoice_number: string
    reference: string | null
    amount: string
    payment_method: string
    payment_code: string | null
    status: 'pending' | 'paid' | 'failed' | 'expired'
    paid_at: string | null
    expired_at: string | null
    proof_image: string | null
    notes: string | null
    created_at: string
    user: {
        id: number
        name: string
        email: string
    }
    pricing_package: {
        id: number
        name: string
    } | null
    bank: {
        id: number
        nama_bank: string
    } | null
}

const statusConfig = {
    pending: {
        label: 'Pending',
        variant: 'warning' as const,
        icon: Clock,
    },
    paid: {
        label: 'Lunas',
        variant: 'success' as const,
        icon: CheckCircle,
    },
    failed: {
        label: 'Gagal',
        variant: 'destructive' as const,
        icon: XCircle,
    },
    expired: {
        label: 'Kadaluarsa',
        variant: 'secondary' as const,
        icon: AlertCircle,
    },
}

export const columns: ColumnDef<Transaction>[] = [
    {
        accessorKey: 'invoice_number',
        header: 'Invoice',
        cell: ({ row }) => (
            <div className="font-mono text-sm">{row.original.invoice_number}</div>
        ),
    },
    {
        accessorKey: 'user.name',
        header: 'Pengguna',
        cell: ({ row }) => (
            <div>
                <div className="font-medium">{row.original.user?.name}</div>
                <div className="text-sm text-muted-foreground">{row.original.user?.email}</div>
            </div>
        ),
    },
    {
        accessorKey: 'pricing_package.name',
        header: 'Paket',
        cell: ({ row }) => (
            <div>{row.original.pricing_package?.name || '-'}</div>
        ),
    },
    {
        accessorKey: 'amount',
        header: 'Jumlah',
        cell: ({ row }) => (
            <div className="font-medium">
                Rp {Number(row.original.amount).toLocaleString('id-ID')}
            </div>
        ),
    },
    {
        accessorKey: 'payment_method',
        header: 'Metode',
        cell: ({ row }) => (
            <div className="text-sm">
                {row.original.payment_method === 'manual'
                    ? `Manual - ${row.original.bank?.nama_bank || 'Bank'}`
                    : row.original.payment_method}
            </div>
        ),
    },
    {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => {
            const status = row.original.status
            const config = statusConfig[status]
            const Icon = config.icon

            return (
                <Badge variant={config.variant} className="gap-1">
                    <Icon className="h-3 w-3" />
                    {config.label}
                </Badge>
            )
        },
    },
    {
        accessorKey: 'created_at',
        header: 'Tanggal',
        cell: ({ row }) => (
            <div className="text-sm text-muted-foreground">
                {new Date(row.original.created_at).toLocaleDateString('id-ID', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                })}
            </div>
        ),
    },
    {
        id: 'actions',
        header: '',
        cell: ({ row }) => {
            const transaction = row.original

            const handleView = () => {
                router.visit(`/admin/transactions/${transaction.id}`)
            }

            const handleUpdateStatus = (status: string) => {
                router.put(`/admin/transactions/${transaction.id}/status`, { status }, {
                    preserveScroll: true,
                })
            }

            return (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Aksi</DropdownMenuLabel>
                        <DropdownMenuItem onClick={handleView}>
                            <Eye className="mr-2 h-4 w-4" />
                            Lihat Detail
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuLabel>Ubah Status</DropdownMenuLabel>
                        {transaction.status !== 'paid' && (
                            <DropdownMenuItem onClick={() => handleUpdateStatus('paid')}>
                                <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                                Tandai Lunas
                            </DropdownMenuItem>
                        )}
                        {transaction.status !== 'pending' && (
                            <DropdownMenuItem onClick={() => handleUpdateStatus('pending')}>
                                <Clock className="mr-2 h-4 w-4 text-yellow-500" />
                                Tandai Pending
                            </DropdownMenuItem>
                        )}
                        {transaction.status !== 'failed' && (
                            <DropdownMenuItem onClick={() => handleUpdateStatus('failed')}>
                                <XCircle className="mr-2 h-4 w-4 text-red-500" />
                                Tandai Gagal
                            </DropdownMenuItem>
                        )}
                        {transaction.status !== 'expired' && (
                            <DropdownMenuItem onClick={() => handleUpdateStatus('expired')}>
                                <AlertCircle className="mr-2 h-4 w-4 text-gray-500" />
                                Tandai Kadaluarsa
                            </DropdownMenuItem>
                        )}
                    </DropdownMenuContent>
                </DropdownMenu>
            )
        },
    },
]
