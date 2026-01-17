import { Head, router } from '@inertiajs/react'
import AdminLayout from '@/layouts/admin/admin-layout'
import { PageHeader } from '@/components/admin/common/page-header'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Plus } from 'lucide-react'
import { Feature } from '@/types/feature'
import { DataTable } from '@/components/ui/data-table'
import { columns } from './columns'

interface FeaturesIndexProps {
    features: Feature[]
}

export default function FeaturesIndex({ features }: FeaturesIndexProps) {
    const handleCreate = () => {
        router.visit('/admin/features/create')
    }

    return (
        <AdminLayout>
            <Head title="Kelola Fitur" />

            <PageHeader
                title="Kelola Fitur"
                description="Kelola fitur yang ditampilkan di halaman Tentang Kami"
                action={
                    <Button onClick={handleCreate}>
                        <Plus className="h-4 w-4" />
                        Tambah Fitur
                    </Button>
                }
            />

            <Card>
                <CardContent className="pt-6">
                    <DataTable
                        columns={columns}
                        data={features}
                        searchKey="title"
                        searchPlaceholder="Cari fitur..."
                    />
                </CardContent>
            </Card>
        </AdminLayout>
    )
}
