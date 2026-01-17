import { ColumnDef } from '@tanstack/react-table'
import { Bank } from '@/types/bank'
import { Button } from '@/components/ui/button'
import { router } from '@inertiajs/react'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { MoreHorizontal, Pencil, Trash2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

interface ColumnsProps {
    onEdit: (bank: Bank) => void
}

export const getColumns = ({ onEdit }: ColumnsProps): ColumnDef<Bank>[] => [
    {
        accessorKey: 'id',
        header: 'No',
        cell: ({ row }) => <div className="font-medium">{row.index + 1}</div>,
    },
    {
        accessorKey: 'gambar',
        header: 'Logo',
        cell: ({ row }) => {
            const gambar = row.getValue('gambar') as string | null
            return (
                <div className="flex items-center">
                    {gambar ? (
                        <img
                            src={`/storage/${gambar}`}
                            alt="Bank logo"
                            className="h-10 w-auto object-contain"
                        />
                    ) : (
                        <div className="flex h-10 w-16 items-center justify-center rounded bg-muted text-xs text-muted-foreground">
                            No image
                        </div>
                    )}
                </div>
            )
        },
    },
    {
        accessorKey: 'nama_bank',
        header: 'Nama Bank',
        cell: ({ row }) => <div className="font-medium">{row.getValue('nama_bank')}</div>,
    },
    {
        accessorKey: 'atasnama',
        header: 'Atas Nama',
        cell: ({ row }) => <div>{row.getValue('atasnama')}</div>,
    },
    {
        accessorKey: 'norek',
        header: 'No. Rekening',
        cell: ({ row }) => <div className="font-mono">{row.getValue('norek')}</div>,
    },
    {
        accessorKey: 'is_active',
        header: 'Status',
        cell: ({ row }) => {
            const isActive = row.getValue('is_active') as boolean
            return (
                <Badge variant={isActive ? 'default' : 'secondary'}>
                    {isActive ? 'Aktif' : 'Nonaktif'}
                </Badge>
            )
        },
    },
    {
        id: 'actions',
        header: 'Aksi',
        cell: ({ row }) => {
            const bank = row.original

            const handleDelete = () => {
                if (confirm('Apakah Anda yakin ingin menghapus bank ini?')) {
                    router.delete(`/admin/banks/${bank.id}`)
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
                        <DropdownMenuItem onClick={() => onEdit(bank)}>
                            <Pencil className="mr-2 h-4 w-4" />
                            Edit
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
