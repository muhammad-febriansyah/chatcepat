import { Head, useForm, router } from '@inertiajs/react'
import AdminLayout from '@/layouts/admin/admin-layout'
import { PageHeader } from '@/components/admin/common/page-header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import InputError from '@/components/input-error'
import { FormEventHandler, useState } from 'react'
import { UserCog, Save, X, Upload } from 'lucide-react'
import { User } from '@/types'

interface EditUserProps {
    user: User
}

export default function EditUser({ user }: EditUserProps) {
    const { data, setData, post, processing, errors } = useForm({
        name: user.name || '',
        email: user.email || '',
        password: '',
        password_confirmation: '',
        phone: (user as any).phone || '',
        address: (user as any).address || '',
        role: (user as any).role || 'user',
        avatar: null as File | null,
        _method: 'PUT',
    })

    const [avatarPreview, setAvatarPreview] = useState<string | null>(
        user.avatar ? `/storage/${user.avatar}` : null
    )

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            setData('avatar', file)
            const reader = new FileReader()
            reader.onloadend = () => {
                setAvatarPreview(reader.result as string)
            }
            reader.readAsDataURL(file)
        }
    }

    const handleSubmit: FormEventHandler = (e) => {
        e.preventDefault()

        const formData = new FormData()
        formData.append('_method', 'PUT')
        formData.append('name', data.name)
        formData.append('email', data.email)
        formData.append('phone', data.phone || '')
        formData.append('address', data.address || '')
        formData.append('role', data.role)

        if (data.password) {
            formData.append('password', data.password)
            formData.append('password_confirmation', data.password_confirmation)
        }

        if (data.avatar) {
            formData.append('avatar', data.avatar)
        }

        router.post(`/admin/users/${user.id}`, formData, {
            preserveScroll: true,
        })
    }

    const handleCancel = () => {
        router.visit('/admin/users')
    }

    return (
        <AdminLayout>
            <Head title="Edit Pengguna" />

            <PageHeader title="Edit Pengguna" description="Perbarui informasi pengguna" />

            <form onSubmit={handleSubmit} className="space-y-6">
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                                <UserCog className="size-5 text-primary" strokeWidth={2} />
                            </div>
                            <div>
                                <CardTitle>Informasi Pengguna</CardTitle>
                                <CardDescription>Perbarui detail pengguna</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-5">
                        <div className="space-y-2">
                            <Label htmlFor="name">Nama Lengkap *</Label>
                            <Input
                                id="name"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                placeholder="Masukkan nama lengkap"
                                required
                            />
                            <InputError message={errors.name} />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="avatar">Avatar</Label>
                            <div className="flex items-start gap-6">
                                <div className="relative">
                                    {avatarPreview ? (
                                        <div className="relative group">
                                            <img
                                                src={avatarPreview}
                                                alt="Avatar preview"
                                                className="h-24 w-24 rounded-full object-cover border-4 border-border shadow-sm"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setAvatarPreview(user.avatar ? `/storage/${user.avatar}` : null)
                                                    setData('avatar', null)
                                                }}
                                                className="absolute -top-2 -right-2 h-7 w-7 rounded-full bg-destructive text-destructive-foreground shadow-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <X className="h-4 w-4" />
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="h-24 w-24 rounded-full border-4 border-dashed border-border bg-muted flex items-center justify-center">
                                            <Upload className="h-8 w-8 text-muted-foreground" />
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1 space-y-3">
                                    <label
                                        htmlFor="avatar"
                                        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border-2 border-dashed border-primary/30 bg-primary/5 hover:bg-primary/10 hover:border-primary/50 transition-colors cursor-pointer"
                                    >
                                        <Upload className="h-4 w-4 text-primary" />
                                        <span className="text-sm font-medium text-primary">
                                            {avatarPreview ? 'Ganti Avatar' : 'Pilih Avatar'}
                                        </span>
                                    </label>
                                    <Input
                                        id="avatar"
                                        type="file"
                                        accept="image/*"
                                        onChange={handleAvatarChange}
                                        className="hidden"
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        Format: JPG, PNG, GIF. Maksimal 2MB. Kosongkan jika tidak ingin mengubah avatar.
                                    </p>
                                </div>
                            </div>
                            <InputError message={errors.avatar} />
                        </div>

                        <div className="grid gap-5 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="email">Email *</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    placeholder="user@example.com"
                                    required
                                />
                                <InputError message={errors.email} />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="phone">Nomor Telepon</Label>
                                <Input
                                    id="phone"
                                    type="tel"
                                    value={data.phone}
                                    onChange={(e) => setData('phone', e.target.value)}
                                    placeholder="08123456789"
                                />
                                <InputError message={errors.phone} />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="address">Alamat</Label>
                            <textarea
                                id="address"
                                value={data.address}
                                onChange={(e) => setData('address', e.target.value)}
                                placeholder="Masukkan alamat lengkap"
                                rows={3}
                                className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-base transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                            />
                            <InputError message={errors.address} />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="role">Role *</Label>
                            <Select value={data.role} onValueChange={(value) => setData('role', value)}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="user">User</SelectItem>
                                    <SelectItem value="admin">Admin</SelectItem>
                                </SelectContent>
                            </Select>
                            <InputError message={errors.role} />
                        </div>

                        <div className="rounded-lg border border-muted bg-muted/50 p-4">
                            <p className="text-sm font-medium mb-3">Ubah Password</p>
                            <p className="text-xs text-muted-foreground mb-4">
                                Kosongkan jika tidak ingin mengubah password
                            </p>

                            <div className="grid gap-5 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="password">Password Baru</Label>
                                    <Input
                                        id="password"
                                        type="password"
                                        value={data.password}
                                        onChange={(e) => setData('password', e.target.value)}
                                        placeholder="••••••••"
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        Minimal 8 karakter
                                    </p>
                                    <InputError message={errors.password} />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="password_confirmation">Konfirmasi Password</Label>
                                    <Input
                                        id="password_confirmation"
                                        type="password"
                                        value={data.password_confirmation}
                                        onChange={(e) => setData('password_confirmation', e.target.value)}
                                        placeholder="••••••••"
                                    />
                                    <InputError message={errors.password_confirmation} />
                                </div>
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
