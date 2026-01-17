import { Link } from '@inertiajs/react';
import { ChevronRight } from 'lucide-react';
import { BreadcrumbsProps } from '@/types/components/page-header.types';

/**
 * Breadcrumbs navigation component
 *
 * Displays a hierarchical navigation path with clickable links
 * and separators between items.
 */
export default function Breadcrumbs({ items }: BreadcrumbsProps) {
    if (!items || items.length === 0) {
        return null;
    }

    return (
        <nav
            className="mb-6 flex items-center gap-2 text-sm"
            aria-label="Breadcrumb"
        >
            <ol className="flex items-center gap-2">
                {items.map((item, index) => {
                    const isLast = index === items.length - 1;

                    return (
                        <li key={index} className="flex items-center gap-2">
                            {item.href && !isLast ? (
                                <Link
                                    href={item.href}
                                    className="text-white/70 hover:text-white transition-colors duration-200"
                                >
                                    {item.name}
                                </Link>
                            ) : (
                                <span
                                    className={isLast ? 'font-medium text-white' : 'text-white/70'}
                                >
                                    {item.name}
                                </span>
                            )}

                            {!isLast && (
                                <ChevronRight
                                    className="w-4 h-4 text-white/50"
                                    aria-hidden="true"
                                />
                            )}
                        </li>
                    );
                })}
            </ol>
        </nav>
    );
}
