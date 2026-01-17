import { ColumnDef } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { router } from '@inertiajs/react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Pencil, Trash2, Phone, User } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export interface Contact {
    id: number;
    phone_number: string;
    display_name: string | null;
    session_name: string;
    is_group: boolean;
    created_at: string;
}

const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    });
};

export const columns: ColumnDef<Contact>[] = [
    {
        accessorKey: 'id',
        header: 'No',
        cell: ({ row }) => <div className="font-medium w-12">{row.index + 1}</div>,
    },
    {
        accessorKey: 'display_name',
        header: 'Nama',
        cell: ({ row }) => {
            const name = row.getValue('display_name') as string | null;
            return (
                <div className="flex items-center gap-2">
                    <div className="flex size-8 items-center justify-center rounded-full bg-primary/10">
                        <User className="size-4 text-primary" />
                    </div>
                    <span className="font-medium">{name || '-'}</span>
                </div>
            );
        },
    },
    {
        accessorKey: 'phone_number',
        header: 'Nomor Telepon',
        cell: ({ row }) => {
            const phone = row.getValue('phone_number') as string;
            return (
                <div className="flex items-center gap-2">
                    <Phone className="size-4 text-muted-foreground" />
                    <code className="text-sm bg-muted px-2 py-1 rounded font-mono">
                        {phone}
                    </code>
                </div>
            );
        },
    },
    {
        accessorKey: 'session_name',
        header: 'Session',
        cell: ({ row }) => {
            const sessionName = row.getValue('session_name') as string;
            const isGroup = row.original.is_group;
            return (
                <div className="flex items-center gap-2">
                    <span className="text-sm">{sessionName}</span>
                    {isGroup && (
                        <Badge variant="secondary" className="text-xs">
                            Group
                        </Badge>
                    )}
                </div>
            );
        },
    },
    {
        accessorKey: 'created_at',
        header: 'Ditambahkan',
        cell: ({ row }) => (
            <div className="text-sm text-muted-foreground">
                {formatDate(row.getValue('created_at'))}
            </div>
        ),
    },
    {
        id: 'actions',
        header: 'Aksi',
        cell: ({ row }) => {
            const contact = row.original;

            const handleEdit = () => {
                router.visit(`/user/contacts/${contact.id}/edit`);
            };

            const handleDelete = () => {
                if (confirm('Apakah Anda yakin ingin menghapus kontak ini?')) {
                    router.delete(`/user/contacts/${contact.id}`);
                }
            };

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
            );
        },
    },
];
