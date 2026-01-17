import { motion, AnimatePresence } from 'framer-motion';
import { usePage } from '@inertiajs/react';
import { ReactNode } from 'react';

interface PageTransitionProps {
    children: ReactNode;
    variant?: 'fade' | 'slide' | 'scale' | 'slideUp';
}

export default function PageTransition({
    children,
    variant = 'slideUp'
}: PageTransitionProps) {
    const { url } = usePage();

    const variants = {
        fade: {
            initial: { opacity: 0 },
            animate: { opacity: 1 },
            exit: { opacity: 0 },
        },
        slide: {
            initial: { opacity: 0, x: -20 },
            animate: { opacity: 1, x: 0 },
            exit: { opacity: 0, x: 20 },
        },
        slideUp: {
            initial: { opacity: 0, y: 20 },
            animate: { opacity: 1, y: 0 },
            exit: { opacity: 0, y: -20 },
        },
        scale: {
            initial: { opacity: 0, scale: 0.95 },
            animate: { opacity: 1, scale: 1 },
            exit: { opacity: 0, scale: 0.95 },
        },
    };

    const transition = {
        type: 'spring',
        stiffness: 260,
        damping: 20,
        duration: 0.3,
    };

    return (
        <AnimatePresence mode="wait" initial={false}>
            <motion.div
                key={url}
                initial="initial"
                animate="animate"
                exit="exit"
                variants={variants[variant]}
                transition={transition}
                style={{ width: '100%' }}
            >
                {children}
            </motion.div>
        </AnimatePresence>
    );
}
