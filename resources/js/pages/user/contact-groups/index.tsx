import { Head, router, useForm } from '@inertiajs/react';
import UserLayout from '@/layouts/user/user-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
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
import { Plus, Users, Trash2, Edit2, UserPlus, RefreshCw, Phone, X, FolderPlus, Search, Database, Send, Users2, MoreHorizontal } from 'lucide-react';
import { useState, FormEvent, useMemo } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { DataTable } from '@/components/ui/data-table';
import { ColumnDef } from '@tanstack/react-table';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface WhatsAppSession {
    id: number;
    session_id: string;
    phone_number: string;
    name: string;
    status: string;
}

interface GroupMember {
    id: number;
    phone_number: string;
    name: string | null;
}

interface ContactGroup {
    id: number;
    name: string;
    description: string | null;
    source: 'manual' | 'whatsapp';
    members_count: number;
    members: GroupMember[];
    created_at: string;
}

interface SavedContact {
    id: number;
    phone_number: string;
    name: string;
}

interface ContactGroupsPageProps {
    groups: ContactGroup[];
    sessions: WhatsAppSession[];
    contacts: SavedContact[];
}

export default function ContactGroupsPage({ groups, sessions, contacts }: ContactGroupsPageProps) {
    const [showCreateDialog, setShowCreateDialog] = useState(false);
    const [showAddMembersDialog, setShowAddMembersDialog] = useState(false);
    const [showEditDialog, setShowEditDialog] = useState(false);
    const [selectedGroup, setSelectedGroup] = useState<ContactGroup | null>(null);
    const [memberInputs, setMemberInputs] = useState<{ phone_number: string; name: string }[]>([
        { phone_number: '', name: '' }
    ]);
    const [selectedContacts, setSelectedContacts] = useState<number[]>([]);
    const [contactSearch, setContactSearch] = useState('');
    const [showMembersDialog, setShowMembersDialog] = useState(false);
    const [selectedGroupForMembers, setSelectedGroupForMembers] = useState<ContactGroup | null>(null);
    const [selectedMemberIds, setSelectedMemberIds] = useState<number[]>([]);
    const [memberSearch, setMemberSearch] = useState('');
    const [bulkDeleting, setBulkDeleting] = useState(false);

    // Define columns for DataTable
    const columns: ColumnDef<ContactGroup>[] = [
        {
            accessorKey: 'name',
            header: 'Nama Grup',
            cell: ({ row }) => {
                const group = row.original;
                return (
                    <div className="flex items-center gap-2">
                        <Users className="size-4 text-primary" />
                        <div>
                            <p className="font-medium">{group.name}</p>
                            {group.description && (
                                <p className="text-xs text-muted-foreground line-clamp-1">
                                    {group.description}
                                </p>
                            )}
                        </div>
                    </div>
                );
            },
        },
        {
            accessorKey: 'source',
            header: 'Sumber',
            cell: ({ row }) => {
                const source = row.original.source;
                return (
                    <Badge variant={source === 'manual' ? 'default' : 'secondary'}>
                        {source === 'manual' ? 'Manual' : 'WhatsApp'}
                    </Badge>
                );
            },
        },
        {
            accessorKey: 'members_count',
            header: 'Anggota',
            cell: ({ row }) => {
                const count = row.original.members_count;
                return (
                    <div className="flex items-center gap-2">
                        <Phone className="size-4 text-muted-foreground" />
                        <span>{count} anggota</span>
                    </div>
                );
            },
        },
        {
            accessorKey: 'created_at',
            header: 'Dibuat',
            cell: ({ row }) => {
                const date = new Date(row.original.created_at);
                return (
                    <span className="text-sm text-muted-foreground">
                        {date.toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                        })}
                    </span>
                );
            },
        },
        {
            id: 'actions',
            header: 'Aksi',
            cell: ({ row }) => {
                const group = row.original;
                return (
                    <div className="flex items-center gap-1">
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 gap-1"
                            onClick={() => openAddMembersDialog(group)}
                        >
                            <UserPlus className="size-3.5" />
                            Tambah
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 gap-1"
                            onClick={() => openMembersDialog(group)}
                        >
                            <Users2 className="size-3.5" />
                            Kelola ({group.members_count})
                        </Button>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                    <MoreHorizontal className="size-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Aksi</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => openEditDialog(group)}>
                                    <Edit2 className="mr-2 size-4" />
                                    Edit Grup
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    className="text-destructive focus:text-destructive"
                                    onClick={() => handleDeleteGroup(group.id, group.name)}
                                >
                                    <Trash2 className="mr-2 size-4" />
                                    Hapus Grup
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                );
            },
        },
    ];

    // Filter contacts based on search
    const filteredContacts = useMemo(() => {
        if (!contactSearch.trim()) return contacts;
        const search = contactSearch.toLowerCase();
        return contacts.filter(c =>
            c.name.toLowerCase().includes(search) ||
            c.phone_number.includes(search)
        );
    }, [contacts, contactSearch]);

    const createForm = useForm({
        name: '',
        description: '',
    });

    const editForm = useForm({
        name: '',
        description: '',
    });

    const syncForm = useForm({
        session_id: '',
    });

    const handleCreateGroup = (e: FormEvent) => {
        e.preventDefault();
        createForm.post('/user/contact-groups', {
            onSuccess: () => {
                setShowCreateDialog(false);
                createForm.reset();
            },
        });
    };

    const handleEditGroup = (e: FormEvent) => {
        e.preventDefault();
        if (!selectedGroup) return;
        editForm.put(`/user/contact-groups/${selectedGroup.id}`, {
            onSuccess: () => {
                setShowEditDialog(false);
                setSelectedGroup(null);
                editForm.reset();
            },
        });
    };

    const handleDeleteGroup = (groupId: number, groupName: string) => {
        if (confirm(`Apakah Anda yakin ingin menghapus grup "${groupName}"? Semua anggota grup akan dihapus. Tindakan ini tidak dapat dibatalkan.`)) {
            router.delete(`/user/contact-groups/${groupId}`);
        }
    };

    // Helper function to normalize phone number to 62xxx format
    const normalizePhoneNumber = (phone: string): string => {
        // Remove all non-digit characters
        let cleaned = phone.replace(/\D/g, '');

        // Convert various formats to 62xxx
        if (cleaned.startsWith('0')) {
            cleaned = '62' + cleaned.substring(1);
        } else if (cleaned.startsWith('8')) {
            cleaned = '62' + cleaned;
        } else if (cleaned.startsWith('+62')) {
            cleaned = cleaned.substring(1);
        }

        return cleaned;
    };

    const handleAddMembers = (e: FormEvent) => {
        e.preventDefault();
        if (!selectedGroup) return;

        let members: { phone_number: string; name: string }[] = [];

        // Get selected contacts from database
        if (selectedContacts.length > 0) {
            const contactMembers = selectedContacts.map(contactId => {
                const contact = contacts.find(c => c.id === contactId);
                return {
                    phone_number: contact?.phone_number || '',
                    name: contact?.name || '',
                };
            }).filter(m => m.phone_number);
            members = [...members, ...contactMembers];
        }

        // Get valid manual inputs and normalize phone numbers
        const validInputs = memberInputs.filter(m => m.phone_number.trim());
        if (validInputs.length > 0) {
            const manualMembers = validInputs.map(m => ({
                phone_number: normalizePhoneNumber(m.phone_number),
                name: m.name || '',
            }));
            members = [...members, ...manualMembers];
        }

        if (members.length === 0) {
            alert('Pilih kontak atau masukkan minimal satu nomor telepon.');
            return;
        }

        router.post(`/user/contact-groups/${selectedGroup.id}/members`, {
            members,
        }, {
            onSuccess: () => {
                setShowAddMembersDialog(false);
                setSelectedGroup(null);
                setMemberInputs([{ phone_number: '', name: '' }]);
                setSelectedContacts([]);
                setContactSearch('');
            },
        });
    };

    const handleRemoveMember = (groupId: number, memberId: number) => {
        router.delete(`/user/contact-groups/${groupId}/members/${memberId}`);
    };

    const handleSyncFromWhatsApp = (e: FormEvent) => {
        e.preventDefault();
        syncForm.post('/user/contact-groups/sync-whatsapp');
    };

    const openEditDialog = (group: ContactGroup) => {
        setSelectedGroup(group);
        editForm.setData({
            name: group.name,
            description: group.description || '',
        });
        setShowEditDialog(true);
    };

    const openAddMembersDialog = (group: ContactGroup) => {
        setSelectedGroup(group);
        setMemberInputs([{ phone_number: '', name: '' }]);
        setSelectedContacts([]);
        setContactSearch('');
        setShowAddMembersDialog(true);
    };

    const toggleContactSelection = (contactId: number) => {
        setSelectedContacts(prev =>
            prev.includes(contactId)
                ? prev.filter(id => id !== contactId)
                : [...prev, contactId]
        );
    };

    const toggleSelectAll = () => {
        if (selectedContacts.length === filteredContacts.length) {
            setSelectedContacts([]);
        } else {
            setSelectedContacts(filteredContacts.map(c => c.id));
        }
    };

    const addMemberInput = () => {
        setMemberInputs([...memberInputs, { phone_number: '', name: '' }]);
    };

    const removeMemberInput = (index: number) => {
        setMemberInputs(memberInputs.filter((_, i) => i !== index));
    };

    const updateMemberInput = (index: number, field: 'phone_number' | 'name', value: string) => {
        const newInputs = [...memberInputs];
        newInputs[index][field] = value;
        setMemberInputs(newInputs);
    };

    const openMembersDialog = (group: ContactGroup) => {
        setSelectedGroupForMembers(group);
        setSelectedMemberIds([]);
        setMemberSearch('');
        setShowMembersDialog(true);
    };

    const toggleMemberSelection = (memberId: number) => {
        setSelectedMemberIds(prev =>
            prev.includes(memberId)
                ? prev.filter(id => id !== memberId)
                : [...prev, memberId]
        );
    };

    const toggleSelectAllMembers = () => {
        if (!selectedGroupForMembers) return;
        const filtered = filteredMembers;

        if (selectedMemberIds.length === filtered.length && filtered.length > 0) {
            setSelectedMemberIds([]);
        } else {
            setSelectedMemberIds(filtered.map(m => m.id));
        }
    };

    const handleBulkDeleteMembers = () => {
        if (selectedMemberIds.length === 0 || !selectedGroupForMembers) return;

        if (!confirm(`Apakah Anda yakin ingin menghapus ${selectedMemberIds.length} anggota dari grup "${selectedGroupForMembers.name}"?`)) {
            return;
        }

        setBulkDeleting(true);
        router.post(`/user/contact-groups/${selectedGroupForMembers.id}/members/bulk-delete`, {
            ids: selectedMemberIds,
        }, {
            preserveScroll: true,
            onSuccess: () => {
                setSelectedMemberIds([]);
                setShowMembersDialog(false);
                setSelectedGroupForMembers(null);
            },
            onFinish: () => {
                setBulkDeleting(false);
            },
        });
    };

    const filteredMembers = useMemo(() => {
        if (!selectedGroupForMembers) return [];
        if (!memberSearch.trim()) return selectedGroupForMembers.members;

        const search = memberSearch.toLowerCase();
        return selectedGroupForMembers.members.filter(m =>
            m.phone_number.includes(search) ||
            (m.name && m.name.toLowerCase().includes(search))
        );
    }, [selectedGroupForMembers, memberSearch]);

    return (
        <UserLayout>
            <Head title="Kelola Grup Kontak" />

            <div className="space-y-6">
                {/* Header */}
                <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-6 border">
                    <div className="absolute inset-0 bg-grid-white/10 [mask-image:radial-gradient(white,transparent_85%)]" />
                    <div className="relative flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight text-foreground">Kelola Grup Kontak</h1>
                            <p className="text-muted-foreground mt-1">
                                Buat dan kelola grup kontak untuk broadcast WhatsApp
                            </p>
                        </div>
                        <div className="flex gap-3">
                            {/* Continue to Broadcast Button - Show when there are groups with members */}
                            {groups.some(g => g.members_count > 0) && (
                                <Button
                                    size="lg"
                                    className="gap-2"
                                    onClick={() => router.visit('/user/broadcast')}
                                >
                                    <Send className="size-4" />
                                    Lanjutkan Broadcast
                                </Button>
                            )}

                            {/* Sync from WhatsApp */}
                            {sessions.length > 0 && (
                                <Dialog>
                                    <DialogTrigger asChild>
                                        <Button variant="outline" size="lg" className="gap-2">
                                            <RefreshCw className="size-4" />
                                            Sync dari WhatsApp
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                        <form onSubmit={handleSyncFromWhatsApp}>
                                            <DialogHeader>
                                                <DialogTitle>Sync Grup dari WhatsApp</DialogTitle>
                                                <DialogDescription>
                                                    Ambil daftar grup dan anggotanya dari sesi WhatsApp yang terhubung
                                                </DialogDescription>
                                            </DialogHeader>
                                            <div className="py-4">
                                                <Label>Pilih Sesi WhatsApp</Label>
                                                <Select
                                                    value={syncForm.data.session_id}
                                                    onValueChange={(value) => syncForm.setData('session_id', value)}
                                                >
                                                    <SelectTrigger className="mt-2">
                                                        <SelectValue placeholder="Pilih sesi..." />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {sessions.map((session) => (
                                                            <SelectItem key={session.id} value={session.id.toString()}>
                                                                {session.name} ({session.phone_number})
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <DialogFooter>
                                                <Button type="submit" disabled={syncForm.processing || !syncForm.data.session_id}>
                                                    <RefreshCw className={`mr-2 size-4 ${syncForm.processing ? 'animate-spin' : ''}`} />
                                                    {syncForm.processing ? 'Menyinkronkan...' : 'Sync Sekarang'}
                                                </Button>
                                            </DialogFooter>
                                        </form>
                                    </DialogContent>
                                </Dialog>
                            )}

                            {/* Create Group */}
                            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                                <DialogTrigger asChild>
                                    <Button size="lg" className="gap-2">
                                        <FolderPlus className="size-4" />
                                        Buat Grup Baru
                                    </Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <form onSubmit={handleCreateGroup}>
                                        <DialogHeader>
                                            <DialogTitle>Buat Grup Baru</DialogTitle>
                                            <DialogDescription>
                                                Buat grup kontak baru untuk mengorganisir penerima broadcast
                                            </DialogDescription>
                                        </DialogHeader>
                                        <div className="py-4 space-y-4">
                                            <div>
                                                <Label htmlFor="name">Nama Grup</Label>
                                                <Input
                                                    id="name"
                                                    value={createForm.data.name}
                                                    onChange={(e) => createForm.setData('name', e.target.value)}
                                                    placeholder="Contoh: Pelanggan VIP"
                                                    className="mt-2"
                                                />
                                                {createForm.errors.name && (
                                                    <p className="text-sm text-destructive mt-1">{createForm.errors.name}</p>
                                                )}
                                            </div>
                                            <div>
                                                <Label htmlFor="description">Deskripsi (Opsional)</Label>
                                                <Textarea
                                                    id="description"
                                                    value={createForm.data.description}
                                                    onChange={(e) => createForm.setData('description', e.target.value)}
                                                    placeholder="Deskripsi singkat tentang grup ini..."
                                                    className="mt-2"
                                                    rows={3}
                                                />
                                            </div>
                                        </div>
                                        <DialogFooter>
                                            <Button type="button" variant="outline" onClick={() => setShowCreateDialog(false)}>
                                                Batal
                                            </Button>
                                            <Button type="submit" disabled={createForm.processing}>
                                                {createForm.processing ? 'Menyimpan...' : 'Simpan'}
                                            </Button>
                                        </DialogFooter>
                                    </form>
                                </DialogContent>
                            </Dialog>
                        </div>
                    </div>
                </div>

                <Card className="overflow-hidden border-2">
                    <div className="h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <FolderPlus className="size-5 text-primary" />
                            Daftar Grup Kontak
                        </CardTitle>
                        <CardDescription>
                            Kelola grup kontak Anda di sini. Total: {groups.length} grup
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {groups.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12">
                                <Users className="size-16 text-muted-foreground mb-4" />
                                <h3 className="text-xl font-semibold mb-2">Belum Ada Grup</h3>
                                <p className="text-muted-foreground text-center mb-4">
                                    Buat grup kontak untuk mengorganisir penerima broadcast Anda
                                </p>
                                <Button onClick={() => setShowCreateDialog(true)}>
                                    <Plus className="mr-2 size-4" />
                                    Buat Grup Pertama
                                </Button>
                            </div>
                        ) : (
                            <DataTable
                                columns={columns}
                                data={groups}
                                searchKey="name"
                                searchPlaceholder="Cari nama grup..."
                            />
                        )}
                    </CardContent>
                </Card>

                {/* Edit Dialog */}
                <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
                    <DialogContent>
                        <form onSubmit={handleEditGroup}>
                            <DialogHeader>
                                <DialogTitle>Edit Grup</DialogTitle>
                                <DialogDescription>
                                    Ubah nama atau deskripsi grup
                                </DialogDescription>
                            </DialogHeader>
                            <div className="py-4 space-y-4">
                                <div>
                                    <Label htmlFor="edit-name">Nama Grup</Label>
                                    <Input
                                        id="edit-name"
                                        value={editForm.data.name}
                                        onChange={(e) => editForm.setData('name', e.target.value)}
                                        className="mt-2"
                                    />
                                    {editForm.errors.name && (
                                        <p className="text-sm text-destructive mt-1">{editForm.errors.name}</p>
                                    )}
                                </div>
                                <div>
                                    <Label htmlFor="edit-description">Deskripsi (Opsional)</Label>
                                    <Textarea
                                        id="edit-description"
                                        value={editForm.data.description}
                                        onChange={(e) => editForm.setData('description', e.target.value)}
                                        className="mt-2"
                                        rows={3}
                                    />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button type="button" variant="outline" onClick={() => setShowEditDialog(false)}>
                                    Batal
                                </Button>
                                <Button type="submit" disabled={editForm.processing}>
                                    {editForm.processing ? 'Menyimpan...' : 'Simpan'}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>

                {/* Add Members Dialog */}
                <Dialog open={showAddMembersDialog} onOpenChange={setShowAddMembersDialog}>
                    <DialogContent className="max-w-md max-h-[85vh] flex flex-col overflow-hidden">
                        <form onSubmit={handleAddMembers} className="flex flex-col min-h-0 flex-1">
                            <DialogHeader className="pb-4 shrink-0">
                                <DialogTitle className="flex items-center gap-2">
                                    <UserPlus className="size-5 text-primary" />
                                    Tambah Anggota
                                </DialogTitle>
                                <DialogDescription>
                                    Tambahkan anggota ke grup "{selectedGroup?.name}"
                                </DialogDescription>
                            </DialogHeader>

                            <div className="space-y-5 overflow-y-auto flex-1 min-h-0 pr-2">
                                {/* Section: Pilih dari Kontak */}
                                {contacts.length > 0 && (
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-medium flex items-center gap-2">
                                                <Database className="size-4" />
                                                Pilih dari Kontak
                                            </span>
                                            {selectedContacts.length > 0 && (
                                                <Badge variant="default" className="text-xs">
                                                    {selectedContacts.length} dipilih
                                                </Badge>
                                            )}
                                        </div>

                                        <div className="relative">
                                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                                            <Input
                                                placeholder="Cari nama atau nomor..."
                                                value={contactSearch}
                                                onChange={(e) => setContactSearch(e.target.value)}
                                                className="pl-9 h-9"
                                            />
                                        </div>

                                        <div
                                            className="flex items-center gap-2 cursor-pointer"
                                            onClick={toggleSelectAll}
                                        >
                                            <div
                                                className={`h-4 w-4 rounded border flex items-center justify-center ${selectedContacts.length === filteredContacts.length && filteredContacts.length > 0
                                                    ? 'bg-primary border-primary'
                                                    : 'border-input'
                                                    }`}
                                            >
                                                {selectedContacts.length === filteredContacts.length && filteredContacts.length > 0 && (
                                                    <svg className="h-3 w-3 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                                    </svg>
                                                )}
                                            </div>
                                            <span className="text-sm text-muted-foreground">Pilih Semua</span>
                                        </div>

                                        <ScrollArea className="h-[140px] border rounded-lg">
                                            <div className="p-1.5 space-y-0.5">
                                                {filteredContacts.length === 0 ? (
                                                    <p className="text-center text-muted-foreground py-6 text-sm">
                                                        Tidak ada kontak ditemukan
                                                    </p>
                                                ) : (
                                                    filteredContacts.map((contact) => {
                                                        const isSelected = selectedContacts.includes(contact.id);
                                                        return (
                                                            <div
                                                                key={contact.id}
                                                                className={`flex items-center gap-2.5 px-2 py-1.5 rounded cursor-pointer hover:bg-muted/50 transition-colors ${isSelected ? 'bg-primary/10' : ''
                                                                    }`}
                                                                onClick={() => toggleContactSelection(contact.id)}
                                                            >
                                                                <div
                                                                    className={`h-4 w-4 rounded border flex items-center justify-center shrink-0 ${isSelected ? 'bg-primary border-primary' : 'border-input'
                                                                        }`}
                                                                >
                                                                    {isSelected && (
                                                                        <svg className="h-3 w-3 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                                                        </svg>
                                                                    )}
                                                                </div>
                                                                <div className="flex-1 min-w-0">
                                                                    <p className="font-medium truncate text-sm leading-tight">{contact.name}</p>
                                                                    <p className="text-xs text-muted-foreground font-mono leading-tight">
                                                                        {contact.phone_number}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        );
                                                    })
                                                )}
                                            </div>
                                        </ScrollArea>
                                    </div>
                                )}

                                {/* Divider */}
                                {contacts.length > 0 && (
                                    <div className="relative py-1">
                                        <div className="absolute inset-0 flex items-center">
                                            <span className="w-full border-t" />
                                        </div>
                                        <div className="relative flex justify-center text-xs">
                                            <span className="bg-background px-3 text-muted-foreground">atau</span>
                                        </div>
                                    </div>
                                )}

                                {/* Section: Input Manual */}
                                <div className="space-y-2">
                                    <span className="text-sm font-medium flex items-center gap-2">
                                        <Phone className="size-4" />
                                        Input Manual
                                    </span>

                                    <div className="space-y-2">
                                        {memberInputs.map((input, index) => (
                                            <div key={index} className="space-y-2 p-3 border rounded-lg bg-muted/30">
                                                <div className="flex gap-2 items-start">
                                                    <div className="flex-1 space-y-2">
                                                        <Input
                                                            placeholder="Nomor: 08123456789"
                                                            value={input.phone_number}
                                                            onChange={(e) => updateMemberInput(index, 'phone_number', e.target.value)}
                                                            className="h-9"
                                                        />
                                                        <Input
                                                            placeholder="Nama: Budi Santoso (opsional)"
                                                            value={input.name}
                                                            onChange={(e) => updateMemberInput(index, 'name', e.target.value)}
                                                            className="h-9"
                                                        />
                                                    </div>
                                                    {memberInputs.length > 1 && (
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="icon"
                                                            className="shrink-0 h-9 w-9 text-muted-foreground hover:text-destructive"
                                                            onClick={() => removeMemberInput(index)}
                                                        >
                                                            <X className="size-4" />
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={addMemberInput}
                                        className="w-full h-8"
                                    >
                                        <Plus className="mr-1.5 size-3.5" />
                                        Tambah Nomor
                                    </Button>

                                    <p className="text-xs text-muted-foreground">
                                        Format 08xxx otomatis dikonversi ke 628xxx
                                    </p>
                                </div>
                            </div>

                            <DialogFooter className="pt-5 shrink-0 mt-4">
                                <Button type="button" variant="outline" size="sm" onClick={() => setShowAddMembersDialog(false)}>
                                    Batal
                                </Button>
                                <Button type="submit" size="sm">
                                    <UserPlus className="mr-1.5 size-4" />
                                    Simpan
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>

                {/* Manage Members Dialog */}
                <Dialog open={showMembersDialog} onOpenChange={setShowMembersDialog}>
                    <DialogContent className="max-w-2xl">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                                <Users2 className="size-5 text-primary" />
                                Kelola Anggota Grup
                            </DialogTitle>
                            <DialogDescription>
                                Kelola anggota dari grup "{selectedGroupForMembers?.name}"
                            </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-4">
                            {/* Search */}
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                                <Input
                                    placeholder="Cari nomor atau nama..."
                                    value={memberSearch}
                                    onChange={(e) => setMemberSearch(e.target.value)}
                                    className="pl-9"
                                />
                            </div>

                            {/* Bulk Actions Bar */}
                            {selectedMemberIds.length > 0 && (
                                <Card className="border-primary">
                                    <CardContent className="py-3">
                                        <div className="flex items-center justify-between">
                                            <p className="text-sm font-medium">
                                                {selectedMemberIds.length} anggota dipilih
                                            </p>
                                            <Button
                                                variant="destructive"
                                                size="sm"
                                                onClick={handleBulkDeleteMembers}
                                                disabled={bulkDeleting}
                                                className="gap-2"
                                            >
                                                <Trash2 className="size-4" />
                                                {bulkDeleting ? 'Menghapus...' : 'Hapus Terpilih'}
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                            {/* Select All */}
                            <div
                                className="flex items-center gap-2 cursor-pointer p-2 hover:bg-muted/50 rounded-lg"
                                onClick={toggleSelectAllMembers}
                            >
                                <Checkbox
                                    checked={selectedMemberIds.length === filteredMembers.length && filteredMembers.length > 0}
                                    onCheckedChange={toggleSelectAllMembers}
                                />
                                <span className="text-sm font-medium">
                                    {selectedMemberIds.length === filteredMembers.length && filteredMembers.length > 0
                                        ? 'Batalkan Pilih Semua'
                                        : 'Pilih Semua'}
                                </span>
                                <Badge variant="outline" className="ml-auto">
                                    {filteredMembers.length} anggota
                                </Badge>
                            </div>

                            {/* Members List */}
                            <ScrollArea className="h-[400px] border rounded-lg">
                                <div className="p-3 space-y-2">
                                    {filteredMembers.length === 0 ? (
                                        <div className="text-center py-8">
                                            <Users className="size-12 mx-auto text-muted-foreground mb-2" />
                                            <p className="text-sm text-muted-foreground">
                                                {memberSearch ? 'Tidak ada anggota ditemukan' : 'Grup ini belum memiliki anggota'}
                                            </p>
                                        </div>
                                    ) : (
                                        filteredMembers.map((member) => (
                                            <div
                                                key={member.id}
                                                className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                                                    selectedMemberIds.includes(member.id)
                                                        ? 'bg-primary/10 border-primary'
                                                        : 'hover:bg-muted/50'
                                                }`}
                                            >
                                                <Checkbox
                                                    checked={selectedMemberIds.includes(member.id)}
                                                    onCheckedChange={() => toggleMemberSelection(member.id)}
                                                />
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-mono text-sm font-medium">{member.phone_number}</p>
                                                    {member.name && (
                                                        <p className="text-xs text-muted-foreground truncate">{member.name}</p>
                                                    )}
                                                </div>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-8 w-8 p-0 shrink-0"
                                                    onClick={() => handleRemoveMember(selectedGroupForMembers!.id, member.id)}
                                                >
                                                    <X className="size-4" />
                                                </Button>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </ScrollArea>
                        </div>

                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => {
                                    setShowMembersDialog(false);
                                    setSelectedMemberIds([]);
                                    setMemberSearch('');
                                }}
                            >
                                Tutup
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </UserLayout>
    );
}
