import { ColumnDef } from '@tanstack/react-table'
import { GuideArticle } from '@/types/guide'
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

export const columns: ColumnDef<GuideArticle>[] = [
    {
        accessorKey: 'id',
        header: 'No',
        cell: ({ row }) => <div className="font-medium">{row.index + 1}</div>,
    },
    {
        accessorKey: 'title',
        header: 'Judul Artikel',
        cell: ({ row }) => <div className="font-medium max-w-xs truncate">{row.getValue('title')}</div>,
    },
    {
        accessorKey: 'platform',
        header: 'Platform',
        cell: ({ row }) => (
            <Badge variant="secondary" className="font-normal capitalize">
                {row.getValue('platform') || 'Generic'}
            </Badge>
        ),
    },
    {
        accessorKey: 'category.name',
        header: 'Kategori',
        cell: ({ row }) => (
            <Badge variant="outline" className="font-normal">
                {row.original.category?.name || '-'}
            </Badge>
        ),
    },
    {
        accessorKey: 'is_published',
        header: 'Status',
        cell: ({ row }) => {
            const isPublished = row.getValue('is_published')
            return (
                <Badge variant={isPublished ? 'default' : 'secondary'}>
                    {isPublished ? 'Published' : 'Draft'}
                </Badge>
            )
        },
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
            const article = row.original

            const handleEdit = () => {
                router.visit(`/admin/guides/articles/${article.id}/edit`)
            }

            const handleDelete = () => {
                if (confirm('Apakah Anda yakin ingin menghapus artikel ini?')) {
                    router.delete(`/admin/guides/articles/${article.id}`)
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
