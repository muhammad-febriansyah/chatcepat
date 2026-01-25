import { ColumnDef } from '@tanstack/react-table'
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

interface Partner {
    id: number
    name: string
    image: string
    order: number
    is_active: boolean
    created_at: string
    updated_at: string
}

interface ColumnsProps {
    onEdit: (partner: Partner) => void
}

export const getColumns = ({ onEdit }: ColumnsProps): ColumnDef<Partner>[] => [
    {
        accessorKey: 'order',
        header: 'Urutan',
        cell: ({ row }) => <div className="font-medium">{row.getValue('order')}</div>,
    },
    {
        accessorKey: 'image',
        header: 'Logo',
        cell: ({ row }) => {
            const image = row.getValue('image') as string | null
            return (
                <div className="flex items-center">
                    {image ? (
                        <img
                            src={`/storage/${image}`}
                            alt="Partner logo"
                            className="h-12 w-auto object-contain"
                        />
                    ) : (
                        <div className="flex h-12 w-16 items-center justify-center rounded bg-muted text-xs text-muted-foreground">
                            No image
                        </div>
                    )}
                </div>
            )
        },
    },
    {
        accessorKey: 'name',
        header: 'Nama Partner',
        cell: ({ row }) => <div className="font-medium">{row.getValue('name')}</div>,
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
            const partner = row.original

            const handleDelete = () => {
                if (confirm('Apakah Anda yakin ingin menghapus partner ini?')) {
                    router.delete(`/admin/partners/${partner.id}`)
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
                        <DropdownMenuItem onClick={() => onEdit(partner)}>
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
