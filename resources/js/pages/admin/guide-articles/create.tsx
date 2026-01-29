import { Head, useForm, router } from '@inertiajs/react'
import AdminLayout from '@/layouts/admin/admin-layout'
import { PageHeader } from '@/components/admin/common/page-header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ImageUpload } from '@/components/ui/image-upload'
import { RichTextEditor } from '@/components/ui/rich-text-editor'
import InputError from '@/components/input-error'
import { FormEventHandler } from 'react'
import { FileEdit, Save, X } from 'lucide-react'
import { GuideCategory } from '@/types/guide'

interface CreateGuideArticleProps {
    categories: GuideCategory[]
}

export default function CreateGuideArticle({ categories }: CreateGuideArticleProps) {
    const { data, setData, post, processing, errors } = useForm({
        guide_category_id: '',
        title: '',
        content: '',
        sort_order: 0,
        is_published: true,
        featured_image: null as File | null,
    })

    const handleSubmit: FormEventHandler = (e) => {
        e.preventDefault()
        post('/admin/guides/articles', {
            forceFormData: true,
        })
    }

    const handleCancel = () => {
        router.visit('/admin/guides/articles')
    }

    return (
        <AdminLayout>
            <Head title="Tambah Artikel Panduan" />

            <PageHeader
                title="Tambah Artikel Baru"
                description="Buat artikel panduan baru"
            />

            <form onSubmit={handleSubmit} className="space-y-6">
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                                <FileEdit className="size-5 text-primary" strokeWidth={2} />
                            </div>
                            <div>
                                <CardTitle>Informasi Artikel</CardTitle>
                                <CardDescription>Masukkan detail artikel</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-5">
                        <div className="grid gap-5 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="title">Judul Artikel *</Label>
                                <Input
                                    id="title"
                                    value={data.title}
                                    onChange={(e) => setData('title', e.target.value)}
                                    placeholder="Masukkan judul artikel"
                                    required
                                />
                                <InputError message={errors.title} />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="guide_category_id">Kategori *</Label>
                                <Select
                                    value={data.guide_category_id}
                                    onValueChange={(value) => setData('guide_category_id', value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Pilih kategori" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {categories.map((cat) => (
                                            <SelectItem key={cat.id} value={cat.id.toString()}>
                                                {cat.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <InputError message={errors.guide_category_id} />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="featured_image">Gambar Artikel (Opsional)</Label>
                            <ImageUpload
                                value={data.featured_image}
                                onChange={(file) => setData('featured_image', file)}
                            />
                            <InputError message={errors.featured_image} />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="content">Konten *</Label>
                            <RichTextEditor
                                content={data.content}
                                onChange={(html) => setData('content', html)}
                                placeholder="Tulis konten panduan di sini..."
                            />
                            <InputError message={errors.content} />
                        </div>

                        <div className="grid gap-5 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="sort_order">Urutan</Label>
                                <Input
                                    id="sort_order"
                                    type="number"
                                    value={data.sort_order}
                                    onChange={(e) => setData('sort_order', parseInt(e.target.value))}
                                    placeholder="0"
                                    min={0}
                                />
                                <InputError message={errors.sort_order} />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="status">Status</Label>
                                <Select
                                    value={data.is_published ? 'true' : 'false'}
                                    onValueChange={(value) => setData('is_published', value === 'true')}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="true">Published</SelectItem>
                                        <SelectItem value="false">Draft</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
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
                        {processing ? 'Menyimpan...' : 'Simpan Artikel'}
                    </Button>
                </div>
            </form>
        </AdminLayout>
    )
}
