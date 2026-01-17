import { useState, FormEvent } from 'react';
import UserLayout from '@/layouts/user/user-layout';
import { Head, router, useForm, Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Send, Mail, Settings, AlertCircle, Plus, History } from 'lucide-react';
import { toast } from 'sonner';

interface SmtpSetting {
    id: number;
    name: string;
    from_address: string;
    is_active: boolean;
}

interface EmailTemplate {
    id: number;
    name: string;
    subject: string;
    content: string;
}

interface Props {
    activeSmtp: SmtpSetting | null;
    smtpSettings: SmtpSetting[];
    emailTemplates: EmailTemplate[];
}

export default function EmailBroadcastIndex({ activeSmtp, smtpSettings, emailTemplates }: Props) {
    const [recipientInput, setRecipientInput] = useState('');

    const { data, setData, post, processing } = useForm({
        smtp_setting_id: activeSmtp?.id || '',
        template_id: '',
        subject: '',
        content: '',
        recipient_emails: [] as string[],
    });

    const handleAddRecipients = () => {
        const emails = recipientInput
            .split(/[\n,;]/)
            .map(email => email.trim())
            .filter(email => email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email));

        if (emails.length === 0) {
            toast.error('Tidak ada email yang valid');
            return;
        }

        const newEmails = [...data.recipient_emails, ...emails];
        const uniqueEmails = Array.from(new Set(newEmails));

        setData('recipient_emails', uniqueEmails);
        setRecipientInput('');
        toast.success(`${emails.length} email ditambahkan`);
    };

    const handleRemoveEmail = (email: string) => {
        setData('recipient_emails', data.recipient_emails.filter(e => e !== email));
    };

    const handleTemplateSelect = (templateId: string) => {
        setData('template_id', templateId);

        const template = emailTemplates.find(t => t.id === parseInt(templateId));
        if (template) {
            setData((prev) => ({
                ...prev,
                subject: template.subject,
                content: template.content,
            }));
        }
    };

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();

        if (data.recipient_emails.length === 0) {
            toast.error('Tambahkan minimal 1 email penerima');
            return;
        }

        if (!data.smtp_setting_id) {
            toast.error('Pilih SMTP setting terlebih dahulu');
            return;
        }

        post('/user/email-broadcast/send', {
            onSuccess: () => {
                toast.success('Broadcast email sedang diproses');
            },
            onError: (errors) => {
                const firstError = Object.values(errors)[0];
                toast.error(firstError as string);
            },
        });
    };

    return (
        <UserLayout>
            <Head title="Email Broadcast" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">Email Broadcast</h1>
                        <p className="text-muted-foreground mt-1">
                            Kirim email ke multiple recipients sekaligus
                        </p>
                    </div>
                    <Link href="/user/email-broadcast/history">
                        <Button variant="outline">
                            <History className="mr-2 size-4" />
                            History
                        </Button>
                    </Link>
                </div>

                {/* Warning if no SMTP */}
                {smtpSettings.length === 0 && (
                    <Alert>
                        <AlertCircle className="size-4" />
                        <AlertDescription>
                            Anda belum memiliki SMTP setting. Silakan{' '}
                            <Link href="/user/smtp-settings" className="font-medium underline">
                                tambahkan SMTP setting
                            </Link>{' '}
                            terlebih dahulu.
                        </AlertDescription>
                    </Alert>
                )}

                {/* Form */}
                {smtpSettings.length > 0 && (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid gap-6 lg:grid-cols-3">
                            {/* Main Form */}
                            <div className="lg:col-span-2 space-y-6">
                                {/* SMTP Selection */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Settings className="size-5" />
                                            SMTP Configuration
                                        </CardTitle>
                                        <CardDescription>
                                            Pilih SMTP yang akan digunakan untuk mengirim email
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-2">
                                            <Label htmlFor="smtp">SMTP Setting</Label>
                                            <Select
                                                value={data.smtp_setting_id.toString()}
                                                onValueChange={(value) => setData('smtp_setting_id', parseInt(value))}
                                            >
                                                <SelectTrigger id="smtp">
                                                    <SelectValue placeholder="Pilih SMTP" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {smtpSettings.map((smtp) => (
                                                        <SelectItem key={smtp.id} value={smtp.id.toString()}>
                                                            <div className="flex items-center gap-2">
                                                                {smtp.name} ({smtp.from_address})
                                                                {smtp.is_active && (
                                                                    <Badge variant="default" className="text-xs">
                                                                        Active
                                                                    </Badge>
                                                                )}
                                                            </div>
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Email Content */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Mail className="size-5" />
                                            Email Content
                                        </CardTitle>
                                        <CardDescription>
                                            Tulis konten email atau pilih dari template
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        {/* Template Selector */}
                                        {emailTemplates.length > 0 && (
                                            <div className="space-y-2">
                                                <Label htmlFor="template">Gunakan Template (Opsional)</Label>
                                                <Select
                                                    value={data.template_id.toString()}
                                                    onValueChange={handleTemplateSelect}
                                                >
                                                    <SelectTrigger id="template">
                                                        <SelectValue placeholder="Pilih template email" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="0">Tanpa Template</SelectItem>
                                                        {emailTemplates.map((template) => (
                                                            <SelectItem key={template.id} value={template.id.toString()}>
                                                                {template.name}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        )}

                                        {/* Subject */}
                                        <div className="space-y-2">
                                            <Label htmlFor="subject">Subject</Label>
                                            <Input
                                                id="subject"
                                                value={data.subject}
                                                onChange={(e) => setData('subject', e.target.value)}
                                                placeholder="Email subject"
                                                required
                                            />
                                        </div>

                                        {/* Content */}
                                        <div className="space-y-2">
                                            <Label htmlFor="content">Content</Label>
                                            <Textarea
                                                id="content"
                                                value={data.content}
                                                onChange={(e) => setData('content', e.target.value)}
                                                placeholder="Email content (HTML supported)"
                                                className="min-h-[300px] font-mono text-sm"
                                                required
                                            />
                                            <p className="text-xs text-muted-foreground">
                                                HTML tags didukung. Untuk menggunakan template email yang lebih profesional,{' '}
                                                <Link href="/user/templates/create?type=email" className="underline">
                                                    buat template email
                                                </Link>{' '}
                                                terlebih dahulu.
                                            </p>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Recipients Sidebar */}
                            <div className="space-y-6">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Recipients</CardTitle>
                                        <CardDescription>
                                            {data.recipient_emails.length} email penerima
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        {/* Add Recipients */}
                                        <div className="space-y-2">
                                            <Label htmlFor="recipients">Tambah Email</Label>
                                            <Textarea
                                                id="recipients"
                                                value={recipientInput}
                                                onChange={(e) => setRecipientInput(e.target.value)}
                                                placeholder="Masukkan email (satu per baris atau pisahkan dengan koma)"
                                                className="min-h-[100px]"
                                            />
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={handleAddRecipients}
                                                className="w-full"
                                            >
                                                <Plus className="size-4 mr-2" />
                                                Tambah Email
                                            </Button>
                                        </div>

                                        {/* Email List */}
                                        {data.recipient_emails.length > 0 && (
                                            <div className="space-y-2">
                                                <Label>Email Penerima</Label>
                                                <div className="space-y-1 max-h-[300px] overflow-y-auto border rounded-lg p-2">
                                                    {data.recipient_emails.map((email) => (
                                                        <div
                                                            key={email}
                                                            className="flex items-center justify-between text-sm p-2 rounded hover:bg-muted"
                                                        >
                                                            <span className="truncate">{email}</span>
                                                            <Button
                                                                type="button"
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => handleRemoveEmail(email)}
                                                                className="h-6 w-6 p-0"
                                                            >
                                                                ×
                                                            </Button>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Send Button */}
                                        <Button
                                            type="submit"
                                            className="w-full"
                                            disabled={processing || data.recipient_emails.length === 0}
                                        >
                                            <Send className="mr-2 size-4" />
                                            {processing ? 'Mengirim...' : `Kirim ke ${data.recipient_emails.length} email`}
                                        </Button>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    </form>
                )}
            </div>
        </UserLayout>
    );
}
