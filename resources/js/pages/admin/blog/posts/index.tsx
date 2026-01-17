import { Head, router } from '@inertiajs/react'
import AdminLayout from '@/layouts/admin/admin-layout'
import { PageHeader } from '@/components/admin/common/page-header'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Plus } from 'lucide-react'
import { Post } from '@/types/blog'
import { DataTable } from '@/components/ui/data-table'
import { columns } from './columns'

interface PostsIndexProps {
    posts: Post[]
}

export default function PostsIndex({ posts }: PostsIndexProps) {
    const handleCreate = () => {
        router.visit('/admin/blog/posts/create')
    }

    return (
        <AdminLayout>
            <Head title="Artikel Blog" />

            <PageHeader
                title="Artikel Blog"
                description="Kelola artikel dan konten blog"
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
                        data={posts}
                        searchKey="title"
                        searchPlaceholder="Cari artikel..."
                    />
                </CardContent>
            </Card>
        </AdminLayout>
    )
}
