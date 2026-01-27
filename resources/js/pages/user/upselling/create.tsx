import { Head, useForm, Link } from '@inertiajs/react';
import UserLayout from '@/layouts/user/user-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { ArrowLeft, Save } from 'lucide-react';
import { toast } from 'sonner';

interface Product {
    id: number;
    name: string;
    price: number;
}

interface Template {
    id: number;
    name: string;
    content: string;
}

interface Props {
    user: any;
    products: Product[];
    templates: Template[];
}

export default function UpSellingCreate({ user, products = [], templates = [] }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        product_id: '',
        trigger_type: 'after_purchase',
        message: 'Halo {name}, terima kasih sudah berbelanja! 🎉\n\nKami punya penawaran spesial untuk Anda:\n{product} dengan diskon {discount}%\n\nBerlaku sampai {valid_until}\n\nMau ambil kesempatan ini?',
        discount_percentage: 10,
        valid_until: '',
        is_active: true,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('user.upselling.store'), {
            onSuccess: () => {
                toast.success('Campaign up selling berhasil dibuat!');
            },
            onError: () => {
                toast.error('Gagal membuat campaign. Periksa kembali form Anda.');
            },
        });
    };

    return (
        <UserLayout>
            <Head title="Buat Campaign Up Selling" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Link href={route('user.upselling.index')}>
                        <Button variant="outline" size="icon">
                            <ArrowLeft className="size-4" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Buat Campaign Up Selling</h1>
                        <p className="text-muted-foreground mt-1">
                            Buat campaign untuk meningkatkan penjualan produk Anda
                        </p>
                    </div>
                </div>

                <form onSubmit={handleSubmit}>
                    <Card>
                        <CardHeader>
                            <CardTitle>Detail Campaign</CardTitle>
                            <CardDescription>
                                Isi informasi campaign up selling Anda
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Campaign Name */}
                            <div className="space-y-2">
                                <Label htmlFor="name">
                                    Nama Campaign <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="name"
                                    placeholder="Misal: Promo Bundle Produk A + B"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    required
                                />
                                {errors.name && (
                                    <p className="text-sm text-red-500">{errors.name}</p>
                                )}
                            </div>

                            {/* Product */}
                            <div className="space-y-2">
                                <Label htmlFor="product">
                                    Produk <span className="text-red-500">*</span>
                                </Label>
                                <Select value={data.product_id.toString()} onValueChange={(value) => setData('product_id', value)}>
                                    <SelectTrigger id="product">
                                        <SelectValue placeholder="Pilih produk untuk up selling" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {products.length > 0 ? (
                                            products.map((product) => (
                                                <SelectItem key={product.id} value={product.id.toString()}>
                                                    {product.name} - Rp {product.price.toLocaleString('id-ID')}
                                                </SelectItem>
                                            ))
                                        ) : (
                                            <SelectItem value="0" disabled>
                                                Belum ada produk
                                            </SelectItem>
                                        )}
                                    </SelectContent>
                                </Select>
                                {errors.product_id && (
                                    <p className="text-sm text-red-500">{errors.product_id}</p>
                                )}
                                <p className="text-sm text-muted-foreground">
                                    Produk yang akan ditawarkan dalam campaign ini
                                </p>
                            </div>

                            {/* Trigger Type */}
                            <div className="space-y-2">
                                <Label htmlFor="trigger">
                                    Trigger Type <span className="text-red-500">*</span>
                                </Label>
                                <Select value={data.trigger_type} onValueChange={(value) => setData('trigger_type', value)}>
                                    <SelectTrigger id="trigger">
                                        <SelectValue placeholder="Pilih trigger type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="after_purchase">Setelah Pembelian</SelectItem>
                                        <SelectItem value="cart_abandonment">Keranjang Ditinggalkan</SelectItem>
                                        <SelectItem value="browsing">Sedang Browsing Produk</SelectItem>
                                    </SelectContent>
                                </Select>
                                <p className="text-sm text-muted-foreground">
                                    Kapan campaign ini akan dikirim kepada pelanggan
                                </p>
                            </div>

                            {/* Discount */}
                            <div className="space-y-2">
                                <Label htmlFor="discount">Diskon (%)</Label>
                                <Input
                                    id="discount"
                                    type="number"
                                    min="0"
                                    max="100"
                                    placeholder="10"
                                    value={data.discount_percentage}
                                    onChange={(e) => setData('discount_percentage', parseInt(e.target.value) || 0)}
                                />
                                <p className="text-sm text-muted-foreground">
                                    Persentase diskon yang ditawarkan (0-100%)
                                </p>
                            </div>

                            {/* Valid Until */}
                            <div className="space-y-2">
                                <Label htmlFor="valid_until">Berlaku Sampai</Label>
                                <Input
                                    id="valid_until"
                                    type="datetime-local"
                                    value={data.valid_until}
                                    onChange={(e) => setData('valid_until', e.target.value)}
                                />
                                <p className="text-sm text-muted-foreground">
                                    Batas waktu penawaran (opsional)
                                </p>
                            </div>

                            {/* Message */}
                            <div className="space-y-2">
                                <Label htmlFor="message">
                                    Pesan Campaign <span className="text-red-500">*</span>
                                </Label>
                                <Textarea
                                    id="message"
                                    placeholder="Masukkan pesan campaign..."
                                    value={data.message}
                                    onChange={(e) => setData('message', e.target.value)}
                                    rows={8}
                                    required
                                />
                                {errors.message && (
                                    <p className="text-sm text-red-500">{errors.message}</p>
                                )}
                                <div className="text-sm text-muted-foreground space-y-1">
                                    <p>Variabel yang tersedia:</p>
                                    <ul className="list-disc list-inside ml-2">
                                        <li>{'{name}'} - Nama pelanggan</li>
                                        <li>{'{product}'} - Nama produk</li>
                                        <li>{'{discount}'} - Persentase diskon</li>
                                        <li>{'{valid_until}'} - Tanggal berakhir penawaran</li>
                                    </ul>
                                </div>
                            </div>

                            {/* Active Status */}
                            <div className="flex items-center justify-between rounded-lg border p-4">
                                <div className="space-y-0.5">
                                    <Label>Status Campaign</Label>
                                    <p className="text-sm text-muted-foreground">
                                        Aktifkan campaign setelah dibuat
                                    </p>
                                </div>
                                <Switch
                                    checked={data.is_active}
                                    onCheckedChange={(checked) => setData('is_active', checked)}
                                />
                            </div>

                            {/* Action Buttons */}
                            <div className="flex justify-end gap-2 pt-4 border-t">
                                <Link href={route('user.upselling.index')}>
                                    <Button variant="outline" type="button">
                                        Batal
                                    </Button>
                                </Link>
                                <Button type="submit" disabled={processing} className="gap-2">
                                    <Save className="size-4" />
                                    {processing ? 'Menyimpan...' : 'Simpan Campaign'}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </form>
            </div>
        </UserLayout>
    );
}
