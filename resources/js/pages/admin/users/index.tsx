import { Head, router } from '@inertiajs/react'
import AdminLayout from '@/layouts/admin/admin-layout'
import { PageHeader } from '@/components/admin/common/page-header'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Plus } from 'lucide-react'
import { User } from '@/types'
import { DataTable } from '@/components/ui/data-table'
import { columns } from './columns'

interface UsersIndexProps {
    users: User[]
}

export default function UsersIndex({ users }: UsersIndexProps) {
    const handleCreate = () => {
        router.visit('/admin/users/create')
    }

    return (
        <AdminLayout>
            <Head title="Kelola Pengguna" />

            <PageHeader
                title="Kelola Pengguna"
                description="Kelola pengguna yang terdaftar di sistem"
                action={
                    <Button onClick={handleCreate}>
                        <Plus className="h-4 w-4" />
                        Tambah Pengguna
                    </Button>
                }
            />

            <Card>
                <CardContent className="pt-6">
                    <DataTable
                        columns={columns}
                        data={users}
                        searchKey="name"
                        searchPlaceholder="Cari pengguna..."
                    />
                </CardContent>
            </Card>
        </AdminLayout>
    )
}
