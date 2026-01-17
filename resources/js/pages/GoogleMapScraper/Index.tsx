import { useState } from 'react'
import { Head, router } from '@inertiajs/react'
import AdminLayout from '@/layouts/admin/admin-layout'
import { PageHeader } from '@/components/admin/common/page-header'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Download, MapPin, Search, Loader2, List } from 'lucide-react'
import { toast } from 'sonner'
import { MapPicker } from '@/components/admin/MapPicker'
import { Separator } from '@/components/ui/separator'

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
    scraped_at: string | null
    created_at: string
}

interface GoogleMapScraperIndexProps {
    places: {
        data: GoogleMapPlace[]
        current_page: number
        last_page: number
        per_page: number
        total: number
    }
}

export default function GoogleMapScraperIndex({ places }: GoogleMapScraperIndexProps) {
    const [isScrapingState, setIsScrapingState] = useState(false)
    const [formData, setFormData] = useState({
        keyword: '',
        location: '',
        kecamatan: '',
        max_results: 20,
    })

    const handleLocationSelect = (location: string, kecamatan: string) => {
        setFormData({
            ...formData,
            location,
            kecamatan,
        })
        toast.success(`Lokasi dipilih: ${kecamatan}, ${location}`)
    }

    const handleViewResults = () => {
        window.open('/admin/google-maps-scraper/results', '_blank')
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsScrapingState(true)

        try {
            // Get CSRF token
            const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content')

            if (!csrfToken) {
                toast.error('CSRF token tidak ditemukan')
                setIsScrapingState(false)
                return
            }

            const response = await fetch('/admin/google-maps-scraper/scrape', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': csrfToken,
                    'X-Requested-With': 'XMLHttpRequest',
                },
                body: JSON.stringify(formData),
                credentials: 'same-origin',
            })

            // Check if response is JSON
            const contentType = response.headers.get('content-type')
            if (!contentType || !contentType.includes('application/json')) {
                const text = await response.text()
                console.error('Non-JSON response:', text.substring(0, 500))
                toast.error('Server mengembalikan response yang tidak valid')
                setIsScrapingState(false)
                return
            }

            const data = await response.json()

            if (data.status === 'success') {
                toast.success(`Berhasil scraping ${data.total} tempat!`)
                router.reload()
                setFormData({
                    keyword: '',
                    location: '',
                    kecamatan: '',
                    max_results: 20,
                })
            } else {
                toast.error(data.message || 'Scraping gagal')
            }
        } catch (error: any) {
            console.error('Scraping error:', error)
            toast.error('Terjadi kesalahan: ' + (error.message || 'Unknown error'))
        } finally {
            setIsScrapingState(false)
        }
    }

    const handleExport = () => {
        window.location.href = '/admin/google-maps-scraper/export'
    }

    return (
        <AdminLayout>
            <Head title="Google Maps Scraper" />

            <PageHeader
                title="Google Maps Scraper"
                description="Scrape data dari Google Maps per kecamatan"
            />

            {/* Quick Actions */}
            {places.total > 0 && (
                <Card className="mb-6 bg-muted/50">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium">
                                    Total data tersimpan: <span className="text-2xl font-bold">{places.total}</span> tempat
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    Lihat semua hasil scraping dengan visualisasi peta lengkap
                                </p>
                            </div>
                            <div className="flex gap-2">
                                <Button variant="outline" onClick={handleViewResults}>
                                    <List className="h-4 w-4 mr-2" />
                                    Lihat Semua Hasil
                                </Button>
                                <Button variant="outline" onClick={handleExport}>
                                    <Download className="h-4 w-4 mr-2" />
                                    Export CSV
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Map Picker */}
            <div className="mb-6">
                <MapPicker
                    onLocationSelect={handleLocationSelect}
                    apiKey="AIzaSyBkZraD0rt4dP0TslLVMexomnye48jFcW0"
                />
            </div>

            <Separator className="my-6" />

            {/* Scraping Form */}
            <Card className="mb-6">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Search className="h-5 w-5" />
                        Form Scraping
                    </CardTitle>
                    <CardDescription>
                        Masukkan detail scraping sesuai lokasi yang dipilih di peta
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="keyword">
                                    Keyword <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="keyword"
                                    placeholder="Contoh: restaurant, hotel, cafe"
                                    value={formData.keyword}
                                    onChange={(e) =>
                                        setFormData({ ...formData, keyword: e.target.value })
                                    }
                                    required
                                    disabled={isScrapingState}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="location">
                                    Lokasi/Kota <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="location"
                                    placeholder="Contoh: Jakarta, Bandung, Surabaya"
                                    value={formData.location}
                                    onChange={(e) =>
                                        setFormData({ ...formData, location: e.target.value })
                                    }
                                    required
                                    disabled={isScrapingState}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="kecamatan">
                                    Kecamatan <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="kecamatan"
                                    placeholder="Contoh: Menteng, Gambir, Tanah Abang"
                                    value={formData.kecamatan}
                                    onChange={(e) =>
                                        setFormData({ ...formData, kecamatan: e.target.value })
                                    }
                                    required
                                    disabled={isScrapingState}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="max_results">Maksimal Hasil (1-100)</Label>
                                <Input
                                    id="max_results"
                                    type="number"
                                    min="1"
                                    max="100"
                                    value={formData.max_results}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            max_results: parseInt(e.target.value),
                                        })
                                    }
                                    disabled={isScrapingState}
                                />
                            </div>
                        </div>

                        <Button
                            type="submit"
                            disabled={isScrapingState}
                            className="w-full flex items-center gap-2"
                        >
                            {isScrapingState ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Sedang Scraping...
                                </>
                            ) : (
                                <>
                                    <Search className="h-4 w-4" />
                                    Mulai Scraping
                                </>
                            )}
                        </Button>
                    </form>
                </CardContent>
            </Card>

            {/* Recent Scraping Results */}
            {places.data.length > 0 && (
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle>Scraping Terakhir</CardTitle>
                                <CardDescription>
                                    Menampilkan {places.data.length} data terbaru
                                </CardDescription>
                            </div>
                            <Button variant="outline" onClick={handleViewResults}>
                                <List className="h-4 w-4 mr-2" />
                                Lihat Semua
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            {places.data.slice(0, 5).map((place) => (
                                <div
                                    key={place.id}
                                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent"
                                >
                                    <div className="flex-1">
                                        <p className="font-medium">{place.name}</p>
                                        <p className="text-sm text-muted-foreground">
                                            {place.kecamatan}, {place.location}
                                            {place.rating && ` • ⭐ ${place.rating}`}
                                        </p>
                                    </div>
                                    {place.url && (
                                        <a
                                            href={place.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            <Button size="sm" variant="ghost">
                                                <MapPin className="h-4 w-4" />
                                            </Button>
                                        </a>
                                    )}
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}
        </AdminLayout>
    )
}
