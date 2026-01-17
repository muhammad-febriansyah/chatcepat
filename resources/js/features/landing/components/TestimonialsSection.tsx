import { Marquee } from '@/components/ui/marquee';
import { motion } from 'framer-motion';
import { Star, Quote } from 'lucide-react';

interface User {
    id: number;
    name: string;
    email: string;
}

interface Testimonial {
    id: number;
    user_id: number;
    rating: number;
    description: string;
    is_active: boolean;
    created_at: string;
    user: User;
}

interface TestimonialsSectionProps {
    testimonials: Testimonial[];
}

const TestimonialCard = ({ testimonial }: { testimonial: Testimonial }) => {
    return (
        <div className="relative w-[350px] sm:w-[400px] cursor-pointer overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-lg transition-all hover:shadow-xl hover:scale-[1.02]">
            {/* Quote Icon */}
            <div className="absolute top-4 right-4 opacity-10">
                <Quote className="h-16 w-16 text-blue-600" />
            </div>

            {/* Rating */}
            <div className="mb-4 flex items-center gap-1">
                {[...Array(5)].map((_, index) => (
                    <Star
                        key={index}
                        className={`h-5 w-5 ${
                            index < testimonial.rating
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'fill-slate-200 text-slate-200'
                        }`}
                    />
                ))}
            </div>

            {/* Description */}
            <p className="relative z-10 mb-4 text-sm leading-relaxed text-slate-700">
                "{testimonial.description}"
            </p>

            {/* User Info */}
            <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-indigo-600">
                    <span className="text-sm font-semibold text-white">
                        {testimonial.user.name.charAt(0).toUpperCase()}
                    </span>
                </div>
                <div>
                    <p className="text-sm font-semibold text-slate-900">
                        {testimonial.user.name}
                    </p>
                    <p className="text-xs text-slate-500">Verified Customer</p>
                </div>
            </div>
        </div>
    );
};

export const TestimonialsSection = ({ testimonials }: TestimonialsSectionProps) => {
    if (!testimonials || testimonials.length === 0) {
        return null;
    }

    // Split testimonials into two rows for marquee effect
    const firstRow = testimonials.slice(0, Math.ceil(testimonials.length / 2));
    const secondRow = testimonials.slice(Math.ceil(testimonials.length / 2));

    return (
        <section className="relative overflow-hidden bg-gradient-to-b from-slate-50 to-white py-16 sm:py-20 lg:py-24">
            {/* Background Decoration */}
            <div className="absolute inset-0 -z-10 overflow-hidden">
                <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-blue-500/10 blur-3xl"></div>
                <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-indigo-500/10 blur-3xl"></div>
            </div>

            <div className="container mx-auto px-4 sm:px-6">
                {/* Section Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="mb-12 text-center"
                >
                    <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-4 py-2 text-blue-700 font-medium mb-4">
                        <Star className="h-4 w-4 fill-blue-700" />
                        <span className="text-sm">Testimonial</span>
                    </div>
                    <h2 className="mb-4 text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900">
                        Apa Kata Mereka?
                    </h2>
                    <p className="mx-auto max-w-2xl text-base sm:text-lg text-slate-600">
                        Dengarkan pengalaman nyata dari pelanggan kami yang telah merasakan manfaat ChatCepat
                    </p>
                </motion.div>

                {/* Testimonials Marquee */}
                <div className="relative">
                    <Marquee pauseOnHover className="[--duration:40s]">
                        {firstRow.map((testimonial) => (
                            <TestimonialCard key={testimonial.id} testimonial={testimonial} />
                        ))}
                    </Marquee>
                    {secondRow.length > 0 && (
                        <Marquee reverse pauseOnHover className="[--duration:40s] mt-4">
                            {secondRow.map((testimonial) => (
                                <TestimonialCard key={testimonial.id} testimonial={testimonial} />
                            ))}
                        </Marquee>
                    )}
                    {/* Gradient Overlays */}
                    <div className="pointer-events-none absolute inset-y-0 left-0 w-1/12 bg-gradient-to-r from-slate-50"></div>
                    <div className="pointer-events-none absolute inset-y-0 right-0 w-1/12 bg-gradient-to-l from-white"></div>
                </div>
            </div>
        </section>
    );
};
