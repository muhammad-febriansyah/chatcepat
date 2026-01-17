import React from 'react';
import { Bot, CheckCircle } from 'lucide-react';
import { iconMap } from '../constants/iconMap';

interface WhyChooseSectionProps {
    settings: any;
}

export function WhyChooseSection({ settings }: WhyChooseSectionProps) {
    // Handle both parsed array and JSON string
    let whyChooseFeatures = [];

    if (settings.why_choose_features) {
        if (typeof settings.why_choose_features === 'string') {
            try {
                whyChooseFeatures = JSON.parse(settings.why_choose_features);
            } catch (e) {
                console.error('Failed to parse why_choose_features:', e);
            }
        } else if (Array.isArray(settings.why_choose_features)) {
            whyChooseFeatures = settings.why_choose_features;
        }
    }

    if (whyChooseFeatures.length === 0) return null;

    return (
        <section className="bg-white px-6 py-20">
            <div className="container mx-auto max-w-6xl">
                <div className="grid items-center gap-12 lg:grid-cols-2">
                    {/* Left Image */}
                    <div className="order-2 lg:order-1">
                        {settings.why_choose_image ? (
                            <div className="relative rounded-2xl overflow-hidden">
                                <img
                                    src={`/storage/${settings.why_choose_image}`}
                                    alt="Why Choose Us"
                                    className="w-full h-auto object-contain"
                                />
                            </div>
                        ) : (
                            <div
                                className="aspect-square rounded-2xl p-1"
                                style={{
                                    background: 'linear-gradient(135deg, #2547F9 0%, #1e3fcc 50%, #4a63f9 100%)'
                                }}
                            >
                                <div className="flex h-full w-full items-center justify-center rounded-2xl" style={{ backgroundColor: '#F7F8FD' }}>
                                    <div className="space-y-3 p-6 text-center">
                                        <Bot className="mx-auto h-20 w-20" style={{ color: '#2547F9' }} />
                                        <p className="text-xl font-bold text-slate-900">
                                            Upload Image
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right Content */}
                    <div className="order-1 lg:order-2 space-y-8">
                        <div className="space-y-3">
                            <h2 className="text-3xl font-bold text-slate-900 leading-tight md:text-4xl md:leading-tight">
                                {(settings.why_choose_heading as string) || 'Kenapa Ribuan Bisnis'}
                                <span className="block mt-2" style={{ color: '#2547F9' }}>
                                    {(settings.why_choose_subheading as string) || 'Menggunakan ChatCepat'}
                                </span>
                            </h2>
                        </div>

                        <div className="space-y-6">
                            {whyChooseFeatures.map((feature: { icon: string; title: string; description: string; image?: string }, index: number) => {
                                const IconComponent = iconMap[feature.icon] || CheckCircle;
                                return (
                                    <div key={index} className="flex gap-4 items-start">
                                        <div
                                            className="flex-shrink-0 flex h-12 w-12 items-center justify-center rounded-xl"
                                            style={{
                                                backgroundColor: '#EEF1FE',
                                            }}
                                        >
                                            <IconComponent className="h-6 w-6" style={{ color: '#2547F9' }} />
                                        </div>
                                        <div className="flex-1 space-y-2">
                                            <h3 className="text-lg font-semibold text-slate-900">
                                                {feature.title}
                                            </h3>
                                            <p className="text-slate-600 leading-relaxed">
                                                {feature.description}
                                            </p>
                                            {feature.image && (
                                                <div className="mt-3">
                                                    <img
                                                        src={`/storage/${feature.image}`}
                                                        alt={feature.title}
                                                        className="w-full h-auto max-h-48 object-contain rounded-lg"
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
