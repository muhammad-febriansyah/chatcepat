import React from 'react';
import { Sparkles } from 'lucide-react';
import { type FiturUnggulan } from '@/types/fitur-unggulan';
import { iconMap } from '../constants/iconMap';
import { motion } from 'framer-motion';

interface FiturUnggulanSectionProps {
    fiturUnggulans: FiturUnggulan[];
}

const ease = [0.16, 1, 0.3, 1] as const;

export function FiturUnggulanSection({ fiturUnggulans }: FiturUnggulanSectionProps) {
    if (fiturUnggulans.length === 0) return null;

    return (
        <section className="px-4 py-16 sm:px-6 sm:py-20 lg:py-24" style={{ backgroundColor: '#F7F9FC' }}>
            <div className="container mx-auto max-w-6xl">
                <motion.div
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-80px' }}
                    transition={{ duration: 0.7, ease }}
                    className="mb-12 space-y-4 text-center sm:mb-16"
                >
                    <h2 className="font-display text-3xl font-bold leading-tight text-slate-900 sm:text-4xl lg:text-5xl">
                        Fitur Unggulan{' '}
                        <span style={{ color: '#2547F9' }}>ChatCepat</span>
                    </h2>
                    <p className="mx-auto max-w-2xl text-base leading-relaxed text-slate-600 sm:text-lg">
                        Solusi lengkap untuk meningkatkan komunikasi bisnis Anda
                    </p>
                </motion.div>

                <div className="space-y-6">
                    {fiturUnggulans.map((fitur, index) => {
                        const IconComponent = iconMap[fitur.icon] || Sparkles;
                        const isEven = index % 2 === 0;

                        return (
                            <motion.div
                                key={fitur.id}
                                initial={{ opacity: 0, y: 40 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, margin: '-60px' }}
                                transition={{ duration: 0.7, delay: 0.05, ease }}
                                className="group overflow-hidden rounded-3xl bg-white p-6 shadow-sm transition-shadow duration-300 hover:shadow-xl sm:p-8"
                            >
                                <div className="grid gap-6 lg:grid-cols-2 lg:gap-8">
                                    {/* Content */}
                                    <motion.div
                                        initial={{ opacity: 0, x: isEven ? -24 : 24 }}
                                        whileInView={{ opacity: 1, x: 0 }}
                                        viewport={{ once: true, margin: '-40px' }}
                                        transition={{ duration: 0.7, delay: 0.1, ease }}
                                        className="flex flex-col justify-center space-y-4"
                                    >
                                        <div
                                            className="inline-flex items-center gap-3 self-start rounded-full border px-4 py-2"
                                            style={{ backgroundColor: 'white', borderColor: '#2547F9' }}
                                        >
                                            <IconComponent className="h-5 w-5" style={{ color: '#2547F9' }} strokeWidth={2.5} />
                                            <span className="text-base font-semibold sm:text-lg" style={{ color: '#2547F9' }}>
                                                {fitur.title}
                                            </span>
                                        </div>
                                        <p className="text-sm leading-relaxed text-slate-700 sm:text-base">
                                            {fitur.description}
                                        </p>
                                    </motion.div>

                                    {/* Image */}
                                    <motion.div
                                        initial={{ opacity: 0, x: isEven ? 24 : -24 }}
                                        whileInView={{ opacity: 1, x: 0 }}
                                        viewport={{ once: true, margin: '-40px' }}
                                        transition={{ duration: 0.7, delay: 0.15, ease }}
                                        className="flex items-center justify-center lg:justify-end"
                                    >
                                        {fitur.image ? (
                                            <div
                                                className="relative w-full max-w-md overflow-hidden rounded-2xl border-2 bg-gradient-to-br from-slate-50 to-white p-6 transition-all duration-300 group-hover:scale-105 group-hover:shadow-lg"
                                                style={{ borderColor: '#E0E7FF' }}
                                            >
                                                <img
                                                    src={`/storage/${fitur.image}`}
                                                    alt={fitur.title}
                                                    className="h-auto w-full object-contain"
                                                    style={{ maxHeight: '200px' }}
                                                />
                                            </div>
                                        ) : (
                                            <div
                                                className="flex h-48 w-full max-w-md items-center justify-center rounded-2xl border-2 transition-transform duration-300 group-hover:scale-105"
                                                style={{
                                                    background: 'linear-gradient(135deg, #2547F9 0%, #4a63f9 100%)',
                                                    borderColor: '#2547F9',
                                                }}
                                            >
                                                <div className="text-center text-white">
                                                    <IconComponent className="mx-auto h-16 w-16 mb-3 opacity-50" strokeWidth={1.5} />
                                                    <p className="text-sm font-medium opacity-75">Gambar akan ditampilkan di sini</p>
                                                </div>
                                            </div>
                                        )}
                                    </motion.div>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
