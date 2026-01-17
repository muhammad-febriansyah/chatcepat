import { Head, useForm, router } from '@inertiajs/react';
import UserLayout from '@/layouts/user/user-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CreditCard, Package, User as UserIcon, Mail, Phone, CheckCircle, Building2, Upload, Copy, Check, Loader2 } from 'lucide-react';
import { useState, useRef } from 'react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

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
    formatted_price: string;
    period_text: string;
}

interface PaymentMethod {
    paymentMethod: string;
    paymentName: string;
    paymentImage: string;
    totalFee: number;
}

interface Bank {
    id: number;
    nama_bank: string;
    atasnama: string;
    norek: string;
    gambar: string | null;
    is_active: boolean;
}

interface UserInfo {
    name: string;
    email: string;
    phone: string;
}

interface PaymentProps {
    package: PricingPackage | null;
    paymentMethods: PaymentMethod[];
    banks: Bank[];
    user: UserInfo | null;
}

export default function PaymentIndex({ package: selectedPackage, paymentMethods, banks, user }: PaymentProps) {
    const [selectedMethod, setSelectedMethod] = useState<string>('');
    const [selectedBank, setSelectedBank] = useState<Bank | null>(null);
    const [paymentType, setPaymentType] = useState<string>('gateway');
    const [proofFile, setProofFile] = useState<File | null>(null);
    const [proofPreview, setProofPreview] = useState<string | null>(null);
    const [copiedField, setCopiedField] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Form for Duitku payment - auto-fill from user session
    const gatewayForm = useForm({
        package_id: selectedPackage?.id || '',
        payment_method: '',
        customer_name: user?.name || '',
        email: user?.email || '',
        phone: user?.phone || '',
    });

    // Form for manual payment - auto-fill from user session
    const manualForm = useForm({
        package_id: selectedPackage?.id || '',
        bank_id: '',
        customer_name: user?.name || '',
        email: user?.email || '',
        phone: user?.phone || '',
        proof_image: null as File | null,
    });

    const handleGatewaySubmit = (e: React.FormEvent) => {
        e.preventDefault();

        gatewayForm.post(route('payment.create'), {
            preserveScroll: true,
            onSuccess: (response: any) => {
                const paymentUrl = response.props?.data?.payment_url;
                if (paymentUrl) {
                    window.location.href = paymentUrl;
                }
            },
            onError: (errors) => {
                console.error('Payment creation failed:', errors);
                toast.error('Gagal membuat pembayaran');
            },
        });
    };

    const handleManualSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!proofFile) {
            toast.error('Silakan upload bukti pembayaran');
            return;
        }

        const formData = new FormData();
        formData.append('package_id', String(selectedPackage?.id || ''));
        formData.append('bank_id', manualForm.data.bank_id);
        formData.append('customer_name', manualForm.data.customer_name);
        formData.append('email', manualForm.data.email);
        formData.append('phone', manualForm.data.phone || '');
        formData.append('proof_image', proofFile);

        router.post(route('payment.create-manual'), formData, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Pembayaran berhasil disubmit! Menunggu verifikasi admin.');
                router.visit('/user/transactions');
            },
            onError: (errors) => {
                console.error('Manual payment failed:', errors);
                toast.error('Gagal membuat pembayaran manual');
            },
        });
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                toast.error('Ukuran file maksimal 5MB');
                return;
            }
            setProofFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setProofPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const copyToClipboard = (text: string, field: string) => {
        navigator.clipboard.writeText(text);
        setCopiedField(field);
        toast.success('Berhasil disalin!');
        setTimeout(() => setCopiedField(null), 2000);
    };

    if (!selectedPackage) {
        return (
            <UserLayout>
                <Head title="Pembayaran" />
                <div className="flex flex-col items-center justify-center min-h-[400px]">
                    <Package className="size-16 text-muted-foreground mb-4" />
                    <h2 className="text-2xl font-bold mb-2">Paket tidak ditemukan</h2>
                    <p className="text-muted-foreground mb-6">Silakan pilih paket terlebih dahulu</p>
                    <Button asChild>
                        <a href="/user/topup">Pilih Paket</a>
                    </Button>
                </div>
            </UserLayout>
        );
    }

    return (
        <UserLayout>
            <Head title="Pembayaran" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center gap-2">
                    <CreditCard className="size-8 text-primary" />
                    <h1 className="text-3xl font-bold">Pembayaran</h1>
                </div>

                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Payment Form */}
                    <div className="lg:col-span-2 space-y-6">
                        <Tabs value={paymentType} onValueChange={setPaymentType} className="w-full">
                            <TabsList className="grid w-full grid-cols-2">
                                <TabsTrigger value="gateway" className="flex items-center gap-2">
                                    <CreditCard className="size-4" />
                                    Payment Gateway
                                </TabsTrigger>
                                <TabsTrigger value="manual" className="flex items-center gap-2">
                                    <Building2 className="size-4" />
                                    Transfer Manual
                                </TabsTrigger>
                            </TabsList>

                            {/* Payment Gateway Tab */}
                            <TabsContent value="gateway" className="space-y-6 mt-6">
                                <form onSubmit={handleGatewaySubmit} className="space-y-6">
                                    {/* Customer Information */}
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2">
                                                <UserIcon className="size-5" />
                                                Informasi Pembeli
                                            </CardTitle>
                                            <CardDescription>
                                                Masukkan data Anda untuk proses pembayaran
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="gateway_customer_name">
                                                    Nama Lengkap <span className="text-destructive">*</span>
                                                </Label>
                                                <Input
                                                    id="gateway_customer_name"
                                                    type="text"
                                                    value={gatewayForm.data.customer_name}
                                                    onChange={(e) => gatewayForm.setData('customer_name', e.target.value)}
                                                    placeholder="Masukkan nama lengkap"
                                                    required
                                                />
                                                {gatewayForm.errors.customer_name && (
                                                    <p className="text-sm text-destructive">{gatewayForm.errors.customer_name}</p>
                                                )}
                                            </div>

                                            <div className="grid gap-4 sm:grid-cols-2">
                                                <div className="space-y-2">
                                                    <Label htmlFor="gateway_email">
                                                        Email <span className="text-destructive">*</span>
                                                    </Label>
                                                    <div className="relative">
                                                        <Mail className="absolute left-3 top-3 size-4 text-muted-foreground" />
                                                        <Input
                                                            id="gateway_email"
                                                            type="email"
                                                            value={gatewayForm.data.email}
                                                            onChange={(e) => gatewayForm.setData('email', e.target.value)}
                                                            placeholder="nama@email.com"
                                                            required
                                                            className="pl-10"
                                                        />
                                                    </div>
                                                    {gatewayForm.errors.email && (
                                                        <p className="text-sm text-destructive">{gatewayForm.errors.email}</p>
                                                    )}
                                                </div>

                                                <div className="space-y-2">
                                                    <Label htmlFor="gateway_phone">Nomor Telepon</Label>
                                                    <div className="relative">
                                                        <Phone className="absolute left-3 top-3 size-4 text-muted-foreground" />
                                                        <Input
                                                            id="gateway_phone"
                                                            type="tel"
                                                            value={gatewayForm.data.phone}
                                                            onChange={(e) => gatewayForm.setData('phone', e.target.value)}
                                                            placeholder="08123456789"
                                                            className="pl-10"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>

                                    {/* Payment Method */}
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2">
                                                <CreditCard className="size-5" />
                                                Metode Pembayaran
                                            </CardTitle>
                                            <CardDescription>
                                                Pilih metode pembayaran yang Anda inginkan
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            {paymentMethods.length > 0 ? (
                                                <div className="grid gap-3 sm:grid-cols-2">
                                                    {paymentMethods.map((method) => (
                                                        <div
                                                            key={method.paymentMethod}
                                                            className={cn(
                                                                "relative flex items-center gap-3 rounded-lg border p-4 cursor-pointer transition-all hover:border-primary",
                                                                gatewayForm.data.payment_method === method.paymentMethod
                                                                    ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                                                                    : "border-border"
                                                            )}
                                                            onClick={() => {
                                                                gatewayForm.setData('payment_method', method.paymentMethod);
                                                                setSelectedMethod(method.paymentMethod);
                                                            }}
                                                        >
                                                            <input
                                                                type="radio"
                                                                name="payment_method"
                                                                value={method.paymentMethod}
                                                                checked={gatewayForm.data.payment_method === method.paymentMethod}
                                                                onChange={() => {
                                                                    gatewayForm.setData('payment_method', method.paymentMethod);
                                                                    setSelectedMethod(method.paymentMethod);
                                                                }}
                                                                className="sr-only"
                                                            />
                                                            {method.paymentImage && (
                                                                <img
                                                                    src={method.paymentImage}
                                                                    alt={method.paymentName}
                                                                    className="h-8 w-auto object-contain"
                                                                />
                                                            )}
                                                            <div className="flex-1">
                                                                <p className="font-medium text-sm">{method.paymentName}</p>
                                                                <p className="text-xs text-muted-foreground">
                                                                    Biaya: Rp {method.totalFee.toLocaleString('id-ID')}
                                                                </p>
                                                            </div>
                                                            {gatewayForm.data.payment_method === method.paymentMethod && (
                                                                <CheckCircle className="size-5 text-primary" />
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="text-center py-8">
                                                    <p className="text-sm text-muted-foreground">
                                                        Tidak ada metode pembayaran tersedia.
                                                    </p>
                                                    <p className="text-xs text-muted-foreground mt-1">
                                                        Silakan gunakan Transfer Manual
                                                    </p>
                                                </div>
                                            )}
                                            {gatewayForm.errors.payment_method && (
                                                <p className="text-sm text-destructive mt-2">{gatewayForm.errors.payment_method}</p>
                                            )}
                                        </CardContent>
                                    </Card>

                                    {/* Submit Button */}
                                    <Button
                                        type="submit"
                                        size="lg"
                                        className="w-full"
                                        disabled={gatewayForm.processing || !gatewayForm.data.payment_method}
                                    >
                                        {gatewayForm.processing ? (
                                            <>
                                                <Loader2 className="mr-2 size-5 animate-spin" />
                                                Memproses...
                                            </>
                                        ) : (
                                            <>
                                                <CreditCard className="mr-2 size-5" />
                                                Bayar Sekarang
                                            </>
                                        )}
                                    </Button>
                                </form>
                            </TabsContent>

                            {/* Manual Transfer Tab */}
                            <TabsContent value="manual" className="space-y-6 mt-6">
                                <form onSubmit={handleManualSubmit} className="space-y-6">
                                    {/* Customer Information */}
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2">
                                                <UserIcon className="size-5" />
                                                Informasi Pembeli
                                            </CardTitle>
                                            <CardDescription>
                                                Masukkan data Anda untuk proses pembayaran
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="manual_customer_name">
                                                    Nama Lengkap <span className="text-destructive">*</span>
                                                </Label>
                                                <Input
                                                    id="manual_customer_name"
                                                    type="text"
                                                    value={manualForm.data.customer_name}
                                                    onChange={(e) => manualForm.setData('customer_name', e.target.value)}
                                                    placeholder="Masukkan nama lengkap"
                                                    required
                                                />
                                                {manualForm.errors.customer_name && (
                                                    <p className="text-sm text-destructive">{manualForm.errors.customer_name}</p>
                                                )}
                                            </div>

                                            <div className="grid gap-4 sm:grid-cols-2">
                                                <div className="space-y-2">
                                                    <Label htmlFor="manual_email">
                                                        Email <span className="text-destructive">*</span>
                                                    </Label>
                                                    <div className="relative">
                                                        <Mail className="absolute left-3 top-3 size-4 text-muted-foreground" />
                                                        <Input
                                                            id="manual_email"
                                                            type="email"
                                                            value={manualForm.data.email}
                                                            onChange={(e) => manualForm.setData('email', e.target.value)}
                                                            placeholder="nama@email.com"
                                                            required
                                                            className="pl-10"
                                                        />
                                                    </div>
                                                    {manualForm.errors.email && (
                                                        <p className="text-sm text-destructive">{manualForm.errors.email}</p>
                                                    )}
                                                </div>

                                                <div className="space-y-2">
                                                    <Label htmlFor="manual_phone">Nomor Telepon</Label>
                                                    <div className="relative">
                                                        <Phone className="absolute left-3 top-3 size-4 text-muted-foreground" />
                                                        <Input
                                                            id="manual_phone"
                                                            type="tel"
                                                            value={manualForm.data.phone}
                                                            onChange={(e) => manualForm.setData('phone', e.target.value)}
                                                            placeholder="08123456789"
                                                            className="pl-10"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>

                                    {/* Bank Selection */}
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2">
                                                <Building2 className="size-5" />
                                                Pilih Bank Tujuan
                                            </CardTitle>
                                            <CardDescription>
                                                Transfer ke salah satu rekening bank berikut
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            {banks && banks.length > 0 ? (
                                                <div className="grid gap-3">
                                                    {banks.map((bank) => (
                                                        <div
                                                            key={bank.id}
                                                            className={cn(
                                                                "relative rounded-lg border p-4 cursor-pointer transition-all hover:border-primary",
                                                                selectedBank?.id === bank.id
                                                                    ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                                                                    : "border-border"
                                                            )}
                                                            onClick={() => {
                                                                setSelectedBank(bank);
                                                                manualForm.setData('bank_id', String(bank.id));
                                                            }}
                                                        >
                                                            <input
                                                                type="radio"
                                                                name="bank_id"
                                                                value={bank.id}
                                                                checked={selectedBank?.id === bank.id}
                                                                onChange={() => {
                                                                    setSelectedBank(bank);
                                                                    manualForm.setData('bank_id', String(bank.id));
                                                                }}
                                                                className="sr-only"
                                                            />
                                                            <div className="flex items-start gap-4">
                                                                {bank.gambar && (
                                                                    <img
                                                                        src={`/storage/${bank.gambar}`}
                                                                        alt={bank.nama_bank}
                                                                        className="h-10 w-auto object-contain"
                                                                    />
                                                                )}
                                                                <div className="flex-1 space-y-2">
                                                                    <p className="font-semibold">{bank.nama_bank}</p>
                                                                    <div className="grid gap-2 sm:grid-cols-2">
                                                                        <div>
                                                                            <p className="text-xs text-muted-foreground">No. Rekening</p>
                                                                            <div className="flex items-center gap-2">
                                                                                <p className="font-mono font-medium">{bank.norek}</p>
                                                                                <button
                                                                                    type="button"
                                                                                    onClick={(e) => {
                                                                                        e.stopPropagation();
                                                                                        copyToClipboard(bank.norek, `norek-${bank.id}`);
                                                                                    }}
                                                                                    className="text-muted-foreground hover:text-primary"
                                                                                >
                                                                                    {copiedField === `norek-${bank.id}` ? (
                                                                                        <Check className="size-4 text-green-500" />
                                                                                    ) : (
                                                                                        <Copy className="size-4" />
                                                                                    )}
                                                                                </button>
                                                                            </div>
                                                                        </div>
                                                                        <div>
                                                                            <p className="text-xs text-muted-foreground">Atas Nama</p>
                                                                            <p className="font-medium">{bank.atasnama}</p>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                {selectedBank?.id === bank.id && (
                                                                    <CheckCircle className="size-5 text-primary flex-shrink-0" />
                                                                )}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <p className="text-sm text-muted-foreground text-center py-8">
                                                    Tidak ada bank tersedia untuk transfer manual
                                                </p>
                                            )}
                                            {manualForm.errors.bank_id && (
                                                <p className="text-sm text-destructive mt-2">{manualForm.errors.bank_id}</p>
                                            )}
                                        </CardContent>
                                    </Card>

                                    {/* Upload Proof */}
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2">
                                                <Upload className="size-5" />
                                                Upload Bukti Pembayaran
                                            </CardTitle>
                                            <CardDescription>
                                                Upload screenshot atau foto bukti transfer Anda
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <div
                                                className={cn(
                                                    "border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all hover:border-primary",
                                                    proofPreview ? "border-primary bg-primary/5" : "border-border"
                                                )}
                                                onClick={() => fileInputRef.current?.click()}
                                            >
                                                <input
                                                    ref={fileInputRef}
                                                    type="file"
                                                    accept="image/jpeg,image/png,image/jpg,application/pdf"
                                                    onChange={handleFileChange}
                                                    className="hidden"
                                                />
                                                {proofPreview ? (
                                                    <div className="space-y-3">
                                                        <img
                                                            src={proofPreview}
                                                            alt="Bukti Pembayaran"
                                                            className="max-h-48 mx-auto rounded-lg"
                                                        />
                                                        <p className="text-sm text-muted-foreground">
                                                            Klik untuk mengganti gambar
                                                        </p>
                                                    </div>
                                                ) : (
                                                    <div className="space-y-3">
                                                        <Upload className="size-12 mx-auto text-muted-foreground" />
                                                        <div>
                                                            <p className="font-medium">Klik untuk upload bukti pembayaran</p>
                                                            <p className="text-sm text-muted-foreground">
                                                                Format: JPG, PNG, PDF (Maks. 5MB)
                                                            </p>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                            {manualForm.errors.proof_image && (
                                                <p className="text-sm text-destructive mt-2">{manualForm.errors.proof_image}</p>
                                            )}
                                        </CardContent>
                                    </Card>

                                    {/* Submit Button */}
                                    <Button
                                        type="submit"
                                        size="lg"
                                        className="w-full"
                                        disabled={manualForm.processing || !selectedBank || !proofFile}
                                    >
                                        {manualForm.processing ? (
                                            <>
                                                <Loader2 className="mr-2 size-5 animate-spin" />
                                                Memproses...
                                            </>
                                        ) : (
                                            <>
                                                <Upload className="mr-2 size-5" />
                                                Konfirmasi Pembayaran
                                            </>
                                        )}
                                    </Button>

                                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm">
                                        <p className="font-semibold text-amber-800 mb-2">Penting:</p>
                                        <ul className="list-disc list-inside text-amber-700 space-y-1">
                                            <li>Pastikan nominal transfer sesuai dengan total pembayaran</li>
                                            <li>Pembayaran akan diverifikasi dalam 1x24 jam</li>
                                            <li>Hubungi admin jika pembayaran tidak dikonfirmasi dalam 24 jam</li>
                                        </ul>
                                    </div>
                                </form>
                            </TabsContent>
                        </Tabs>
                    </div>

                    {/* Order Summary */}
                    <div className="lg:col-span-1">
                        <Card className="sticky top-6">
                            <CardHeader>
                                <CardTitle>Ringkasan Pesanan</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <p className="font-semibold">{selectedPackage.name}</p>
                                            <p className="text-sm text-muted-foreground">
                                                {selectedPackage.period_text}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="border-t pt-2">
                                        <p className="text-xs text-muted-foreground mb-2">Fitur yang didapat:</p>
                                        <ul className="space-y-1">
                                            {selectedPackage.features.slice(0, 5).map((feature, index) => (
                                                <li key={index} className="text-xs flex items-start gap-1">
                                                    <CheckCircle className="size-3 text-primary mt-0.5 flex-shrink-0" />
                                                    <span>{feature}</span>
                                                </li>
                                            ))}
                                            {selectedPackage.features.length > 5 && (
                                                <li className="text-xs text-muted-foreground">
                                                    +{selectedPackage.features.length - 5} fitur lainnya
                                                </li>
                                            )}
                                        </ul>
                                    </div>
                                </div>

                                <div className="border-t pt-4 space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span>Subtotal</span>
                                        <span>Rp {Number(selectedPackage.price).toLocaleString('id-ID')}</span>
                                    </div>
                                    {paymentType === 'gateway' && selectedMethod && paymentMethods.find(m => m.paymentMethod === selectedMethod) && (
                                        <div className="flex justify-between text-sm text-muted-foreground">
                                            <span>Biaya Admin</span>
                                            <span>
                                                Rp {(paymentMethods.find(m => m.paymentMethod === selectedMethod)?.totalFee || 0).toLocaleString('id-ID')}
                                            </span>
                                        </div>
                                    )}
                                    <div className="flex justify-between font-bold text-lg border-t pt-2">
                                        <span>Total</span>
                                        <span className="text-primary">
                                            Rp {(
                                                Number(selectedPackage.price) +
                                                (paymentType === 'gateway' ? (paymentMethods.find(m => m.paymentMethod === selectedMethod)?.totalFee || 0) : 0)
                                            ).toLocaleString('id-ID')}
                                        </span>
                                    </div>
                                </div>

                                <div className="bg-muted/50 rounded-lg p-3 text-xs space-y-1">
                                    <p className="font-semibold">Catatan:</p>
                                    <ul className="space-y-1 list-disc list-inside text-muted-foreground">
                                        {paymentType === 'gateway' ? (
                                            <>
                                                <li>Pembayaran aman dengan Duitku</li>
                                                <li>Paket aktif otomatis setelah pembayaran</li>
                                                <li>Invoice dikirim via email</li>
                                            </>
                                        ) : (
                                            <>
                                                <li>Transfer sesuai nominal yang tertera</li>
                                                <li>Verifikasi manual oleh admin</li>
                                                <li>Paket aktif setelah pembayaran diverifikasi</li>
                                            </>
                                        )}
                                    </ul>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </UserLayout>
    );
}
