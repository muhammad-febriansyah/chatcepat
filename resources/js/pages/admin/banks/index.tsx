import { Head, router, useForm } from '@inertiajs/react'
import AdminLayout from '@/layouts/admin/admin-layout'
import { PageHeader } from '@/components/admin/common/page-header'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Plus } from 'lucide-react'
import { Bank } from '@/types/bank'
import { DataTable } from '@/components/ui/data-table'
import { getColumns } from './columns'
import { useState } from 'react'
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

interface BanksIndexProps {
    banks: Bank[]
}

export default function BanksIndex({ banks }: BanksIndexProps) {
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingBank, setEditingBank] = useState<Bank | null>(null)
    const [imagePreview, setImagePreview] = useState<string | null>(null)

    const { data, setData, post, put, processing, errors, reset } = useForm({
        nama_bank: '',
        atasnama: '',
        norek: '',
        gambar: null as File | null,
        is_active: true,
    })

    const handleCreate = () => {
        setEditingBank(null)
        reset()
        setImagePreview(null)
        setIsModalOpen(true)
    }

    const handleEdit = (bank: Bank) => {
        setEditingBank(bank)
        setData({
            nama_bank: bank.nama_bank,
            atasnama: bank.atasnama,
            norek: bank.norek,
            gambar: null,
            is_active: bank.is_active,
        })
        setImagePreview(bank.gambar ? `/storage/${bank.gambar}` : null)
        setIsModalOpen(true)
    }

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            setData('gambar', file)
            const reader = new FileReader()
            reader.onloadend = () => {
                setImagePreview(reader.result as string)
            }
            reader.readAsDataURL(file)
        }
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()

        console.log('Submitting form:', { editingBank, data })

        const formData = new FormData()
        formData.append('nama_bank', data.nama_bank)
        formData.append('atasnama', data.atasnama)
        formData.append('norek', data.norek)
        formData.append('is_active', data.is_active ? '1' : '0')

        if (data.gambar) {
            formData.append('gambar', data.gambar)
            console.log('Image file:', data.gambar)
        }

        if (editingBank) {
            formData.append('_method', 'PUT')
            router.post(`/admin/banks/${editingBank.id}`, formData, {
                onSuccess: () => {
                    setIsModalOpen(false)
                    reset()
                    setImagePreview(null)
                },
                onError: (errors) => {
                    console.error('Update error:', errors)
                    alert('Gagal mengupdate bank: ' + JSON.stringify(errors))
                },
            })
        } else {
            router.post('/admin/banks', formData, {
                onSuccess: () => {
                    setIsModalOpen(false)
                    reset()
                    setImagePreview(null)
                },
                onError: (errors) => {
                    console.error('Create error:', errors)
                    alert('Gagal menambah bank: ' + JSON.stringify(errors))
                },
            })
        }
    }

    const columns = getColumns({ onEdit: handleEdit })

    return (
        <AdminLayout>
            <Head title="Kelola Bank" />

            <PageHeader
                title="Data Bank"
                description="Kelola data rekening bank untuk pembayaran manual"
                action={
                    <Button onClick={handleCreate}>
                        <Plus className="h-4 w-4" />
                        Tambah Bank
                    </Button>
                }
            />

            <Card>
                <CardContent className="pt-6">
                    <DataTable
                        columns={columns}
                        data={banks}
                        searchKey="nama_bank"
                        searchPlaceholder="Cari nama bank..."
                    />
                </CardContent>
            </Card>

            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="sm:max-w-[500px]">
                    <form onSubmit={handleSubmit}>
                        <DialogHeader>
                            <DialogTitle>
                                {editingBank ? 'Edit Bank' : 'Tambah Bank'}
                            </DialogTitle>
                            <DialogDescription>
                                {editingBank
                                    ? 'Perbarui informasi rekening bank'
                                    : 'Tambahkan rekening bank baru untuk pembayaran manual'}
                            </DialogDescription>
                        </DialogHeader>

                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="nama_bank">Nama Bank</Label>
                                <Input
                                    id="nama_bank"
                                    value={data.nama_bank}
                                    onChange={(e) => setData('nama_bank', e.target.value)}
                                    placeholder="Contoh: BCA, Mandiri, BNI"
                                    required
                                />
                                {errors.nama_bank && (
                                    <p className="text-sm text-destructive">{errors.nama_bank}</p>
                                )}
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="atasnama">Atas Nama</Label>
                                <Input
                                    id="atasnama"
                                    value={data.atasnama}
                                    onChange={(e) => setData('atasnama', e.target.value)}
                                    placeholder="Nama pemilik rekening"
                                    required
                                />
                                {errors.atasnama && (
                                    <p className="text-sm text-destructive">{errors.atasnama}</p>
                                )}
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="norek">No. Rekening</Label>
                                <Input
                                    id="norek"
                                    value={data.norek}
                                    onChange={(e) => setData('norek', e.target.value)}
                                    placeholder="Nomor rekening"
                                    required
                                />
                                {errors.norek && (
                                    <p className="text-sm text-destructive">{errors.norek}</p>
                                )}
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="gambar">Logo Bank</Label>
                                <Input
                                    id="gambar"
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                />
                                {errors.gambar && (
                                    <p className="text-sm text-destructive">{errors.gambar}</p>
                                )}
                                {imagePreview && (
                                    <div className="mt-2">
                                        <img
                                            src={imagePreview}
                                            alt="Preview"
                                            className="h-20 w-auto rounded border object-contain"
                                        />
                                    </div>
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
                                    Bank aktif (tampilkan di halaman pembayaran)
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
