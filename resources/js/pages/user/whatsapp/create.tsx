import { Head, router, useForm } from '@inertiajs/react';
import UserLayout from '@/layouts/user/user-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Bot, Headphones, TrendingUp, Settings, MessageCircle, LucideIcon } from 'lucide-react';
import { FormEventHandler, useState } from 'react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

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

interface Props {
    aiAssistantTypes: AiAssistantType[];
}

export default function WhatsAppCreate({ aiAssistantTypes }: Props) {
    // Get default AI type (prefer 'general', or use first available)
    const defaultType = aiAssistantTypes.find(t => t.code === 'general')?.code
        || aiAssistantTypes[0]?.code
        || 'general';

    const { data, setData, post, processing, errors } = useForm({
        phone_number: '',
        name: '',
        ai_assistant_type: defaultType,
    });

    const [selectedType, setSelectedType] = useState(defaultType);

    const handleSubmit: FormEventHandler = (e) => {
        e.preventDefault();
        post('/user/whatsapp');
    };

    const handleTypeChange = (value: string) => {
        setSelectedType(value);
        setData('ai_assistant_type', value);
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
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => router.visit('/user/whatsapp')}
                    >
                        <ArrowLeft className="size-4" />
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Buat Sesi WhatsApp Baru</h1>
                        <p className="text-muted-foreground mt-2">
                            Tambahkan sesi WhatsApp baru untuk bisnis Anda
                        </p>
                    </div>
                </div>

                {/* Form */}
                <Card>
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

                            <div className="space-y-3">
                                <Label>Tipe AI Assistant</Label>
                                <Select value={selectedType} onValueChange={handleTypeChange}>
                                    <SelectTrigger className="h-auto">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {aiAssistantTypes.map((type) => {
                                            const Icon = getIcon(type.icon);
                                            return (
                                                <SelectItem key={type.code} value={type.code}>
                                                    <div className="flex items-start gap-3 py-1">
                                                        <Icon className={`size-5 mt-0.5 ${type.color || 'text-gray-600'}`} />
                                                        <div>
                                                            <p className="font-medium">{type.name}</p>
                                                            <p className="text-xs text-muted-foreground">
                                                                {type.description}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </SelectItem>
                                            );
                                        })}
                                    </SelectContent>
                                </Select>

                                {/* Preview Selected */}
                                {(() => {
                                    const selected = getSelectedAssistant();
                                    if (!selected) return null;
                                    const Icon = getIcon(selected.icon);
                                    return (
                                        <Card className="bg-muted/50 border-primary/20">
                                            <CardContent className="pt-4">
                                                <div className="flex items-start gap-3">
                                                    <div className={`p-2 rounded-lg bg-background ${selected.color || 'text-gray-600'}`}>
                                                        <Icon className="size-5" />
                                                    </div>
                                                    <div className="flex-1">
                                                        <h4 className="font-semibold text-sm mb-1">
                                                            {selected.name}
                                                        </h4>
                                                        <p className="text-xs text-muted-foreground">
                                                            {selected.description}
                                                        </p>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    );
                                })()}

                                <p className="text-sm text-muted-foreground">
                                    AI Assistant akan disesuaikan dengan tipe yang Anda pilih untuk memberikan respon yang lebih tepat
                                </p>
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
        </UserLayout>
    );
}
