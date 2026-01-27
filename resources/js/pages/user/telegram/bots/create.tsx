import { Head, useForm, Link } from '@inertiajs/react';
import UserLayout from '@/layouts/user/user-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, Bot, AlertCircle } from 'lucide-react';

export default function CreateTelegramBot() {
    const form = useForm({
        name: '',
        username: '',
        description: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        form.post('/user/telegram/bots');
    };

    return (
        <UserLayout>
            <Head title="Create Telegram Bot" />

            <div className="max-w-2xl mx-auto space-y-6">
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="icon" asChild>
                        <Link href="/user/telegram/bots">
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold">Create Telegram Bot</h1>
                        <p className="text-muted-foreground mt-1">
                            Bot will be created automatically via BotFather
                        </p>
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-3">
                            <Bot className="h-6 w-6 text-primary" />
                            <div>
                                <CardTitle>Bot Information</CardTitle>
                                <CardDescription>
                                    Enter details for your new Telegram bot
                                </CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="name">Bot Name *</Label>
                                <Input
                                    id="name"
                                    placeholder="My Awesome Bot"
                                    value={form.data.name}
                                    onChange={(e) => form.setData('name', e.target.value)}
                                    required
                                />
                                {form.errors.name && (
                                    <p className="text-sm text-destructive">{form.errors.name}</p>
                                )}
                                <p className="text-sm text-muted-foreground">
                                    This will be displayed as your bot's name
                                </p>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="username">Bot Username *</Label>
                                <Input
                                    id="username"
                                    placeholder="my_awesome_bot"
                                    value={form.data.username}
                                    onChange={(e) => form.setData('username', e.target.value)}
                                    required
                                />
                                {form.errors.username && (
                                    <p className="text-sm text-destructive">{form.errors.username}</p>
                                )}
                                <p className="text-sm text-muted-foreground">
                                    Must be unique and end with 'bot' (e.g., my_awesome_bot)
                                </p>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description">Description (Optional)</Label>
                                <Textarea
                                    id="description"
                                    placeholder="Describe what your bot does..."
                                    value={form.data.description}
                                    onChange={(e) => form.setData('description', e.target.value)}
                                    rows={4}
                                />
                                {form.errors.description && (
                                    <p className="text-sm text-destructive">{form.errors.description}</p>
                                )}
                            </div>

                            <Alert>
                                <AlertCircle className="h-4 w-4" />
                                <AlertDescription>
                                    <strong>Note:</strong> The bot will be created automatically via BotFather.
                                    Make sure your Telegram session is active and you have proper permissions.
                                </AlertDescription>
                            </Alert>

                            <div className="flex gap-3">
                                <Button
                                    type="button"
                                    variant="outline"
                                    asChild
                                    className="flex-1"
                                >
                                    <Link href="/user/telegram/bots">Cancel</Link>
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={form.processing}
                                    className="flex-1"
                                >
                                    {form.processing ? 'Creating Bot...' : 'Create Bot'}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>

                <Card className="border-primary/20 bg-primary/5">
                    <CardHeader>
                        <CardTitle className="text-lg">How it works</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                        <p>1. We will connect to BotFather on your behalf</p>
                        <p>2. Create a new bot with the information you provided</p>
                        <p>3. Retrieve the bot token automatically</p>
                        <p>4. Setup webhook for receiving messages</p>
                        <p>5. Your bot will be ready to use!</p>
                    </CardContent>
                </Card>
            </div>
        </UserLayout>
    );
}
