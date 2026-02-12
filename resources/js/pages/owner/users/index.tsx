import { Head, router } from '@inertiajs/react'
import OwnerLayout from '@/layouts/owner/owner-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Users, Search, RefreshCw, UserCheck, UserPlus, Eye } from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/lib/utils'

interface User {
    id: number
    name: string
    email: string
    role: string
    avatar?: string
    business_name?: string
    created_at: string
    subscription_expires_at?: string
}

interface UsersIndexProps {
    users: {
        data: User[]
        current_page: number
        last_page: number
        per_page: number
        total: number
        from: number
        to: number
    }
    stats: {
        total: number
        active: number
        new_this_month: number
    }
    filters: {
        search: string
        status: string
    }
}

const filterTabs = [
    { value: 'all', label: 'Semua' },
    { value: 'active', label: 'Aktif 7 Hari' },
    { value: 'new', label: 'Baru 30 Hari' },
]

export default function OwnerUsersIndex({ users, stats, filters }: UsersIndexProps) {
    const [search, setSearch] = useState(filters.search || '')

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault()
        router.get('/owner/users', {
            search,
            status: filters.status,
        }, {
            preserveState: true,
            preserveScroll: true,
        })
    }

    const handleStatusFilter = (status: string) => {
        router.get('/owner/users', {
            search: filters.search,
            status,
        }, {
            preserveState: true,
            preserveScroll: true,
        })
    }

    const handlePageChange = (page: number) => {
        router.get('/owner/users', {
            search: filters.search,
            status: filters.status,
            page,
        }, {
            preserveState: true,
            preserveScroll: true,
        })
    }

    const getInitials = (name: string) => {
        return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
    }

    const isSubscriptionActive = (expiresAt?: string) => {
        if (!expiresAt) return false
        return new Date(expiresAt) > new Date()
    }

    return (
        <OwnerLayout>
            <Head title="Laporan Pengguna" />

            {/* Header */}
            <div className="rounded-2xl border bg-gradient-to-r from-primary to-primary/80 p-6 md:p-8 text-primary-foreground shadow-lg">
                <div className="flex items-center gap-4">
                    <div className="h-14 w-14 rounded-xl bg-white/20 flex items-center justify-center">
                        <Users className="h-7 w-7" />
                    </div>
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold">Pengguna</h1>
                        <p className="text-primary-foreground/80 mt-1">
                            {users.total} pengguna terdaftar
                        </p>
                    </div>
                </div>
            </div>

            {/* Stat Cards */}
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
                <Card className="border-l-4 border-l-blue-500 hover:shadow-md transition-shadow">
                    <CardContent className="p-5">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground font-medium">Total Pengguna</p>
                                <p className="text-3xl font-bold mt-1">{stats.total}</p>
                            </div>
                            <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                                <Users className="h-6 w-6 text-blue-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-l-4 border-l-green-500 hover:shadow-md transition-shadow">
                    <CardContent className="p-5">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground font-medium">Aktif 7 Hari</p>
                                <p className="text-3xl font-bold mt-1 text-green-600">{stats.active}</p>
                            </div>
                            <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                                <UserCheck className="h-6 w-6 text-green-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-l-4 border-l-purple-500 hover:shadow-md transition-shadow">
                    <CardContent className="p-5">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground font-medium">Baru 30 Hari</p>
                                <p className="text-3xl font-bold mt-1 text-purple-600">{stats.new_this_month}</p>
                            </div>
                            <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center">
                                <UserPlus className="h-6 w-6 text-purple-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Filters & Search */}
            <Card>
                <CardContent className="p-4">
                    <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
                        {/* Filter Tabs */}
                        <div className="flex flex-wrap gap-2">
                            {filterTabs.map((tab) => {
                                const isActive = (filters.status || 'all') === tab.value
                                return (
                                    <Button
                                        key={tab.value}
                                        variant={isActive ? 'default' : 'outline'}
                                        size="sm"
                                        onClick={() => handleStatusFilter(tab.value)}
                                        className={cn('gap-2', isActive && 'shadow-md')}
                                    >
                                        {tab.label}
                                    </Button>
                                )
                            })}
                        </div>

                        {/* Search */}
                        <div className="flex gap-2 w-full lg:w-auto">
                            <form onSubmit={handleSearch} className="flex-1 lg:w-80">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Cari nama atau email..."
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        className="pl-9"
                                    />
                                </div>
                            </form>
                            <Button variant="outline" size="icon" onClick={() => router.reload()}>
                                <RefreshCw className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Users Table */}
            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="text-lg">Daftar Pengguna</CardTitle>
                    <CardDescription>
                        Menampilkan {users.from ?? 0}–{users.to ?? 0} dari {users.total} pengguna
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="rounded-lg border overflow-hidden">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-muted/50">
                                    <TableHead className="font-semibold">Pengguna</TableHead>
                                    <TableHead className="font-semibold">Bisnis</TableHead>
                                    <TableHead className="font-semibold">Role</TableHead>
                                    <TableHead className="font-semibold">Bergabung</TableHead>
                                    <TableHead className="font-semibold">Status Langganan</TableHead>
                                    <TableHead className="w-[50px]"></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {users.data.length > 0 ? (
                                    users.data.map((user) => {
                                        const subscribed = isSubscriptionActive(user.subscription_expires_at)

                                        return (
                                            <TableRow
                                                key={user.id}
                                                className="hover:bg-muted/50 cursor-pointer"
                                                onClick={() => router.visit(`/owner/users/${user.id}`)}
                                            >
                                                <TableCell>
                                                    <div className="flex items-center gap-3">
                                                        <Avatar className="h-9 w-9">
                                                            {user.avatar && (
                                                                <AvatarImage src={`/storage/${user.avatar}`} alt={user.name} />
                                                            )}
                                                            <AvatarFallback className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground text-sm font-semibold">
                                                                {getInitials(user.name)}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        <div>
                                                            <p className="font-medium">{user.name}</p>
                                                            <p className="text-xs text-muted-foreground">{user.email}</p>
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-muted-foreground">
                                                    {user.business_name || '-'}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="outline" className="capitalize">
                                                        {user.role}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-muted-foreground text-sm">
                                                    {new Date(user.created_at).toLocaleDateString('id-ID')}
                                                </TableCell>
                                                <TableCell>
                                                    {subscribed ? (
                                                        <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
                                                            Aktif s/d {new Date(user.subscription_expires_at!).toLocaleDateString('id-ID')}
                                                        </Badge>
                                                    ) : (
                                                        <Badge variant="secondary" className="text-muted-foreground">
                                                            Tidak aktif
                                                        </Badge>
                                                    )}
                                                </TableCell>
                                                <TableCell onClick={(e) => e.stopPropagation()}>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 text-muted-foreground hover:text-foreground"
                                                        onClick={() => router.visit(`/owner/users/${user.id}`)}
                                                    >
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        )
                                    })
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                                            Tidak ada pengguna ditemukan
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    {/* Pagination */}
                    {users.last_page > 1 && (
                        <div className="flex items-center justify-between mt-4">
                            <p className="text-sm text-muted-foreground">
                                Halaman {users.current_page} dari {users.last_page}
                            </p>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={users.current_page === 1}
                                    onClick={() => handlePageChange(users.current_page - 1)}
                                >
                                    Sebelumnya
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={users.current_page === users.last_page}
                                    onClick={() => handlePageChange(users.current_page + 1)}
                                >
                                    Berikutnya
                                </Button>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </OwnerLayout>
    )
}
