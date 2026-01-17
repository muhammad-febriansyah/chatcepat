import { type SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import {
    ArrowRight,
    Facebook,
    Instagram,
    Linkedin,
    Mail,
    MapPin,
    Phone,
    Twitter,
} from 'lucide-react';

export default function Footer() {
    const currentYear = new Date().getFullYear();
    const { settings } = usePage<SharedData>().props;

    return (
        <footer className="relative bg-white">
            {/* Decorative top border */}
            <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-primary via-blue-500 to-primary"></div>

            <div className="container mx-auto max-w-7xl px-6 py-16 sm:py-20 lg:py-24">
                {/* Main Footer Content */}
                <div className="mb-12 grid gap-12 md:grid-cols-2 lg:grid-cols-4">
                    {/* Brand & Description */}
                    <div className="lg:col-span-1">
                        <Link
                            href="/"
                            className="group mb-6 inline-flex items-center gap-2"
                        >
                            {settings.logo ? (
                                <img
                                    src={`/storage/${settings.logo}`}
                                    alt={settings.site_name}
                                    className="h-10 w-auto object-contain"
                                />
                            ) : (
                                <>
                                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary shadow-lg shadow-primary/30 transition-all group-hover:shadow-primary/50">
                                        <svg
                                            className="h-6 w-6 text-white"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                                            />
                                        </svg>
                                    </div>
                                    <span className="text-xl font-bold text-slate-900">
                                        {settings.site_name || 'ChatCepat'}
                                    </span>
                                </>
                            )}
                        </Link>
                        <p className="mb-6 text-sm leading-relaxed text-slate-600">
                            {settings.site_description ||
                                'Platform CRM berbasis AI yang membantu bisnis berkomunikasi lebih efektif dengan pelanggan.'}
                        </p>

                        {/* Social Media Icons */}
                        <div className="flex gap-3">
                            <a
                                href={
                                    settings?.facebook_url ||
                                    'https://facebook.com'
                                }
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-slate-600 transition-all duration-300 hover:scale-110 hover:bg-primary hover:text-white"
                            >
                                <Facebook className="h-5 w-5" />
                            </a>
                            <a
                                href={
                                    settings?.instagram_url ||
                                    'https://instagram.com'
                                }
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-slate-600 transition-all duration-300 hover:scale-110 hover:bg-primary hover:text-white"
                            >
                                <Instagram className="h-5 w-5" />
                            </a>
                            <a
                                href={
                                    settings?.twitter_url ||
                                    'https://twitter.com'
                                }
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-slate-600 transition-all duration-300 hover:scale-110 hover:bg-primary hover:text-white"
                            >
                                <Twitter className="h-5 w-5" />
                            </a>
                            <a
                                href={
                                    settings?.tiktok_url || 'https://tiktok.com'
                                }
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-slate-600 transition-all duration-300 hover:scale-110 hover:bg-primary hover:text-white"
                            >
                                <svg
                                    className="h-5 w-5"
                                    viewBox="0 0 24 24"
                                    fill="currentColor"
                                >
                                    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
                                </svg>
                            </a>
                            <a
                                href={
                                    settings?.linkedin_url ||
                                    'https://linkedin.com'
                                }
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-slate-600 transition-all duration-300 hover:scale-110 hover:bg-primary hover:text-white"
                            >
                                <Linkedin className="h-5 w-5" />
                            </a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="mb-6 flex items-center gap-2 text-base font-bold text-slate-900">
                            <span className="h-1 w-8 rounded-full bg-primary"></span>
                            Menu
                        </h3>
                        <ul className="space-y-3">
                            <li>
                                <Link
                                    href="/about"
                                    className="group flex items-center gap-2 text-sm text-slate-600 transition-colors duration-200 hover:text-primary"
                                >
                                    <ArrowRight className="-ml-6 h-4 w-4 opacity-0 transition-all group-hover:ml-0 group-hover:opacity-100" />
                                    Tentang Kami
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/pricing"
                                    className="group flex items-center gap-2 text-sm text-slate-600 transition-colors duration-200 hover:text-primary"
                                >
                                    <ArrowRight className="-ml-6 h-4 w-4 opacity-0 transition-all group-hover:ml-0 group-hover:opacity-100" />
                                    Harga
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/blog"
                                    className="group flex items-center gap-2 text-sm text-slate-600 transition-colors duration-200 hover:text-primary"
                                >
                                    <ArrowRight className="-ml-6 h-4 w-4 opacity-0 transition-all group-hover:ml-0 group-hover:opacity-100" />
                                    Blog
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/contact"
                                    className="group flex items-center gap-2 text-sm text-slate-600 transition-colors duration-200 hover:text-primary"
                                >
                                    <ArrowRight className="-ml-6 h-4 w-4 opacity-0 transition-all group-hover:ml-0 group-hover:opacity-100" />
                                    Kontak
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/faq"
                                    className="group flex items-center gap-2 text-sm text-slate-600 transition-colors duration-200 hover:text-primary"
                                >
                                    <ArrowRight className="-ml-6 h-4 w-4 opacity-0 transition-all group-hover:ml-0 group-hover:opacity-100" />
                                    FAQ
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Office Contact */}
                    <div>
                        <h3 className="mb-6 flex items-center gap-2 text-base font-bold text-slate-900">
                            <span className="h-1 w-8 rounded-full bg-primary"></span>
                            Kontak
                        </h3>
                        <ul className="space-y-4">
                            <li className="group flex items-start gap-3">
                                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary transition-all group-hover:bg-primary group-hover:text-white">
                                    <MapPin className="h-4 w-4" />
                                </div>
                                <span className="text-sm leading-relaxed text-slate-600">
                                    Jakarta Selatan, DKI
                                    <br />
                                    Jakarta 12345
                                </span>
                            </li>
                            <li className="group flex items-start gap-3">
                                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary transition-all group-hover:bg-primary group-hover:text-white">
                                    <Mail className="h-4 w-4" />
                                </div>
                                <a
                                    href="mailto:info@chatcepat.com"
                                    className="text-sm text-slate-600 transition-colors hover:text-primary"
                                >
                                    info@chatcepat.com
                                </a>
                            </li>
                            <li className="group flex items-start gap-3">
                                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary transition-all group-hover:bg-primary group-hover:text-white">
                                    <Phone className="h-4 w-4" />
                                </div>
                                <a
                                    href="tel:+622112345678"
                                    className="text-sm text-slate-600 transition-colors hover:text-primary"
                                >
                                    +62 21 1234 5678
                                </a>
                            </li>
                        </ul>
                    </div>

                    {/* CTA Section */}
                    <div>
                        <h3 className="mb-6 flex items-center gap-2 text-base font-bold text-slate-900">
                            <span className="h-1 w-8 rounded-full bg-primary"></span>
                            Bergabung
                        </h3>
                        <p className="mb-6 text-sm leading-relaxed text-slate-600">
                            Daftar sekarang dan mulai tingkatkan bisnis Anda
                            dengan platform CRM terbaik.
                        </p>
                        <Link
                            href="/register"
                            className="group inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-primary/30 transition-all duration-300 hover:bg-primary/90 hover:shadow-primary/50"
                        >
                            Uji Coba Gratis Sekarang
                            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                        </Link>
                    </div>
                </div>

                {/* Bottom Links */}
                <div className="border-t border-slate-200 pt-8">
                    <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
                        <p className="text-center text-sm text-slate-600 md:text-left">
                            © {currentYear} {settings.site_name || 'ChatCepat'}
                            . All rights reserved.
                        </p>
                        <div className="flex flex-wrap justify-center gap-6">
                            <Link
                                href="/privacy"
                                className="text-sm text-slate-600 transition-colors hover:text-primary"
                            >
                                Kebijakan Privasi
                            </Link>
                            <Link
                                href="/terms"
                                className="text-sm text-slate-600 transition-colors hover:text-primary"
                            >
                                Syarat & Ketentuan
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}
