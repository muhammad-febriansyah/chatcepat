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
import { Sparkles, Save, X } from 'lucide-react'
import { FiturUnggulan } from '@/types/fitur-unggulan'
import * as LucideIcons from 'lucide-react'

const AVAILABLE_ICONS = [
    { name: 'MessageSquare', label: 'Pesan' },
    { name: 'Phone', label: 'Telepon' },
    { name: 'Video', label: 'Video' },
    { name: 'Lock', label: 'Keamanan' },
    { name: 'Shield', label: 'Perlindungan' },
    { name: 'FolderOpen', label: 'Folder' },
    { name: 'File', label: 'File' },
    { name: 'Image', label: 'Gambar' },
    { name: 'Palette', label: 'Warna' },
    { name: 'Zap', label: 'Cepat' },
    { name: 'Users', label: 'Pengguna' },
    { name: 'Bot', label: 'Bot' },
    { name: 'Sparkles', label: 'Bintang' },
    { name: 'Heart', label: 'Hati' },
    { name: 'Star', label: 'Rating' },
    { name: 'Globe', label: 'Global' },
    { name: 'Smartphone', label: 'Smartphone' },
    { name: 'Clock', label: 'Waktu' },
]

interface EditFiturUnggulanProps {
    fiturUnggulan: FiturUnggulan
}

export default function EditFiturUnggulan({ fiturUnggulan }: EditFiturUnggulanProps) {
    const { data, setData, post, processing, errors } = useForm({
        icon: fiturUnggulan.icon || '',
        title: fiturUnggulan.title || '',
        description: fiturUnggulan.description || '',
        image: null as File | null,
        order: fiturUnggulan.order || 0,
        is_active: fiturUnggulan.is_active,
        _method: 'PUT',
    })

    const handleSubmit: FormEventHandler = (e) => {
        e.preventDefault()
        post(`/admin/fitur-unggulan/${fiturUnggulan.id}`)
    }

    const handleCancel = () => {
        router.visit('/admin/fitur-unggulan')
    }

    return (
        <AdminLayout>
            <Head title="Edit Fitur Unggulan" />

            <PageHeader title="Edit Fitur Unggulan" description="Perbarui informasi fitur unggulan" />

            <form onSubmit={handleSubmit} className="space-y-6">
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                                <Sparkles className="size-5 text-primary" strokeWidth={2} />
                            </div>
                            <div>
                                <CardTitle>Informasi Fitur Unggulan</CardTitle>
                                <CardDescription>Perbarui detail fitur unggulan</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-5">
                        <div className="grid gap-5 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="icon">Icon *</Label>
                                <Select value={data.icon} onValueChange={(value) => setData('icon', value)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Pilih icon" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {AVAILABLE_ICONS.map((icon) => {
                                            const IconComponent = (LucideIcons as any)[icon.name]
                                            return (
                                                <SelectItem key={icon.name} value={icon.name}>
                                                    <div className="flex items-center gap-2">
                                                        {IconComponent && <IconComponent className="h-4 w-4" />}
                                                        <span>{icon.label}</span>
                                                    </div>
                                                </SelectItem>
                                            )
                                        })}
                                    </SelectContent>
                                </Select>
                                <p className="text-xs text-muted-foreground">
                                    Pilih icon dari Lucide Icons
                                </p>
                                <InputError message={errors.icon} />
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
                                <p className="text-xs text-muted-foreground">
                                    Urutan tampilan (semakin kecil semakin atas)
                                </p>
                                <InputError message={errors.order} />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="title">Judul Fitur *</Label>
                            <Input
                                id="title"
                                value={data.title}
                                onChange={(e) => setData('title', e.target.value)}
                                placeholder="Balas Chat Otomatis"
                                required
                            />
                            <InputError message={errors.title} />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Deskripsi *</Label>
                            <textarea
                                id="description"
                                value={data.description}
                                onChange={(e) => setData('description', e.target.value)}
                                placeholder="Sistem auto-reply yang cerdas memastikan setiap pesan pelanggan langsung terjawab, bahkan saat Anda sibuk."
                                rows={4}
                                required
                                className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-base transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                            />
                            <InputError message={errors.description} />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="image">Gambar Fitur</Label>
                            {fiturUnggulan.image && (
                                <div className="mb-2">
                                    <img
                                        src={`/storage/${fiturUnggulan.image}`}
                                        alt="Current fitur unggulan image"
                                        className="h-32 w-auto rounded-lg border object-contain"
                                    />
                                    <p className="mt-1 text-xs text-muted-foreground">Gambar saat ini</p>
                                </div>
                            )}
                            <Input
                                id="image"
                                type="file"
                                accept="image/png,image/jpeg,image/jpg,image/svg+xml,image/webp"
                                onChange={(e) => setData('image', e.target.files?.[0] || null)}
                            />
                            <p className="text-xs text-muted-foreground">
                                Format: PNG, JPG, JPEG, SVG, WebP (Max: 5MB) - Biarkan kosong jika tidak ingin mengubah
                            </p>
                            <InputError message={errors.image} />
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
