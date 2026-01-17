import { Head, router } from '@inertiajs/react'
import AdminLayout from '@/layouts/admin/admin-layout'
import { PageHeader } from '@/components/admin/common/page-header'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Plus } from 'lucide-react'
import { Faq } from '@/types/faq'
import { DataTable } from '@/components/ui/data-table'
import { columns } from './columns'

interface FaqsIndexProps {
    faqs: Faq[]
}

export default function FaqsIndex({ faqs }: FaqsIndexProps) {
    const handleCreate = () => {
        router.visit('/admin/faqs/create')
    }

    return (
        <AdminLayout>
            <Head title="Kelola FAQ" />

            <PageHeader
                title="Pertanyaan Umum (FAQ)"
                description="Kelola pertanyaan yang sering ditanyakan"
                action={
                    <Button onClick={handleCreate}>
                        <Plus className="h-4 w-4" />
                        Tambah FAQ
                    </Button>
                }
            />

            <Card>
                <CardContent className="pt-6">
                    <DataTable
                        columns={columns}
                        data={faqs}
                        searchKey="question"
                        searchPlaceholder="Cari pertanyaan..."
                    />
                </CardContent>
            </Card>
        </AdminLayout>
    )
}
