import { Head, router, useForm } from '@inertiajs/react';
import UserLayout from '@/layouts/user/user-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
    ArrowLeft,
    Bot,
    Headphones,
    TrendingUp,
    Settings,
    MessageCircle,
    LucideIcon,
    Plus,
    X,
    Package,
    Link as LinkIcon
} from 'lucide-react';
import { FormEventHandler, useState } from 'react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';

// Icon mapping for dynamic icons from database
const ICON_MAP: Record<string, LucideIcon> = {
    TrendingUp,
    Headphones,
    Settings,
    MessageCircle,
    Bot,
};

interface AiAssistantType {
    id: number;
    code: string;
    name: string;
    description: string;
    icon: string | null;
    color: string | null;
    is_active: boolean;
    sort_order: number;
}

interface Product {
    id?: number;
    name: string;
    price: number;
    description: string;
    purchase_link: string;
    is_active: boolean;
}

interface Props {
    aiAssistantTypes: AiAssistantType[];
    products: any[];
}

export default function WhatsAppCreate({ aiAssistantTypes, products }: Props) {
    // Get default AI type (prefer 'general', or use first available)
    const defaultType = aiAssistantTypes.find(t => t.code === 'general')?.code
        || aiAssistantTypes[0]?.code
        || 'general';

    const { data, setData, post, processing, errors } = useForm({
        phone_number: '',
        name: '',
        creation_method: 'manual' as 'manual' | 'ai',
        ai_assistant_type: defaultType,
        agent_category: '',
        communication_tone: 'professional',
        primary_language: 'id',
        ai_description: '',
        products: [] as Product[],
    });

    const [selectedType, setSelectedType] = useState(defaultType);
    const [showProductDialog, setShowProductDialog] = useState(false);
    const [newProduct, setNewProduct] = useState<Product>({
        name: '',
        price: 0,
        description: '',
        purchase_link: '',
        is_active: true,
    });

    const handleSubmit: FormEventHandler = (e) => {
        e.preventDefault();
        post('/user/whatsapp');
    };

    const handleTypeChange = (value: string) => {
        setSelectedType(value);
        setData('ai_assistant_type', value);
    };

    const handleAddProduct = () => {
        if (newProduct.name && newProduct.price) {
            setData('products', [...data.products, { ...newProduct }]);
            setNewProduct({
                name: '',
                price: 0,
                description: '',
                purchase_link: '',
                is_active: true,
            });
            setShowProductDialog(false);
        }
    };

    const handleRemoveProduct = (index: number) => {
        setData('products', data.products.filter((_, i) => i !== index));
    };

    const handleAddFromDatabase = (product: any) => {
        const productData: Product = {
            id: product.id,
            name: product.name,
            price: product.sale_price || product.price,
            description: product.short_description || product.description || '',
            purchase_link: '',
            is_active: true,
        };
        setData('products', [...data.products, productData]);
    };

    const getSelectedAssistant = () => {
        return aiAssistantTypes.find(type => type.code === selectedType);
    };

    const getIcon = (iconName: string | null) => {
        if (!iconName) return MessageCircle;
        return ICON_MAP[iconName] || MessageCircle;
    };

    return (
        <UserLayout>
            <Head title="Buat Sesi WhatsApp Baru" />

            <div className="space-y-6">
                {/* Header */}
                <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-6 border">
                    <div className="absolute inset-0 bg-grid-white/10 [mask-image:radial-gradient(white,transparent_85%)]" />
                    <div className="relative flex items-center gap-4">
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={() => router.visit('/user/whatsapp')}
                            className="bg-background"
                        >
                            <ArrowLeft className="size-4" />
                        </Button>
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight text-foreground">Buat Sesi WhatsApp Baru</h1>
                            <p className="text-muted-foreground mt-1">
                                Tambahkan sesi WhatsApp baru untuk bisnis Anda
                            </p>
                        </div>
                    </div>
                </div>

                {/* Form */}
                <Card className="overflow-hidden border-2">
                    <div className="h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />
                    <CardHeader>
                        <CardTitle>Informasi Sesi</CardTitle>
                        <CardDescription>
                            Masukkan detail untuk sesi WhatsApp baru Anda
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="phone_number">Nomor Telepon</Label>
                                <Input
                                    id="phone_number"
                                    type="tel"
                                    placeholder="Contoh: 628123456789"
                                    value={data.phone_number}
                                    onChange={(e) => setData('phone_number', e.target.value)}
                                    required
                                />
                                {errors.phone_number && (
                                    <p className="text-sm text-destructive">{errors.phone_number}</p>
                                )}
                                <p className="text-sm text-muted-foreground">
                                    Format: 628XXXXXXXXX (tanpa tanda + atau spasi)
                                </p>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="name">Nama Sesi</Label>
                                <Input
                                    id="name"
                                    type="text"
                                    placeholder="Contoh: WhatsApp Bisnis Utama"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    required
                                />
                                {errors.name && (
                                    <p className="text-sm text-destructive">{errors.name}</p>
                                )}
                                <p className="text-sm text-muted-foreground">
                                    Nama yang mudah diingat untuk sesi ini
                                </p>
                            </div>

                            {/* AI Configuration */}
                            <div className="space-y-4">
                                <Label>Konfigurasi AI Assistant</Label>

                                <Tabs value={data.creation_method} onValueChange={(v) => setData('creation_method', v as 'manual' | 'ai')}>
                                    <TabsList className="grid w-full grid-cols-2">
                                        <TabsTrigger value="manual">Manual</TabsTrigger>
                                        <TabsTrigger value="ai">AI</TabsTrigger>
                                    </TabsList>

                                    <TabsContent value="manual" className="space-y-4 mt-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="ai_assistant_type">Tipe AI Assistant</Label>
                                            <Select value={selectedType} onValueChange={handleTypeChange}>
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {aiAssistantTypes.map((type) => {
                                                        const Icon = getIcon(type.icon);
                                                        return (
                                                            <SelectItem key={type.code} value={type.code}>
                                                                <div className="flex items-center gap-2">
                                                                    <Icon className={`size-4 ${type.color || 'text-gray-600'}`} />
                                                                    <span>{type.name}</span>
                                                                </div>
                                                            </SelectItem>
                                                        );
                                                    })}
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="communication_tone_manual">Gaya Komunikasi</Label>
                                            <Select value={data.communication_tone} onValueChange={(v) => setData('communication_tone', v)}>
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="professional">Professional</SelectItem>
                                                    <SelectItem value="friendly">Friendly</SelectItem>
                                                    <SelectItem value="casual">Casual</SelectItem>
                                                    <SelectItem value="formal">Formal</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="primary_language_manual">Bahasa Utama</Label>
                                            <Select value={data.primary_language} onValueChange={(v) => setData('primary_language', v)}>
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="id">Bahasa Indonesia</SelectItem>
                                                    <SelectItem value="en">English</SelectItem>
                                                    <SelectItem value="both">Keduanya (Indonesia & English)</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="ai_description_manual">Deskripsi Tambahan (Opsional)</Label>
                                            <Textarea
                                                id="ai_description_manual"
                                                placeholder="Tambahkan informasi spesifik tentang bisnis Anda, aturan khusus, atau hal lain yang ingin AI ketahui..."
                                                value={data.ai_description}
                                                onChange={(e) => setData('ai_description', e.target.value)}
                                                rows={3}
                                                className="resize-none"
                                            />
                                            <p className="text-xs text-muted-foreground">
                                                Informasi tambahan untuk memperkaya knowledge AI agent Anda
                                            </p>
                                        </div>
                                    </TabsContent>

                                    <TabsContent value="ai" className="space-y-4 mt-4">
                                        <div className="space-y-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="agent_category">Kategori Agen</Label>
                                                <Select value={data.agent_category} onValueChange={(v) => setData('agent_category', v)}>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Pilih Kategori" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="customer-service">Customer Service</SelectItem>
                                                        <SelectItem value="sales">Sales Agent</SelectItem>
                                                        <SelectItem value="support">Technical Support</SelectItem>
                                                        <SelectItem value="general">General Assistant</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="communication_tone">Gaya Komunikasi</Label>
                                                <Select value={data.communication_tone} onValueChange={(v) => setData('communication_tone', v)}>
                                                    <SelectTrigger>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="professional">Professional</SelectItem>
                                                        <SelectItem value="friendly">Friendly</SelectItem>
                                                        <SelectItem value="casual">Casual</SelectItem>
                                                        <SelectItem value="formal">Formal</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="primary_language">Bahasa Utama</Label>
                                                <Select value={data.primary_language} onValueChange={(v) => setData('primary_language', v)}>
                                                    <SelectTrigger>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="id">Bahasa Indonesia</SelectItem>
                                                        <SelectItem value="en">English</SelectItem>
                                                        <SelectItem value="both">Keduanya (Indonesia & English)</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="ai_description">Deskripsi & Aturan AI Agent</Label>
                                                <Textarea
                                                    id="ai_description"
                                                    placeholder="Jelaskan peran, tanggung jawab, dan perilaku yang dibutuhkan untuk AI agent Anda..."
                                                    value={data.ai_description}
                                                    onChange={(e) => setData('ai_description', e.target.value)}
                                                    rows={4}
                                                    className="resize-none"
                                                />
                                                <p className="text-xs text-muted-foreground">
                                                    Ini akan digunakan sebagai base prompt untuk mendefinisikan perilaku dan pedoman AI agent Anda
                                                </p>
                                            </div>
                                        </div>
                                    </TabsContent>
                                </Tabs>
                            </div>

                            {/* Products Information */}
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <Label>Informasi Produk</Label>
                                    <Button
                                        type="button"
                                        size="sm"
                                        onClick={() => setShowProductDialog(true)}
                                        className="h-8"
                                    >
                                        <Plus className="size-3 mr-1" />
                                        Tambah Produk
                                    </Button>
                                </div>

                                {data.products.length > 0 ? (
                                    <div className="space-y-2">
                                        {data.products.map((product, index) => (
                                            <Card key={index} className="p-3">
                                                <div className="flex items-start justify-between gap-3">
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <h4 className="font-semibold text-sm">{product.name}</h4>
                                                            <Badge variant="outline" className="text-xs">
                                                                Rp {product.price.toLocaleString('id-ID')}
                                                            </Badge>
                                                        </div>
                                                        {product.description && (
                                                            <p className="text-xs text-muted-foreground mb-2">
                                                                {product.description}
                                                            </p>
                                                        )}
                                                        {product.purchase_link && (
                                                            <div className="flex items-center gap-1 text-xs text-blue-600">
                                                                <LinkIcon className="size-3" />
                                                                <span className="truncate">{product.purchase_link}</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleRemoveProduct(index)}
                                                        className="h-8 w-8 p-0"
                                                    >
                                                        <X className="size-4" />
                                                    </Button>
                                                </div>
                                            </Card>
                                        ))}
                                    </div>
                                ) : (
                                    <Card className="p-6">
                                        <div className="flex flex-col items-center justify-center text-center">
                                            <Package className="size-8 text-muted-foreground mb-2" />
                                            <p className="text-sm text-muted-foreground">
                                                Belum ada produk. Klik "Tambah Produk" untuk mulai menambahkan.
                                            </p>
                                        </div>
                                    </Card>
                                )}
                            </div>

                            <div className="flex gap-2">
                                <Button type="submit" disabled={processing}>
                                    {processing ? 'Membuat...' : 'Buat Sesi'}
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => router.visit('/user/whatsapp')}
                                >
                                    Batal
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>

                {/* Info Card */}
                <Card>
                    <CardHeader>
                        <CardTitle>Langkah Selanjutnya</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
                            <li>Setelah membuat sesi, Anda akan mendapatkan QR code</li>
                            <li>Scan QR code menggunakan WhatsApp di ponsel Anda</li>
                            <li>Tunggu hingga status berubah menjadi "Terhubung"</li>
                            <li>Sesi WhatsApp Anda siap digunakan!</li>
                        </ol>
                    </CardContent>
                </Card>
            </div>

            {/* Add Product Dialog */}
            <Dialog open={showProductDialog} onOpenChange={setShowProductDialog}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Tambah Produk</DialogTitle>
                        <DialogDescription>
                            Tambahkan informasi produk secara manual atau pilih dari katalog Anda
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        {/* Select from Database */}
                        {products && products.length > 0 && (
                            <div className="space-y-2">
                                <Label>Pilih dari Katalog</Label>
                                <div className="max-h-40 overflow-y-auto space-y-1 border rounded-md p-2">
                                    {products.filter(p => !data.products.find(dp => dp.id === p.id)).map((product) => (
                                        <Button
                                            key={product.id}
                                            type="button"
                                            variant="ghost"
                                            className="w-full justify-start h-auto py-2"
                                            onClick={() => {
                                                handleAddFromDatabase(product);
                                                setShowProductDialog(false);
                                            }}
                                        >
                                            <div className="text-left">
                                                <p className="font-medium text-sm">{product.name}</p>
                                                <p className="text-xs text-muted-foreground">
                                                    Rp {(product.sale_price || product.price).toLocaleString('id-ID')}
                                                </p>
                                            </div>
                                        </Button>
                                    ))}
                                </div>
                                <div className="relative">
                                    <div className="absolute inset-0 flex items-center">
                                        <span className="w-full border-t" />
                                    </div>
                                    <div className="relative flex justify-center text-xs uppercase">
                                        <span className="bg-background px-2 text-muted-foreground">Atau tambah manual</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Manual Input */}
                        <div className="space-y-3">
                            <div className="space-y-2">
                                <Label htmlFor="product_name">Nama Produk</Label>
                                <Input
                                    id="product_name"
                                    placeholder="Masukkan nama produk"
                                    value={newProduct.name}
                                    onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="product_price">Harga</Label>
                                <div className="flex items-center gap-2">
                                    <span className="text-sm text-muted-foreground">Rp</span>
                                    <Input
                                        id="product_price"
                                        type="text"
                                        placeholder="Masukkan harga"
                                        value={newProduct.price ? newProduct.price.toLocaleString('id-ID') : ''}
                                        onChange={(e) => {
                                            // Remove all non-digit characters and convert to number
                                            const rawValue = e.target.value.replace(/\D/g, '');
                                            setNewProduct({ ...newProduct, price: rawValue ? Number(rawValue) : 0 });
                                        }}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="product_description">Deskripsi</Label>
                                <Textarea
                                    id="product_description"
                                    placeholder="Masukkan deskripsi produk, fitur, dan manfaat"
                                    value={newProduct.description}
                                    onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                                    rows={3}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="product_link">Link Pembelian</Label>
                                <div className="flex items-center gap-2">
                                    <LinkIcon className="size-4 text-muted-foreground" />
                                    <Input
                                        id="product_link"
                                        type="url"
                                        placeholder="https://..."
                                        value={newProduct.purchase_link}
                                        onChange={(e) => setNewProduct({ ...newProduct, purchase_link: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="product_active"
                                    checked={newProduct.is_active}
                                    onCheckedChange={(checked) => setNewProduct({ ...newProduct, is_active: checked as boolean })}
                                />
                                <label
                                    htmlFor="product_active"
                                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                >
                                    Produk Aktif
                                </label>
                            </div>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setShowProductDialog(false)}>
                            Batal
                        </Button>
                        <Button type="button" onClick={handleAddProduct}>
                            Tambah Produk
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </UserLayout>
    );
}
