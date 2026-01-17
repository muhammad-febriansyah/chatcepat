import { useState } from 'react'
import { Head, Link } from '@inertiajs/react'
import UserLayout from '@/layouts/user/user-layout'
import { LeafletMap } from '@/components/admin/LeafletMap'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { MapPin, ArrowLeft, Download } from 'lucide-react'

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

interface MapsPageProps {
    places: GoogleMapPlace[]
}

type MapType = 'roadmap' | 'satellite'

export default function MapsPage({ places }: MapsPageProps) {
    const [mapType, setMapType] = useState<MapType>('roadmap')

    const categories = [] // Empty categories for now

    return (
        <UserLayout>
            <Head title="Maps View - Scraper Results" />

            <div className="w-full max-w-full">
                {/* Header */}
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">Maps View</h1>
                        <p className="text-sm text-muted-foreground mt-1">
                            Visualisasi {places.length} lokasi hasil scraping
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Link href="/user/scraper">
                            <Button variant="outline">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Kembali
                            </Button>
                        </Link>
                        <Button variant="outline" onClick={() => window.location.href = '/user/scraper/export/excel'}>
                            <Download className="h-4 w-4 mr-2" />
                            Export
                        </Button>
                    </div>
                </div>

                {/* Map Card */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle className="flex items-center gap-2">
                                <MapPin className="h-5 w-5" />
                                Peta Lokasi
                            </CardTitle>
                            <div className="flex gap-2">
                                <Button
                                    variant={mapType === 'roadmap' ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={() => setMapType('roadmap')}
                                >
                                    Roadmap
                                </Button>
                                <Button
                                    variant={mapType === 'satellite' ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={() => setMapType('satellite')}
                                >
                                    Satellite
                                </Button>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="rounded-lg overflow-hidden border">
                            <LeafletMap
                                places={places}
                                categories={categories}
                                height="600px"
                                mapType={mapType}
                            />
                        </div>
                        <p className="text-sm text-muted-foreground mt-4 text-center">
                            🗺️ Menampilkan {places.length} lokasi
                        </p>
                    </CardContent>
                </Card>
            </div>
        </UserLayout>
    )
}
