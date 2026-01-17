import PageHeader from '@/components/page-header';
import HomeLayout from '@/layouts/home-layout';
import HelpSection from '@/components/help-section';
import { WhyChooseSection } from '@/features/landing/components/WhyChooseSection';
import { Check, Star, HelpCircle, Mail, ArrowRight } from 'lucide-react';
import { Link, usePage } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { type SharedData } from '@/types';

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

interface PricingProps {
    canRegister?: boolean;
    packages: PricingPackage[];
}

// Animation variants
const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.15,
            delayChildren: 0.2,
        },
    },
} as const;

const cardVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.8,
            ease: [0.16, 1, 0.3, 1] as any,
        },
    },
} as const;

const featureVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: (index: number) => ({
        opacity: 1,
        x: 0,
        transition: {
            duration: 0.5,
            delay: index * 0.03,
            ease: [0.16, 1, 0.3, 1] as any,
        },
    }),
} as const;

export default function Pricing({ canRegister = true, packages }: PricingProps) {
    const { settings } = usePage<SharedData>().props;

    return (
        <HomeLayout title="Harga" canRegister={canRegister}>
            <PageHeader
                title="Harga"
                description="Pilih paket yang sesuai dengan kebutuhan bisnis Anda"
                breadcrumbs={[
                    { name: 'Home', href: '/' },
                    { name: 'Harga' },
                ]}
            />

            {/* Pricing Content */}
            <div className="bg-gradient-to-b from-white to-slate-50 px-4 py-8 sm:px-6 sm:py-12">
                <div className="container mx-auto max-w-7xl">
                    {packages.length > 0 ? (
                        <motion.div
                            initial="hidden"
                            animate="visible"
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
                                        {/* Top accent bar */}
                                        {pkg.is_featured && (
                                            <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-primary to-primary/80"></div>
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
                                                    {pkg.name || 'Paket'}
                                                </h3>
                                                <p className="text-xs sm:text-sm text-slate-600 line-clamp-2">
                                                    {pkg.description || ''}
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
                                                    <motion.li
                                                        key={idx}
                                                        custom={idx}
                                                        initial="hidden"
                                                        animate="visible"
                                                        variants={featureVariants}
                                                        className="flex items-start gap-2"
                                                    >
                                                        <div className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-green-100 mt-0.5">
                                                            <Check className="h-3 w-3 text-green-600" />
                                                        </div>
                                                        <span className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                                                            {feature}
                                                        </span>
                                                    </motion.li>
                                                ))}
                                            </ul>

                                            <Link
                                                href={String(buttonUrl)}
                                                className={`inline-flex w-full items-center justify-center gap-1.5 rounded-lg px-4 py-2.5 text-sm sm:text-base text-center font-semibold shadow-md transition-all hover:shadow-lg ${
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
                    ) : (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                            className="py-12 text-center"
                        >
                            <div className="relative mx-auto max-w-2xl overflow-hidden rounded-xl border border-slate-200 bg-white p-8 sm:p-10 shadow-lg">
                                <div className="relative">
                                    <h3 className="mb-2 text-xl sm:text-2xl font-bold text-slate-900">
                                        Paket Harga Segera Hadir
                                    </h3>
                                    <p className="mb-6 text-sm sm:text-base text-slate-600">
                                        Kami sedang menyiapkan paket harga terbaik untuk Anda.
                                        Hubungi kami untuk informasi lebih lanjut.
                                    </p>
                                    <Link
                                        href="/contact"
                                        className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm sm:text-base font-semibold text-white shadow-md transition-all hover:bg-primary/90 hover:shadow-lg"
                                    >
                                        <Mail className="h-4 w-4" />
                                        Hubungi Kami
                                    </Link>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </div>
            </div>

            {/* Why Choose Section */}
            <WhyChooseSection settings={settings} />

            {/* Help Section Container */}
            <div className="bg-gradient-to-b from-white to-slate-50 px-4 py-8 sm:px-6 sm:py-10">
                <div className="container mx-auto max-w-7xl">
                    <HelpSection
                        title="Ada Pertanyaan?"
                        description="Jelajahi FAQ kami atau hubungi tim kami untuk bantuan lebih lanjut."
                        buttons={[
                            {
                                label: 'Lihat FAQ',
                                href: '/faq',
                                icon: HelpCircle,
                                variant: 'outline',
                            },
                            {
                                label: 'Hubungi Kami',
                                href: '/contact',
                                icon: Mail,
                                variant: 'primary',
                            },
                        ]}
                    />
                </div>
            </div>
        </HomeLayout>
    );
}
