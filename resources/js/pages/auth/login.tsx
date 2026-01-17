import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import AuthLayout from '@/layouts/auth-layout';
import { register } from '@/routes';
import { store } from '@/routes/login';
import { request } from '@/routes/password';
import { Form, Head } from '@inertiajs/react';
import { ArrowRight, Eye, EyeOff, Lock, LogIn, Mail } from 'lucide-react';
import { useRef, useState } from 'react';
import ReCAPTCHA from 'react-google-recaptcha';

interface LoginProps {
    status?: string;
    canResetPassword: boolean;
    canRegister: boolean;
}

export default function Login({
    status,
    canResetPassword,
    canRegister,
}: LoginProps) {
    const [showPassword, setShowPassword] = useState(false);
    const recaptchaRef = useRef<ReCAPTCHA>(null);

    return (
        <AuthLayout
            title="Selamat Datang"
            description="Masuk ke akun Anda untuk melanjutkan"
        >
            <Head title="Log in" />

            {status && (
                <div className="mb-6 rounded-xl border border-green-200 bg-green-50 px-4 py-3.5 text-sm font-medium text-green-700 shadow-sm">
                    {status}
                </div>
            )}

            <Form
                {...store.form()}
                resetOnSuccess={['password']}
                className="space-y-6"
            >
                {({ processing, errors }) => (
                    <>
                        {/* Email Field */}
                        <div className="space-y-2">
                            <Label
                                htmlFor="email"
                                className="text-sm font-semibold text-foreground"
                            >
                                Alamat Email
                            </Label>
                            <div className="group relative">
                                <Mail className="absolute top-1/2 left-3.5 size-[18px] -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-primary" />
                                <Input
                                    id="email"
                                    type="email"
                                    name="email"
                                    required
                                    autoFocus
                                    tabIndex={1}
                                    autoComplete="email"
                                    placeholder="nama@email.com"
                                    className="h-12 pl-11 text-base transition-all focus:ring-2 focus:ring-primary/20"
                                />
                            </div>
                            <InputError message={errors.email} />
                        </div>

                        {/* Password Field */}
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label
                                    htmlFor="password"
                                    className="text-sm font-semibold text-foreground"
                                >
                                    Password
                                </Label>
                                {canResetPassword && (
                                    <TextLink
                                        href={request()}
                                        className="text-xs font-semibold text-primary transition-colors hover:text-primary/80"
                                        tabIndex={5}
                                    >
                                        Lupa password?
                                    </TextLink>
                                )}
                            </div>
                            <div className="group relative">
                                <Lock className="absolute top-1/2 left-3.5 size-[18px] -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-primary" />
                                <Input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    name="password"
                                    required
                                    tabIndex={2}
                                    autoComplete="current-password"
                                    placeholder="Masukkan password Anda"
                                    className="h-12 pr-11 pl-11 text-base transition-all focus:ring-2 focus:ring-primary/20"
                                />
                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowPassword(!showPassword)
                                    }
                                    className="absolute top-1/2 right-3.5 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                                    tabIndex={-1}
                                >
                                    {showPassword ? (
                                        <EyeOff className="size-[18px]" />
                                    ) : (
                                        <Eye className="size-[18px]" />
                                    )}
                                </button>
                            </div>
                            <InputError message={errors.password} />
                        </div>

                        {/* Remember Me */}
                        <div className="flex items-center space-x-2.5">
                            <Checkbox
                                id="remember"
                                name="remember"
                                tabIndex={3}
                                className="transition-all"
                            />
                            <Label
                                htmlFor="remember"
                                className="cursor-pointer text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                            >
                                Ingat saya
                            </Label>
                        </div>

                        {/* reCAPTCHA */}
                        <div className="space-y-2">
                            <ReCAPTCHA
                                ref={recaptchaRef}
                                sitekey="6LekAgQsAAAAACd1Pjpmr4gsjaH9lYKNgMOQhmxF"
                                name="g-recaptcha-response"
                            />
                            <InputError
                                message={errors['g-recaptcha-response']}
                            />
                        </div>

                        {/* Submit Button */}
                        <Button
                            type="submit"
                            className="h-12 w-full text-base font-semibold shadow-lg shadow-primary/25 transition-all hover:shadow-xl hover:shadow-primary/30"
                            size="lg"
                            tabIndex={4}
                            disabled={processing}
                            data-test="login-button"
                        >
                            {processing ? (
                                <>
                                    <Spinner className="size-5" />
                                    <span>Memproses...</span>
                                </>
                            ) : (
                                <>
                                    <LogIn className="size-5" />
                                    <span>Masuk ke Dashboard</span>
                                    <ArrowRight className="ml-auto size-5" />
                                </>
                            )}
                        </Button>

                        {/* Divider */}
                        {canRegister && (
                            <div className="relative">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-border"></div>
                                </div>
                                <div className="relative flex justify-center text-xs">
                                    <span className="bg-background px-4 font-medium text-muted-foreground">
                                        Atau
                                    </span>
                                </div>
                            </div>
                        )}

                        {/* Register Link */}
                        {canRegister && (
                            <div className="text-center">
                                <p className="text-sm text-muted-foreground">
                                    Belum punya akun?{' '}
                                    <TextLink
                                        href={register()}
                                        tabIndex={6}
                                        className="inline-flex items-center gap-1 font-semibold text-primary transition-colors hover:text-primary/80"
                                    >
                                        Daftar sekarang
                                        <ArrowRight className="size-3.5" />
                                    </TextLink>
                                </p>
                            </div>
                        )}
                    </>
                )}
            </Form>
        </AuthLayout>
    );
}
