import { Head, router, useForm } from '@inertiajs/react'
import AdminLayout from '@/layouts/admin/admin-layout'
import { PageHeader } from '@/components/admin/common/page-header'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Plus, Brain } from 'lucide-react'
import { AiAssistantType } from '@/types/ai-assistant-type'
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
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'

interface AiAssistantTypesIndexProps {
    aiAssistantTypes: AiAssistantType[]
}

export default function AiAssistantTypesIndex({ aiAssistantTypes }: AiAssistantTypesIndexProps) {
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingType, setEditingType] = useState<AiAssistantType | null>(null)

    const { data, setData, post, put, processing, errors, reset } = useForm({
        code: '',
        name: '',
        description: '',
        system_prompt: '',
        icon: '',
        color: '',
        is_active: true,
        sort_order: 0,
    })

    const handleCreate = () => {
        setEditingType(null)
        reset()
        setIsModalOpen(true)
    }

    const handleEdit = (type: AiAssistantType) => {
        setEditingType(type)
        setData({
            code: type.code,
            name: type.name,
            description: type.description || '',
            system_prompt: type.system_prompt || '',
            icon: type.icon || '',
            color: type.color || '',
            is_active: type.is_active,
            sort_order: type.sort_order,
        })
        setIsModalOpen(true)
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()

        if (editingType) {
            router.put(`/admin/ai-assistant-types/${editingType.id}`, data, {
                onSuccess: () => {
                    setIsModalOpen(false)
                    reset()
                },
            })
        } else {
            router.post('/admin/ai-assistant-types', data, {
                onSuccess: () => {
                    setIsModalOpen(false)
                    reset()
                },
            })
        }
    }

    const columns = getColumns({ onEdit: handleEdit })

    return (
        <AdminLayout>
            <Head title="AI Assistant Types" />

            <PageHeader
                title="AI Assistant Types"
                description="Kelola tipe asisten AI untuk chatbot"
                action={
                    <Button onClick={handleCreate}>
                        <Plus className="h-4 w-4" />
                        Tambah Type
                    </Button>
                }
            />

            <Card>
                <CardContent className="pt-6">
                    <DataTable
                        columns={columns}
                        data={aiAssistantTypes}
                        searchKey="name"
                        searchPlaceholder="Cari nama..."
                    />
                </CardContent>
            </Card>

            <Dialog open={isModalOpen} onOpenChange={(open) => {
                setIsModalOpen(open)
                if (!open) {
                    setEditingType(null)
                    reset()
                }
            }}>
                <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                    <form onSubmit={handleSubmit}>
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                                <Brain className="h-5 w-5" />
                                {editingType ? 'Edit AI Assistant Type' : 'Tambah AI Assistant Type'}
                            </DialogTitle>
                            <DialogDescription>
                                {editingType
                                    ? 'Perbarui informasi AI Assistant Type'
                                    : 'Tambahkan tipe asisten AI baru untuk chatbot'}
                            </DialogDescription>
                        </DialogHeader>

                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="code">Kode</Label>
                                    <Input
                                        id="code"
                                        value={data.code}
                                        onChange={(e) => setData('code', e.target.value.toLowerCase().replace(/[^a-z_]/g, ''))}
                                        placeholder="contoh: sales"
                                        required
                                        readOnly={!!editingType}
                                        className={editingType ? 'bg-muted cursor-not-allowed' : ''}
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        Hanya huruf kecil dan underscore
                                    </p>
                                    {errors.code && (
                                        <p className="text-sm text-destructive">{errors.code}</p>
                                    )}
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="name">Nama</Label>
                                    <Input
                                        id="name"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        placeholder="Contoh: Sales Assistant"
                                        required
                                    />
                                    {errors.name && (
                                        <p className="text-sm text-destructive">{errors.name}</p>
                                    )}
                                </div>
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="description">Deskripsi</Label>
                                <Input
                                    id="description"
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                    placeholder="Deskripsi singkat tentang tipe asisten ini"
                                />
                                {errors.description && (
                                    <p className="text-sm text-destructive">{errors.description}</p>
                                )}
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="system_prompt">System Prompt</Label>
                                <Textarea
                                    id="system_prompt"
                                    value={data.system_prompt}
                                    onChange={(e) => setData('system_prompt', e.target.value)}
                                    placeholder="Instruksi untuk AI tentang bagaimana berperilaku..."
                                    rows={6}
                                />
                                <p className="text-xs text-muted-foreground">
                                    Prompt ini akan digunakan sebagai instruksi dasar untuk AI chatbot
                                </p>
                                {errors.system_prompt && (
                                    <p className="text-sm text-destructive">{errors.system_prompt}</p>
                                )}
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="icon">Icon (Emoji)</Label>
                                    <Input
                                        id="icon"
                                        value={data.icon}
                                        onChange={(e) => setData('icon', e.target.value)}
                                        placeholder="Contoh: "
                                    />
                                    {errors.icon && (
                                        <p className="text-sm text-destructive">{errors.icon}</p>
                                    )}
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="color">Warna</Label>
                                    <Input
                                        id="color"
                                        value={data.color}
                                        onChange={(e) => setData('color', e.target.value)}
                                        placeholder="Contoh: blue"
                                    />
                                    {errors.color && (
                                        <p className="text-sm text-destructive">{errors.color}</p>
                                    )}
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="sort_order">Urutan</Label>
                                    <Input
                                        id="sort_order"
                                        type="number"
                                        min="0"
                                        value={data.sort_order}
                                        onChange={(e) => setData('sort_order', parseInt(e.target.value) || 0)}
                                    />
                                    {errors.sort_order && (
                                        <p className="text-sm text-destructive">{errors.sort_order}</p>
                                    )}
                                </div>
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
                                    Aktif (tampilkan di pilihan AI chatbot)
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
