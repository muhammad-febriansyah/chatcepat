import { ColumnDef } from '@tanstack/react-table'
import { Post } from '@/types/blog'
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

export const columns: ColumnDef<Post>[] = [
    {
        accessorKey: 'id',
        header: 'No',
        cell: ({ row }) => <div className="font-medium">{row.index + 1}</div>,
    },
    {
        accessorKey: 'featured_image',
        header: 'Gambar',
        cell: ({ row }) => {
            const image = row.original.featured_image
            return image ? (
                <img
                    src={`/storage/${image}`}
                    alt={row.original.title}
                    className="h-12 w-20 rounded object-cover"
                />
            ) : (
                <div className="flex h-12 w-20 items-center justify-center rounded bg-muted text-xs text-muted-foreground">
                    No image
                </div>
            )
        },
    },
    {
        accessorKey: 'title',
        header: 'Judul',
        cell: ({ row }) => <div className="max-w-md font-medium">{row.getValue('title')}</div>,
    },
    {
        accessorKey: 'category',
        header: 'Kategori',
        cell: ({ row }) => {
            const category = row.original.category
            return <Badge variant="secondary">{category?.name || '-'}</Badge>
        },
    },
    {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => {
            const status = row.getValue('status') as string
            return (
                <Badge variant={status === 'published' ? 'default' : 'outline'}>
                    {status === 'published' ? 'Published' : 'Draft'}
                </Badge>
            )
        },
    },
    {
        accessorKey: 'author',
        header: 'Penulis',
        cell: ({ row }) => {
            const author = row.original.author
            return <div className="text-sm text-muted-foreground">{author?.name || '-'}</div>
        },
    },
    {
        accessorKey: 'created_at',
        header: 'Dibuat',
        cell: ({ row }) => {
            const date = new Date(row.getValue('created_at'))
            return <div className="text-sm">{date.toLocaleDateString('id-ID')}</div>
        },
    },
    {
        id: 'actions',
        header: 'Aksi',
        cell: ({ row }) => {
            const post = row.original

            const handleEdit = () => {
                router.visit(`/admin/blog/posts/${post.id}/edit`)
            }

            const handleDelete = () => {
                if (confirm('Apakah Anda yakin ingin menghapus artikel ini?')) {
                    router.delete(`/admin/blog/posts/${post.id}`)
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
