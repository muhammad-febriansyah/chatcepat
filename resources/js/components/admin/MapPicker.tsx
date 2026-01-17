import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { MapPin, Search } from 'lucide-react'

interface MapPickerProps {
    onLocationSelect: (location: string, kecamatan: string, lat: number, lng: number) => void
    apiKey: string
}

export function MapPicker({ onLocationSelect, apiKey }: MapPickerProps) {
    const [selectedLocation, setSelectedLocation] = useState<string>('')
    const [mapUrl, setMapUrl] = useState<string>('')

    useEffect(() => {
        // Default to Jakarta center
        const defaultUrl = `https://www.google.com/maps/embed/v1/view?key=${apiKey}&center=-6.2088,106.8456&zoom=11`
        setMapUrl(defaultUrl)
    }, [apiKey])

    const handleOpenMapPicker = () => {
        // Open full Google Maps in new tab for location picking
        const mapsUrl = 'https://www.google.com/maps/@-6.2088,106.8456,11z'
        window.open(mapsUrl, '_blank', 'width=1200,height=800')
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Pilih Lokasi di Peta
                </CardTitle>
                <CardDescription>
                    Klik tombol di bawah untuk membuka Google Maps dan pilih area yang ingin di-scrape
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Map Link Card */}
                <div className="relative w-full h-64 rounded-lg overflow-hidden border bg-muted flex items-center justify-center">
                    <div className="text-center space-y-4 p-6">
                        <MapPin className="h-16 w-16 mx-auto text-muted-foreground" />
                        <div>
                            <p className="font-medium text-lg mb-2">
                                Pilih Area Scraping di Google Maps
                            </p>
                            <p className="text-sm text-muted-foreground">
                                Klik tombol di bawah untuk membuka Google Maps
                            </p>
                        </div>
                        <Button onClick={handleOpenMapPicker} size="lg">
                            <MapPin className="h-4 w-4 mr-2" />
                            Buka Google Maps
                        </Button>
                    </div>
                </div>

                <div className="text-sm text-muted-foreground bg-muted p-4 rounded-lg">
                    <p className="font-medium mb-2">Cara Menggunakan:</p>
                    <ol className="list-decimal list-inside space-y-1">
                        <li>Klik tombol "Buka Google Maps" di atas</li>
                        <li>Navigasi ke area yang ingin di-scrape</li>
                        <li>Perhatikan nama kecamatan dan kota di area tersebut</li>
                        <li>Masukkan nama kecamatan & kota di form di bawah</li>
                        <li>Pilih keyword (cafe, restaurant, hotel, dll)</li>
                    </ol>
                </div>
            </CardContent>
        </Card>
    )
}
