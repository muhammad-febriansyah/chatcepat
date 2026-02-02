import { login } from '@/routes';
import { store } from '@/routes/register';
import { Form, Head, Link, usePage } from '@inertiajs/react';

import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { PricingPackage } from '@/types/pricing-package';
import { User, Mail, Phone, Building2, Tag, MapPin, Lock, Eye, EyeOff, ArrowRight, CheckCircle2, MessageSquare, Crown } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import ReCAPTCHA from 'react-google-recaptcha';
import { home } from '@/routes';
import { startCsrfAutoRefresh, stopCsrfAutoRefresh } from '@/utils/csrf-refresh';
import { Toaster } from 'sonner';

interface BusinessCategory {
    id: string;
    name: string;
}

interface AuthBranding {
    logo: string | null;
    logo_name: string;
    tagline: string;
}

interface RegisterProps {
    businessCategories: BusinessCategory[];
    pricingPackages: PricingPackage[];
    authBranding: AuthBranding;
}

export default function Register() {
    const { businessCategories, pricingPackages, authBranding } = usePage<RegisterProps>().props;
    const [showPassword, setShowPassword] = useState(false);
    const [showPasswordConfirmation, setShowPasswordConfirmation] = useState(false);
    const [selectedPackage, setSelectedPackage] = useState<string>('');
    const [currentStep, setCurrentStep] = useState(1);
    const [agreedToTerms, setAgreedToTerms] = useState(false);
    const recaptchaRef = useRef<ReCAPTCHA>(null);

    // Auto-refresh CSRF token to prevent 419 errors
    useEffect(() => {
        startCsrfAutoRefresh(10);
        return () => stopCsrfAutoRefresh();
    }, []);

    return (
        <>
            <Head title="Register" />
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4">
                <div className="w-full max-w-6xl">
                    {/* Logo & Header */}
                    <div className="text-center mb-8">
                        <Link href={home()} className="inline-flex items-center justify-center mb-6">
                            {authBranding?.logo ? (
                                <img
                                    src={authBranding.logo}
                                    alt={authBranding.logo_name}
                                    className="h-16 w-auto object-contain"
                                />
                            ) : (
                                <div className="flex items-center gap-3">
                                    <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary">
                                        <MessageSquare className="h-7 w-7 text-white" />
                                    </div>
                                    <span className="text-3xl font-bold text-gray-900">
                                        {authBranding?.logo_name || 'ChatCepat'}
                                    </span>
                                </div>
                            )}
                        </Link>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">Buat Akun Baru</h1>
                        <p className="text-gray-600">
                            Daftar sekarang dan mulai perjalanan Anda bersama kami
                        </p>
                    </div>

                    {/* Main Form Card */}
                    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
                        {/* Step Indicator */}
                        <div className="border-b border-gray-200 px-8 pt-8 pb-6">
                            <div className="flex items-center justify-center gap-4">
                                <div className="flex items-center gap-2">
                                    <div className={`flex h-10 w-10 items-center justify-center rounded-full border-2 ${
                                        currentStep === 1 ? 'border-primary bg-primary text-white' : 'border-green-500 bg-green-500 text-white'
                                    }`}>
                                        {currentStep > 1 ? <CheckCircle2 className="h-5 w-5" /> : <span className="font-semibold">1</span>}
                                    </div>
                                    <span className={`text-sm font-medium ${currentStep === 1 ? 'text-gray-900' : 'text-gray-500'}`}>
                                        Informasi Diri
                                    </span>
                                </div>
                                <div className={`h-0.5 w-16 ${currentStep === 2 ? 'bg-primary' : 'bg-gray-200'}`} />
                                <div className="flex items-center gap-2">
                                    <div className={`flex h-10 w-10 items-center justify-center rounded-full border-2 ${
                                        currentStep === 2 ? 'border-primary bg-primary text-white' : 'border-gray-300 bg-white text-gray-400'
                                    }`}>
                                        <span className="font-semibold">2</span>
                                    </div>
                                    <span className={`text-sm font-medium ${currentStep === 2 ? 'text-gray-900' : 'text-gray-500'}`}>
                                        Paket
                                    </span>
                                </div>
                            </div>
                        </div>

                        <Form {...store.form()} resetOnSuccess={['password', 'password_confirmation']}>
                            {({ processing, errors }) => (
                                <div className="p-8 lg:p-10">
                                    {/* Step 1: Profile - Use CSS to hide instead of removing from DOM */}
                                    <div className={currentStep === 1 ? 'block' : 'hidden'}>
                                        <div className="space-y-6">
                                            <div className="grid sm:grid-cols-2 gap-4">
                                                {/* Name */}
                                                <div className="space-y-2">
                                                    <Label htmlFor="name">
                                                        Nama Lengkap <span className="text-red-500">*</span>
                                                    </Label>
                                                    <div className="relative">
                                                        <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                                                        <Input
                                                            id="name"
                                                            name="name"
                                                            type="text"
                                                            required
                                                            autoFocus
                                                            placeholder="Masukan nama lengkap"
                                                            className="pl-10 h-11"
                                                        />
                                                    </div>
                                                    <InputError message={errors.name} />
                                                </div>

                                                {/* Email */}
                                                <div className="space-y-2">
                                                    <Label htmlFor="email">
                                                        Email <span className="text-red-500">*</span>
                                                    </Label>
                                                    <div className="relative">
                                                        <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                                                        <Input
                                                            id="email"
                                                            name="email"
                                                            type="email"
                                                            required
                                                            placeholder="Masukan alamat email"
                                                            className="pl-10 h-11"
                                                        />
                                                    </div>
                                                    <InputError message={errors.email} />
                                                </div>

                                                {/* Phone */}
                                                <div className="space-y-2">
                                                    <Label htmlFor="phone">No. Telepon</Label>
                                                    <div className="relative">
                                                        <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                                                        <Input
                                                            id="phone"
                                                            name="phone"
                                                            type="tel"
                                                            placeholder="Masukan nomor telepon"
                                                            className="pl-10 h-11"
                                                        />
                                                    </div>
                                                    <InputError message={errors.phone} />
                                                </div>

                                                {/* Address */}
                                                <div className="space-y-2">
                                                    <Label htmlFor="address">Alamat</Label>
                                                    <div className="relative">
                                                        <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                                                        <Input
                                                            id="address"
                                                            name="address"
                                                            type="text"
                                                            placeholder="Masukan alamat lengkap"
                                                            className="pl-10 h-11"
                                                        />
                                                    </div>
                                                    <InputError message={errors.address} />
                                                </div>

                                                {/* Business Name */}
                                                <div className="space-y-2">
                                                    <Label htmlFor="nama_bisnis">Nama Bisnis</Label>
                                                    <div className="relative">
                                                        <Building2 className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                                                        <Input
                                                            id="nama_bisnis"
                                                            name="nama_bisnis"
                                                            type="text"
                                                            placeholder="Masukan nama bisnis"
                                                            className="pl-10 h-11"
                                                        />
                                                    </div>
                                                    <InputError message={errors.nama_bisnis} />
                                                </div>

                                                {/* Business Category */}
                                                <div className="space-y-2">
                                                    <Label htmlFor="kategori_bisnis">Kategori Bisnis</Label>
                                                    <div className="relative">
                                                        <Tag className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 z-10 pointer-events-none" />
                                                        <Select name="kategori_bisnis">
                                                            <SelectTrigger className="pl-10 h-11">
                                                                <SelectValue placeholder="Pilih kategori bisnis" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {businessCategories.map((category) => (
                                                                    <SelectItem key={category.id} value={category.id}>
                                                                        {category.name}
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                    <InputError message={errors.kategori_bisnis} />
                                                </div>

                                                {/* Password */}
                                                <div className="space-y-2">
                                                    <Label htmlFor="password">
                                                        Password <span className="text-red-500">*</span>
                                                    </Label>
                                                    <div className="relative">
                                                        <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                                                        <Input
                                                            id="password"
                                                            name="password"
                                                            type={showPassword ? 'text' : 'password'}
                                                            required
                                                            placeholder="Masukan password (min. 8 karakter)"
                                                            className="pl-10 pr-10 h-11"
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={() => setShowPassword(!showPassword)}
                                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                                        >
                                                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                                        </button>
                                                    </div>
                                                    <InputError message={errors.password} />
                                                </div>

                                                {/* Confirm Password */}
                                                <div className="space-y-2">
                                                    <Label htmlFor="password_confirmation">
                                                        Konfirmasi Password <span className="text-red-500">*</span>
                                                    </Label>
                                                    <div className="relative">
                                                        <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                                                        <Input
                                                            id="password_confirmation"
                                                            name="password_confirmation"
                                                            type={showPasswordConfirmation ? 'text' : 'password'}
                                                            required
                                                            placeholder="Masukan konfirmasi password"
                                                            className="pl-10 pr-10 h-11"
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={() => setShowPasswordConfirmation(!showPasswordConfirmation)}
                                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                                        >
                                                            {showPasswordConfirmation ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                                        </button>
                                                    </div>
                                                    <InputError message={errors.password_confirmation} />
                                                </div>
                                            </div>

                                            {/* Navigation Button */}
                                            <div className="flex justify-end">
                                                <Button
                                                    type="button"
                                                    onClick={() => setCurrentStep(2)}
                                                    size="lg"
                                                    className="px-8"
                                                >
                                                    Selanjutnya
                                                    <ArrowRight className="ml-2 h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Step 2: Pricing - Use CSS to hide instead of removing from DOM */}
                                    <div className={currentStep === 2 ? 'block' : 'hidden'}>
                                        <div className="space-y-6">
                                            <div>
                                                <h3 className="font-semibold text-lg mb-1">Pilih Paket</h3>
                                                <p className="text-sm text-gray-500">Pilih paket langganan Anda</p>
                                            </div>

                                            {/* Hidden input for form submission */}
                                            <input type="hidden" name="pricing_package_id" value={selectedPackage} />

                                            <div className="grid gap-3 max-h-[400px] overflow-y-auto pr-2">
                                                <RadioGroup
                                                    value={selectedPackage}
                                                    onValueChange={setSelectedPackage}
                                                    className="space-y-3"
                                                >
                                                    {pricingPackages.map((pkg) => (
                                                        <label
                                                            key={pkg.id}
                                                            htmlFor={`package-${pkg.id}`}
                                                            className={`relative flex cursor-pointer rounded-lg border-2 p-4 transition-all ${
                                                                selectedPackage === String(pkg.id)
                                                                    ? 'border-primary bg-primary/5'
                                                                    : 'border-gray-200 hover:border-gray-300'
                                                            }`}
                                                        >
                                                            {pkg.is_featured && (
                                                                <Badge className="absolute -top-2 -right-2 text-xs">
                                                                    <Crown className="h-3 w-3 mr-1" />
                                                                    Popular
                                                                </Badge>
                                                            )}
                                                            <RadioGroupItem
                                                                value={String(pkg.id)}
                                                                id={`package-${pkg.id}`}
                                                                className="mt-1"
                                                            />
                                                            <div className="ml-3 flex-1">
                                                                <div className="flex items-baseline justify-between mb-1">
                                                                    <h4 className="font-semibold text-sm">{pkg.name}</h4>
                                                                    <div className="text-right">
                                                                        <p className="text-lg font-bold text-primary">{pkg.formatted_price}</p>
                                                                        <p className="text-xs text-gray-500">/{pkg.period_text}</p>
                                                                    </div>
                                                                </div>
                                                                {pkg.description && (
                                                                    <p className="text-xs text-gray-500 mb-2 line-clamp-2">{pkg.description}</p>
                                                                )}
                                                                {pkg.features && pkg.features.length > 0 && (
                                                                    <ul className="space-y-1">
                                                                        {pkg.features.slice(0, 3).map((feature, idx) => (
                                                                            <li key={idx} className="flex items-start gap-1.5 text-xs text-gray-600">
                                                                                <CheckCircle2 className="h-3 w-3 text-primary mt-0.5 flex-shrink-0" />
                                                                                <span>{feature}</span>
                                                                            </li>
                                                                        ))}
                                                                        {pkg.features.length > 3 && (
                                                                            <li className="text-xs text-gray-500 pl-5">+{pkg.features.length - 3} lainnya</li>
                                                                        )}
                                                                    </ul>
                                                                )}
                                                            </div>
                                                        </label>
                                                    ))}
                                                </RadioGroup>
                                            </div>
                                            <InputError message={errors.pricing_package_id} />

                                            {/* reCAPTCHA */}
                                            <div className="flex justify-start pt-2">
                                                <ReCAPTCHA
                                                    ref={recaptchaRef}
                                                    sitekey="6LekAgQsAAAAACd1Pjpmr4gsjaH9lYKNgMOQhmxF"
                                                    name="g-recaptcha-response"
                                                />
                                            </div>
                                            <InputError message={errors['g-recaptcha-response']} />

                                            {/* Kebijakan Privasi Checkbox */}
                                            <div className="flex items-start gap-2">
                                                <Checkbox
                                                    id="terms"
                                                    checked={agreedToTerms}
                                                    onCheckedChange={(checked) => setAgreedToTerms(checked as boolean)}
                                                    className="mt-0.5"
                                                />
                                                <label
                                                    htmlFor="terms"
                                                    className="text-sm text-gray-600 leading-relaxed cursor-pointer"
                                                >
                                                    Saya setuju dengan{' '}
                                                    <TextLink href="/privacy" target="_blank" className="text-primary hover:underline font-medium">
                                                        Kebijakan Privasi
                                                    </TextLink>
                                                    {' '}dan{' '}
                                                    <TextLink href="/terms" target="_blank" className="text-primary hover:underline font-medium">
                                                        Syarat & Ketentuan
                                                    </TextLink>
                                                </label>
                                            </div>

                                            {/* Navigation Buttons */}
                                            <div className="flex gap-3">
                                                <Button
                                                    type="button"
                                                    onClick={() => setCurrentStep(1)}
                                                    variant="outline"
                                                    size="lg"
                                                >
                                                    Kembali
                                                </Button>
                                                <Button
                                                    type="submit"
                                                    size="lg"
                                                    disabled={processing || !selectedPackage || !agreedToTerms}
                                                >
                                                    {processing ? (
                                                        <>
                                                            <Spinner className="h-4 w-4" />
                                                            <span>Memproses...</span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            Daftar Sekarang
                                                            <ArrowRight className="ml-2 h-4 w-4" />
                                                        </>
                                                    )}
                                                </Button>
                                            </div>

                                            <p className="text-xs text-center text-gray-500">
                                                Setelah daftar, Anda akan diarahkan ke halaman pembayaran
                                            </p>

                                            {/* Display all errors */}
                                            {Object.keys(errors).length > 0 && (
                                                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mt-4">
                                                    <p className="font-semibold text-red-800 mb-2">Terjadi kesalahan:</p>
                                                    <ul className="list-disc list-inside text-red-700 text-sm space-y-1">
                                                        {Object.entries(errors).map(([key, value]) => (
                                                            <li key={key}>{value}</li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </Form>
                    </div>

                    {/* Footer */}
                    <div className="text-center mt-6 text-sm text-gray-600">
                        Sudah punya akun?{' '}
                        <TextLink href={login()} className="text-primary hover:underline font-medium">
                            Masuk di sini
                        </TextLink>
                    </div>
                </div>
            </div>
            <Toaster richColors position="top-right" />
        </>
    );
}
