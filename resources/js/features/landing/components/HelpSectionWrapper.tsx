import React from 'react';
import HelpSection from '@/components/help-section';
import { Clock, MessageCircle, Phone, Users } from 'lucide-react';

interface HelpSectionWrapperProps {
    settings: any;
}

export function HelpSectionWrapper({ settings }: HelpSectionWrapperProps) {
    return (
        <div className="bg-gradient-to-b from-white to-slate-50 px-4 py-12 sm:px-6 sm:py-16 lg:py-20">
            <div className="container mx-auto max-w-7xl">
                <HelpSection
                    title="Butuh Bantuan Segera?"
                    description="Tim support kami siap membantu Anda melalui berbagai channel komunikasi. Hubungi kami kapan saja!"
                    imageKey="contact_help_image"
                    buttons={[
                        {
                            label: 'Telepon Kami',
                            href: `tel:${settings.contact_phone?.replace(/\D/g, '')}`,
                            icon: Phone,
                            variant: 'outline',
                        },
                        {
                            label: 'Chat WhatsApp',
                            href: `https://wa.me/${settings.contact_phone?.replace(/\D/g, '')}`,
                            icon: MessageCircle,
                            variant: 'primary',
                        },
                    ]}
                    badges={[
                        {
                            label: 'Respon Cepat',
                            color: 'green',
                            animated: true,
                        },
                        {
                            label: '24/7 Support',
                            color: 'blue',
                            icon: Clock,
                        },
                        {
                            label: 'Customer Oriented',
                            color: 'purple',
                            icon: Users,
                        },
                    ]}
                />
            </div>
        </div>
    );
}
