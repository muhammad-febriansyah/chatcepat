import { Check, Star, ArrowRight } from 'lucide-react';
import { Link } from '@inertiajs/react';
import { motion } from 'framer-motion';

interface PricingPackage {
    id: number;
    name: string;
    slug: string;
    description: string;
    price: string;
    currency: string;
    period: number;
    period_unit: string;
    features: string[];
    is_featured: boolean;
    is_active: boolean;
    button_text: string;
    button_url: string;
    formatted_price: string;
    period_text: string;
}

interface PricingSectionProps {
    packages: PricingPackage[];
}

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.15, delayChildren: 0.2 },
    },
} as const;

const cardVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] as any },
    },
} as const;

export function PricingSection({ packages }: PricingSectionProps) {
    if (!packages || packages.length === 0) return null;

    return (
        <section id="harga" className="bg-gradient-to-b from-slate-50 to-white px-4 py-16 sm:px-6 sm:py-20">
            <div className="container mx-auto max-w-7xl">
                {/* Heading */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="mb-10 text-center"
                >
                    <span className="mb-3 inline-block rounded-full bg-primary/10 px-4 py-1.5 text-sm font-semibold text-primary">
                        Harga
                    </span>
                    <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                        Paket yang Sesuai Kebutuhan Anda
                    </h2>
                    <p className="mx-auto mt-4 max-w-2xl text-base text-slate-600">
                        Pilih paket yang tepat untuk bisnis Anda. Mulai gratis, upgrade kapan saja.
                    </p>
                </motion.div>

                {/* Cards */}
                <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: '-100px' }}
                    variants={containerVariants}
                    className="grid gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                >
                    {packages.map((pkg, index) => {
                        if (!pkg) return null;
                        const buttonUrl = pkg.button_url || '/register';
                        const buttonText = pkg.button_text || 'Pilih Paket';

                        return (
                            <motion.div
                                key={pkg.id}
                                variants={cardVariants}
                                whileHover={{
                                    y: -4,
                                    scale: 1.01,
                                    transition: { duration: 0.3, ease: 'easeOut' },
                                }}
                                className={`group relative overflow-hidden rounded-xl bg-white shadow-lg transition-all hover:shadow-xl ${
                                    pkg.is_featured
                                        ? 'border-2 border-primary ring-2 ring-primary/10'
                                        : 'border border-slate-200 hover:border-primary/50'
                                }`}
                            >
                                {pkg.is_featured && (
                                    <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-primary to-primary/80" />
                                )}

                                {pkg.is_featured && (
                                    <div className="absolute top-3 right-3 z-10">
                                        <motion.span
                                            initial={{ scale: 0.8, opacity: 0 }}
                                            animate={{ scale: 1, opacity: 1 }}
                                            transition={{ delay: 0.3 + index * 0.1 }}
                                            className="inline-flex items-center gap-1 rounded-full bg-primary px-2.5 py-1 text-xs font-semibold text-white shadow-md"
                                        >
                                            <Star className="h-3 w-3 fill-white" />
                                            Populer
                                        </motion.span>
                                    </div>
                                )}

                                <div className="relative flex h-full flex-col p-4 sm:p-5">
                                    <div className="mb-4 text-center">
                                        <h3 className="mb-1.5 text-lg sm:text-xl font-bold text-slate-900">
                                            {pkg.name}
                                        </h3>
                                        <p className="text-xs sm:text-sm text-slate-600 line-clamp-2">
                                            {pkg.description}
                                        </p>
                                    </div>

                                    <div className="mb-5 text-center">
                                        <div className="flex items-baseline justify-center gap-1">
                                            <span className="text-2xl sm:text-3xl font-bold text-primary">
                                                {pkg.formatted_price}
                                            </span>
                                        </div>
                                        <p className="mt-1 text-xs sm:text-sm text-slate-500">
                                            per {pkg.period_text}
                                        </p>
                                    </div>

                                    <ul className="mb-5 flex-1 space-y-2.5">
                                        {Array.isArray(pkg.features) && pkg.features.map((feature, idx) => (
                                            <li key={idx} className="flex items-start gap-2">
                                                <div className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-green-100 mt-0.5">
                                                    <Check className="h-3 w-3 text-green-600" />
                                                </div>
                                                <span className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                                                    {feature}
                                                </span>
                                            </li>
                                        ))}
                                    </ul>

                                    <Link
                                        href={String(buttonUrl)}
                                        className={`inline-flex w-full items-center justify-center gap-1.5 rounded-lg px-4 py-2.5 text-sm font-semibold shadow-md transition-all hover:shadow-lg ${
                                            pkg.is_featured
                                                ? 'bg-primary text-white hover:bg-primary/90'
                                                : 'border-2 border-slate-200 bg-white text-slate-900 hover:border-primary hover:bg-primary hover:text-white'
                                        }`}
                                    >
                                        {buttonText}
                                        <ArrowRight className="h-4 w-4" />
                                    </Link>
                                </div>
                            </motion.div>
                        );
                    })}
                </motion.div>

                {/* Link to full pricing page */}
                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.4 }}
                    className="mt-8 text-center"
                >
                    <Link
                        href="/pricing"
                        className="text-sm text-slate-500 underline-offset-4 hover:text-primary hover:underline transition-colors"
                    >
                        Lihat detail semua paket →
                    </Link>
                </motion.div>
            </div>
        </section>
    );
}
