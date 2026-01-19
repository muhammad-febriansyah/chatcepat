import { ColumnDef } from '@tanstack/react-table'
import { AiAssistantType } from '@/types/ai-assistant-type'
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
    onEdit: (type: AiAssistantType) => void
}

export const getColumns = ({ onEdit }: ColumnsProps): ColumnDef<AiAssistantType>[] => [
    {
        accessorKey: 'sort_order',
        header: 'Urutan',
        cell: ({ row }) => <div className="font-medium text-center">{row.getValue('sort_order')}</div>,
    },
    {
        accessorKey: 'code',
        header: 'Kode',
        cell: ({ row }) => <code className="rounded bg-muted px-2 py-1 text-sm">{row.getValue('code')}</code>,
    },
    {
        accessorKey: 'name',
        header: 'Nama',
        cell: ({ row }) => {
            const type = row.original
            return (
                <div className="flex items-center gap-2">
                    {type.icon && <span>{type.icon}</span>}
                    <span className="font-medium">{type.name}</span>
                </div>
            )
        },
    },
    {
        accessorKey: 'description',
        header: 'Deskripsi',
        cell: ({ row }) => {
            const description = row.getValue('description') as string | null
            return (
                <div className="max-w-[200px] truncate text-muted-foreground">
                    {description || '-'}
                </div>
            )
        },
    },
    {
        accessorKey: 'system_prompt',
        header: 'System Prompt',
        cell: ({ row }) => {
            const prompt = row.getValue('system_prompt') as string | null
            return (
                <div className="max-w-[200px] truncate text-muted-foreground">
                    {prompt ? (prompt.length > 50 ? `${prompt.substring(0, 50)}...` : prompt) : '-'}
                </div>
            )
        },
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
            const type = row.original

            const handleDelete = () => {
                if (confirm('Apakah Anda yakin ingin menghapus AI Assistant Type ini?')) {
                    router.delete(`/admin/ai-assistant-types/${type.id}`)
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
                        <DropdownMenuItem onClick={() => onEdit(type)}>
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
