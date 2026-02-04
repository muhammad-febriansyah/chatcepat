import { Head, Link, useForm, router } from '@inertiajs/react';
import { logger } from '@/utils/logger';
import UserLayout from '@/layouts/user/user-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Save, Plus, X, Info, Eye, Mail, Layout } from 'lucide-react';
import { FormEvent, useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { RichTextEditor } from '@/components/editor/RichTextEditor';

interface Variable {
    name: string;
    example: string;
}

interface MessageTemplate {
    id: number;
    name: string;
    type: 'whatsapp' | 'email';
    subject: string | null;
    content: string;
    category: string | null;
    description: string | null;
    variables: Variable[] | string | null;
    is_active: boolean;
}

interface EditEmailProps {
    template: MessageTemplate;
}

export default function EditEmailTemplate({ template }: EditEmailProps) {
    // Helper to parse content
    const parseContent = (html: string) => {
        const result = {
            header_content: '',
            body_content: '',
            footer_content: '',
            header_bg_color: '#3b82f6',
            header_text_color: '#ffffff',
            footer_bg_color: '#f3f4f6',
            footer_text_color: '#6b7280',
        };

        try {
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            const divs = doc.querySelectorAll('body > div');

            if (divs.length >= 3) {
                // Header
                const headerDiv = divs[0] as HTMLElement;
                result.header_content = headerDiv.innerHTML.trim();
                result.header_bg_color = headerDiv.style.backgroundColor || '#3b82f6';
                result.header_text_color = headerDiv.style.color || '#ffffff';

                // Body
                const bodyDiv = divs[1] as HTMLElement;
                result.body_content = bodyDiv.innerHTML.trim();

                // Footer
                const footerDiv = divs[2] as HTMLElement;
                result.footer_content = footerDiv.innerHTML.trim();
                result.footer_bg_color = footerDiv.style.backgroundColor || '#f3f4f6';
                result.footer_text_color = footerDiv.style.color || '#6b7280';
            } else {
                // Fallback for legacy or unformatted templates
                result.body_content = html;
            }
        } catch (e) {
            logger.error('Failed to parse email template content', e);
            result.body_content = html;
        }

        return result;
    };

    const initialContent = parseContent(template.content);

    // Parse variables
    let initialVariables: Variable[] = [];
    if (template.variables) {
        if (typeof template.variables === 'string') {
            try {
                initialVariables = JSON.parse(template.variables);
            } catch (e) {
                initialVariables = [];
            }
        } else if (Array.isArray(template.variables)) {
            initialVariables = template.variables;
        }
    }

    const [variables, setVariables] = useState<Variable[]>(initialVariables);
    const [newVarName, setNewVarName] = useState('');
    const [newVarExample, setNewVarExample] = useState('');

    const { data, setData, put, processing, errors } = useForm({
        name: template.name || '',
        type: 'email',
        subject: template.subject || '',
        header_content: initialContent.header_content,
        body_content: initialContent.body_content,
        footer_content: initialContent.footer_content,
        header_bg_color: initialContent.header_bg_color,
        header_text_color: initialContent.header_text_color,
        footer_bg_color: initialContent.footer_bg_color,
        footer_text_color: initialContent.footer_text_color,
        category: template.category || '',
        description: template.description || '',
        variables: initialVariables,
    });

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();

        // Combine header, body, footer into single content
        const fullContent = `
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

        router.post(`/user/templates/${template.id}`, {
            _method: 'PUT',
            name: data.name,
            type: data.type,
            subject: data.subject,
            content: fullContent,
            category: data.category,
            description: data.description,
            variables: JSON.stringify(data.variables),
        }, {
            preserveScroll: true,
        });
    };

    const addVariable = () => {
        if (!newVarName.trim()) return;

        const newVar: Variable = {
            name: newVarName.trim(),
            example: newVarExample.trim() || 'Contoh nilai',
        };

        const updatedVariables = [...variables, newVar];
        setVariables(updatedVariables);
        setData('variables', updatedVariables);

        setNewVarName('');
        setNewVarExample('');
    };

    const removeVariable = (index: number) => {
        const updatedVariables = variables.filter((_, i) => i !== index);
        setVariables(updatedVariables);
        setData('variables', updatedVariables);
    };

    const previewContent = (content: string) => {
        let preview = content;
        variables.forEach((variable) => {
            const regex = new RegExp(`{{${variable.name}}}`, 'g');
            preview = preview.replace(regex, `<strong style="color: #3b82f6;">${variable.example}</strong>`);
        });
        return preview;
    };

    const commonCategories = [
        'Marketing',
        'Promosi',
        'Notifikasi',
        'Konfirmasi',
        'Reminder',
        'Support',
        'Invoice',
        'Selamat Datang',
        'Terima Kasih',
        'Lainnya',
    ];

    return (
        <UserLayout>
            <Head title={`Edit Template Email - ${template.name}`} />

            <div className="space-y-6">
                {/* Header */}
                <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-blue-500/10 via-blue-500/5 to-transparent p-6 border">
                    <div className="absolute inset-0 bg-grid-white/10 [mask-image:radial-gradient(white,transparent_85%)]" />
                    <div className="relative flex items-center gap-4">
                        <Button
                            variant="outline"
                            size="icon"
                            asChild
                            className="shadow-sm"
                        >
                            <Link href="/user/templates?type=email">
                                <ArrowLeft className="size-5" />
                            </Link>
                        </Button>
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
                                <Mail className="size-8 text-blue-600" />
                                Edit Template Email
                            </h1>
                            <p className="text-sm sm:text-base text-muted-foreground mt-1">
                                Perbarui desain email Anda: {template.name}
                            </p>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-3">
                    {/* Form */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Basic Info */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Informasi Template</CardTitle>
                                <CardDescription>
                                    Perbarui informasi dasar template email Anda
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {/* Nama Template */}
                                <div className="space-y-2">
                                    <Label htmlFor="name">
                                        Nama Template <span className="text-destructive">*</span>
                                    </Label>
                                    <Input
                                        id="name"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        placeholder="Contoh: Promo Akhir Tahun"
                                        required
                                    />
                                    {errors.name && (
                                        <p className="text-sm text-destructive">{errors.name}</p>
                                    )}
                                </div>

                                {/* Subject */}
                                <div className="space-y-2">
                                    <Label htmlFor="subject">
                                        Subject Email <span className="text-destructive">*</span>
                                    </Label>
                                    <Input
                                        id="subject"
                                        value={data.subject}
                                        onChange={(e) => setData('subject', e.target.value)}
                                        placeholder="Contoh: Promo Spesial Untuk Anda!"
                                        required
                                    />
                                    {errors.subject && (
                                        <p className="text-sm text-destructive">{errors.subject}</p>
                                    )}
                                </div>

                                {/* Category */}
                                <div className="space-y-2">
                                    <Label htmlFor="category">Kategori</Label>
                                    <Select value={data.category} onValueChange={(value) => setData('category', value)}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Pilih kategori" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {commonCategories.map((cat) => (
                                                <SelectItem key={cat} value={cat}>
                                                    {cat}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Description */}
                                <div className="space-y-2">
                                    <Label htmlFor="description">Deskripsi</Label>
                                    <Textarea
                                        id="description"
                                        value={data.description}
                                        onChange={(e) => setData('description', e.target.value)}
                                        placeholder="Deskripsi singkat tentang template ini"
                                        rows={2}
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        {/* Email Builder */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Layout className="size-5" />
                                    Email Builder
                                </CardTitle>
                                <CardDescription>
                                    Edit desain header, body, dan footer email Anda
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
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
                                                <Label>Background Color</Label>
                                                <div className="flex gap-2">
                                                    <Input
                                                        type="color"
                                                        value={data.header_bg_color}
                                                        onChange={(e) => setData('header_bg_color', e.target.value)}
                                                        className="w-16 h-10 p-1 cursor-pointer"
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
                                                <Label>Text Color</Label>
                                                <div className="flex gap-2">
                                                    <Input
                                                        type="color"
                                                        value={data.header_text_color}
                                                        onChange={(e) => setData('header_text_color', e.target.value)}
                                                        className="w-16 h-10 p-1 cursor-pointer"
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
                                            <Label>Header Content</Label>
                                            <RichTextEditor
                                                content={data.header_content}
                                                onChange={(content) => setData('header_content', content)}
                                                placeholder="Logo, judul, atau banner header..."
                                            />
                                        </div>
                                    </TabsContent>

                                    {/* Body Tab */}
                                    <TabsContent value="body" className="space-y-4 mt-4">
                                        <div className="space-y-2">
                                            <Label>
                                                Email Body Content <span className="text-destructive">*</span>
                                            </Label>
                                            <RichTextEditor
                                                content={data.body_content}
                                                onChange={(content) => setData('body_content', content)}
                                                placeholder="Tulis isi email Anda di sini. Gunakan {{variable}} untuk data dinamis..."
                                                className="min-h-[300px]"
                                            />
                                            <p className="text-xs text-muted-foreground">
                                                Gunakan <code className="bg-muted px-1 py-0.5 rounded text-blue-600 font-mono">{`{{variable}}`}</code> untuk memasukkan data dinamis
                                            </p>
                                        </div>

                                        {/* Quick Insert Variables */}
                                        {variables.length > 0 && (
                                            <div className="space-y-2">
                                                <Label>Quick Insert Variable:</Label>
                                                <div className="flex flex-wrap gap-2">
                                                    {variables.map((variable, index) => (
                                                        <Button
                                                            key={index}
                                                            type="button"
                                                            variant="outline"
                                                            size="sm"
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
                                                <Label>Background Color</Label>
                                                <div className="flex gap-2">
                                                    <Input
                                                        type="color"
                                                        value={data.footer_bg_color}
                                                        onChange={(e) => setData('footer_bg_color', e.target.value)}
                                                        className="w-16 h-10 p-1 cursor-pointer"
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
                                                <Label>Text Color</Label>
                                                <div className="flex gap-2">
                                                    <Input
                                                        type="color"
                                                        value={data.footer_text_color}
                                                        onChange={(e) => setData('footer_text_color', e.target.value)}
                                                        className="w-16 h-10 p-1 cursor-pointer"
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
                                        <div className="space-y-2">
                                            <Label>Footer Content</Label>
                                            <RichTextEditor
                                                content={data.footer_content}
                                                onChange={(content) => setData('footer_content', content)}
                                                placeholder="Informasi kontak, social media, unsubscribe link..."
                                            />
                                        </div>
                                    </TabsContent>
                                </Tabs>
                            </CardContent>
                        </Card>

                        {/* Submit Buttons */}
                        <div className="flex flex-col sm:flex-row gap-3 sticky bottom-0 bg-background p-4 -mx-4 sm:-mx-6 border-t mt-6">
                            <Button type="submit" disabled={processing} size="lg" className="flex-1 sm:flex-none shadow-lg">
                                <Save className="size-4 mr-2" />
                                {processing ? 'Menyimpan...' : 'Simpan Perubahan'}
                            </Button>
                            <Button type="button" variant="outline" size="lg" asChild className="flex-1 sm:flex-none">
                                <Link href="/user/templates?type=email">
                                    Batal
                                </Link>
                            </Button>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="lg:col-span-1 space-y-6">
                        {/* Variables */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Variables / Placeholder</CardTitle>
                                <CardDescription className="text-xs">
                                    Kelola variable untuk data dinamis
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {/* Add Variable Form */}
                                <div className="space-y-3 p-3 bg-muted/50 rounded-lg">
                                    <div className="space-y-1.5">
                                        <Label htmlFor="var_name" className="text-xs">Nama Variable</Label>
                                        <Input
                                            id="var_name"
                                            value={newVarName}
                                            onChange={(e) => setNewVarName(e.target.value)}
                                            placeholder="nama_customer"
                                            className="h-8 text-sm"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label htmlFor="var_example" className="text-xs">Contoh Nilai</Label>
                                        <Input
                                            id="var_example"
                                            value={newVarExample}
                                            onChange={(e) => setNewVarExample(e.target.value)}
                                            placeholder="John Doe"
                                            className="h-8 text-sm"
                                        />
                                    </div>
                                    <Button
                                        type="button"
                                        size="sm"
                                        onClick={addVariable}
                                        disabled={!newVarName.trim()}
                                        className="w-full"
                                    >
                                        <Plus className="size-3 mr-1" />
                                        Tambah Variable
                                    </Button>
                                </div>

                                {/* Variables List */}
                                {variables.length > 0 && (
                                    <div className="space-y-2">
                                        <Label className="text-xs">Variable yang Tersedia:</Label>
                                        <div className="space-y-2">
                                            {variables.map((variable, index) => (
                                                <div
                                                    key={index}
                                                    className="flex items-start justify-between gap-2 p-2 bg-muted rounded text-xs"
                                                >
                                                    <div className="flex-1 min-w-0">
                                                        <div className="font-mono font-medium truncate">
                                                            {`{{${variable.name}}}`}
                                                        </div>
                                                        <div className="text-muted-foreground truncate">
                                                            {variable.example}
                                                        </div>
                                                    </div>
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => removeVariable(index)}
                                                        className="size-6 p-0"
                                                    >
                                                        <X className="size-3" />
                                                    </Button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Preview */}
                        <Card className="border-2 border-primary/20">
                            <CardHeader className="bg-primary/5">
                                <CardTitle className="text-base flex items-center gap-2">
                                    <Eye className="size-4 text-blue-600" />
                                    Email Preview
                                </CardTitle>
                                <CardDescription className="text-xs">
                                    Pratinjau email Anda
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="pt-4">
                                <div className="border rounded-lg overflow-hidden bg-white shadow-sm">
                                    {/* Subject Preview */}
                                    {data.subject && (
                                        <div className="p-3 bg-gray-50 border-b">
                                            <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1">Subject Preview:</p>
                                            <p className="text-sm font-medium text-gray-900">{data.subject}</p>
                                        </div>
                                    )}

                                    {/* Email Preview */}
                                    <div className="max-w-full">
                                        {/* Header Preview */}
                                        {data.header_content && (
                                            <div
                                                style={{
                                                    backgroundColor: data.header_bg_color,
                                                    color: data.header_text_color,
                                                    padding: '20px',
                                                    textAlign: 'center',
                                                }}
                                                dangerouslySetInnerHTML={{
                                                    __html: previewContent(data.header_content),
                                                }}
                                            />
                                        )}

                                        {/* Body Preview */}
                                        {data.body_content ? (
                                            <div
                                                style={{ padding: '30px', color: '#374151' }}
                                                className="prose prose-sm max-w-full"
                                                dangerouslySetInnerHTML={{
                                                    __html: previewContent(data.body_content),
                                                }}
                                            />
                                        ) : (
                                            <div className="p-12 text-center text-gray-400 text-sm">
                                                <Mail className="size-12 mx-auto mb-3 opacity-20" />
                                                <p>Isi body email akan muncul di sini</p>
                                            </div>
                                        )}

                                        {/* Footer Preview */}
                                        {data.footer_content && (
                                            <div
                                                style={{
                                                    backgroundColor: data.footer_bg_color,
                                                    color: data.footer_text_color,
                                                    padding: '20px',
                                                    textAlign: 'center',
                                                    fontSize: '12px',
                                                }}
                                                dangerouslySetInnerHTML={{
                                                    __html: previewContent(data.footer_content),
                                                }}
                                            />
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Help */}
                        <Alert className="bg-blue-50/50 border-blue-200">
                            <Info className="size-4 text-blue-600" />
                            <AlertDescription className="text-xs text-blue-800">
                                <strong>Tips Email Profesional:</strong>
                                <ul className="list-disc list-inside mt-2 space-y-1">
                                    <li>Gunakan header untuk logo perusahaan</li>
                                    <li>Body untuk pesan utama yang personal</li>
                                    <li>Footer untuk link sosial media/kontak</li>
                                    <li>Test preview untuk memastikan layout rapi</li>
                                </ul>
                            </AlertDescription>
                        </Alert>
                    </div>
                </form>
            </div>
        </UserLayout>
    );
}
