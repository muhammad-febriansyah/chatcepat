import React from 'react';
import { Bot } from 'lucide-react';
import { type Feature } from '@/types/feature';
import { iconMap } from '../constants/iconMap';
import { motion } from 'framer-motion';

interface FeaturesSectionProps {
    features: Feature[];
    settings: any;
}

const ease = [0.16, 1, 0.3, 1] as const;

export function FeaturesSection({ features, settings }: FeaturesSectionProps) {
    if (features.length === 0) return null;

    return (
        <section className="px-6 py-20" style={{ backgroundColor: '#F7F8FD' }}>
            <div className="container mx-auto max-w-6xl">
                <motion.div
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-80px' }}
                    transition={{ duration: 0.7, ease }}
                    className="mb-16 space-y-4 text-center"
                >
                    <h2 className="font-display text-3xl font-bold text-slate-900 leading-tight md:text-4xl md:leading-tight">
                        {(settings.features_heading as string) || 'Customer Kabur Gara-Gara Balas Chat Kelamaan ?'}
                        <span className="block mt-2" style={{ color: '#2547F9' }}>
                            {(settings.features_heading_highlight as string) || 'Saatnya Beralih ke ChatCepat !'}
                        </span>
                    </h2>
                    <p className="mx-auto max-w-2xl text-lg text-slate-600 leading-relaxed">
                        {(settings.features_description as string) || 'Balas Chat Sat Set dengan Bantuan AI Cerdas dan Humanis'}
                    </p>
                </motion.div>

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {features.map((feature, index) => {
                        const IconComponent = iconMap[feature.icon] || Bot;
                        return (
                            <motion.div
                                key={feature.id}
                                initial={{ opacity: 0, y: 32 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, margin: '-60px' }}
                                transition={{ duration: 0.6, delay: index * 0.08, ease }}
                                whileHover={{ y: -8, transition: { duration: 0.3, ease: 'easeOut' } }}
                                className="group relative rounded-2xl bg-white p-6 transition-shadow duration-300 hover:shadow-2xl"
                                style={{ boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -1px rgba(0,0,0,0.03)' }}
                            >
                                <div className="mb-5">
                                    <div
                                        className="inline-flex h-16 w-16 items-center justify-center rounded-full transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6"
                                        style={{
                                            background: 'linear-gradient(135deg, #2547F9 0%, #1e3fcc 100%)',
                                            boxShadow: '0 10px 25px -5px rgba(37, 71, 249, 0.4)',
                                        }}
                                    >
                                        <IconComponent className="h-7 w-7 text-white" strokeWidth={2} />
                                    </div>
                                </div>

                                <h3 className="font-display mb-3 text-lg font-bold text-slate-900 group-hover:text-[#2547F9] transition-colors">
                                    {feature.title}
                                </h3>
                                <p className="text-sm leading-relaxed text-slate-600 mb-4">
                                    {feature.description}
                                </p>

                                {feature.image && (
                                    <div className="mt-4 overflow-hidden rounded-lg">
                                        <img
                                            src={`/storage/${feature.image}`}
                                            alt={feature.title}
                                            className="w-full h-auto max-h-40 object-cover transition-transform duration-300 group-hover:scale-105"
                                        />
                                    </div>
                                )}

                                <div className="absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-[#2547F9] transition-colors duration-300 pointer-events-none" />
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
