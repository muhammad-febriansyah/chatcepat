import { AnimatedShinyText } from '@/components/ui/animated-shiny-text';
import { Highlight } from '@/components/ui/hero-highlight';
import { NumberTicker } from '@/components/ui/number-ticker';
import { ShimmerButton } from '@/components/ui/shimmer-button';
import { register } from '@/routes';
import { Link } from '@inertiajs/react';
import { ArrowRight, Bot, MessageCircle, Zap } from 'lucide-react';
import { parseStatValue } from '../utils/parseStatValue';

interface HeroSectionProps {
    settings: any;
    canRegister: boolean;
}

export function HeroSection({ settings, canRegister }: HeroSectionProps) {
    const stat1 = parseStatValue(
        (settings.hero_stat_1_value as string) || '5000+',
    );
    const stat2 = parseStatValue(
        (settings.hero_stat_2_value as string) || '3x',
    );
    const stat3 = parseStatValue(
        (settings.hero_stat_3_value as string) || '85%',
    );

    const headingText =
        (settings.hero_heading as string) ||
        'Tingkatkan Penjualan Hingga 40% dengan Customer Service & Sales AI';
    const parts = headingText.split(/(dengan Customer Service & Sales AI)/gi);

    return (
        <section className="bg-white px-6 pt-32 pb-16">
            <div className="container mx-auto max-w-6xl">
                <div className="grid items-center gap-8 lg:grid-cols-2 lg:gap-12">
                    {/* Left Content */}
                    <div className="space-y-6">
                        <div
                            className="inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium shadow-sm transition-all"
                            style={{
                                backgroundColor: '#EEF1FE',
                                borderColor: 'rgb(226, 232, 240)',
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.borderColor = '#2547F9';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.borderColor =
                                    'rgb(226, 232, 240)';
                            }}
                        >
                            <Zap
                                className="h-3.5 w-3.5"
                                style={{ color: '#2547F9' }}
                            />
                            <AnimatedShinyText className="text-slate-900">
                                {(settings.hero_badge as string) ||
                                    'Balas Chat dengan Cepat 24/7, Non Stop!'}
                            </AnimatedShinyText>
                        </div>

                        <h1 className="font-display text-3xl leading-snug font-bold text-slate-900 md:text-4xl md:leading-snug lg:text-5xl lg:leading-snug">
                            {parts.map((part, index) => {
                                if (
                                    /dengan Customer Service & Sales AI/i.test(
                                        part,
                                    )
                                ) {
                                    return (
                                        <Highlight
                                            key={index}
                                            className="text-black dark:text-white"
                                        >
                                            {part}
                                        </Highlight>
                                    );
                                }
                                return <span key={index}>{part}</span>;
                            })}
                        </h1>

                        <p className="text-base leading-relaxed text-slate-600 md:text-lg md:leading-relaxed">
                            {(settings.hero_description as string) ||
                                'Tingkatkan Interaksi dengan Customer, Followup Otomatis, dan Hemat Anggaran CS Hingga Ratusan Juta dengan Agent AI Cerdas dan Humanis'}
                        </p>

                        <div className="flex flex-col items-start gap-3 pt-2 sm:flex-row">
                            {canRegister && (
                                <Link href={register()}>
                                    <ShimmerButton
                                        background="#2547F9"
                                        shimmerColor="#ffffff"
                                        className="!bg-[#2547F9] px-6 py-3 text-sm shadow-xl"
                                        style={{
                                            boxShadow:
                                                '0 20px 25px -5px rgba(37, 71, 249, 0.3), 0 8px 10px -6px rgba(37, 71, 249, 0.3)',
                                            backgroundColor: '#2547F9',
                                        }}
                                    >
                                        <span className="relative z-10 flex items-center gap-2 font-semibold text-white">
                                            Uji Coba Gratis Sekarang
                                            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                                        </span>
                                    </ShimmerButton>
                                </Link>
                            )}
                            <a
                                href={`https://wa.me/${settings.contact_phone?.replace(/\D/g, '')}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="rounded-xl border-2 bg-white px-6 py-3 text-sm font-semibold transition-all hover:bg-slate-50"
                                style={{ borderColor: '#2547F9', color: '#2547F9' }}
                            >
                                <span className="flex items-center gap-2">
                                    <MessageCircle className="h-4 w-4" />
                                    Hubungi Sales
                                </span>
                            </a>
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-3 gap-3 pt-6 md:gap-4 lg:gap-6">
                            <div>
                                <div
                                    className="text-xl font-bold md:text-2xl lg:text-3xl"
                                    style={{ color: '#2547F9' }}
                                >
                                    <NumberTicker
                                        value={stat1.number}
                                        style={{ color: '#2547F9' }}
                                    />
                                    {stat1.suffix}
                                </div>
                                <div className="mt-0.5 text-[10px] text-slate-600 md:mt-1 md:text-xs lg:text-xs">
                                    {(settings.hero_stat_1_label as string) ||
                                        'Pengguna Aktif'}
                                </div>
                            </div>
                            <div>
                                <div
                                    className="text-xl font-bold md:text-2xl lg:text-3xl"
                                    style={{ color: '#2547F9' }}
                                >
                                    <NumberTicker
                                        value={stat2.number}
                                        style={{ color: '#2547F9' }}
                                    />
                                    {stat2.suffix}
                                </div>
                                <div className="mt-0.5 text-[10px] text-slate-600 md:mt-1 md:text-xs lg:text-xs">
                                    {(settings.hero_stat_2_label as string) ||
                                        'Peningkatan Konversi'}
                                </div>
                            </div>
                            <div>
                                <div
                                    className="text-xl font-bold md:text-2xl lg:text-3xl"
                                    style={{ color: '#2547F9' }}
                                >
                                    <NumberTicker
                                        value={stat3.number}
                                        style={{ color: '#2547F9' }}
                                    />
                                    {stat3.suffix}
                                </div>
                                <div className="mt-0.5 text-[10px] text-slate-600 md:mt-1 md:text-xs lg:text-xs">
                                    {(settings.hero_stat_3_label as string) ||
                                        'Waktu Hemat'}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Image */}
                    <div className="relative">
                        {settings.hero_image ? (
                            <div className="relative overflow-hidden rounded-2xl bg-white shadow-xl">
                                <img
                                    src={`/storage/${settings.hero_image}`}
                                    alt="Hero"
                                    className="h-auto w-full object-contain"
                                />
                            </div>
                        ) : (
                            <div
                                className="mx-auto aspect-square max-w-md rounded-2xl p-1"
                                style={{
                                    background:
                                        'linear-gradient(135deg, #2547F9 0%, #1e3fcc 50%, #4a63f9 100%)',
                                }}
                            >
                                <div
                                    className="flex h-full w-full items-center justify-center rounded-2xl"
                                    style={{ backgroundColor: '#F7F8FD' }}
                                >
                                    <div className="space-y-3 p-6 text-center">
                                        <Bot
                                            className="mx-auto h-20 w-20"
                                            style={{ color: '#2547F9' }}
                                        />
                                        <p className="text-xl font-bold text-slate-900">
                                            AI-Powered CRM
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
}
