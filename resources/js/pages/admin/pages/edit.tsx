import { Head, useForm, router } from '@inertiajs/react'
import AdminLayout from '@/layouts/admin/admin-layout'
import { PageHeader } from '@/components/admin/common/page-header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { RichTextEditor } from '@/components/ui/rich-text-editor'
import InputError from '@/components/input-error'
import { FormEventHandler } from 'react'
import { FileEdit, Save, X } from 'lucide-react'
import { Page } from '@/types/page'

interface EditPageProps {
    page: Page
}

export default function EditPage({ page }: EditPageProps) {
    const { data, setData, put, processing, errors } = useForm({
        title: page.title || '',
        content: page.content || '',
        excerpt: page.excerpt || '',
        meta_title: page.meta_title || '',
        meta_description: page.meta_description || '',
        meta_keywords: page.meta_keywords || '',
        is_active: page.is_active,
    })

    const handleSubmit: FormEventHandler = (e) => {
        e.preventDefault()
        put(`/admin/pages/${page.slug}`)
    }

    const handleCancel = () => {
        router.visit('/admin/pages')
    }

    return (
        <AdminLayout>
            <Head title={`Edit ${page.title}`} />

            <PageHeader title={`Edit ${page.title}`} description="Perbarui konten halaman" />

            <form onSubmit={handleSubmit} className="space-y-6">
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                                <FileEdit className="size-5 text-primary" strokeWidth={2} />
                            </div>
                            <div>
                                <CardTitle>Informasi Halaman</CardTitle>
                                <CardDescription>Edit detail halaman</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-5">
                        <div className="space-y-2">
                            <Label htmlFor="title">Judul *</Label>
                            <Input
                                id="title"
                                value={data.title}
                                onChange={(e) => setData('title', e.target.value)}
                                placeholder="Masukkan judul halaman"
                                required
                            />
                            <InputError message={errors.title} />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="excerpt">Ringkasan</Label>
                            <textarea
                                id="excerpt"
                                value={data.excerpt}
                                onChange={(e) => setData('excerpt', e.target.value)}
                                placeholder="Ringkasan singkat halaman"
                                rows={2}
                                className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-base transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                            />
                            <InputError message={errors.excerpt} />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="content">Konten *</Label>
                            <RichTextEditor
                                content={data.content}
                                onChange={(content) => setData('content', content)}
                                placeholder="Tulis konten halaman di sini"
                            />
                            <InputError message={errors.content} />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="status">Status *</Label>
                            <Select value={data.is_active ? '1' : '0'} onValueChange={(value) => setData('is_active', value === '1')}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="1">Aktif</SelectItem>
                                    <SelectItem value="0">Tidak Aktif</SelectItem>
                                </SelectContent>
                            </Select>
                            <InputError message={errors.is_active} />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>SEO Meta Tags</CardTitle>
                        <CardDescription>Optimasi untuk mesin pencari (opsional)</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-5">
                        <div className="space-y-2">
                            <Label htmlFor="meta_title">Meta Title</Label>
                            <Input
                                id="meta_title"
                                value={data.meta_title}
                                onChange={(e) => setData('meta_title', e.target.value)}
                                placeholder="Judul untuk SEO"
                            />
                            <InputError message={errors.meta_title} />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="meta_description">Meta Description</Label>
                            <textarea
                                id="meta_description"
                                value={data.meta_description}
                                onChange={(e) => setData('meta_description', e.target.value)}
                                placeholder="Deskripsi untuk SEO"
                                rows={3}
                                className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-base transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                            />
                            <InputError message={errors.meta_description} />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="meta_keywords">Meta Keywords</Label>
                            <Input
                                id="meta_keywords"
                                value={data.meta_keywords}
                                onChange={(e) => setData('meta_keywords', e.target.value)}
                                placeholder="Kata kunci, pisahkan dengan koma"
                            />
                            <InputError message={errors.meta_keywords} />
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
                        {processing ? 'Menyimpan...' : 'Simpan Perubahan'}
                    </Button>
                </div>
            </form>
        </AdminLayout>
    )
}
