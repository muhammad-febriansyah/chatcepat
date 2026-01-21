import { Head, Link, router } from '@inertiajs/react';
import { ColumnDef } from '@tanstack/react-table';
import UserLayout from '@/layouts/user/user-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DataTable } from '@/components/ui/data-table';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
    Plus,
    MoreHorizontal,
    Edit,
    Trash2,
    Copy,
    Eye,
    Package,
    Tag,
    Image as ImageIcon,
} from 'lucide-react';

interface Product {
    id: number;
    name: string;
    code: string | null;
    price: number;
    sale_price: number | null;
    description: string | null;
    short_description: string | null;
    image_url: string | null;
    category: string | null;
    is_active: boolean;
    stock: number | null;
    created_at: string;
}

interface ProductsPageProps {
    products: Product[];
    categories: string[];
    filters: {
        category?: string;
        status?: string;
        search?: string;
    };
}

const formatPrice = (price: number): string => {
    return 'Rp ' + new Intl.NumberFormat('id-ID').format(price);
};

export default function ProductsIndex({ products, categories, filters }: ProductsPageProps) {
    const handleDelete = (productId: number) => {
        router.delete(`/user/products/${productId}`);
    };

    const handleToggleStatus = (productId: number) => {
        router.post(`/user/products/${productId}/toggle-status`);
    };

    const handleDuplicate = (productId: number) => {
        router.post(`/user/products/${productId}/duplicate`);
    };

    const columns: ColumnDef<Product>[] = [
        {
            accessorKey: 'image_url',
            header: '',
            cell: ({ row }) => (
                <div className="w-12 h-12 rounded-lg overflow-hidden bg-muted flex items-center justify-center">
                    {row.original.image_url ? (
                        <img
                            src={row.original.image_url}
                            alt={row.original.name}
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <Package className="size-6 text-muted-foreground" />
                    )}
                </div>
            ),
        },
        {
            accessorKey: 'name',
            header: 'Produk',
            cell: ({ row }) => (
                <div>
                    <div className="font-medium">{row.original.name}</div>
                    {row.original.code && (
                        <div className="text-xs text-muted-foreground">
                            SKU: {row.original.code}
                        </div>
                    )}
                </div>
            ),
        },
        {
            accessorKey: 'category',
            header: 'Kategori',
            cell: ({ row }) => (
                row.original.category ? (
                    <Badge variant="outline">
                        <Tag className="size-3 mr-1" />
                        {row.original.category}
                    </Badge>
                ) : (
                    <span className="text-muted-foreground">-</span>
                )
            ),
        },
        {
            accessorKey: 'price',
            header: 'Harga',
            cell: ({ row }) => (
                <div>
                    {row.original.sale_price ? (
                        <>
                            <div className="text-sm line-through text-muted-foreground">
                                {formatPrice(row.original.price)}
                            </div>
                            <div className="font-semibold text-green-600">
                                {formatPrice(row.original.sale_price)}
                            </div>
                        </>
                    ) : (
                        <div className="font-semibold">
                            {formatPrice(row.original.price)}
                        </div>
                    )}
                </div>
            ),
        },
        {
            accessorKey: 'stock',
            header: 'Stok',
            cell: ({ row }) => (
                row.original.stock !== null ? (
                    <Badge variant={row.original.stock > 0 ? 'default' : 'destructive'}>
                        {row.original.stock}
                    </Badge>
                ) : (
                    <span className="text-muted-foreground">-</span>
                )
            ),
        },
        {
            accessorKey: 'is_active',
            header: 'Status',
            cell: ({ row }) => (
                <Badge
                    variant={row.original.is_active ? 'default' : 'secondary'}
                    className="cursor-pointer"
                    onClick={() => handleToggleStatus(row.original.id)}
                >
                    {row.original.is_active ? 'Aktif' : 'Nonaktif'}
                </Badge>
            ),
        },
        {
            id: 'actions',
            cell: ({ row }) => (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                            <MoreHorizontal className="size-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => router.visit(`/user/products/${row.original.id}/edit`)}>
                            <Edit className="size-4 mr-2" />
                            Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDuplicate(row.original.id)}>
                            <Copy className="size-4 mr-2" />
                            Duplikasi
                        </DropdownMenuItem>
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <DropdownMenuItem
                                    onSelect={(e) => e.preventDefault()}
                                    className="text-destructive focus:text-destructive"
                                >
                                    <Trash2 className="size-4 mr-2" />
                                    Hapus
                                </DropdownMenuItem>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Hapus Produk?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        Produk "{row.original.name}" akan dihapus. Tindakan ini tidak dapat dibatalkan.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Batal</AlertDialogCancel>
                                    <AlertDialogAction
                                        onClick={() => handleDelete(row.original.id)}
                                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                    >
                                        Hapus
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </DropdownMenuContent>
                </DropdownMenu>
            ),
        },
    ];

    return (
        <UserLayout>
            <Head title="Produk" />

            <div className="space-y-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                            <div className="p-1.5 rounded-lg bg-purple-100">
                                <Package className="size-5 text-purple-600" />
                            </div>
                            Katalog Produk
                        </h1>
                        <p className="text-muted-foreground text-sm mt-1">
                            Kelola produk untuk template pesan auto-reply
                        </p>
                    </div>
                    <Link href="/user/products/create">
                        <Button>
                            <Plus className="mr-2 size-4" />
                            Tambah Produk
                        </Button>
                    </Link>
                </div>

                {/* Stats */}
                <div className="grid gap-3 md:grid-cols-4">
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-blue-100">
                                    <Package className="size-5 text-blue-600" />
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground">Total Produk</p>
                                    <p className="text-xl font-bold">{products.length}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-green-100">
                                    <Eye className="size-5 text-green-600" />
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground">Produk Aktif</p>
                                    <p className="text-xl font-bold">
                                        {products.filter(p => p.is_active).length}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-purple-100">
                                    <Tag className="size-5 text-purple-600" />
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground">Kategori</p>
                                    <p className="text-xl font-bold">{categories.length}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-orange-100">
                                    <ImageIcon className="size-5 text-orange-600" />
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground">Dengan Gambar</p>
                                    <p className="text-xl font-bold">
                                        {products.filter(p => p.image_url).length}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Data Table */}
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base">Daftar Produk</CardTitle>
                        <CardDescription className="text-xs">
                            Produk yang tersimpan dapat digunakan untuk template auto-reply
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <DataTable
                            columns={columns}
                            data={products}
                            searchKey="name"
                            searchPlaceholder="Cari produk..."
                        />
                    </CardContent>
                </Card>
            </div>
        </UserLayout>
    );
}
