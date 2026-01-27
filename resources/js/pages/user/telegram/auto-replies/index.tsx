import { Head, useForm, router } from '@inertiajs/react';
import UserLayout from '@/layouts/user/user-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { MessageSquare, Plus, Power, Trash2, BarChart3 } from 'lucide-react';
import { Switch } from '@/components/ui/switch';

interface AutoReply {
    id: number;
    name: string;
    trigger_type: string;
    trigger_value: string;
    reply_type: string;
    reply_content: string;
    is_active: boolean;
    priority: number;
    usage_count: number;
    telegram_bot: {
        name: string;
        username: string;
    };
}

interface Bot {
    id: number;
    name: string;
    username: string;
}

interface Props {
    autoReplies: AutoReply[];
    bots: Bot[];
}

export default function TelegramAutoReplies({ autoReplies, bots }: Props) {
    const form = useForm({
        bot_id: '',
        name: '',
        trigger_type: 'keyword' as 'keyword' | 'contains' | 'exact' | 'regex' | 'all',
        trigger_value: '',
        reply_type: 'text' as 'text' | 'photo' | 'video' | 'document',
        reply_content: '',
        reply_file: null as File | null,
        priority: 0,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        form.post('/user/telegram/auto-replies', {
            onSuccess: () => form.reset(),
        });
    };

    const toggleActive = (id: number) => {
        router.post(`/user/telegram/auto-replies/${id}/toggle`);
    };

    const deleteAutoReply = (id: number) => {
        if (confirm('Delete this auto reply?')) {
            router.delete(`/user/telegram/auto-replies/${id}`);
        }
    };

    const getTriggerTypeBadge = (type: string) => {
        const colors: Record<string, string> = {
            keyword: 'bg-blue-500',
            contains: 'bg-green-500',
            exact: 'bg-purple-500',
            regex: 'bg-orange-500',
            all: 'bg-gray-500',
        };
        return <Badge className={colors[type] || ''}>{type}</Badge>;
    };

    return (
        <UserLayout>
            <Head title="Auto Replies" />

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">Auto Replies</h1>
                        <p className="text-muted-foreground mt-2">
                            Automatically respond to messages with predefined replies
                        </p>
                    </div>
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button>
                                <Plus className="mr-2 h-4 w-4" />
                                New Auto Reply
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                                <DialogTitle>Create Auto Reply</DialogTitle>
                                <DialogDescription>
                                    Set up automatic responses for your Telegram bot
                                </DialogDescription>
                            </DialogHeader>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Select Bot</Label>
                                    <Select
                                        value={form.data.bot_id}
                                        onValueChange={(value) => form.setData('bot_id', value)}
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
                                    <Label htmlFor="name">Rule Name</Label>
                                    <Input
                                        id="name"
                                        placeholder="Welcome Message"
                                        value={form.data.name}
                                        onChange={(e) => form.setData('name', e.target.value)}
                                        required
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Trigger Type</Label>
                                        <Select
                                            value={form.data.trigger_type}
                                            onValueChange={(value: any) => form.setData('trigger_type', value)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="keyword">Keyword</SelectItem>
                                                <SelectItem value="contains">Contains</SelectItem>
                                                <SelectItem value="exact">Exact Match</SelectItem>
                                                <SelectItem value="regex">Regex</SelectItem>
                                                <SelectItem value="all">All Messages</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="trigger_value">Trigger Value</Label>
                                        <Input
                                            id="trigger_value"
                                            placeholder="hello, hi, start..."
                                            value={form.data.trigger_value}
                                            onChange={(e) => form.setData('trigger_value', e.target.value)}
                                            disabled={form.data.trigger_type === 'all'}
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Reply Type</Label>
                                        <Select
                                            value={form.data.reply_type}
                                            onValueChange={(value: any) => form.setData('reply_type', value)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="text">Text Only</SelectItem>
                                                <SelectItem value="photo">Photo</SelectItem>
                                                <SelectItem value="video">Video</SelectItem>
                                                <SelectItem value="document">Document</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="priority">Priority (0-100)</Label>
                                        <Input
                                            id="priority"
                                            type="number"
                                            min="0"
                                            max="100"
                                            value={form.data.priority}
                                            onChange={(e) => form.setData('priority', parseInt(e.target.value))}
                                        />
                                    </div>
                                </div>

                                {form.data.reply_type !== 'text' && (
                                    <div className="space-y-2">
                                        <Label htmlFor="file">Upload File</Label>
                                        <Input
                                            id="file"
                                            type="file"
                                            onChange={(e) => form.setData('reply_file', e.target.files?.[0] || null)}
                                        />
                                    </div>
                                )}

                                <div className="space-y-2">
                                    <Label htmlFor="reply">Reply Message</Label>
                                    <Textarea
                                        id="reply"
                                        placeholder="Your automated reply..."
                                        value={form.data.reply_content}
                                        onChange={(e) => form.setData('reply_content', e.target.value)}
                                        rows={4}
                                        required
                                    />
                                </div>

                                <Button type="submit" className="w-full" disabled={form.processing}>
                                    {form.processing ? 'Creating...' : 'Create Auto Reply'}
                                </Button>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>

                {autoReplies.length === 0 ? (
                    <Card>
                        <CardContent className="flex flex-col items-center justify-center py-12">
                            <MessageSquare className="h-16 w-16 text-muted-foreground mb-4" />
                            <h3 className="text-lg font-semibold mb-2">No Auto Replies Yet</h3>
                            <p className="text-sm text-muted-foreground mb-4">
                                Set up automatic responses for common messages
                            </p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid gap-4 md:grid-cols-2">
                        {autoReplies.map((reply) => (
                            <Card key={reply.id} className={!reply.is_active ? 'opacity-60' : ''}>
                                <CardHeader>
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <CardTitle className="text-lg">{reply.name}</CardTitle>
                                            <CardDescription>
                                                via {reply.telegram_bot.name}
                                            </CardDescription>
                                        </div>
                                        <Switch
                                            checked={reply.is_active}
                                            onCheckedChange={() => toggleActive(reply.id)}
                                        />
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex flex-wrap gap-2">
                                        {getTriggerTypeBadge(reply.trigger_type)}
                                        <Badge variant="outline">{reply.reply_type}</Badge>
                                        <Badge variant="secondary">Priority: {reply.priority}</Badge>
                                    </div>

                                    <div className="space-y-1">
                                        <p className="text-sm font-medium">Trigger:</p>
                                        <p className="text-sm text-muted-foreground">
                                            {reply.trigger_value || 'All messages'}
                                        </p>
                                    </div>

                                    <div className="space-y-1">
                                        <p className="text-sm font-medium">Reply:</p>
                                        <p className="text-sm text-muted-foreground line-clamp-2">
                                            {reply.reply_content}
                                        </p>
                                    </div>

                                    <div className="flex items-center gap-2 pt-2 border-t">
                                        <BarChart3 className="h-4 w-4 text-muted-foreground" />
                                        <span className="text-sm text-muted-foreground">
                                            Used {reply.usage_count} times
                                        </span>
                                    </div>

                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="w-full text-destructive"
                                        onClick={() => deleteAutoReply(reply.id)}
                                    >
                                        <Trash2 className="mr-2 h-4 w-4" />
                                        Delete
                                    </Button>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </UserLayout>
    );
}
