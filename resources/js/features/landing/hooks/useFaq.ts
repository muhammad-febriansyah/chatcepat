import { useState } from 'react';

export function useFaq() {
    const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

    const toggleFaq = (index: number) => {
        setOpenFaqIndex(openFaqIndex === index ? null : index);
    };

    const isOpen = (index: number) => openFaqIndex === index;

    return {
        openFaqIndex,
        toggleFaq,
        isOpen,
    };
}
