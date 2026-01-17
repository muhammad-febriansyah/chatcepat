import { Head, router } from '@inertiajs/react'
import AdminLayout from '@/layouts/admin/admin-layout'
import { PageHeader } from '@/components/admin/common/page-header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { FileEdit, Pencil } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Page } from '@/types/page'

interface PagesIndexProps {
    pages: Page[]
}

export default function PagesIndex({ pages }: PagesIndexProps) {
    const handleEdit = (id: number) => {
        router.visit(`/admin/pages/${id}/edit`)
    }

    return (
        <AdminLayout>
            <Head title="Kelola Halaman" />

            <PageHeader
                title="Kelola Halaman"
                description="Edit konten halaman statis seperti Syarat & Ketentuan, Kebijakan Privasi, dan Tentang Kami"
            />

            <div className="grid gap-6">
                {pages.map((page) => (
                    <Card key={page.id}>
                        <CardHeader>
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                                        <FileEdit className="size-5 text-primary" strokeWidth={2} />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <CardTitle>{page.title}</CardTitle>
                                            <Badge variant={page.is_active ? 'default' : 'outline'}>
                                                {page.is_active ? 'Aktif' : 'Tidak Aktif'}
                                            </Badge>
                                        </div>
                                        <CardDescription>
                                            {page.excerpt || 'Tidak ada ringkasan'}
                                        </CardDescription>
                                    </div>
                                </div>
                                <Button onClick={() => handleEdit(page.id)} size="sm">
                                    <Pencil className="h-4 w-4" />
                                    Edit
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2 text-sm text-muted-foreground">
                                <div>
                                    <span className="font-medium">Slug:</span> /{page.slug}
                                </div>
                                <div>
                                    <span className="font-medium">Terakhir diperbarui:</span>{' '}
                                    {new Date(page.updated_at).toLocaleDateString('id-ID', {
                                        day: 'numeric',
                                        month: 'long',
                                        year: 'numeric',
                                    })}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </AdminLayout>
    )
}
