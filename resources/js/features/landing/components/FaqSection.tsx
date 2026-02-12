import React from 'react';
import { ChevronDown } from 'lucide-react';
import { type Faq } from '@/types/faq';
import { useFaq } from '../hooks/useFaq';
import { motion, AnimatePresence } from 'framer-motion';

interface FaqSectionProps {
    faqs: Faq[];
    settings: any;
}

const ease = [0.16, 1, 0.3, 1] as const;

export function FaqSection({ faqs, settings }: FaqSectionProps) {
    const { toggleFaq, isOpen } = useFaq();

    if (faqs.length === 0) return null;

    return (
        <section className="bg-white px-6 py-20">
            <div className="container mx-auto max-w-4xl">
                <motion.div
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-80px' }}
                    transition={{ duration: 0.7, ease }}
                    className="mb-12 space-y-3 text-center"
                >
                    <h2 className="font-display text-3xl font-bold text-slate-900 leading-tight md:text-4xl md:leading-tight">
                        {(settings.faq_heading as string) || 'Pertanyaan yang Sering Diajukan'}
                    </h2>
                    <p className="mx-auto max-w-2xl text-lg text-slate-600 leading-relaxed">
                        {(settings.faq_description as string) || 'Temukan jawaban untuk pertanyaan umum tentang ChatCepat'}
                    </p>
                </motion.div>

                <div className="space-y-4">
                    {faqs.map((faq, index) => (
                        <motion.div
                            key={faq.id}
                            initial={{ opacity: 0, y: 16 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: '-40px' }}
                            transition={{ duration: 0.5, delay: index * 0.07, ease }}
                            className="rounded-xl border bg-white transition-colors duration-200"
                            style={{ borderColor: isOpen(index) ? '#2547F9' : 'rgb(226, 232, 240)' }}
                        >
                            <button
                                onClick={() => toggleFaq(index)}
                                className="flex w-full items-center justify-between gap-4 p-6 text-left transition-all"
                            >
                                <span className="text-lg font-semibold text-slate-900">
                                    {faq.question}
                                </span>
                                <motion.div
                                    animate={{ rotate: isOpen(index) ? 180 : 0 }}
                                    transition={{ duration: 0.3, ease }}
                                    className="flex-shrink-0"
                                >
                                    <ChevronDown
                                        className="h-5 w-5"
                                        style={{ color: isOpen(index) ? '#2547F9' : '#64748b' }}
                                    />
                                </motion.div>
                            </button>

                            <AnimatePresence initial={false}>
                                {isOpen(index) && (
                                    <motion.div
                                        key="answer"
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.35, ease }}
                                        style={{ overflow: 'hidden' }}
                                    >
                                        <div className="border-t border-slate-200 px-6 pb-6 pt-4">
                                            <p className="text-slate-600 leading-relaxed">
                                                {faq.answer}
                                            </p>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
