import { Head, useForm } from '@inertiajs/react';
import UserLayout from '@/layouts/user/user-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Smartphone, CheckCircle2, AlertCircle, LogOut } from 'lucide-react';
import { useState } from 'react';

interface Props {
    session: any;
    hasActiveSession: boolean;
}

export default function TelegramSessionSetup({ session, hasActiveSession }: Props) {
    const [step, setStep] = useState(hasActiveSession ? 'connected' : 'phone');

    const phoneForm = useForm({
        phone: '',
    });

    const codeForm = useForm({
        code: '',
        password: '',
    });

    const handleSendCode = (e: React.FormEvent) => {
        e.preventDefault();
        phoneForm.post('/user/telegram/session/send-code', {
            onSuccess: () => setStep('verify'),
        });
    };

    const handleVerifyCode = (e: React.FormEvent) => {
        e.preventDefault();
        codeForm.post('/user/telegram/session/verify-code', {
            onSuccess: () => setStep('connected'),
        });
    };

    const handleLogout = () => {
        if (confirm('Are you sure you want to logout from Telegram?')) {
            useForm().post('/user/telegram/session/logout');
        }
    };

    return (
        <UserLayout>
            <Head title="Telegram Session Setup" />

            <div className="max-w-2xl mx-auto space-y-6">
                <div>
                    <h1 className="text-3xl font-bold">Telegram Session Setup</h1>
                    <p className="text-muted-foreground mt-2">
                        Connect your Telegram account to create and manage bots
                    </p>
                </div>

                {step === 'connected' && session ? (
                    <Card>
                        <CardHeader>
                            <div className="flex items-center gap-3">
                                <CheckCircle2 className="h-8 w-8 text-green-500" />
                                <div>
                                    <CardTitle>Connected Successfully</CardTitle>
                                    <CardDescription>
                                        Your Telegram account is connected
                                    </CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="rounded-lg border p-4 space-y-2">
                                <div className="flex justify-between">
                                    <span className="text-sm text-muted-foreground">Phone</span>
                                    <span className="text-sm font-medium">{session.phone}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm text-muted-foreground">Status</span>
                                    <span className="text-sm font-medium text-green-600">Active</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm text-muted-foreground">Connected At</span>
                                    <span className="text-sm font-medium">
                                        {new Date(session.authorized_at).toLocaleString()}
                                    </span>
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <Button asChild className="flex-1">
                                    <a href="/user/telegram/bots/create">Create Your First Bot</a>
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={handleLogout}
                                    className="gap-2"
                                >
                                    <LogOut className="h-4 w-4" />
                                    Logout
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ) : step === 'phone' ? (
                    <Card>
                        <CardHeader>
                            <div className="flex items-center gap-3">
                                <Smartphone className="h-8 w-8 text-primary" />
                                <div>
                                    <CardTitle>Step 1: Enter Phone Number</CardTitle>
                                    <CardDescription>
                                        Enter your Telegram phone number to receive OTP code
                                    </CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSendCode} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="phone">Phone Number</Label>
                                    <Input
                                        id="phone"
                                        type="tel"
                                        placeholder="+628123456789"
                                        value={phoneForm.data.phone}
                                        onChange={(e) => phoneForm.setData('phone', e.target.value)}
                                        required
                                    />
                                    {phoneForm.errors.phone && (
                                        <p className="text-sm text-destructive">{phoneForm.errors.phone}</p>
                                    )}
                                </div>

                                <Alert>
                                    <AlertCircle className="h-4 w-4" />
                                    <AlertDescription>
                                        Make sure you have access to this Telegram account. You will receive an OTP code.
                                    </AlertDescription>
                                </Alert>

                                <Button
                                    type="submit"
                                    className="w-full"
                                    disabled={phoneForm.processing}
                                >
                                    {phoneForm.processing ? 'Sending...' : 'Send OTP Code'}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                ) : (
                    <Card>
                        <CardHeader>
                            <CardTitle>Step 2: Verify OTP Code</CardTitle>
                            <CardDescription>
                                Enter the code you received on Telegram
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleVerifyCode} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="code">OTP Code</Label>
                                    <Input
                                        id="code"
                                        type="text"
                                        placeholder="12345"
                                        value={codeForm.data.code}
                                        onChange={(e) => codeForm.setData('code', e.target.value)}
                                        required
                                    />
                                    {codeForm.errors.code && (
                                        <p className="text-sm text-destructive">{codeForm.errors.code}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="password">2FA Password (if enabled)</Label>
                                    <Input
                                        id="password"
                                        type="password"
                                        placeholder="Optional"
                                        value={codeForm.data.password}
                                        onChange={(e) => codeForm.setData('password', e.target.value)}
                                    />
                                </div>

                                <div className="flex gap-3">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => setStep('phone')}
                                        className="flex-1"
                                    >
                                        Back
                                    </Button>
                                    <Button
                                        type="submit"
                                        className="flex-1"
                                        disabled={codeForm.processing}
                                    >
                                        {codeForm.processing ? 'Verifying...' : 'Verify & Connect'}
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                )}
            </div>
        </UserLayout>
    );
}
