import { useEffect, useRef, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { MapPin, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Place {
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
    latitude?: number
    longitude?: number
}

interface GoogleMapViewProps {
    places: Place[]
    apiKey?: string
}

export function GoogleMapView({ places, apiKey }: GoogleMapViewProps) {
    const [selectedPlace, setSelectedPlace] = useState<Place | null>(null)

    if (!places || places.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <MapPin className="h-5 w-5" />
                        Peta Lokasi
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-center h-64 text-muted-foreground">
                        Belum ada data untuk ditampilkan di peta
                    </div>
                </CardContent>
            </Card>
        )
    }

    // Group places by kecamatan for easy viewing
    const placesByKecamatan = places.reduce(
        (acc, place) => {
            const key = `${place.kecamatan}, ${place.location}`
            if (!acc[key]) {
                acc[key] = []
            }
            acc[key].push(place)
            return acc
        },
        {} as Record<string, Place[]>,
    )

    return (
        <div className="space-y-4">
            {/* Map Embed - Using Google Maps Embed API */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <MapPin className="h-5 w-5" />
                        Peta Lokasi ({places.length} tempat)
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {Object.entries(placesByKecamatan).map(([kecamatan, kecamatanPlaces]) => (
                            <div key={kecamatan} className="space-y-2">
                                <h3 className="font-semibold text-sm flex items-center gap-2">
                                    <MapPin className="h-4 w-4" />
                                    {kecamatan}
                                    <span className="text-xs text-muted-foreground">
                                        ({kecamatanPlaces.length} tempat)
                                    </span>
                                </h3>

                                {/* Google Maps Embed */}
                                <div className="relative w-full h-64 rounded-lg overflow-hidden border">
                                    <iframe
                                        width="100%"
                                        height="100%"
                                        style={{ border: 0 }}
                                        loading="lazy"
                                        allowFullScreen
                                        referrerPolicy="no-referrer-when-downgrade"
                                        src={`https://www.google.com/maps/embed/v1/search?key=${apiKey || 'AIzaSyBkZraD0rt4dP0TslLVMexomnye48jFcW0'}&q=${encodeURIComponent(kecamatan)}&zoom=14`}
                                    ></iframe>
                                </div>

                                {/* Places in this kecamatan */}
                                <div className="space-y-2 max-h-64 overflow-y-auto">
                                    {kecamatanPlaces.map((place) => (
                                        <div
                                            key={place.id}
                                            className="p-3 border rounded-lg hover:bg-accent cursor-pointer transition-colors"
                                            onClick={() => setSelectedPlace(place)}
                                        >
                                            <div className="flex items-start justify-between gap-2">
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="font-medium text-sm truncate">
                                                        {place.name}
                                                    </h4>
                                                    {place.category && (
                                                        <p className="text-xs text-muted-foreground">
                                                            {place.category}
                                                        </p>
                                                    )}
                                                    {place.rating && (
                                                        <p className="text-xs text-yellow-600">
                                                            ⭐ {place.rating} ({place.review_count || 0}{' '}
                                                            reviews)
                                                        </p>
                                                    )}
                                                </div>
                                                {place.url && (
                                                    <a
                                                        href={place.url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="flex-shrink-0"
                                                        onClick={(e) => e.stopPropagation()}
                                                    >
                                                        <Button size="sm" variant="ghost">
                                                            <ExternalLink className="h-4 w-4" />
                                                        </Button>
                                                    </a>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Selected Place Details */}
            {selectedPlace && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                            <span className="flex items-center gap-2">
                                <MapPin className="h-5 w-5" />
                                Detail Lokasi
                            </span>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setSelectedPlace(null)}
                            >
                                Tutup
                            </Button>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <h3 className="font-bold text-lg">{selectedPlace.name}</h3>
                                {selectedPlace.category && (
                                    <p className="text-sm text-muted-foreground">
                                        {selectedPlace.category}
                                    </p>
                                )}
                                {selectedPlace.rating && (
                                    <p className="text-sm">
                                        ⭐ {selectedPlace.rating} ({selectedPlace.review_count || 0}{' '}
                                        reviews)
                                    </p>
                                )}
                                {selectedPlace.address && (
                                    <p className="text-sm">
                                        <strong>Alamat:</strong> {selectedPlace.address}
                                    </p>
                                )}
                                {selectedPlace.phone && (
                                    <p className="text-sm">
                                        <strong>Telepon:</strong>{' '}
                                        <a href={`tel:${selectedPlace.phone}`} className="text-blue-600 hover:underline">
                                            {selectedPlace.phone}
                                        </a>
                                    </p>
                                )}
                                {selectedPlace.website && (
                                    <p className="text-sm">
                                        <strong>Website:</strong>{' '}
                                        <a
                                            href={selectedPlace.website}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-blue-600 hover:underline"
                                        >
                                            Kunjungi Website
                                        </a>
                                    </p>
                                )}
                                {selectedPlace.url && (
                                    <a
                                        href={selectedPlace.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        <Button className="w-full mt-2">
                                            <ExternalLink className="h-4 w-4 mr-2" />
                                            Lihat di Google Maps
                                        </Button>
                                    </a>
                                )}
                            </div>
                            <div className="relative w-full h-64 rounded-lg overflow-hidden border">
                                {selectedPlace.address && (
                                    <iframe
                                        width="100%"
                                        height="100%"
                                        style={{ border: 0 }}
                                        loading="lazy"
                                        allowFullScreen
                                        referrerPolicy="no-referrer-when-downgrade"
                                        src={`https://www.google.com/maps/embed/v1/place?key=${apiKey || 'AIzaSyBkZraD0rt4dP0TslLVMexomnye48jFcW0'}&q=${encodeURIComponent(selectedPlace.address)}`}
                                    ></iframe>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
