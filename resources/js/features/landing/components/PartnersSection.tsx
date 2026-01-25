import { Marquee } from '@/components/ui/marquee'

interface Partner {
    id: number
    name: string
    image: string
    order: number
    is_active: boolean
}

interface PartnersSectionProps {
    partners: Partner[]
}

export function PartnersSection({ partners }: PartnersSectionProps) {
    if (!partners || partners.length === 0) {
        return null
    }

    // Split partners into two rows for alternating marquee effect
    const halfLength = Math.ceil(partners.length / 2)
    const firstRow = partners.slice(0, halfLength)
    const secondRow = partners.slice(halfLength)

    return (
        <section className="bg-white px-6 py-16 sm:py-20">
            <div className="container mx-auto max-w-7xl">
                <div className="mb-12 space-y-4 text-center">
                    <h2 className="font-display text-3xl font-bold leading-tight text-slate-900 md:text-4xl md:leading-tight">
                        Dipercaya Bisnis di
                        <span className="mt-2 block" style={{ color: '#2547F9' }}>
                            Seluruh Indonesia
                        </span>
                    </h2>
                    <p className="mx-auto max-w-2xl text-lg leading-relaxed text-slate-600">
                        Ribuan bisnis dari berbagai kota telah mempercayai ChatCepat untuk
                        meningkatkan customer experience mereka
                    </p>
                </div>

                <div className="relative space-y-8">
                    {/* First Row - Scrolling Right */}
                    <Marquee pauseOnHover className="[--duration:40s]">
                        {firstRow.map((partner) => (
                            <div
                                key={partner.id}
                                className="group flex h-24 w-48 items-center justify-center rounded-lg border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 hover:border-primary/30 hover:shadow-lg"
                            >
                                <img
                                    src={`/storage/${partner.image}`}
                                    alt={partner.name}
                                    className="max-h-16 w-auto object-contain transition-all duration-300"
                                    title={partner.name}
                                />
                            </div>
                        ))}
                    </Marquee>

                    {/* Second Row - Scrolling Left (reverse) */}
                    {secondRow.length > 0 && (
                        <Marquee reverse pauseOnHover className="[--duration:40s]">
                            {secondRow.map((partner) => (
                                <div
                                    key={partner.id}
                                    className="group flex h-24 w-48 items-center justify-center rounded-lg border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 hover:border-primary/30 hover:shadow-lg"
                                >
                                    <img
                                        src={`/storage/${partner.image}`}
                                        alt={partner.name}
                                        className="max-h-16 w-auto object-contain transition-all duration-300"
                                        title={partner.name}
                                    />
                                </div>
                            ))}
                        </Marquee>
                    )}

                    {/* Gradient Overlays */}
                    <div className="pointer-events-none absolute inset-y-0 left-0 w-1/12 bg-gradient-to-r from-white to-transparent"></div>
                    <div className="pointer-events-none absolute inset-y-0 right-0 w-1/12 bg-gradient-to-l from-white to-transparent"></div>
                </div>

                {/* Optional: Display count */}
                <div className="mt-12 text-center">
                    <p className="text-sm text-slate-500">
                        dan {partners.length}+ partner lainnya yang telah mempercayai kami
                    </p>
                </div>
            </div>
        </section>
    )
}
