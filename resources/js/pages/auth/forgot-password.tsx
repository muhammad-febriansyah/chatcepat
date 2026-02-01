import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import AuthLayout from '@/layouts/auth-layout';
import { login } from '@/routes';
import { email } from '@/routes/password';
import { Form, Head } from '@inertiajs/react';
import { ArrowRight, Mail } from 'lucide-react';

export default function ForgotPassword({ status }: { status?: string }) {
    return (
        <AuthLayout
            title="Lupa Password"
            description="Masukkan email Anda untuk menerima link reset password"
        >
            <Head title="Lupa Password" />

            {status && (
                <div className="mb-6 rounded-xl border border-green-200 bg-green-50 px-4 py-3.5 text-sm font-medium text-green-700 shadow-sm">
                    {status}
                </div>
            )}

            <Form {...email.form()} className="space-y-6">
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

                        {/* Submit Button */}
                        <Button
                            type="submit"
                            className="h-12 w-full text-base font-semibold shadow-lg shadow-primary/25 transition-all hover:shadow-xl hover:shadow-primary/30"
                            size="lg"
                            tabIndex={2}
                            disabled={processing}
                            data-test="email-password-reset-link-button"
                        >
                            {processing ? (
                                <>
                                    <Spinner className="size-5" />
                                    <span>Memproses...</span>
                                </>
                            ) : (
                                <>
                                    <span>Kirim Link Reset Password</span>
                                    <ArrowRight className="ml-auto size-5" />
                                </>
                            )}
                        </Button>

                        {/* Divider */}
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

                        {/* Login Link */}
                        <div className="text-center">
                            <p className="text-sm text-muted-foreground">
                                Kembali ke halaman{' '}
                                <TextLink
                                    href={login()}
                                    tabIndex={3}
                                    className="inline-flex items-center gap-1 font-semibold text-primary transition-colors hover:text-primary/80"
                                >
                                    login
                                    <ArrowRight className="size-3.5" />
                                </TextLink>
                            </p>
                        </div>
                    </>
                )}
            </Form>
        </AuthLayout>
    );
}
