import PageHeader from '@/components/page-header';
import HomeLayout from '@/layouts/home-layout';
import { motion } from 'framer-motion';
import { Calendar, Shield, Sparkles } from 'lucide-react';

interface Page {
    id: number;
    title: string;
    slug: string;
    content: string;
    excerpt?: string;
    meta_title?: string;
    meta_description?: string;
    is_active: boolean;
    updated_at: string;
}

interface TermsProps {
    page?: Page;
    canRegister?: boolean;
}

// Animation variants
const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.08,
            delayChildren: 0.1,
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
            ease: [0.25, 0.1, 0.25, 1],
        },
    },
};

const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.6,
            ease: [0.25, 0.1, 0.25, 1],
        },
    },
    hover: {
        y: -4,
        scale: 1.01,
        transition: {
            duration: 0.3,
            ease: 'easeOut',
        },
    },
};

const glowVariants = {
    rest: { opacity: 0, scale: 0.8 },
    hover: {
        opacity: 1,
        scale: 1.2,
        transition: {
            duration: 0.4,
            ease: 'easeOut',
        },
    },
};

export default function Terms({ page, canRegister = true }: TermsProps) {
    if (!page) {
        return (
            <HomeLayout title="Syarat & Ketentuan" canRegister={canRegister}>
                <PageHeader
                    title="Syarat & Ketentuan"
                    description="Syarat dan ketentuan penggunaan layanan"
                    breadcrumbs={[
                        { name: 'Home', href: '/' },
                        { name: 'Syarat & Ketentuan' },
                    ]}
                />
                <div className="container mx-auto px-6 py-20 text-center">
                    <p className="text-lg text-muted-foreground">
                        Halaman belum tersedia.
                    </p>
                </div>
            </HomeLayout>
        );
    }

    const formattedDate = new Date(page.updated_at).toLocaleDateString(
        'id-ID',
        {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        },
    );

    return (
        <HomeLayout
            title={page.meta_title || page.title}
            description={page.meta_description || page.excerpt}
            canRegister={canRegister}
        >
            <PageHeader
                title={page.title}
                description={
                    page.excerpt || 'Syarat dan ketentuan penggunaan layanan'
                }
                breadcrumbs={[
                    { name: 'Home', href: '/' },
                    { name: page.title },
                ]}
            />

            {/* Main Content */}
            <div className="bg-gradient-to-b from-white to-slate-50 px-4 py-12 sm:px-6 sm:py-16 lg:py-20">
                <div className="container mx-auto max-w-4xl">
                    {/* Header Card with Last Updated */}
                    <motion.div
                        initial="hidden"
                        animate="visible"
                        variants={containerVariants}
                        className="mb-12 sm:mb-16"
                    >
                        <motion.div
                            variants={cardVariants}
                            whileHover="hover"
                            className="relative overflow-hidden rounded-2xl border border-slate-100 bg-white p-6 shadow-lg sm:p-8"
                        >
                            {/* Decorative blur */}
                            <div className="absolute -top-20 -right-20 h-40 w-40 rounded-full bg-primary/10 blur-3xl"></div>
                            <div className="absolute -bottom-20 -left-20 h-40 w-40 rounded-full bg-primary/10 blur-3xl"></div>

                            <div className="relative flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                                <div className="flex items-start gap-3 sm:gap-4">
                                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary shadow-lg sm:h-14 sm:w-14">
                                        <Shield className="h-6 w-6 text-white sm:h-7 sm:w-7" />
                                    </div>
                                    <div>
                                        <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                                            <Sparkles className="h-3 w-3" />
                                            <span>Penting</span>
                                        </div>
                                        <h3 className="text-lg font-bold text-slate-900 sm:text-xl">
                                            Dokumen Legal
                                        </h3>
                                        <p className="mt-1 text-sm text-slate-600">
                                            Harap baca dengan saksama sebelum
                                            menggunakan layanan kami
                                        </p>
                                    </div>
                                </div>
                                <motion.div
                                    variants={itemVariants}
                                    className="flex items-center gap-2 text-sm text-slate-500"
                                >
                                    <Calendar className="h-4 w-4" />
                                    <span>Diperbarui: {formattedDate}</span>
                                </motion.div>
                            </div>
                        </motion.div>
                    </motion.div>

                    {/* Content Card */}
                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: '-100px' }}
                        variants={containerVariants}
                    >
                        <motion.div
                            variants={cardVariants}
                            whileHover="hover"
                            initial="rest"
                            className="group relative overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-xl"
                        >
                            {/* Animated glow effect on hover */}
                            <motion.div
                                variants={glowVariants}
                                className="absolute -top-24 -right-24 h-48 w-48 rounded-full bg-primary/15 blur-3xl"
                            />
                            <motion.div
                                variants={glowVariants}
                                className="absolute -bottom-24 -left-24 h-48 w-48 rounded-full bg-primary/15 blur-3xl"
                            />

                            {/* Top accent bar */}
                            <div className="absolute top-0 right-0 left-0 h-1 bg-primary"></div>

                            <div className="relative p-6 sm:p-10 lg:p-12">
                                {/* Content */}
                                <motion.div
                                    variants={itemVariants}
                                    className="prose prose-slate prose-headings:font-bold prose-headings:text-slate-900 prose-h2:text-2xl prose-h2:mt-8 prose-h2:mb-4 prose-h2:pb-3 prose-h2:border-b prose-h2:border-slate-200 prose-h3:text-xl prose-h3:mt-6 prose-h3:mb-3 prose-h3:text-primary prose-p:text-slate-700 prose-p:leading-relaxed prose-p:mb-4 prose-ul:my-4 prose-ul:text-slate-700 prose-li:my-2 prose-strong:text-slate-900 prose-strong:font-semibold prose-a:text-primary prose-a:no-underline hover:prose-a:underline max-w-none"
                                    dangerouslySetInnerHTML={{
                                        __html: page.content,
                                    }}
                                />
                            </div>
                        </motion.div>
                    </motion.div>
                </div>
            </div>
        </HomeLayout>
    );
}
