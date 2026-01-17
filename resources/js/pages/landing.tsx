import React from 'react';
import HomeLayout from '@/layouts/home-layout';
import { usePage } from '@inertiajs/react';
import { type SharedData } from '@/types';
import { type Feature } from '@/types/feature';
import { type FiturUnggulan } from '@/types/fitur-unggulan';
import { type Faq } from '@/types/faq';
import {
    HeroSection,
    WorldMapSection,
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

export default function Landing({
    canRegister = true,
    features = [],
    fiturUnggulans = [],
    faqs = [],
    testimonials = [],
}: {
    canRegister?: boolean;
    features?: Feature[];
    fiturUnggulans?: FiturUnggulan[];
    faqs?: Faq[];
    testimonials?: Testimonial[];
}) {
    const { settings } = usePage<SharedData>().props;

    return (
        <HomeLayout
            title="AI CRM - Kelola Bisnis Lebih Cerdas"
            description="Platform CRM berbasis AI yang membantu tim sales Anda bekerja lebih efisien, meningkatkan konversi, dan memberikan pengalaman customer terbaik."
            canRegister={canRegister}
        >
            <HeroSection settings={settings} canRegister={canRegister} />
            <WorldMapSection />
            <FeaturesSection features={features} settings={settings} />
            <WhyChooseSection settings={settings} />
            <FiturUnggulanSection fiturUnggulans={fiturUnggulans} />
            <TestimonialsSection testimonials={testimonials} />
            <HelpSectionWrapper settings={settings} />
            <FaqSection faqs={faqs} settings={settings} />
        </HomeLayout>
    );
}
