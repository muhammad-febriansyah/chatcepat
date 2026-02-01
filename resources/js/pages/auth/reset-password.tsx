import { update } from '@/routes/password';
import { Form, Head } from '@inertiajs/react';

import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import AuthLayout from '@/layouts/auth-layout';
import { ArrowRight, Lock, Mail } from 'lucide-react';

interface ResetPasswordProps {
    token: string;
    email: string;
}

export default function ResetPassword({ token, email }: ResetPasswordProps) {
    return (
        <AuthLayout
            title="Reset Password"
            description="Silakan masukkan password baru Anda di bawah ini"
        >
            <Head title="Reset Password" />

            <Form
                {...update.form()}
                transform={(data) => ({ ...data, token, email })}
                resetOnSuccess={['password', 'password_confirmation']}
                className="space-y-6"
            >
                {({ processing, errors }) => (
                    <>
                        {/* Email Field (Read Only) */}
                        <div className="space-y-2">
                            <Label
                                htmlFor="email"
                                className="text-sm font-semibold text-foreground"
                            >
                                Alamat Email
                            </Label>
                            <div className="group relative">
                                <Mail className="absolute top-1/2 left-3.5 size-[18px] -translate-y-1/2 text-muted-foreground/50" />
                                <Input
                                    id="email"
                                    type="email"
                                    name="email"
                                    value={email}
                                    readOnly
                                    className="h-12 pl-11 text-base bg-muted/50 cursor-not-allowed border-dashed"
                                />
                            </div>
                            <InputError message={errors.email} />
                        </div>

                        {/* Password Field */}
                        <div className="space-y-2">
                            <Label
                                htmlFor="password"
                                className="text-sm font-semibold text-foreground"
                            >
                                Password Baru
                            </Label>
                            <div className="group relative">
                                <Lock className="absolute top-1/2 left-3.5 size-[18px] -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-primary" />
                                <Input
                                    id="password"
                                    type="password"
                                    name="password"
                                    required
                                    autoFocus
                                    placeholder="Masukkan password baru"
                                    className="h-12 pl-11 text-base transition-all focus:ring-2 focus:ring-primary/20"
                                />
                            </div>
                            <InputError message={errors.password} />
                        </div>

                        {/* Confirm Password Field */}
                        <div className="space-y-2">
                            <Label
                                htmlFor="password_confirmation"
                                className="text-sm font-semibold text-foreground"
                            >
                                Konfirmasi Password Baru
                            </Label>
                            <div className="group relative">
                                <Lock className="absolute top-1/2 left-3.5 size-[18px] -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-primary" />
                                <Input
                                    id="password_confirmation"
                                    type="password"
                                    name="password_confirmation"
                                    required
                                    placeholder="Ulangi password baru"
                                    className="h-12 pl-11 text-base transition-all focus:ring-2 focus:ring-primary/20"
                                />
                            </div>
                            <InputError message={errors.password_confirmation} />
                        </div>

                        {/* Submit Button */}
                        <Button
                            type="submit"
                            className="h-12 w-full text-base font-semibold shadow-lg shadow-primary/25 transition-all hover:shadow-xl hover:shadow-primary/30"
                            size="lg"
                            disabled={processing}
                            data-test="reset-password-button"
                        >
                            {processing ? (
                                <>
                                    <Spinner className="size-5" />
                                    <span>Memproses...</span>
                                </>
                            ) : (
                                <>
                                    <span>Reset Password</span>
                                    <ArrowRight className="ml-auto size-5" />
                                </>
                            )}
                        </Button>
                    </>
                )}
            </Form>
        </AuthLayout>
    );
}
