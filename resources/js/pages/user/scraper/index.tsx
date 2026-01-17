import { Head, Link, router } from '@inertiajs/react';
import UserLayout from '@/layouts/user/user-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, MapPin, Trash2, FileSpreadsheet, FileText, Map, Database, FolderOpen, TrendingUp } from 'lucide-react';
import { DataTable } from '@/components/ui/data-table';
import { columns } from './columns';
import { toast, Toaster } from 'sonner';

interface Category {
    id: number;
    name: string;
    slug: string;
    image: string | null;
    image_url: string | null;
    is_active: boolean;
    order: number;
}

interface GoogleMapPlace {
    id: number;
    name: string;
    kecamatan: string;
    location: string;
    category: string | null;
    rating: number | null;
    review_count: number | null;
    address: string | null;
    phone: string | null;
    website: string | null;
    url: string | null;
    scraped_at: string | null;
    created_at: string;
}

interface ScraperIndexProps {
    places: GoogleMapPlace[];
    categories: Category[];
    stats: {
        total_places: number;
        total_categories: number;
    };
}

export default function ScraperIndex({ places, categories, stats }: ScraperIndexProps) {
    const handleDeleteAll = () => {
        if (confirm('Apakah Anda yakin ingin menghapus SEMUA hasil scraping?')) {
            router.delete('/user/scraper', {
                onSuccess: () => {
                    toast.success('Berhasil!', {
                        description: 'Semua data scraping telah dihapus',
                    });
                },
                onError: () => {
                    toast.error('Gagal menghapus data');
                },
            });
        }
    };

    return (
        <UserLayout>
            <Head title="Scraping Management" />
            <Toaster position="top-right" richColors />

            <div className="space-y-8">
                {/* Header */}
                <div className="relative overflow-hidden rounded-2xl bg-primary p-8 shadow-lg">
                    <div className="relative flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20">
                                <Database className="h-8 w-8 text-white" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold text-white">Scraping Management</h1>
                                <p className="mt-1 text-white/90">
                                    Kelola dan analisis hasil scraping Google Maps Anda
                                </p>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <Link href="/user/scraper/maps">
                                <Button
                                    variant="secondary"
                                    size="lg"
                                    className="bg-white/20 text-white border-white/30 hover:bg-white/30"
                                >
                                    <Map className="mr-2 h-5 w-5" />
                                    Lihat Peta
                                </Button>
                            </Link>
                            <Link href="/user/scraper/create">
                                <Button
                                    size="lg"
                                    className="bg-white text-primary hover:bg-white/90 shadow-lg"
                                >
                                    <Plus className="mr-2 h-5 w-5" />
                                    Scraping Baru
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid gap-6 md:grid-cols-2">
                    <Card className="border-l-4 border-l-primary">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <div className="space-y-1">
                                <CardTitle className="text-sm font-medium text-muted-foreground">
                                    Total Tempat
                                </CardTitle>
                                <div className="text-3xl font-bold">{stats.total_places}</div>
                            </div>
                            <div className="rounded-xl bg-primary/10 p-3">
                                <MapPin className="size-6 text-primary" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground">
                                Lokasi tersimpan
                            </p>
                        </CardContent>
                    </Card>
                    <Card className="border-l-4 border-l-orange-500">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <div className="space-y-1">
                                <CardTitle className="text-sm font-medium text-muted-foreground">
                                    Total Kategori
                                </CardTitle>
                                <div className="text-3xl font-bold">{stats.total_categories}</div>
                            </div>
                            <div className="rounded-xl bg-orange-50 p-3">
                                <FolderOpen className="size-6 text-orange-600" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground">
                                Kategori berbeda
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Export & Delete Actions */}
                {places.length > 0 && (
                    <Card className="border-2 border-dashed shadow-sm">
                        <CardHeader className="bg-slate-50">
                            <div className="flex items-center gap-2">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                                    <TrendingUp className="h-5 w-5 text-primary" />
                                </div>
                                <div>
                                    <CardTitle className="text-lg">Aksi Cepat</CardTitle>
                                    <CardDescription>Export atau kelola data scraping Anda</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="flex flex-wrap gap-3 pt-6">
                            <Link href="/user/scraper/export/excel">
                                <Button variant="outline" size="lg" className="gap-2">
                                    <FileSpreadsheet className="h-5 w-5 text-green-600" />
                                    Export Excel
                                </Button>
                            </Link>
                            <Link href="/user/scraper/export/pdf">
                                <Button variant="outline" size="lg" className="gap-2">
                                    <FileText className="h-5 w-5 text-red-600" />
                                    Export PDF
                                </Button>
                            </Link>
                            <Button variant="destructive" size="lg" onClick={handleDeleteAll} className="gap-2">
                                <Trash2 className="h-5 w-5" />
                                Hapus Semua
                            </Button>
                        </CardContent>
                    </Card>
                )}

                {/* Places List */}
                {places.length > 0 ? (
                    <Card className="shadow-lg border-2">
                        <CardHeader className="border-b bg-slate-50">
                            <div className="flex items-center gap-3">
                                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                                    <Database className="h-6 w-6 text-primary" />
                                </div>
                                <div>
                                    <CardTitle className="text-xl">Hasil Scraping</CardTitle>
                                    <CardDescription className="mt-1">
                                        Menampilkan {places.length} tempat dari database
                                    </CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <DataTable
                                columns={columns}
                                data={places}
                                searchKey="name"
                                searchPlaceholder="Cari nama tempat..."
                            />
                        </CardContent>
                    </Card>
                ) : (
                    <Card className="border-2 border-dashed shadow-sm">
                        <CardContent className="flex flex-col items-center justify-center py-20">
                            <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-primary/10">
                                <MapPin className="h-12 w-12 text-primary" />
                            </div>
                            <h3 className="text-2xl font-bold mb-3">Belum Ada Hasil Scraping</h3>
                            <p className="text-muted-foreground text-center mb-8 max-w-md">
                                Mulai dengan melakukan scraping Google Maps untuk mengumpulkan data lokasi bisnis dan tempat menarik
                            </p>
                            <Link href="/user/scraper/create">
                                <Button size="lg" className="gap-2 shadow-lg">
                                    <Plus className="h-5 w-5" />
                                    Mulai Scraping Sekarang
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>
                )}
            </div>
        </UserLayout>
    );
}
