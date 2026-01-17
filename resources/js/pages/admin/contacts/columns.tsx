import { ColumnDef } from '@tanstack/react-table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { router } from '@inertiajs/react'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { MoreHorizontal, Eye, Trash2, Mail } from 'lucide-react'
import { toast } from 'sonner'

interface Contact {
    id: number
    name: string
    email: string
    subject: string
    message: string
    is_read: boolean
    created_at: string
}

export const columns: ColumnDef<Contact>[] = [
    {
        accessorKey: 'id',
        header: 'No',
        cell: ({ row }) => <div className="font-medium">{row.index + 1}</div>,
    },
    {
        accessorKey: 'name',
        header: 'Nama',
        cell: ({ row }) => (
            <div className="flex items-center gap-2">
                <span className="font-medium">{row.getValue('name')}</span>
                {!row.original.is_read && (
                    <Badge variant="default" className="text-xs">
                        Baru
                    </Badge>
                )}
            </div>
        ),
    },
    {
        accessorKey: 'email',
        header: 'Email',
        cell: ({ row }) => (
            <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{row.getValue('email')}</span>
            </div>
        ),
    },
    {
        accessorKey: 'subject',
        header: 'Subjek',
        cell: ({ row }) => <div className="max-w-md font-medium">{row.getValue('subject')}</div>,
    },
    {
        accessorKey: 'message',
        header: 'Pesan',
        cell: ({ row }) => (
            <div className="max-w-lg truncate text-muted-foreground text-sm">
                {row.getValue('message')}
            </div>
        ),
    },
    {
        accessorKey: 'created_at',
        header: 'Tanggal',
        cell: ({ row }) => {
            const date = new Date(row.getValue('created_at'))
            return (
                <div className="text-sm">
                    {date.toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                    })}
                </div>
            )
        },
    },
    {
        id: 'actions',
        header: 'Aksi',
        cell: ({ row }) => {
            const contact = row.original

            const handleView = () => {
                router.visit(`/admin/contacts/${contact.id}`)
            }

            const handleDelete = () => {
                if (confirm('Apakah Anda yakin ingin menghapus pesan ini?')) {
                    router.delete(`/admin/contacts/${contact.id}`, {
                        onSuccess: () => {
                            toast.success('Pesan berhasil dihapus')
                        },
                        onError: () => {
                            toast.error('Gagal menghapus pesan')
                        },
                    })
                }
            }

            return (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Buka menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Aksi</DropdownMenuLabel>
                        <DropdownMenuItem onClick={handleView}>
                            <Eye className="mr-2 h-4 w-4" />
                            Lihat Detail
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={handleDelete} className="text-destructive">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Hapus
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            )
        },
    },
]
