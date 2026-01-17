import { motion } from 'framer-motion';
import { Clock, Mail, LucideIcon } from 'lucide-react';
import { usePage } from '@inertiajs/react';
import { type SharedData } from '@/types';

interface Badge {
    icon?: LucideIcon;
    label: string;
    color: 'green' | 'blue' | 'purple' | 'orange' | 'red';
    animated?: boolean;
}

interface Button {
    label: string;
    href: string;
    icon?: LucideIcon;
    variant?: 'primary' | 'outline';
}

interface HelpSectionProps {
    title: string;
    description: string;
    buttons: Button[];
    badges?: Badge[];
    imageKey?: string; // Key dari settings untuk gambar (e.g., 'contact_help_image')
    className?: string;
}

const colorClasses = {
    green: 'bg-green-50 text-green-700',
    blue: 'bg-blue-50 text-blue-700',
    purple: 'bg-purple-50 text-purple-700',
    orange: 'bg-orange-50 text-orange-700',
    red: 'bg-red-50 text-red-700',
};

export default function HelpSection({
    title,
    description,
    buttons,
    badges,
    imageKey,
    className = '',
}: HelpSectionProps) {
    const { settings } = usePage<SharedData>().props;
    const imageUrl = imageKey && settings[imageKey as keyof typeof settings]
        ? `/storage/${settings[imageKey as keyof typeof settings]}`
        : null;

    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] as any }}
            className={`mt-12 sm:mt-16 ${className}`}
        >
            <div className="relative mx-auto max-w-6xl overflow-hidden rounded-3xl bg-gradient-to-br from-white via-slate-50/50 to-white p-1 shadow-2xl">
                {/* Gradient border effect */}
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-primary/20 via-primary/10 to-primary/5 opacity-50"></div>

                <div className="relative overflow-hidden rounded-3xl border border-slate-100 bg-white">
                    {/* Animated decorative elements */}
                    <motion.div
                        animate={{
                            scale: [1, 1.2, 1],
                            opacity: [0.3, 0.5, 0.3],
                        }}
                        transition={{
                            duration: 4,
                            repeat: Infinity,
                            ease: "easeInOut",
                        }}
                        className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-gradient-to-br from-primary/20 to-blue-500/20 blur-3xl"
                    ></motion.div>
                    <motion.div
                        animate={{
                            scale: [1, 1.3, 1],
                            opacity: [0.2, 0.4, 0.2],
                        }}
                        transition={{
                            duration: 5,
                            repeat: Infinity,
                            ease: "easeInOut",
                            delay: 1,
                        }}
                        className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-gradient-to-tr from-primary/15 to-purple-500/15 blur-3xl"
                    ></motion.div>

                    {/* Top accent bar with gradient */}
                    <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-primary via-blue-500 to-primary"></div>

                    {/* Horizontal Layout */}
                    <div className="relative flex flex-col items-center gap-8 p-8 sm:p-12 lg:flex-row lg:gap-12">
                        {/* Image with animation */}
                        {imageUrl && (
                            <motion.div
                                initial={{ scale: 0.8, opacity: 0, x: -30 }}
                                whileInView={{ scale: 1, opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{
                                    duration: 0.6,
                                    ease: [0.16, 1, 0.3, 1] as any,
                                    delay: 0.2,
                                }}
                                className="flex-shrink-0"
                            >
                                <div className="relative">
                                    {/* Glow effect behind image */}
                                    <div className="absolute inset-0 rounded-full bg-primary/20 blur-2xl"></div>
                                    <div className="relative h-52 w-52 sm:h-64 sm:w-64 lg:h-72 lg:w-72">
                                        <img
                                            src={imageUrl}
                                            alt={title}
                                            className="h-full w-full object-contain drop-shadow-2xl"
                                        />
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* Content */}
                        <div className="flex flex-1 flex-col">
                            <motion.div
                                initial={{ opacity: 0, x: imageUrl ? 30 : 0, y: imageUrl ? 0 : 20 }}
                                whileInView={{ opacity: 1, x: 0, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.6, delay: 0.3 }}
                            >
                                <h3 className={`mb-4 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 bg-clip-text text-3xl font-bold leading-tight text-transparent sm:text-4xl sm:leading-tight ${imageUrl ? 'lg:text-left' : 'text-center'}`}>
                                    {title}
                                </h3>
                                <p className={`mb-8 text-base leading-relaxed text-slate-600 sm:text-lg sm:leading-relaxed ${imageUrl ? 'lg:text-left' : 'text-center'}`}>
                                    {description}
                                </p>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, x: imageUrl ? 30 : 0, y: imageUrl ? 0 : 20 }}
                                whileInView={{ opacity: 1, x: 0, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.6, delay: 0.4 }}
                                className={`mb-8 flex flex-col gap-4 sm:flex-row ${imageUrl ? 'lg:justify-start' : 'justify-center'}`}
                            >
                                {buttons.map((button, index) => {
                                    const Icon = button.icon;
                                    const isPrimary = button.variant !== 'outline';

                                    return (
                                        <motion.a
                                            key={index}
                                            href={button.href}
                                            whileHover={{ scale: 1.05, y: -2 }}
                                            whileTap={{ scale: 0.95 }}
                                            className={`group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-full px-8 py-4 font-semibold shadow-lg transition-all duration-300 hover:shadow-xl ${
                                                isPrimary
                                                    ? 'bg-gradient-to-r from-primary to-blue-600 text-white hover:shadow-primary/50'
                                                    : 'border-2 border-primary bg-white text-primary'
                                            }`}
                                        >
                                            {!isPrimary && (
                                                <div className="absolute inset-0 -z-10 bg-primary transition-transform duration-300 group-hover:translate-y-0 translate-y-full"></div>
                                            )}
                                            {Icon && (
                                                <Icon className={`relative z-10 h-5 w-5 transition-all duration-300 group-hover:rotate-12 ${!isPrimary ? 'group-hover:text-white' : ''}`} />
                                            )}
                                            <span className={`relative z-10 ${!isPrimary ? 'transition-colors duration-300 group-hover:text-white' : ''}`}>
                                                {button.label}
                                            </span>
                                            {isPrimary && (
                                                <div className="absolute inset-0 -z-10 bg-gradient-to-r from-blue-600 to-primary opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
                                            )}
                                        </motion.a>
                                    );
                                })}
                            </motion.div>

                            {/* Badges */}
                            {badges && badges.length > 0 && (
                                <motion.div
                                    initial={{ opacity: 0, x: imageUrl ? 30 : 0, y: imageUrl ? 0 : 20 }}
                                    whileInView={{ opacity: 1, x: 0, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.6, delay: 0.5 }}
                                    className={`flex flex-wrap gap-3 ${imageUrl ? 'lg:justify-start' : 'justify-center'}`}
                                >
                                    {badges.map((badge, index) => {
                                        const BadgeIcon = badge.icon;
                                        return (
                                            <div
                                                key={index}
                                                className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium ${colorClasses[badge.color]}`}
                                            >
                                                {badge.animated ? (
                                                    <div className={`h-2 w-2 animate-pulse rounded-full ${badge.color === 'green' ? 'bg-green-500' : badge.color === 'blue' ? 'bg-blue-500' : 'bg-purple-500'}`}></div>
                                                ) : BadgeIcon ? (
                                                    <BadgeIcon className="h-4 w-4" />
                                                ) : null}
                                                <span>{badge.label}</span>
                                            </div>
                                        );
                                    })}
                                </motion.div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
