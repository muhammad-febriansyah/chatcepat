import { Head, useForm } from '@inertiajs/react';
import UserLayout from '@/layouts/user/user-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MessagesSquare, Code, Eye, Settings, Copy, CheckCircle2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

interface WidgetSettings {
    enabled: boolean;
    color: string;
    position: string;
    greeting: string;
    placeholder: string;
    widget_id: number;
}

interface Props {
    user: any;
    widgetSettings: WidgetSettings;
}

export default function WidgetIndex({ user, widgetSettings }: Props) {
    const [copied, setCopied] = useState(false);

    const { data, setData, post, processing } = useForm({
        enabled: widgetSettings.enabled,
        color: widgetSettings.color,
        position: widgetSettings.position,
        greeting: widgetSettings.greeting,
        placeholder: widgetSettings.placeholder,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('user.widget.update-settings'), {
            onSuccess: () => {
                toast.success('Pengaturan widget berhasil disimpan!');
            },
            onError: () => {
                toast.error('Gagal menyimpan pengaturan widget.');
            },
        });
    };

    const generateEmbedScript = () => {
        const appUrl = window.location.origin;
        return `<!-- ChatCepat Widget -->
<script>
(function() {
    var widgetId = '${widgetSettings.widget_id}';
    var scriptEl = document.createElement('script');
    scriptEl.src = '${appUrl}/widget/' + widgetId + '/embed.js';
    scriptEl.async = true;
    document.head.appendChild(scriptEl);
})();
</script>
<!-- End ChatCepat Widget -->`;
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(generateEmbedScript());
        setCopied(true);
        toast.success('Kode berhasil disalin ke clipboard!');
        setTimeout(() => setCopied(false), 2000);
    };

    const colorPresets = [
        { name: 'WhatsApp Green', value: '#25D366' },
        { name: 'Blue', value: '#0084FF' },
        { name: 'Purple', value: '#7C3AED' },
        { name: 'Orange', value: '#F97316' },
        { name: 'Red', value: '#EF4444' },
        { name: 'Black', value: '#000000' },
    ];

    return (
        <UserLayout>
            <Head title="Widget Live Chat" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Widget Live Chat</h1>
                        <p className="text-muted-foreground mt-1">
                            Tambahkan widget live chat ke website Anda
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Badge variant={data.enabled ? 'default' : 'secondary'} className={data.enabled ? 'bg-green-500' : ''}>
                            {data.enabled ? 'Aktif' : 'Nonaktif'}
                        </Badge>
                    </div>
                </div>

                <Tabs defaultValue="settings" className="space-y-4">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="settings">
                            <Settings className="size-4 mr-2" />
                            Pengaturan
                        </TabsTrigger>
                        <TabsTrigger value="preview">
                            <Eye className="size-4 mr-2" />
                            Preview
                        </TabsTrigger>
                        <TabsTrigger value="install">
                            <Code className="size-4 mr-2" />
                            Instalasi
                        </TabsTrigger>
                    </TabsList>

                    {/* Settings Tab */}
                    <TabsContent value="settings" className="space-y-4">
                        <form onSubmit={handleSubmit}>
                            <Card>
                                <CardHeader>
                                    <CardTitle>Konfigurasi Widget</CardTitle>
                                    <CardDescription>
                                        Sesuaikan tampilan dan perilaku widget live chat Anda
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    {/* Enable/Disable */}
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-0.5">
                                            <Label>Status Widget</Label>
                                            <p className="text-sm text-muted-foreground">
                                                Aktifkan atau nonaktifkan widget di website Anda
                                            </p>
                                        </div>
                                        <Switch
                                            checked={data.enabled}
                                            onCheckedChange={(checked) => setData('enabled', checked)}
                                        />
                                    </div>

                                    {/* Color */}
                                    <div className="space-y-3">
                                        <Label>Warna Widget</Label>
                                        <div className="flex gap-2">
                                            {colorPresets.map((preset) => (
                                                <button
                                                    key={preset.value}
                                                    type="button"
                                                    className={`w-10 h-10 rounded-lg border-2 ${
                                                        data.color === preset.value
                                                            ? 'border-primary ring-2 ring-primary/20'
                                                            : 'border-transparent'
                                                    }`}
                                                    style={{ backgroundColor: preset.value }}
                                                    onClick={() => setData('color', preset.value)}
                                                    title={preset.name}
                                                />
                                            ))}
                                            <Input
                                                type="color"
                                                value={data.color}
                                                onChange={(e) => setData('color', e.target.value)}
                                                className="w-10 h-10 p-1 cursor-pointer"
                                            />
                                        </div>
                                        <p className="text-sm text-muted-foreground">
                                            Pilih warna atau gunakan custom color picker
                                        </p>
                                    </div>

                                    {/* Position */}
                                    <div className="space-y-3">
                                        <Label htmlFor="position">Posisi Widget</Label>
                                        <Select value={data.position} onValueChange={(value) => setData('position', value)}>
                                            <SelectTrigger id="position">
                                                <SelectValue placeholder="Pilih posisi widget" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="bottom-right">Kanan Bawah</SelectItem>
                                                <SelectItem value="bottom-left">Kiri Bawah</SelectItem>
                                                <SelectItem value="top-right">Kanan Atas</SelectItem>
                                                <SelectItem value="top-left">Kiri Atas</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    {/* Greeting Message */}
                                    <div className="space-y-3">
                                        <Label htmlFor="greeting">Pesan Sambutan</Label>
                                        <Textarea
                                            id="greeting"
                                            placeholder="Halo! Ada yang bisa kami bantu?"
                                            value={data.greeting}
                                            onChange={(e) => setData('greeting', e.target.value)}
                                            rows={3}
                                        />
                                        <p className="text-sm text-muted-foreground">
                                            Pesan yang ditampilkan saat widget dibuka
                                        </p>
                                    </div>

                                    {/* Placeholder */}
                                    <div className="space-y-3">
                                        <Label htmlFor="placeholder">Placeholder Input</Label>
                                        <Input
                                            id="placeholder"
                                            placeholder="Ketik pesan Anda..."
                                            value={data.placeholder}
                                            onChange={(e) => setData('placeholder', e.target.value)}
                                        />
                                        <p className="text-sm text-muted-foreground">
                                            Teks placeholder di field input pesan
                                        </p>
                                    </div>

                                    <div className="flex justify-end gap-2 pt-4">
                                        <Button type="submit" disabled={processing}>
                                            {processing ? 'Menyimpan...' : 'Simpan Pengaturan'}
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </form>
                    </TabsContent>

                    {/* Preview Tab */}
                    <TabsContent value="preview" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Preview Widget</CardTitle>
                                <CardDescription>
                                    Lihat tampilan widget dengan pengaturan saat ini
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="relative bg-gray-100 rounded-lg p-8 min-h-[500px]">
                                    {/* Simulated Widget */}
                                    <div
                                        className={`absolute ${
                                            data.position === 'bottom-right' ? 'bottom-4 right-4' :
                                            data.position === 'bottom-left' ? 'bottom-4 left-4' :
                                            data.position === 'top-right' ? 'top-4 right-4' :
                                            'top-4 left-4'
                                        }`}
                                    >
                                        {/* Widget Button */}
                                        <div
                                            className="flex items-center justify-center w-14 h-14 rounded-full shadow-lg cursor-pointer"
                                            style={{ backgroundColor: data.color }}
                                        >
                                            <MessagesSquare className="size-6 text-white" />
                                        </div>

                                        {/* Widget Popup (visible on hover) */}
                                        <div className="absolute bottom-16 right-0 w-80 bg-white rounded-lg shadow-xl border overflow-hidden">
                                            <div className="p-4 text-white" style={{ backgroundColor: data.color }}>
                                                <h3 className="font-semibold">{user.nama_bisnis || 'ChatCepat'}</h3>
                                                <p className="text-sm opacity-90">Biasanya membalas dalam beberapa menit</p>
                                            </div>
                                            <div className="p-4">
                                                <div className="bg-gray-100 rounded-lg p-3 mb-4">
                                                    <p className="text-sm">{data.greeting}</p>
                                                </div>
                                                <Input placeholder={data.placeholder} className="mb-2" />
                                                <Button className="w-full" style={{ backgroundColor: data.color }}>
                                                    Kirim
                                                </Button>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="text-center text-muted-foreground">
                                        <p className="text-lg mb-2">Simulasi Website</p>
                                        <p className="text-sm">Widget akan muncul di posisi yang Anda pilih</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Installation Tab */}
                    <TabsContent value="install" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Kode Instalasi</CardTitle>
                                <CardDescription>
                                    Copy dan paste kode berikut sebelum closing tag &lt;/head&gt; di website Anda
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="relative">
                                    <pre className="bg-gray-950 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
                                        <code>{generateEmbedScript()}</code>
                                    </pre>
                                    <Button
                                        size="sm"
                                        variant="secondary"
                                        className="absolute top-2 right-2"
                                        onClick={copyToClipboard}
                                    >
                                        {copied ? (
                                            <>
                                                <CheckCircle2 className="size-4 mr-2" />
                                                Disalin!
                                            </>
                                        ) : (
                                            <>
                                                <Copy className="size-4 mr-2" />
                                                Salin Kode
                                            </>
                                        )}
                                    </Button>
                                </div>

                                <div className="space-y-2">
                                    <h4 className="font-semibold">Langkah Instalasi:</h4>
                                    <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
                                        <li>Copy kode di atas dengan klik tombol "Salin Kode"</li>
                                        <li>Buka file HTML website Anda</li>
                                        <li>Paste kode sebelum closing tag &lt;/head&gt;</li>
                                        <li>Simpan dan upload file ke server</li>
                                        <li>Refresh halaman website untuk melihat widget</li>
                                    </ol>
                                </div>

                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                    <p className="text-sm text-blue-800">
                                        <strong>Catatan:</strong> Widget hanya akan muncul jika status widget dalam keadaan aktif.
                                        Pastikan Anda sudah mengaktifkan widget di tab Pengaturan.
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </UserLayout>
    );
}
