import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    MobileNav,
    MobileNavHeader,
    MobileNavMenu,
    MobileNavToggle,
    NavbarButton,
    Navbar as NavbarContainer,
    NavBody,
} from '@/components/ui/resizable-navbar';
import { ShimmerButton } from '@/components/ui/shimmer-button';
import { login, register } from '@/routes';
import { type SharedData } from '@/types';
import { Link, router, usePage } from '@inertiajs/react';
import { LayoutDashboard, LogOut, Sparkles } from 'lucide-react';
import { useState } from 'react';

interface NavbarProps {
    canRegister?: boolean;
}

export default function Navbar({ canRegister = true }: NavbarProps) {
    const { auth, settings } = usePage<SharedData>().props;
    const currentUrl = usePage().url;
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const navItems = [
        { name: 'Home', link: '/' },
        // { name: 'Harga', link: '/pricing' }, // HIDDEN
        { name: 'Blog', link: '/blog' },
        // { name: 'Kontak', link: '/contact' }, // HIDDEN
    ];

    const profileMenuItems = [
        { name: 'Tentang Kami', link: '/about' },
        { name: 'Syarat & Ketentuan', link: '/terms' },
        { name: 'Kebijakan Privasi', link: '/privacy' },
        { name: 'FAQ', link: '/faq' },
    ];

    const isActive = (link: string) => {
        return currentUrl === link || currentUrl.startsWith(link + '/');
    };

    const isProfileMenuActive = () => {
        return profileMenuItems.some((item) => isActive(item.link));
    };

    return (
        <NavbarContainer className="!fixed !top-4">
            <NavBody className="!mt-0">
                {/* Logo */}
                <Link
                    href="/"
                    className="relative z-20 flex items-center gap-2"
                >
                    {settings.logo ? (
                        <img
                            src={`/storage/${settings.logo}`}
                            alt={settings.site_name}
                            className="h-10 w-auto object-contain"
                        />
                    ) : (
                        <>
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600">
                                <Sparkles className="h-5 w-5 text-white" />
                            </div>
                            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-xl font-bold text-transparent">
                                {settings.site_name || 'Chatcepat'}
                            </span>
                        </>
                    )}
                </Link>

                {/* Nav Items - positioned absolutely to appear in center */}
                <div className="pointer-events-none absolute inset-0 hidden flex-row items-center justify-center lg:flex">
                    <div className="pointer-events-auto flex items-center gap-2">
                        {/* Home Link */}
                        <Link
                            href={navItems[0].link}
                            className={`relative rounded-[100px] px-4 py-2 font-medium transition-all duration-200 ${isActive(navItems[0].link)
                                ? 'bg-blue-600 text-white shadow-sm'
                                : 'text-neutral-600 hover:bg-slate-50 hover:text-blue-600'
                                }`}
                        >
                            {navItems[0].name}
                        </Link>

                        {/* Profile Dropdown */}
                        <div className="group relative">
                            <button
                                className={`flex items-center gap-1 rounded-[100px] px-4 py-2 font-medium transition-all duration-200 ${isProfileMenuActive()
                                    ? 'bg-blue-600 text-white shadow-sm'
                                    : 'text-neutral-600 hover:bg-slate-50 hover:text-blue-600'
                                    }`}
                            >
                                Profil
                                <svg
                                    className="h-4 w-4 transition-transform group-hover:rotate-180"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M19 9l-7 7-7-7"
                                    />
                                </svg>
                            </button>
                            <div className="invisible absolute top-full left-0 z-50 mt-2 w-56 rounded-lg border border-slate-200 bg-white opacity-0 shadow-lg transition-all group-hover:visible group-hover:opacity-100">
                                <div className="py-2">
                                    {profileMenuItems.map((item, idx) => (
                                        <Link
                                            key={idx}
                                            href={item.link}
                                            className={`mx-2 block rounded-[100px] px-4 py-2.5 transition-all duration-200 ${isActive(item.link)
                                                ? 'bg-blue-600/10 font-medium text-blue-600'
                                                : 'text-slate-700 hover:bg-slate-50 hover:text-blue-600'
                                                }`}
                                        >
                                            {item.name}
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Other Nav Items */}
                        {navItems.slice(1).map((item, idx) => (
                            <Link
                                key={idx}
                                href={item.link}
                                className={`relative rounded-[100px] px-4 py-2 font-medium transition-all duration-200 ${isActive(item.link)
                                    ? 'bg-blue-600 text-white shadow-sm'
                                    : 'text-neutral-600 hover:bg-slate-50 hover:text-blue-600'
                                    }`}
                            >
                                {item.name}
                            </Link>
                        ))}
                    </div>
                </div>

                {/* Right side - Auth */}
                <div className="relative z-20 flex items-center gap-4">
                    {/* Auth Buttons */}
                    {auth.user ? (
                        <DropdownMenu>
                            <DropdownMenuTrigger className="flex items-center gap-2 rounded-full outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 font-semibold text-white shadow-lg">
                                    {auth.user.name.charAt(0).toUpperCase()}
                                </div>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56">
                                <div className="px-2 py-1.5">
                                    <p className="text-sm font-medium">
                                        {auth.user.name}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        {auth.user.email}
                                    </p>
                                </div>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                    onClick={() => router.visit(auth.user.role === 'admin' ? '/admin/dashboard' : auth.user.role === 'owner' ? '/owner/dashboard' : '/user/dashboard')}
                                    className="cursor-pointer"
                                >
                                    <LayoutDashboard className="mr-2 h-4 w-4" />
                                    Dashboard
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                    onClick={() => router.post('/logout', {}, {
                                        onError: () => window.location.href = '/login'
                                    })}
                                    className="cursor-pointer text-red-600 focus:text-red-600"
                                >
                                    <LogOut className="mr-2 h-4 w-4" />
                                    Keluar
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    ) : (
                        <>
                            <NavbarButton
                                href={login().url}
                                variant="secondary"
                                as={Link}
                                className="rounded-[100px] border-0 bg-slate-100 font-medium text-slate-700 hover:bg-slate-200"
                            >
                                Masuk
                            </NavbarButton>
                            {canRegister && (
                                <Link href={register().url}>
                                    <ShimmerButton
                                        background="rgb(37, 99, 235)"
                                        className="px-5 py-2 text-sm shadow-lg shadow-blue-500/30"
                                    >
                                        Coba Gratis
                                    </ShimmerButton>
                                </Link>
                            )}
                        </>
                    )}
                </div>
            </NavBody>

            {/* Mobile Navigation */}
            <MobileNav>
                <MobileNavHeader>
                    <Link
                        href="/"
                        className="relative z-20 flex items-center gap-2"
                    >
                        {settings.logo ? (
                            <img
                                src={`/storage/${settings.logo}`}
                                alt={settings.site_name}
                                className="h-10 w-auto object-contain"
                            />
                        ) : (
                            <>
                                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600">
                                    <Sparkles className="h-5 w-5 text-white" />
                                </div>
                                <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-xl font-bold text-transparent">
                                    {settings.site_name || 'Chatcepat'}
                                </span>
                            </>
                        )}
                    </Link>

                    <MobileNavToggle
                        isOpen={mobileMenuOpen}
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    />
                </MobileNavHeader>

                <MobileNavMenu
                    isOpen={mobileMenuOpen}
                    onClose={() => setMobileMenuOpen(false)}
                >
                    {/* Home Link */}
                    <div className="mb-2 w-full space-y-1 border-b border-slate-200 pb-4">
                        <Link
                            href={navItems[0].link}
                            className={`relative block rounded-[100px] px-3 py-2.5 font-medium transition-all duration-200 ${isActive(navItems[0].link)
                                ? 'bg-blue-600 font-semibold text-white shadow-sm'
                                : 'text-slate-700 hover:bg-slate-50 hover:text-blue-600'
                                }`}
                            onClick={() => setMobileMenuOpen(false)}
                        >
                            {navItems[0].name}
                        </Link>
                    </div>

                    {/* Profile Menu Items */}
                    <div className="mb-2 w-full border-b border-slate-200 pb-4">
                        <div
                            className={`mb-3 rounded-[100px] px-3 py-1.5 text-xs font-semibold transition-all duration-200 ${isProfileMenuActive()
                                ? 'bg-blue-600 text-white'
                                : 'text-slate-500'
                                }`}
                        >
                            PROFIL
                        </div>
                        {profileMenuItems.map((item, idx) => (
                            <Link
                                key={idx}
                                href={item.link}
                                className={`block rounded-[100px] px-3 py-2.5 transition-all duration-200 ${isActive(item.link)
                                    ? 'bg-blue-600/10 font-medium text-blue-600'
                                    : 'text-slate-700 hover:bg-slate-50 hover:text-blue-600'
                                    }`}
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                {item.name}
                            </Link>
                        ))}
                    </div>

                    {/* Other Nav Items */}
                    <div className="mb-2 w-full space-y-1 border-b border-slate-200 pb-4">
                        {navItems.slice(1).map((item, idx) => (
                            <Link
                                key={idx}
                                href={item.link}
                                className={`relative block rounded-[100px] px-3 py-2.5 font-medium transition-all duration-200 ${isActive(item.link)
                                    ? 'bg-blue-600 font-semibold text-white shadow-sm'
                                    : 'text-slate-700 hover:bg-slate-50 hover:text-blue-600'
                                    }`}
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                {item.name}
                            </Link>
                        ))}
                    </div>

                    {/* Mobile Auth Buttons */}
                    <div className="flex w-full flex-col gap-3 pt-4">
                        {auth.user ? (
                            <div className="w-full space-y-2">
                                <div className="flex items-center gap-3 rounded-lg bg-slate-50 px-3 py-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 font-semibold text-white shadow-lg">
                                        {auth.user.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-medium text-slate-900">
                                            {auth.user.name}
                                        </p>
                                        <p className="text-xs text-slate-500">
                                            {auth.user.email}
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => {
                                        setMobileMenuOpen(false);
                                        router.visit(auth.user.role === 'admin' ? '/admin/dashboard' : auth.user.role === 'owner' ? '/owner/dashboard' : '/user/dashboard');
                                    }}
                                    className="flex w-full items-center gap-2 rounded-[100px] bg-slate-100 px-4 py-3 font-medium text-slate-700 transition-colors hover:bg-slate-200"
                                >
                                    <LayoutDashboard className="h-4 w-4" />
                                    Dashboard
                                </button>
                                <button
                                    onClick={() => {
                                        setMobileMenuOpen(false);
                                        router.post('/logout', {}, {
                                            onError: () => window.location.href = '/login'
                                        });
                                    }}
                                    className="flex w-full items-center gap-2 rounded-[100px] bg-red-50 px-4 py-3 font-medium text-red-600 transition-colors hover:bg-red-100"
                                >
                                    <LogOut className="h-4 w-4" />
                                    Keluar
                                </button>
                            </div>
                        ) : (
                            <>
                                <NavbarButton
                                    href={login().url}
                                    as={Link}
                                    variant="secondary"
                                    className="w-full rounded-[100px] border-0 bg-slate-100 font-medium text-slate-700 hover:bg-slate-200"
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    Masuk
                                </NavbarButton>
                                {canRegister && (
                                    <ShimmerButton
                                        background="rgb(37, 99, 235)"
                                        className="h-12 w-full text-base font-medium"
                                        onClick={() => {
                                            setMobileMenuOpen(false);
                                            router.visit(register().url);
                                        }}
                                    >
                                        Coba Gratis
                                    </ShimmerButton>
                                )}
                            </>
                        )}
                    </div>
                </MobileNavMenu>
            </MobileNav>
        </NavbarContainer>
    );
}
