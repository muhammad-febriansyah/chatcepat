import { Head } from '@inertiajs/react'
import AdminLayout from '@/layouts/admin/admin-layout'
import { PageHeader } from '@/components/admin/common/page-header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Mail } from 'lucide-react'
import { DataTable } from '@/components/ui/data-table'
import { columns } from './columns'

interface Contact {
    id: number
    name: string
    email: string
    subject: string
    message: string
    is_read: boolean
    created_at: string
}

interface ContactsIndexProps {
    contacts: {
        data: Contact[]
    }
    stats: {
        total: number
        unread: number
        read: number
    }
}

export default function ContactsIndex({ contacts, stats }: ContactsIndexProps) {

    return (
        <AdminLayout>
            <Head title="Pesan Kontak" />

            <PageHeader
                title="Pesan Kontak"
                description="Kelola pesan yang masuk dari formulir kontak"
            />

            {/* Stats Cards */}
            <div className="grid gap-4 mb-6 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Pesan</CardTitle>
                        <Mail className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.total}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Belum Dibaca</CardTitle>
                        <Mail className="h-4 w-4 text-orange-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-orange-500">{stats.unread}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Sudah Dibaca</CardTitle>
                        <Mail className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-500">{stats.read}</div>
                    </CardContent>
                </Card>
            </div>

            {/* Messages List */}
            <Card>
                <CardContent className="pt-6">
                    <DataTable
                        columns={columns}
                        data={contacts.data}
                        searchKey="name"
                        searchPlaceholder="Cari nama pengirim..."
                    />
                </CardContent>
            </Card>
        </AdminLayout>
    )
}
