import React from 'react';
import { ChevronDown } from 'lucide-react';
import { type Faq } from '@/types/faq';
import { useFaq } from '../hooks/useFaq';

interface FaqSectionProps {
    faqs: Faq[];
    settings: any;
}

export function FaqSection({ faqs, settings }: FaqSectionProps) {
    const { openFaqIndex, toggleFaq, isOpen } = useFaq();

    if (faqs.length === 0) return null;

    return (
        <section className="bg-white px-6 py-20">
            <div className="container mx-auto max-w-4xl">
                <div className="mb-12 space-y-3 text-center">
                    <h2 className="text-3xl font-bold text-slate-900 leading-tight md:text-4xl md:leading-tight">
                        {(settings.faq_heading as string) || 'Pertanyaan yang Sering Diajukan'}
                    </h2>
                    <p className="mx-auto max-w-2xl text-lg text-slate-600 leading-relaxed">
                        {(settings.faq_description as string) || 'Temukan jawaban untuk pertanyaan umum tentang ChatCepat'}
                    </p>
                </div>

                <div className="space-y-4">
                    {faqs.map((faq, index) => (
                        <div
                            key={faq.id}
                            className="rounded-xl border border-slate-200 bg-white transition-all"
                            style={{
                                borderColor: isOpen(index) ? '#2547F9' : 'rgb(226, 232, 240)',
                            }}
                        >
                            <button
                                onClick={() => toggleFaq(index)}
                                className="flex w-full items-center justify-between gap-4 p-6 text-left transition-all"
                            >
                                <span className="text-lg font-semibold text-slate-900">
                                    {faq.question}
                                </span>
                                <ChevronDown
                                    className={`h-5 w-5 flex-shrink-0 transition-transform ${
                                        isOpen(index) ? 'rotate-180' : ''
                                    }`}
                                    style={{ color: isOpen(index) ? '#2547F9' : '#64748b' }}
                                />
                            </button>
                            {isOpen(index) && (
                                <div className="border-t border-slate-200 px-6 pb-6 pt-4">
                                    <p className="text-slate-600 leading-relaxed">
                                        {faq.answer}
                                    </p>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
