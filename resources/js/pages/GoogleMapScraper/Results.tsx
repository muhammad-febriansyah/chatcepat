import { PageHeader } from '@/components/admin/common/page-header';
import { LeafletMap } from '@/components/admin/LeafletMap';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { DataTable } from '@/components/ui/data-table';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AdminLayout from '@/layouts/admin/admin-layout';
import { cn } from '@/lib/utils';
import { Head } from '@inertiajs/react';
import {
    Download,
    ExternalLink,
    FileSpreadsheet,
    FileText,
    Globe,
    MapPin,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { columns } from './columns';

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

interface Category {
    id: number;
    name: string;
    slug: string;
    image: string | null;
    image_url: string | null;
    is_active: boolean;
    order: number;
}

interface ResultsPageProps {
    places: {
        data: GoogleMapPlace[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    categories: Category[];
}

export default function ResultsPage({ places, categories }: ResultsPageProps) {
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

    // Force prevent horizontal scroll on body/html
    useEffect(() => {
        document.body.style.overflowX = 'hidden';
        document.documentElement.style.overflowX = 'hidden';

        return () => {
            document.body.style.overflowX = '';
            document.documentElement.style.overflowX = '';
        };
    }, []);

    const toggleCategoryFilter = (categoryName: string) => {
        setSelectedCategories((prev) => {
            if (prev.includes(categoryName)) {
                return prev.filter((c) => c !== categoryName);
            } else {
                return [...prev, categoryName];
            }
        });
    };

    const clearCategoryFilter = () => {
        setSelectedCategories([]);
    };

    const filteredPlaces =
        selectedCategories.length > 0
            ? places.data.filter(
                  (place) =>
                      place.category &&
                      selectedCategories.some((cat) =>
                          place.category
                              ?.toLowerCase()
                              .includes(cat.toLowerCase()),
                      ),
              )
            : places.data;

    const handleExportExcel = () => {
        toast.success('Generating Excel...', {
            description:
                'File Excel sedang dibuat, download akan dimulai sebentar lagi.',
        });
        setTimeout(() => {
            window.location.href = '/admin/google-maps-scraper/export/excel';
        }, 500);
    };

    const handleExportPdf = () => {
        toast.success('Generating PDF...', {
            description:
                'File PDF sedang dibuat, download akan dimulai sebentar lagi.',
        });
        setTimeout(() => {
            window.location.href = '/admin/google-maps-scraper/export/pdf';
        }, 500);
    };

    const handleViewInMaps = () => {
        if (places.data.length === 0) {
            toast.error('Tidak Ada Data', {
                description: 'Belum ada data untuk ditampilkan di Google Maps.',
            });
            return;
        }

        const kecamatanList = [
            ...new Set(places.data.map((p) => `${p.kecamatan}, ${p.location}`)),
        ];

        if (kecamatanList.length === 1) {
            const searchQuery = kecamatanList[0];
            const mapsUrl = `https://www.google.com/maps/search/${encodeURIComponent(searchQuery)}`;
            window.open(mapsUrl, '_blank');
            toast.success('Google Maps Dibuka', {
                description: `Menampilkan hasil untuk ${searchQuery}`,
            });
        } else {
            const firstKecamatan = kecamatanList[0];
            const mapsUrl = `https://www.google.com/maps/search/${encodeURIComponent(firstKecamatan)}`;
            window.open(mapsUrl, '_blank');
            toast.info('Google Maps Dibuka', {
                description: `Menampilkan ${kecamatanList.length} kecamatan. Fokus pada ${firstKecamatan}`,
            });
        }
    };

    return (
        <AdminLayout>
            <Head title="Hasil Scraping Google Maps" />

            <div className="w-full max-w-full overflow-hidden">
                <PageHeader
                    title="Hasil Scraping Google Maps"
                    description="Lihat dan kelola semua hasil scraping dari Google Maps"
                />

                <br />
                {/* Statistics Cards */}
                <div className="mb-6 grid gap-4 md:grid-cols-2">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                {selectedCategories.length > 0
                                    ? 'Tempat Terfilter'
                                    : 'Total Tempat'}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {selectedCategories.length > 0
                                    ? filteredPlaces.length
                                    : places.total}
                            </div>
                            {selectedCategories.length > 0 && (
                                <p className="mt-1 text-xs text-muted-foreground">
                                    dari {places.total} total
                                </p>
                            )}
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                Kecamatan
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {
                                    new Set(
                                        filteredPlaces.map((p) => p.kecamatan),
                                    ).size
                                }
                            </div>
                            {selectedCategories.length > 0 && (
                                <p className="mt-1 text-xs text-muted-foreground">
                                    Filter: {selectedCategories.join(', ')}
                                </p>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Interactive Map */}
                <Card className="mb-6">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="flex items-center gap-2">
                                    <MapPin className="h-5 w-5" />
                                    Peta Interaktif - {places.total} Lokasi
                                </CardTitle>
                                <CardDescription>
                                    Visualisasi semua tempat dengan Leaflet Maps
                                </CardDescription>
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleViewInMaps}
                                >
                                    <ExternalLink className="mr-2 h-4 w-4" />
                                    Google Maps
                                </Button>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <Tabs defaultValue="osm" className="w-full">
                            <TabsList className="mb-4">
                                <TabsTrigger value="osm">
                                    <Globe className="mr-2 h-4 w-4" />
                                    Roadmap
                                </TabsTrigger>
                                <TabsTrigger value="google">
                                    <MapPin className="mr-2 h-4 w-4" />
                                    Satellite
                                </TabsTrigger>
                            </TabsList>

                            <TabsContent value="osm">
                                <div className="relative overflow-hidden rounded-lg border">
                                    <div className="absolute top-4 right-4 z-[1000] w-64">
                                        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-lg">
                                            <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-3 py-2">
                                                <p className="text-xs font-semibold text-slate-700">
                                                    Filter Kategori{' '}
                                                    {selectedCategories.length >
                                                        0 &&
                                                        `(${selectedCategories.length})`}
                                                </p>
                                                {selectedCategories.length >
                                                    0 && (
                                                    <button
                                                        onClick={
                                                            clearCategoryFilter
                                                        }
                                                        className="text-xs font-medium text-primary hover:text-primary/80"
                                                    >
                                                        Reset
                                                    </button>
                                                )}
                                            </div>
                                            <div className="max-h-[300px] overflow-y-auto p-2">
                                                <div className="grid grid-cols-2 gap-2">
                                                    {categories
                                                        .filter(
                                                            (cat) =>
                                                                cat.is_active,
                                                        )
                                                        .slice(0, 12)
                                                        .map((category) => {
                                                            const isSelected =
                                                                selectedCategories.includes(
                                                                    category.name,
                                                                );
                                                            return (
                                                                <button
                                                                    key={
                                                                        category.id
                                                                    }
                                                                    onClick={() =>
                                                                        toggleCategoryFilter(
                                                                            category.name,
                                                                        )
                                                                    }
                                                                    className={cn(
                                                                        'flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 transition-all',
                                                                        isSelected
                                                                            ? 'bg-primary text-primary-foreground shadow-sm ring-2 ring-primary/20'
                                                                            : 'bg-slate-50 hover:bg-slate-100',
                                                                    )}
                                                                    title={
                                                                        category.name
                                                                    }
                                                                >
                                                                    {category.image_url ? (
                                                                        <img
                                                                            src={
                                                                                category.image_url
                                                                            }
                                                                            alt={
                                                                                category.name
                                                                            }
                                                                            className={cn(
                                                                                'h-5 w-5 flex-shrink-0 object-contain',
                                                                                isSelected &&
                                                                                    'brightness-0 invert',
                                                                            )}
                                                                        />
                                                                    ) : (
                                                                        <div
                                                                            className={cn(
                                                                                'flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full',
                                                                                isSelected
                                                                                    ? 'bg-white/20'
                                                                                    : 'bg-primary/20',
                                                                            )}
                                                                        >
                                                                            <MapPin
                                                                                className={cn(
                                                                                    'h-3 w-3',
                                                                                    isSelected
                                                                                        ? 'text-white'
                                                                                        : 'text-primary',
                                                                                )}
                                                                            />
                                                                        </div>
                                                                    )}
                                                                    <span
                                                                        className={cn(
                                                                            'truncate text-xs font-medium',
                                                                            isSelected
                                                                                ? 'text-primary-foreground'
                                                                                : 'text-slate-700',
                                                                        )}
                                                                    >
                                                                        {
                                                                            category.name
                                                                        }
                                                                    </span>
                                                                </button>
                                                            );
                                                        })}
                                                </div>
                                                {categories.filter(
                                                    (cat) => cat.is_active,
                                                ).length > 12 && (
                                                    <p className="mt-2 text-center text-xs text-slate-500">
                                                        +
                                                        {categories.filter(
                                                            (cat) =>
                                                                cat.is_active,
                                                        ).length - 12}{' '}
                                                        kategori lainnya
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <LeafletMap
                                        places={filteredPlaces}
                                        categories={categories}
                                        height="600px"
                                        mapType="roadmap"
                                    />
                                </div>
                                <p className="mt-4 text-sm text-muted-foreground">
                                    Menggunakan{' '}
                                    <strong>Google Maps Roadmap</strong> - Peta
                                    jalan standar
                                    {selectedCategories.length > 0 && (
                                        <span className="ml-2 text-primary">
                                            • Filter aktif:{' '}
                                            {selectedCategories.join(', ')}
                                        </span>
                                    )}
                                </p>
                            </TabsContent>

                            <TabsContent value="google">
                                <div className="relative overflow-hidden rounded-lg border">
                                    <div className="absolute top-4 right-4 z-[1000] w-64">
                                        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-lg">
                                            <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-3 py-2">
                                                <p className="text-xs font-semibold text-slate-700">
                                                    Filter Kategori{' '}
                                                    {selectedCategories.length >
                                                        0 &&
                                                        `(${selectedCategories.length})`}
                                                </p>
                                                {selectedCategories.length >
                                                    0 && (
                                                    <button
                                                        onClick={
                                                            clearCategoryFilter
                                                        }
                                                        className="text-xs font-medium text-primary hover:text-primary/80"
                                                    >
                                                        Reset
                                                    </button>
                                                )}
                                            </div>
                                            <div className="max-h-[300px] overflow-y-auto p-2">
                                                <div className="grid grid-cols-2 gap-2">
                                                    {categories
                                                        .filter(
                                                            (cat) =>
                                                                cat.is_active,
                                                        )
                                                        .slice(0, 12)
                                                        .map((category) => {
                                                            const isSelected =
                                                                selectedCategories.includes(
                                                                    category.name,
                                                                );
                                                            return (
                                                                <button
                                                                    key={
                                                                        category.id
                                                                    }
                                                                    onClick={() =>
                                                                        toggleCategoryFilter(
                                                                            category.name,
                                                                        )
                                                                    }
                                                                    className={cn(
                                                                        'flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 transition-all',
                                                                        isSelected
                                                                            ? 'bg-primary text-primary-foreground shadow-sm ring-2 ring-primary/20'
                                                                            : 'bg-slate-50 hover:bg-slate-100',
                                                                    )}
                                                                    title={
                                                                        category.name
                                                                    }
                                                                >
                                                                    {category.image_url ? (
                                                                        <img
                                                                            src={
                                                                                category.image_url
                                                                            }
                                                                            alt={
                                                                                category.name
                                                                            }
                                                                            className={cn(
                                                                                'h-5 w-5 flex-shrink-0 object-contain',
                                                                                isSelected &&
                                                                                    'brightness-0 invert',
                                                                            )}
                                                                        />
                                                                    ) : (
                                                                        <div
                                                                            className={cn(
                                                                                'flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full',
                                                                                isSelected
                                                                                    ? 'bg-white/20'
                                                                                    : 'bg-primary/20',
                                                                            )}
                                                                        >
                                                                            <MapPin
                                                                                className={cn(
                                                                                    'h-3 w-3',
                                                                                    isSelected
                                                                                        ? 'text-white'
                                                                                        : 'text-primary',
                                                                                )}
                                                                            />
                                                                        </div>
                                                                    )}
                                                                    <span
                                                                        className={cn(
                                                                            'truncate text-xs font-medium',
                                                                            isSelected
                                                                                ? 'text-primary-foreground'
                                                                                : 'text-slate-700',
                                                                        )}
                                                                    >
                                                                        {
                                                                            category.name
                                                                        }
                                                                    </span>
                                                                </button>
                                                            );
                                                        })}
                                                </div>
                                                {categories.filter(
                                                    (cat) => cat.is_active,
                                                ).length > 12 && (
                                                    <p className="mt-2 text-center text-xs text-slate-500">
                                                        +
                                                        {categories.filter(
                                                            (cat) =>
                                                                cat.is_active,
                                                        ).length - 12}{' '}
                                                        kategori lainnya
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <LeafletMap
                                        places={filteredPlaces}
                                        categories={categories}
                                        height="600px"
                                        mapType="satellite"
                                    />
                                </div>
                                <p className="mt-4 text-sm text-muted-foreground">
                                    Menggunakan{' '}
                                    <strong>Google Satellite</strong> - View
                                    satelit
                                    {selectedCategories.length > 0 && (
                                        <span className="ml-2 text-primary">
                                            • Filter aktif:{' '}
                                            {selectedCategories.join(', ')}
                                        </span>
                                    )}
                                </p>
                            </TabsContent>
                        </Tabs>
                    </CardContent>
                </Card>

                {/* Data Table */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle>
                                    Data Lengkap ({places.total})
                                </CardTitle>
                                <CardDescription>
                                    Semua data hasil scraping dalam format tabel
                                </CardDescription>
                            </div>
                            {places.total > 0 && (
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="outline">
                                            <Download className="mr-2 h-4 w-4" />
                                            Export Data
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem
                                            onClick={handleExportExcel}
                                        >
                                            <FileSpreadsheet className="mr-2 h-4 w-4" />
                                            Export Excel
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                            onClick={handleExportPdf}
                                        >
                                            <FileText className="mr-2 h-4 w-4" />
                                            Export PDF
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            )}
                        </div>
                    </CardHeader>
                    <CardContent>
                        <DataTable
                            columns={columns}
                            data={places.data}
                            searchKey="name"
                            searchPlaceholder="Cari nama tempat..."
                        />
                    </CardContent>
                </Card>
            </div>
        </AdminLayout>
    );
}
