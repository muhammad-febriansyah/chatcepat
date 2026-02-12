import { motion } from 'framer-motion';
import { X, Check } from 'lucide-react';

const beforeItems = [
    'Chat selalu slow respon',
    'Membalas chat sesuai antrian',
    'Chat hanya bisa dilakukan pada jam kerja',
    'Harus merekrut karyawan khusus untuk melayani chat pelanggan',
    'Calon pelanggan lari ke perusahaan lain',
    'Tingkat konversi sangat rendah, omset terjun bebas',
];

const afterItems = [
    'Chat selalu fast respon dalam hitungan detik',
    'Membalas ribuan chat dalam waktu bersamaan',
    'Chat bisa dilakukan 24/7 Non-Stop tanpa libur',
    'Tidak perlu merekrut karyawan khusus, hemat budget ratusan juta',
    'Calon pelanggan puas dengan layanan',
    'Tingkat konversi terus meningkat, omset semakin melesat',
];

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.08, delayChildren: 0.1 },
    },
};

const itemVariants = {
    hidden: { opacity: 0, x: -16 },
    visible: {
        opacity: 1,
        x: 0,
        transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as any },
    },
};

export function TransformasiSection() {
    return (
        <section className="bg-white px-4 py-16 sm:px-6 sm:py-20">
            <div className="container mx-auto max-w-5xl">
                {/* Heading */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="mb-12 text-center"
                >
                    <span className="mb-3 inline-block rounded-full bg-primary/10 px-4 py-1.5 text-sm font-semibold text-primary">
                        Transformasi
                    </span>
                    <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                        Transformasi CRM Bisnis Anda dengan{' '}
                        <span className="text-primary">ChatCepat</span>
                    </h2>
                </motion.div>

                {/* Before / After Grid */}
                <div className="grid gap-6 md:grid-cols-2">
                    {/* Before */}
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                        className="rounded-2xl border border-red-100 bg-red-50/60 p-6 sm:p-8"
                    >
                        <div className="mb-5 flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
                                <X className="h-5 w-5 text-red-500" strokeWidth={2.5} />
                            </div>
                            <h3 className="text-lg font-bold text-red-700">Sebelum Pakai ChatCepat</h3>
                        </div>

                        <motion.ul
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true }}
                            variants={containerVariants}
                            className="space-y-3.5"
                        >
                            {beforeItems.map((item, i) => (
                                <motion.li key={i} variants={itemVariants} className="flex items-start gap-3">
                                    <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-red-200">
                                        <X className="h-3 w-3 text-red-600" strokeWidth={3} />
                                    </div>
                                    <span className="text-sm leading-relaxed text-slate-700">{item}</span>
                                </motion.li>
                            ))}
                        </motion.ul>
                    </motion.div>

                    {/* After */}
                    <motion.div
                        initial={{ opacity: 0, x: 30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                        className="rounded-2xl border border-green-100 bg-green-50/60 p-6 sm:p-8"
                    >
                        <div className="mb-5 flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
                                <Check className="h-5 w-5 text-green-600" strokeWidth={2.5} />
                            </div>
                            <h3 className="text-lg font-bold text-green-700">Setelah Pakai ChatCepat</h3>
                        </div>

                        <motion.ul
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true }}
                            variants={containerVariants}
                            className="space-y-3.5"
                        >
                            {afterItems.map((item, i) => (
                                <motion.li key={i} variants={itemVariants} className="flex items-start gap-3">
                                    <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-green-200">
                                        <Check className="h-3 w-3 text-green-600" strokeWidth={3} />
                                    </div>
                                    <span className="text-sm leading-relaxed text-slate-700">{item}</span>
                                </motion.li>
                            ))}
                        </motion.ul>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
