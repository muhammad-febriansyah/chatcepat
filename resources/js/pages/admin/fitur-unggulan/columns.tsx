import { ColumnDef } from '@tanstack/react-table'
import { FiturUnggulan } from '@/types/fitur-unggulan'
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
import * as LucideIcons from 'lucide-react'

export const columns: ColumnDef<FiturUnggulan>[] = [
    {
        accessorKey: 'id',
        header: 'No',
        cell: ({ row }) => <div className="font-medium">{row.index + 1}</div>,
    },
    {
        accessorKey: 'icon',
        header: 'Icon',
        cell: ({ row }) => {
            const iconName = row.getValue('icon') as string
            const Icon = (LucideIcons as any)[iconName] || LucideIcons.HelpCircle
            return (
                <div className="flex items-center justify-center">
                    <Icon className="h-5 w-5 text-primary" />
                </div>
            )
        },
    },
    {
        accessorKey: 'image',
        header: 'Gambar',
        cell: ({ row }) => {
            const image = row.getValue('image') as string | null
            return (
                <div className="flex items-center justify-center">
                    {image ? (
                        <img
                            src={`/storage/${image}`}
                            alt={row.getValue('title') as string}
                            className="h-16 w-16 rounded-md object-cover"
                        />
                    ) : (
                        <div className="h-16 w-16 rounded-md bg-muted flex items-center justify-center text-xs text-muted-foreground">
                            No Image
                        </div>
                    )}
                </div>
            )
        },
    },
    {
        accessorKey: 'title',
        header: 'Judul',
        cell: ({ row }) => <div className="font-medium">{row.getValue('title')}</div>,
    },
    {
        accessorKey: 'description',
        header: 'Deskripsi',
        cell: ({ row }) => (
            <div className="max-w-md truncate text-sm text-muted-foreground">
                {row.getValue('description')}
            </div>
        ),
    },
    {
        accessorKey: 'order',
        header: 'Urutan',
        cell: ({ row }) => <div className="text-center">{row.getValue('order')}</div>,
    },
    {
        accessorKey: 'is_active',
        header: 'Status',
        cell: ({ row }) => {
            const isActive = row.getValue('is_active') as boolean
            return (
                <Badge variant={isActive ? 'default' : 'outline'}>
                    {isActive ? 'Aktif' : 'Tidak Aktif'}
                </Badge>
            )
        },
    },
    {
        id: 'actions',
        header: 'Aksi',
        cell: ({ row }) => {
            const fiturUnggulan = row.original

            const handleEdit = () => {
                router.visit(`/admin/fitur-unggulan/${fiturUnggulan.id}/edit`)
            }

            const handleDelete = () => {
                if (confirm('Apakah Anda yakin ingin menghapus fitur unggulan ini?')) {
                    router.delete(`/admin/fitur-unggulan/${fiturUnggulan.id}`)
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
                        <DropdownMenuItem onClick={handleEdit}>
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
