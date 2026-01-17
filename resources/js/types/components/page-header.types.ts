/**
 * Type definitions for PageHeader component
 */

export interface BreadcrumbItem {
    name: string;
    href?: string;
}

export interface PageHeaderProps {
    /**
     * Main title of the page
     */
    title: string;

    /**
     * Optional description text displayed below the title
     */
    description?: string;

    /**
     * Optional breadcrumb navigation items
     */
    breadcrumbs?: BreadcrumbItem[];

    /**
     * Optional custom class name for additional styling
     */
    className?: string;

    /**
     * Optional children elements to render in the header
     */
    children?: React.ReactNode;
}

export interface BreadcrumbsProps {
    items: BreadcrumbItem[];
}
