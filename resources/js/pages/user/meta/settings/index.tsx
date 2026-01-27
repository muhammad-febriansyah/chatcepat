import { Head, useForm } from '@inertiajs/react';
import UserLayout from '@/layouts/user/user-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
    MessageSquare,
    Instagram,
    Facebook,
    CheckCircle2,
    AlertCircle,
    Loader2,
    Link2,
    Unlink,
    ExternalLink,
    Info
} from 'lucide-react';
import { useState, FormEvent } from 'react';
import axios from 'axios';

interface MetaSettings {
    whatsapp: {
        phone_number_id: string | null;
        business_account_id: string | null;
        configured: boolean;
    };
    instagram: {
        account_id: string | null;
        configured: boolean;
    };
    facebook: {
        page_id: string | null;
        page_access_token_masked: string | null;
        configured: boolean;
    };
    access_token_masked: string | null;
}

interface Props {
    settings: MetaSettings;
}

export default function MetaSettingsIndex({ settings }: Props) {
    const [activeTab, setActiveTab] = useState('whatsapp');
    const [testing, setTesting] = useState<string | null>(null);
    const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

    const whatsappForm = useForm({
        phone_number_id: settings.whatsapp.phone_number_id || '',
        business_account_id: settings.whatsapp.business_account_id || '',
        access_token: '',
    });

    const instagramForm = useForm({
        account_id: settings.instagram.account_id || '',
        access_token: '',
    });

    const facebookForm = useForm({
        page_id: settings.facebook.page_id || '',
        page_access_token: '',
    });

    const handleWhatsAppSubmit = (e: FormEvent) => {
        e.preventDefault();
        whatsappForm.post('/user/meta/settings/whatsapp', {
            onSuccess: () => {
                whatsappForm.setData('access_token', '');
            },
        });
    };

    const handleInstagramSubmit = (e: FormEvent) => {
        e.preventDefault();
        instagramForm.post('/user/meta/settings/instagram', {
            onSuccess: () => {
                instagramForm.setData('access_token', '');
            },
        });
    };

    const handleFacebookSubmit = (e: FormEvent) => {
        e.preventDefault();
        facebookForm.post('/user/meta/settings/facebook');
    };

    const handleTestConnection = async (platform: string) => {
        setTesting(platform);
        setTestResult(null);

        try {
            const response = await axios.post('/user/meta/settings/test-connection', {
                platform,
            });

            setTestResult({
                success: response.data.success,
                message: response.data.message,
            });
        } catch (error: any) {
            setTestResult({
                success: false,
                message: error.response?.data?.message || 'Connection test failed',
            });
        } finally {
            setTesting(null);
        }
    };

    const handleDisconnect = (platform: string) => {
        if (confirm(`Yakin ingin disconnect ${platform}?`)) {
            axios.post('/user/meta/settings/disconnect', { platform })
                .then(() => window.location.reload());
        }
    };

    return (
        <UserLayout>
            <Head title="Meta Integration Settings" />

            <div className="space-y-6">
                {/* Header */}
                <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-6 border">
                    <div className="absolute inset-0 bg-grid-white/10 [mask-image:radial-gradient(white,transparent_85%)]" />
                    <div className="relative">
                        <h1 className="text-3xl font-bold tracking-tight text-foreground">
                            Meta Integration Settings
                        </h1>
                        <p className="text-muted-foreground mt-1">
                            Configure your Meta Business API credentials for WhatsApp, Instagram, and Facebook
                        </p>
                    </div>
                </div>

                {/* Info Card */}
                <Alert>
                    <Info className="h-4 w-4" />
                    <AlertDescription>
                        <p className="font-medium mb-2">Cara mendapatkan credentials:</p>
                        <ol className="list-decimal list-inside space-y-1 text-sm">
                            <li>Buka <a href="https://developers.facebook.com/apps" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline inline-flex items-center gap-1">Meta Developer Console <ExternalLink className="h-3 w-3" /></a></li>
                            <li>Pilih atau buat App Anda</li>
                            <li>Tambahkan product: WhatsApp Business Platform, Instagram Messaging, atau Messenger</li>
                            <li>Copy credentials yang diperlukan dan paste di form di bawah</li>
                        </ol>
                    </AlertDescription>
                </Alert>

                {/* Tabs */}
                <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="whatsapp" className="gap-2">
                            <MessageSquare className="h-4 w-4" />
                            WhatsApp
                            {settings.whatsapp.configured && (
                                <Badge variant="default" className="ml-2 bg-green-500">
                                    <CheckCircle2 className="h-3 w-3" />
                                </Badge>
                            )}
                        </TabsTrigger>
                        <TabsTrigger value="instagram" className="gap-2">
                            <Instagram className="h-4 w-4" />
                            Instagram
                            {settings.instagram.configured && (
                                <Badge variant="default" className="ml-2 bg-green-500">
                                    <CheckCircle2 className="h-3 w-3" />
                                </Badge>
                            )}
                        </TabsTrigger>
                        <TabsTrigger value="facebook" className="gap-2">
                            <Facebook className="h-4 w-4" />
                            Facebook
                            {settings.facebook.configured && (
                                <Badge variant="default" className="ml-2 bg-green-500">
                                    <CheckCircle2 className="h-3 w-3" />
                                </Badge>
                            )}
                        </TabsTrigger>
                    </TabsList>

                    {/* WhatsApp Tab */}
                    <TabsContent value="whatsapp">
                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle className="flex items-center gap-2">
                                            <MessageSquare className="h-5 w-5" />
                                            WhatsApp Business API
                                        </CardTitle>
                                        <CardDescription>
                                            Configure WhatsApp Cloud API credentials
                                        </CardDescription>
                                    </div>
                                    {settings.whatsapp.configured && (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleDisconnect('whatsapp')}
                                            className="gap-2"
                                        >
                                            <Unlink className="h-4 w-4" />
                                            Disconnect
                                        </Button>
                                    )}
                                </div>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleWhatsAppSubmit} className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="wa_phone_number_id">Phone Number ID</Label>
                                        <Input
                                            id="wa_phone_number_id"
                                            value={whatsappForm.data.phone_number_id}
                                            onChange={(e) => whatsappForm.setData('phone_number_id', e.target.value)}
                                            placeholder="123456789012345"
                                            required
                                        />
                                        {whatsappForm.errors.phone_number_id && (
                                            <p className="text-sm text-destructive">{whatsappForm.errors.phone_number_id}</p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="wa_business_account_id">Business Account ID</Label>
                                        <Input
                                            id="wa_business_account_id"
                                            value={whatsappForm.data.business_account_id}
                                            onChange={(e) => whatsappForm.setData('business_account_id', e.target.value)}
                                            placeholder="123456789012345"
                                            required
                                        />
                                        {whatsappForm.errors.business_account_id && (
                                            <p className="text-sm text-destructive">{whatsappForm.errors.business_account_id}</p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="wa_access_token">
                                            Access Token
                                            {settings.access_token_masked && (
                                                <span className="text-muted-foreground ml-2">
                                                    (Current: {settings.access_token_masked})
                                                </span>
                                            )}
                                        </Label>
                                        <Input
                                            id="wa_access_token"
                                            type="password"
                                            value={whatsappForm.data.access_token}
                                            onChange={(e) => whatsappForm.setData('access_token', e.target.value)}
                                            placeholder="Leave empty to keep current token"
                                        />
                                        <p className="text-xs text-muted-foreground">
                                            Only enter if you want to update the token
                                        </p>
                                    </div>

                                    {testResult && activeTab === 'whatsapp' && (
                                        <Alert variant={testResult.success ? 'default' : 'destructive'}>
                                            {testResult.success ? (
                                                <CheckCircle2 className="h-4 w-4" />
                                            ) : (
                                                <AlertCircle className="h-4 w-4" />
                                            )}
                                            <AlertDescription>{testResult.message}</AlertDescription>
                                        </Alert>
                                    )}

                                    <div className="flex gap-3">
                                        <Button
                                            type="submit"
                                            disabled={whatsappForm.processing}
                                            className="gap-2"
                                        >
                                            {whatsappForm.processing ? (
                                                <>
                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                    Saving...
                                                </>
                                            ) : (
                                                <>
                                                    <Link2 className="h-4 w-4" />
                                                    Save Configuration
                                                </>
                                            )}
                                        </Button>
                                        {settings.whatsapp.configured && (
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={() => handleTestConnection('whatsapp')}
                                                disabled={testing === 'whatsapp'}
                                                className="gap-2"
                                            >
                                                {testing === 'whatsapp' ? (
                                                    <>
                                                        <Loader2 className="h-4 w-4 animate-spin" />
                                                        Testing...
                                                    </>
                                                ) : (
                                                    'Test Connection'
                                                )}
                                            </Button>
                                        )}
                                    </div>
                                </form>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Instagram Tab */}
                    <TabsContent value="instagram">
                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle className="flex items-center gap-2">
                                            <Instagram className="h-5 w-5" />
                                            Instagram Messaging API
                                        </CardTitle>
                                        <CardDescription>
                                            Configure Instagram Business account credentials
                                        </CardDescription>
                                    </div>
                                    {settings.instagram.configured && (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleDisconnect('instagram')}
                                            className="gap-2"
                                        >
                                            <Unlink className="h-4 w-4" />
                                            Disconnect
                                        </Button>
                                    )}
                                </div>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleInstagramSubmit} className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="ig_account_id">Instagram Account ID</Label>
                                        <Input
                                            id="ig_account_id"
                                            value={instagramForm.data.account_id}
                                            onChange={(e) => instagramForm.setData('account_id', e.target.value)}
                                            placeholder="123456789012345"
                                            required
                                        />
                                        {instagramForm.errors.account_id && (
                                            <p className="text-sm text-destructive">{instagramForm.errors.account_id}</p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="ig_access_token">
                                            Access Token
                                            {settings.access_token_masked && (
                                                <span className="text-muted-foreground ml-2">
                                                    (Current: {settings.access_token_masked})
                                                </span>
                                            )}
                                        </Label>
                                        <Input
                                            id="ig_access_token"
                                            type="password"
                                            value={instagramForm.data.access_token}
                                            onChange={(e) => instagramForm.setData('access_token', e.target.value)}
                                            placeholder="Leave empty to keep current token"
                                        />
                                        <p className="text-xs text-muted-foreground">
                                            Only enter if you want to update the token
                                        </p>
                                    </div>

                                    {testResult && activeTab === 'instagram' && (
                                        <Alert variant={testResult.success ? 'default' : 'destructive'}>
                                            {testResult.success ? (
                                                <CheckCircle2 className="h-4 w-4" />
                                            ) : (
                                                <AlertCircle className="h-4 w-4" />
                                            )}
                                            <AlertDescription>{testResult.message}</AlertDescription>
                                        </Alert>
                                    )}

                                    <div className="flex gap-3">
                                        <Button
                                            type="submit"
                                            disabled={instagramForm.processing}
                                            className="gap-2"
                                        >
                                            {instagramForm.processing ? (
                                                <>
                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                    Saving...
                                                </>
                                            ) : (
                                                <>
                                                    <Link2 className="h-4 w-4" />
                                                    Save Configuration
                                                </>
                                            )}
                                        </Button>
                                        {settings.instagram.configured && (
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={() => handleTestConnection('instagram')}
                                                disabled={testing === 'instagram'}
                                                className="gap-2"
                                            >
                                                {testing === 'instagram' ? (
                                                    <>
                                                        <Loader2 className="h-4 w-4 animate-spin" />
                                                        Testing...
                                                    </>
                                                ) : (
                                                    'Test Connection'
                                                )}
                                            </Button>
                                        )}
                                    </div>
                                </form>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Facebook Tab */}
                    <TabsContent value="facebook">
                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle className="flex items-center gap-2">
                                            <Facebook className="h-5 w-5" />
                                            Facebook Messenger API
                                        </CardTitle>
                                        <CardDescription>
                                            Configure Facebook Page credentials
                                        </CardDescription>
                                    </div>
                                    {settings.facebook.configured && (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleDisconnect('facebook')}
                                            className="gap-2"
                                        >
                                            <Unlink className="h-4 w-4" />
                                            Disconnect
                                        </Button>
                                    )}
                                </div>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleFacebookSubmit} className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="fb_page_id">Page ID</Label>
                                        <Input
                                            id="fb_page_id"
                                            value={facebookForm.data.page_id}
                                            onChange={(e) => facebookForm.setData('page_id', e.target.value)}
                                            placeholder="123456789012345"
                                            required
                                        />
                                        {facebookForm.errors.page_id && (
                                            <p className="text-sm text-destructive">{facebookForm.errors.page_id}</p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="fb_page_access_token">
                                            Page Access Token
                                            {settings.facebook.page_access_token_masked && (
                                                <span className="text-muted-foreground ml-2">
                                                    (Current: {settings.facebook.page_access_token_masked})
                                                </span>
                                            )}
                                        </Label>
                                        <Input
                                            id="fb_page_access_token"
                                            type="password"
                                            value={facebookForm.data.page_access_token}
                                            onChange={(e) => facebookForm.setData('page_access_token', e.target.value)}
                                            placeholder={settings.facebook.configured ? "Leave empty to keep current token" : "Enter page access token"}
                                            required={!settings.facebook.configured}
                                        />
                                        <p className="text-xs text-muted-foreground">
                                            {settings.facebook.configured
                                                ? 'Only enter if you want to update the token'
                                                : 'Get this from your Facebook Page Settings'}
                                        </p>
                                    </div>

                                    {testResult && activeTab === 'facebook' && (
                                        <Alert variant={testResult.success ? 'default' : 'destructive'}>
                                            {testResult.success ? (
                                                <CheckCircle2 className="h-4 w-4" />
                                            ) : (
                                                <AlertCircle className="h-4 w-4" />
                                            )}
                                            <AlertDescription>{testResult.message}</AlertDescription>
                                        </Alert>
                                    )}

                                    <div className="flex gap-3">
                                        <Button
                                            type="submit"
                                            disabled={facebookForm.processing}
                                            className="gap-2"
                                        >
                                            {facebookForm.processing ? (
                                                <>
                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                    Saving...
                                                </>
                                            ) : (
                                                <>
                                                    <Link2 className="h-4 w-4" />
                                                    Save Configuration
                                                </>
                                            )}
                                        </Button>
                                        {settings.facebook.configured && (
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={() => handleTestConnection('facebook')}
                                                disabled={testing === 'facebook'}
                                                className="gap-2"
                                            >
                                                {testing === 'facebook' ? (
                                                    <>
                                                        <Loader2 className="h-4 w-4 animate-spin" />
                                                        Testing...
                                                    </>
                                                ) : (
                                                    'Test Connection'
                                                )}
                                            </Button>
                                        )}
                                    </div>
                                </form>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </UserLayout>
    );
}
