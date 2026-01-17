import { ColumnDef } from '@tanstack/react-table'
import { BlogCategory } from '@/types/blog'
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

export const columns: ColumnDef<BlogCategory>[] = [
    {
        accessorKey: 'id',
        header: 'No',
        cell: ({ row }) => <div className="font-medium">{row.index + 1}</div>,
    },
    {
        accessorKey: 'name',
        header: 'Nama Kategori',
        cell: ({ row }) => <div className="font-medium">{row.getValue('name')}</div>,
    },
    {
        accessorKey: 'description',
        header: 'Deskripsi',
        cell: ({ row }) => (
            <div className="max-w-md truncate text-muted-foreground">
                {row.getValue('description') || '-'}
            </div>
        ),
    },
    {
        accessorKey: 'posts_count',
        header: 'Jumlah Artikel',
        cell: ({ row }) => {
            const count = row.original.posts_count || 0
            return (
                <Badge variant="secondary">
                    {count} artikel
                </Badge>
            )
        },
    },
    {
        id: 'actions',
        header: 'Aksi',
        cell: ({ row }) => {
            const category = row.original

            const handleEdit = () => {
                router.visit(`/admin/blog/categories/${category.id}/edit`)
            }

            const handleDelete = () => {
                if (confirm('Apakah Anda yakin ingin menghapus kategori ini?')) {
                    router.delete(`/admin/blog/categories/${category.id}`)
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
