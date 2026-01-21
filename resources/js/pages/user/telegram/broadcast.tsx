import { Head, router, useForm } from '@inertiajs/react';
import UserLayout from '@/layouts/user/user-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RichTextEditor } from '@/components/ui/rich-text-editor';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Send, Bot, Users, X } from 'lucide-react';
import { useState, FormEvent, useEffect } from 'react';

interface TelegramBot {
    id: number;
    bot_username: string;
    contacts_count: number;
}

interface TelegramContact {
    id: number;
    chat_id: number;
    display_name: string;
    username: string | null;
    chat_type: string;
}

interface TelegramBroadcastPageProps {
    bots: TelegramBot[];
}

export default function TelegramBroadcastPage({ bots }: TelegramBroadcastPageProps) {
    const [contacts, setContacts] = useState<TelegramContact[]>([]);
    const [selectedContacts, setSelectedContacts] = useState<number[]>([]);
    const [loadingContacts, setLoadingContacts] = useState(false);

    const { data, setData, post, processing, errors } = useForm({
        bot_id: '',
        message: '',
        recipients: [] as number[],
    });

    // Load contacts when bot is selected
    useEffect(() => {
        if (data.bot_id) {
            loadContacts(parseInt(data.bot_id));
        } else {
            setContacts([]);
            setSelectedContacts([]);
        }
    }, [data.bot_id]);

    const loadContacts = async (botId: number) => {
        setLoadingContacts(true);
        try {
            const response = await fetch(`/user/telegram/broadcast/contacts/${botId}`);
            const result = await response.json();
            setContacts(result.contacts || []);
        } catch (error) {
            console.error('Failed to load contacts:', error);
            setContacts([]);
        } finally {
            setLoadingContacts(false);
        }
    };

    const handleToggleContact = (chatId: number) => {
        setSelectedContacts(prev => {
            const newSelection = prev.includes(chatId)
                ? prev.filter(id => id !== chatId)
                : [...prev, chatId];
            setData('recipients', newSelection);
            return newSelection;
        });
    };

    const handleSelectAll = () => {
        const allChatIds = contacts.map(c => c.chat_id);
        setSelectedContacts(allChatIds);
        setData('recipients', allChatIds);
    };

    const handleDeselectAll = () => {
        setSelectedContacts([]);
        setData('recipients', []);
    };

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();

        if (!data.bot_id) {
            alert('Pilih bot terlebih dahulu');
            return;
        }

        if (!data.message.trim()) {
            alert('Pesan tidak boleh kosong');
            return;
        }

        if (selectedContacts.length === 0) {
            alert('Pilih minimal 1 penerima');
            return;
        }

        post('/user/telegram/broadcast/send', {
            onSuccess: () => {
                setData('message', '');
                setSelectedContacts([]);
                setData('recipients', []);
            },
        });
    };

    return (
        <UserLayout>
            <Head title="Telegram Broadcast" />

            <div className="space-y-6">
                {/* Header */}
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Telegram Broadcast</h1>
                    <p className="text-muted-foreground mt-2">
                        Kirim pesan ke banyak subscriber sekaligus
                    </p>
                </div>

                {bots.length === 0 ? (
                    <Card className="border-yellow-500 bg-yellow-50">
                        <CardContent className="pt-6">
                            <div className="flex flex-col items-center justify-center py-8">
                                <Bot className="size-16 text-yellow-600 mb-4" />
                                <h3 className="text-xl font-semibold mb-2">Tidak Ada Bot Aktif</h3>
                                <p className="text-muted-foreground text-center mb-4">
                                    Anda perlu memiliki minimal 1 bot Telegram untuk menggunakan fitur broadcast
                                </p>
                                <Button onClick={() => router.visit('/user/telegram')}>
                                    Kelola Bot Telegram
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid gap-6 md:grid-cols-2">
                            {/* Left Column */}
                            <div className="space-y-6">
                                {/* Bot Selection */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Pilih Bot</CardTitle>
                                        <CardDescription>
                                            Pilih bot yang akan digunakan untuk broadcast
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <Select
                                            value={data.bot_id}
                                            onValueChange={(value) => setData('bot_id', value)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Pilih bot..." />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {bots.map((bot) => (
                                                    <SelectItem key={bot.id} value={bot.id.toString()}>
                                                        @{bot.bot_username} ({bot.contacts_count} kontak)
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {errors.bot_id && (
                                            <p className="text-sm text-destructive mt-2">{errors.bot_id}</p>
                                        )}
                                    </CardContent>
                                </Card>

                                {/* Message */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Pesan</CardTitle>
                                        <CardDescription>
                                            Tulis pesan yang akan dikirim (mendukung HTML)
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <RichTextEditor
                                            content={data.message}
                                            onChange={(content) => setData('message', content)}
                                            placeholder="Ketik pesan Anda di sini..."
                                        />
                                        {errors.message && (
                                            <p className="text-sm text-destructive mt-2">{errors.message}</p>
                                        )}
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Right Column - Recipients */}
                            <div className="space-y-4">
                                <Card>
                                    <CardHeader>
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <CardTitle className="flex items-center gap-2">
                                                    <Users className="size-5 text-primary" />
                                                    Pilih Penerima
                                                </CardTitle>
                                                <CardDescription>
                                                    {data.bot_id
                                                        ? `${selectedContacts.length} dari ${contacts.length} dipilih`
                                                        : 'Pilih bot terlebih dahulu'}
                                                </CardDescription>
                                            </div>
                                            {contacts.length > 0 && (
                                                <div className="flex gap-2">
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={handleSelectAll}
                                                    >
                                                        Pilih Semua
                                                    </Button>
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={handleDeselectAll}
                                                    >
                                                        Batal Pilih
                                                    </Button>
                                                </div>
                                            )}
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        {!data.bot_id ? (
                                            <div className="text-center p-8 border rounded-lg bg-muted/50">
                                                <Bot className="size-10 mx-auto text-muted-foreground mb-2" />
                                                <p className="text-sm text-muted-foreground">
                                                    Pilih bot untuk melihat daftar subscriber
                                                </p>
                                            </div>
                                        ) : loadingContacts ? (
                                            <div className="text-center p-8">
                                                <p className="text-muted-foreground">Memuat kontak...</p>
                                            </div>
                                        ) : contacts.length === 0 ? (
                                            <div className="text-center p-8 border rounded-lg bg-muted/50">
                                                <Users className="size-10 mx-auto text-muted-foreground mb-2" />
                                                <p className="text-sm text-muted-foreground">
                                                    Belum ada subscriber yang menghubungi bot ini
                                                </p>
                                            </div>
                                        ) : (
                                            <div className="max-h-96 overflow-y-auto space-y-2 rounded-lg border p-3">
                                                {contacts.map((contact) => (
                                                    <div
                                                        key={contact.id}
                                                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors"
                                                    >
                                                        <Checkbox
                                                            id={`contact-${contact.id}`}
                                                            checked={selectedContacts.includes(contact.chat_id)}
                                                            onCheckedChange={() => handleToggleContact(contact.chat_id)}
                                                        />
                                                        <label
                                                            htmlFor={`contact-${contact.id}`}
                                                            className="flex-1 cursor-pointer"
                                                        >
                                                            <p className="text-sm font-medium">
                                                                {contact.display_name}
                                                            </p>
                                                            <p className="text-xs text-muted-foreground">
                                                                {contact.username && `@${contact.username} • `}
                                                                <Badge variant="outline" className="text-xs">
                                                                    {contact.chat_type}
                                                                </Badge>
                                                            </p>
                                                        </label>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                        {errors.recipients && (
                                            <p className="text-sm text-destructive mt-2">{errors.recipients}</p>
                                        )}
                                    </CardContent>
                                </Card>
                            </div>
                        </div>

                        {/* Submit */}
                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium">Siap mengirim broadcast?</p>
                                        <p className="text-sm text-muted-foreground">
                                            Pesan akan dikirim ke {selectedContacts.length} penerima
                                        </p>
                                    </div>
                                    <Button type="submit" disabled={processing} size="lg">
                                        <Send className="mr-2 size-4" />
                                        {processing ? 'Mengirim...' : 'Kirim Broadcast'}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </form>
                )}
            </div>
        </UserLayout>
    );
}
