import { Head, useForm, router } from '@inertiajs/react'
import AdminLayout from '@/layouts/admin/admin-layout'
import { PageHeader } from '@/components/admin/common/page-header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ImageUpload } from '@/components/ui/image-upload'
import InputError from '@/components/input-error'
import { FormEventHandler } from 'react'
import { FileEdit, Save, X } from 'lucide-react'
import { BlogCategory, Post } from '@/types/blog'

interface EditPostProps {
    post: Post
    categories: BlogCategory[]
}

export default function EditPost({ post, categories }: EditPostProps) {
    const { data, setData, post: postForm, processing, errors } = useForm({
        blog_category_id: post.blog_category_id?.toString() || '',
        title: post.title || '',
        excerpt: post.excerpt || '',
        content: post.content || '',
        featured_image: null as File | null,
        status: post.status || 'draft',
        _method: 'PUT' as const,
    })

    const handleSubmit: FormEventHandler = (e) => {
        e.preventDefault()
        postForm(`/admin/blog/posts/${post.id}`, {
            forceFormData: true,
        })
    }

    const handleCancel = () => {
        router.visit('/admin/blog/posts')
    }

    return (
        <AdminLayout>
            <Head title="Edit Artikel" />

            <PageHeader title="Edit Artikel" description="Perbarui artikel blog" />

            <form onSubmit={handleSubmit} className="space-y-6">
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                                <FileEdit className="size-5 text-primary" strokeWidth={2} />
                            </div>
                            <div>
                                <CardTitle>Informasi Artikel</CardTitle>
                                <CardDescription>Perbarui detail artikel blog</CardDescription>
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
                                <Label htmlFor="blog_category_id">Kategori *</Label>
                                <Select
                                    value={data.blog_category_id}
                                    onValueChange={(value) => setData('blog_category_id', value)}
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
                                <InputError message={errors.blog_category_id} />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="excerpt">Ringkasan</Label>
                            <textarea
                                id="excerpt"
                                value={data.excerpt}
                                onChange={(e) => setData('excerpt', e.target.value)}
                                placeholder="Ringkasan singkat artikel"
                                rows={3}
                                className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-base transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                            />
                            <InputError message={errors.excerpt} />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="content">Konten *</Label>
                            <textarea
                                id="content"
                                value={data.content}
                                onChange={(e) => setData('content', e.target.value)}
                                placeholder="Tulis konten artikel di sini"
                                rows={12}
                                required
                                className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-base transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                            />
                            <InputError message={errors.content} />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="featured_image">Gambar Artikel</Label>
                            <ImageUpload
                                value={data.featured_image}
                                onChange={(file) => setData('featured_image', file)}
                                currentImage={post.featured_image}
                            />
                            <InputError message={errors.featured_image} />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="status">Status *</Label>
                            <Select value={data.status} onValueChange={(value) => setData('status', value)}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="draft">Draft</SelectItem>
                                    <SelectItem value="published">Published</SelectItem>
                                </SelectContent>
                            </Select>
                            <InputError message={errors.status} />
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
