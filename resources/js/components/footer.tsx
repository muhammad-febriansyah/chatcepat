import { type SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { Facebook, Instagram, Linkedin, Twitter, Youtube } from 'lucide-react';

export default function Footer() {
    const currentYear = new Date().getFullYear();
    const { settings } = usePage<SharedData>().props;

    return (
        <footer className="bg-gray-50 py-16">
            <div className="container mx-auto max-w-7xl px-6">
                {/* Main Footer Content */}
                <div className="grid gap-12 lg:grid-cols-12">
                    {/* Left Section: Brand & Company Info */}
                    <div className="lg:col-span-5">
                        {/* Logo & Tagline */}
                        <Link
                            href="/"
                            className="mb-2 inline-flex items-center gap-2"
                        >
                            {settings.logo ? (
                                <img
                                    src={`/storage/${settings.logo}`}
                                    alt={settings.site_name}
                                    className="h-10 w-auto object-contain"
                                />
                            ) : (
                                <>
                                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
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

                        <p className="mb-2 text-sm font-medium text-slate-700 whitespace-pre-line">
                            {settings.footer_tagline || 'Omnichannel + CRM'}
                        </p>

                        <p className="mb-6 text-sm text-slate-600">
                            <strong>Dikelola oleh PT. Simetric Consulting Group</strong>
                        </p>

                        {/* Social Media Icons */}
                        <div className="flex flex-wrap gap-3">
                            {settings?.facebook_url && (
                                <a
                                    href={settings.facebook_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex h-10 w-10 items-center justify-center rounded-full bg-black text-white transition-transform hover:scale-110"
                                >
                                    <Facebook className="h-5 w-5" />
                                </a>
                            )}
                            {settings?.instagram_url && (
                                <a
                                    href={settings.instagram_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex h-10 w-10 items-center justify-center rounded-full bg-black text-white transition-transform hover:scale-110"
                                >
                                    <Instagram className="h-5 w-5" />
                                </a>
                            )}
                            {settings?.twitter_url && (
                                <a
                                    href={settings.twitter_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex h-10 w-10 items-center justify-center rounded-full bg-black text-white transition-transform hover:scale-110"
                                >
                                    <Twitter className="h-5 w-5" />
                                </a>
                            )}
                            {settings?.tiktok_url && (
                                <a
                                    href={settings.tiktok_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex h-10 w-10 items-center justify-center rounded-full bg-black text-white transition-transform hover:scale-110"
                                >
                                    <svg
                                        className="h-5 w-5"
                                        viewBox="0 0 24 24"
                                        fill="currentColor"
                                    >
                                        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
                                    </svg>
                                </a>
                            )}
                            {settings?.linkedin_url && (
                                <a
                                    href={settings.linkedin_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex h-10 w-10 items-center justify-center rounded-full bg-black text-white transition-transform hover:scale-110"
                                >
                                    <Linkedin className="h-5 w-5" />
                                </a>
                            )}
                            {/* YouTube - HIDDEN */}
                            {/* {settings?.youtube_url && (
                                <a
                                    href={settings.youtube_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex h-10 w-10 items-center justify-center rounded-full bg-black text-white transition-transform hover:scale-110"
                                >
                                    <Youtube className="h-5 w-5" />
                                </a>
                            )} */}
                        </div>
                    </div>

                    {/* Right Section: Menu Columns */}
                    <div className="grid gap-8 sm:grid-cols-3 lg:col-span-7">
                        {/* Company Column */}
                        <div>
                            <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-slate-900">
                                Company
                            </h3>
                            <ul className="space-y-3">
                                <li>
                                    <Link
                                        href="/about"
                                        className="text-sm text-slate-600 transition-colors hover:text-primary"
                                    >
                                        About
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        href="/pricing"
                                        className="text-sm text-slate-600 transition-colors hover:text-primary"
                                    >
                                        Pricing
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        href="/blog"
                                        className="text-sm text-slate-600 transition-colors hover:text-primary"
                                    >
                                        Blog
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        href="/contact"
                                        className="text-sm text-slate-600 transition-colors hover:text-primary"
                                    >
                                        Contact
                                    </Link>
                                </li>
                            </ul>
                        </div>

                        {/* Product Column */}
                        <div>
                            <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-slate-900">
                                Product
                            </h3>
                            <ul className="space-y-3">
                                <li>
                                    <Link
                                        href="/#produk"
                                        className="text-sm text-slate-600 transition-colors hover:text-primary"
                                    >
                                        WhatsApp Broadcast
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        href="/#produk"
                                        className="text-sm text-slate-600 transition-colors hover:text-primary"
                                    >
                                        CRM Omnichannel
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        href="/#features"
                                        className="text-sm text-slate-600 transition-colors hover:text-primary"
                                    >
                                        Chatbot AI
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        href="/#features"
                                        className="text-sm text-slate-600 transition-colors hover:text-primary"
                                    >
                                        Auto Reply
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        href="/#features"
                                        className="text-sm text-slate-600 transition-colors hover:text-primary"
                                    >
                                        Contact Management
                                    </Link>
                                </li>
                            </ul>
                        </div>

                        {/* Resources Column */}
                        <div>
                            <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-slate-900">
                                Resources
                            </h3>
                            <ul className="space-y-3">
                                <li>
                                    <Link
                                        href="/faq"
                                        className="text-sm text-slate-600 transition-colors hover:text-primary"
                                    >
                                        FAQ
                                    </Link>
                                </li>
                                <li>
                                    <a
                                        href={`https://wa.me/${settings.whatsapp_support || '6281234567890'}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-sm text-slate-600 transition-colors hover:text-primary"
                                    >
                                        Whatsapp Support
                                    </a>
                                </li>
                                <li>
                                    <a
                                        href={`mailto:${settings.email_support || 'support@chatcepat.com'}`}
                                        className="text-sm text-slate-600 transition-colors hover:text-primary"
                                    >
                                        Email Support
                                    </a>
                                </li>
                                <li>
                                    <Link
                                        href="/terms"
                                        className="text-sm text-slate-600 transition-colors hover:text-primary"
                                    >
                                        Terms & Conditions
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        href="/privacy"
                                        className="text-sm text-slate-600 transition-colors hover:text-primary"
                                    >
                                        Privacy Policy
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        href="/payment/return"
                                        className="text-sm text-slate-600 transition-colors hover:text-primary"
                                    >
                                        Return, Refund & Delivery Policy
                                    </Link>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Copyright */}
                <div className="mt-12 border-t border-slate-200 pt-8">
                    <p className="text-center text-sm text-slate-600">
                        Copyright © {currentYear} {settings.site_name || 'ChatCepat'}. All rights reserved.
                    </p>
                </div>
            </div>
        </footer>
    );
}
