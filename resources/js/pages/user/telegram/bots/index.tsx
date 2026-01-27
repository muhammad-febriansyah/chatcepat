import { Head, Link, useForm, router } from '@inertiajs/react';
import UserLayout from '@/layouts/user/user-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bot, Plus, Power, MessageSquare, Trash2 } from 'lucide-react';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface TelegramBot {
    id: number;
    name: string;
    username: string;
    description?: string;
    is_active: boolean;
    auto_reply_enabled: boolean;
    last_activity_at?: string;
}

interface Props {
    bots: TelegramBot[];
}

export default function TelegramBots({ bots }: Props) {
    const toggleActive = (botId: number) => {
        router.post(`/user/telegram/bots/${botId}/toggle-active`);
    };

    const toggleAutoReply = (botId: number) => {
        router.post(`/user/telegram/bots/${botId}/toggle-auto-reply`);
    };

    const deleteBot = (botId: number) => {
        router.delete(`/user/telegram/bots/${botId}`);
    };

    return (
        <UserLayout>
            <Head title="Telegram Bots" />

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">Telegram Bots</h1>
                        <p className="text-muted-foreground mt-2">
                            Manage your Telegram bots
                        </p>
                    </div>
                    <Button asChild>
                        <Link href="/user/telegram/bots/create">
                            <Plus className="mr-2 h-4 w-4" />
                            Create New Bot
                        </Link>
                    </Button>
                </div>

                {bots.length === 0 ? (
                    <Card>
                        <CardContent className="flex flex-col items-center justify-center py-12">
                            <Bot className="h-16 w-16 text-muted-foreground mb-4" />
                            <h3 className="text-lg font-semibold mb-2">No Bots Yet</h3>
                            <p className="text-sm text-muted-foreground mb-4">
                                Create your first Telegram bot to get started
                            </p>
                            <Button asChild>
                                <Link href="/user/telegram/bots/create">
                                    <Plus className="mr-2 h-4 w-4" />
                                    Create Bot
                                </Link>
                            </Button>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {bots.map((bot) => (
                            <Card key={bot.id}>
                                <CardHeader>
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 rounded-lg bg-primary/10">
                                                <Bot className="h-5 w-5 text-primary" />
                                            </div>
                                            <div>
                                                <CardTitle className="text-lg">{bot.name}</CardTitle>
                                                <CardDescription>@{bot.username}</CardDescription>
                                            </div>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {bot.description && (
                                        <p className="text-sm text-muted-foreground line-clamp-2">
                                            {bot.description}
                                        </p>
                                    )}

                                    <div className="flex flex-wrap gap-2">
                                        <Badge variant={bot.is_active ? 'default' : 'secondary'}>
                                            {bot.is_active ? 'Active' : 'Inactive'}
                                        </Badge>
                                        {bot.auto_reply_enabled && (
                                            <Badge variant="outline">Auto Reply</Badge>
                                        )}
                                    </div>

                                    {bot.last_activity_at && (
                                        <p className="text-xs text-muted-foreground">
                                            Last activity: {new Date(bot.last_activity_at).toLocaleString()}
                                        </p>
                                    )}

                                    <div className="flex gap-2">
                                        <Button
                                            size="sm"
                                            variant={bot.is_active ? 'outline' : 'default'}
                                            onClick={() => toggleActive(bot.id)}
                                            className="flex-1"
                                        >
                                            <Power className="mr-2 h-4 w-4" />
                                            {bot.is_active ? 'Disable' : 'Enable'}
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => toggleAutoReply(bot.id)}
                                        >
                                            <MessageSquare className="h-4 w-4" />
                                        </Button>
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button size="sm" variant="outline">
                                                    <Trash2 className="h-4 w-4 text-destructive" />
                                                </Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>Delete Bot?</AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        This will permanently delete {bot.name}. This action cannot be undone.
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                    <AlertDialogAction onClick={() => deleteBot(bot.id)}>
                                                        Delete
                                                    </AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </UserLayout>
    );
}
