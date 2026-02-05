import { useState, useEffect } from 'react'
import { logger } from '@/utils/logger';
import axios from 'axios'
import { Head, router } from '@inertiajs/react'
import { LeafletMap } from '@/components/admin/LeafletMap'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { MapPin, X, Search, Loader2, Download, Map, Satellite, Layers } from 'lucide-react'
import { DataTable } from '@/components/ui/data-table'
import { columns } from './columns'
import { cn } from '@/lib/utils'
import { toast, Toaster } from 'sonner'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'

interface GoogleMapPlace {
    id: number
    name: string
    kecamatan: string
    location: string
    category: string | null
    rating: number | null
    review_count: number | null
    address: string | null
    phone: string | null
    website: string | null
    url: string | null
}

interface Category {
    id: number
    name: string
    slug: string
    image: string | null
    image_url: string | null
    is_active: boolean
    order: number
}

interface ScraperCreateProps {
    places: GoogleMapPlace[]
    categories: Category[]
}

type MapType = 'roadmap' | 'satellite' | 'hybrid' | 'terrain'

export default function ScraperCreate({ places: initialPlaces, categories }: ScraperCreateProps) {
    const [places, setPlaces] = useState<GoogleMapPlace[]>(initialPlaces)
    const [isLoading, setIsLoading] = useState(false)
    const [showResultsModal, setShowResultsModal] = useState(false)
    const [scrapedResults, setScrapedResults] = useState<GoogleMapPlace[]>([])
    const [mapType, setMapType] = useState<MapType>('roadmap')
    const [selectedCategories, setSelectedCategories] = useState<string[]>([])
    const [formData, setFormData] = useState({
        category_id: '',
        location: '',
        kecamatan: '',
        max_results: 20,
    })

    const mapTypes = [
        { id: 'roadmap', label: 'Peta', icon: Map },
        { id: 'satellite', label: 'Satelit', icon: Satellite },
        { id: 'hybrid', label: 'Hybrid', icon: Layers },
        { id: 'terrain', label: 'Medan', icon: Map },
    ] as const

    const handleClose = () => {
        router.visit('/user/scraper')
    }

    const toggleCategoryFilter = (categoryName: string) => {
        setSelectedCategories(prev => {
            if (prev.includes(categoryName)) {
                return prev.filter(c => c !== categoryName)
            } else {
                return [...prev, categoryName]
            }
        })
    }

    const clearCategoryFilter = () => {
        setSelectedCategories([])
    }

    // Filter places based on selected categories
    const filteredPlaces = selectedCategories.length > 0
        ? places.filter(place =>
            place.category && selectedCategories.some(cat =>
                place.category?.toLowerCase().includes(cat.toLowerCase())
            )
        )
        : places

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)

        try {
            // Axios automatically handles XSRF-TOKEN cookie for CSRF protection
            const response = await axios.post('/user/scraper/scrape', formData)
            const result = response.data

            logger.log('Scraping response:', result)

            if (result.status === 'success' || result.success) {
                logger.log('✅ Scraping job queued successfully!')

                // Show success notification for async job
                toast.success('Pencarian dimulai', {
                    description: result.message || 'Proses sedang berjalan di background.',
                    duration: 5000,
                })

                // Reset selection
                setFormData(prev => ({
                    ...prev,
                    kecamatan: '',
                }))
            } else {
                logger.error('❌ Scraping failed:', result.message)
                toast.error('Scraping Gagal', {
                    description: result.message || 'Terjadi kesalahan saat memulai scraping',
                })
            }
        } catch (error: any) {
            logger.error('Scraping error:', error)
            toast.error('Terjadi Kesalahan', {
                description: error.message,
            })
        } finally {
            setIsLoading(false)
        }
    }

    // Check for post-reload notification
    useEffect(() => {
        const scrapingSuccess = localStorage.getItem('scraping_success')
        if (scrapingSuccess) {
            const data = JSON.parse(scrapingSuccess)

            toast.success('Data Berhasil Dimuat!', {
                description: `${data.count} tempat telah ditambahkan ke peta`,
                duration: 5000,
            })

            // Clear the flag
            localStorage.removeItem('scraping_success')
        }
    }, [])

    const handleExportExcel = () => {
        window.location.href = '/user/scraper/export/excel'
    }

    const handleExportPdf = () => {
        window.location.href = '/user/scraper/export/pdf'
    }

    const handleLocationSelect = (kecamatan: string, kota: string, lat: number, lng: number) => {
        setFormData(prev => ({
            ...prev,
            kecamatan: kecamatan,
            location: kota,
        }))

        toast.success('Lokasi Dipilih!', {
            description: `${kecamatan}, ${kota}`,
            duration: 3000,
        })
    }

    return (
        <>
            <Head title="Interactive Maps Scraper" />
            <Toaster position="top-right" richColors />
            <div className="min-h-screen w-full flex flex-col md:flex-row bg-slate-50">
                {/* Sidebar Form */}
                <div className="w-full md:w-96 bg-white shadow-lg overflow-y-auto max-h-screen">
                    <div className="p-6">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-2">
                                <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                                    <MapPin className="h-6 w-6 text-primary-foreground" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold text-slate-900">Maps Scraper</h2>
                                    <p className="text-xs text-slate-500">Google Maps Data</p>
                                </div>
                            </div>
                            <Button variant="ghost" size="icon" onClick={handleClose} className="hover:bg-slate-100">
                                <X className="h-5 w-5" />
                            </Button>
                        </div>

                        {/* Stats Card */}
                        <div className="bg-gradient-to-br from-primary to-primary/80 rounded-xl p-6 mb-6 text-white shadow-md">
                            <div className="flex items-center justify-between mb-2">
                                <p className="text-sm opacity-90">
                                    {selectedCategories.length > 0 ? 'Lokasi Terfilter' : 'Total Lokasi'}
                                </p>
                                <MapPin className="h-5 w-5 opacity-80" />
                            </div>
                            <div className="text-4xl font-bold mb-1">
                                {selectedCategories.length > 0 ? filteredPlaces.length : places.length}
                            </div>
                            {selectedCategories.length > 0 && (
                                <p className="text-xs opacity-75 mb-3">dari {places.length} total lokasi</p>
                            )}
                            <div className={selectedCategories.length > 0 ? "" : "mt-3"}></div>
                            <div className="flex gap-2">
                                <Button
                                    variant="secondary"
                                    size="sm"
                                    className="flex-1 bg-white/20 hover:bg-white/30 text-white border-0"
                                    onClick={handleExportExcel}
                                    disabled={places.length === 0}
                                >
                                    <Download className="mr-2 h-4 w-4" />
                                    Excel
                                </Button>
                                <Button
                                    variant="secondary"
                                    size="sm"
                                    className="flex-1 bg-white/20 hover:bg-white/30 text-white border-0"
                                    onClick={handleExportPdf}
                                    disabled={places.length === 0}
                                >
                                    <Download className="mr-2 h-4 w-4" />
                                    PDF
                                </Button>
                            </div>
                        </div>

                        {/* Scraping Form */}
                        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                            <div className="bg-slate-50 px-4 py-3 border-b border-slate-200">
                                <h3 className="font-semibold text-slate-900">Form Scraping</h3>
                                <p className="text-xs text-slate-500 mt-0.5">
                                    💡 Klik peta untuk auto-fill kecamatan & kota
                                </p>
                            </div>
                            <div className="p-4">
                                <form onSubmit={handleSubmit} className="space-y-3.5">
                                    <div className="space-y-1.5">
                                        <Label htmlFor="category_id" className="text-sm font-medium text-slate-700">
                                            Kategori
                                        </Label>
                                        <Select
                                            value={formData.category_id}
                                            onValueChange={(value) =>
                                                setFormData({ ...formData, category_id: value })
                                            }
                                            disabled={isLoading}
                                        >
                                            <SelectTrigger className="border-slate-300 focus:border-primary">
                                                <SelectValue placeholder="Pilih kategori..." />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {categories.map((category) => (
                                                    <SelectItem key={category.id} value={category.id.toString()}>
                                                        <div className="flex items-center gap-2">
                                                            {category.image_url && (
                                                                <img
                                                                    src={category.image_url}
                                                                    alt={category.name}
                                                                    className="w-4 h-4 object-contain"
                                                                />
                                                            )}
                                                            <span>{category.name}</span>
                                                        </div>
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-1.5">
                                        <Label htmlFor="kecamatan" className="text-sm font-medium text-slate-700">
                                            Kecamatan
                                        </Label>
                                        <Input
                                            id="kecamatan"
                                            placeholder="Masukkan nama kecamatan"
                                            value={formData.kecamatan}
                                            onChange={(e) =>
                                                setFormData({ ...formData, kecamatan: e.target.value })
                                            }
                                            required
                                            disabled={isLoading}
                                            className="border-slate-300 focus:border-primary"
                                        />
                                    </div>

                                    <div className="space-y-1.5">
                                        <Label htmlFor="location" className="text-sm font-medium text-slate-700">
                                            Kota/Kabupaten
                                        </Label>
                                        <Input
                                            id="location"
                                            placeholder="Masukkan nama kota/kabupaten"
                                            value={formData.location}
                                            onChange={(e) =>
                                                setFormData({ ...formData, location: e.target.value })
                                            }
                                            required
                                            disabled={isLoading}
                                            className="border-slate-300 focus:border-primary"
                                        />
                                    </div>

                                    <div className="pt-2">
                                        <Button type="submit" className="w-full" disabled={isLoading}>
                                            {isLoading ? (
                                                <>
                                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                    Sedang Scraping...
                                                </>
                                            ) : (
                                                <>
                                                    <Search className="mr-2 h-4 w-4" />
                                                    Mulai Scraping
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Maps Content */}
                <div className="flex-1 flex flex-col relative h-96 md:h-auto">
                    {/* Legends Container - Floating */}
                    <div className="absolute top-2 right-2 md:top-6 md:right-6 z-[1000] flex flex-col gap-3 w-48 md:w-64 max-w-[90vw]">
                        {/* Category Filter Legend */}
                        <div className="bg-white rounded-lg shadow-lg border border-slate-200 overflow-hidden">
                            <div className="px-3 py-2 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                                <p className="text-xs font-semibold text-slate-700">
                                    Filter Kategori {selectedCategories.length > 0 && `(${selectedCategories.length})`}
                                </p>
                                {selectedCategories.length > 0 && (
                                    <button
                                        onClick={clearCategoryFilter}
                                        className="text-xs text-primary hover:text-primary/80 font-medium"
                                    >
                                        Reset
                                    </button>
                                )}
                            </div>
                            <div className="p-2 max-h-[300px] overflow-y-auto">
                                <div className="grid grid-cols-2 gap-2">
                                    {categories.filter(cat => cat.is_active).slice(0, 12).map((category) => {
                                        const isSelected = selectedCategories.includes(category.name)
                                        return (
                                            <button
                                                key={category.id}
                                                onClick={() => toggleCategoryFilter(category.name)}
                                                className={cn(
                                                    "flex items-center gap-2 px-2 py-1.5 rounded-md transition-all cursor-pointer",
                                                    isSelected
                                                        ? "bg-primary text-primary-foreground shadow-sm ring-2 ring-primary/20"
                                                        : "bg-slate-50 hover:bg-slate-100"
                                                )}
                                                title={category.name}
                                            >
                                                {category.image_url ? (
                                                    <img
                                                        src={category.image_url}
                                                        alt={category.name}
                                                        className={cn(
                                                            "w-5 h-5 object-contain flex-shrink-0",
                                                            isSelected && "brightness-0 invert"
                                                        )}
                                                    />
                                                ) : (
                                                    <div className={cn(
                                                        "w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0",
                                                        isSelected ? "bg-white/20" : "bg-primary/20"
                                                    )}>
                                                        <MapPin className={cn(
                                                            "h-3 w-3",
                                                            isSelected ? "text-white" : "text-primary"
                                                        )} />
                                                    </div>
                                                )}
                                                <span className={cn(
                                                    "text-xs font-medium truncate",
                                                    isSelected ? "text-primary-foreground" : "text-slate-700"
                                                )}>
                                                    {category.name}
                                                </span>
                                            </button>
                                        )
                                    })}
                                </div>
                                {categories.filter(cat => cat.is_active).length > 12 && (
                                    <p className="text-xs text-slate-500 text-center mt-2">
                                        +{categories.filter(cat => cat.is_active).length - 12} kategori lainnya
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Map Type Legend */}
                        <div className="bg-white rounded-lg shadow-lg border border-slate-200 overflow-hidden">
                            <div className="px-3 py-2 bg-slate-50 border-b border-slate-200">
                                <p className="text-xs font-semibold text-slate-700">Tipe Peta</p>
                            </div>
                            <div className="p-2 space-y-1">
                                {mapTypes.map((type) => {
                                    const Icon = type.icon
                                    return (
                                        <button
                                            key={type.id}
                                            onClick={() => setMapType(type.id as MapType)}
                                            className={cn(
                                                'w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all',
                                                mapType === type.id
                                                    ? 'bg-primary text-primary-foreground shadow-sm'
                                                    : 'text-slate-700 hover:bg-slate-100'
                                            )}
                                        >
                                            <Icon className="h-4 w-4" />
                                            {type.label}
                                        </button>
                                    )
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Map */}
                    <div className="flex-1 relative">
                        <LeafletMap
                            places={filteredPlaces}
                            categories={categories}
                            height="100%"
                            mapType={mapType}
                            onLocationSelect={handleLocationSelect}
                        />
                    </div>

                    {/* Bottom Info Bar */}
                    <div className="bg-white border-t border-slate-200 px-6 py-3 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                                    <MapPin className="h-4 w-4 text-primary" />
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-slate-900">
                                        {selectedCategories.length > 0
                                            ? `${filteredPlaces.length} dari ${places.length} Lokasi`
                                            : `${places.length} Lokasi Aktif`
                                        }
                                    </p>
                                    <p className="text-xs text-slate-500">
                                        {selectedCategories.length > 0
                                            ? `Filter: ${selectedCategories.join(', ')} • Klik Reset untuk hapus filter`
                                            : 'Klik marker untuk detail • Scroll zoom • Drag untuk geser'
                                        }
                                    </p>
                                </div>
                            </div>
                            <div className="text-xs text-slate-400">Powered by Google Maps</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Results Modal */}
            <Dialog open={showResultsModal} onOpenChange={setShowResultsModal}>
                <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                                <MapPin className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                                <DialogTitle className="text-xl">
                                    Scraping Berhasil! {scrapedResults.length} Tempat Ditemukan
                                </DialogTitle>
                                <DialogDescription>
                                    Data telah disimpan ke database dan ditampilkan di peta
                                </DialogDescription>
                            </div>
                        </div>
                    </DialogHeader>

                    <div className="space-y-6 mt-4">
                        {/* Statistics */}
                        <div className="grid gap-4 md:grid-cols-1">
                            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-4 text-white shadow-md">
                                <p className="text-sm opacity-90 mb-1">Total Tempat</p>
                                <p className="text-3xl font-bold">{scrapedResults.length}</p>
                            </div>
                        </div>

                        {/* Data Table */}
                        <div className="border border-slate-200 rounded-xl overflow-hidden">
                            <div className="bg-slate-50 px-4 py-3 border-b border-slate-200">
                                <h4 className="font-semibold text-slate-900">Detail Data Scraping</h4>
                            </div>
                            <div className="p-4">
                                <DataTable
                                    columns={columns}
                                    data={scrapedResults}
                                    searchKey="name"
                                    searchPlaceholder="Cari nama tempat..."
                                />
                            </div>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    )
}
