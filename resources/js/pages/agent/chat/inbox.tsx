import { useState, useEffect, useRef } from 'react';
import { Head, router } from '@inertiajs/react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    MessageSquare,
    Send,
    Search,
    Clock,
    CheckCircle2,
    LogOut,
    Headset,
    MoreVertical,
    X,
} from 'lucide-react';
import axios from 'axios';

interface HumanAgent {
    id: number;
    full_name: string;
    email: string;
    role: string;
}

interface WhatsAppSession {
    id: number;
    name: string;
    phone_number: string;
}

interface Message {
    id: number;
    message_text: string;
    direction: 'inbound' | 'outbound';
    message_type: string;
    created_at: string;
    human_agent?: HumanAgent;
}

interface Conversation {
    id: number;
    customer_phone: string;
    customer_name: string | null;
    status: string;
    last_message_at: string;
    last_message_text: string;
    last_message_from: string;
    unread_by_agent: boolean;
    unread_count: number;
    whatsapp_session: WhatsAppSession;
}

interface Props {
    agent: HumanAgent;
    conversations: Conversation[];
}

export default function ChatInbox({ agent, conversations: initialConversations }: Props) {
    const [conversations, setConversations] = useState<Conversation[]>(initialConversations);
    const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [messageText, setMessageText] = useState('');
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const loadMessages = async (conversation: Conversation) => {
        setLoading(true);
        try {
            const response = await axios.get(
                route('agent.chat.messages', { conversation: conversation.id })
            );
            setMessages(response.data.messages);
            setSelectedConversation(response.data.conversation);

            // Update conversation in list to mark as read
            setConversations((prev) =>
                prev.map((c) =>
                    c.id === conversation.id
                        ? { ...c, unread_by_agent: false, unread_count: 0 }
                        : c
                )
            );
        } catch (error) {
            console.error('Error loading messages:', error);
        } finally {
            setLoading(false);
        }
    };

    const sendMessage = async () => {
        if (!messageText.trim() || !selectedConversation) return;

        try {
            const response = await axios.post(
                route('agent.chat.send', { conversation: selectedConversation.id }),
                { message: messageText }
            );

            setMessages((prev) => [...prev, response.data.message]);
            setMessageText('');

            // Update conversation in list
            setConversations((prev) =>
                prev.map((c) =>
                    c.id === selectedConversation.id
                        ? {
                              ...c,
                              last_message_at: new Date().toISOString(),
                              last_message_text: messageText,
                              last_message_from: 'agent',
                          }
                        : c
                )
            );
        } catch (error) {
            console.error('Error sending message:', error);
        }
    };

    const updateStatus = async (status: string) => {
        if (!selectedConversation) return;

        try {
            await axios.put(
                route('agent.chat.status', { conversation: selectedConversation.id }),
                { status }
            );

            setSelectedConversation((prev) => (prev ? { ...prev, status } : null));
            setConversations((prev) =>
                prev.map((c) => (c.id === selectedConversation.id ? { ...c, status } : c))
            );
        } catch (error) {
            console.error('Error updating status:', error);
        }
    };

    const handleLogout = () => {
        router.post(route('agent.logout'));
    };

    const formatTime = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

        if (diffInHours < 24) {
            return date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
        }
        return date.toLocaleDateString('id-ID', { day: '2-digit', month: 'short' });
    };

    const getStatusBadge = (status: string) => {
        const variants: Record<string, string> = {
            open: 'bg-green-100 text-green-700',
            pending: 'bg-yellow-100 text-yellow-700',
            resolved: 'bg-blue-100 text-blue-700',
            closed: 'bg-gray-100 text-gray-700',
        };

        return (
            <Badge className={variants[status] || 'bg-gray-100 text-gray-700'}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
            </Badge>
        );
    };

    const filteredConversations = conversations.filter(
        (c) =>
            c.customer_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            c.customer_phone.includes(searchQuery)
    );

    return (
        <>
            <Head title="Chat Inbox - Agent" />

            <div className="h-screen flex flex-col bg-gray-50">
                {/* Header */}
                <header className="bg-white border-b border-gray-200 flex-shrink-0">
                    <div className="px-4 sm:px-6">
                        <div className="flex justify-between items-center h-16">
                            <div className="flex items-center space-x-3">
                                <div className="size-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                                    <Headset className="size-5 text-white" />
                                </div>
                                <div>
                                    <h1 className="text-xl font-bold text-gray-900">Chat Inbox</h1>
                                    <p className="text-xs text-gray-500">Customer Service Portal</p>
                                </div>
                            </div>

                            <div className="flex items-center space-x-4">
                                <div className="text-right">
                                    <p className="text-sm font-semibold text-gray-900">
                                        {agent.full_name}
                                    </p>
                                    <p className="text-xs text-gray-500">{agent.role}</p>
                                </div>
                                <Avatar className="size-10">
                                    <AvatarFallback className="bg-gradient-to-br from-purple-400 to-blue-500 text-white font-semibold">
                                        {agent.full_name.substring(0, 2).toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={handleLogout}
                                    className="text-gray-600"
                                >
                                    <LogOut className="size-4" />
                                </Button>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Main Content */}
                <div className="flex-1 flex overflow-hidden">
                    {/* Conversations List */}
                    <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
                        {/* Search */}
                        <div className="p-4 border-b border-gray-200">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
                                <Input
                                    type="text"
                                    placeholder="Cari customer..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                        </div>

                        {/* Conversation List */}
                        <ScrollArea className="flex-1">
                            <div className="p-2">
                                {filteredConversations.length === 0 ? (
                                    <div className="text-center py-8 text-gray-500">
                                        <MessageSquare className="size-12 mx-auto mb-2 opacity-50" />
                                        <p className="text-sm">Belum ada percakapan</p>
                                    </div>
                                ) : (
                                    filteredConversations.map((conversation) => (
                                        <div
                                            key={conversation.id}
                                            onClick={() => loadMessages(conversation)}
                                            className={`p-3 rounded-lg cursor-pointer mb-2 transition-colors ${
                                                selectedConversation?.id === conversation.id
                                                    ? 'bg-blue-50 border border-blue-200'
                                                    : 'hover:bg-gray-50 border border-transparent'
                                            }`}
                                        >
                                            <div className="flex items-start justify-between mb-1">
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="font-semibold text-sm text-gray-900 truncate">
                                                        {conversation.customer_name ||
                                                            conversation.customer_phone}
                                                    </h4>
                                                    <p className="text-xs text-gray-500">
                                                        {conversation.whatsapp_session.name}
                                                    </p>
                                                </div>
                                                <div className="flex flex-col items-end ml-2">
                                                    <span className="text-xs text-gray-500">
                                                        {formatTime(conversation.last_message_at)}
                                                    </span>
                                                    {conversation.unread_count > 0 && (
                                                        <Badge className="bg-blue-600 text-white mt-1 text-xs px-1.5 py-0">
                                                            {conversation.unread_count}
                                                        </Badge>
                                                    )}
                                                </div>
                                            </div>
                                            <p className="text-xs text-gray-600 truncate">
                                                {conversation.last_message_from === 'agent' && '✓ '}
                                                {conversation.last_message_text}
                                            </p>
                                        </div>
                                    ))
                                )}
                            </div>
                        </ScrollArea>
                    </div>

                    {/* Chat Area */}
                    <div className="flex-1 flex flex-col bg-gray-50">
                        {selectedConversation ? (
                            <>
                                {/* Chat Header */}
                                <div className="bg-white border-b border-gray-200 p-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h3 className="font-semibold text-gray-900">
                                                {selectedConversation.customer_name ||
                                                    selectedConversation.customer_phone}
                                            </h3>
                                            <p className="text-sm text-gray-500">
                                                {selectedConversation.customer_phone}
                                            </p>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <Select
                                                value={selectedConversation.status || 'open'}
                                                onValueChange={updateStatus}
                                            >
                                                <SelectTrigger className="w-32">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="open">Open</SelectItem>
                                                    <SelectItem value="pending">Pending</SelectItem>
                                                    <SelectItem value="resolved">Resolved</SelectItem>
                                                    <SelectItem value="closed">Closed</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            {getStatusBadge(selectedConversation.status || 'open')}
                                        </div>
                                    </div>
                                </div>

                                {/* Messages */}
                                <ScrollArea className="flex-1 p-4">
                                    <div className="space-y-4">
                                        {messages.map((message) => (
                                            <div
                                                key={message.id}
                                                className={`flex ${
                                                    message.direction === 'outbound'
                                                        ? 'justify-end'
                                                        : 'justify-start'
                                                }`}
                                            >
                                                <div
                                                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                                                        message.direction === 'outbound'
                                                            ? 'bg-blue-600 text-white'
                                                            : 'bg-white border border-gray-200'
                                                    }`}
                                                >
                                                    <p className="text-sm whitespace-pre-wrap">
                                                        {message.message_text}
                                                    </p>
                                                    <p
                                                        className={`text-xs mt-1 ${
                                                            message.direction === 'outbound'
                                                                ? 'text-blue-100'
                                                                : 'text-gray-500'
                                                        }`}
                                                    >
                                                        {formatTime(message.created_at)}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                        <div ref={messagesEndRef} />
                                    </div>
                                </ScrollArea>

                                {/* Message Input */}
                                <div className="bg-white border-t border-gray-200 p-4">
                                    <div className="flex items-end space-x-2">
                                        <Textarea
                                            value={messageText}
                                            onChange={(e) => setMessageText(e.target.value)}
                                            placeholder="Ketik pesan..."
                                            className="flex-1 min-h-[60px] max-h-[120px] resize-none"
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter' && !e.shiftKey) {
                                                    e.preventDefault();
                                                    sendMessage();
                                                }
                                            }}
                                        />
                                        <Button
                                            onClick={sendMessage}
                                            disabled={!messageText.trim()}
                                            className="bg-blue-600 hover:bg-blue-700 h-[60px]"
                                        >
                                            <Send className="size-4" />
                                        </Button>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-2">
                                        Tekan Enter untuk kirim, Shift+Enter untuk baris baru
                                    </p>
                                </div>
                            </>
                        ) : (
                            <div className="flex-1 flex items-center justify-center">
                                <div className="text-center text-gray-500">
                                    <MessageSquare className="size-16 mx-auto mb-4 opacity-50" />
                                    <h3 className="text-lg font-semibold mb-1">
                                        Pilih Percakapan
                                    </h3>
                                    <p className="text-sm">
                                        Pilih percakapan dari daftar untuk memulai chat
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}
