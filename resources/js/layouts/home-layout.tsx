import FloatingWhatsApp from '@/components/floating-whatsapp';
import Footer from '@/components/footer';
import Navbar from '@/components/navbar';
import PageTransition from '@/components/page-transition';
import { type SharedData } from '@/types';
import { Head, usePage } from '@inertiajs/react';
import { Toaster, toast } from 'sonner';
import { useEffect, useRef } from 'react';
import { startCsrfAutoRefresh, stopCsrfAutoRefresh } from '@/utils/csrf-refresh';

interface HomeLayoutProps {
    children: React.ReactNode;
    title?: string;
    description?: string;
    canRegister?: boolean;
}

export default function HomeLayout({
    children,
    title = 'ChatCepat',
    description = 'Platform CRM berbasis AI yang membantu bisnis Anda',
    canRegister = true,
}: HomeLayoutProps) {
    const { settings, flash } = usePage<SharedData & { flash: { success?: string; error?: string } }>().props;
    const lastFlashRef = useRef<{ success?: string; error?: string }>({});

    useEffect(() => {
        if (flash?.success && typeof flash.success === 'string' && flash.success !== lastFlashRef.current.success) {
            toast.success(flash.success)
            lastFlashRef.current.success = flash.success
        }
        if (flash?.error && typeof flash.error === 'string' && flash.error !== lastFlashRef.current.error) {
            toast.error(flash.error)
            lastFlashRef.current.error = flash.error
        }
    }, [flash?.success, flash?.error]);

    // Auto-refresh CSRF token every 10 minutes (aggressive) to prevent 419 errors
    useEffect(() => {
        startCsrfAutoRefresh(10) // Refresh every 60 minutes

        return () => {
            stopCsrfAutoRefresh() // Cleanup on unmount
        }
    }, []);

    return (
        <>
            <Head title={title}>
                <meta name="description" content={description} />
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link
                    rel="preconnect"
                    href="https://fonts.gstatic.com"
                    crossOrigin="anonymous"
                />
                <link
                    href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&display=swap"
                    rel="stylesheet"
                />
            </Head>

            <div className="min-h-screen overflow-x-hidden bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
                <Navbar canRegister={canRegister} />
                <PageTransition>
                    <main>{children}</main>
                </PageTransition>
                <Footer />

                {/* Floating WhatsApp Button */}
                {settings.contact_phone && (
                    <FloatingWhatsApp
                        phoneNumber={settings.contact_phone}
                        message="Halo! Saya tertarik dengan ChatCepat dan ingin konsultasi lebih lanjut. Bisakah Anda membantu saya?"
                    />
                )}
            </div>
            <Toaster richColors position="top-right" />
        </>
    );
}
