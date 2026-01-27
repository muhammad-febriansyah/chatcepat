import { Head, Link } from '@inertiajs/react';
import UserLayout from '@/layouts/user/user-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Check, Star, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface PricingPackage {
    id: number;
    name: string;
    slug: string;
    description: string;
    price: string;
    currency: string;
    period: number;
    period_unit: string;
    features: string[];
    is_featured: boolean;
    is_active: boolean;
    button_text: string;
    button_url: string;
    formatted_price: string;
    period_text: string;
}

interface TopUpProps {
    packages: PricingPackage[];
}

export default function TopUp({ packages }: TopUpProps) {
    return (
        <UserLayout>
            <Head title="Upgrade Paket" />

            <div className="space-y-8">
                {/* Header Section */}
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-50 via-white to-blue-50 dark:from-blue-950/20 dark:via-background dark:to-blue-950/20 p-8 border-2 shadow-sm">
                    <div className="absolute inset-0 bg-grid-slate-900/[0.04] [mask-image:radial-gradient(white,transparent_85%)]" />
                    <div className="relative text-center">
                        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent">
                            Pilih Paket Terbaik untuk Bisnis Anda
                        </h1>
                        <p className="text-base md:text-lg text-muted-foreground mt-3 max-w-2xl mx-auto">
                            Tingkatkan produktivitas dengan fitur lengkap dan dukungan terbaik
                        </p>
                    </div>
                </div>

                {/* Pricing Cards */}
                <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
                    {packages.filter(pkg => pkg.slug !== 'trial').map((pkg) => {
                        const isFeatured = pkg.is_featured;

                        return (
                            <Card
                                key={pkg.id}
                                className={cn(
                                    "relative flex flex-col h-full overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 group",
                                    isFeatured ? "border-2 border-primary shadow-xl ring-2 ring-primary/20" : "hover:border-primary/50"
                                )}
                            >
                                {isFeatured && (
                                    <>
                                        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary via-blue-500 to-primary" />
                                        <div className="absolute right-4 top-4 z-10">
                                            <Badge className="bg-primary text-primary-foreground border-0 gap-1 text-xs font-semibold shadow-lg">
                                                <Star className="size-3 fill-current" />
                                                Populer
                                            </Badge>
                                        </div>
                                    </>
                                )}

                                <CardHeader className={cn(
                                    "pb-8 space-y-3 relative",
                                    isFeatured && "bg-gradient-to-br from-primary/5 via-blue-50/50 to-transparent dark:from-primary/10 dark:via-blue-950/50"
                                )}>
                                    <CardTitle className="text-2xl font-bold pr-20">
                                        {pkg.name}
                                    </CardTitle>
                                    <CardDescription className="text-sm min-h-[44px] line-clamp-2 leading-relaxed">
                                        {pkg.description}
                                    </CardDescription>

                                    <div className="pt-4 !mt-4 border-t border-border/50">
                                        <div className="flex items-baseline gap-2">
                                            <span className="text-sm font-medium text-muted-foreground">Rp</span>
                                            <span className="text-4xl font-extrabold tracking-tight">
                                                {Number(pkg.price).toLocaleString('id-ID', {
                                                    minimumFractionDigits: 0,
                                                    maximumFractionDigits: 0
                                                })}
                                            </span>
                                        </div>
                                        <p className="text-sm text-muted-foreground mt-1.5 font-medium">
                                            per {pkg.period_text}
                                        </p>
                                    </div>
                                </CardHeader>

                                <CardContent className="flex-1 pb-6 px-6">
                                    <div className="space-y-3">
                                        <p className="text-xs font-bold text-foreground uppercase tracking-wide mb-4">
                                            Fitur Lengkap
                                        </p>
                                        <ul className="space-y-2.5">
                                            {pkg.features.map((feature, index) => (
                                                <li key={index} className="flex items-start gap-2.5">
                                                    <div className="mt-0.5">
                                                        <Check className="size-4 text-primary" strokeWidth={3} />
                                                    </div>
                                                    <span className="text-sm leading-relaxed text-foreground/90">{feature}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </CardContent>

                                <CardFooter className="pt-6 pb-6 px-6 border-t bg-gradient-to-br from-muted/30 to-transparent">
                                    {pkg.slug === 'enterprise' ? (
                                        <Button
                                            asChild
                                            variant="outline"
                                            className="w-full font-semibold group-hover:border-primary group-hover:text-primary transition-all"
                                            size="lg"
                                        >
                                            <Link href={pkg.button_url}>
                                                {pkg.button_text}
                                                <ArrowRight className="ml-2 size-4 group-hover:translate-x-1 transition-transform" />
                                            </Link>
                                        </Button>
                                    ) : (
                                        <Button
                                            asChild
                                            variant={isFeatured ? "default" : "outline"}
                                            className={cn(
                                                "w-full font-semibold transition-all",
                                                isFeatured ? "bg-primary hover:bg-primary/90 shadow-lg shadow-primary/30" : "group-hover:border-primary group-hover:text-primary"
                                            )}
                                            size="lg"
                                        >
                                            <Link href={`/payment?package_id=${pkg.id}`}>
                                                {pkg.button_text}
                                                <ArrowRight className="ml-2 size-4 group-hover:translate-x-1 transition-transform" />
                                            </Link>
                                        </Button>
                                    )}
                                </CardFooter>
                            </Card>
                        );
                    })}
                </div>

                {/* Additional Info */}
                <Card className="bg-gradient-to-br from-blue-50 via-white to-blue-50 dark:from-blue-950/20 dark:via-background dark:to-blue-950/20 border-2 shadow-sm">
                    <CardHeader className="pb-6">
                        <CardTitle className="text-xl md:text-2xl font-bold">
                            Informasi Pembayaran
                        </CardTitle>
                        <CardDescription>
                            Segala hal yang perlu Anda ketahui tentang pembayaran
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4 px-6">
                        <div className="flex items-start gap-3">
                            <div className="mt-0.5 p-1.5 rounded-full bg-primary/10">
                                <Check className="size-4 text-primary" strokeWidth={3} />
                            </div>
                            <p className="text-sm leading-relaxed">Pembayaran dapat dilakukan melalui berbagai metode: Transfer Bank, E-Wallet, Virtual Account, QRIS, dan lainnya</p>
                        </div>
                        <div className="flex items-start gap-3">
                            <div className="mt-0.5 p-1.5 rounded-full bg-primary/10">
                                <Check className="size-4 text-primary" strokeWidth={3} />
                            </div>
                            <p className="text-sm leading-relaxed">Paket akan aktif otomatis setelah pembayaran terverifikasi (maksimal 5 menit)</p>
                        </div>
                        <div className="flex items-start gap-3">
                            <div className="mt-0.5 p-1.5 rounded-full bg-primary/10">
                                <Check className="size-4 text-primary" strokeWidth={3} />
                            </div>
                            <p className="text-sm leading-relaxed">Upgrade paket dapat dilakukan kapan saja, sisa masa aktif paket lama akan terakumulasi</p>
                        </div>
                        <div className="flex items-start gap-3">
                            <div className="mt-0.5 p-1.5 rounded-full bg-primary/10">
                                <Check className="size-4 text-primary" strokeWidth={3} />
                            </div>
                            <p className="text-sm leading-relaxed">Untuk paket Enterprise atau pertanyaan lainnya, hubungi tim support kami</p>
                        </div>
                    </CardContent>
                </Card>

                {/* Support Section */}
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border-2 border-primary/20 p-8 text-center shadow-lg">
                    <div className="absolute inset-0 bg-grid-slate-900/[0.04] [mask-image:radial-gradient(white,transparent_85%)]" />
                    <div className="relative">
                        <p className="text-base font-semibold text-foreground mb-2">
                            Butuh bantuan memilih paket yang tepat?
                        </p>
                        <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">
                            Tim support kami siap membantu Anda menemukan solusi terbaik untuk bisnis Anda
                        </p>
                        <Button asChild variant="default" size="lg" className="shadow-lg shadow-primary/30 font-semibold">
                            <Link href="/contact">
                                Hubungi Support
                                <ArrowRight className="ml-2 size-4" />
                            </Link>
                        </Button>
                    </div>
                </div>
            </div>
        </UserLayout>
    );
}
