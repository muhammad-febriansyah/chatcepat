import { ColumnDef } from '@tanstack/react-table'
import { PricingPackage } from '@/types/pricing-package'
import { Button } from '@/components/ui/button'
import { router } from '@inertiajs/react'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { MoreHorizontal, Pencil, Trash2, Star } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

export const columns: ColumnDef<PricingPackage>[] = [
    {
        accessorKey: 'id',
        header: 'No',
        cell: ({ row }) => <div className="font-medium">{row.index + 1}</div>,
    },
    {
        accessorKey: 'name',
        header: 'Nama Paket',
        cell: ({ row }) => (
            <div className="flex items-center gap-2">
                <span className="font-medium">{row.getValue('name')}</span>
                {row.original.is_featured && (
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                )}
            </div>
        ),
    },
    {
        accessorKey: 'formatted_price',
        header: 'Harga',
        cell: ({ row }) => (
            <div className="font-semibold text-primary">
                {row.getValue('formatted_price')}
            </div>
        ),
    },
    {
        accessorKey: 'period_text',
        header: 'Periode',
        cell: ({ row }) => (
            <div className="text-sm text-muted-foreground">
                {row.getValue('period_text')}
            </div>
        ),
    },
    {
        accessorKey: 'features',
        header: 'Fitur',
        cell: ({ row }) => {
            const features = row.getValue('features') as string[]
            return (
                <div className="text-sm text-muted-foreground">
                    {features.length} fitur
                </div>
            )
        },
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
            const pricingPackage = row.original

            const handleEdit = () => {
                router.visit(`/admin/pricing-packages/${pricingPackage.id}/edit`)
            }

            const handleDelete = () => {
                if (confirm('Apakah Anda yakin ingin menghapus paket harga ini?')) {
                    router.delete(`/admin/pricing-packages/${pricingPackage.id}`)
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
