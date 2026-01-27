import { Head, useForm, Link } from '@inertiajs/react';
import UserLayout from '@/layouts/user/user-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowLeft, Megaphone, Users } from 'lucide-react';
import { useState } from 'react';

interface Bot {
    id: number;
    name: string;
    username: string;
}

interface Contact {
    id: number;
    display_name: string;
    username?: string;
}

interface Props {
    bots: Bot[];
    contacts: Contact[];
}

export default function CreateBroadcast({ bots, contacts }: Props) {
    const [selectedContacts, setSelectedContacts] = useState<number[]>([]);

    const form = useForm({
        bot_id: '',
        name: '',
        message_type: 'text' as 'text' | 'photo' | 'video' | 'document',
        message_content: '',
        file: null as File | null,
        contact_ids: [] as number[],
    });

    const toggleContact = (contactId: number) => {
        setSelectedContacts((prev) =>
            prev.includes(contactId)
                ? prev.filter((id) => id !== contactId)
                : [...prev, contactId]
        );
    };

    const selectAll = () => {
        setSelectedContacts(contacts.map((c) => c.id));
    };

    const deselectAll = () => {
        setSelectedContacts([]);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        form.setData('contact_ids', selectedContacts);
        form.post('/user/telegram/broadcasts');
    };

    return (
        <UserLayout>
            <Head title="Create Broadcast" />

            <div className="max-w-4xl mx-auto space-y-6">
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="icon" asChild>
                        <Link href="/user/telegram/broadcasts">
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold">Create Broadcast</h1>
                        <p className="text-muted-foreground mt-1">
                            Send message to multiple contacts at once
                        </p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Broadcast Details</CardTitle>
                            <CardDescription>Basic information about your broadcast</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
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
                                <Label htmlFor="name">Broadcast Name</Label>
                                <Input
                                    id="name"
                                    placeholder="New Year Promotion"
                                    value={form.data.name}
                                    onChange={(e) => form.setData('name', e.target.value)}
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Message Type</Label>
                                <Select
                                    value={form.data.message_type}
                                    onValueChange={(value: any) => form.setData('message_type', value)}
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

                            {form.data.message_type !== 'text' && (
                                <div className="space-y-2">
                                    <Label htmlFor="file">Upload File</Label>
                                    <Input
                                        id="file"
                                        type="file"
                                        onChange={(e) => form.setData('file', e.target.files?.[0] || null)}
                                        required
                                    />
                                </div>
                            )}

                            <div className="space-y-2">
                                <Label htmlFor="message">Message Content</Label>
                                <Textarea
                                    id="message"
                                    placeholder="Type your broadcast message..."
                                    value={form.data.message_content}
                                    onChange={(e) => form.setData('message_content', e.target.value)}
                                    rows={6}
                                    required
                                />
                                <p className="text-sm text-muted-foreground">
                                    {form.data.message_type !== 'text' ? 'This will be the caption' : 'Your message text'}
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="flex items-center gap-2">
                                        <Users className="h-5 w-5" />
                                        Select Recipients ({selectedContacts.length} selected)
                                    </CardTitle>
                                    <CardDescription>Choose contacts to receive this broadcast</CardDescription>
                                </div>
                                <div className="flex gap-2">
                                    <Button type="button" variant="outline" size="sm" onClick={selectAll}>
                                        Select All
                                    </Button>
                                    <Button type="button" variant="outline" size="sm" onClick={deselectAll}>
                                        Deselect All
                                    </Button>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {contacts.length === 0 ? (
                                <div className="text-center py-8 text-muted-foreground">
                                    <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
                                    <p>No contacts available</p>
                                    <p className="text-sm">Contacts will be added automatically when they message your bot</p>
                                </div>
                            ) : (
                                <div className="grid gap-3 max-h-96 overflow-y-auto">
                                    {contacts.map((contact) => (
                                        <div
                                            key={contact.id}
                                            className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-accent"
                                        >
                                            <Checkbox
                                                checked={selectedContacts.includes(contact.id)}
                                                onCheckedChange={() => toggleContact(contact.id)}
                                            />
                                            <div className="flex-1">
                                                <p className="font-medium">{contact.display_name}</p>
                                                {contact.username && (
                                                    <p className="text-sm text-muted-foreground">@{contact.username}</p>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                            {form.errors.contact_ids && (
                                <p className="text-sm text-destructive mt-2">{form.errors.contact_ids}</p>
                            )}
                        </CardContent>
                    </Card>

                    <div className="flex gap-3">
                        <Button type="button" variant="outline" asChild className="flex-1">
                            <Link href="/user/telegram/broadcasts">Cancel</Link>
                        </Button>
                        <Button
                            type="submit"
                            disabled={form.processing || selectedContacts.length === 0}
                            className="flex-1"
                        >
                            <Megaphone className="mr-2 h-4 w-4" />
                            {form.processing ? 'Sending...' : `Send to ${selectedContacts.length} contacts`}
                        </Button>
                    </div>
                </form>
            </div>
        </UserLayout>
    );
}
