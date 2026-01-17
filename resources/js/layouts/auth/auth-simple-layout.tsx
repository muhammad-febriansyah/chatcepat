import { home } from '@/routes';
import { Link, usePage } from '@inertiajs/react';
import { MessageSquare, Sparkles } from 'lucide-react';
import { type PropsWithChildren } from 'react';

interface AuthLayoutProps {
    name?: string;
    title?: string;
    description?: string;
}

interface AuthBranding {
    logo: string | null;
    logo_name: string;
    tagline: string;
    heading: string;
    description: string;
    features: string[];
    copyright: string;
    hero_image: string | null;
}

export default function AuthSimpleLayout({
    children,
    title,
    description,
}: PropsWithChildren<AuthLayoutProps>) {
    const { authBranding } = usePage<{ authBranding: AuthBranding }>().props;
    return (
        <div className="flex h-screen overflow-hidden bg-background">
            {/* Left Side - Branding & Illustration */}
            <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-primary via-primary/90 to-primary/80">
                {/* Hero Image Background */}
                {authBranding?.hero_image ? (
                    <>
                        <div
                            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                            style={{ backgroundImage: `url(${authBranding.hero_image})` }}
                        />
                        {/* Dark Overlay for better text readability */}
                        <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-black/50 to-black/60"></div>
                    </>
                ) : (
                    <>
                        {/* Fallback: Gradient Overlay with Pattern */}
                        <div className="absolute inset-0 bg-[url('/pattern.svg')] opacity-10"></div>

                        {/* Animated Gradient Blobs */}
                        <div className="absolute top-0 -left-4 w-96 h-96 bg-primary-foreground/20 rounded-full mix-blend-overlay filter blur-3xl animate-blob"></div>
                        <div className="absolute top-0 -right-4 w-96 h-96 bg-primary-foreground/20 rounded-full mix-blend-overlay filter blur-3xl animate-blob animation-delay-2000"></div>
                        <div className="absolute -bottom-8 left-20 w-96 h-96 bg-primary-foreground/20 rounded-full mix-blend-overlay filter blur-3xl animate-blob animation-delay-4000"></div>
                    </>
                )}

                {/* Content */}
                <div className="relative z-10 flex flex-col justify-between p-12 text-white">
                    {/* Logo */}
                    <Link
                        href={home()}
                        className="group transition-all"
                    >
                        {authBranding?.logo ? (
                            <img
                                src={authBranding.logo}
                                alt="Logo"
                                className="h-32 w-32 object-contain transition-transform group-hover:scale-105"
                            />
                        ) : (
                            <div className="flex h-32 w-32 items-center justify-center rounded-xl bg-white/10 backdrop-blur-sm transition-transform group-hover:scale-105 border border-white/20">
                                <MessageSquare className="size-12 text-white" strokeWidth={2.5} />
                            </div>
                        )}
                    </Link>

                    {/* Center Content */}
                    <div className="space-y-8 max-w-md">
                        <div className="space-y-4">
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20">
                                <Sparkles className="size-4" />
                                <span className="text-sm font-medium">{authBranding?.tagline || 'Smart, Fast & Reliable'}</span>
                            </div>
                            <h2 className="text-4xl font-bold leading-tight">
                                {authBranding?.heading || 'Kelola website Anda dengan mudah dan cepat'}
                            </h2>
                            <p className="text-lg text-white/90">
                                {authBranding?.description || 'Platform manajemen konten modern dengan fitur lengkap untuk mengembangkan bisnis Anda.'}
                            </p>
                        </div>

                        {/* Features List */}
                        <div className="space-y-3">
                            {(authBranding?.features || [
                                'Dashboard analytics yang powerful',
                                'Manajemen konten yang intuitif',
                                'Keamanan tingkat enterprise',
                            ]).map((feature, index) => (
                                <div key={index} className="flex items-center gap-3">
                                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-white/10 backdrop-blur-sm border border-white/20">
                                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                        </svg>
                                    </div>
                                    <span className="text-sm text-white/90">{feature}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Footer */}
                    <p className="text-sm text-white/60">
                        {authBranding?.copyright || '© 2025 ChatCepat. All rights reserved.'}
                    </p>
                </div>
            </div>

            {/* Right Side - Form */}
            <div className="flex flex-1 flex-col overflow-y-auto px-4 py-12 sm:px-6 lg:px-20 xl:px-24">
                <div className="mx-auto w-full max-w-sm lg:w-96 my-auto">
                    {/* Mobile Logo */}
                    <div className="lg:hidden mb-8 text-center">
                        <Link
                            href={home()}
                            className="inline-block group"
                        >
                            {authBranding?.logo ? (
                                <img
                                    src={authBranding.logo}
                                    alt="Logo"
                                    className="h-24 w-24 object-contain transition-transform group-hover:scale-105"
                                />
                            ) : (
                                <div className="flex h-24 w-24 items-center justify-center rounded-xl bg-primary/10 transition-transform group-hover:scale-105">
                                    <MessageSquare className="size-10 text-primary" strokeWidth={2.5} />
                                </div>
                            )}
                        </Link>
                    </div>

                    {/* Header */}
                    <div className="mb-8 space-y-2">
                        <h1 className="text-3xl font-bold tracking-tight text-foreground">{title}</h1>
                        <p className="text-sm text-muted-foreground">
                            {description}
                        </p>
                    </div>

                    {/* Form Content */}
                    <div>{children}</div>

                    {/* Mobile Footer */}
                    <div className="lg:hidden mt-8 text-center">
                        <p className="text-xs text-muted-foreground">
                            {authBranding?.copyright || '© 2025 ChatCepat. All rights reserved.'}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
