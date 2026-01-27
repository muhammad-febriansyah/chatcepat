import { Head, useForm } from '@inertiajs/react';
import UserLayout from '@/layouts/user/user-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { ArrowLeft, Save, Loader2, Send, Clock } from 'lucide-react';
import { FormEvent, useState } from 'react';

interface ContactGroup {
    id: number;
    name: string;
    contacts_count: number;
}

interface Props {
    contactGroups: ContactGroup[];
}

export default function MetaBroadcastCreate({ contactGroups }: Props) {
    const [scheduleType, setScheduleType] = useState<'now' | 'scheduled'>('now');

    const { data, setData, post, processing, errors } = useForm({
        platform: 'whatsapp',
        name: '',
        message_type: 'text',
        message_content: '',
        media_url: '',
        media_caption: '',
        template_name: '',
        recipient_type: 'all',
        recipient_groups: [] as number[],
        recipient_contacts: [] as number[],
        schedule_type: 'now',
        scheduled_at: '',
    });

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        post('/user/meta/broadcast');
    };

    const toggleGroup = (groupId: number) => {
        setData('recipient_groups',
            data.recipient_groups.includes(groupId)
                ? data.recipient_groups.filter(id => id !== groupId)
                : [...data.recipient_groups, groupId]
        );
    };

    return (
        <UserLayout>
            <Head title="Create Broadcast Campaign" />

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
                        <h1 className="text-3xl font-bold tracking-tight">Create Broadcast Campaign</h1>
                        <p className="text-muted-foreground mt-1">
                            Send messages to multiple contacts at once
                        </p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Basic Info */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Basic Information</CardTitle>
                            <CardDescription>
                                Configure campaign name and platform
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="platform">Platform *</Label>
                                    <Select
                                        value={data.platform}
                                        onValueChange={(value) => setData('platform', value)}
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
                                    <Label htmlFor="name">Campaign Name *</Label>
                                    <Input
                                        id="name"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        placeholder="e.g., New Year Promo"
                                    />
                                    {errors.name && (
                                        <p className="text-sm text-destructive">{errors.name}</p>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Message Content */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Message Content</CardTitle>
                            <CardDescription>
                                Configure what message to send
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="message_type">Message Type *</Label>
                                <Select
                                    value={data.message_type}
                                    onValueChange={(value) => setData('message_type', value)}
                                >
                                    <SelectTrigger id="message_type">
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

                            {data.message_type === 'text' && (
                                <div className="space-y-2">
                                    <Label htmlFor="message_content">Message *</Label>
                                    <Textarea
                                        id="message_content"
                                        value={data.message_content}
                                        onChange={(e) => setData('message_content', e.target.value)}
                                        placeholder="Enter your broadcast message"
                                        rows={6}
                                    />
                                    {errors.message_content && (
                                        <p className="text-sm text-destructive">{errors.message_content}</p>
                                    )}
                                </div>
                            )}

                            {['image', 'video', 'audio', 'document'].includes(data.message_type) && (
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
                                    {['image', 'video', 'document'].includes(data.message_type) && (
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

                            {data.message_type === 'template' && (
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

                    {/* Recipients */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Recipients</CardTitle>
                            <CardDescription>
                                Select who will receive this broadcast
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <RadioGroup
                                value={data.recipient_type}
                                onValueChange={(value) => setData('recipient_type', value)}
                            >
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="all" id="all" />
                                    <Label htmlFor="all" className="cursor-pointer">
                                        All Contacts
                                    </Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="groups" id="groups" />
                                    <Label htmlFor="groups" className="cursor-pointer">
                                        Specific Groups
                                    </Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="contacts" id="contacts" />
                                    <Label htmlFor="contacts" className="cursor-pointer">
                                        Specific Contacts
                                    </Label>
                                </div>
                            </RadioGroup>

                            {data.recipient_type === 'groups' && (
                                <div className="space-y-2 pt-2">
                                    <Label>Select Groups *</Label>
                                    {contactGroups.length > 0 ? (
                                        <div className="space-y-2 border rounded-lg p-4">
                                            {contactGroups.map((group) => (
                                                <div key={group.id} className="flex items-center space-x-2">
                                                    <Checkbox
                                                        id={`group-${group.id}`}
                                                        checked={data.recipient_groups.includes(group.id)}
                                                        onCheckedChange={() => toggleGroup(group.id)}
                                                    />
                                                    <Label
                                                        htmlFor={`group-${group.id}`}
                                                        className="cursor-pointer flex-1"
                                                    >
                                                        {group.name} ({group.contacts_count} contacts)
                                                    </Label>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-sm text-muted-foreground">
                                            No contact groups available. Create groups first.
                                        </p>
                                    )}
                                    {errors.recipient_groups && (
                                        <p className="text-sm text-destructive">{errors.recipient_groups}</p>
                                    )}
                                </div>
                            )}

                            {data.recipient_type === 'contacts' && (
                                <div className="space-y-2 pt-2">
                                    <Label>Select Contacts *</Label>
                                    <p className="text-sm text-muted-foreground">
                                        Contact selection will be implemented in the next step
                                    </p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Schedule */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Schedule</CardTitle>
                            <CardDescription>
                                When should this broadcast be sent?
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <RadioGroup
                                value={scheduleType}
                                onValueChange={(value: 'now' | 'scheduled') => {
                                    setScheduleType(value);
                                    setData('schedule_type', value);
                                }}
                            >
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="now" id="now" />
                                    <Label htmlFor="now" className="cursor-pointer">
                                        Send Now
                                    </Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="scheduled" id="scheduled" />
                                    <Label htmlFor="scheduled" className="cursor-pointer">
                                        Schedule for Later
                                    </Label>
                                </div>
                            </RadioGroup>

                            {scheduleType === 'scheduled' && (
                                <div className="space-y-2 pt-2">
                                    <Label htmlFor="scheduled_at">Schedule Date & Time *</Label>
                                    <Input
                                        id="scheduled_at"
                                        type="datetime-local"
                                        value={data.scheduled_at}
                                        onChange={(e) => setData('scheduled_at', e.target.value)}
                                    />
                                    {errors.scheduled_at && (
                                        <p className="text-sm text-destructive">{errors.scheduled_at}</p>
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
                            ) : scheduleType === 'now' ? (
                                <>
                                    <Send className="h-4 w-4" />
                                    Send Broadcast Now
                                </>
                            ) : (
                                <>
                                    <Clock className="h-4 w-4" />
                                    Schedule Broadcast
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
