import { Head, useForm } from '@inertiajs/react';
import UserLayout from '@/layouts/user/user-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import { FormEvent } from 'react';

interface ContactGroup {
    id: number;
    name: string;
}

interface Props {
    groups: ContactGroup[];
}

export default function MetaContactCreate({ groups }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        platform: 'whatsapp',
        identifier: '',
        name: '',
        username: '',
        email: '',
        custom_fields: {},
        tags: [] as string[],
        notes: '',
        groups: [] as number[],
    });

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        post('/user/meta/contacts');
    };

    const toggleGroup = (groupId: number) => {
        setData('groups',
            data.groups.includes(groupId)
                ? data.groups.filter(id => id !== groupId)
                : [...data.groups, groupId]
        );
    };

    return (
        <UserLayout>
            <Head title="Add Contact" />

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
                        <h1 className="text-3xl font-bold tracking-tight">Add Contact</h1>
                        <p className="text-muted-foreground mt-1">
                            Add a new contact to your list
                        </p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Basic Info */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Basic Information</CardTitle>
                            <CardDescription>
                                Essential contact details
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
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
                                <Label htmlFor="identifier">
                                    {data.platform === 'whatsapp' ? 'Phone Number' : 'User ID'} *
                                </Label>
                                <Input
                                    id="identifier"
                                    value={data.identifier}
                                    onChange={(e) => setData('identifier', e.target.value)}
                                    placeholder={
                                        data.platform === 'whatsapp'
                                            ? '+6281234567890'
                                            : 'user_id_or_username'
                                    }
                                />
                                {errors.identifier && (
                                    <p className="text-sm text-destructive">{errors.identifier}</p>
                                )}
                            </div>

                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Name</Label>
                                    <Input
                                        id="name"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        placeholder="Contact name"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="username">Username</Label>
                                    <Input
                                        id="username"
                                        value={data.username}
                                        onChange={(e) => setData('username', e.target.value)}
                                        placeholder="@username"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    placeholder="email@example.com"
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Groups */}
                    {groups.length > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Groups</CardTitle>
                                <CardDescription>
                                    Assign this contact to groups
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    {groups.map((group) => (
                                        <div key={group.id} className="flex items-center space-x-2">
                                            <Checkbox
                                                id={`group-${group.id}`}
                                                checked={data.groups.includes(group.id)}
                                                onCheckedChange={() => toggleGroup(group.id)}
                                            />
                                            <Label
                                                htmlFor={`group-${group.id}`}
                                                className="cursor-pointer"
                                            >
                                                {group.name}
                                            </Label>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Additional Info */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Additional Information</CardTitle>
                            <CardDescription>
                                Optional details about this contact
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="notes">Notes</Label>
                                <Textarea
                                    id="notes"
                                    value={data.notes}
                                    onChange={(e) => setData('notes', e.target.value)}
                                    placeholder="Add notes about this contact..."
                                    rows={4}
                                />
                            </div>
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
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Save className="h-4 w-4" />
                                    Add Contact
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
