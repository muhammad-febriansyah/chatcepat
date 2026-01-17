import { Head, Link } from '@inertiajs/react';
import UserLayout from '@/layouts/user/user-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { useState } from 'react';
import {
    Bot,
    Save,
    MessageCircle,
    TrendingUp,
    Headphones,
    Settings as SettingsIcon,
    Sparkles,
    TestTube,
    Zap,
    Shield,
    Clock,
    Sliders,
    Send,
    User,
    CheckCircle2,
    XCircle,
    Info,
    Wifi,
    WifiOff,
    HelpCircle,
    ChevronRight,
    RefreshCw,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';

const ICON_MAP: Record<string, LucideIcon> = {
    TrendingUp,
    Headphones,
    Settings: SettingsIcon,
    MessageCircle,
    Bot,
};

interface WhatsappSession {
    id: number;
    session_id: string;
    name: string;
    phone_number: string | null;
    status: string;
    ai_assistant_type: string;
    settings: {
        autoReplyEnabled?: boolean;
        customSystemPrompt?: string;
        temperature?: number;
        maxTokens?: number;
        responseDelay?: number;
        blacklist?: string[];
        whitelist?: string[];
    } | null;
}

interface AiAssistantType {
    id: number;
    code: string;
    name: string;
    description: string;
    icon: string | null;
    color: string | null;
}

interface Props {
    sessions: WhatsappSession[];
    aiAssistantTypes: AiAssistantType[];
}

export default function ChatbotIndex({ sessions, aiAssistantTypes }: Props) {
    const [selectedSession, setSelectedSession] = useState<WhatsappSession | null>(
        sessions.length > 0 ? sessions[0] : null
    );
    const [saving, setSaving] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);
    const [testing, setTesting] = useState(false);
    const [testMessage, setTestMessage] = useState('');
    const [testResponse, setTestResponse] = useState('');

    // Form state
    const [aiType, setAiType] = useState(selectedSession?.ai_assistant_type || 'general');
    const [autoReplyEnabled, setAutoReplyEnabled] = useState(
        selectedSession?.settings?.autoReplyEnabled ?? true
    );
    const [customPrompt, setCustomPrompt] = useState(
        selectedSession?.settings?.customSystemPrompt || ''
    );
    const [temperature, setTemperature] = useState(
        selectedSession?.settings?.temperature?.toString() || '0.7'
    );
    const [maxTokens, setMaxTokens] = useState(
        selectedSession?.settings?.maxTokens?.toString() || '500'
    );
    const [responseDelay, setResponseDelay] = useState(
        selectedSession?.settings?.responseDelay?.toString() || '0'
    );
    const [blacklist, setBlacklist] = useState(
        selectedSession?.settings?.blacklist?.join(', ') || ''
    );
    const [whitelist, setWhitelist] = useState(
        selectedSession?.settings?.whitelist?.join(', ') || ''
    );

    const handleSessionChange = (sessionId: string) => {
        const session = sessions.find((s) => s.id.toString() === sessionId);
        if (session) {
            setSelectedSession(session);
            setAiType(session.ai_assistant_type);
            setAutoReplyEnabled(session.settings?.autoReplyEnabled ?? true);
            setCustomPrompt(session.settings?.customSystemPrompt || '');
            setTemperature(session.settings?.temperature?.toString() || '0.7');
            setMaxTokens(session.settings?.maxTokens?.toString() || '500');
            setResponseDelay(session.settings?.responseDelay?.toString() || '0');
            setBlacklist(session.settings?.blacklist?.join(', ') || '');
            setWhitelist(session.settings?.whitelist?.join(', ') || '');
            setTestResponse('');
            setSaveSuccess(false);
        }
    };

    const handleSave = async () => {
        if (!selectedSession) return;

        setSaving(true);
        setSaveSuccess(false);
        try {
            const response = await fetch(`/user/chatbot/${selectedSession.id}/settings`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN':
                        document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.content || '',
                },
                body: JSON.stringify({
                    ai_assistant_type: aiType,
                    auto_reply_enabled: autoReplyEnabled,
                    custom_system_prompt: customPrompt,
                    temperature: parseFloat(temperature),
                    max_tokens: parseInt(maxTokens),
                    response_delay: parseInt(responseDelay),
                    blacklist: blacklist.split(',').map((s) => s.trim()).filter(Boolean),
                    whitelist: whitelist.split(',').map((s) => s.trim()).filter(Boolean),
                }),
            });

            const data = await response.json();
            if (data.success) {
                setSaveSuccess(true);
                setTimeout(() => setSaveSuccess(false), 3000);
            } else {
                alert(data.message || 'Gagal menyimpan pengaturan');
            }
        } catch (error) {
            console.error('Error saving settings:', error);
            alert('Gagal menyimpan pengaturan');
        } finally {
            setSaving(false);
        }
    };

    const handleTest = async () => {
        if (!selectedSession || !testMessage.trim()) return;

        setTesting(true);
        setTestResponse('');
        try {
            const response = await fetch(`/user/chatbot/${selectedSession.id}/test`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN':
                        document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.content || '',
                },
                body: JSON.stringify({
                    message: testMessage,
                }),
            });

            const data = await response.json();
            if (data.success) {
                setTestResponse(data.data.response);
            } else {
                setTestResponse('Error: ' + (data.message || 'Gagal test chatbot'));
            }
        } catch (error) {
            console.error('Error testing chatbot:', error);
            setTestResponse('Error: Gagal test chatbot');
        } finally {
            setTesting(false);
        }
    };

    const getIcon = (iconName: string | null) => {
        if (!iconName) return MessageCircle;
        return ICON_MAP[iconName] || MessageCircle;
    };

    const selectedAiType = aiAssistantTypes.find((t) => t.code === aiType);
    const connectedSessions = sessions.filter(s => s.status === 'connected');

    return (
        <UserLayout>
            <Head title="Chatbot AI" />
            <TooltipProvider>
                <div className="space-y-6">
                    {/* Header */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-primary/10">
                                    <Bot className="size-7 text-primary" />
                                </div>
                                Chatbot AI
                            </h1>
                            <p className="text-muted-foreground mt-2">
                                Atur chatbot AI untuk membalas pesan WhatsApp secara otomatis
                            </p>
                        </div>
                        {selectedSession && (
                            <div className="flex items-center gap-2">
                                <Badge
                                    variant={autoReplyEnabled ? 'default' : 'secondary'}
                                    className={cn(
                                        "px-3 py-1",
                                        autoReplyEnabled && "bg-green-500 hover:bg-green-600"
                                    )}
                                >
                                    {autoReplyEnabled ? (
                                        <>
                                            <Zap className="size-3 mr-1" />
                                            Auto-Reply Aktif
                                        </>
                                    ) : (
                                        <>
                                            <XCircle className="size-3 mr-1" />
                                            Auto-Reply Nonaktif
                                        </>
                                    )}
                                </Badge>
                            </div>
                        )}
                    </div>

                    {/* No Sessions Alert */}
                    {sessions.length === 0 ? (
                        <Alert>
                            <WifiOff className="h-4 w-4" />
                            <AlertTitle>Tidak Ada Sesi WhatsApp</AlertTitle>
                            <AlertDescription>
                                Anda perlu menghubungkan WhatsApp terlebih dahulu untuk menggunakan chatbot AI.
                                <div className="mt-4">
                                    <Link href="/user/whatsapp">
                                        <Button size="sm">
                                            <Wifi className="size-4 mr-2" />
                                            Hubungkan WhatsApp
                                        </Button>
                                    </Link>
                                </div>
                            </AlertDescription>
                        </Alert>
                    ) : (
                        <>
                            {/* Quick Guide */}
                            <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
                                <CardContent className="pt-6">
                                    <div className="flex flex-col md:flex-row items-start gap-6">
                                        <div className="flex items-center justify-center size-12 rounded-full bg-primary/10 flex-shrink-0">
                                            <HelpCircle className="size-6 text-primary" />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-semibold text-lg mb-2">Cara Menggunakan Chatbot AI</h3>
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                                <div className="flex items-start gap-2">
                                                    <div className="size-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold flex-shrink-0">1</div>
                                                    <div>
                                                        <p className="font-medium">Pilih Sesi WhatsApp</p>
                                                        <p className="text-muted-foreground">Pilih nomor WA yang akan menggunakan chatbot</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-start gap-2">
                                                    <div className="size-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold flex-shrink-0">2</div>
                                                    <div>
                                                        <p className="font-medium">Pilih Tipe AI</p>
                                                        <p className="text-muted-foreground">Tentukan kepribadian chatbot (CS, Sales, dll)</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-start gap-2">
                                                    <div className="size-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold flex-shrink-0">3</div>
                                                    <div>
                                                        <p className="font-medium">Aktifkan Auto-Reply</p>
                                                        <p className="text-muted-foreground">Simpan dan chatbot siap membalas otomatis</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Session Selector */}
                            <Card>
                                <CardHeader className="pb-3">
                                    <div className="flex items-center gap-2">
                                        <MessageCircle className="size-5 text-primary" />
                                        <CardTitle>Pilih Sesi WhatsApp</CardTitle>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                        {sessions.map((session) => (
                                            <button
                                                key={session.id}
                                                onClick={() => handleSessionChange(session.id.toString())}
                                                className={cn(
                                                    "p-4 rounded-lg border-2 text-left transition-all hover:shadow-md",
                                                    selectedSession?.id === session.id
                                                        ? "border-primary bg-primary/5"
                                                        : "border-border hover:border-primary/50"
                                                )}
                                            >
                                                <div className="flex items-start justify-between gap-2">
                                                    <div className="flex items-center gap-3">
                                                        <div className={cn(
                                                            "size-10 rounded-full flex items-center justify-center",
                                                            session.status === 'connected'
                                                                ? "bg-green-100 text-green-600"
                                                                : "bg-gray-100 text-gray-400"
                                                        )}>
                                                            <MessageCircle className="size-5" />
                                                        </div>
                                                        <div>
                                                            <p className="font-semibold">{session.name}</p>
                                                            <p className="text-sm text-muted-foreground">
                                                                {session.phone_number || 'No phone'}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    {selectedSession?.id === session.id && (
                                                        <CheckCircle2 className="size-5 text-primary" />
                                                    )}
                                                </div>
                                                <div className="mt-3 flex items-center gap-2">
                                                    <Badge
                                                        variant={session.status === 'connected' ? 'default' : 'secondary'}
                                                        className={cn(
                                                            "text-xs",
                                                            session.status === 'connected' && "bg-green-500"
                                                        )}
                                                    >
                                                        {session.status === 'connected' ? (
                                                            <>
                                                                <Wifi className="size-3 mr-1" />
                                                                Terhubung
                                                            </>
                                                        ) : (
                                                            <>
                                                                <WifiOff className="size-3 mr-1" />
                                                                {session.status}
                                                            </>
                                                        )}
                                                    </Badge>
                                                    {session.settings?.autoReplyEnabled && (
                                                        <Badge variant="outline" className="text-xs">
                                                            <Bot className="size-3 mr-1" />
                                                            AI Aktif
                                                        </Badge>
                                                    )}
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Configuration */}
                            {selectedSession && (
                                <Tabs defaultValue="basic" className="space-y-4">
                                    <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
                                        <TabsTrigger value="basic" className="gap-2">
                                            <Bot className="size-4" />
                                            <span className="hidden sm:inline">Dasar</span>
                                        </TabsTrigger>
                                        <TabsTrigger value="advanced" className="gap-2">
                                            <Sliders className="size-4" />
                                            <span className="hidden sm:inline">Lanjutan</span>
                                        </TabsTrigger>
                                        <TabsTrigger value="test" className="gap-2">
                                            <TestTube className="size-4" />
                                            <span className="hidden sm:inline">Test</span>
                                        </TabsTrigger>
                                    </TabsList>

                                    {/* Basic Settings Tab */}
                                    <TabsContent value="basic" className="space-y-6">
                                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                            {/* Auto Reply Card */}
                                            <Card>
                                                <CardHeader>
                                                    <CardTitle className="flex items-center gap-2">
                                                        <Zap className="size-5 text-yellow-500" />
                                                        Auto-Reply
                                                    </CardTitle>
                                                    <CardDescription>
                                                        Aktifkan untuk membalas pesan WhatsApp secara otomatis
                                                    </CardDescription>
                                                </CardHeader>
                                                <CardContent>
                                                    <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                                                        <div className="flex items-center gap-3">
                                                            <div className={cn(
                                                                "size-12 rounded-full flex items-center justify-center transition-colors",
                                                                autoReplyEnabled
                                                                    ? "bg-green-100 text-green-600"
                                                                    : "bg-gray-100 text-gray-400"
                                                            )}>
                                                                {autoReplyEnabled ? (
                                                                    <Zap className="size-6" />
                                                                ) : (
                                                                    <XCircle className="size-6" />
                                                                )}
                                                            </div>
                                                            <div>
                                                                <p className="font-semibold">
                                                                    {autoReplyEnabled ? 'Auto-Reply Aktif' : 'Auto-Reply Nonaktif'}
                                                                </p>
                                                                <p className="text-sm text-muted-foreground">
                                                                    {autoReplyEnabled
                                                                        ? 'Chatbot akan membalas pesan masuk'
                                                                        : 'Pesan masuk tidak akan dibalas otomatis'}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <Switch
                                                            checked={autoReplyEnabled}
                                                            onCheckedChange={setAutoReplyEnabled}
                                                            className="scale-125"
                                                        />
                                                    </div>
                                                </CardContent>
                                            </Card>

                                            {/* AI Type Card */}
                                            <Card>
                                                <CardHeader>
                                                    <CardTitle className="flex items-center gap-2">
                                                        <Sparkles className="size-5 text-purple-500" />
                                                        Tipe AI Assistant
                                                    </CardTitle>
                                                    <CardDescription>
                                                        Pilih kepribadian chatbot sesuai kebutuhan bisnis Anda
                                                    </CardDescription>
                                                </CardHeader>
                                                <CardContent>
                                                    <Select value={aiType} onValueChange={setAiType}>
                                                        <SelectTrigger className="h-auto">
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {aiAssistantTypes.map((type) => {
                                                                const Icon = getIcon(type.icon);
                                                                return (
                                                                    <SelectItem key={type.code} value={type.code}>
                                                                        <div className="flex items-center gap-3 py-1">
                                                                            <div className={cn(
                                                                                "size-8 rounded-lg flex items-center justify-center",
                                                                                type.color || 'bg-gray-100 text-gray-600'
                                                                            )}>
                                                                                <Icon className="size-4" />
                                                                            </div>
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

                                                    {/* Selected Type Preview */}
                                                    {selectedAiType && (
                                                        <div className="mt-4 p-4 rounded-lg bg-gradient-to-r from-primary/5 to-primary/10 border border-primary/20">
                                                            <div className="flex items-start gap-3">
                                                                <div className={cn(
                                                                    "size-12 rounded-xl flex items-center justify-center",
                                                                    selectedAiType.color || 'bg-gray-100 text-gray-600'
                                                                )}>
                                                                    {(() => {
                                                                        const Icon = getIcon(selectedAiType.icon);
                                                                        return <Icon className="size-6" />;
                                                                    })()}
                                                                </div>
                                                                <div className="flex-1">
                                                                    <h4 className="font-semibold">{selectedAiType.name}</h4>
                                                                    <p className="text-sm text-muted-foreground mt-1">
                                                                        {selectedAiType.description}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}
                                                </CardContent>
                                            </Card>
                                        </div>

                                        {/* Custom Prompt */}
                                        <Card>
                                            <CardHeader>
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <CardTitle className="flex items-center gap-2">
                                                            <SettingsIcon className="size-5 text-blue-500" />
                                                            Custom System Prompt
                                                            <Badge variant="outline" className="ml-2">Opsional</Badge>
                                                        </CardTitle>
                                                        <CardDescription>
                                                            Tambahkan instruksi khusus untuk chatbot (kosongkan untuk menggunakan default)
                                                        </CardDescription>
                                                    </div>
                                                    <Tooltip>
                                                        <TooltipTrigger>
                                                            <Info className="size-4 text-muted-foreground" />
                                                        </TooltipTrigger>
                                                        <TooltipContent className="max-w-xs">
                                                            <p>System prompt adalah instruksi yang diberikan ke AI tentang bagaimana harus berperilaku. Misalnya: "Kamu adalah customer service toko online yang ramah"</p>
                                                        </TooltipContent>
                                                    </Tooltip>
                                                </div>
                                            </CardHeader>
                                            <CardContent>
                                                <Textarea
                                                    placeholder="Contoh: Kamu adalah asisten customer service untuk toko fashion online bernama 'ModernStyle'. Jawab dengan ramah, gunakan bahasa Indonesia yang sopan, dan selalu tawarkan bantuan lebih lanjut..."
                                                    value={customPrompt}
                                                    onChange={(e) => setCustomPrompt(e.target.value)}
                                                    className="min-h-[120px]"
                                                />
                                                <p className="text-xs text-muted-foreground mt-2">
                                                    Tip: Sertakan nama bisnis, gaya bahasa, dan batasan topik yang boleh dibahas
                                                </p>
                                            </CardContent>
                                        </Card>

                                        {/* Save Button */}
                                        <div className="flex items-center gap-4">
                                            <Button
                                                onClick={handleSave}
                                                disabled={saving}
                                                size="lg"
                                                className="min-w-[200px]"
                                            >
                                                {saving ? (
                                                    <>
                                                        <RefreshCw className="size-4 mr-2 animate-spin" />
                                                        Menyimpan...
                                                    </>
                                                ) : (
                                                    <>
                                                        <Save className="size-4 mr-2" />
                                                        Simpan Pengaturan
                                                    </>
                                                )}
                                            </Button>
                                            {saveSuccess && (
                                                <div className="flex items-center gap-2 text-green-600">
                                                    <CheckCircle2 className="size-5" />
                                                    <span>Tersimpan!</span>
                                                </div>
                                            )}
                                        </div>
                                    </TabsContent>

                                    {/* Advanced Settings Tab */}
                                    <TabsContent value="advanced" className="space-y-6">
                                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                            {/* AI Parameters */}
                                            <Card>
                                                <CardHeader>
                                                    <CardTitle className="flex items-center gap-2">
                                                        <Sliders className="size-5 text-orange-500" />
                                                        Parameter AI
                                                    </CardTitle>
                                                    <CardDescription>
                                                        Sesuaikan perilaku AI (biarkan default jika tidak yakin)
                                                    </CardDescription>
                                                </CardHeader>
                                                <CardContent className="space-y-6">
                                                    {/* Temperature */}
                                                    <div className="space-y-3">
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex items-center gap-2">
                                                                <Label>Temperature</Label>
                                                                <Tooltip>
                                                                    <TooltipTrigger>
                                                                        <Info className="size-4 text-muted-foreground" />
                                                                    </TooltipTrigger>
                                                                    <TooltipContent className="max-w-xs">
                                                                        <p>Mengatur kreativitas AI. Nilai rendah = konsisten & fokus. Nilai tinggi = kreatif & bervariasi.</p>
                                                                    </TooltipContent>
                                                                </Tooltip>
                                                            </div>
                                                            <Badge variant="outline">{temperature}</Badge>
                                                        </div>
                                                        <Input
                                                            type="range"
                                                            min="0"
                                                            max="2"
                                                            step="0.1"
                                                            value={temperature}
                                                            onChange={(e) => setTemperature(e.target.value)}
                                                            className="cursor-pointer"
                                                        />
                                                        <div className="flex justify-between text-xs text-muted-foreground">
                                                            <span>Konsisten (0)</span>
                                                            <span>Seimbang (0.7)</span>
                                                            <span>Kreatif (2)</span>
                                                        </div>
                                                    </div>

                                                    {/* Max Tokens */}
                                                    <div className="space-y-3">
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex items-center gap-2">
                                                                <Label>Panjang Maksimal Jawaban</Label>
                                                                <Tooltip>
                                                                    <TooltipTrigger>
                                                                        <Info className="size-4 text-muted-foreground" />
                                                                    </TooltipTrigger>
                                                                    <TooltipContent className="max-w-xs">
                                                                        <p>Batasi panjang jawaban AI. 500 token ≈ 375 kata.</p>
                                                                    </TooltipContent>
                                                                </Tooltip>
                                                            </div>
                                                            <Badge variant="outline">{maxTokens} token</Badge>
                                                        </div>
                                                        <Input
                                                            type="number"
                                                            min="50"
                                                            max="4000"
                                                            step="50"
                                                            value={maxTokens}
                                                            onChange={(e) => setMaxTokens(e.target.value)}
                                                        />
                                                    </div>

                                                    {/* Response Delay */}
                                                    <div className="space-y-3">
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex items-center gap-2">
                                                                <Label>Delay Respons</Label>
                                                                <Tooltip>
                                                                    <TooltipTrigger>
                                                                        <Info className="size-4 text-muted-foreground" />
                                                                    </TooltipTrigger>
                                                                    <TooltipContent className="max-w-xs">
                                                                        <p>Jeda sebelum membalas agar terlihat lebih natural. 0 = langsung balas.</p>
                                                                    </TooltipContent>
                                                                </Tooltip>
                                                            </div>
                                                            <Badge variant="outline">{responseDelay} ms</Badge>
                                                        </div>
                                                        <Input
                                                            type="number"
                                                            min="0"
                                                            max="10000"
                                                            step="500"
                                                            value={responseDelay}
                                                            onChange={(e) => setResponseDelay(e.target.value)}
                                                        />
                                                        <p className="text-xs text-muted-foreground">
                                                            1000 ms = 1 detik
                                                        </p>
                                                    </div>
                                                </CardContent>
                                            </Card>

                                            {/* Contact Filters */}
                                            <Card>
                                                <CardHeader>
                                                    <CardTitle className="flex items-center gap-2">
                                                        <Shield className="size-5 text-green-500" />
                                                        Filter Kontak
                                                    </CardTitle>
                                                    <CardDescription>
                                                        Atur nomor mana yang akan atau tidak akan mendapat auto-reply
                                                    </CardDescription>
                                                </CardHeader>
                                                <CardContent className="space-y-6">
                                                    {/* Blacklist */}
                                                    <div className="space-y-2">
                                                        <div className="flex items-center gap-2">
                                                            <Label className="flex items-center gap-2">
                                                                <XCircle className="size-4 text-red-500" />
                                                                Blacklist (Blokir)
                                                            </Label>
                                                        </div>
                                                        <Textarea
                                                            placeholder="628123456789, 628987654321"
                                                            value={blacklist}
                                                            onChange={(e) => setBlacklist(e.target.value)}
                                                            className="min-h-[80px]"
                                                        />
                                                        <p className="text-xs text-muted-foreground">
                                                            Nomor-nomor ini TIDAK akan mendapat auto-reply. Pisahkan dengan koma.
                                                        </p>
                                                    </div>

                                                    {/* Whitelist */}
                                                    <div className="space-y-2">
                                                        <div className="flex items-center gap-2">
                                                            <Label className="flex items-center gap-2">
                                                                <CheckCircle2 className="size-4 text-green-500" />
                                                                Whitelist (Izinkan)
                                                            </Label>
                                                        </div>
                                                        <Textarea
                                                            placeholder="628123456789, 628987654321"
                                                            value={whitelist}
                                                            onChange={(e) => setWhitelist(e.target.value)}
                                                            className="min-h-[80px]"
                                                        />
                                                        <p className="text-xs text-muted-foreground">
                                                            HANYA nomor-nomor ini yang akan mendapat auto-reply. Kosongkan untuk semua nomor.
                                                        </p>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        </div>

                                        {/* Save Button */}
                                        <div className="flex items-center gap-4">
                                            <Button
                                                onClick={handleSave}
                                                disabled={saving}
                                                size="lg"
                                                className="min-w-[200px]"
                                            >
                                                {saving ? (
                                                    <>
                                                        <RefreshCw className="size-4 mr-2 animate-spin" />
                                                        Menyimpan...
                                                    </>
                                                ) : (
                                                    <>
                                                        <Save className="size-4 mr-2" />
                                                        Simpan Pengaturan
                                                    </>
                                                )}
                                            </Button>
                                            {saveSuccess && (
                                                <div className="flex items-center gap-2 text-green-600">
                                                    <CheckCircle2 className="size-5" />
                                                    <span>Tersimpan!</span>
                                                </div>
                                            )}
                                        </div>
                                    </TabsContent>

                                    {/* Test Chatbot Tab */}
                                    <TabsContent value="test" className="space-y-6">
                                        <Card>
                                            <CardHeader>
                                                <CardTitle className="flex items-center gap-2">
                                                    <TestTube className="size-5 text-purple-500" />
                                                    Test Chatbot
                                                </CardTitle>
                                                <CardDescription>
                                                    Uji respons chatbot sebelum digunakan di WhatsApp
                                                </CardDescription>
                                            </CardHeader>
                                            <CardContent>
                                                {/* Chat Interface */}
                                                <div className="border rounded-lg overflow-hidden">
                                                    {/* Chat Header */}
                                                    <div className="bg-primary px-4 py-3 flex items-center gap-3">
                                                        <div className="size-10 rounded-full bg-white/20 flex items-center justify-center">
                                                            <Bot className="size-5 text-white" />
                                                        </div>
                                                        <div className="text-white">
                                                            <p className="font-semibold">{selectedAiType?.name || 'Chatbot AI'}</p>
                                                            <p className="text-xs opacity-80">Mode Test</p>
                                                        </div>
                                                    </div>

                                                    {/* Chat Messages */}
                                                    <div className="h-[300px] overflow-y-auto p-4 space-y-4 bg-gray-50">
                                                        {!testMessage && !testResponse && (
                                                            <div className="flex items-center justify-center h-full text-muted-foreground">
                                                                <div className="text-center">
                                                                    <MessageCircle className="size-12 mx-auto mb-2 opacity-20" />
                                                                    <p>Ketik pesan di bawah untuk menguji chatbot</p>
                                                                </div>
                                                            </div>
                                                        )}

                                                        {testMessage && (
                                                            <div className="flex justify-end">
                                                                <div className="bg-primary text-primary-foreground rounded-2xl rounded-br-sm px-4 py-2 max-w-[80%]">
                                                                    <p className="text-sm">{testMessage}</p>
                                                                </div>
                                                            </div>
                                                        )}

                                                        {testing && (
                                                            <div className="flex justify-start">
                                                                <div className="bg-white border rounded-2xl rounded-bl-sm px-4 py-2">
                                                                    <div className="flex items-center gap-2">
                                                                        <RefreshCw className="size-4 animate-spin" />
                                                                        <span className="text-sm text-muted-foreground">Mengetik...</span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        )}

                                                        {testResponse && !testing && (
                                                            <div className="flex justify-start">
                                                                <div className="bg-white border rounded-2xl rounded-bl-sm px-4 py-2 max-w-[80%]">
                                                                    <p className="text-sm whitespace-pre-wrap">{testResponse}</p>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Chat Input */}
                                                    <div className="p-4 border-t bg-white">
                                                        <div className="flex gap-2">
                                                            <Input
                                                                placeholder="Ketik pesan test..."
                                                                value={testMessage}
                                                                onChange={(e) => setTestMessage(e.target.value)}
                                                                onKeyDown={(e) => {
                                                                    if (e.key === 'Enter' && !e.shiftKey) {
                                                                        e.preventDefault();
                                                                        handleTest();
                                                                    }
                                                                }}
                                                                disabled={testing}
                                                            />
                                                            <Button
                                                                onClick={handleTest}
                                                                disabled={testing || !testMessage.trim()}
                                                            >
                                                                <Send className="size-4" />
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Test Suggestions */}
                                                <div className="mt-4">
                                                    <p className="text-sm text-muted-foreground mb-2">Coba pertanyaan:</p>
                                                    <div className="flex flex-wrap gap-2">
                                                        {[
                                                            'Halo, apa kabar?',
                                                            'Produk apa yang tersedia?',
                                                            'Berapa harganya?',
                                                            'Bagaimana cara order?',
                                                        ].map((suggestion) => (
                                                            <Button
                                                                key={suggestion}
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => setTestMessage(suggestion)}
                                                                disabled={testing}
                                                            >
                                                                {suggestion}
                                                            </Button>
                                                        ))}
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </TabsContent>
                                </Tabs>
                            )}
                        </>
                    )}
                </div>
            </TooltipProvider>
        </UserLayout>
    );
}
