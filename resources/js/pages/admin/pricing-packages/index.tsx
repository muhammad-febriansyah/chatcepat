import { Head, router } from '@inertiajs/react'
import AdminLayout from '@/layouts/admin/admin-layout'
import { PageHeader } from '@/components/admin/common/page-header'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Plus } from 'lucide-react'
import { PricingPackage } from '@/types/pricing-package'
import { DataTable } from '@/components/ui/data-table'
import { columns } from './columns'

interface PricingPackagesIndexProps {
    packages: PricingPackage[]
}

export default function PricingPackagesIndex({ packages }: PricingPackagesIndexProps) {
    const handleCreate = () => {
        router.visit('/admin/pricing-packages/create')
    }

    return (
        <AdminLayout>
            <Head title="Kelola Paket Harga" />

            <PageHeader
                title="Kelola Paket Harga"
                description="Kelola paket harga yang ditampilkan di halaman landing"
                action={
                    <Button onClick={handleCreate}>
                        <Plus className="h-4 w-4" />
                        Tambah Paket
                    </Button>
                }
            />

            <Card>
                <CardContent className="pt-6">
                    <DataTable
                        columns={columns}
                        data={packages}
                        searchKey="name"
                        searchPlaceholder="Cari paket..."
                    />
                </CardContent>
            </Card>
        </AdminLayout>
    )
}
