import { Head, router } from '@inertiajs/react'
import AdminLayout from '@/layouts/admin/admin-layout'
import { PageHeader } from '@/components/admin/common/page-header'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Plus } from 'lucide-react'
import { BlogCategory } from '@/types/blog'
import { DataTable } from '@/components/ui/data-table'
import { columns } from './columns'

interface CategoriesIndexProps {
    categories: BlogCategory[]
}

export default function CategoriesIndex({ categories }: CategoriesIndexProps) {
    const handleCreate = () => {
        router.visit('/admin/blog/categories/create')
    }

    return (
        <AdminLayout>
            <Head title="Kategori Blog" />

            <PageHeader
                title="Kategori Blog"
                description="Kelola kategori untuk artikel blog"
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
