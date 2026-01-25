import { Head, router, useForm } from '@inertiajs/react'
import AdminLayout from '@/layouts/admin/admin-layout'
import { PageHeader } from '@/components/admin/common/page-header'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Plus, Upload, X, Image as ImageIcon } from 'lucide-react'
import { DataTable } from '@/components/ui/data-table'
import { getColumns } from './columns'
import { useState, useRef } from 'react'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'

interface Partner {
    id: number
    name: string
    image: string
    order: number
    is_active: boolean
    created_at: string
    updated_at: string
}

interface PartnersIndexProps {
    partners: Partner[]
}

export default function PartnersIndex({ partners }: PartnersIndexProps) {
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingPartner, setEditingPartner] = useState<Partner | null>(null)
    const [imagePreview, setImagePreview] = useState<string | null>(null)
    const [isDragging, setIsDragging] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const { data, setData, post, put, processing, errors, reset } = useForm({
        name: '',
        image: null as File | null,
        order: 0,
        is_active: true,
    })

    const handleCreate = () => {
        setEditingPartner(null)
        reset()
        setImagePreview(null)
        setIsDragging(false)
        setIsModalOpen(true)
    }

    const handleEdit = (partner: Partner) => {
        setEditingPartner(partner)
        setData({
            name: partner.name,
            image: null,
            order: partner.order,
            is_active: partner.is_active,
        })
        setImagePreview(partner.image ? `/storage/${partner.image}` : null)
        setIsModalOpen(true)
    }

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            processImage(file)
        }
    }

    const processImage = (file: File) => {
        if (!file.type.startsWith('image/')) {
            return
        }

        setData('image', file)
        const reader = new FileReader()
        reader.onloadend = () => {
            setImagePreview(reader.result as string)
        }
        reader.readAsDataURL(file)
    }

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(true)
    }

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(false)
    }

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(false)

        const file = e.dataTransfer.files[0]
        if (file) {
            processImage(file)
        }
    }

    const handleRemoveImage = () => {
        setData('image', null)
        setImagePreview(null)
        if (fileInputRef.current) {
            fileInputRef.current.value = ''
        }
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()

        const formData = new FormData()
        formData.append('name', data.name)
        formData.append('order', data.order.toString())
        formData.append('is_active', data.is_active ? '1' : '0')

        if (data.image) {
            formData.append('image', data.image)
        }

        if (editingPartner) {
            formData.append('_method', 'PUT')
            router.post(`/admin/partners/${editingPartner.id}`, formData, {
                onSuccess: () => {
                    setIsModalOpen(false)
                    reset()
                    setImagePreview(null)
                },
            })
        } else {
            router.post('/admin/partners', formData, {
                onSuccess: () => {
                    setIsModalOpen(false)
                    reset()
                    setImagePreview(null)
                },
            })
        }
    }

    const columns = getColumns({ onEdit: handleEdit })

    return (
        <AdminLayout>
            <Head title="Kelola Partner" />

            <PageHeader
                title="Data Partner"
                description="Kelola daftar partner yang telah bekerja sama"
                action={
                    <Button onClick={handleCreate}>
                        <Plus className="h-4 w-4" />
                        Tambah Partner
                    </Button>
                }
            />

            <Card>
                <CardContent className="pt-6">
                    <DataTable
                        columns={columns}
                        data={partners}
                        searchKey="name"
                        searchPlaceholder="Cari nama partner..."
                    />
                </CardContent>
            </Card>

            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="sm:max-w-[500px]">
                    <form onSubmit={handleSubmit}>
                        <DialogHeader>
                            <DialogTitle>
                                {editingPartner ? 'Edit Partner' : 'Tambah Partner'}
                            </DialogTitle>
                            <DialogDescription>
                                {editingPartner
                                    ? 'Perbarui informasi partner'
                                    : 'Tambahkan partner baru yang telah bekerja sama'}
                            </DialogDescription>
                        </DialogHeader>

                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="name">Nama Partner</Label>
                                <Input
                                    id="name"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    placeholder="Contoh: PT ABC Indonesia"
                                    required
                                />
                                {errors.name && (
                                    <p className="text-sm text-destructive">{errors.name}</p>
                                )}
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="image">Logo Partner</Label>

                                {imagePreview ? (
                                    <div className="relative">
                                        <div
                                            className="group relative cursor-pointer overflow-hidden rounded-lg border-2 border-dashed border-border bg-muted/50 p-4"
                                            onClick={() => fileInputRef.current?.click()}
                                        >
                                            <img
                                                src={imagePreview}
                                                alt="Preview"
                                                className="mx-auto h-32 w-auto object-contain"
                                            />
                                            <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/60 opacity-0 transition-opacity group-hover:opacity-100">
                                                <Button
                                                    type="button"
                                                    variant="secondary"
                                                    size="sm"
                                                    onClick={(e) => {
                                                        e.stopPropagation()
                                                        fileInputRef.current?.click()
                                                    }}
                                                    className="gap-2"
                                                >
                                                    <Upload className="h-4 w-4" />
                                                    Ganti
                                                </Button>
                                                <Button
                                                    type="button"
                                                    variant="destructive"
                                                    size="sm"
                                                    onClick={(e) => {
                                                        e.stopPropagation()
                                                        handleRemoveImage()
                                                    }}
                                                    className="gap-2"
                                                >
                                                    <X className="h-4 w-4" />
                                                    Hapus
                                                </Button>
                                            </div>
                                        </div>
                                        <p className="mt-2 text-xs text-center text-muted-foreground">
                                            Klik gambar untuk mengganti logo
                                        </p>
                                    </div>
                                ) : (
                                    <div
                                        onClick={() => fileInputRef.current?.click()}
                                        onDragOver={handleDragOver}
                                        onDragLeave={handleDragLeave}
                                        onDrop={handleDrop}
                                        className={`cursor-pointer rounded-lg border-2 border-dashed p-8 text-center transition-colors ${
                                            isDragging
                                                ? 'border-primary bg-primary/5'
                                                : 'border-border bg-muted/50 hover:border-primary/50 hover:bg-muted'
                                        }`}
                                    >
                                        <div className="mx-auto flex flex-col items-center gap-2">
                                            <div className="rounded-full bg-primary/10 p-3">
                                                {isDragging ? (
                                                    <Upload className="h-6 w-6 text-primary" />
                                                ) : (
                                                    <ImageIcon className="h-6 w-6 text-primary" />
                                                )}
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-sm font-medium">
                                                    {isDragging
                                                        ? 'Lepaskan file di sini'
                                                        : 'Klik untuk upload atau drag & drop'}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    PNG, JPG, JPEG, SVG, WebP (Max. 5MB)
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <input
                                    ref={fileInputRef}
                                    id="image"
                                    type="file"
                                    accept="image/png,image/jpeg,image/jpg,image/svg+xml,image/webp"
                                    onChange={handleImageChange}
                                    className="hidden"
                                />

                                {errors.image && (
                                    <p className="text-sm text-destructive">{errors.image}</p>
                                )}
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="order">Urutan Tampil</Label>
                                <Input
                                    id="order"
                                    type="number"
                                    value={data.order}
                                    onChange={(e) => setData('order', parseInt(e.target.value) || 0)}
                                    placeholder="0"
                                    min="0"
                                />
                                <p className="text-xs text-muted-foreground">
                                    Angka lebih kecil akan ditampilkan lebih dulu
                                </p>
                                {errors.order && (
                                    <p className="text-sm text-destructive">{errors.order}</p>
                                )}
                            </div>

                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="is_active"
                                    checked={data.is_active}
                                    onCheckedChange={(checked) =>
                                        setData('is_active', checked as boolean)
                                    }
                                />
                                <Label
                                    htmlFor="is_active"
                                    className="text-sm font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                >
                                    Partner aktif (tampilkan di halaman landing)
                                </Label>
                            </div>
                        </div>

                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setIsModalOpen(false)}
                                disabled={processing}
                            >
                                Batal
                            </Button>
                            <Button type="submit" disabled={processing}>
                                {processing ? 'Menyimpan...' : 'Simpan'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </AdminLayout>
    )
}
