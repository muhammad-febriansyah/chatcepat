import { Head, Link, useForm } from '@inertiajs/react';
import UserLayout from '@/layouts/user/user-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { ArrowLeft, Package, Save, Eye } from 'lucide-react';
import { FormEvent, useState } from 'react';

interface CreateProductPageProps {
    categories: string[];
}

export default function CreateProduct({ categories }: CreateProductPageProps) {
    const [previewMessage, setPreviewMessage] = useState('');
    const [newCategory, setNewCategory] = useState('');

    const { data, setData, post, processing, errors } = useForm({
        name: '',
        code: '',
        price: '',
        sale_price: '',
        description: '',
        short_description: '',
        image_url: '',
        category: '',
        message_template: '',
        stock: '',
        is_active: true,
    });

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        post('/user/products');
    };

    const generatePreview = () => {
        if (data.message_template) {
            let message = data.message_template;
            message = message.replace(/\{\{nama\}\}|\{\{name\}\}/g, data.name || '[Nama Produk]');
            message = message.replace(/\{\{harga\}\}|\{\{price\}\}/g, data.price ? `Rp ${Number(data.price).toLocaleString('id-ID')}` : '[Harga]');
            message = message.replace(/\{\{deskripsi\}\}|\{\{description\}\}/g, data.short_description || data.description || '[Deskripsi]');
            message = message.replace(/\{\{kode\}\}|\{\{code\}\}/g, data.code || '[Kode]');
            message = message.replace(/\{\{kategori\}\}|\{\{category\}\}/g, data.category || '[Kategori]');
            message = message.replace(/\{\{stok\}\}|\{\{stock\}\}/g, data.stock || 'Tersedia');
            setPreviewMessage(message);
        } else {
            // Default template
            let message = `*${data.name || '[Nama Produk]'}*\n\n`;
            if (data.code) message += `Kode: ${data.code}\n`;
            if (data.sale_price) {
                message += `~Rp ${Number(data.price || 0).toLocaleString('id-ID')}~\n`;
                message += `*Rp ${Number(data.sale_price).toLocaleString('id-ID')}*\n\n`;
            } else {
                message += `*Rp ${Number(data.price || 0).toLocaleString('id-ID')}*\n\n`;
            }
            if (data.short_description) {
                message += `${data.short_description}\n\n`;
            }
            if (data.stock) {
                message += `Stok: ${data.stock}\n`;
            }
            message += `\n_Ketik *BELI ${data.code || 'KODE'}* untuk order_`;
            setPreviewMessage(message);
        }
    };

    return (
        <UserLayout>
            <Head title="Tambah Produk" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Link href="/user/products">
                        <Button variant="ghost" size="sm">
                            <ArrowLeft className="size-4" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Tambah Produk</h1>
                        <p className="text-muted-foreground">
                            Buat produk baru untuk template pesan
                        </p>
                    </div>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="grid gap-6 lg:grid-cols-3">
                        {/* Main Form */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Basic Info */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Package className="size-5" />
                                        Informasi Produk
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div>
                                            <Label>Nama Produk *</Label>
                                            <Input
                                                value={data.name}
                                                onChange={(e) => setData('name', e.target.value)}
                                                placeholder="Contoh: Kemeja Batik Premium"
                                                className="mt-2"
                                            />
                                            {errors.name && <p className="text-sm text-destructive mt-1">{errors.name}</p>}
                                        </div>
                                        <div>
                                            <Label>Kode/SKU</Label>
                                            <Input
                                                value={data.code}
                                                onChange={(e) => setData('code', e.target.value)}
                                                placeholder="Contoh: BTK-001"
                                                className="mt-2"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div>
                                            <Label>Harga *</Label>
                                            <Input
                                                type="number"
                                                value={data.price}
                                                onChange={(e) => setData('price', e.target.value)}
                                                placeholder="150000"
                                                className="mt-2"
                                            />
                                            {errors.price && <p className="text-sm text-destructive mt-1">{errors.price}</p>}
                                        </div>
                                        <div>
                                            <Label>Harga Promo</Label>
                                            <Input
                                                type="number"
                                                value={data.sale_price}
                                                onChange={(e) => setData('sale_price', e.target.value)}
                                                placeholder="125000"
                                                className="mt-2"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div>
                                            <Label>Kategori</Label>
                                            <Select
                                                value={data.category}
                                                onValueChange={(v) => setData('category', v === '__new__' ? '' : v)}
                                            >
                                                <SelectTrigger className="mt-2">
                                                    <SelectValue placeholder="Pilih kategori" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {categories.map((cat) => (
                                                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                                                    ))}
                                                    <SelectItem value="__new__">+ Kategori Baru</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            {data.category === '' && (
                                                <Input
                                                    value={newCategory}
                                                    onChange={(e) => {
                                                        setNewCategory(e.target.value);
                                                        setData('category', e.target.value);
                                                    }}
                                                    placeholder="Ketik kategori baru"
                                                    className="mt-2"
                                                />
                                            )}
                                        </div>
                                        <div>
                                            <Label>Stok</Label>
                                            <Input
                                                type="number"
                                                value={data.stock}
                                                onChange={(e) => setData('stock', e.target.value)}
                                                placeholder="100"
                                                className="mt-2"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <Label>URL Gambar</Label>
                                        <Input
                                            value={data.image_url}
                                            onChange={(e) => setData('image_url', e.target.value)}
                                            placeholder="https://example.com/image.jpg"
                                            className="mt-2"
                                        />
                                        <p className="text-xs text-muted-foreground mt-1">
                                            Masukkan URL langsung ke gambar produk
                                        </p>
                                    </div>

                                    <div>
                                        <Label>Deskripsi Singkat</Label>
                                        <Textarea
                                            value={data.short_description}
                                            onChange={(e) => setData('short_description', e.target.value)}
                                            placeholder="Deskripsi singkat untuk pesan WA (max 500 karakter)"
                                            rows={2}
                                            className="mt-2"
                                        />
                                    </div>

                                    <div>
                                        <Label>Deskripsi Lengkap</Label>
                                        <Textarea
                                            value={data.description}
                                            onChange={(e) => setData('description', e.target.value)}
                                            placeholder="Deskripsi lengkap produk..."
                                            rows={4}
                                            className="mt-2"
                                        />
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Message Template */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Template Pesan WhatsApp</CardTitle>
                                    <CardDescription>
                                        Kustomisasi format pesan untuk produk ini. Kosongkan untuk pakai template default.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div>
                                        <Label>Template Pesan (Opsional)</Label>
                                        <Textarea
                                            value={data.message_template}
                                            onChange={(e) => setData('message_template', e.target.value)}
                                            placeholder={`Contoh:
*{{nama}}*

Harga: {{harga}}
{{deskripsi}}

Stok: {{stok}}

Untuk order, balas pesan ini dengan format:
ORDER {{kode}} [jumlah]`}
                                            rows={8}
                                            className="mt-2 font-mono text-sm"
                                        />
                                        <div className="mt-2 p-3 bg-muted rounded-lg text-sm">
                                            <p className="font-medium mb-2">Placeholder yang tersedia:</p>
                                            <div className="grid grid-cols-2 gap-2 text-xs">
                                                <code>{'{{nama}}'} / {'{{name}}'}</code>
                                                <code>{'{{harga}}'} / {'{{price}}'}</code>
                                                <code>{'{{deskripsi}}'} / {'{{description}}'}</code>
                                                <code>{'{{kode}}'} / {'{{code}}'}</code>
                                                <code>{'{{kategori}}'} / {'{{category}}'}</code>
                                                <code>{'{{stok}}'} / {'{{stock}}'}</code>
                                            </div>
                                        </div>
                                    </div>

                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={generatePreview}
                                    >
                                        <Eye className="size-4 mr-2" />
                                        Preview Pesan
                                    </Button>

                                    {previewMessage && (
                                        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                                            <p className="text-xs text-green-600 mb-2 font-medium">Preview:</p>
                                            <pre className="whitespace-pre-wrap text-sm">{previewMessage}</pre>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>

                        {/* Sidebar */}
                        <div className="space-y-6">
                            {/* Status */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Status</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <Label>Produk Aktif</Label>
                                            <p className="text-sm text-muted-foreground">
                                                Produk aktif dapat digunakan di auto-reply
                                            </p>
                                        </div>
                                        <Switch
                                            checked={data.is_active}
                                            onCheckedChange={(v) => setData('is_active', v)}
                                        />
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Image Preview */}
                            {data.image_url && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Preview Gambar</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <img
                                            src={data.image_url}
                                            alt="Preview"
                                            className="w-full rounded-lg object-cover"
                                            onError={(e) => {
                                                (e.target as HTMLImageElement).style.display = 'none';
                                            }}
                                        />
                                    </CardContent>
                                </Card>
                            )}

                            {/* Actions */}
                            <Card>
                                <CardContent className="pt-6">
                                    <div className="space-y-3">
                                        <Button
                                            type="submit"
                                            className="w-full"
                                            disabled={processing}
                                        >
                                            <Save className="size-4 mr-2" />
                                            {processing ? 'Menyimpan...' : 'Simpan Produk'}
                                        </Button>
                                        <Link href="/user/products" className="block">
                                            <Button type="button" variant="outline" className="w-full">
                                                Batal
                                            </Button>
                                        </Link>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </form>
            </div>
        </UserLayout>
    );
}
