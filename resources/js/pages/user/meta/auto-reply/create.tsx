import { Head, useForm } from '@inertiajs/react';
import UserLayout from '@/layouts/user/user-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import { FormEvent } from 'react';

export default function MetaAutoReplyCreate() {
    const { data, setData, post, processing, errors } = useForm({
        platform: 'whatsapp',
        name: '',
        trigger_type: 'keyword',
        keywords: [''],
        match_type: 'contains',
        reply_type: 'text',
        reply_message: '',
        media_url: '',
        media_caption: '',
        template_name: '',
        only_first_message: false,
        is_active: true,
        priority: 10,
    });

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        post('/user/meta/auto-reply');
    };

    const addKeyword = () => {
        setData('keywords', [...data.keywords, '']);
    };

    const removeKeyword = (index: number) => {
        setData('keywords', data.keywords.filter((_, i) => i !== index));
    };

    const updateKeyword = (index: number, value: string) => {
        const newKeywords = [...data.keywords];
        newKeywords[index] = value;
        setData('keywords', newKeywords);
    };

    return (
        <UserLayout>
            <Head title="Create Auto Reply" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => window.history.back()}
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Create Auto Reply</h1>
                        <p className="text-muted-foreground mt-1">
                            Set up automated responses for incoming messages
                        </p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Basic Info */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Basic Information</CardTitle>
                            <CardDescription>
                                Configure the basic settings for your auto reply
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="platform">Platform *</Label>
                                    <Select
                                        value={data.platform}
                                        onValueChange={(value) => setData('platform', value as any)}
                                    >
                                        <SelectTrigger id="platform">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="whatsapp">WhatsApp</SelectItem>
                                            <SelectItem value="instagram">Instagram</SelectItem>
                                            <SelectItem value="facebook">Facebook</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {errors.platform && (
                                        <p className="text-sm text-destructive">{errors.platform}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="name">Name *</Label>
                                    <Input
                                        id="name"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        placeholder="e.g., Greeting Reply"
                                    />
                                    {errors.name && (
                                        <p className="text-sm text-destructive">{errors.name}</p>
                                    )}
                                </div>
                            </div>

                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="priority">Priority (0-100)</Label>
                                    <Input
                                        id="priority"
                                        type="number"
                                        min="0"
                                        max="100"
                                        value={data.priority}
                                        onChange={(e) => setData('priority', parseInt(e.target.value))}
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        Higher priority replies are checked first
                                    </p>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="is_active">Status</Label>
                                    <div className="flex items-center space-x-2 pt-2">
                                        <Switch
                                            id="is_active"
                                            checked={data.is_active}
                                            onCheckedChange={(checked) => setData('is_active', checked)}
                                        />
                                        <Label htmlFor="is_active" className="cursor-pointer">
                                            {data.is_active ? 'Active' : 'Inactive'}
                                        </Label>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Trigger Settings */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Trigger Settings</CardTitle>
                            <CardDescription>
                                Define when this auto reply should be triggered
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="trigger_type">Trigger Type *</Label>
                                    <Select
                                        value={data.trigger_type}
                                        onValueChange={(value) => setData('trigger_type', value as any)}
                                    >
                                        <SelectTrigger id="trigger_type">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="keyword">Keyword Match</SelectItem>
                                            <SelectItem value="all">All Messages</SelectItem>
                                            <SelectItem value="greeting">Greeting</SelectItem>
                                            <SelectItem value="away">Away Message</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                {data.trigger_type === 'keyword' && (
                                    <div className="space-y-2">
                                        <Label htmlFor="match_type">Match Type *</Label>
                                        <Select
                                            value={data.match_type}
                                            onValueChange={(value) => setData('match_type', value)}
                                        >
                                            <SelectTrigger id="match_type">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="exact">Exact Match</SelectItem>
                                                <SelectItem value="contains">Contains</SelectItem>
                                                <SelectItem value="starts_with">Starts With</SelectItem>
                                                <SelectItem value="ends_with">Ends With</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                )}
                            </div>

                            {data.trigger_type === 'keyword' && (
                                <div className="space-y-2">
                                    <Label>Keywords *</Label>
                                    {data.keywords.map((keyword, index) => (
                                        <div key={index} className="flex gap-2">
                                            <Input
                                                value={keyword}
                                                onChange={(e) => updateKeyword(index, e.target.value)}
                                                placeholder="Enter keyword"
                                            />
                                            {data.keywords.length > 1 && (
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    onClick={() => removeKeyword(index)}
                                                >
                                                    Remove
                                                </Button>
                                            )}
                                        </div>
                                    ))}
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={addKeyword}
                                    >
                                        Add Keyword
                                    </Button>
                                    {errors.keywords && (
                                        <p className="text-sm text-destructive">{errors.keywords}</p>
                                    )}
                                </div>
                            )}

                            <div className="flex items-center space-x-2">
                                <Switch
                                    id="only_first_message"
                                    checked={data.only_first_message}
                                    onCheckedChange={(checked) => setData('only_first_message', checked)}
                                />
                                <Label htmlFor="only_first_message" className="cursor-pointer">
                                    Only reply to first message from contact
                                </Label>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Reply Content */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Reply Content</CardTitle>
                            <CardDescription>
                                Configure what to send as auto reply
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="reply_type">Reply Type *</Label>
                                <Select
                                    value={data.reply_type}
                                    onValueChange={(value) => setData('reply_type', value)}
                                >
                                    <SelectTrigger id="reply_type">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="text">Text</SelectItem>
                                        <SelectItem value="image">Image</SelectItem>
                                        <SelectItem value="video">Video</SelectItem>
                                        <SelectItem value="audio">Audio</SelectItem>
                                        <SelectItem value="document">Document</SelectItem>
                                        <SelectItem value="template">Template</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {data.reply_type === 'text' && (
                                <div className="space-y-2">
                                    <Label htmlFor="reply_message">Message *</Label>
                                    <Textarea
                                        id="reply_message"
                                        value={data.reply_message}
                                        onChange={(e) => setData('reply_message', e.target.value)}
                                        placeholder="Enter your auto reply message"
                                        rows={5}
                                    />
                                    {errors.reply_message && (
                                        <p className="text-sm text-destructive">{errors.reply_message}</p>
                                    )}
                                </div>
                            )}

                            {['image', 'video', 'audio', 'document'].includes(data.reply_type) && (
                                <>
                                    <div className="space-y-2">
                                        <Label htmlFor="media_url">Media URL *</Label>
                                        <Input
                                            id="media_url"
                                            value={data.media_url}
                                            onChange={(e) => setData('media_url', e.target.value)}
                                            placeholder="https://example.com/media.jpg"
                                        />
                                        {errors.media_url && (
                                            <p className="text-sm text-destructive">{errors.media_url}</p>
                                        )}
                                    </div>
                                    {['image', 'video', 'document'].includes(data.reply_type) && (
                                        <div className="space-y-2">
                                            <Label htmlFor="media_caption">Caption (Optional)</Label>
                                            <Textarea
                                                id="media_caption"
                                                value={data.media_caption}
                                                onChange={(e) => setData('media_caption', e.target.value)}
                                                placeholder="Add a caption to your media"
                                                rows={3}
                                            />
                                        </div>
                                    )}
                                </>
                            )}

                            {data.reply_type === 'template' && (
                                <div className="space-y-2">
                                    <Label htmlFor="template_name">Template Name *</Label>
                                    <Input
                                        id="template_name"
                                        value={data.template_name}
                                        onChange={(e) => setData('template_name', e.target.value)}
                                        placeholder="e.g., hello_world"
                                    />
                                    {errors.template_name && (
                                        <p className="text-sm text-destructive">{errors.template_name}</p>
                                    )}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Actions */}
                    <div className="flex gap-3">
                        <Button
                            type="submit"
                            size="lg"
                            disabled={processing}
                            className="gap-2"
                        >
                            {processing ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Creating...
                                </>
                            ) : (
                                <>
                                    <Save className="h-4 w-4" />
                                    Create Auto Reply
                                </>
                            )}
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            size="lg"
                            onClick={() => window.history.back()}
                        >
                            Cancel
                        </Button>
                    </div>
                </form>
            </div>
        </UserLayout>
    );
}
