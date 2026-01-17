import { Link, usePage } from '@inertiajs/react';
import { Zap } from 'lucide-react';

export function SidebarHeaderContent() {
    const { settings } = usePage<{
        settings: {
            site_name: string;
            logo: string | null;
        };
    }>().props;

    return (
        <Link
            href="/admin/dashboard"
            className="group flex items-center justify-center px-4 py-4 transition-all"
        >
            {settings.logo ? (
                <img
                    src={`/storage/${settings.logo}`}
                    alt={settings.site_name}
                    className="h-8 w-auto object-contain transition-transform duration-150 group-hover:scale-[1.02]"
                />
            ) : (
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground transition-transform duration-150 group-hover:scale-[1.02]">
                    <Zap className="h-4.5 w-4.5" strokeWidth={2} />
                </div>
            )}
        </Link>
    );
}
