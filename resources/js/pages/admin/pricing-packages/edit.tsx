import { Head, useForm, router } from '@inertiajs/react'
import AdminLayout from '@/layouts/admin/admin-layout'
import { PageHeader } from '@/components/admin/common/page-header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import InputError from '@/components/input-error'
import { FormEventHandler } from 'react'
import { DollarSign, Save, X, Plus, Trash2 } from 'lucide-react'
import { PricingPackage } from '@/types/pricing-package'

interface EditPricingPackageProps {
    package: PricingPackage
}

export default function EditPricingPackage({ package: pricingPackage }: EditPricingPackageProps) {
    const { data, setData, put, processing, errors } = useForm({
        name: pricingPackage.name || '',
        slug: pricingPackage.slug || '',
        description: pricingPackage.description || '',
        price: pricingPackage.price || '',
        currency: 'IDR',
        period: 1,
        period_unit: pricingPackage.period_unit || 'month',
        features: pricingPackage.features.length > 0 ? pricingPackage.features : [''],
        is_featured: pricingPackage.is_featured,
        is_active: pricingPackage.is_active,
        order: pricingPackage.order || 0,
    })

    const formatRupiah = (value: string) => {
        const number = value.replace(/[^0-9]/g, '')
        if (!number) return ''
        return new Intl.NumberFormat('id-ID').format(parseInt(number))
    }

    const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const rawValue = e.target.value.replace(/[^0-9]/g, '')
        setData('price', rawValue)
    }

    const handleSubmit: FormEventHandler = (e) => {
        e.preventDefault()
        put(`/admin/pricing-packages/${pricingPackage.id}`)
    }

    const handleCancel = () => {
        router.visit('/admin/pricing-packages')
    }

    const addFeature = () => {
        setData('features', [...data.features, ''])
    }

    const removeFeature = (index: number) => {
        const newFeatures = data.features.filter((_, i) => i !== index)
        setData('features', newFeatures)
    }

    const updateFeature = (index: number, value: string) => {
        const newFeatures = [...data.features]
        newFeatures[index] = value
        setData('features', newFeatures)
    }

    return (
        <AdminLayout>
            <Head title="Edit Paket Harga" />

            <PageHeader title="Edit Paket Harga" description="Perbarui informasi paket harga" />

            <form onSubmit={handleSubmit} className="space-y-6">
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                                <DollarSign className="size-5 text-primary" strokeWidth={2} />
                            </div>
                            <div>
                                <CardTitle>Informasi Paket</CardTitle>
                                <CardDescription>Perbarui detail paket harga</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-5">
                        <div className="grid gap-5 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="name">Nama Paket *</Label>
                                <Input
                                    id="name"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    placeholder="Paket Basic"
                                    required
                                />
                                <InputError message={errors.name} />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="slug">Slug</Label>
                                <Input
                                    id="slug"
                                    value={data.slug}
                                    onChange={(e) => setData('slug', e.target.value)}
                                    placeholder="paket-basic"
                                />
                                <p className="text-xs text-muted-foreground">
                                    Kosongkan untuk generate otomatis dari nama
                                </p>
                                <InputError message={errors.slug} />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Deskripsi *</Label>
                            <textarea
                                id="description"
                                value={data.description}
                                onChange={(e) => setData('description', e.target.value)}
                                placeholder="Paket dasar untuk kebutuhan personal"
                                rows={3}
                                required
                                className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-base transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                            />
                            <InputError message={errors.description} />
                        </div>

                        <div className="grid gap-5 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="price">Harga (Rupiah) *</Label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">Rp</span>
                                    <Input
                                        id="price"
                                        type="text"
                                        value={formatRupiah(data.price)}
                                        onChange={handlePriceChange}
                                        placeholder="50.000"
                                        className="pl-10"
                                        required
                                    />
                                </div>
                                <InputError message={errors.price} />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="order">Urutan</Label>
                                <Input
                                    id="order"
                                    type="number"
                                    value={data.order}
                                    onChange={(e) => setData('order', parseInt(e.target.value) || 0)}
                                    placeholder="0"
                                    min="0"
                                />
                                <InputError message={errors.order} />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="period_unit">Periode Berlangganan *</Label>
                            <Select value={data.period_unit} onValueChange={(value) => setData('period_unit', value)}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="month">Per Bulan</SelectItem>
                                    <SelectItem value="year">Per Tahun</SelectItem>
                                </SelectContent>
                            </Select>
                            <InputError message={errors.period_unit} />
                        </div>

                        <div className="space-y-2">
                            <Label>Fitur *</Label>
                            <div className="space-y-3">
                                {data.features.map((feature, index) => (
                                    <div key={index} className="flex gap-2">
                                        <Input
                                            value={feature}
                                            onChange={(e) => updateFeature(index, e.target.value)}
                                            placeholder="Contoh: Chat tidak terbatas"
                                        />
                                        {data.features.length > 1 && (
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="icon"
                                                onClick={() => removeFeature(index)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        )}
                                    </div>
                                ))}
                            </div>
                            <Button type="button" variant="outline" onClick={addFeature} className="w-full">
                                <Plus className="h-4 w-4" />
                                Tambah Fitur
                            </Button>
                            <InputError message={errors.features} />
                        </div>

                        <div className="grid gap-5 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="is_featured">Tampilkan sebagai Unggulan *</Label>
                                <Select
                                    value={data.is_featured ? '1' : '0'}
                                    onValueChange={(value) => setData('is_featured', value === '1')}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="1">Ya</SelectItem>
                                        <SelectItem value="0">Tidak</SelectItem>
                                    </SelectContent>
                                </Select>
                                <InputError message={errors.is_featured} />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="is_active">Status *</Label>
                                <Select
                                    value={data.is_active ? '1' : '0'}
                                    onValueChange={(value) => setData('is_active', value === '1')}
                                >
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
