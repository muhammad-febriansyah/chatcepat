import { Head, Link, useForm } from '@inertiajs/react'
import AdminLayout from '@/layouts/admin/admin-layout'
import { PageHeader } from '@/components/admin/common/page-header'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { ArrowLeft, Upload, X } from 'lucide-react'
import { FormEventHandler, useState } from 'react'

interface Category {
    id: number
    name: string
    slug: string
    image: string | null
    image_url: string | null
    is_active: boolean
    order: number
}

interface EditPageProps {
    category: Category
}

export default function Edit({ category }: EditPageProps) {
    const { data, setData, post, processing, errors } = useForm({
        name: category.name,
        slug: category.slug,
        image: null as File | null,
        is_active: category.is_active,
        order: category.order,
        _method: 'PUT',
    })

    const [imagePreview, setImagePreview] = useState<string | null>(category.image_url)

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            setData('image', file)
            const reader = new FileReader()
            reader.onloadend = () => {
                setImagePreview(reader.result as string)
            }
            reader.readAsDataURL(file)
        }
    }

    const removeImage = () => {
        setData('image', null)
        setImagePreview(null)
    }

    const handleSubmit: FormEventHandler = (e) => {
        e.preventDefault()
        post(`/admin/scraper-categories/${category.id}`)
    }

    return (
        <AdminLayout>
            <Head title={`Edit Kategori: ${category.name}`} />

            <PageHeader
                title={`Edit Kategori: ${category.name}`}
                description="Ubah informasi kategori dan icon marker"
            >
                <Link href="/admin/scraper-categories">
                    <Button variant="outline">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Kembali
                    </Button>
                </Link>
            </PageHeader>

            <div className="grid gap-6 md:grid-cols-3">
                <div className="md:col-span-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Informasi Kategori</CardTitle>
                            <CardDescription>
                                Ubah detail kategori scraper
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="space-y-2">
                                    <Label htmlFor="name">
                                        Nama Kategori <span className="text-destructive">*</span>
                                    </Label>
                                    <Input
                                        id="name"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        placeholder="Contoh: Restaurant, Hotel, Cafe"
                                        required
                                    />
                                    {errors.name && (
                                        <p className="text-sm text-destructive">{errors.name}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="slug">Slug (Opsional)</Label>
                                    <Input
                                        id="slug"
                                        value={data.slug}
                                        onChange={(e) => setData('slug', e.target.value)}
                                        placeholder="Otomatis dari nama jika kosong"
                                    />
                                    {errors.slug && (
                                        <p className="text-sm text-destructive">{errors.slug}</p>
                                    )}
                                    <p className="text-sm text-muted-foreground">
                                        Slug akan otomatis dibuat dari nama jika dikosongkan
                                    </p>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="order">Urutan</Label>
                                    <Input
                                        id="order"
                                        type="number"
                                        value={data.order}
                                        onChange={(e) => setData('order', parseInt(e.target.value))}
                                        min="0"
                                    />
                                    {errors.order && (
                                        <p className="text-sm text-destructive">{errors.order}</p>
                                    )}
                                </div>

                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="is_active"
                                        checked={data.is_active}
                                        onCheckedChange={(checked) => setData('is_active', checked as boolean)}
                                    />
                                    <Label htmlFor="is_active" className="cursor-pointer">
                                        Kategori Aktif
                                    </Label>
                                </div>

                                <div className="flex gap-2">
                                    <Button type="submit" disabled={processing}>
                                        {processing ? 'Menyimpan...' : 'Update Kategori'}
                                    </Button>
                                    <Link href="/admin/scraper-categories">
                                        <Button type="button" variant="outline">
                                            Batal
                                        </Button>
                                    </Link>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>

                <div className="md:col-span-1">
                    <Card>
                        <CardHeader>
                            <CardTitle>Icon Marker</CardTitle>
                            <CardDescription>
                                Upload icon untuk marker di peta
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="image">Upload Icon Baru</Label>
                                <div className="flex flex-col gap-4">
                                    {imagePreview ? (
                                        <div className="relative">
                                            <img
                                                src={imagePreview}
                                                alt="Preview"
                                                className="w-full h-48 object-contain bg-muted rounded-lg border"
                                            />
                                            <Button
                                                type="button"
                                                variant="destructive"
                                                size="icon"
                                                className="absolute top-2 right-2"
                                                onClick={removeImage}
                                            >
                                                <X className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    ) : (
                                        <label
                                            htmlFor="image"
                                            className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer bg-muted hover:bg-muted/80"
                                        >
                                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                                <Upload className="w-10 h-10 mb-3 text-muted-foreground" />
                                                <p className="mb-2 text-sm text-muted-foreground">
                                                    <span className="font-semibold">Klik untuk upload</span>
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    PNG, JPG, SVG (Max 2MB)
                                                </p>
                                            </div>
                                        </label>
                                    )}
                                    <Input
                                        id="image"
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageChange}
                                        className="hidden"
                                    />
                                </div>
                                {errors.image && (
                                    <p className="text-sm text-destructive">{errors.image}</p>
                                )}
                            </div>

                            <div className="p-3 bg-muted rounded-lg text-sm">
                                <p className="font-medium mb-1">Rekomendasi:</p>
                                <ul className="text-muted-foreground space-y-1 text-xs">
                                    <li>• Ukuran: 64x64px atau 128x128px</li>
                                    <li>• Format: PNG dengan background transparan</li>
                                    <li>• Icon sederhana dan mudah dikenali</li>
                                </ul>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AdminLayout>
    )
}
