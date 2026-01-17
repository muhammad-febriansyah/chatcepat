import React from 'react';
import { Bot } from 'lucide-react';
import { type Feature } from '@/types/feature';
import { iconMap } from '../constants/iconMap';

interface FeaturesSectionProps {
    features: Feature[];
    settings: any;
}

export function FeaturesSection({ features, settings }: FeaturesSectionProps) {
    if (features.length === 0) return null;

    return (
        <section className="px-6 py-20" style={{ backgroundColor: '#F7F8FD' }}>
            <div className="container mx-auto max-w-6xl">
                <div className="mb-16 space-y-4 text-center">
                    <h2 className="text-3xl font-bold text-slate-900 leading-tight md:text-4xl md:leading-tight">
                        {(settings.features_heading as string) || 'Customer Kabur Gara-Gara Balas Chat Kelamaan ?'}
                        <span className="block mt-2" style={{ color: '#2547F9' }}>
                            {(settings.features_heading_highlight as string) || 'Saatnya Beralih ke ChatCepat !'}
                        </span>
                    </h2>
                    <p className="mx-auto max-w-2xl text-lg text-slate-600 leading-relaxed">
                        {(settings.features_description as string) || 'Balas Chat Sat Set dengan Bantuan AI Cerdas dan Humanis'}
                    </p>
                </div>

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {features.map((feature) => {
                        const IconComponent = iconMap[feature.icon] || Bot;
                        return (
                            <div
                                key={feature.id}
                                className="group relative rounded-2xl bg-white p-6 transition-all duration-300 hover:shadow-2xl hover:-translate-y-2"
                                style={{
                                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
                                }}
                            >
                                {/* Icon Circle */}
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

                                {/* Content */}
                                <h3 className="mb-3 text-lg font-bold text-slate-900 group-hover:text-[#2547F9] transition-colors">
                                    {feature.title}
                                </h3>
                                <p className="text-sm leading-relaxed text-slate-600 mb-4">
                                    {feature.description}
                                </p>

                                {/* Image if exists */}
                                {feature.image && (
                                    <div className="mt-4 overflow-hidden rounded-lg">
                                        <img
                                            src={`/storage/${feature.image}`}
                                            alt={feature.title}
                                            className="w-full h-auto max-h-40 object-cover transition-transform duration-300 group-hover:scale-105"
                                        />
                                    </div>
                                )}

                                {/* Hover Border Effect */}
                                <div
                                    className="absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-[#2547F9] transition-colors duration-300 pointer-events-none"
                                />
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
