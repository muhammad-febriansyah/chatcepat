import { Head, router } from '@inertiajs/react'
import AdminLayout from '@/layouts/admin/admin-layout'
import { PageHeader } from '@/components/admin/common/page-header'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Plus } from 'lucide-react'
import { FiturUnggulan } from '@/types/fitur-unggulan'
import { DataTable } from '@/components/ui/data-table'
import { columns } from './columns'

interface FiturUnggulanIndexProps {
    fiturUnggulans: FiturUnggulan[]
}

export default function FiturUnggulanIndex({ fiturUnggulans }: FiturUnggulanIndexProps) {
    const handleCreate = () => {
        router.visit('/admin/fitur-unggulan/create')
    }

    return (
        <AdminLayout>
            <Head title="Kelola Fitur Unggulan" />

            <PageHeader
                title="Kelola Fitur Unggulan"
                description="Kelola fitur unggulan yang ditampilkan di halaman utama"
                action={
                    <Button onClick={handleCreate}>
                        <Plus className="h-4 w-4" />
                        Tambah Fitur Unggulan
                    </Button>
                }
            />

            <Card>
                <CardContent className="pt-6">
                    <DataTable
                        columns={columns}
                        data={fiturUnggulans}
                        searchKey="title"
                        searchPlaceholder="Cari fitur unggulan..."
                    />
                </CardContent>
            </Card>
        </AdminLayout>
    )
}
