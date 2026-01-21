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

            <div className="space-y-6 md:space-y-8">
                {/* Header Section */}
                <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-6 border mb-8">
                    <div className="absolute inset-0 bg-grid-white/10 [mask-image:radial-gradient(white,transparent_85%)]" />
                    <div className="relative">
                        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-foreground">
                            Upgrade Paket
                        </h1>
                        <p className="text-sm sm:text-base md:text-lg text-muted-foreground mt-2">
                            Pilih paket yang sesuai dengan kebutuhan bisnis Anda
                        </p>
                    </div>
                </div>

                {/* Pricing Cards */}
                <div className="grid gap-4 sm:gap-5 md:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4">
                    {packages.map((pkg) => {
                        const isFeatured = pkg.is_featured;

                        return (
                            <Card
                                key={pkg.id}
                                className={cn(
                                    "relative flex flex-col overflow-hidden transition-all duration-300 hover:shadow-xl",
                                    isFeatured && "border-2 border-primary shadow-lg xl:scale-105"
                                )}
                            >
                                {isFeatured && (
                                    <div className="absolute right-3 top-3 sm:right-4 sm:top-4 z-10">
                                        <Badge className="bg-primary/10 text-primary border-primary/20 gap-1 text-xs">
                                            <Star className="size-3 fill-current" />
                                            Populer
                                        </Badge>
                                    </div>
                                )}

                                <CardHeader className={cn(
                                    "pb-6 sm:pb-8 space-y-2",
                                    isFeatured && "bg-primary/5"
                                )}>
                                    <CardTitle className="text-xl sm:text-2xl pr-16 sm:pr-0">
                                        {pkg.name}
                                    </CardTitle>
                                    <CardDescription className="text-xs sm:text-sm min-h-[36px] sm:min-h-[40px] line-clamp-2">
                                        {pkg.description}
                                    </CardDescription>

                                    <div className="pt-3 sm:pt-4">
                                        <div className="flex items-baseline gap-1.5 sm:gap-2">
                                            <span className="text-sm text-muted-foreground">Rp</span>
                                            <span className="text-2xl sm:text-3xl md:text-4xl font-bold">
                                                {Number(pkg.price).toLocaleString('id-ID', {
                                                    minimumFractionDigits: 0,
                                                    maximumFractionDigits: 0
                                                })}
                                            </span>
                                        </div>
                                        <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                                            per {pkg.period_text}
                                        </p>
                                    </div>
                                </CardHeader>

                                <CardContent className="flex-1 pb-4 sm:pb-6 px-4 sm:px-6">
                                    <div className="space-y-2 sm:space-y-3">
                                        <p className="text-xs sm:text-sm font-semibold text-muted-foreground mb-3 sm:mb-4">
                                            Fitur yang didapatkan:
                                        </p>
                                        <ul className="space-y-2">
                                            {pkg.features.map((feature, index) => (
                                                <li key={index} className="flex items-start gap-2">
                                                    <Check className="size-3.5 sm:size-4 text-primary mt-0.5 flex-shrink-0" />
                                                    <span className="text-xs sm:text-sm leading-relaxed">{feature}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </CardContent>

                                <CardFooter className="pt-4 sm:pt-6 pb-4 sm:pb-6 px-4 sm:px-6 border-t bg-muted/20">
                                    {pkg.slug === 'enterprise' ? (
                                        <Button
                                            asChild
                                            variant="outline"
                                            className="w-full text-sm sm:text-base"
                                            size="default"
                                        >
                                            <Link href={pkg.button_url}>
                                                {pkg.button_text}
                                                <ArrowRight className="ml-2 size-4" />
                                            </Link>
                                        </Button>
                                    ) : (
                                        <Button
                                            asChild
                                            variant={isFeatured ? "default" : "outline"}
                                            className={cn(
                                                "w-full text-sm sm:text-base",
                                                isFeatured && "bg-primary hover:bg-primary/90"
                                            )}
                                            size="default"
                                        >
                                            <Link href={`/payment?package_id=${pkg.id}`}>
                                                {pkg.button_text}
                                                <ArrowRight className="ml-2 size-4" />
                                            </Link>
                                        </Button>
                                    )}
                                </CardFooter>
                            </Card>
                        );
                    })}
                </div>

                {/* Additional Info */}
                <Card className="bg-gradient-to-br from-primary/5 via-primary/10 to-primary/5 border-primary/20">
                    <CardHeader className="pb-4 sm:pb-6">
                        <CardTitle className="text-base sm:text-lg md:text-xl">
                            Informasi Pembayaran
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2.5 sm:space-y-3 text-xs sm:text-sm px-4 sm:px-6">
                        <div className="flex items-start gap-2">
                            <Check className="size-4 text-primary mt-0.5 flex-shrink-0" />
                            <p className="leading-relaxed">Pembayaran dapat dilakukan melalui berbagai metode: Transfer Bank, E-Wallet, Virtual Account, dan lainnya</p>
                        </div>
                        <div className="flex items-start gap-2">
                            <Check className="size-4 text-primary mt-0.5 flex-shrink-0" />
                            <p className="leading-relaxed">Paket akan aktif otomatis setelah pembayaran terverifikasi (maksimal 5 menit)</p>
                        </div>
                        <div className="flex items-start gap-2">
                            <Check className="size-4 text-primary mt-0.5 flex-shrink-0" />
                            <p className="leading-relaxed">Upgrade paket dapat dilakukan kapan saja, sisa masa aktif paket lama akan diakumulasikan</p>
                        </div>
                        <div className="flex items-start gap-2">
                            <Check className="size-4 text-primary mt-0.5 flex-shrink-0" />
                            <p className="leading-relaxed">Untuk paket Enterprise atau pertanyaan lainnya, hubungi tim support kami</p>
                        </div>
                    </CardContent>
                </Card>

                {/* Support Section */}
                <div className="bg-muted/50 rounded-lg p-4 sm:p-6 text-center">
                    <p className="text-xs sm:text-sm text-muted-foreground mb-3">
                        Butuh bantuan memilih paket yang tepat?
                    </p>
                    <Button asChild variant="outline" size="sm" className="text-xs sm:text-sm">
                        <Link href="/contact">
                            Hubungi Support
                            <ArrowRight className="ml-2 size-4" />
                        </Link>
                    </Button>
                </div>
            </div>
        </UserLayout>
    );
}
