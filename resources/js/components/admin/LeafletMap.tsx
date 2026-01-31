import { useEffect, useRef, useState } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Get primary color - using the website's primary color (blue)
// oklch(0.47 0.23 264) converts to approximately #2563eb
const getPrimaryColor = (): string => {
    return '#2563eb'
}

// Get gray color for places without images
const getGrayColor = (): string => {
    return '#94a3b8' // slate-400
}

// Create custom marker icon based on category
const createCategoryIcon = (category: string | null, rating: number | null, hasImage: boolean = true) => {
    const color = hasImage ? getPrimaryColor() : getGrayColor()
    const size = rating && rating >= 4.5 ? 40 : rating && rating >= 4.0 ? 36 : 32

    return L.divIcon({
        className: 'custom-category-marker',
        html: `
            <div style="position: relative;">
                <svg width="${size}" height="${size + 8}" viewBox="0 0 24 32" fill="none" xmlns="http://www.w3.org/2000/svg" style="filter: drop-shadow(0 2px 8px rgba(0,0,0,0.3));">
                    <path d="M12 0C5.37 0 0 5.37 0 12c0 9 12 20 12 20s12-11 12-20c0-6.63-5.37-12-12-12z" fill="${color}"/>
                    <circle cx="12" cy="11" r="5" fill="white" opacity="0.9"/>
                </svg>
                ${rating ? `
                    <div style="
                        position: absolute;
                        top: 6px;
                        left: 50%;
                        transform: translateX(-50%);
                        background: white;
                        border-radius: 50%;
                        width: 18px;
                        height: 18px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        font-size: 10px;
                        font-weight: 700;
                        color: ${color};
                    ">★</div>
                ` : ''}
            </div>
        `,
        iconSize: [size, size + 8],
        iconAnchor: [size / 2, size + 8],
        popupAnchor: [0, -(size + 8)],
    })
}

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

interface LeafletMapProps {
    places: Place[]
    categories?: Category[]
    height?: string
    zoom?: number
    mapType?: 'roadmap' | 'satellite' | 'hybrid' | 'terrain'
    onLocationSelect?: (kecamatan: string, kota: string, lat: number, lng: number) => void
}

// Create marker icon using category image
const createCategoryImageIcon = (categoryImageUrl: string | null, categoryColor: string, rating: number | null) => {
    const size = rating && rating >= 4.5 ? 44 : rating && rating >= 4.0 ? 40 : 36

    if (categoryImageUrl) {
        // Use category image as marker
        return L.divIcon({
            className: 'custom-image-marker',
            html: `
                <div style="position: relative;">
                    <!-- Pin Background -->
                    <svg width="${size}" height="${size + 12}" viewBox="0 0 24 32" fill="none" xmlns="http://www.w3.org/2000/svg" style="filter: drop-shadow(0 3px 10px rgba(0,0,0,0.4));">
                        <path d="M12 0C5.37 0 0 5.37 0 12c0 9 12 20 12 20s12-11 12-20c0-6.63-5.37-12-12-12z" fill="${categoryColor}"/>
                    </svg>

                    <!-- Category Image -->
                    <div style="
                        position: absolute;
                        top: 4px;
                        left: 50%;
                        transform: translateX(-50%);
                        width: ${size - 12}px;
                        height: ${size - 12}px;
                        background: white;
                        border-radius: 50%;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        overflow: hidden;
                        box-shadow: 0 2px 4px rgba(0,0,0,0.2);
                    ">
                        <img src="${categoryImageUrl}" style="
                            width: ${size - 16}px;
                            height: ${size - 16}px;
                            object-fit: contain;
                        " />
                    </div>

                    ${rating ? `
                        <div style="
                            position: absolute;
                            bottom: 8px;
                            left: 50%;
                            transform: translateX(-50%);
                            background: #fbbf24;
                            border: 2px solid white;
                            border-radius: 10px;
                            padding: 1px 5px;
                            font-size: 9px;
                            font-weight: 700;
                            color: white;
                            box-shadow: 0 2px 4px rgba(0,0,0,0.3);
                            white-space: nowrap;
                        ">★ ${rating}</div>
                    ` : ''}
                </div>
            `,
            iconSize: [size, size + 12],
            iconAnchor: [size / 2, size + 12],
            popupAnchor: [0, -(size + 12)],
        })
    }

    // Fallback to gray marker if no image
    return createCategoryIcon(null, rating, false)
}

export function LeafletMap({
    places,
    categories = [],
    height = '600px',
    zoom = 12,
    mapType = 'roadmap',
    onLocationSelect,
}: LeafletMapProps) {
    const mapRef = useRef<HTMLDivElement>(null)
    const mapInstanceRef = useRef<L.Map | null>(null)
    const [userLocation, setUserLocation] = useState<[number, number] | null>(null)
    const [isLoadingLocation, setIsLoadingLocation] = useState(true)

    // Get user's current location
    useEffect(() => {
        if ('geolocation' in navigator) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setUserLocation([position.coords.latitude, position.coords.longitude])
                    setIsLoadingLocation(false)
                },
                (error) => {
                    console.log('Geolocation error:', error.message)
                    setIsLoadingLocation(false)
                },
                {
                    enableHighAccuracy: true,
                    timeout: 5000,
                    maximumAge: 0,
                }
            )
        } else {
            setIsLoadingLocation(false)
        }
    }, [])

    useEffect(() => {
        if (!mapRef.current || mapInstanceRef.current || isLoadingLocation) return

        // Use user's location if available, otherwise default to Jakarta
        const center: [number, number] = userLocation || [-6.2088, 106.8456]

        // Initialize map
        const map = L.map(mapRef.current).setView(center, zoom)

        // Add user location marker if available
        if (userLocation) {
            const userMarkerIcon = L.divIcon({
                className: 'user-location-marker',
                html: `
                    <div style="position: relative;">
                        <div style="
                            width: 20px;
                            height: 20px;
                            background: #3b82f6;
                            border: 3px solid white;
                            border-radius: 50%;
                            box-shadow: 0 2px 8px rgba(0,0,0,0.3);
                        "></div>
                        <div style="
                            position: absolute;
                            top: 50%;
                            left: 50%;
                            transform: translate(-50%, -50%);
                            width: 40px;
                            height: 40px;
                            background: rgba(59, 130, 246, 0.2);
                            border: 2px solid rgba(59, 130, 246, 0.4);
                            border-radius: 50%;
                            animation: pulse 2s infinite;
                        "></div>
                    </div>
                `,
                iconSize: [20, 20],
                iconAnchor: [10, 10],
            })

            L.marker(userLocation, { icon: userMarkerIcon })
                .addTo(map)
                .bindPopup('<b>📍 Lokasi Anda</b><br>Posisi saat ini')
        }

        // Add click handler for location selection
        if (onLocationSelect) {
            let clickMarker: L.Marker | null = null

            map.on('click', async (e: L.LeafletMouseEvent) => {
                const { lat, lng } = e.latlng

                // Remove previous click marker if exists
                if (clickMarker) {
                    map.removeLayer(clickMarker)
                }

                // Add temporary marker at click location
                const tempIcon = L.divIcon({
                    className: 'temp-marker',
                    html: `
                        <div style="
                            width: 16px;
                            height: 16px;
                            background: #ef4444;
                            border: 3px solid white;
                            border-radius: 50%;
                            box-shadow: 0 2px 8px rgba(0,0,0,0.3);
                        "></div>
                    `,
                    iconSize: [16, 16],
                    iconAnchor: [8, 8],
                })

                clickMarker = L.marker([lat, lng], { icon: tempIcon })
                    .addTo(map)
                    .bindPopup('⏳ Mengambil informasi lokasi...')
                    .openPopup()

                try {
                    // Reverse geocoding using Nominatim (free, no API key needed)
                    const response = await fetch(
                        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1&accept-language=id`,
                        {
                            headers: {
                                'User-Agent': 'ChatCepat Maps Scraper',
                            },
                        }
                    )

                    const data = await response.json()

                    if (data.address) {
                        // Extract kecamatan and kota from address components
                        const address = data.address

                        // More comprehensive fallback for kecamatan (district/subdistrict level)
                        const kecamatan = address.suburb ||
                            address.neighbourhood ||
                            address.quarter ||
                            address.city_district ||
                            address.hamlet ||
                            address.district ||
                            address.subdistrict ||
                            address.municipality || ''

                        // More comprehensive fallback for kota (city/regency level)
                        const kota = address.city ||
                            address.town ||
                            address.village ||
                            address.county ||
                            address.state_district ||
                            address.municipality ||
                            address.state ||
                            address.region || ''

                        // Smart fallback: if one is missing, use the other
                        const finalKecamatan = kecamatan || kota || 'Unknown'
                        const finalKota = kota || kecamatan || address.country || 'Unknown'

                        // Log for debugging
                        console.log('Geocoding result:', {
                            raw: address,
                            kecamatan: finalKecamatan,
                            kota: finalKota
                        })

                        if (finalKecamatan !== 'Unknown' && finalKota !== 'Unknown') {
                            // Update popup with success message
                            clickMarker?.setPopupContent(`
                                <div style="padding: 8px;">
                                    <b>✅ Lokasi Dipilih</b><br>
                                    <small>Kecamatan: ${finalKecamatan}<br>
                                    Kota: ${finalKota}</small>
                                </div>
                            `)

                            // Call the callback
                            onLocationSelect(finalKecamatan, finalKota, lat, lng)

                            // Remove marker after 2 seconds
                            setTimeout(() => {
                                if (clickMarker) {
                                    map.removeLayer(clickMarker)
                                    clickMarker = null
                                }
                            }, 2000)
                        } else {
                            // Show what we found for debugging
                            const foundInfo = Object.entries(address)
                                .filter(([key, value]) => value && typeof value === 'string')
                                .slice(0, 3)
                                .map(([key, value]) => `${key}: ${value}`)
                                .join('<br>')

                            clickMarker?.setPopupContent(`
                                <div style="padding: 8px;">
                                    <b>❌ Lokasi tidak lengkap</b><br>
                                    <small style="color: #64748b;">
                                        Ditemukan:<br>${foundInfo || 'Tidak ada data'}
                                    </small>
                                </div>
                            `)
                        }
                    } else {
                        clickMarker?.setPopupContent('❌ Tidak ada data lokasi')
                    }
                } catch (error) {
                    console.error('Reverse geocoding error:', error)
                    clickMarker?.setPopupContent('❌ Gagal mengambil informasi lokasi')
                }
            })
        }

        // Choose tile layer based on map type
        let tileUrl = ''
        let attribution = '© Google Maps'
        const subdomains = ['mt0', 'mt1', 'mt2', 'mt3']

        switch (mapType) {
            case 'satellite':
                // Google Satellite
                tileUrl = 'http://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}'
                break
            case 'hybrid':
                // Google Hybrid (Satellite + Labels)
                tileUrl = 'http://{s}.google.com/vt/lyrs=y&x={x}&y={y}&z={z}'
                break
            case 'terrain':
                // Google Terrain
                tileUrl = 'http://{s}.google.com/vt/lyrs=p&x={x}&y={y}&z={z}'
                break
            case 'roadmap':
            default:
                // Google Roadmap (default)
                tileUrl = 'http://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}'
                break
        }

        L.tileLayer(tileUrl, {
            maxZoom: 20,
            subdomains: subdomains,
            attribution: attribution,
        }).addTo(map)

        // Add markers for each place
        const markers: L.Marker[] = []
        const bounds: L.LatLngBounds = L.latLngBounds([])

        places.forEach((place) => {
            // Generate approximate coordinates based on location
            // In production, you should geocode addresses or store coordinates
            const lat = center[0] + (Math.random() - 0.5) * 0.1
            const lng = center[1] + (Math.random() - 0.5) * 0.1

            // Find matching category from database
            const matchingCategory = categories.find(cat =>
                place.category?.toLowerCase().includes(cat.name.toLowerCase()) ||
                cat.name.toLowerCase().includes(place.category?.toLowerCase() || '')
            )

            // Use primary color for all markers
            const primaryColor = getPrimaryColor()
            const categoryImageUrl = matchingCategory?.image_url || null

            // Create marker with category image icon
            const categoryIcon = createCategoryImageIcon(categoryImageUrl, primaryColor, place.rating)
            const marker = L.marker([lat, lng], { icon: categoryIcon }).addTo(map)

            // Format category name: replace underscores with spaces and capitalize
            const formatCategoryName = (category: string) => {
                return category
                    .split(',')[0]
                    .replace(/_/g, ' ')
                    .split(' ')
                    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
                    .join(' ')
            }

            // Create clean popup content
            const popupContent = `
                <div style="
                    width: 280px;
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                    background: white;
                    border-radius: 8px;
                    overflow: hidden;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
                ">
                    <!-- Header -->
                    <div style="
                        padding: 16px;
                        background: ${primaryColor};
                        color: white;
                    ">
                        <h3 style="
                            margin: 0 0 6px 0;
                            font-size: 15px;
                            font-weight: 700;
                            line-height: 1.3;
                        ">${place.name}</h3>
                        ${place.category ? `
                            <div style="
                                display: inline-block;
                                background: rgba(255,255,255,0.2);
                                color: white;
                                padding: 3px 10px;
                                border-radius: 12px;
                                font-size: 10px;
                                font-weight: 600;
                                text-transform: uppercase;
                                letter-spacing: 0.5px;
                            ">${formatCategoryName(place.category)}</div>
                        ` : ''}
                    </div>

                    <!-- Content -->
                    <div style="padding: 12px 16px;">
                        <!-- Rating -->
                        ${place.rating ? `
                            <div style="
                                display: flex;
                                align-items: center;
                                gap: 10px;
                                padding: 12px;
                                background: #fffbeb;
                                border-radius: 8px;
                                margin-bottom: 14px;
                            ">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="#f59e0b" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                                </svg>
                                <div>
                                    <div style="
                                        font-size: 16px;
                                        font-weight: 700;
                                        color: #92400e;
                                        line-height: 1;
                                    ">${place.rating}</div>
                                    ${place.review_count ? `
                                        <div style="
                                            font-size: 10px;
                                            color: #78716c;
                                            margin-top: 3px;
                                        ">${place.review_count.toLocaleString()} ulasan</div>
                                    ` : ''}
                                </div>
                            </div>
                        ` : ''}

                        <!-- Details -->
                        <div style="display: flex; flex-direction: column; gap: 12px;">
                            ${place.address ? `
                                <div style="
                                    display: flex;
                                    gap: 12px;
                                    font-size: 13px;
                                    line-height: 1.5;
                                    color: #334155;
                                ">
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#64748b" stroke-width="2" style="flex-shrink: 0; margin-top: 2px;">
                                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                                        <circle cx="12" cy="10" r="3"/>
                                    </svg>
                                    <span style="flex: 1;">${place.address}</span>
                                </div>
                            ` : ''}

                            ${place.phone ? `
                                <div style="
                                    display: flex;
                                    gap: 12px;
                                    font-size: 13px;
                                    align-items: center;
                                ">
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#64748b" stroke-width="2" style="flex-shrink: 0;">
                                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                                    </svg>
                                    <a href="tel:${place.phone}" style="
                                        color: #0f172a;
                                        text-decoration: none;
                                        font-weight: 500;
                                    ">${place.phone}</a>
                                </div>
                            ` : ''}

                            ${place.website ? `
                                <div style="
                                    display: flex;
                                    gap: 12px;
                                    font-size: 13px;
                                    align-items: center;
                                ">
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#64748b" stroke-width="2" style="flex-shrink: 0;">
                                        <circle cx="12" cy="12" r="10"/>
                                        <line x1="2" y1="12" x2="22" y2="12"/>
                                        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
                                    </svg>
                                    <a href="${place.website}" target="_blank" style="
                                        color: #0f172a;
                                        text-decoration: none;
                                        font-weight: 500;
                                        overflow: hidden;
                                        text-overflow: ellipsis;
                                        white-space: nowrap;
                                    ">Kunjungi Website</a>
                                </div>
                            ` : ''}
                        </div>

                        <!-- Action Button -->
                        ${place.url ? `
                            <a href="${place.url}" target="_blank" style="
                                display: flex;
                                align-items: center;
                                justify-content: center;
                                gap: 8px;
                                width: 100%;
                                padding: 11px 16px;
                                background: ${primaryColor};
                                color: white;
                                text-decoration: none;
                                border-radius: 8px;
                                font-size: 13px;
                                font-weight: 600;
                                transition: all 0.2s;
                                margin-top: 14px;
                            " onmouseover="this.style.opacity='0.9'"
                               onmouseout="this.style.opacity='1'">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                                    <polyline points="15 3 21 3 21 9"/>
                                    <line x1="10" y1="14" x2="21" y2="3"/>
                                </svg>
                                <span>Buka di Google Maps</span>
                            </a>
                        ` : ''}
                    </div>
                </div>
            `

            marker.bindPopup(popupContent, {
                maxWidth: 320,
                className: 'custom-popup',
            })
            markers.push(marker)
            bounds.extend([lat, lng])
        })

        // Fit map to show all markers
        if (markers.length > 0) {
            map.fitBounds(bounds, { padding: [50, 50] })
        }

        mapInstanceRef.current = map

        // Cleanup
        return () => {
            map.remove()
            mapInstanceRef.current = null
        }
    }, [places, zoom, mapType, userLocation, isLoadingLocation])

    return (
        <div style={{ position: 'relative', height, width: '100%' }}>
            {isLoadingLocation && (
                <div
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: 'rgba(255, 255, 255, 0.9)',
                        zIndex: 1000,
                        borderRadius: '8px',
                    }}
                >
                    <div style={{ textAlign: 'center' }}>
                        <div
                            style={{
                                width: '40px',
                                height: '40px',
                                border: '4px solid #e2e8f0',
                                borderTop: '4px solid hsl(var(--primary))',
                                borderRadius: '50%',
                                animation: 'spin 1s linear infinite',
                                margin: '0 auto 12px',
                            }}
                        />
                        <p style={{ color: '#64748b', fontSize: '14px', fontWeight: 500 }}>
                            Mendapatkan lokasi Anda...
                        </p>
                    </div>
                </div>
            )}
            <div ref={mapRef} style={{ height, width: '100%', borderRadius: '8px' }} />
            <style>{`
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }

                @keyframes pulse {
                    0%, 100% {
                        opacity: 1;
                        transform: translate(-50%, -50%) scale(1);
                    }
                    50% {
                        opacity: 0.5;
                        transform: translate(-50%, -50%) scale(1.3);
                    }
                }

                /* Remove Leaflet popup padding for full-width content */
                .custom-popup .leaflet-popup-content-wrapper {
                    padding: 0;
                    border-radius: 8px;
                    overflow: hidden;
                }

                .custom-popup .leaflet-popup-content {
                    margin: 0;
                    width: 280px !important;
                }

                .custom-popup .leaflet-popup-tip-container {
                    display: none;
                }
            `}</style>
        </div>
    )
}
