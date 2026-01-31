import { Head } from '@inertiajs/react';
import { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Search, Send, Paperclip, Smile, MoreVertical, Phone, Video,
    ArrowLeft, Check, CheckCheck, Clock, User, MessageCircle, Plus,
    Image, FileText, X, RefreshCw
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

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

export default function FullscreenChat({ sessions, allSessions }: Props) {
    const [selectedSession, setSelectedSession] = useState<number | null>(sessions[0]?.id || null);
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
    const [messageText, setMessageText] = useState('');
    const [loading, setLoading] = useState(false);
    const [sending, setSending] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // New conversation
    const [showNewChat, setShowNewChat] = useState(false);
    const [contacts, setContacts] = useState<Contact[]>([]);
    const [contactSearch, setContactSearch] = useState('');
    const [loadingContacts, setLoadingContacts] = useState(false);
    const [manualNumber, setManualNumber] = useState('');

    // Filter protocol messages
    const isProtocolMessage = (content: string): boolean => {
        if (!content) return true;
        const protocolKeywords = [
            'protocolMessage', 'INITIAL_SECURITY_NOTIFICATION', 'APP_STATE_SYNC',
            'PEER_DATA_OPERATION', 'keyId', 'appStateSyncKeyShare', 'type":"',
        ];
        return protocolKeywords.some(keyword => content.includes(keyword));
    };

    const filterValidMessages = (messages: Message[]): Message[] => {
        return messages.filter(msg => {
            if (!['text', 'image', 'video', 'audio', 'document'].includes(msg.type)) return false;
            if (msg.type === 'text' && isProtocolMessage(msg.content)) return false;
            if (msg.type === 'text' && (!msg.content || msg.content.trim() === '')) return false;
            return true;
        });
    };

    useEffect(() => {
        if (selectedSession) {
            loadConversations();
            const interval = setInterval(loadConversations, 10000);
            return () => clearInterval(interval);
        }
    }, [selectedSession]);

    useEffect(() => {
        if (selectedConversation && conversations.length > 0) {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    }, [conversations, selectedConversation]);

    useEffect(() => {
        if (showNewChat && selectedSession) {
            loadContacts();
        }
    }, [showNewChat, selectedSession]);

    const loadConversations = async () => {
        if (!selectedSession) return;
        setLoading(true);
        try {
            const response = await fetch('/user/reply-manual/messages', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.content || '',
                },
                body: JSON.stringify({ session_id: selectedSession }),
            });
            const data = await response.json();
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
            console.error('Error loading conversations:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadContacts = async () => {
        if (!selectedSession) return;
        setLoadingContacts(true);
        try {
            const response = await fetch('/user/reply-manual/contacts', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.content || '',
                },
                body: JSON.stringify({ session_id: selectedSession, search: contactSearch }),
            });
            const data = await response.json();
            if (data.success) {
                setContacts(data.data.contacts);
            }
        } catch (error) {
            console.error('Error loading contacts:', error);
        } finally {
            setLoadingContacts(false);
        }
    };

    const handleSendMessage = async () => {
        if (!messageText.trim() || !selectedSession || !selectedConversation) return;
        setSending(true);
        try {
            const response = await fetch('/user/reply-manual/send', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.content || '',
                },
                body: JSON.stringify({
                    session_id: selectedSession,
                    to_number: selectedConversation,
                    message: messageText,
                }),
            });
            const data = await response.json();
            if (data.success) {
                setMessageText('');
                loadConversations();
            }
        } catch (error) {
            console.error('Error sending message:', error);
        } finally {
            setSending(false);
        }
    };

    const handleSelectContact = (contact: Contact) => {
        setSelectedConversation(contact.phone_number);
        setShowNewChat(false);
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

    const handleStartManualChat = () => {
        if (!manualNumber.trim()) return;
        let cleanNumber = manualNumber.replace(/[^0-9]/g, '');
        if (!cleanNumber.startsWith('62')) {
            cleanNumber = cleanNumber.startsWith('0') ? '62' + cleanNumber.substring(1) : '62' + cleanNumber;
        }
        setSelectedConversation(cleanNumber);
        setShowNewChat(false);
        const exists = conversations.find(c => c.contact_number === cleanNumber);
        if (!exists) {
            setConversations(prev => [{
                contact_number: cleanNumber,
                contact_name: null,
                last_message: null,
                unread_count: 0,
                messages: [],
            }, ...prev]);
        }
        setManualNumber('');
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

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        if (date.toDateString() === today.toDateString()) return 'Today';
        if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
        return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
    };

    const formatLastMessagePreview = (message: Message | null): string => {
        if (!message) return 'Start a conversation';

        // Check if protocol/system message
        if (message.type === 'text' && isProtocolMessage(message.content)) {
            return '🔒 Pesan terenkripsi';
        }

        // Handle media types
        switch (message.type) {
            case 'image':
                return '📷 Foto';
            case 'video':
                return '🎥 Video';
            case 'audio':
                return '🎵 Audio';
            case 'document':
                return `📄 ${message.media_metadata?.filename || 'Dokumen'}`;
            case 'sticker':
                return '✨ Stiker';
            case 'text':
            default:
                // Truncate long messages
                if (message.content && message.content.length > 50) {
                    return message.content.substring(0, 50) + '...';
                }
                return message.content || 'Pesan';
        }
    };

    // No session connected
    if (sessions.length === 0) {
        return (
            <div className="h-screen bg-[#111b21] flex items-center justify-center">
                <Head title="WhatsApp Chat" />
                <div className="text-center">
                    <MessageCircle className="size-24 mx-auto mb-6 text-[#2563eb] opacity-50" />
                    <h2 className="text-2xl font-semibold text-white mb-2">No WhatsApp Session Connected</h2>
                    <p className="text-[#8696a0] mb-6">Please connect a WhatsApp session first</p>
                    <a href="/user/whatsapp" className="inline-flex items-center gap-2 px-6 py-3 bg-[#2563eb] text-white rounded-lg hover:bg-[#1d4ed8]">
                        Connect WhatsApp
                    </a>
                </div>
            </div>
        );
    }

    return (
        <div className="h-screen bg-[#111b21] flex">
            <Head title="WhatsApp Chat" />

            {/* Left Sidebar - Chat List */}
            <div className="w-[420px] bg-[#111b21] border-r border-[#222d34] flex flex-col">
                {/* Header */}
                <div className="h-[60px] bg-[#202c33] flex items-center justify-between px-4">
                    <div className="flex items-center gap-3">
                        <div className="size-10 rounded-full bg-[#2563eb] flex items-center justify-center">
                            <User className="size-5 text-white" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-[#e9edef]">
                                {sessions.find(s => s.id === selectedSession)?.name || 'ChatCepat'}
                            </p>
                            <p className="text-xs text-[#8696a0]">
                                {sessions.find(s => s.id === selectedSession)?.phone_number || 'Connected'}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" className="text-[#aebac1] hover:bg-[#202c33]" onClick={() => setShowNewChat(true)}>
                            <Plus className="size-5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-[#aebac1] hover:bg-[#202c33]" onClick={loadConversations}>
                            <RefreshCw className={cn("size-5", loading && "animate-spin")} />
                        </Button>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="text-[#aebac1] hover:bg-[#202c33]">
                                    <MoreVertical className="size-5" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="bg-[#233138] border-[#222d34] text-[#d1d7db]">
                                {sessions.map(session => (
                                    <DropdownMenuItem
                                        key={session.id}
                                        onClick={() => setSelectedSession(session.id)}
                                        className={cn(
                                            "hover:bg-[#182229]",
                                            selectedSession === session.id && "bg-[#182229]"
                                        )}
                                    >
                                        {session.name}
                                    </DropdownMenuItem>
                                ))}
                                <DropdownMenuItem className="hover:bg-[#182229]" onClick={() => window.close()}>
                                    Close Window
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>

                {/* Search */}
                <div className="p-2 bg-[#111b21]">
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-[#8696a0]" />
                        <Input
                            placeholder="Search or start new chat"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-12 h-[35px] bg-[#202c33] border-0 rounded-lg text-[#d1d7db] placeholder:text-[#8696a0] focus-visible:ring-0"
                        />
                    </div>
                </div>

                {/* Chat List */}
                <div className="flex-1 overflow-y-auto">
                    {filteredConversations.length === 0 ? (
                        <div className="p-8 text-center">
                            <MessageCircle className="size-16 mx-auto mb-4 text-[#8696a0] opacity-30" />
                            <p className="text-[#8696a0]">No conversations yet</p>
                        </div>
                    ) : (
                        filteredConversations.map((conv) => (
                            <button
                                key={conv.contact_number}
                                onClick={() => setSelectedConversation(conv.contact_number)}
                                className={cn(
                                    'w-full flex items-center gap-3 px-3 py-3 hover:bg-[#202c33] transition-colors',
                                    selectedConversation === conv.contact_number && 'bg-[#2a3942]'
                                )}
                            >
                                <div className="size-[49px] rounded-full bg-[#6b7c85] flex items-center justify-center flex-shrink-0">
                                    <User className="size-6 text-[#cfd8dc]" />
                                </div>
                                <div className="flex-1 min-w-0 text-left border-b border-[#222d34] pb-3">
                                    <div className="flex items-center justify-between mb-1">
                                        <p className="font-medium text-[#e9edef] truncate">
                                            {conv.contact_name || conv.contact_number}
                                        </p>
                                        {conv.last_message && (
                                            <span className="text-xs text-[#8696a0] flex-shrink-0 ml-2">
                                                {formatTime(conv.last_message.created_at)}
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <p className="text-sm text-[#8696a0] truncate pr-2">
                                            {conv.last_message?.direction === 'outgoing' && (
                                                <CheckCheck className="inline size-4 text-[#53bdeb] mr-1" />
                                            )}
                                            {formatLastMessagePreview(conv.last_message)}
                                        </p>
                                        {conv.unread_count > 0 && (
                                            <span className="size-5 flex items-center justify-center rounded-full bg-[#2563eb] text-white text-xs font-medium">
                                                {conv.unread_count}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </button>
                        ))
                    )}
                </div>
            </div>

            {/* Right Side - Chat Area */}
            <div className="flex-1 flex flex-col">
                {selectedConversationData ? (
                    <>
                        {/* Chat Header */}
                        <div className="h-[60px] bg-[#202c33] flex items-center justify-between px-4 border-l border-[#222d34]">
                            <div className="flex items-center gap-3">
                                <div className="size-10 rounded-full bg-[#6b7c85] flex items-center justify-center">
                                    <User className="size-5 text-[#cfd8dc]" />
                                </div>
                                <div>
                                    <p className="font-medium text-[#e9edef]">
                                        {selectedConversationData.contact_name || selectedConversationData.contact_number}
                                    </p>
                                    {selectedConversationData.contact_name && (
                                        <p className="text-xs text-[#8696a0]">
                                            {selectedConversationData.contact_number}
                                        </p>
                                    )}
                                </div>
                            </div>
                            <div className="flex items-center gap-1">
                                <Button variant="ghost" size="icon" className="text-[#aebac1] hover:bg-[#202c33]">
                                    <Search className="size-5" />
                                </Button>
                                <Button variant="ghost" size="icon" className="text-[#aebac1] hover:bg-[#202c33]">
                                    <MoreVertical className="size-5" />
                                </Button>
                            </div>
                        </div>

                        {/* Messages Area */}
                        <div
                            className="flex-1 overflow-y-auto p-4 space-y-1"
                            style={{
                                backgroundImage: 'url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyCAYAAAAeP4ixAAAACXBIWXMAAAsTAAALEwEAmpwYAAABgElEQVRoge2Y0W3DMAxEj0EH6AhdoBu0I3SDbtAN2g3aDdoNssFtheoGN0jDGnY+TPzhB0GQRN0defQPSXcH4A7AC4AGQHBdaH9x8PMOwDuAVwCvAJ7yPp++I3qFQvsAPABoAdzm/ZcA2gAeog4qUVepXQ+gBLCMfFBh4fN56Frl0xbAxONzDnMALYA2gKdweFwhgEW1HK0TRXq1RgAWB9QO4AmAeYQ4y6EFACYJPDfAf0xPAEEZwCqBZQA1AFsAdQBzBGOEaNq8C4A2gAcETRT6AHSqEqoAqgDKCBIBlgAsolgGME5gMsIxbIADUI9QL4B9ABZ6IliHUhfAJoEhQqsEXCPMItgNYI/QGKEOQBGBS4I2MkVQB9BEMIhgGkGFQBrBIoJZBLMEhghmCYz+YB7BWQKXCQwR2kZQAVC2EkEZwSCCJoJ9BAsEJhE0EFTHiADu8V8hzqEA3EShBfCxQmUA9+kPEbxLaZ/APoLNAI4R7kIpALcJ7CLYjeCYwKEZ+78A8B8uN+y6+3M4ggAAAABJRU5ErkJggg==")',
                                backgroundColor: '#0b141a',
                            }}
                        >
                            {selectedConversationData.messages.slice().reverse().map((message, index, arr) => {
                                const isOutgoing = message.direction === 'outgoing';
                                const showDate = index === 0 || formatDate(message.created_at) !== formatDate(arr[index - 1].created_at);

                                return (
                                    <div key={message.id}>
                                        {showDate && (
                                            <div className="flex justify-center my-3">
                                                <span className="px-3 py-1 rounded-lg bg-[#182229] text-[#8696a0] text-xs">
                                                    {formatDate(message.created_at)}
                                                </span>
                                            </div>
                                        )}
                                        <div className={cn('flex mb-1', isOutgoing ? 'justify-end' : 'justify-start')}>
                                            <div
                                                className={cn(
                                                    'max-w-[65%] rounded-lg px-3 py-2 shadow-sm relative',
                                                    isOutgoing
                                                        ? 'bg-[#1e40af] text-[#e9edef] rounded-tr-none'
                                                        : 'bg-[#202c33] text-[#e9edef] rounded-tl-none'
                                                )}
                                            >
                                                {/* Media preview */}
                                                {message.type === 'image' && message.media_metadata?.url && (
                                                    <img src={message.media_metadata.url} alt="Image" className="rounded-lg mb-2 max-w-full" />
                                                )}
                                                {message.type === 'document' && message.media_metadata?.filename && (
                                                    <div className="flex items-center gap-2 mb-2 p-2 bg-[#0b141a]/30 rounded">
                                                        <FileText className="size-5" />
                                                        <span className="text-sm">{message.media_metadata.filename}</span>
                                                    </div>
                                                )}

                                                {/* Message content */}
                                                {message.content && (
                                                    <p className="text-[14.2px] whitespace-pre-wrap break-words leading-[19px]">
                                                        {message.content}
                                                    </p>
                                                )}

                                                {/* Timestamp and status */}
                                                <div className={cn('flex items-center gap-1 mt-1', isOutgoing ? 'justify-end' : 'justify-start')}>
                                                    <span className="text-[11px] text-[#8696a0]">{formatTime(message.created_at)}</span>
                                                    {isOutgoing && (
                                                        <CheckCheck className={cn(
                                                            "size-4",
                                                            message.status === 'read' ? "text-[#53bdeb]" : "text-[#8696a0]"
                                                        )} />
                                                    )}
                                                    {message.is_auto_reply && (
                                                        <Badge variant="secondary" className="ml-1 text-[10px] py-0 px-1 bg-[#182229] text-[#8696a0]">AI</Badge>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Message Input */}
                        <div className="h-[62px] bg-[#202c33] flex items-center gap-2 px-4">
                            <Button variant="ghost" size="icon" className="text-[#8696a0] hover:bg-[#202c33]">
                                <Smile className="size-6" />
                            </Button>
                            <Button variant="ghost" size="icon" className="text-[#8696a0] hover:bg-[#202c33]" onClick={() => fileInputRef.current?.click()}>
                                <Paperclip className="size-6" />
                            </Button>
                            <input ref={fileInputRef} type="file" className="hidden" accept="image/*,video/*,.pdf,.doc,.docx" />
                            <div className="flex-1">
                                <Input
                                    placeholder="Type a message"
                                    value={messageText}
                                    onChange={(e) => setMessageText(e.target.value)}
                                    onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); } }}
                                    className="h-[42px] bg-[#2a3942] border-0 rounded-lg text-[#d1d7db] placeholder:text-[#8696a0] focus-visible:ring-0"
                                />
                            </div>
                            <Button
                                size="icon"
                                className="bg-transparent hover:bg-[#202c33]"
                                onClick={handleSendMessage}
                                disabled={sending || !messageText.trim()}
                            >
                                <Send className={cn("size-6", messageText.trim() ? "text-[#2563eb]" : "text-[#8696a0]")} />
                            </Button>
                        </div>
                    </>
                ) : (
                    /* Empty State */
                    <div className="flex-1 flex items-center justify-center bg-[#222e35]">
                        <div className="text-center max-w-md">
                            <div className="size-32 mx-auto mb-8 rounded-full bg-[#2563eb]/10 flex items-center justify-center">
                                <MessageCircle className="size-16 text-[#2563eb]" />
                            </div>
                            <h2 className="text-3xl font-light text-[#e9edef] mb-4">ChatCepat Web</h2>
                            <p className="text-[#8696a0] text-sm leading-relaxed">
                                Send and receive messages without keeping your phone online.<br />
                                Select a chat from the left sidebar to start messaging.
                            </p>
                        </div>
                    </div>
                )}
            </div>

            {/* New Chat Dialog */}
            <Dialog open={showNewChat} onOpenChange={setShowNewChat}>
                <DialogContent className="bg-[#111b21] border-[#222d34] text-[#e9edef] sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle className="text-[#e9edef]">New Chat</DialogTitle>
                        <DialogDescription className="text-[#8696a0]">
                            Select a contact or enter a phone number
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        {/* Search contacts */}
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-[#8696a0]" />
                            <Input
                                placeholder="Search contacts..."
                                value={contactSearch}
                                onChange={(e) => setContactSearch(e.target.value)}
                                onKeyDown={(e) => { if (e.key === 'Enter') loadContacts(); }}
                                className="pl-10 bg-[#202c33] border-0 text-[#d1d7db] placeholder:text-[#8696a0]"
                            />
                        </div>

                        {/* Manual number input */}
                        <div className="flex gap-2">
                            <Input
                                placeholder="Or enter phone number..."
                                value={manualNumber}
                                onChange={(e) => setManualNumber(e.target.value)}
                                className="bg-[#202c33] border-0 text-[#d1d7db] placeholder:text-[#8696a0]"
                            />
                            <Button onClick={handleStartManualChat} disabled={!manualNumber.trim()} className="bg-[#2563eb] hover:bg-[#1d4ed8]">
                                Chat
                            </Button>
                        </div>

                        {/* Contact list */}
                        <div className="max-h-[300px] overflow-y-auto space-y-1">
                            {loadingContacts ? (
                                <div className="text-center py-8 text-[#8696a0]">
                                    <RefreshCw className="size-6 mx-auto mb-2 animate-spin" />
                                    <p className="text-sm">Loading contacts...</p>
                                </div>
                            ) : contacts.length === 0 ? (
                                <div className="text-center py-8 text-[#8696a0]">
                                    <User className="size-8 mx-auto mb-2 opacity-50" />
                                    <p className="text-sm">No contacts found</p>
                                </div>
                            ) : (
                                contacts.map((contact) => (
                                    <button
                                        key={contact.id}
                                        onClick={() => handleSelectContact(contact)}
                                        className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-[#202c33] transition-colors"
                                    >
                                        <div className="size-10 rounded-full bg-[#6b7c85] flex items-center justify-center">
                                            <User className="size-5 text-[#cfd8dc]" />
                                        </div>
                                        <div className="text-left">
                                            <p className="font-medium text-[#e9edef]">{contact.name}</p>
                                            <p className="text-sm text-[#8696a0]">{contact.phone_number}</p>
                                        </div>
                                    </button>
                                ))
                            )}
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
