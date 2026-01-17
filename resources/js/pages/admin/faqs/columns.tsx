import { ColumnDef } from '@tanstack/react-table'
import { Faq } from '@/types/faq'
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

export const columns: ColumnDef<Faq>[] = [
    {
        accessorKey: 'id',
        header: 'No',
        cell: ({ row }) => <div className="font-medium">{row.index + 1}</div>,
    },
    {
        accessorKey: 'question',
        header: 'Pertanyaan',
        cell: ({ row }) => <div className="max-w-md">{row.getValue('question')}</div>,
    },
    {
        accessorKey: 'answer',
        header: 'Jawaban',
        cell: ({ row }) => (
            <div className="max-w-lg truncate text-muted-foreground">{row.getValue('answer')}</div>
        ),
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
            const faq = row.original

            const handleEdit = () => {
                router.visit(`/admin/faqs/${faq.id}/edit`)
            }

            const handleDelete = () => {
                if (confirm('Apakah Anda yakin ingin menghapus FAQ ini?')) {
                    router.delete(`/admin/faqs/${faq.id}`)
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
