import { Head, useForm } from '@inertiajs/react'
import AdminLayout from '@/layouts/admin/admin-layout'
import { PageHeader } from '@/components/admin/common/page-header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import InputError from '@/components/input-error'
import { FormEventHandler } from 'react'
import { FolderOpen, Save, X } from 'lucide-react'
import { router } from '@inertiajs/react'
import { GuideCategory } from '@/types/guide'

interface EditGuideCategoryProps {
    category: GuideCategory
}

export default function EditGuideCategory({ category }: EditGuideCategoryProps) {
    const { data, setData, put, processing, errors } = useForm({
        name: category.name,
        sort_order: category.sort_order,
    })

    const handleSubmit: FormEventHandler = (e) => {
        e.preventDefault()
        put(`/admin/guides/categories/${category.id}`)
    }

    const handleCancel = () => {
        router.visit('/admin/guides/categories')
    }

    return (
        <AdminLayout>
            <Head title="Edit Kategori Panduan" />

            <PageHeader
                title="Edit Kategori"
                description={`Edit kategori: ${category.name}`}
            />

            <form onSubmit={handleSubmit} className="space-y-6">
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                                <FolderOpen className="size-5 text-primary" strokeWidth={2} />
                            </div>
                            <div>
                                <CardTitle>Informasi Kategori</CardTitle>
                                <CardDescription>Perbarui detail kategori</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-5">
                        <div className="space-y-2">
                            <Label htmlFor="name" className="text-sm font-medium">
                                Nama Kategori *
                            </Label>
                            <Input
                                id="name"
                                name="name"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                placeholder="Contoh: Akun & Profil"
                                required
                            />
                            <InputError message={errors.name} />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="sort_order" className="text-sm font-medium">
                                Urutan
                            </Label>
                            <Input
                                id="sort_order"
                                name="sort_order"
                                type="number"
                                value={data.sort_order}
                                onChange={(e) => setData('sort_order', parseInt(e.target.value))}
                                placeholder="0"
                                min={0}
                            />
                            <p className="text-xs text-muted-foreground">
                                Semakin kecil angkanya, semakin di atas posisinya.
                            </p>
                            <InputError message={errors.sort_order} />
                        </div>
                    </CardContent>
                </Card>

                <div className="flex items-center justify-end gap-4">
                    <Button type="button" variant="outline" onClick={handleCancel}>
                        <X className="size-4" />
                        Batal
                    </Button>
                    <Button type="submit" disabled={processing}>
                        <Save className="size-4" />
                        {processing ? 'Simpan Perubahan' : 'Simpan Perubahan'}
                    </Button>
                </div>
            </form>
        </AdminLayout>
    )
}
