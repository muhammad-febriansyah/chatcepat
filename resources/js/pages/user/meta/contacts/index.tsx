import { Head, Link, router } from '@inertiajs/react';
import UserLayout from '@/layouts/user/user-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Users,
    Plus,
    Search,
    Filter,
    Edit,
    Trash2,
    Ban,
    MoreVertical,
    Download,
    Upload,
    UserPlus
} from 'lucide-react';
import { useState } from 'react';
import { format } from 'date-fns';

interface Contact {
    id: number;
    platform: 'whatsapp' | 'instagram' | 'facebook';
    identifier: string;
    name: string | null;
    username: string | null;
    email: string | null;
    is_blocked: boolean;
    last_message_at: string | null;
    created_at: string;
    groups: Array<{ id: number; name: string }>;
}

interface PaginatedContacts {
    data: Contact[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
}

interface Props {
    contacts: PaginatedContacts;
    groups: Array<{ id: number; name: string; contacts_count: number }>;
    filters: {
        platform?: string;
        group?: string;
        search?: string;
        blocked?: string;
    };
}

export default function MetaContactIndex({ contacts, groups, filters }: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [platform, setPlatform] = useState(filters.platform || 'all');
    const [group, setGroup] = useState(filters.group || 'all');
    const [blocked, setBlocked] = useState(filters.blocked || 'all');
    const [selectedContacts, setSelectedContacts] = useState<number[]>([]);

    const handleSearch = () => {
        router.get('/user/meta/contacts', {
            search: search || undefined,
            platform: platform !== 'all' ? platform : undefined,
            group: group !== 'all' ? group : undefined,
            blocked: blocked !== 'all' ? blocked : undefined,
        }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleToggleBlock = (id: number) => {
        router.post(`/user/meta/contacts/${id}/toggle-block`, {}, {
            preserveScroll: true,
        });
    };

    const handleDelete = (id: number, name: string) => {
        if (confirm(`Are you sure you want to delete contact "${name || 'Unknown'}"?`)) {
            router.delete(`/user/meta/contacts/${id}`, {
                preserveScroll: true,
            });
        }
    };

    const handleBulkDelete = () => {
        if (selectedContacts.length === 0) return;
        if (confirm(`Are you sure you want to delete ${selectedContacts.length} contacts?`)) {
            router.post('/user/meta/contacts/bulk-delete', {
                ids: selectedContacts,
            }, {
                preserveScroll: true,
                onSuccess: () => setSelectedContacts([]),
            });
        }
    };

    const handleSelectAll = () => {
        if (selectedContacts.length === contacts.data.length) {
            setSelectedContacts([]);
        } else {
            setSelectedContacts(contacts.data.map(c => c.id));
        }
    };

    const toggleContactSelection = (id: number) => {
        setSelectedContacts(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    return (
        <UserLayout>
            <Head title="Contacts" />

            <div className="space-y-6">
                {/* Header */}
                <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-6 border">
                    <div className="absolute inset-0 bg-grid-white/10 [mask-image:radial-gradient(white,transparent_85%)]" />
                    <div className="relative flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight text-foreground">
                                Contact Management
                            </h1>
                            <p className="text-muted-foreground mt-1">
                                Manage contacts across all platforms
                            </p>
                        </div>
                        <div className="flex gap-3">
                            <Button variant="outline" size="lg" className="gap-2">
                                <Download className="h-4 w-4" />
                                Export
                            </Button>
                            <Button variant="outline" size="lg" className="gap-2">
                                <Upload className="h-4 w-4" />
                                Import
                            </Button>
                            <Link href="/user/meta/contacts/create">
                                <Button size="lg" className="gap-2 shadow-lg hover:shadow-xl transition-all">
                                    <Plus className="h-4 w-4" />
                                    Add Contact
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid gap-4 md:grid-cols-4">
                    <Card className="overflow-hidden border-2">
                        <div className="h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">Total Contacts</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold">{contacts.total}</div>
                        </CardContent>
                    </Card>

                    <Card className="overflow-hidden border-2">
                        <div className="h-1 bg-gradient-to-r from-green-500 to-emerald-500" />
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">WhatsApp</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold">
                                {contacts.data.filter(c => c.platform === 'whatsapp').length}
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="overflow-hidden border-2">
                        <div className="h-1 bg-gradient-to-r from-pink-500 to-rose-500" />
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">Instagram</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold">
                                {contacts.data.filter(c => c.platform === 'instagram').length}
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="overflow-hidden border-2">
                        <div className="h-1 bg-gradient-to-r from-blue-500 to-indigo-500" />
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">Facebook</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold">
                                {contacts.data.filter(c => c.platform === 'facebook').length}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Filters */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <Filter className="h-5 w-5" />
                            Filters
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex gap-3">
                            <div className="flex-1">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Search by name, identifier, or email..."
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                        className="pl-10"
                                    />
                                </div>
                            </div>
                            <Select value={platform} onValueChange={setPlatform}>
                                <SelectTrigger className="w-[150px]">
                                    <SelectValue placeholder="Platform" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Platforms</SelectItem>
                                    <SelectItem value="whatsapp">WhatsApp</SelectItem>
                                    <SelectItem value="instagram">Instagram</SelectItem>
                                    <SelectItem value="facebook">Facebook</SelectItem>
                                </SelectContent>
                            </Select>
                            <Select value={group} onValueChange={setGroup}>
                                <SelectTrigger className="w-[150px]">
                                    <SelectValue placeholder="Group" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Groups</SelectItem>
                                    {groups.map(g => (
                                        <SelectItem key={g.id} value={g.id.toString()}>
                                            {g.name} ({g.contacts_count})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Select value={blocked} onValueChange={setBlocked}>
                                <SelectTrigger className="w-[120px]">
                                    <SelectValue placeholder="Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All</SelectItem>
                                    <SelectItem value="0">Active</SelectItem>
                                    <SelectItem value="1">Blocked</SelectItem>
                                </SelectContent>
                            </Select>
                            <Button onClick={handleSearch}>
                                Apply
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Bulk Actions */}
                {selectedContacts.length > 0 && (
                    <Card className="border-primary">
                        <CardContent className="py-4">
                            <div className="flex items-center justify-between">
                                <p className="text-sm font-medium">
                                    {selectedContacts.length} contacts selected
                                </p>
                                <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={handleBulkDelete}
                                    className="gap-2"
                                >
                                    <Trash2 className="h-4 w-4" />
                                    Delete Selected
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Contacts List */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle>Contacts</CardTitle>
                                <CardDescription>
                                    Manage your contacts across all platforms
                                </CardDescription>
                            </div>
                            {contacts.data.length > 0 && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleSelectAll}
                                >
                                    {selectedContacts.length === contacts.data.length
                                        ? 'Deselect All'
                                        : 'Select All'}
                                </Button>
                            )}
                        </div>
                    </CardHeader>
                    <CardContent>
                        {contacts.data.length > 0 ? (
                            <div className="space-y-2">
                                {contacts.data.map((contact) => (
                                    <div
                                        key={contact.id}
                                        className="flex items-center gap-4 rounded-lg border p-4 transition-colors hover:bg-accent/50"
                                    >
                                        <Checkbox
                                            checked={selectedContacts.includes(contact.id)}
                                            onCheckedChange={() => toggleContactSelection(contact.id)}
                                        />

                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <p className="font-medium">
                                                    {contact.name || contact.identifier}
                                                </p>
                                                <Badge variant="outline" className="capitalize">
                                                    {contact.platform}
                                                </Badge>
                                                {contact.is_blocked && (
                                                    <Badge variant="destructive">Blocked</Badge>
                                                )}
                                                {contact.groups.length > 0 && (
                                                    <Badge variant="secondary">
                                                        {contact.groups.length} groups
                                                    </Badge>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                                <span>{contact.identifier}</span>
                                                {contact.email && <span>{contact.email}</span>}
                                                {contact.last_message_at && (
                                                    <span>
                                                        Last message: {format(new Date(contact.last_message_at), 'PP')}
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon">
                                                    <MoreVertical className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem asChild>
                                                    <Link
                                                        href={`/user/meta/contacts/${contact.id}/edit`}
                                                        className="gap-2"
                                                    >
                                                        <Edit className="h-4 w-4" />
                                                        Edit
                                                    </Link>
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    onClick={() => handleToggleBlock(contact.id)}
                                                    className="gap-2"
                                                >
                                                    <Ban className="h-4 w-4" />
                                                    {contact.is_blocked ? 'Unblock' : 'Block'}
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem
                                                    onClick={() => handleDelete(contact.id, contact.name || contact.identifier)}
                                                    className="gap-2 text-destructive"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                    Delete
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-16">
                                <div className="rounded-full bg-muted p-6 mb-4">
                                    <Users className="h-12 w-12 text-muted-foreground" />
                                </div>
                                <p className="text-base font-medium mb-2">No contacts yet</p>
                                <p className="text-sm text-muted-foreground mb-6">
                                    Add your first contact or import from file
                                </p>
                                <div className="flex gap-3">
                                    <Button variant="outline" className="gap-2">
                                        <Upload className="h-4 w-4" />
                                        Import Contacts
                                    </Button>
                                    <Link href="/user/meta/contacts/create">
                                        <Button className="gap-2">
                                            <Plus className="h-4 w-4" />
                                            Add Contact
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                        )}

                        {/* Pagination */}
                        {contacts.last_page > 1 && (
                            <div className="flex items-center justify-between mt-6 pt-6 border-t">
                                <p className="text-sm text-muted-foreground">
                                    Showing {contacts.data.length} of {contacts.total} contacts
                                </p>
                                <div className="flex gap-2">
                                    {contacts.current_page > 1 && (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => router.get(`/user/meta/contacts?page=${contacts.current_page - 1}`)}
                                        >
                                            Previous
                                        </Button>
                                    )}
                                    {contacts.current_page < contacts.last_page && (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => router.get(`/user/meta/contacts?page=${contacts.current_page + 1}`)}
                                        >
                                            Next
                                        </Button>
                                    )}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </UserLayout>
    );
}
