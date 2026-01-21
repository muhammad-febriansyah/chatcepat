import { Head, router } from '@inertiajs/react'
import AdminLayout from '@/layouts/admin/admin-layout'
import { PageHeader } from '@/components/admin/common/page-header'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Plus } from 'lucide-react'
import { GuideArticle } from '@/types/guide'
import { DataTable } from '@/components/ui/data-table'
import { columns } from './columns'

interface GuideArticlesIndexProps {
    articles: GuideArticle[]
}

export default function GuideArticlesIndex({ articles }: GuideArticlesIndexProps) {
    const handleCreate = () => {
        router.visit('/admin/guides/articles/create')
    }

    return (
        <AdminLayout>
            <Head title="Kelola Artikel Panduan" />

            <PageHeader
                title="Artikel Panduan"
                description="Kelola artikel panduan untuk pengguna"
                action={
                    <Button onClick={handleCreate}>
                        <Plus className="h-4 w-4" />
                        Tambah Artikel
                    </Button>
                }
            />

            <Card>
                <CardContent className="pt-6">
                    <DataTable
                        columns={columns}
                        data={articles}
                        searchKey="title"
                        searchPlaceholder="Cari judul artikel..."
                    />
                </CardContent>
            </Card>
        </AdminLayout>
    )
}
