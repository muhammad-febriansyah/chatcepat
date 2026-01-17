import { ColumnDef } from '@tanstack/react-table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Star, Phone, Globe, MapPin, Trash2, Eye, Copy, Check } from 'lucide-react'
import { router } from '@inertiajs/react'
import { toast } from 'sonner'
import { useState } from 'react'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'

export type GoogleMapPlace = {
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

// Phone Section Component with Copy functionality (for modal)
function PhoneSection({ phone }: { phone: string }) {
    const [copied, setCopied] = useState(false)

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(phone)
            setCopied(true)
            toast.success('Nomor Telepon Disalin', {
                description: `${phone} berhasil disalin ke clipboard`,
            })
            setTimeout(() => setCopied(false), 2000)
        } catch (error) {
            toast.error('Gagal Menyalin', {
                description: 'Tidak dapat menyalin nomor telepon',
            })
        }
    }

    return (
        <div>
            <label className="text-sm font-semibold text-muted-foreground">Telepon</label>
            <div className="mt-1 flex items-center gap-2">
                <Phone className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">{phone}</span>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCopy}
                    className="h-7 px-2"
                >
                    {copied ? (
                        <>
                            <Check className="h-3 w-3 mr-1" />
                            Tersalin
                        </>
                    ) : (
                        <>
                            <Copy className="h-3 w-3 mr-1" />
                            Salin
                        </>
                    )}
                </Button>
            </div>
        </div>
    )
}

// Compact phone copy button for table
function PhoneCopyButton({ phone }: { phone: string }) {
    const [copied, setCopied] = useState(false)

    const handleCopy = async (e: React.MouseEvent) => {
        e.stopPropagation()
        try {
            await navigator.clipboard.writeText(phone)
            setCopied(true)
            toast.success('Nomor Disalin', {
                description: phone,
            })
            setTimeout(() => setCopied(false), 2000)
        } catch (error) {
            toast.error('Gagal Menyalin')
        }
    }

    return (
        <div className="flex items-center gap-1">
            <Phone className="h-3 w-3" />
            <span className="text-sm">{phone}</span>
            <button
                onClick={handleCopy}
                className="ml-1 p-0.5 hover:bg-slate-100 rounded transition-colors"
                title="Salin nomor"
            >
                {copied ? (
                    <Check className="h-3 w-3 text-green-600" />
                ) : (
                    <Copy className="h-3 w-3 text-slate-500 hover:text-primary" />
                )}
            </button>
        </div>
    )
}

// Detail Modal Component
function PlaceDetailModal({ place, open, onOpenChange }: {
    place: GoogleMapPlace
    open: boolean
    onOpenChange: (open: boolean) => void
}) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0">
                {/* Header with Primary Background */}
                <div className="bg-primary text-primary-foreground px-6 py-4 rounded-t-lg">
                    <DialogHeader>
                        <DialogTitle className="text-xl flex items-center gap-2 text-white">
                            <MapPin className="h-6 w-6" />
                            {place.name}
                        </DialogTitle>
                        <DialogDescription className="text-primary-foreground/90">
                            Detail lengkap informasi tempat
                        </DialogDescription>
                    </DialogHeader>
                </div>

                <div className="space-y-4 px-6 py-4">
                    {/* Category */}
                    {place.category && (
                        <div>
                            <label className="text-sm font-semibold text-muted-foreground">Kategori</label>
                            <div className="mt-1">
                                <Badge variant="secondary" className="text-sm">
                                    {place.category}
                                </Badge>
                            </div>
                        </div>
                    )}

                    {/* Rating */}
                    {place.rating && (
                        <div>
                            <label className="text-sm font-semibold text-muted-foreground">Rating</label>
                            <div className="mt-1 flex items-center gap-2">
                                <div className="flex items-center gap-1">
                                    <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                                    <span className="text-lg font-bold">{place.rating}</span>
                                </div>
                                {place.review_count && (
                                    <span className="text-sm text-muted-foreground">
                                        ({place.review_count.toLocaleString()} reviews)
                                    </span>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Location */}
                    <div>
                        <label className="text-sm font-semibold text-muted-foreground">Lokasi</label>
                        <div className="mt-1 space-y-1">
                            <div className="flex items-center gap-2">
                                <MapPin className="h-4 w-4 text-primary" />
                                <span className="font-medium">{place.kecamatan}</span>
                            </div>
                            <div className="text-sm text-muted-foreground pl-6">
                                {place.location}
                            </div>
                        </div>
                    </div>

                    {/* Address */}
                    {place.address && (
                        <div>
                            <label className="text-sm font-semibold text-muted-foreground">Alamat Lengkap</label>
                            <p className="mt-1 text-sm">{place.address}</p>
                        </div>
                    )}

                    {/* Phone */}
                    {place.phone && (
                        <PhoneSection phone={place.phone} />
                    )}

                    {/* Website */}
                    {place.website && (
                        <div>
                            <label className="text-sm font-semibold text-muted-foreground">Website</label>
                            <div className="mt-1 flex items-center gap-2">
                                <Globe className="h-4 w-4 text-primary" />
                                <a
                                    href={place.website}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 hover:underline break-all"
                                >
                                    {place.website}
                                </a>
                            </div>
                        </div>
                    )}

                    {/* Google Maps URL */}
                    {place.url && (
                        <div className="pt-4 border-t">
                            <label className="text-sm font-semibold text-muted-foreground">Google Maps</label>
                            <div className="mt-2">
                                <a
                                    href={place.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors text-sm font-medium"
                                >
                                    <MapPin className="h-4 w-4" />
                                    Lihat di Google Maps
                                </a>
                            </div>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    )
}

// Action Cell Component
function ActionCell({ place }: { place: GoogleMapPlace }) {
    const [showDetail, setShowDetail] = useState(false)

    const handleDelete = async () => {
        if (!confirm(`Apakah Anda yakin ingin menghapus "${place.name}"?`)) return

        try {
            router.delete(`/user/scraper/${place.id}`, {
                onSuccess: () => {
                    toast.success('Data Berhasil Dihapus', {
                        description: `${place.name} telah dihapus dari database`,
                    })
                },
                onError: () => {
                    toast.error('Gagal Menghapus Data', {
                        description: 'Terjadi kesalahan saat menghapus data. Silakan coba lagi.',
                    })
                },
            })
        } catch (error) {
            toast.error('Terjadi Kesalahan', {
                description: 'Error tidak terduga. Silakan refresh halaman dan coba lagi.',
            })
        }
    }

    return (
        <>
            <div className="flex items-center gap-2">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowDetail(true)}
                >
                    <Eye className="h-4 w-4 mr-2" />
                    Detail
                </Button>
                <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleDelete}
                >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Hapus
                </Button>
            </div>

            <PlaceDetailModal
                place={place}
                open={showDetail}
                onOpenChange={setShowDetail}
            />
        </>
    )
}

export const columns: ColumnDef<GoogleMapPlace>[] = [
    {
        id: 'number',
        header: 'No',
        cell: ({ row, table }) => {
            // Get page index and page size from table state
            const pageIndex = table.getState().pagination.pageIndex
            const pageSize = table.getState().pagination.pageSize
            return (
                <div className="w-12 text-center font-medium">
                    {pageIndex * pageSize + row.index + 1}
                </div>
            )
        },
    },
    {
        accessorKey: 'name',
        header: 'Nama Tempat',
        cell: ({ row }) => {
            const url = row.original.url
            return (
                <div className="flex flex-col gap-1">
                    <div className="font-medium">
                        {url ? (
                            <a
                                href={url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="hover:underline text-blue-600"
                            >
                                {row.getValue('name')}
                            </a>
                        ) : (
                            row.getValue('name')
                        )}
                    </div>
                    {row.original.category && (
                        <Badge variant="secondary" className="w-fit text-xs">
                            {row.original.category}
                        </Badge>
                    )}
                </div>
            )
        },
    },
    {
        accessorKey: 'location',
        header: 'Lokasi',
        cell: ({ row }) => {
            return (
                <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-1 text-sm">
                        <MapPin className="h-3 w-3" />
                        {row.original.kecamatan}
                    </div>
                    <div className="text-xs text-muted-foreground">{row.getValue('location')}</div>
                </div>
            )
        },
    },
    {
        accessorKey: 'rating',
        header: 'Rating',
        cell: ({ row }) => {
            const rating = row.getValue('rating') as number | null
            const reviewCount = row.original.review_count

            if (!rating) return <span className="text-muted-foreground">-</span>

            return (
                <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-medium">{rating}</span>
                    {reviewCount && (
                        <span className="text-xs text-muted-foreground">({reviewCount})</span>
                    )}
                </div>
            )
        },
    },
    {
        accessorKey: 'phone',
        header: 'Kontak',
        cell: ({ row }) => {
            const phone = row.original.phone
            const website = row.original.website

            return (
                <div className="flex flex-col gap-1">
                    {phone && <PhoneCopyButton phone={phone} />}
                    {website && (
                        <div className="flex items-center gap-1 text-sm">
                            <Globe className="h-3 w-3" />
                            <a
                                href={website}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="hover:underline text-blue-600 truncate max-w-[150px]"
                                title={website}
                            >
                                Website
                            </a>
                        </div>
                    )}
                    {!phone && !website && <span className="text-muted-foreground">-</span>}
                </div>
            )
        },
    },
    {
        id: 'actions',
        header: 'Aksi',
        cell: ({ row }) => {
            return <ActionCell place={row.original} />
        },
    },
]
