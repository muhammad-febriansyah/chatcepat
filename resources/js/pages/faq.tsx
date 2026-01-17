import PageHeader from '@/components/page-header';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@/components/ui/accordion';
import HomeLayout from '@/layouts/home-layout';
import HelpSection from '@/components/help-section';
import { motion } from 'framer-motion';
import { HelpCircle, MessageCircle } from 'lucide-react';

interface FAQItem {
    id: number;
    question: string;
    answer: string;
}

interface FAQProps {
    faqs: FAQItem[];
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

export default function FAQ({ faqs, canRegister = true }: FAQProps) {
    return (
        <HomeLayout title="FAQ - Pertanyaan yang Sering Diajukan" canRegister={canRegister}>
            <PageHeader
                title="Pertanyaan yang Sering Diajukan"
                description="Temukan jawaban untuk pertanyaan Anda tentang ChatCepat"
                breadcrumbs={[
                    { name: 'Home', href: '/' },
                    { name: 'FAQ' },
                ]}
            />

            {/* FAQ Content */}
            <div className="bg-gradient-to-b from-white to-slate-50 px-4 py-12 sm:px-6 sm:py-16 lg:py-20">
                <div className="container mx-auto max-w-4xl">
                    <motion.div
                        initial="hidden"
                        animate="visible"
                        variants={containerVariants}
                    >
                        {/* Card Container */}
                        <div className="relative overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-xl">
                            {/* Decorative blur */}
                            <div className="absolute -top-20 -right-20 h-40 w-40 rounded-full bg-primary/10 blur-3xl"></div>
                            <div className="absolute -bottom-20 -left-20 h-40 w-40 rounded-full bg-primary/10 blur-3xl"></div>

                            {/* Top accent bar */}
                            <div className="absolute top-0 right-0 left-0 h-1 bg-primary"></div>

                            <div className="relative p-6 sm:p-10 lg:p-12">
                                {faqs && faqs.length > 0 ? (
                                    <Accordion type="single" collapsible className="space-y-4">
                                        {faqs.map((faq, index) => (
                                            <motion.div
                                                key={faq.id}
                                                variants={itemVariants}
                                                custom={index}
                                            >
                                                <AccordionItem
                                                    value={`faq-${faq.id}`}
                                                    className="rounded-xl border-2 border-slate-200 bg-white px-6 transition-all duration-200 hover:border-primary hover:shadow-md data-[state=open]:border-primary data-[state=open]:shadow-md data-[state=open]:bg-primary/5"
                                                >
                                                    <AccordionTrigger className="text-left text-base sm:text-lg font-semibold text-slate-900 hover:no-underline py-5">
                                                        <div className="flex items-start gap-3 pr-4">
                                                            <HelpCircle className="h-5 w-5 sm:h-6 sm:w-6 text-primary shrink-0 mt-0.5" />
                                                            <span>{faq.question}</span>
                                                        </div>
                                                    </AccordionTrigger>
                                                    <AccordionContent className="text-sm sm:text-base text-slate-600 leading-relaxed pl-9 sm:pl-10">
                                                        {faq.answer}
                                                    </AccordionContent>
                                                </AccordionItem>
                                            </motion.div>
                                        ))}
                                    </Accordion>
                                ) : (
                                    <div className="text-center py-12">
                                        <p className="text-lg text-muted-foreground">
                                            Belum ada FAQ yang tersedia.
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* CTA Section */}
            <div className="bg-gradient-to-b from-slate-50 to-white px-6 py-16 sm:py-20">
                <div className="container mx-auto max-w-4xl">
                    <HelpSection
                        title="Masih ada pertanyaan?"
                        description="Tim support kami siap membantu Anda 24/7. Jangan ragu untuk menghubungi kami!"
                        buttons={[
                            {
                                label: 'Hubungi Kami',
                                href: '/contact',
                                icon: MessageCircle,
                                variant: 'primary',
                            },
                        ]}
                    />
                </div>
            </div>
        </HomeLayout>
    );
}
