import { ColumnDef } from '@tanstack/react-table'
import { GuideCategory } from '@/types/guide'
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

export const columns: ColumnDef<GuideCategory>[] = [
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
        accessorKey: 'slug',
        header: 'Slug',
        cell: ({ row }) => <div className="text-muted-foreground">{row.getValue('slug')}</div>,
    },
    {
        accessorKey: 'sort_order',
        header: 'Urutan',
        cell: ({ row }) => <div>{row.getValue('sort_order')}</div>,
    },
    {
        id: 'actions',
        header: 'Aksi',
        cell: ({ row }) => {
            const category = row.original

            const handleEdit = () => {
                router.visit(`/admin/guides/categories/${category.id}/edit`)
            }

            const handleDelete = () => {
                if (confirm('Apakah Anda yakin ingin menghapus kategori ini?')) {
                    router.delete(`/admin/guides/categories/${category.id}`)
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
