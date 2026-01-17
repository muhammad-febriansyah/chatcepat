import PageHeader from '@/components/page-header';
import HomeLayout from '@/layouts/home-layout';
import {
    CheckCircle, Eye, Target, Award, Sparkles,
    MessageSquare, Phone, Lock, FolderOpen, Palette, Bot,
    Zap, Shield, Users, Settings, Heart, Star, type LucideIcon
} from 'lucide-react';
import { motion } from 'framer-motion';

// Icon mapping
const iconMap: Record<string, LucideIcon> = {
    MessageSquare,
    Phone,
    Lock,
    FolderOpen,
    Palette,
    Bot,
    Zap,
    Shield,
    Users,
    Settings,
    Heart,
    Star,
    Sparkles,
};

interface Value {
    title: string;
    description: string;
}

interface Feature {
    id: number;
    icon: string;
    title: string;
    description: string;
    order: number;
    is_active: boolean;
}

interface AboutPageData {
    id: number;
    title: string;
    description: string;
    content: string;
    vision: string;
    mission: string;
    values: Value[];
    image?: string;
}

interface AboutProps {
    aboutPage: AboutPageData;
    features?: Feature[];
    canRegister?: boolean;
}

// Animation variants
const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
        },
    },
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.5,
        },
    },
};

const cardHoverVariants = {
    rest: { scale: 1, y: 0 },
    hover: {
        scale: 1.03,
        y: -8,
        transition: {
            duration: 0.3,
            ease: 'easeOut',
        },
    },
};

export default function About({ aboutPage, features = [], canRegister = true }: AboutProps) {
    if (!aboutPage) {
        return (
            <HomeLayout title="Tentang Kami" canRegister={canRegister}>
                <PageHeader
                    title="Tentang Kami"
                    description="Pelajari lebih lanjut tentang misi, visi, dan nilai-nilai kami"
                    breadcrumbs={[
                        { name: 'Home', href: '/' },
                        { name: 'Tentang Kami' },
                    ]}
                />
                <div className="container mx-auto px-6 py-20 text-center">
                    <p className="text-lg text-muted-foreground">
                        Data tentang kami belum tersedia.
                    </p>
                </div>
            </HomeLayout>
        );
    }

    return (
        <HomeLayout
            title={aboutPage.title}
            description={aboutPage.description}
            canRegister={canRegister}
        >
            {/* Page Header */}
            <PageHeader
                title={aboutPage.title}
                description={aboutPage.description}
                breadcrumbs={[
                    { name: 'Home', href: '/' },
                    { name: 'Tentang Kami' },
                ]}
            />

            {/* Main Content */}
            <div className="overflow-hidden bg-white py-12 sm:py-16 lg:py-20">
                <div className="mx-auto max-w-7xl px-4 sm:px-6">
                    {/* About Content */}
                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: "-100px" }}
                        variants={containerVariants}
                        className="mb-16 sm:mb-20 lg:mb-24"
                    >
                        <motion.div variants={itemVariants} className="relative">
                            {/* Decorative blur elements */}
                            <div className="absolute -top-20 -left-20 h-40 w-40 bg-blue-500/20 rounded-full blur-3xl"></div>
                            <div className="absolute -bottom-20 -right-20 h-48 w-48 bg-blue-600/20 rounded-full blur-3xl"></div>

                            <div className="relative bg-white rounded-2xl p-6 sm:p-8 lg:p-12 shadow-lg border border-slate-100">
                                <div className="flex items-start gap-3 sm:gap-4 mb-6">
                                    <div className="flex h-12 w-12 sm:h-14 sm:w-14 shrink-0 items-center justify-center rounded-xl bg-blue-600 shadow-lg">
                                        <Sparkles className="h-6 w-6 sm:h-7 sm:w-7 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-slate-900 mb-2">Tentang Kami</h3>
                                        <div className="h-1 w-16 sm:w-20 bg-blue-600 rounded-full"></div>
                                    </div>
                                </div>
                                <p className="text-sm sm:text-base leading-relaxed text-slate-700">
                                    {aboutPage.content}
                                </p>
                            </div>
                        </motion.div>
                    </motion.div>

                    {/* Vision & Mission */}
                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: "-100px" }}
                        variants={containerVariants}
                        className="mb-16 sm:mb-20 lg:mb-24 grid gap-6 sm:gap-8 md:grid-cols-2"
                    >
                        {/* Vision */}
                        {aboutPage.vision && (
                            <motion.div
                                variants={itemVariants}
                                whileHover="hover"
                                initial="rest"
                                className="relative overflow-hidden rounded-2xl bg-white p-6 sm:p-8 lg:p-10 shadow-lg border border-slate-100"
                            >
                                {/* Blur effect */}
                                <div className="absolute top-0 right-0 -mr-16 -mt-16 h-32 w-32 bg-blue-500/30 rounded-full blur-3xl"></div>

                                <div className="relative">
                                    <div className="mb-6 flex items-center gap-3 sm:gap-4">
                                        <div className="flex h-12 w-12 sm:h-14 sm:w-14 shrink-0 items-center justify-center rounded-xl bg-blue-600">
                                            <Eye className="h-6 w-6 sm:h-7 sm:w-7 text-white" />
                                        </div>
                                        <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-900">
                                            Visi Kami
                                        </h2>
                                    </div>
                                    <p className="text-sm sm:text-base leading-relaxed text-slate-700">
                                        {aboutPage.vision}
                                    </p>
                                </div>
                            </motion.div>
                        )}

                        {/* Mission */}
                        {aboutPage.mission && (
                            <motion.div
                                variants={itemVariants}
                                whileHover="hover"
                                initial="rest"
                                className="relative overflow-hidden rounded-2xl bg-white p-6 sm:p-8 lg:p-10 shadow-lg border border-slate-100"
                            >
                                {/* Blur effect */}
                                <div className="absolute top-0 right-0 -mr-16 -mt-16 h-32 w-32 bg-blue-600/30 rounded-full blur-3xl"></div>

                                <div className="relative">
                                    <div className="mb-6 flex items-center gap-3 sm:gap-4">
                                        <div className="flex h-12 w-12 sm:h-14 sm:w-14 shrink-0 items-center justify-center rounded-xl bg-blue-600">
                                            <Target className="h-6 w-6 sm:h-7 sm:w-7 text-white" />
                                        </div>
                                        <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-900">
                                            Misi Kami
                                        </h2>
                                    </div>
                                    <p className="text-sm sm:text-base leading-relaxed text-slate-700">
                                        {aboutPage.mission}
                                    </p>
                                </div>
                            </motion.div>
                        )}
                    </motion.div>

                    {/* Features Section */}
                    {features && features.length > 0 && (
                        <motion.div
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true, margin: "-100px" }}
                            variants={containerVariants}
                            className="mb-16 sm:mb-20 lg:mb-24"
                        >
                            <motion.div variants={itemVariants} className="mb-10 sm:mb-12 lg:mb-16 text-center">
                                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 text-blue-700 font-medium mb-4">
                                    <Sparkles className="h-4 w-4" />
                                    <span className="text-sm">Fitur Unggulan</span>
                                </div>
                                <h2 className="mb-4 text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900">
                                    Fitur-Fitur Kami
                                </h2>
                                <p className="text-sm sm:text-base lg:text-lg text-slate-600 max-w-2xl mx-auto">
                                    Solusi lengkap untuk kebutuhan bisnis Anda
                                </p>
                            </motion.div>

                            <div className="grid gap-6 sm:gap-8 sm:grid-cols-2 lg:grid-cols-3">
                                {features.map((feature, index) => (
                                    <motion.div
                                        key={feature.id}
                                        variants={itemVariants}
                                        whileHover="hover"
                                        initial="rest"
                                        custom={index}
                                        className="group relative"
                                    >
                                        <motion.div
                                            variants={cardHoverVariants}
                                            className="relative h-full overflow-hidden rounded-2xl bg-white p-6 sm:p-8 shadow-lg border border-slate-100"
                                        >
                                            {/* Blur effect on hover */}
                                            <div className="absolute top-0 right-0 -mr-10 -mt-10 h-24 w-24 bg-blue-500/0 group-hover:bg-blue-500/20 rounded-full blur-2xl transition-all duration-300"></div>

                                            <div className="relative">
                                                <div className="mb-4 flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-xl bg-blue-600 text-white transition-transform group-hover:scale-110">
                                                    {(() => {
                                                        const IconComponent = iconMap[feature.icon] || Sparkles;
                                                        return <IconComponent className="h-6 w-6 sm:h-7 sm:w-7" />;
                                                    })()}
                                                </div>
                                                <h3 className="mb-3 text-base sm:text-lg lg:text-xl font-bold text-slate-900">
                                                    {feature.title}
                                                </h3>
                                                <p className="text-xs sm:text-sm leading-relaxed text-slate-600">
                                                    {feature.description}
                                                </p>
                                            </div>
                                        </motion.div>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {/* Values Section */}
                    {aboutPage.values && aboutPage.values.length > 0 && (
                        <motion.div
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true, margin: "-100px" }}
                            variants={containerVariants}
                        >
                            <motion.div variants={itemVariants} className="mb-10 sm:mb-12 lg:mb-16 text-center">
                                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 text-blue-700 font-medium mb-4">
                                    <Award className="h-4 w-4" />
                                    <span className="text-sm">Core Values</span>
                                </div>
                                <h2 className="mb-4 text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900">
                                    Nilai-Nilai Kami
                                </h2>
                                <p className="text-sm sm:text-base lg:text-lg text-slate-600 max-w-2xl mx-auto">
                                    Prinsip yang memandu setiap langkah kami
                                </p>
                            </motion.div>

                            <div className="grid gap-6 sm:gap-8 sm:grid-cols-2 lg:grid-cols-4">
                                {aboutPage.values.map((value, index) => (
                                    <motion.div
                                        key={index}
                                        variants={itemVariants}
                                        whileHover="hover"
                                        initial="rest"
                                        custom={index}
                                        className="group relative"
                                    >
                                        <motion.div
                                            variants={cardHoverVariants}
                                            className="relative h-full overflow-hidden rounded-2xl bg-white p-6 sm:p-8 shadow-lg border border-slate-100"
                                        >
                                            {/* Top blue bar */}
                                            <div className="absolute top-0 left-0 right-0 h-1 bg-blue-600"></div>

                                            {/* Blur effect */}
                                            <div className="absolute bottom-0 right-0 -mr-10 -mb-10 h-24 w-24 bg-blue-500/0 group-hover:bg-blue-500/20 rounded-full blur-2xl transition-all duration-300"></div>

                                            <div className="relative">
                                                <div className="mb-4 flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-xl bg-blue-50 text-blue-600 transition-transform group-hover:scale-110">
                                                    <CheckCircle className="h-6 w-6 sm:h-7 sm:w-7" />
                                                </div>
                                                <h3 className="mb-3 text-base sm:text-lg lg:text-xl font-bold text-slate-900">
                                                    {value.title}
                                                </h3>
                                                <p className="text-xs sm:text-sm leading-relaxed text-slate-600">
                                                    {value.description}
                                                </p>
                                            </div>
                                        </motion.div>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </div>
            </div>

            {/* CTA Section */}
            {canRegister && (
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="overflow-hidden bg-slate-50 py-12 sm:py-16 lg:py-20"
                >
                    <div className="mx-auto max-w-5xl px-4 sm:px-6">
                        <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-white p-8 sm:p-12 lg:p-16 shadow-xl border border-slate-100">
                            {/* Decorative blur elements */}
                            <div className="absolute top-0 right-0 -mr-20 -mt-20 h-48 w-48 bg-blue-500/30 rounded-full blur-3xl"></div>
                            <div className="absolute bottom-0 left-0 -ml-20 -mb-20 h-48 w-48 bg-blue-600/30 rounded-full blur-3xl"></div>

                            <div className="relative z-10 text-center space-y-6 sm:space-y-8">
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    whileInView={{ opacity: 1, scale: 1 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: 0.2 }}
                                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 text-blue-700 font-medium"
                                >
                                    <Sparkles className="h-4 w-4" />
                                    <span className="text-sm">Mulai Sekarang</span>
                                </motion.div>

                                <motion.h2
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: 0.3 }}
                                    className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900"
                                >
                                    Siap Bergabung Bersama Kami?
                                </motion.h2>

                                <motion.p
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: 0.4 }}
                                    className="mx-auto max-w-2xl text-sm sm:text-base lg:text-lg text-slate-600 leading-relaxed"
                                >
                                    Mulai perjalanan transformasi digital bisnis Anda bersama kami dan rasakan perbedaannya
                                </motion.p>

                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: 0.5 }}
                                    className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4"
                                >
                                    <motion.a
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        href="/register"
                                        className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 sm:px-8 py-3 sm:py-4 text-sm sm:text-base font-semibold text-white shadow-lg hover:bg-blue-700 transition-colors"
                                    >
                                        Daftar Sekarang Gratis
                                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                        </svg>
                                    </motion.a>
                                    <motion.a
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        href="/contact"
                                        className="inline-flex items-center gap-2 rounded-xl border-2 border-slate-200 bg-white px-6 sm:px-8 py-3 sm:py-4 text-sm sm:text-base font-semibold text-slate-700 hover:border-blue-600 hover:text-blue-600 transition-colors"
                                    >
                                        Hubungi Kami
                                    </motion.a>
                                </motion.div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}
        </HomeLayout>
    );
}
