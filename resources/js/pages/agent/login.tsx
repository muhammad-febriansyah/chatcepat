import { FormEventHandler, useEffect } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Headset, Lock, Mail } from 'lucide-react';

export default function AgentLogin({ status }: { status?: string }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    useEffect(() => {
        return () => {
            reset('password');
        };
    }, []);

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('agent.login.post'));
    };

    return (
        <>
            <Head title="Agent Login" />

            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4">
                <div className="w-full max-w-md">
                    {/* Logo & Branding */}
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center size-16 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 mb-4">
                            <Headset className="size-8 text-white" />
                        </div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">ChatCepat Agent</h1>
                        <p className="text-gray-600">Portal untuk Customer Service</p>
                    </div>

                    <Card className="border-0 shadow-xl">
                        <CardHeader className="space-y-1 pb-4">
                            <CardTitle className="text-2xl font-bold">Masuk ke Portal Agent</CardTitle>
                            <CardDescription>
                                Masukkan email dan password Anda untuk melanjutkan
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {status && (
                                <Alert className="mb-4">
                                    <AlertDescription>{status}</AlertDescription>
                                </Alert>
                            )}

                            {errors.email && (
                                <Alert variant="destructive" className="mb-4">
                                    <AlertDescription>{errors.email}</AlertDescription>
                                </Alert>
                            )}

                            <form onSubmit={submit} className="space-y-4">
                                {/* Email Field */}
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email</Label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
                                        <Input
                                            id="email"
                                            type="email"
                                            name="email"
                                            value={data.email}
                                            className="pl-10"
                                            autoComplete="username"
                                            placeholder="agent@example.com"
                                            onChange={(e) => setData('email', e.target.value)}
                                            required
                                            autoFocus
                                        />
                                    </div>
                                </div>

                                {/* Password Field */}
                                <div className="space-y-2">
                                    <Label htmlFor="password">Password</Label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
                                        <Input
                                            id="password"
                                            type="password"
                                            name="password"
                                            value={data.password}
                                            className="pl-10"
                                            autoComplete="current-password"
                                            placeholder="••••••••"
                                            onChange={(e) => setData('password', e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>

                                {/* Remember Me */}
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="remember"
                                        checked={data.remember}
                                        onCheckedChange={(checked) => setData('remember', checked as boolean)}
                                    />
                                    <label
                                        htmlFor="remember"
                                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                                    >
                                        Ingat saya
                                    </label>
                                </div>

                                {/* Submit Button */}
                                <Button
                                    type="submit"
                                    className="w-full h-11 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                                    disabled={processing}
                                >
                                    {processing ? 'Memproses...' : 'Masuk'}
                                </Button>
                            </form>

                            {/* Footer */}
                            <div className="mt-6 text-center text-sm text-gray-600">
                                <p>
                                    Bukan agent?{' '}
                                    <Link
                                        href="/login"
                                        className="font-semibold text-blue-600 hover:text-blue-700"
                                    >
                                        Masuk sebagai User
                                    </Link>
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Help Text */}
                    <div className="mt-6 text-center text-sm text-gray-600">
                        <p>
                            Lupa password atau ada masalah?{' '}
                            <span className="font-semibold">Hubungi administrator Anda</span>
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
}
