import { Head, Link, useForm } from '@inertiajs/react';
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
import { ArrowLeft, Save, Plus, X, Info, Eye } from 'lucide-react';
import { FormEvent, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface CreateTemplateProps {
    type: 'whatsapp' | 'email';
}

interface Variable {
    name: string;
    example: string;
}

export default function CreateTemplate({ type }: CreateTemplateProps) {
    const [variables, setVariables] = useState<Variable[]>([]);
    const [newVarName, setNewVarName] = useState('');
    const [newVarExample, setNewVarExample] = useState('');

    const { data, setData, post, processing, errors } = useForm({
        name: '',
        type: type,
        subject: '',
        content: '',
        category: '',
        description: '',
        variables: [] as Variable[],
    });

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        post('/user/templates');
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

    const insertVariable = (varName: string) => {
        const cursorPosition = (document.getElementById('content') as HTMLTextAreaElement)?.selectionStart || data.content.length;
        const newContent =
            data.content.slice(0, cursorPosition) +
            `{{${varName}}}` +
            data.content.slice(cursorPosition);
        setData('content', newContent);
    };

    const previewContent = () => {
        let preview = data.content;
        variables.forEach((variable) => {
            const regex = new RegExp(`{{${variable.name}}}`, 'g');
            preview = preview.replace(regex, `<strong class="text-primary">${variable.example}</strong>`);
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
            <Head title={`Buat Template ${type === 'whatsapp' ? 'WhatsApp' : 'Email'}`} />

            <div className="space-y-6">
                {/* Header */}
                <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-6 border">
                    <div className="absolute inset-0 bg-grid-white/10 [mask-image:radial-gradient(white,transparent_85%)]" />
                    <div className="relative flex items-center gap-4">
                        <Button
                            variant="outline"
                            size="icon"
                            asChild
                            className="shadow-sm"
                        >
                            <Link href={`/user/templates?type=${type}`}>
                                <ArrowLeft className="size-5" />
                            </Link>
                        </Button>
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                                Buat Template {type === 'whatsapp' ? 'WhatsApp' : 'Email'}
                            </h1>
                            <p className="text-sm sm:text-base text-muted-foreground mt-1">
                                Buat template pesan untuk mempermudah komunikasi dengan customer
                            </p>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-3">
                    {/* Form */}
                    <div className="lg:col-span-2 space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Informasi Template</CardTitle>
                                <CardDescription>
                                    Isi informasi dasar template pesan Anda
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

                                {/* Subject (untuk email) */}
                                {type === 'email' && (
                                    <div className="space-y-2">
                                        <Label htmlFor="subject">
                                            Subject Email <span className="text-destructive">*</span>
                                        </Label>
                                        <Input
                                            id="subject"
                                            value={data.subject}
                                            onChange={(e) => setData('subject', e.target.value)}
                                            placeholder="Contoh: Promo Spesial Untuk Anda!"
                                            required={type === 'email'}
                                        />
                                        {errors.subject && (
                                            <p className="text-sm text-destructive">{errors.subject}</p>
                                        )}
                                    </div>
                                )}

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

                        {/* Content */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Konten Pesan</CardTitle>
                                <CardDescription>
                                    Tulis isi pesan template Anda. Gunakan {`{{variable}}`} untuk placeholder
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="content">
                                        Isi Pesan <span className="text-destructive">*</span>
                                    </Label>
                                    <Textarea
                                        id="content"
                                        value={data.content}
                                        onChange={(e) => setData('content', e.target.value)}
                                        placeholder={`Halo {{nama_customer}},\n\nTerima kasih telah berbelanja di toko kami!\n\nTotal belanja: {{total}}\nNomor order: {{order_number}}\n\nSalam,\nTim Support`}
                                        rows={10}
                                        required
                                        className="font-mono text-sm"
                                    />
                                    {errors.content && (
                                        <p className="text-sm text-destructive">{errors.content}</p>
                                    )}
                                </div>

                                {/* Quick Insert Variables */}
                                {variables.length > 0 && (
                                    <div className="space-y-2">
                                        <Label>Sisipkan Variable:</Label>
                                        <div className="flex flex-wrap gap-2">
                                            {variables.map((variable, index) => (
                                                <Button
                                                    key={index}
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => insertVariable(variable.name)}
                                                >
                                                    {`{{${variable.name}}}`}
                                                </Button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Submit Buttons */}
                        <div className="flex flex-col sm:flex-row gap-3 sticky bottom-0 bg-background p-4 -mx-4 sm:-mx-6 border-t mt-6">
                            <Button type="submit" disabled={processing} size="lg" className="flex-1 sm:flex-none shadow-lg">
                                <Save className="size-4 mr-2" />
                                {processing ? 'Menyimpan...' : 'Simpan Template'}
                            </Button>
                            <Button type="button" variant="outline" size="lg" asChild className="flex-1 sm:flex-none">
                                <Link href={`/user/templates?type=${type}`}>
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
                                    Tambahkan variable untuk data dinamis
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
                                    <Eye className="size-4" />
                                    Live Preview
                                </CardTitle>
                                <CardDescription className="text-xs">
                                    Pratinjau pesan dengan data contoh
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="pt-4">
                                {data.content ? (
                                    <div className="space-y-3">
                                        {type === 'email' && data.subject && (
                                            <div className="p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-900">
                                                <p className="text-xs font-semibold text-blue-700 dark:text-blue-400 mb-1">Subject Email:</p>
                                                <p className="text-sm font-medium">{data.subject}</p>
                                            </div>
                                        )}
                                        <div className="p-4 bg-muted/50 rounded-lg border border-dashed text-sm whitespace-pre-wrap break-words leading-relaxed">
                                            <div
                                                dangerouslySetInnerHTML={{
                                                    __html: previewContent().replace(/\n/g, '<br/>')
                                                }}
                                            />
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-12 text-center">
                                        <div className="rounded-full bg-muted p-3 mb-3">
                                            <Eye className="size-6 text-muted-foreground" />
                                        </div>
                                        <p className="text-sm text-muted-foreground">
                                            Ketik konten untuk melihat preview
                                        </p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Help */}
                        <Alert>
                            <Info className="size-4" />
                            <AlertDescription className="text-xs">
                                <strong>Tips:</strong>
                                <ul className="list-disc list-inside mt-2 space-y-1">
                                    <li>Gunakan {`{{variable}}`} untuk data dinamis</li>
                                    <li>Buat nama variable yang jelas dan mudah diingat</li>
                                    <li>Test template sebelum digunakan</li>
                                </ul>
                            </AlertDescription>
                        </Alert>
                    </div>
                </form>
            </div>
        </UserLayout>
    );
}
