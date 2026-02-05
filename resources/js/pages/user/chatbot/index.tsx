import { Head, Link } from '@inertiajs/react';
import { logger } from '@/utils/logger';
import axios from 'axios';
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
    Plus,
    X,
    Package,
    Link as LinkIcon,
    Upload,
    FileText,
    Download,
    Trash,
} from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';

const ICON_MAP: Record<string, LucideIcon> = {
    TrendingUp,
    Headphones,
    Settings: SettingsIcon,
    MessageCircle,
    Bot,
};

interface Product {
    name: string;
    price: number;
    description: string;
    purchase_link: string;
}

interface WhatsappSession {
    id: number;
    session_id: string;
    name: string;
    phone_number: string | null;
    status: string;
    ai_assistant_type: string;
    ai_config: {
        creation_method?: string;
        agent_category?: string;
        primary_language?: string;
        communication_tone?: string;
        ai_description?: string;
        products?: Product[];
        training_pdf_content?: string;
        training_pdf_pages?: number;
    } | null;
    settings: {
        autoReplyEnabled?: boolean;
        temperature?: number;
        maxTokens?: number;
        responseDelay?: number;
        blacklist?: string[];
        whitelist?: string[];
    } | null;
    training_pdf_path?: string | null;
    training_pdf_name?: string | null;
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
    const [primaryLanguage, setPrimaryLanguage] = useState(
        selectedSession?.ai_config?.primary_language || 'id'
    );
    const [communicationTone, setCommunicationTone] = useState(
        selectedSession?.ai_config?.communication_tone || 'professional'
    );
    const [aiDescription, setAiDescription] = useState(
        selectedSession?.ai_config?.ai_description || ''
    );
    const [products, setProducts] = useState<Product[]>(
        selectedSession?.ai_config?.products || []
    );
    const [showProductDialog, setShowProductDialog] = useState(false);
    const [newProduct, setNewProduct] = useState<Product>({
        name: '',
        price: 0,
        description: '',
        purchase_link: '',
    });
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
    const [uploadingPdf, setUploadingPdf] = useState(false);
    const [deletingPdf, setDeletingPdf] = useState(false);

    const handleSessionChange = (sessionId: string) => {
        const session = sessions.find((s) => s.id.toString() === sessionId);
        if (session) {
            setSelectedSession(session);
            setAiType(session.ai_assistant_type);
            setAutoReplyEnabled(session.settings?.autoReplyEnabled ?? true);
            setPrimaryLanguage(session.ai_config?.primary_language || 'id');
            setCommunicationTone(session.ai_config?.communication_tone || 'professional');
            setAiDescription(session.ai_config?.ai_description || '');
            setProducts(session.ai_config?.products || []);
            setTemperature(session.settings?.temperature?.toString() || '0.7');
            setMaxTokens(session.settings?.maxTokens?.toString() || '500');
            setResponseDelay(session.settings?.responseDelay?.toString() || '0');
            setBlacklist(session.settings?.blacklist?.join(', ') || '');
            setWhitelist(session.settings?.whitelist?.join(', ') || '');
            setTestResponse('');
            setSaveSuccess(false);
        }
    };

    const handleAddProduct = () => {
        if (newProduct.name && newProduct.price) {
            setProducts([...products, { ...newProduct }]);
            setNewProduct({ name: '', price: 0, description: '', purchase_link: '' });
            setShowProductDialog(false);
        }
    };

    const handleRemoveProduct = (index: number) => {
        setProducts(products.filter((_, i) => i !== index));
    };

    const handlePdfUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        if (!selectedSession || !event.target.files || !event.target.files[0]) return;

        const file = event.target.files[0];

        // Validate file type
        if (file.type !== 'application/pdf') {
            alert('File harus berformat PDF');
            return;
        }

        // Validate file size (5MB)
        if (file.size > 5 * 1024 * 1024) {
            alert('Ukuran file maksimal 5MB');
            return;
        }

        setUploadingPdf(true);
        try {
            const formData = new FormData();
            formData.append('pdf', file);

            const response = await axios.post(
                `/user/chatbot/${selectedSession.id}/upload-training-pdf`,
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                }
            );

            const data = response.data;
            if (data.success) {
                // Update selected session state
                setSelectedSession({
                    ...selectedSession,
                    training_pdf_path: data.data.pdf_path,
                    training_pdf_name: data.data.pdf_name,
                });
                alert('Training PDF berhasil diupload!');
            } else {
                alert(data.message || 'Gagal upload PDF');
            }
        } catch (error) {
            logger.error('Error uploading PDF:', error);
            alert('Gagal upload PDF');
        } finally {
            setUploadingPdf(false);
            // Reset input
            event.target.value = '';
        }
    };

    const handlePdfDelete = async () => {
        if (!selectedSession || !selectedSession.training_pdf_path) return;

        if (!confirm('Apakah Anda yakin ingin menghapus training PDF ini?')) {
            return;
        }

        setDeletingPdf(true);
        try {
            const response = await axios.delete(
                `/user/chatbot/${selectedSession.id}/delete-training-pdf`
            );

            const data = response.data;
            if (data.success) {
                // Update selected session state
                setSelectedSession({
                    ...selectedSession,
                    training_pdf_path: null,
                    training_pdf_name: null,
                });
                alert('Training PDF berhasil dihapus');
            } else {
                alert(data.message || 'Gagal hapus PDF');
            }
        } catch (error) {
            logger.error('Error deleting PDF:', error);
            alert('Gagal hapus PDF');
        } finally {
            setDeletingPdf(false);
        }
    };

    const handleSave = async () => {
        if (!selectedSession) return;

        setSaving(true);
        setSaveSuccess(false);
        try {
            const response = await axios.post(`/user/chatbot/${selectedSession.id}/settings`, {
                ai_assistant_type: aiType,
                auto_reply_enabled: autoReplyEnabled,
                primary_language: primaryLanguage,
                communication_tone: communicationTone,
                ai_description: aiDescription,
                products: products,
                temperature: parseFloat(temperature),
                max_tokens: parseInt(maxTokens),
                response_delay: parseInt(responseDelay),
                blacklist: blacklist.split(',').map((s) => s.trim()).filter(Boolean),
                whitelist: whitelist.split(',').map((s) => s.trim()).filter(Boolean),
            });
            const data = response.data;
            if (data.success) {
                setSaveSuccess(true);
                setTimeout(() => setSaveSuccess(false), 3000);
            } else {
                alert(data.message || 'Gagal menyimpan pengaturan');
            }
        } catch (error) {
            logger.error('Error saving settings:', error);
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
            const response = await axios.post(`/user/chatbot/${selectedSession.id}/test`, {
                message: testMessage,
            });
            const data = response.data;
            if (data.success) {
                setTestResponse(data.data.response);
            } else {
                setTestResponse('Error: ' + (data.message || 'Gagal test chatbot'));
            }
        } catch (error) {
            logger.error('Error testing chatbot:', error);
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
                    <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-6 border">
                        <div className="absolute inset-0 bg-grid-white/10 [mask-image:radial-gradient(white,transparent_85%)]" />
                        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div>
                                <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-3">
                                    <div className="p-2 rounded-lg bg-primary/10">
                                        <Bot className="size-7 text-primary" />
                                    </div>
                                    Chatbot AI
                                </h1>
                                <p className="text-muted-foreground mt-1">
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
                            <Card className="overflow-hidden border-2">
                                <div className="h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />
                                <CardHeader className="pb-3">
                                    <CardTitle className="flex items-center gap-2">
                                        <MessageCircle className="size-5 text-primary" />
                                        Pilih Sesi WhatsApp
                                    </CardTitle>
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

                                        {/* Behaviour & Training */}
                                        <Card>
                                            <CardHeader>
                                                <CardTitle className="flex items-center gap-2">
                                                    <SettingsIcon className="size-5 text-blue-500" />
                                                    Behaviour & Training AI
                                                </CardTitle>
                                                <CardDescription>
                                                    Atur perilaku dan pengetahuan AI agent Anda
                                                </CardDescription>
                                            </CardHeader>
                                            <CardContent className="space-y-4">
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                    <div className="space-y-2">
                                                        <Label>Bahasa Utama</Label>
                                                        <Select value={primaryLanguage} onValueChange={setPrimaryLanguage}>
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
                                                        <Label>Gaya Komunikasi</Label>
                                                        <Select value={communicationTone} onValueChange={setCommunicationTone}>
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
                                                </div>

                                                <div className="space-y-2">
                                                    <Label>Behaviour & Training AI Agent</Label>
                                                    <Textarea
                                                        placeholder="Jelaskan peran, tanggung jawab, dan perilaku yang dibutuhkan untuk AI agent Anda. Contoh: Jika ada yang bertanya apa nama perusahaannya, jawab nama perusahaan kami adalah PT Grow Indonesia yang bergerak dalam bidang teknologi..."
                                                        value={aiDescription}
                                                        onChange={(e) => setAiDescription(e.target.value)}
                                                        className="min-h-[120px]"
                                                    />
                                                    <p className="text-xs text-muted-foreground">
                                                        Ini akan digunakan sebagai base prompt untuk mendefinisikan perilaku dan pedoman AI agent Anda
                                                    </p>
                                                </div>

                                                {/* PDF Training Document */}
                                                <div className="space-y-2">
                                                    <Label className="flex items-center gap-2">
                                                        <FileText className="size-4" />
                                                        Training Document (Optional)
                                                    </Label>

                                                    {selectedSession?.training_pdf_path ? (
                                                        // Show uploaded PDF
                                                        <Card className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
                                                            <div className="space-y-3">
                                                                <div className="flex items-center justify-between">
                                                                    <div className="flex items-center gap-3">
                                                                        <div className="size-10 rounded-lg bg-green-100 flex items-center justify-center">
                                                                            <FileText className="size-5 text-green-600" />
                                                                        </div>
                                                                        <div>
                                                                            <p className="font-medium text-sm">
                                                                                {selectedSession.training_pdf_name}
                                                                            </p>
                                                                            <div className="flex items-center gap-2 mt-0.5">
                                                                                {selectedSession.ai_config?.training_pdf_pages && (
                                                                                    <Badge variant="outline" className="text-xs bg-white">
                                                                                        {selectedSession.ai_config.training_pdf_pages} halaman
                                                                                    </Badge>
                                                                                )}
                                                                                {selectedSession.ai_config?.training_pdf_content && (
                                                                                    <Badge variant="outline" className="text-xs bg-white">
                                                                                        ✅ Text extracted
                                                                                    </Badge>
                                                                                )}
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                    <div className="flex items-center gap-2">
                                                                        <a
                                                                            href={`/storage/${selectedSession.training_pdf_path}`}
                                                                            target="_blank"
                                                                            rel="noopener noreferrer"
                                                                        >
                                                                            <Button
                                                                                type="button"
                                                                                variant="outline"
                                                                                size="sm"
                                                                                className="h-8"
                                                                            >
                                                                                <Download className="size-3 mr-1" />
                                                                                Download
                                                                            </Button>
                                                                        </a>
                                                                        <Button
                                                                            type="button"
                                                                            variant="outline"
                                                                            size="sm"
                                                                            onClick={handlePdfDelete}
                                                                            disabled={deletingPdf}
                                                                            className="h-8 text-destructive hover:text-destructive"
                                                                        >
                                                                            <Trash className="size-3 mr-1" />
                                                                            {deletingPdf ? 'Menghapus...' : 'Hapus'}
                                                                        </Button>
                                                                    </div>
                                                                </div>

                                                                {/* Extracted Text Info */}
                                                                {selectedSession.ai_config?.training_pdf_content && (
                                                                    <div className="pt-2 border-t border-green-200">
                                                                        <p className="text-xs text-green-700">
                                                                            <CheckCircle2 className="size-3 inline mr-1" />
                                                                            PDF berhasil diproses. Text training ({selectedSession.ai_config.training_pdf_content.length.toLocaleString()} karakter) siap digunakan untuk AI chatbot.
                                                                        </p>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </Card>
                                                    ) : (
                                                        // Upload PDF
                                                        <div className="border-2 border-dashed rounded-lg p-6 hover:border-primary transition-colors">
                                                            <label htmlFor="pdf-upload" className="cursor-pointer">
                                                                <div className="flex flex-col items-center justify-center gap-2">
                                                                    <div className="size-12 rounded-full bg-primary/10 flex items-center justify-center">
                                                                        {uploadingPdf ? (
                                                                            <RefreshCw className="size-6 text-primary animate-spin" />
                                                                        ) : (
                                                                            <Upload className="size-6 text-primary" />
                                                                        )}
                                                                    </div>
                                                                    <div className="text-center">
                                                                        <p className="text-sm font-medium">
                                                                            {uploadingPdf ? 'Uploading...' : 'Upload PDF Training Document'}
                                                                        </p>
                                                                        <p className="text-xs text-muted-foreground mt-1">
                                                                            Klik untuk memilih file PDF (Maks 5MB)
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                                <input
                                                                    id="pdf-upload"
                                                                    type="file"
                                                                    accept="application/pdf"
                                                                    onChange={handlePdfUpload}
                                                                    disabled={uploadingPdf}
                                                                    className="hidden"
                                                                />
                                                            </label>
                                                        </div>
                                                    )}

                                                    <p className="text-xs text-muted-foreground">
                                                        Upload panduan lengkap (contoh: FAQ, product catalog, company policy) untuk training AI lebih detail
                                                    </p>
                                                </div>
                                            </CardContent>
                                        </Card>

                                        {/* Products */}
                                        <Card>
                                            <CardHeader>
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <CardTitle className="flex items-center gap-2">
                                                            <Package className="size-5 text-green-500" />
                                                            Informasi Produk
                                                        </CardTitle>
                                                        <CardDescription>
                                                            Tambahkan produk agar AI dapat menjawab pertanyaan tentang produk Anda
                                                        </CardDescription>
                                                    </div>
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
                                            </CardHeader>
                                            <CardContent>
                                                {products.length > 0 ? (
                                                    <div className="space-y-2">
                                                        {products.map((product, index) => (
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

            {/* Add Product Dialog */}
            <Dialog open={showProductDialog} onOpenChange={setShowProductDialog}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Tambah Produk</DialogTitle>
                        <DialogDescription>
                            Tambahkan informasi produk untuk AI chatbot Anda
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-3 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="cb_product_name">Nama Produk</Label>
                            <Input
                                id="cb_product_name"
                                placeholder="Masukkan nama produk"
                                value={newProduct.name}
                                onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="cb_product_price">Harga</Label>
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-muted-foreground">Rp</span>
                                <Input
                                    id="cb_product_price"
                                    type="text"
                                    placeholder="Masukkan harga"
                                    value={newProduct.price ? newProduct.price.toLocaleString('id-ID') : ''}
                                    onChange={(e) => {
                                        const rawValue = e.target.value.replace(/\D/g, '');
                                        setNewProduct({ ...newProduct, price: rawValue ? Number(rawValue) : 0 });
                                    }}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="cb_product_description">Deskripsi</Label>
                            <Textarea
                                id="cb_product_description"
                                placeholder="Masukkan deskripsi produk, fitur, dan manfaat"
                                value={newProduct.description}
                                onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                                rows={3}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="cb_product_link">Link Pembelian</Label>
                            <div className="flex items-center gap-2">
                                <LinkIcon className="size-4 text-muted-foreground" />
                                <Input
                                    id="cb_product_link"
                                    type="url"
                                    placeholder="https://..."
                                    value={newProduct.purchase_link}
                                    onChange={(e) => setNewProduct({ ...newProduct, purchase_link: e.target.value })}
                                />
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
