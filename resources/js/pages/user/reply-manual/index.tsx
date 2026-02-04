import { Head, Link } from '@inertiajs/react';
import { logger } from '@/utils/logger';
import axios from 'axios';
import UserLayout from '@/layouts/user/user-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
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
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from '@/components/ui/dialog';
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from '@/components/ui/tabs';
import { useState, useEffect, useRef } from 'react';
import { MessageCircle, Send, Search, User, Clock, CheckCheck, RefreshCw, AlertCircle, Wifi, WifiOff, ExternalLink, Pencil, Check, X, Plus, Paperclip, Image, FileText, Phone } from 'lucide-react';
import { cn } from '@/lib/utils';

interface WhatsappSession {
    id: number;
    session_id: string;
    name: string;
    phone_number: string | null;
    status: string;
}

interface Message {
    id: number;
    message_id: string;
    from_number: string;
    to_number: string;
    direction: 'incoming' | 'outgoing';
    type: string;
    content: string;
    status: string;
    is_auto_reply: boolean;
    created_at: string;
    media_metadata?: {
        url?: string;
        filename?: string;
        mimetype?: string;
    };
}

interface Conversation {
    contact_number: string;
    contact_name: string | null;
    last_message: Message | null;
    unread_count: number;
    messages: Message[];
}

interface Contact {
    id: number;
    phone_number: string;
    display_name: string | null;
    push_name: string | null;
    name: string;
    last_message_at: string | null;
}

interface Props {
    sessions: WhatsappSession[];
    allSessions?: WhatsappSession[];
}

export default function ReplyManualIndex({ sessions, allSessions }: Props) {
    const [selectedSession, setSelectedSession] = useState<number | null>(null);
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
    const [messageText, setMessageText] = useState('');
    const [loading, setLoading] = useState(false);
    const [sending, setSending] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [autoRefresh, setAutoRefresh] = useState(true);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Edit contact name
    const [editingContact, setEditingContact] = useState<string | null>(null);
    const [editingName, setEditingName] = useState('');
    const [savingContact, setSavingContact] = useState(false);

    // New conversation dialog
    const [showNewConversation, setShowNewConversation] = useState(false);
    const [contacts, setContacts] = useState<Contact[]>([]);
    const [contactSearch, setContactSearch] = useState('');
    const [loadingContacts, setLoadingContacts] = useState(false);
    const [manualNumber, setManualNumber] = useState('');
    const [manualName, setManualName] = useState('');

    // File upload
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [fileCaption, setFileCaption] = useState('');
    const [uploadingFile, setUploadingFile] = useState(false);

    // Filter protocol messages
    const isProtocolMessage = (content: string): boolean => {
        if (!content) return true;
        const protocolKeywords = [
            'protocolMessage',
            'INITIAL_SECURITY_NOTIFICATION',
            'APP_STATE_SYNC',
            'PEER_DATA_OPERATION',
            'keyId',
            'appStateSyncKeyShare',
            'type":"',
        ];
        return protocolKeywords.some(keyword => content.includes(keyword));
    };

    // Filter valid messages only
    const filterValidMessages = (messages: Message[]): Message[] => {
        return messages.filter(msg => {
            // Show text and media messages
            if (!['text', 'image', 'video', 'audio', 'document'].includes(msg.type)) return false;
            // Filter out protocol messages for text
            if (msg.type === 'text' && isProtocolMessage(msg.content)) return false;
            // Filter out empty text messages
            if (msg.type === 'text' && (!msg.content || msg.content.trim() === '')) return false;
            return true;
        });
    };

    // Load conversations when session changes
    useEffect(() => {
        if (selectedSession) {
            loadConversations();
        }
    }, [selectedSession]);

    // Auto-refresh messages every 10 seconds
    useEffect(() => {
        if (!selectedSession || !autoRefresh) return;
        const interval = setInterval(() => loadConversations(), 10000);
        return () => clearInterval(interval);
    }, [selectedSession, autoRefresh]);

    // Scroll to bottom when messages change
    useEffect(() => {
        if (selectedConversation && conversations.length > 0) {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    }, [conversations, selectedConversation]);

    // Load contacts when dialog opens
    useEffect(() => {
        if (showNewConversation && selectedSession) {
            loadContacts();
        }
    }, [showNewConversation, selectedSession]);

    const loadConversations = async () => {
        if (!selectedSession) return;
        setLoading(true);
        try {
            const response = await axios.post('/user/reply-manual/messages', {
                session_id: selectedSession
            });
            const data = response.data;
            if (data.success) {
                const filteredConversations = data.data.conversations
                    .map((conv: Conversation) => ({
                        ...conv,
                        messages: filterValidMessages(conv.messages),
                    }))
                    .filter((conv: Conversation) => conv.messages.length > 0);
                setConversations(filteredConversations);
            }
        } catch (error) {
            logger.error('Error loading conversations:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadContacts = async () => {
        if (!selectedSession) return;
        setLoadingContacts(true);
        try {
            const response = await axios.post('/user/reply-manual/contacts', {
                session_id: selectedSession,
                search: contactSearch
            });
            const data = response.data;
            if (data.success) {
                setContacts(data.data.contacts);
            }
        } catch (error) {
            logger.error('Error loading contacts:', error);
        } finally {
            setLoadingContacts(false);
        }
    };

    const handleSendMessage = async () => {
        if (!messageText.trim() || !selectedSession || !selectedConversation) return;
        setSending(true);
        try {
            const response = await axios.post('/user/reply-manual/send', {
                session_id: selectedSession,
                to_number: selectedConversation,
                message: messageText,
            });
            const data = response.data;
            if (data.success) {
                setMessageText('');
                loadConversations();
            } else {
                alert(data.message || 'Gagal mengirim pesan');
            }
        } catch (error) {
            logger.error('Error sending message:', error);
            alert('Terjadi kesalahan saat mengirim pesan');
        } finally {
            setSending(false);
        }
    };

    const handleSendMedia = async () => {
        if (!selectedFile || !selectedSession || !selectedConversation) return;
        setUploadingFile(true);
        try {
            const formData = new FormData();
            formData.append('session_id', selectedSession.toString());
            formData.append('to_number', selectedConversation);
            formData.append('file', selectedFile);
            if (fileCaption) {
                formData.append('caption', fileCaption);
            }

            const response = await axios.post('/user/reply-manual/send-media', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            const data = response.data;
            if (data.success) {
                setSelectedFile(null);
                setFileCaption('');
                loadConversations();
            } else {
                alert(data.message || 'Gagal mengirim file');
            }
        } catch (error: any) {
            logger.error('Error sending media:', error);
            alert('Terjadi kesalahan: ' + (error.message || 'Unknown error'));
        } finally {
            setUploadingFile(false);
        }
    };

    const handleSelectContact = (contact: Contact) => {
        setSelectedConversation(contact.phone_number);
        setShowNewConversation(false);

        // Add to conversations if not exists
        const exists = conversations.find(c => c.contact_number === contact.phone_number);
        if (!exists) {
            setConversations(prev => [{
                contact_number: contact.phone_number,
                contact_name: contact.name,
                last_message: null,
                unread_count: 0,
                messages: [],
            }, ...prev]);
        }
    };

    const handleStartManualConversation = () => {
        if (!manualNumber.trim()) return;

        // Clean phone number
        let cleanNumber = manualNumber.replace(/[^0-9]/g, '');
        if (!cleanNumber.startsWith('62')) {
            if (cleanNumber.startsWith('0')) {
                cleanNumber = '62' + cleanNumber.substring(1);
            } else {
                cleanNumber = '62' + cleanNumber;
            }
        }

        setSelectedConversation(cleanNumber);
        setShowNewConversation(false);

        // Add to conversations if not exists
        const exists = conversations.find(c => c.contact_number === cleanNumber);
        if (!exists) {
            setConversations(prev => [{
                contact_number: cleanNumber,
                contact_name: manualName || null,
                last_message: null,
                unread_count: 0,
                messages: [],
            }, ...prev]);
        }

        // Save contact name if provided
        if (manualName && selectedSession) {
            axios.post('/user/reply-manual/update-contact', {
                session_id: selectedSession,
                phone_number: cleanNumber,
                display_name: manualName,
            });
        }

        setManualNumber('');
        setManualName('');
    };

    const handleSaveContactName = async (contactNumber: string) => {
        if (!editingName.trim() || !selectedSession) return;
        setSavingContact(true);
        try {
            const response = await axios.post('/user/reply-manual/update-contact', {
                session_id: selectedSession,
                phone_number: contactNumber,
                display_name: editingName.trim(),
            });
            const data = response.data;
            if (data.success) {
                setConversations(prev => prev.map(conv =>
                    conv.contact_number === contactNumber
                        ? { ...conv, contact_name: editingName.trim() }
                        : conv
                ));
                setEditingContact(null);
                setEditingName('');
            } else {
                alert(data.message || 'Gagal menyimpan nama kontak');
            }
        } catch (error) {
            logger.error('Error saving contact name:', error);
            alert('Terjadi kesalahan saat menyimpan nama kontak');
        } finally {
            setSavingContact(false);
        }
    };

    const selectedConversationData = conversations.find(c => c.contact_number === selectedConversation);

    const filteredConversations = conversations.filter((conv) => {
        const query = searchQuery.toLowerCase();
        return conv.contact_number.toLowerCase().includes(query) ||
            (conv.contact_name && conv.contact_name.toLowerCase().includes(query));
    });

    const formatTime = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    };

    const renderMessage = (message: Message) => {
        const isOutgoing = message.direction === 'outgoing';

        return (
            <div
                key={message.id}
                className={cn('flex', isOutgoing ? 'justify-end' : 'justify-start')}
            >
                <div
                    className={cn(
                        'max-w-[70%] rounded-2xl p-3 shadow-md',
                        isOutgoing
                            ? 'bg-primary text-white rounded-br-sm'
                            : 'bg-white border rounded-bl-sm'
                    )}
                >
                    {/* Media preview */}
                    {message.type === 'image' && message.media_metadata?.url && (
                        <img
                            src={message.media_metadata.url}
                            alt="Image"
                            className="rounded-lg mb-2 max-w-full"
                        />
                    )}
                    {message.type === 'document' && message.media_metadata?.filename && (
                        <div className="flex items-center gap-2 mb-2 p-2 bg-muted/20 rounded">
                            <FileText className="size-5" />
                            <span className="text-sm">{message.media_metadata.filename}</span>
                        </div>
                    )}

                    {/* Message content */}
                    {message.content && (
                        <p className="text-sm whitespace-pre-wrap break-words">
                            {message.content}
                        </p>
                    )}

                    {/* Timestamp and status */}
                    <div className={cn('flex items-center gap-1 mt-1', isOutgoing ? 'justify-end' : 'justify-start')}>
                        <Clock className="size-3 opacity-70" />
                        <span className="text-xs opacity-70">{formatTime(message.created_at)}</span>
                        {isOutgoing && (
                            <CheckCheck className={cn(
                                "size-3",
                                message.status === 'sent' && "text-blue-400",
                                message.status === 'delivered' && "text-blue-500",
                                message.status === 'read' && "text-blue-600"
                            )} />
                        )}
                        {message.is_auto_reply && (
                            <Badge variant="secondary" className="ml-1 text-xs py-0 px-1">Auto</Badge>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    return (
        <UserLayout>
            <Head title="Reply Manual" />

            <div className="space-y-6">
                {/* Header with Gradient */}
                <div className="relative overflow-hidden rounded-xl bg-primary/5 p-6 border">
                    <div className="absolute inset-0 bg-grid-white/10 [mask-image:radial-gradient(white,transparent_85%)]" />
                    <div className="relative flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight text-foreground">Reply Manual</h1>
                            <p className="text-muted-foreground mt-1">
                                Balas pesan WhatsApp secara manual dari dashboard
                            </p>
                        </div>
                        <div className="flex items-center gap-3">
                            <a
                                href="/user/reply-manual/fullscreen"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                <Button
                                    variant="default"
                                    size="sm"
                                    className="gap-2 bg-primary hover:bg-primary/90"
                                >
                                    <ExternalLink className="size-4" />
                                    WhatsApp Web Style
                                </Button>
                            </a>
                            {selectedSession && (
                                <>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => loadConversations()}
                                        disabled={loading}
                                        className="gap-2"
                                    >
                                        <RefreshCw className={cn("size-4", loading && "animate-spin")} />
                                        Refresh
                                    </Button>
                                    <div className="flex items-center gap-2 px-3 py-1.5 bg-background rounded-lg border">
                                        <div className={cn(
                                            "size-2.5 rounded-full",
                                            autoRefresh ? "bg-green-500 animate-pulse" : "bg-gray-300"
                                        )} />
                                        <span className="text-sm font-medium">
                                            {autoRefresh ? "Auto-refresh" : "Manual"}
                                        </span>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* No Sessions Alert */}
                {sessions.length === 0 && (
                    <div className="rounded-xl border border-red-200 bg-red-50 p-4">
                        <div className="flex items-start gap-4">
                            <div className="flex size-10 items-center justify-center rounded-full bg-red-100">
                                <AlertCircle className="size-5 text-red-600" />
                            </div>
                            <div className="flex-1">
                                <h3 className="font-semibold text-red-900">Tidak Ada Sesi Terhubung</h3>
                                <p className="mt-1 text-sm text-red-700">
                                    Anda perlu memiliki minimal 1 sesi WhatsApp yang terhubung.
                                </p>
                                <div className="mt-3">
                                    <Link href="/user/whatsapp">
                                        <Button size="sm" variant="destructive" className="gap-2">
                                            <Wifi className="size-4" />
                                            Hubungkan WhatsApp
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Session Selector */}
                {sessions.length > 0 && (
                    <Card className="overflow-hidden border-2">
                        <div className="h-1 bg-primary" />
                        <CardHeader className="border-b">
                            <CardTitle className="flex items-center gap-2">
                                <Wifi className="size-5 text-primary" />
                                Pilih Sesi WhatsApp
                            </CardTitle>
                            <CardDescription>
                                Pilih sesi WhatsApp yang akan digunakan untuk membalas pesan
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <div className="max-w-md">
                                <Label className="text-base font-semibold mb-3 block">Sesi WhatsApp</Label>
                                <Select
                                    value={selectedSession?.toString()}
                                    onValueChange={(value) => {
                                        setSelectedSession(parseInt(value));
                                        setSelectedConversation(null);
                                    }}
                                >
                                    <SelectTrigger className="h-12 border-2 hover:border-primary/50 transition-colors">
                                        <SelectValue placeholder="Pilih sesi..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {sessions.map((session) => (
                                            <SelectItem key={session.id} value={session.id.toString()}>
                                                <div className="flex items-center gap-3 py-1">
                                                    <div className="size-2.5 rounded-full bg-green-500 animate-pulse" />
                                                    <MessageCircle className="size-4 text-primary" />
                                                    <span className="font-medium">{session.name}</span>
                                                    {session.phone_number && (
                                                        <span className="text-muted-foreground text-xs">
                                                            ({session.phone_number})
                                                        </span>
                                                    )}
                                                </div>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Chat Interface */}
                {selectedSession && (
                    <Card className="h-[calc(100vh-24rem)] overflow-hidden border-2">
                        <div className="h-1 bg-primary" />
                        <div className="flex h-full">
                            {/* Conversations List */}
                            <div className="w-80 border-r flex flex-col">
                                <div className="p-4 border-b space-y-3">
                                    {/* New Conversation Button */}
                                    <Dialog open={showNewConversation} onOpenChange={setShowNewConversation}>
                                        <DialogTrigger asChild>
                                            <Button className="w-full bg-primary hover:bg-primary/90 shadow-lg shadow-primary/30" size="sm">
                                                <Plus className="size-4 mr-2" />
                                                Percakapan Baru
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent className="sm:max-w-[500px]">
                                            <DialogHeader>
                                                <DialogTitle>Mulai Percakapan Baru</DialogTitle>
                                                <DialogDescription>
                                                    Pilih kontak dari daftar atau masukkan nomor secara manual
                                                </DialogDescription>
                                            </DialogHeader>
                                            <Tabs defaultValue="contacts" className="mt-4">
                                                <TabsList className="grid w-full grid-cols-2">
                                                    <TabsTrigger value="contacts">
                                                        <User className="size-4 mr-2" />
                                                        Pilih Kontak
                                                    </TabsTrigger>
                                                    <TabsTrigger value="manual">
                                                        <Phone className="size-4 mr-2" />
                                                        Input Manual
                                                    </TabsTrigger>
                                                </TabsList>
                                                <TabsContent value="contacts" className="space-y-4">
                                                    <div className="relative">
                                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                                                        <Input
                                                            placeholder="Cari kontak..."
                                                            value={contactSearch}
                                                            onChange={(e) => setContactSearch(e.target.value)}
                                                            onKeyDown={(e) => {
                                                                if (e.key === 'Enter') loadContacts();
                                                            }}
                                                            className="pl-9"
                                                        />
                                                    </div>
                                                    <div className="max-h-[300px] overflow-y-auto space-y-2">
                                                        {loadingContacts ? (
                                                            <div className="text-center py-8 text-muted-foreground">
                                                                <RefreshCw className="size-6 mx-auto mb-2 animate-spin" />
                                                                <p className="text-sm">Memuat kontak...</p>
                                                            </div>
                                                        ) : contacts.length === 0 ? (
                                                            <div className="text-center py-8 text-muted-foreground">
                                                                <User className="size-8 mx-auto mb-2 opacity-50" />
                                                                <p className="text-sm">Tidak ada kontak ditemukan</p>
                                                            </div>
                                                        ) : (
                                                            contacts.map((contact) => (
                                                                <button
                                                                    key={contact.id}
                                                                    onClick={() => handleSelectContact(contact)}
                                                                    className="w-full p-3 border rounded-lg hover:bg-muted/50 transition-colors text-left flex items-center gap-3"
                                                                >
                                                                    <div className="size-10 rounded-full bg-primary flex items-center justify-center">
                                                                        <User className="size-5 text-white" />
                                                                    </div>
                                                                    <div className="flex-1 min-w-0">
                                                                        <p className="font-medium truncate">{contact.name}</p>
                                                                        <p className="text-sm text-muted-foreground">{contact.phone_number}</p>
                                                                    </div>
                                                                </button>
                                                            ))
                                                        )}
                                                    </div>
                                                </TabsContent>
                                                <TabsContent value="manual" className="space-y-4">
                                                    <div className="space-y-2">
                                                        <Label>Nomor WhatsApp</Label>
                                                        <Input
                                                            placeholder="08123456789 atau 628123456789"
                                                            value={manualNumber}
                                                            onChange={(e) => setManualNumber(e.target.value)}
                                                        />
                                                        <p className="text-xs text-muted-foreground">
                                                            Nomor akan otomatis dikonversi ke format internasional (62xxx)
                                                        </p>
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label>Nama Kontak (opsional)</Label>
                                                        <Input
                                                            placeholder="Nama untuk disimpan"
                                                            value={manualName}
                                                            onChange={(e) => setManualName(e.target.value)}
                                                        />
                                                    </div>
                                                    <Button
                                                        onClick={handleStartManualConversation}
                                                        disabled={!manualNumber.trim()}
                                                        className="w-full bg-primary hover:bg-primary/90 shadow-lg"
                                                    >
                                                        <MessageCircle className="size-4 mr-2" />
                                                        Mulai Percakapan
                                                    </Button>
                                                </TabsContent>
                                            </Tabs>
                                        </DialogContent>
                                    </Dialog>

                                    {/* Search */}
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                                        <Input
                                            placeholder="Cari percakapan..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="pl-9"
                                        />
                                    </div>
                                </div>

                                <div className="flex-1 overflow-y-auto">
                                    {loading ? (
                                        <div className="p-8 text-center text-muted-foreground">
                                            <RefreshCw className="size-8 mx-auto mb-3 animate-spin" />
                                            <p>Memuat percakapan...</p>
                                        </div>
                                    ) : filteredConversations.length === 0 ? (
                                        <div className="p-8 text-center">
                                            <MessageCircle className="size-16 mx-auto mb-4 text-muted-foreground opacity-20" />
                                            <p className="text-muted-foreground font-medium mb-2">Belum ada percakapan</p>
                                            <p className="text-sm text-muted-foreground">
                                                Klik "Percakapan Baru" untuk mulai
                                            </p>
                                        </div>
                                    ) : (
                                        filteredConversations.map((conv) => (
                                            <button
                                                key={conv.contact_number}
                                                onClick={() => setSelectedConversation(conv.contact_number)}
                                                className={cn(
                                                    'w-full p-4 border-b hover:bg-muted/50 transition-colors text-left',
                                                    selectedConversation === conv.contact_number && 'bg-muted'
                                                )}
                                            >
                                                <div className="flex items-start gap-3">
                                                    <div className="size-10 rounded-full bg-primary flex items-center justify-center flex-shrink-0 shadow-md">
                                                        <User className="size-5 text-white" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center justify-between gap-2 mb-1">
                                                            <p className="font-medium truncate">
                                                                {conv.contact_name || conv.contact_number}
                                                            </p>
                                                            {conv.last_message && (
                                                                <span className="text-xs text-muted-foreground flex-shrink-0">
                                                                    {formatTime(conv.last_message.created_at)}
                                                                </span>
                                                            )}
                                                        </div>
                                                        {conv.contact_name && (
                                                            <p className="text-xs text-muted-foreground truncate mb-1">
                                                                {conv.contact_number}
                                                            </p>
                                                        )}
                                                        <div className="flex items-center justify-between gap-2">
                                                            <p className="text-sm text-muted-foreground truncate">
                                                                {conv.last_message?.content || 'Mulai percakapan'}
                                                            </p>
                                                            {conv.unread_count > 0 && (
                                                                <Badge className="flex-shrink-0 bg-primary border-0 shadow-md">
                                                                    {conv.unread_count}
                                                                </Badge>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </button>
                                        ))
                                    )}
                                </div>
                            </div>

                            {/* Chat Area */}
                            <div className="flex-1 flex flex-col">
                                {selectedConversationData ? (
                                    <>
                                        {/* Chat Header */}
                                        <div className="p-4 border-b bg-primary/5">
                                            <div className="flex items-center gap-3">
                                                <div className="size-12 rounded-full bg-primary flex items-center justify-center shadow-lg">
                                                    <User className="size-6 text-white" />
                                                </div>
                                                <div className="flex-1">
                                                    {editingContact === selectedConversationData.contact_number ? (
                                                        <div className="flex items-center gap-2">
                                                            <Input
                                                                value={editingName}
                                                                onChange={(e) => setEditingName(e.target.value)}
                                                                placeholder="Masukkan nama kontak"
                                                                className="h-8 text-sm"
                                                                autoFocus
                                                                onKeyDown={(e) => {
                                                                    if (e.key === 'Enter') handleSaveContactName(selectedConversationData.contact_number);
                                                                    else if (e.key === 'Escape') {
                                                                        setEditingContact(null);
                                                                        setEditingName('');
                                                                    }
                                                                }}
                                                            />
                                                            <Button size="icon" variant="ghost" className="size-8" onClick={() => handleSaveContactName(selectedConversationData.contact_number)} disabled={savingContact}>
                                                                <Check className="size-4 text-green-600" />
                                                            </Button>
                                                            <Button size="icon" variant="ghost" className="size-8" onClick={() => { setEditingContact(null); setEditingName(''); }}>
                                                                <X className="size-4 text-red-600" />
                                                            </Button>
                                                        </div>
                                                    ) : (
                                                        <div className="flex items-center gap-2">
                                                            <p className="font-semibold">
                                                                {selectedConversationData.contact_name || selectedConversationData.contact_number}
                                                            </p>
                                                            <Button
                                                                size="icon"
                                                                variant="ghost"
                                                                className="size-6"
                                                                onClick={() => {
                                                                    setEditingContact(selectedConversationData.contact_number);
                                                                    setEditingName(selectedConversationData.contact_name || '');
                                                                }}
                                                                title="Edit nama kontak"
                                                            >
                                                                <Pencil className="size-3" />
                                                            </Button>
                                                        </div>
                                                    )}
                                                    <p className="text-xs text-muted-foreground">
                                                        {selectedConversationData.contact_name && (
                                                            <span className="mr-2">{selectedConversationData.contact_number}</span>
                                                        )}
                                                        {selectedConversationData.messages.length} pesan
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Messages */}
                                        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-muted/20">
                                            {selectedConversationData.messages.length === 0 ? (
                                                <div className="flex items-center justify-center h-full">
                                                    <div className="text-center">
                                                        <MessageCircle className="size-16 mx-auto mb-4 text-muted-foreground opacity-20" />
                                                        <p className="text-muted-foreground">Belum ada pesan</p>
                                                        <p className="text-sm text-muted-foreground mt-1">
                                                            Kirim pesan pertama untuk memulai percakapan
                                                        </p>
                                                    </div>
                                                </div>
                                            ) : (
                                                <>
                                                    {selectedConversationData.messages.slice().reverse().map(renderMessage)}
                                                    <div ref={messagesEndRef} />
                                                </>
                                            )}
                                        </div>

                                        {/* File Preview */}
                                        {selectedFile && (
                                            <div className="p-3 border-t bg-primary/5">
                                                <div className="flex items-center gap-3">
                                                    <div className="size-12 rounded-xl bg-primary flex items-center justify-center shadow-md">
                                                        {selectedFile.type.startsWith('image/') ? (
                                                            <Image className="size-6 text-white" />
                                                        ) : (
                                                            <FileText className="size-6 text-white" />
                                                        )}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="font-medium truncate text-sm">{selectedFile.name}</p>
                                                        <p className="text-xs text-muted-foreground">
                                                            {(selectedFile.size / 1024).toFixed(1)} KB
                                                        </p>
                                                    </div>
                                                    <Button
                                                        size="icon"
                                                        variant="ghost"
                                                        onClick={() => setSelectedFile(null)}
                                                    >
                                                        <X className="size-4" />
                                                    </Button>
                                                </div>
                                                <div className="mt-2 flex gap-2">
                                                    <Input
                                                        placeholder="Caption (opsional)"
                                                        value={fileCaption}
                                                        onChange={(e) => setFileCaption(e.target.value)}
                                                        className="flex-1"
                                                    />
                                                    <Button onClick={handleSendMedia} disabled={uploadingFile} className="bg-primary hover:bg-primary/90">
                                                        {uploadingFile ? (
                                                            <RefreshCw className="size-4 animate-spin" />
                                                        ) : (
                                                            <Send className="size-4" />
                                                        )}
                                                    </Button>
                                                </div>
                                            </div>
                                        )}

                                        {/* Message Input */}
                                        <div className="p-4 border-t">
                                            <div className="flex gap-2">
                                                <input
                                                    type="file"
                                                    ref={fileInputRef}
                                                    className="hidden"
                                                    accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.xls,.xlsx"
                                                    onChange={(e) => {
                                                        const file = e.target.files?.[0];
                                                        if (file) setSelectedFile(file);
                                                        e.target.value = '';
                                                    }}
                                                />
                                                <Button
                                                    variant="outline"
                                                    size="icon"
                                                    className="h-[60px] w-[50px]"
                                                    onClick={() => fileInputRef.current?.click()}
                                                    title="Kirim file"
                                                >
                                                    <Paperclip className="size-5" />
                                                </Button>
                                                <Textarea
                                                    placeholder="Ketik pesan..."
                                                    value={messageText}
                                                    onChange={(e) => setMessageText(e.target.value)}
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter' && !e.shiftKey) {
                                                            e.preventDefault();
                                                            handleSendMessage();
                                                        }
                                                    }}
                                                    className="min-h-[60px] resize-none"
                                                />
                                                <Button
                                                    onClick={handleSendMessage}
                                                    disabled={sending || !messageText.trim()}
                                                    size="icon"
                                                    className="h-[60px] w-[60px] bg-primary hover:bg-primary/90 shadow-lg shadow-primary/30"
                                                >
                                                    <Send className="size-5" />
                                                </Button>
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <div className="flex-1 flex items-center justify-center text-muted-foreground">
                                        <div className="text-center">
                                            <MessageCircle className="size-16 mx-auto mb-4 opacity-20" />
                                            <p>Pilih kontak untuk mulai percakapan</p>
                                            <p className="text-sm mt-2">atau klik "Percakapan Baru"</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </Card>
                )}
            </div>
        </UserLayout>
    );
}
