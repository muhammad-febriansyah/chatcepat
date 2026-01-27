import { Head, useForm } from '@inertiajs/react';
import UserLayout from '@/layouts/user/user-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Send, FileText, Image as ImageIcon, Video, FileDown } from 'lucide-react';
import { useState } from 'react';

interface Bot {
    id: number;
    name: string;
    username: string;
}

interface Contact {
    id: number;
    display_name: string;
    telegram_id?: string;
    username?: string;
}

interface Props {
    bots: Bot[];
    contacts: Contact[];
    messages: any[];
}

export default function TelegramMessages({ bots, contacts }: Props) {
    const [messageType, setMessageType] = useState<'text' | 'file'>('text');

    const textForm = useForm({
        bot_id: '',
        chat_id: '',
        message: '',
    });

    const fileForm = useForm({
        bot_id: '',
        chat_id: '',
        file: null as File | null,
        type: 'document' as 'photo' | 'video' | 'document',
        caption: '',
    });

    const handleSendText = (e: React.FormEvent) => {
        e.preventDefault();
        textForm.post('/user/telegram/messages/send-text', {
            onSuccess: () => textForm.reset('message'),
        });
    };

    const handleSendFile = (e: React.FormEvent) => {
        e.preventDefault();
        fileForm.post('/user/telegram/messages/send-file', {
            onSuccess: () => {
                fileForm.reset('file', 'caption');
            },
        });
    };

    return (
        <UserLayout>
            <Head title="Send Message" />

            <div className="max-w-4xl mx-auto space-y-6">
                <div>
                    <h1 className="text-3xl font-bold">Send Message</h1>
                    <p className="text-muted-foreground mt-2">
                        Send text messages or files via Telegram
                    </p>
                </div>

                <Tabs value={messageType} onValueChange={(v) => setMessageType(v as any)}>
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="text" className="gap-2">
                            <FileText className="h-4 w-4" />
                            Text Message
                        </TabsTrigger>
                        <TabsTrigger value="file" className="gap-2">
                            <FileDown className="h-4 w-4" />
                            Send File
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="text">
                        <Card>
                            <CardHeader>
                                <CardTitle>Send Text Message</CardTitle>
                                <CardDescription>
                                    Send a text message to a Telegram user or group
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleSendText} className="space-y-4">
                                    <div className="space-y-2">
                                        <Label>Select Bot</Label>
                                        <Select
                                            value={textForm.data.bot_id}
                                            onValueChange={(value) => textForm.setData('bot_id', value)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Choose a bot" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {bots.map((bot) => (
                                                    <SelectItem key={bot.id} value={bot.id.toString()}>
                                                        {bot.name} (@{bot.username})
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="chat_id">Chat ID</Label>
                                        <Input
                                            id="chat_id"
                                            placeholder="Enter chat ID or username"
                                            value={textForm.data.chat_id}
                                            onChange={(e) => textForm.setData('chat_id', e.target.value)}
                                            required
                                        />
                                        <p className="text-sm text-muted-foreground">
                                            Enter Telegram user ID, username (@username), or group chat ID
                                        </p>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="message">Message</Label>
                                        <Textarea
                                            id="message"
                                            placeholder="Type your message..."
                                            value={textForm.data.message}
                                            onChange={(e) => textForm.setData('message', e.target.value)}
                                            rows={6}
                                            required
                                        />
                                        {textForm.errors.message && (
                                            <p className="text-sm text-destructive">{textForm.errors.message}</p>
                                        )}
                                    </div>

                                    <Button
                                        type="submit"
                                        className="w-full"
                                        disabled={textForm.processing}
                                    >
                                        <Send className="mr-2 h-4 w-4" />
                                        {textForm.processing ? 'Sending...' : 'Send Message'}
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="file">
                        <Card>
                            <CardHeader>
                                <CardTitle>Send File</CardTitle>
                                <CardDescription>
                                    Send photo, video, or document to Telegram
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleSendFile} className="space-y-4">
                                    <div className="space-y-2">
                                        <Label>Select Bot</Label>
                                        <Select
                                            value={fileForm.data.bot_id}
                                            onValueChange={(value) => fileForm.setData('bot_id', value)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Choose a bot" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {bots.map((bot) => (
                                                    <SelectItem key={bot.id} value={bot.id.toString()}>
                                                        {bot.name} (@{bot.username})
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="chat_id_file">Chat ID</Label>
                                        <Input
                                            id="chat_id_file"
                                            placeholder="Enter chat ID or username"
                                            value={fileForm.data.chat_id}
                                            onChange={(e) => fileForm.setData('chat_id', e.target.value)}
                                            required
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label>File Type</Label>
                                        <Select
                                            value={fileForm.data.type}
                                            onValueChange={(value: any) => fileForm.setData('type', value)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="photo">
                                                    <div className="flex items-center gap-2">
                                                        <ImageIcon className="h-4 w-4" />
                                                        Photo
                                                    </div>
                                                </SelectItem>
                                                <SelectItem value="video">
                                                    <div className="flex items-center gap-2">
                                                        <Video className="h-4 w-4" />
                                                        Video
                                                    </div>
                                                </SelectItem>
                                                <SelectItem value="document">
                                                    <div className="flex items-center gap-2">
                                                        <FileDown className="h-4 w-4" />
                                                        Document
                                                    </div>
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="file">Select File</Label>
                                        <Input
                                            id="file"
                                            type="file"
                                            onChange={(e) => fileForm.setData('file', e.target.files?.[0] || null)}
                                            accept={
                                                fileForm.data.type === 'photo' ? 'image/*' :
                                                fileForm.data.type === 'video' ? 'video/*' : '*'
                                            }
                                            required
                                        />
                                        {fileForm.errors.file && (
                                            <p className="text-sm text-destructive">{fileForm.errors.file}</p>
                                        )}
                                        <p className="text-sm text-muted-foreground">
                                            Maximum file size: 50MB
                                        </p>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="caption">Caption (Optional)</Label>
                                        <Textarea
                                            id="caption"
                                            placeholder="Add a caption..."
                                            value={fileForm.data.caption}
                                            onChange={(e) => fileForm.setData('caption', e.target.value)}
                                            rows={3}
                                        />
                                    </div>

                                    <Button
                                        type="submit"
                                        className="w-full"
                                        disabled={fileForm.processing}
                                    >
                                        <Send className="mr-2 h-4 w-4" />
                                        {fileForm.processing ? 'Sending...' : 'Send File'}
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </UserLayout>
    );
}
