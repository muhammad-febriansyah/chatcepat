import React from 'react';
import HomeLayout from '@/layouts/home-layout';
import { usePage } from '@inertiajs/react';
import { type SharedData } from '@/types';
import { type Feature } from '@/types/feature';
import { type FiturUnggulan } from '@/types/fitur-unggulan';
import { type Faq } from '@/types/faq';
import {
    HeroSection,
    PartnersSection,
    FeaturesSection,
    WhyChooseSection,
    FiturUnggulanSection,
    TestimonialsSection,
    FaqSection,
    HelpSectionWrapper,
} from '@/features/landing/components';

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

interface Partner {
    id: number;
    name: string;
    image: string;
    order: number;
    is_active: boolean;
}

export default function Landing({
    canRegister = true,
    features = [],
    fiturUnggulans = [],
    faqs = [],
    testimonials = [],
    partners = [],
}: {
    canRegister?: boolean;
    features?: Feature[];
    fiturUnggulans?: FiturUnggulan[];
    faqs?: Faq[];
    testimonials?: Testimonial[];
    partners?: Partner[];
}) {
    const { settings } = usePage<SharedData>().props;

    return (
        <HomeLayout
            title="AI CRM - Kelola Bisnis Lebih Cerdas"
            description="Platform CRM berbasis AI yang membantu tim sales Anda bekerja lebih efisien, meningkatkan konversi, dan memberikan pengalaman customer terbaik."
            canRegister={canRegister}
        >
            <HeroSection settings={settings} canRegister={canRegister} />
            <PartnersSection partners={partners} />
            <div id="features">
                <FeaturesSection features={features} settings={settings} />
            </div>
            <WhyChooseSection settings={settings} />
            <div id="produk">
                <FiturUnggulanSection fiturUnggulans={fiturUnggulans} />
            </div>
            <TestimonialsSection testimonials={testimonials} />
            <HelpSectionWrapper settings={settings} />
            <div id="faq">
                <FaqSection faqs={faqs} settings={settings} />
            </div>
        </HomeLayout>
    );
}
