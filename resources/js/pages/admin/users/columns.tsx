import { ColumnDef } from '@tanstack/react-table'
import { User } from '@/types'
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

export const columns: ColumnDef<User>[] = [
    {
        accessorKey: 'id',
        header: 'No',
        cell: ({ row }) => <div className="font-medium">{row.index + 1}</div>,
    },
    {
        accessorKey: 'name',
        header: 'Pengguna',
        cell: ({ row }) => {
            const user = row.original
            const avatar = user.avatar

            // Show initials if no avatar
            const initials = user.name
                .split(' ')
                .map(n => n[0])
                .join('')
                .toUpperCase()
                .slice(0, 2)

            return (
                <div className="flex items-center gap-3">
                    {avatar ? (
                        <img
                            src={`/storage/${avatar}`}
                            alt={user.name}
                            className="h-10 w-10 rounded-full object-cover border-2 border-border"
                        />
                    ) : (
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 border-2 border-border shrink-0">
                            <span className="text-sm font-medium text-primary">{initials}</span>
                        </div>
                    )}
                    <div>
                        <div className="font-medium">{user.name}</div>
                        <div className="text-xs text-muted-foreground">{user.email}</div>
                    </div>
                </div>
            )
        },
    },
    {
        accessorKey: 'phone',
        header: 'Telepon',
        cell: ({ row }) => {
            const phone = row.getValue('phone') as string | null
            return <div className="text-sm text-muted-foreground">{phone || '-'}</div>
        },
    },
    {
        accessorKey: 'role',
        header: 'Role',
        cell: ({ row }) => {
            const role = row.getValue('role') as string
            return (
                <Badge variant={role === 'admin' ? 'default' : 'secondary'}>
                    {role === 'admin' ? 'Admin' : 'User'}
                </Badge>
            )
        },
    },
    {
        accessorKey: 'created_at',
        header: 'Terdaftar',
        cell: ({ row }) => {
            const date = new Date(row.getValue('created_at'))
            return <div className="text-sm text-muted-foreground">{date.toLocaleDateString('id-ID')}</div>
        },
    },
    {
        id: 'actions',
        header: 'Aksi',
        cell: ({ row }) => {
            const user = row.original

            const handleEdit = () => {
                router.visit(`/admin/users/${user.id}/edit`)
            }

            const handleDelete = () => {
                if (confirm('Apakah Anda yakin ingin menghapus pengguna ini?')) {
                    router.delete(`/admin/users/${user.id}`)
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
