import { Head, useForm } from '@inertiajs/react';
import UserLayout from '@/layouts/user/user-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    Coins,
    Sparkles,
    CreditCard,
    TrendingUp,
    History,
    Check,
    ArrowRight,
    Star,
} from 'lucide-react';
import { toast } from 'sonner';

interface CreditPackage {
    id: number;
    name: string;
    credits: number;
    price: number;
    bonus: number;
    popular: boolean;
}

interface UsageHistoryItem {
    date: string;
    type: 'usage' | 'purchase';
    credits: number;
    balance: number;
    description: string;
}

interface Props {
    user: any;
    currentCredit: number;
    creditPackages: CreditPackage[];
    usageHistory: UsageHistoryItem[];
}

export default function AICreditIndex({ user, currentCredit, creditPackages, usageHistory = [] }: Props) {
    const { data, setData, post, processing } = useForm({
        package_id: '',
        payment_method: 'bank_transfer',
    });

    const handlePurchase = (e: React.FormEvent) => {
        e.preventDefault();
        if (!data.package_id) {
            toast.error('Pilih paket credit terlebih dahulu!');
            return;
        }

        post(route('user.ai-credit.purchase'), {
            onSuccess: () => {
                toast.success('Pembelian AI Credit berhasil!');
            },
            onError: () => {
                toast.error('Gagal melakukan pembelian. Silakan coba lagi.');
            },
        });
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(amount);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const selectedPackage = creditPackages.find(p => p.id.toString() === data.package_id);

    return (
        <UserLayout>
            <Head title="Top Up AI Credit" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Top Up AI Credit</h1>
                        <p className="text-muted-foreground mt-1">
                            Beli AI Credit untuk menggunakan fitur Chatbot AI Cerdas
                        </p>
                    </div>
                </div>

                {/* Current Balance Card */}
                <Card className="overflow-hidden border-2">
                    <div className="h-2 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500" />
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="flex size-16 items-center justify-center rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20">
                                    <Coins className="size-8 text-purple-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground mb-1">Saldo AI Credit Anda</p>
                                    <div className="flex items-baseline gap-2">
                                        <h2 className="text-5xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                                            {currentCredit.toLocaleString('id-ID')}
                                        </h2>
                                        <span className="text-xl text-muted-foreground">credits</span>
                                    </div>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-sm text-muted-foreground mb-1">Setara dengan</p>
                                <p className="text-2xl font-semibold">
                                    ~{(currentCredit * 10).toLocaleString('id-ID')} pesan AI
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Tabs defaultValue="packages" className="space-y-4">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="packages">
                            <Sparkles className="size-4 mr-2" />
                            Paket Credit
                        </TabsTrigger>
                        <TabsTrigger value="history">
                            <History className="size-4 mr-2" />
                            Riwayat
                        </TabsTrigger>
                    </TabsList>

                    {/* Packages Tab */}
                    <TabsContent value="packages" className="space-y-6">
                        {/* Credit Packages */}
                        <form onSubmit={handlePurchase}>
                            <Card>
                                <CardHeader>
                                    <CardTitle>Pilih Paket AI Credit</CardTitle>
                                    <CardDescription>
                                        Dapatkan bonus credit untuk pembelian paket tertentu
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <RadioGroup
                                        value={data.package_id}
                                        onValueChange={(value) => setData('package_id', value)}
                                    >
                                        <div className="grid gap-4 md:grid-cols-2">
                                            {creditPackages.map((pkg) => (
                                                <div key={pkg.id} className="relative">
                                                    {pkg.popular && (
                                                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
                                                            <Badge className="bg-gradient-to-r from-purple-600 to-pink-600 gap-1">
                                                                <Star className="size-3 fill-current" />
                                                                Paling Populer
                                                            </Badge>
                                                        </div>
                                                    )}
                                                    <Label
                                                        htmlFor={`pkg-${pkg.id}`}
                                                        className={`flex flex-col cursor-pointer rounded-lg border-2 p-6 transition-all ${
                                                            data.package_id === pkg.id.toString()
                                                                ? 'border-primary bg-primary/5'
                                                                : pkg.popular
                                                                ? 'border-purple-200 hover:border-purple-300'
                                                                : 'hover:border-gray-300'
                                                        }`}
                                                    >
                                                        <div className="flex items-start justify-between mb-4">
                                                            <div>
                                                                <h3 className="font-bold text-xl mb-1">{pkg.name}</h3>
                                                                <div className="flex items-baseline gap-1">
                                                                    <span className="text-3xl font-bold">{pkg.credits.toLocaleString('id-ID')}</span>
                                                                    <span className="text-muted-foreground">credits</span>
                                                                </div>
                                                            </div>
                                                            <RadioGroupItem
                                                                value={pkg.id.toString()}
                                                                id={`pkg-${pkg.id}`}
                                                                className="mt-1"
                                                            />
                                                        </div>

                                                        {pkg.bonus > 0 && (
                                                            <div className="mb-4">
                                                                <Badge variant="secondary" className="bg-green-100 text-green-700">
                                                                    +{pkg.bonus} Bonus Credits
                                                                </Badge>
                                                            </div>
                                                        )}

                                                        <div className="space-y-2 mb-4">
                                                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                                <Check className="size-4 text-green-600" />
                                                                <span>Total {(pkg.credits + pkg.bonus).toLocaleString('id-ID')} credits</span>
                                                            </div>
                                                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                                <Check className="size-4 text-green-600" />
                                                                <span>~{((pkg.credits + pkg.bonus) * 10).toLocaleString('id-ID')} pesan AI</span>
                                                            </div>
                                                        </div>

                                                        <div className="pt-4 border-t">
                                                            <div className="flex items-baseline gap-1">
                                                                <span className="text-2xl font-bold">{formatCurrency(pkg.price)}</span>
                                                            </div>
                                                            <p className="text-sm text-muted-foreground">
                                                                {formatCurrency(pkg.price / (pkg.credits + pkg.bonus))} per credit
                                                            </p>
                                                        </div>
                                                    </Label>
                                                </div>
                                            ))}
                                        </div>
                                    </RadioGroup>

                                    {/* Payment Method */}
                                    {selectedPackage && (
                                        <div className="space-y-4 pt-6 border-t">
                                            <div>
                                                <Label className="text-base font-semibold mb-3 block">
                                                    Metode Pembayaran
                                                </Label>
                                                <RadioGroup
                                                    value={data.payment_method}
                                                    onValueChange={(value) => setData('payment_method', value)}
                                                >
                                                    <div className="space-y-2">
                                                        <Label
                                                            htmlFor="bank_transfer"
                                                            className={`flex items-center gap-3 cursor-pointer rounded-lg border p-4 ${
                                                                data.payment_method === 'bank_transfer'
                                                                    ? 'border-primary bg-primary/5'
                                                                    : 'hover:border-gray-300'
                                                            }`}
                                                        >
                                                            <RadioGroupItem value="bank_transfer" id="bank_transfer" />
                                                            <CreditCard className="size-5 text-muted-foreground" />
                                                            <span className="font-medium">Transfer Bank</span>
                                                        </Label>

                                                        <Label
                                                            htmlFor="e-wallet"
                                                            className={`flex items-center gap-3 cursor-pointer rounded-lg border p-4 ${
                                                                data.payment_method === 'e-wallet'
                                                                    ? 'border-primary bg-primary/5'
                                                                    : 'hover:border-gray-300'
                                                            }`}
                                                        >
                                                            <RadioGroupItem value="e-wallet" id="e-wallet" />
                                                            <span className="text-2xl">📱</span>
                                                            <span className="font-medium">E-Wallet (GoPay, OVO, DANA)</span>
                                                        </Label>

                                                        <Label
                                                            htmlFor="credit_card"
                                                            className={`flex items-center gap-3 cursor-pointer rounded-lg border p-4 ${
                                                                data.payment_method === 'credit_card'
                                                                    ? 'border-primary bg-primary/5'
                                                                    : 'hover:border-gray-300'
                                                            }`}
                                                        >
                                                            <RadioGroupItem value="credit_card" id="credit_card" />
                                                            <CreditCard className="size-5 text-muted-foreground" />
                                                            <span className="font-medium">Kartu Kredit/Debit</span>
                                                        </Label>
                                                    </div>
                                                </RadioGroup>
                                            </div>

                                            {/* Summary */}
                                            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-muted-foreground">Paket</span>
                                                    <span className="font-medium">{selectedPackage.name}</span>
                                                </div>
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-muted-foreground">Credits</span>
                                                    <span className="font-medium">{selectedPackage.credits.toLocaleString('id-ID')}</span>
                                                </div>
                                                {selectedPackage.bonus > 0 && (
                                                    <div className="flex justify-between text-sm">
                                                        <span className="text-muted-foreground">Bonus</span>
                                                        <span className="font-medium text-green-600">+{selectedPackage.bonus.toLocaleString('id-ID')}</span>
                                                    </div>
                                                )}
                                                <div className="flex justify-between text-sm pt-2 border-t">
                                                    <span className="text-muted-foreground">Total Credits</span>
                                                    <span className="font-bold">{(selectedPackage.credits + selectedPackage.bonus).toLocaleString('id-ID')}</span>
                                                </div>
                                                <div className="flex justify-between pt-2 border-t">
                                                    <span className="font-semibold">Total Bayar</span>
                                                    <span className="text-xl font-bold text-primary">
                                                        {formatCurrency(selectedPackage.price)}
                                                    </span>
                                                </div>
                                            </div>

                                            <Button
                                                type="submit"
                                                size="lg"
                                                className="w-full gap-2"
                                                disabled={processing}
                                            >
                                                <Coins className="size-5" />
                                                {processing ? 'Memproses...' : 'Beli Sekarang'}
                                                <ArrowRight className="size-5" />
                                            </Button>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </form>
                    </TabsContent>

                    {/* History Tab */}
                    <TabsContent value="history" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Riwayat Penggunaan</CardTitle>
                                <CardDescription>
                                    Riwayat pembelian dan penggunaan AI Credit
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {usageHistory.length > 0 ? (
                                    <div className="space-y-3">
                                        {usageHistory.map((item, index) => (
                                            <div
                                                key={index}
                                                className="flex items-center justify-between rounded-lg border p-4"
                                            >
                                                <div className="flex items-center gap-4">
                                                    <div className={`flex size-10 items-center justify-center rounded-lg ${
                                                        item.type === 'purchase'
                                                            ? 'bg-green-500/10'
                                                            : 'bg-blue-500/10'
                                                    }`}>
                                                        {item.type === 'purchase' ? (
                                                            <TrendingUp className="size-5 text-green-600" />
                                                        ) : (
                                                            <Sparkles className="size-5 text-blue-600" />
                                                        )}
                                                    </div>
                                                    <div>
                                                        <p className="font-medium">{item.description}</p>
                                                        <p className="text-sm text-muted-foreground">
                                                            {formatDate(item.date)}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className={`text-lg font-semibold ${
                                                        item.type === 'purchase' ? 'text-green-600' : 'text-blue-600'
                                                    }`}>
                                                        {item.type === 'purchase' ? '+' : ''}{item.credits} credits
                                                    </p>
                                                    <p className="text-sm text-muted-foreground">
                                                        Saldo: {item.balance}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-16">
                                        <div className="rounded-full bg-muted p-6 mb-4">
                                            <History className="size-12 text-muted-foreground" />
                                        </div>
                                        <p className="text-base font-medium mb-2">Belum ada riwayat</p>
                                        <p className="text-sm text-muted-foreground text-center max-w-md">
                                            Riwayat pembelian dan penggunaan AI Credit akan muncul di sini
                                        </p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </UserLayout>
    );
}
