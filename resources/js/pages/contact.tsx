import PageHeader from '@/components/page-header';
import HomeLayout from '@/layouts/home-layout';
import HelpSection from '@/components/help-section';
import { type SharedData } from '@/types';
import { usePage, useForm } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Send, Clock } from 'lucide-react';

interface ContactProps {
    canRegister?: boolean;
}

// Animation variants
const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
            delayChildren: 0.1,
        },
    },
} as const;

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.5,
            ease: [0.25, 0.1, 0.25, 1] as any,
        },
    },
} as const;

export default function Contact({ canRegister = true }: ContactProps) {
    const { settings } = usePage<SharedData>().props;
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        subject: '',
        message: '',
    });

    // Function to get maps embed HTML
    const getMapsEmbed = () => {
        if (!settings.google_maps_embed) return null;

        const embed = settings.google_maps_embed.trim();

        // Check if it's already an iframe HTML
        if (embed.startsWith('<iframe')) {
            return embed;
        }

        // Check if it's a URL - extract the src and create iframe
        if (embed.startsWith('http')) {
            return `<iframe src="${embed}" width="100%" height="450" style="border:0;" allowfullscreen="" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>`;
        }

        return null;
    };

    const mapsEmbed = getMapsEmbed();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/contact', {
            onSuccess: () => {
                reset();
            },
        });
    };

    return (
        <HomeLayout title="Hubungi Kami" canRegister={canRegister}>
            <PageHeader
                title="Hubungi Kami"
                description="Kami siap membantu Anda. Hubungi tim kami untuk pertanyaan, demo, atau diskusi kebutuhan bisnis"
                breadcrumbs={[
                    { name: 'Home', href: '/' },
                    { name: 'Kontak' },
                ]}
            />

            {/* Contact Content */}
            <div className="bg-gradient-to-b from-white to-slate-50 px-4 py-12 sm:px-6 sm:py-16 lg:py-20">
                <div className="container mx-auto max-w-7xl">
                    <motion.div
                        initial="hidden"
                        animate="visible"
                        variants={containerVariants}
                        className="grid gap-8 lg:grid-cols-3"
                    >
                        {/* Contact Info */}
                        <div className="space-y-6">
                            {/* Email */}
                            <motion.div
                                variants={itemVariants}
                                className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-md transition-all hover:shadow-lg hover:border-primary"
                            >
                                <div className="absolute -top-10 -right-10 h-24 w-24 rounded-full bg-primary/5 blur-2xl transition-all group-hover:bg-primary/10"></div>
                                <div className="relative">
                                    <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-primary shadow-lg">
                                        <Mail className="h-7 w-7 text-white" />
                                    </div>
                                    <h3 className="mb-2 text-lg font-bold text-slate-900">
                                        Email Kami
                                    </h3>
                                    <p className="mb-3 text-sm text-slate-600">
                                        Kirim email kapan saja
                                    </p>
                                    <a
                                        href="mailto:info@chatcepat.com"
                                        className="font-semibold text-primary hover:underline"
                                    >
                                        info@chatcepat.com
                                    </a>
                                </div>
                            </motion.div>

                            {/* Phone */}
                            <motion.div
                                variants={itemVariants}
                                className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-md transition-all hover:shadow-lg hover:border-primary"
                            >
                                <div className="absolute -top-10 -right-10 h-24 w-24 rounded-full bg-primary/5 blur-2xl transition-all group-hover:bg-primary/10"></div>
                                <div className="relative">
                                    <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-primary shadow-lg">
                                        <Phone className="h-7 w-7 text-white" />
                                    </div>
                                    <h3 className="mb-2 text-lg font-bold text-slate-900">
                                        Telepon
                                    </h3>
                                    <p className="mb-3 text-sm text-slate-600">
                                        Senin - Jumat, 09:00 - 18:00 WIB
                                    </p>
                                    <a
                                        href="tel:+622112345678"
                                        className="font-semibold text-primary hover:underline"
                                    >
                                        +62 21 1234 5678
                                    </a>
                                </div>
                            </motion.div>

                            {/* Address */}
                            <motion.div
                                variants={itemVariants}
                                className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-md transition-all hover:shadow-lg hover:border-primary"
                            >
                                <div className="absolute -top-10 -right-10 h-24 w-24 rounded-full bg-primary/5 blur-2xl transition-all group-hover:bg-primary/10"></div>
                                <div className="relative">
                                    <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-primary shadow-lg">
                                        <MapPin className="h-7 w-7 text-white" />
                                    </div>
                                    <h3 className="mb-2 text-lg font-bold text-slate-900">
                                        Alamat Kantor
                                    </h3>
                                    <p className="text-slate-600">
                                        Jakarta Selatan, DKI
                                        <br />
                                        Jakarta 12345
                                    </p>
                                </div>
                            </motion.div>

                            {/* Office Hours */}
                            <motion.div
                                variants={itemVariants}
                                className="relative overflow-hidden rounded-2xl border-2 border-primary bg-primary p-6 text-white shadow-lg"
                            >
                                <div className="absolute -top-10 -right-10 h-32 w-32 rounded-full bg-white/10 blur-2xl"></div>
                                <div className="relative">
                                    <Clock className="mb-4 h-12 w-12" />
                                    <h3 className="mb-3 text-lg font-bold">
                                        Jam Operasional
                                    </h3>
                                    <div className="space-y-2 text-sm">
                                        <p>Senin - Jumat: 09:00 - 18:00</p>
                                        <p>Sabtu: 09:00 - 14:00</p>
                                        <p>Minggu: Tutup</p>
                                    </div>
                                </div>
                            </motion.div>
                        </div>

                        {/* Contact Form */}
                        <motion.div variants={itemVariants} className="lg:col-span-2">
                            <div className="relative overflow-hidden rounded-2xl border border-slate-100 bg-white p-8 shadow-xl">
                                {/* Decorative blur */}
                                <div className="absolute -top-20 -right-20 h-40 w-40 rounded-full bg-primary/10 blur-3xl"></div>
                                <div className="absolute -bottom-20 -left-20 h-40 w-40 rounded-full bg-primary/10 blur-3xl"></div>

                                {/* Top accent bar */}
                                <div className="absolute top-0 right-0 left-0 h-1 bg-primary"></div>

                                <div className="relative">
                                    <h2 className="mb-6 text-2xl font-bold text-slate-900">
                                        Kirim Pesan
                                    </h2>

                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div className="grid gap-6 md:grid-cols-2">
                                        {/* Name */}
                                        <div>
                                            <label
                                                htmlFor="name"
                                                className="mb-2 block text-sm font-semibold text-slate-700"
                                            >
                                                Nama Lengkap *
                                            </label>
                                            <input
                                                type="text"
                                                id="name"
                                                name="name"
                                                value={data.name}
                                                onChange={(e) => setData('name', e.target.value)}
                                                required
                                                className="w-full rounded-lg border-2 border-slate-200 px-4 py-3 outline-none transition-all focus:border-primary focus:ring-4 focus:ring-primary/10"
                                                placeholder="John Doe"
                                            />
                                            {errors.name && (
                                                <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                                            )}
                                        </div>

                                        {/* Email */}
                                        <div>
                                            <label
                                                htmlFor="email"
                                                className="mb-2 block text-sm font-semibold text-slate-700"
                                            >
                                                Email *
                                            </label>
                                            <input
                                                type="email"
                                                id="email"
                                                name="email"
                                                value={data.email}
                                                onChange={(e) => setData('email', e.target.value)}
                                                required
                                                className="w-full rounded-lg border-2 border-slate-200 px-4 py-3 outline-none transition-all focus:border-primary focus:ring-4 focus:ring-primary/10"
                                                placeholder="john@example.com"
                                            />
                                            {errors.email && (
                                                <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Subject */}
                                    <div>
                                        <label
                                            htmlFor="subject"
                                            className="mb-2 block text-sm font-semibold text-slate-700"
                                        >
                                            Subjek *
                                        </label>
                                        <input
                                            type="text"
                                            id="subject"
                                            name="subject"
                                            value={data.subject}
                                            onChange={(e) => setData('subject', e.target.value)}
                                            required
                                            className="w-full rounded-lg border-2 border-slate-200 px-4 py-3 outline-none transition-all focus:border-primary focus:ring-4 focus:ring-primary/10"
                                            placeholder="Pertanyaan tentang produk"
                                        />
                                        {errors.subject && (
                                            <p className="mt-1 text-sm text-red-600">{errors.subject}</p>
                                        )}
                                    </div>

                                    {/* Message */}
                                    <div>
                                        <label
                                            htmlFor="message"
                                            className="mb-2 block text-sm font-semibold text-slate-700"
                                        >
                                            Pesan *
                                        </label>
                                        <textarea
                                            id="message"
                                            name="message"
                                            value={data.message}
                                            onChange={(e) => setData('message', e.target.value)}
                                            required
                                            rows={6}
                                            className="w-full resize-none rounded-lg border-2 border-slate-200 px-4 py-3 outline-none transition-all focus:border-primary focus:ring-4 focus:ring-primary/10"
                                            placeholder="Tulis pesan Anda di sini..."
                                        />
                                        {errors.message && (
                                            <p className="mt-1 text-sm text-red-600">{errors.message}</p>
                                        )}
                                    </div>

                                    {/* Submit Button */}
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-8 py-4 font-semibold text-white transition-all hover:bg-primary/90 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed md:w-auto"
                                    >
                                        <Send className="h-5 w-5" />
                                        {processing ? 'Mengirim...' : 'Kirim Pesan'}
                                    </button>
                                </form>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>

                    {/* Google Maps */}
                    {mapsEmbed && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6 }}
                            className="mt-12 sm:mt-16"
                        >
                            <div className="relative overflow-hidden rounded-2xl border border-slate-100 shadow-xl">
                                <div className="absolute top-0 right-0 left-0 h-1 bg-primary"></div>
                                <div
                                    dangerouslySetInnerHTML={{
                                        __html: mapsEmbed,
                                    }}
                                    className="w-full [&_iframe]:w-full [&_iframe]:h-[450px] [&_iframe]:border-0"
                                />
                            </div>
                        </motion.div>
                    )}

                    {/* Help Section */}
                    <HelpSection
                        title="Butuh Bantuan Segera?"
                        description="Tim support kami siap membantu Anda melalui berbagai channel komunikasi. Hubungi kami kapan saja!"
                        imageKey="contact_help_image"
                        buttons={[
                            {
                                label: 'Telepon Kami',
                                href: 'tel:+622112345678',
                                icon: Phone,
                                variant: 'outline',
                            },
                            {
                                label: 'Email Kami',
                                href: 'mailto:info@chatcepat.com',
                                icon: Mail,
                                variant: 'primary',
                            },
                        ]}
                        badges={[
                            {
                                label: 'Respon Cepat',
                                color: 'green',
                                animated: true,
                            },
                            {
                                label: '24/7 Support',
                                color: 'blue',
                                icon: Clock,
                            },
                            {
                                label: 'Email & Telepon',
                                color: 'purple',
                                icon: Mail,
                            },
                        ]}
                    />
                </div>
            </div>
        </HomeLayout>
    );
}
