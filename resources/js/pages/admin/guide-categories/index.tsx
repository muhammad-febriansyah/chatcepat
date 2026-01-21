import { Head, router } from '@inertiajs/react'
import AdminLayout from '@/layouts/admin/admin-layout'
import { PageHeader } from '@/components/admin/common/page-header'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Plus } from 'lucide-react'
import { GuideCategory } from '@/types/guide'
import { DataTable } from '@/components/ui/data-table'
import { columns } from './columns'

interface GuideCategoriesIndexProps {
    categories: GuideCategory[]
}

export default function GuideCategoriesIndex({ categories }: GuideCategoriesIndexProps) {
    const handleCreate = () => {
        router.visit('/admin/guides/categories/create')
    }

    return (
        <AdminLayout>
            <Head title="Kelola Kategori Panduan" />

            <PageHeader
                title="Kategori Panduan"
                description="Kelola kategori untuk artikel panduan"
                action={
                    <Button onClick={handleCreate}>
                        <Plus className="h-4 w-4" />
                        Tambah Kategori
                    </Button>
                }
            />

            <Card>
                <CardContent className="pt-6">
                    <DataTable
                        columns={columns}
                        data={categories}
                        searchKey="name"
                        searchPlaceholder="Cari kategori..."
                    />
                </CardContent>
            </Card>
        </AdminLayout>
    )
}
