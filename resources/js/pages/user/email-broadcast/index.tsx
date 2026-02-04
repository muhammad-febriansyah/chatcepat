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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RichTextEditor } from '@/components/editor/RichTextEditor';
import { Layout, X, Info, Eye } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';

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

interface UserEmail {
    id: number;
    email: string;
}

interface Props {
    verifiedEmails?: UserEmail[];
    smtpSettings?: SmtpSetting[];
    emailTemplates?: EmailTemplate[];
}

export default function EmailBroadcastIndex({
    verifiedEmails = [],
    smtpSettings = [],
    emailTemplates = []
}: Props) {
    const [recipientInput, setRecipientInput] = useState('');
    const [variables, setVariables] = useState<Array<{ name: string; example: string }>>([]);
    const [newVarName, setNewVarName] = useState('');
    const [newVarExample, setNewVarExample] = useState('');

    const { data, setData, post, processing } = useForm({
        sender_type: verifiedEmails.length > 0 ? 'mailketing' : 'smtp',
        user_email_id: verifiedEmails.length > 0 ? verifiedEmails[0].id.toString() : '',
        smtp_setting_id: smtpSettings.length > 0 ? smtpSettings[0].id.toString() : '',
        template_id: '',
        subject: '',
        header_content: '',
        body_content: '',
        footer_content: '',
        header_bg_color: '#3b82f6',
        header_text_color: '#ffffff',
        footer_bg_color: '#f3f4f6',
        footer_text_color: '#6b7280',
        recipient_emails: [] as string[],
        content: '', // Added back for transformed submission
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
                body_content: template.content, // Populating body for legacy/simple templates
            }));
        }
    };

    const addVariable = () => {
        if (!newVarName.trim()) return;
        const newVar = {
            name: newVarName.trim(),
            example: newVarExample.trim() || 'Contoh nilai',
        };
        setVariables([...variables, newVar]);
        setNewVarName('');
        setNewVarExample('');
    };

    const removeVariable = (index: number) => {
        setVariables(variables.filter((_, i) => i !== index));
    };

    const previewContent = (content: string) => {
        let preview = content;
        variables.forEach((variable) => {
            const regex = new RegExp(`{{${variable.name}}}`, 'g');
            preview = preview.replace(regex, `<strong style="color: #3b82f6;">${variable.example}</strong>`);
        });
        return preview;
    };

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();

        if (data.recipient_emails.length === 0) {
            toast.error('Tambahkan minimal 1 email penerima');
            return;
        }

        if (data.sender_type === 'mailketing' && !data.user_email_id) {
            toast.error('Pilih identitas email terlebih dahulu');
            return;
        }

        if (data.sender_type === 'smtp' && !data.smtp_setting_id) {
            toast.error('Pilih SMTP setting terlebih dahulu');
            return;
        }

        const finalContent = `
            <div style="background-color: ${data.header_bg_color}; color: ${data.header_text_color}; padding: 20px; text-align: center;">
                ${data.header_content}
            </div>
            <div style="padding: 30px;">
                ${data.body_content}
            </div>
            <div style="background-color: ${data.footer_bg_color}; color: ${data.footer_text_color}; padding: 20px; text-align: center; font-size: 12px;">
                ${data.footer_content}
            </div>
        `;

        const transformData = (data: any) => ({
            ...data,
            content: finalContent,
        });

        router.post('/user/email-broadcast/send', transformData(data), {
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

                {/* Warning if no Sender available */}
                {smtpSettings.length === 0 && verifiedEmails.length === 0 && (
                    <Alert variant="destructive">
                        <AlertCircle className="size-4" />
                        <AlertDescription>
                            Anda belum memiliki email pengirim. Silakan{' '}
                            <Link href="/user/email-settings" className="font-medium underline">
                                verifikasi email
                            </Link>{' '}
                            atau{' '}
                            <Link href="/user/smtp-settings" className="font-medium underline">
                                tambahkan SMTP setting
                            </Link>{' '}
                            terlebih dahulu.
                        </AlertDescription>
                    </Alert>
                )}

                {/* Form */}
                {(smtpSettings.length > 0 || verifiedEmails.length > 0) && (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid gap-6 lg:grid-cols-3">
                            {/* Main Form */}
                            <div className="lg:col-span-2 space-y-6">
                                {/* Sender Selection */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Settings className="size-5" />
                                            Sender Configuration
                                        </CardTitle>
                                        <CardDescription>
                                            Pilih identitas pengirim email yang akan digunakan
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="space-y-2">
                                            <Label>Metode Pengiriman</Label>
                                            <Select
                                                value={data.sender_type}
                                                onValueChange={(value) => setData('sender_type', value as any)}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Pilih metode pengiriman" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {verifiedEmails.length > 0 && (
                                                        <SelectItem value="mailketing">
                                                            Mailketing (Email Terverifikasi)
                                                        </SelectItem>
                                                    )}
                                                    {smtpSettings.length > 0 && (
                                                        <SelectItem value="smtp">
                                                            SMTP (Koneksi Manual)
                                                        </SelectItem>
                                                    )}
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        {data.sender_type === 'mailketing' ? (
                                            <div className="space-y-2">
                                                <Label htmlFor="user_email">Identitas Email (From)</Label>
                                                <Select
                                                    value={data.user_email_id}
                                                    onValueChange={(value) => setData('user_email_id', value)}
                                                >
                                                    <SelectTrigger id="user_email">
                                                        <SelectValue placeholder="Pilih email pengirim" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {verifiedEmails.map((email) => (
                                                            <SelectItem key={email.id} value={email.id.toString()}>
                                                                {email.email}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        ) : (
                                            <div className="space-y-2">
                                                <Label htmlFor="smtp">SMTP Setting</Label>
                                                <Select
                                                    value={data.smtp_setting_id}
                                                    onValueChange={(value) => setData('smtp_setting_id', value)}
                                                >
                                                    <SelectTrigger id="smtp">
                                                        <SelectValue placeholder="Pilih SMTP" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {smtpSettings.map((smtp) => (
                                                            <SelectItem key={smtp.id} value={smtp.id.toString()}>
                                                                <div className="flex items-center gap-2">
                                                                    {smtp.name} ({smtp.from_address})
                                                                </div>
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        )}
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

                                        <Separator className="my-4" />

                                        {/* Email Builder */}
                                        <div className="space-y-4 font-normal">
                                            <div className="flex items-center gap-2 mb-2">
                                                <Layout className="size-5 text-primary" />
                                                <h3 className="text-lg font-semibold">Email Builder</h3>
                                            </div>

                                            <Tabs defaultValue="body" className="w-full">
                                                <TabsList className="grid w-full grid-cols-3">
                                                    <TabsTrigger value="header">Header</TabsTrigger>
                                                    <TabsTrigger value="body">Body</TabsTrigger>
                                                    <TabsTrigger value="footer">Footer</TabsTrigger>
                                                </TabsList>

                                                {/* Header Tab */}
                                                <TabsContent value="header" className="space-y-4 mt-4">
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <div className="space-y-2">
                                                            <Label>Header BG Color</Label>
                                                            <div className="flex gap-2">
                                                                <Input
                                                                    type="color"
                                                                    value={data.header_bg_color}
                                                                    onChange={(e) => setData('header_bg_color', e.target.value)}
                                                                    className="w-12 h-10 p-1 cursor-pointer"
                                                                />
                                                                <Input
                                                                    type="text"
                                                                    value={data.header_bg_color}
                                                                    onChange={(e) => setData('header_bg_color', e.target.value)}
                                                                    placeholder="#3b82f6"
                                                                    className="flex-1"
                                                                />
                                                            </div>
                                                        </div>
                                                        <div className="space-y-2">
                                                            <Label>Header Text Color</Label>
                                                            <div className="flex gap-2">
                                                                <Input
                                                                    type="color"
                                                                    value={data.header_text_color}
                                                                    onChange={(e) => setData('header_text_color', e.target.value)}
                                                                    className="w-12 h-10 p-1 cursor-pointer"
                                                                />
                                                                <Input
                                                                    type="text"
                                                                    value={data.header_text_color}
                                                                    onChange={(e) => setData('header_text_color', e.target.value)}
                                                                    placeholder="#ffffff"
                                                                    className="flex-1"
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="space-y-2">
                                                        <RichTextEditor
                                                            content={data.header_content}
                                                            onChange={(content) => setData('header_content', content)}
                                                            placeholder="Logo, judul, atau banner header..."
                                                        />
                                                    </div>
                                                </TabsContent>

                                                {/* Body Tab */}
                                                <TabsContent value="body" className="space-y-4 mt-4">
                                                    <RichTextEditor
                                                        content={data.body_content}
                                                        onChange={(content) => setData('body_content', content)}
                                                        placeholder="Tulis isi email Anda di sini. Gunakan {{variable}} untuk data dinamis..."
                                                        className="min-h-[400px]"
                                                    />

                                                    {variables.length > 0 && (
                                                        <div className="space-y-2">
                                                            <Label className="text-xs">Quick Insert Variable:</Label>
                                                            <div className="flex flex-wrap gap-2">
                                                                {variables.map((variable, index) => (
                                                                    <Button
                                                                        key={index}
                                                                        type="button"
                                                                        variant="outline"
                                                                        size="sm"
                                                                        className="h-8 text-xs"
                                                                        onClick={() => {
                                                                            setData('body_content', data.body_content + `{{${variable.name}}}`);
                                                                        }}
                                                                    >
                                                                        {`{{${variable.name}}}`}
                                                                    </Button>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}
                                                </TabsContent>

                                                {/* Footer Tab */}
                                                <TabsContent value="footer" className="space-y-4 mt-4">
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <div className="space-y-2">
                                                            <Label>Footer BG Color</Label>
                                                            <div className="flex gap-2">
                                                                <Input
                                                                    type="color"
                                                                    value={data.footer_bg_color}
                                                                    onChange={(e) => setData('footer_bg_color', e.target.value)}
                                                                    className="w-12 h-10 p-1 cursor-pointer"
                                                                />
                                                                <Input
                                                                    type="text"
                                                                    value={data.footer_bg_color}
                                                                    onChange={(e) => setData('footer_bg_color', e.target.value)}
                                                                    placeholder="#f3f4f6"
                                                                    className="flex-1"
                                                                />
                                                            </div>
                                                        </div>
                                                        <div className="space-y-2">
                                                            <Label>Footer Text Color</Label>
                                                            <div className="flex gap-2">
                                                                <Input
                                                                    type="color"
                                                                    value={data.footer_text_color}
                                                                    onChange={(e) => setData('footer_text_color', e.target.value)}
                                                                    className="w-12 h-10 p-1 cursor-pointer"
                                                                />
                                                                <Input
                                                                    type="text"
                                                                    value={data.footer_text_color}
                                                                    onChange={(e) => setData('footer_text_color', e.target.value)}
                                                                    placeholder="#6b7280"
                                                                    className="flex-1"
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <RichTextEditor
                                                        content={data.footer_content}
                                                        onChange={(content) => setData('footer_content', content)}
                                                        placeholder="Informasi kontak, social media, unsubscribe link..."
                                                    />
                                                </TabsContent>
                                            </Tabs>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Recipients Sidebar */}
                            <div className="space-y-6">
                                {/* Preview Card */}
                                <Card className="border-2 border-primary/20">
                                    <CardHeader className="bg-primary/5 py-3">
                                        <CardTitle className="text-base flex items-center gap-2">
                                            <Eye className="size-4" />
                                            Live Preview
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="pt-4 p-2">
                                        <div className="border rounded-lg overflow-hidden bg-white shadow-inner scale-[0.95] origin-top">
                                            <div className="max-w-full">
                                                {/* Header Preview */}
                                                <div
                                                    style={{
                                                        backgroundColor: data.header_bg_color,
                                                        color: data.header_text_color,
                                                        padding: '15px',
                                                        textAlign: 'center',
                                                        minHeight: '40px'
                                                    }}
                                                    className="text-xs"
                                                    dangerouslySetInnerHTML={{
                                                        __html: previewContent(data.header_content || '<p style="margin:0">Header Preview</p>'),
                                                    }}
                                                />

                                                {/* Body Preview */}
                                                <div
                                                    style={{ padding: '20px' }}
                                                    className="text-sm prose prose-sm max-w-none"
                                                    dangerouslySetInnerHTML={{
                                                        __html: previewContent(data.body_content || '<p class="text-gray-400">Konten body akan muncul di sini</p>'),
                                                    }}
                                                />

                                                {/* Footer Preview */}
                                                <div
                                                    style={{
                                                        backgroundColor: data.footer_bg_color,
                                                        color: data.footer_text_color,
                                                        padding: '15px',
                                                        textAlign: 'center',
                                                        fontSize: '10px',
                                                        minHeight: '30px'
                                                    }}
                                                    dangerouslySetInnerHTML={{
                                                        __html: previewContent(data.footer_content || '<p style="margin:0">Footer Preview</p>'),
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Variables Card */}
                                <Card>
                                    <CardHeader className="py-3">
                                        <CardTitle className="text-base">Variables</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="space-y-2 p-3 bg-muted/50 rounded-lg">
                                            <Input
                                                value={newVarName}
                                                onChange={(e) => setNewVarName(e.target.value)}
                                                placeholder="nama_customer"
                                                className="h-8 text-xs"
                                            />
                                            <Button
                                                type="button"
                                                size="sm"
                                                onClick={addVariable}
                                                disabled={!newVarName.trim()}
                                                className="w-full h-8 text-xs"
                                            >
                                                <Plus className="size-3 mr-1" />
                                                Tambah Variable
                                            </Button>
                                        </div>

                                        {variables.length > 0 && (
                                            <div className="space-y-2">
                                                {variables.map((variable, index) => (
                                                    <div
                                                        key={index}
                                                        className="flex items-center justify-between gap-1 p-2 bg-muted rounded text-[10px]"
                                                    >
                                                        <span className="font-mono font-medium truncate">
                                                            {`{{${variable.name}}}`}
                                                        </span>
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => removeVariable(index)}
                                                            className="size-5 p-0"
                                                        >
                                                            <X className="size-3" />
                                                        </Button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>

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
        </UserLayout >
    );
}
