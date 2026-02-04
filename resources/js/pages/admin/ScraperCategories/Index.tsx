import { Head, router, useForm } from '@inertiajs/react'
import { logger } from '@/utils/logger';
import AdminLayout from '@/layouts/admin/admin-layout'
import { PageHeader } from '@/components/admin/common/page-header'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Plus, Pencil, Trash2, Eye, EyeOff } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { DataTable } from '@/components/ui/data-table'
import { ColumnDef } from '@tanstack/react-table'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ImageUpload } from '@/components/ui/image-upload'
import { Switch } from '@/components/ui/switch'
import { useState } from 'react'
import { toast } from 'sonner'

interface Category {
    id: number
    name: string
    slug: string
    image: string | null
    image_url: string | null
    is_active: boolean
    order: number
    places_count?: number
    created_at: string
}

interface IndexPageProps {
    categories: Category[]
}


export default function Index({ categories }: IndexPageProps) {
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingCategory, setEditingCategory] = useState<Category | null>(null)
    const [imageFile, setImageFile] = useState<File | null>(null)

    const { data, setData, post, put, processing, errors, reset } = useForm({
        name: '',
        slug: '',
        image: null as File | null,
        is_active: true,
        order: 0,
    })

    const handleDelete = (id: number, name: string) => {
        if (confirm(`Apakah Anda yakin ingin menghapus kategori "${name}"?`)) {
            router.delete(`/admin/scraper-categories/${id}`, {
                onSuccess: () => {
                    toast.success('Kategori berhasil dihapus!')
                },
                onError: () => {
                    toast.error('Gagal menghapus kategori')
                },
            })
        }
    }

    const openCreateModal = () => {
        setEditingCategory(null)
        setImageFile(null)
        reset()
        setData({
            name: '',
            slug: '',
            image: null,
            is_active: true,
            order: 0,
        })
        setIsModalOpen(true)
    }

    const openEditModal = (category: Category) => {
        setEditingCategory(category)
        setImageFile(null)
        setData({
            name: category.name,
            slug: category.slug,
            image: null,
            is_active: category.is_active,
            order: category.order,
        })
        setIsModalOpen(true)
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()

        const formData = new FormData()
        formData.append('name', data.name)
        formData.append('slug', data.slug)
        if (imageFile) {
            formData.append('image', imageFile)
        }
        formData.append('is_active', data.is_active ? '1' : '0')
        formData.append('order', data.order.toString())

        if (editingCategory) {
            formData.append('_method', 'PUT')
            router.post(`/admin/scraper-categories/${editingCategory.id}`, formData, {
                onSuccess: () => {
                    setIsModalOpen(false)
                    reset()
                    setImageFile(null)
                    toast.success('Kategori berhasil diupdate!')
                },
                onError: (errors) => {
                    logger.error('Error:', errors)
                    const firstError = Object.values(errors)[0] as string
                    toast.error(firstError || 'Gagal mengupdate kategori')
                },
            })
        } else {
            router.post('/admin/scraper-categories', formData, {
                onSuccess: () => {
                    setIsModalOpen(false)
                    reset()
                    setImageFile(null)
                    toast.success('Kategori berhasil ditambahkan!')
                },
                onError: (errors) => {
                    logger.error('Error:', errors)
                    const firstError = Object.values(errors)[0] as string
                    toast.error(firstError || 'Gagal menambahkan kategori')
                },
            })
        }
    }

    const generateSlug = (name: string) => {
        return name
            .toLowerCase()
            .replace(/[^\w\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .trim()
    }

    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const name = e.target.value
        setData({
            ...data,
            name,
            slug: generateSlug(name),
        })
    }

    // Define columns untuk DataTable
    const columns: ColumnDef<Category>[] = [
        {
            accessorKey: 'image_url',
            header: 'Icon',
            cell: ({ row }) => {
                const imageUrl = row.getValue('image_url') as string | null
                const name = row.getValue('name') as string

                return imageUrl ? (
                    <img
                        src={imageUrl}
                        alt={name}
                        className="w-10 h-10 object-contain"
                    />
                ) : (
                    <div className="w-10 h-10 bg-muted rounded flex items-center justify-center text-muted-foreground text-xs">
                        No Icon
                    </div>
                )
            },
        },
        {
            accessorKey: 'name',
            header: 'Nama',
            cell: ({ row }) => (
                <div className="font-medium">{row.getValue('name')}</div>
            ),
        },
        {
            accessorKey: 'slug',
            header: 'Slug',
            cell: ({ row }) => (
                <div className="text-muted-foreground text-sm">
                    {row.getValue('slug')}
                </div>
            ),
        },
        {
            accessorKey: 'is_active',
            header: 'Status',
            cell: ({ row }) => {
                const isActive = row.getValue('is_active') as boolean

                return isActive ? (
                    <Badge variant="default" className="gap-1">
                        <Eye className="h-3 w-3" />
                        Aktif
                    </Badge>
                ) : (
                    <Badge variant="secondary" className="gap-1">
                        <EyeOff className="h-3 w-3" />
                        Nonaktif
                    </Badge>
                )
            },
        },
        {
            accessorKey: 'order',
            header: () => <div className="text-center">Urutan</div>,
            cell: ({ row }) => (
                <div className="text-center">{row.getValue('order')}</div>
            ),
        },
        {
            id: 'actions',
            header: () => <div className="text-right">Aksi</div>,
            cell: ({ row }) => {
                const category = row.original

                return (
                    <div className="flex justify-end gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openEditModal(category)}
                        >
                            <Pencil className="mr-1.5 h-3.5 w-3.5" />
                            Edit
                        </Button>
                        <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDelete(category.id, category.name)}
                        >
                            <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                            Hapus
                        </Button>
                    </div>
                )
            },
        },
    ]

    return (
        <AdminLayout>
            <Head title="Kategori Scraper" />

            <PageHeader
                title="Kategori Scraper"
                description="Kelola kategori untuk Google Maps Scraper dengan icon marker kustom"
                action={
                    <Button onClick={openCreateModal}>
                        <Plus className="mr-2 h-4 w-4" />
                        Tambah
                    </Button>
                }
            />

            <Card>
                <CardContent className="p-6">
                    <DataTable
                        columns={columns}
                        data={categories}
                        searchKey="name"
                        searchPlaceholder="Cari kategori..."
                    />
                </CardContent>
            </Card>

            {/* Modal Create/Edit */}
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>
                            {editingCategory ? 'Edit Kategori' : 'Tambah Kategori Baru'}
                        </DialogTitle>
                        <DialogDescription>
                            {editingCategory
                                ? 'Ubah informasi kategori scraper'
                                : 'Buat kategori baru untuk Google Maps Scraper'}
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-4">
                            {/* Nama */}
                            <div className="space-y-2">
                                <Label htmlFor="name">
                                    Nama Kategori <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    id="name"
                                    value={data.name}
                                    onChange={handleNameChange}
                                    placeholder="Contoh: Restoran, Hotel, Kafe..."
                                    required
                                />
                                {errors.name && (
                                    <p className="text-sm text-destructive">{errors.name}</p>
                                )}
                            </div>

                            {/* Slug */}
                            <div className="space-y-2">
                                <Label htmlFor="slug">Slug</Label>
                                <Input
                                    id="slug"
                                    value={data.slug}
                                    onChange={(e) => setData('slug', e.target.value)}
                                    placeholder="Auto-generated dari nama"
                                />
                                {errors.slug && (
                                    <p className="text-sm text-destructive">{errors.slug}</p>
                                )}
                                <p className="text-xs text-muted-foreground">
                                    Slug akan otomatis dibuat dari nama kategori
                                </p>
                            </div>

                            {/* Image Upload */}
                            <div className="space-y-2">
                                <Label>Icon Kategori</Label>
                                <ImageUpload
                                    value={imageFile}
                                    onChange={setImageFile}
                                    currentImage={editingCategory?.image || null}
                                    accept="image/jpeg,image/jpg,image/png,image/gif,image/svg+xml"
                                    maxSize={2048}
                                />
                                {errors.image && (
                                    <p className="text-sm text-destructive">{errors.image}</p>
                                )}
                                <p className="text-xs text-muted-foreground">
                                    Upload icon untuk marker di peta (opsional)
                                </p>
                            </div>

                            {/* Urutan */}
                            <div className="space-y-2">
                                <Label htmlFor="order">Urutan</Label>
                                <Input
                                    id="order"
                                    type="number"
                                    value={data.order}
                                    onChange={(e) => setData('order', parseInt(e.target.value) || 0)}
                                    placeholder="0"
                                />
                                {errors.order && (
                                    <p className="text-sm text-destructive">{errors.order}</p>
                                )}
                                <p className="text-xs text-muted-foreground">
                                    Urutan tampilan kategori (angka lebih kecil muncul lebih dulu)
                                </p>
                            </div>

                            {/* Status */}
                            <div className="flex items-center justify-between rounded-lg border p-4">
                                <div className="space-y-0.5">
                                    <Label htmlFor="is_active">Status Aktif</Label>
                                    <p className="text-sm text-muted-foreground">
                                        Kategori aktif akan ditampilkan di sistem
                                    </p>
                                </div>
                                <Switch
                                    id="is_active"
                                    checked={data.is_active}
                                    onCheckedChange={(checked) => setData('is_active', checked)}
                                />
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
                                {processing
                                    ? 'Menyimpan...'
                                    : editingCategory
                                    ? 'Update Kategori'
                                    : 'Tambah Kategori'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </AdminLayout>
    )
}
