import { Head, router, useForm } from '@inertiajs/react';
import UserLayout from '@/layouts/user/user-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
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
import { Plus, Users, Trash2, Edit2, UserPlus, RefreshCw, Phone, X, FolderPlus } from 'lucide-react';
import { useState, FormEvent } from 'react';

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

interface ContactGroupsPageProps {
    groups: ContactGroup[];
    sessions: WhatsAppSession[];
}

export default function ContactGroupsPage({ groups, sessions }: ContactGroupsPageProps) {
    const [showCreateDialog, setShowCreateDialog] = useState(false);
    const [showAddMembersDialog, setShowAddMembersDialog] = useState(false);
    const [showEditDialog, setShowEditDialog] = useState(false);
    const [selectedGroup, setSelectedGroup] = useState<ContactGroup | null>(null);
    const [memberInputs, setMemberInputs] = useState<{ phone_number: string; name: string }[]>([
        { phone_number: '', name: '' }
    ]);
    const [bulkInput, setBulkInput] = useState('');

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

    const handleDeleteGroup = (groupId: number) => {
        router.delete(`/user/contact-groups/${groupId}`);
    };

    const handleAddMembers = (e: FormEvent) => {
        e.preventDefault();
        if (!selectedGroup) return;

        // Parse bulk input (support comma, newline, semicolon separated)
        let members: { phone_number: string; name: string }[] = [];

        if (bulkInput.trim()) {
            const numbers = bulkInput.split(/[,;\n]+/).map(n => n.trim()).filter(n => n);
            members = numbers.map(phone_number => ({ phone_number, name: '' }));
        }

        // Add from individual inputs
        const validInputs = memberInputs.filter(m => m.phone_number.trim());
        members = [...members, ...validInputs];

        if (members.length === 0) {
            alert('Masukkan minimal satu nomor telepon.');
            return;
        }

        router.post(`/user/contact-groups/${selectedGroup.id}/members`, {
            members,
        }, {
            onSuccess: () => {
                setShowAddMembersDialog(false);
                setSelectedGroup(null);
                setMemberInputs([{ phone_number: '', name: '' }]);
                setBulkInput('');
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
        setBulkInput('');
        setShowAddMembersDialog(true);
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

    return (
        <UserLayout>
            <Head title="Kelola Grup Kontak" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Kelola Grup Kontak</h1>
                        <p className="text-muted-foreground mt-2">
                            Buat dan kelola grup kontak untuk broadcast WhatsApp
                        </p>
                    </div>
                    <div className="flex gap-2">
                        {/* Sync from WhatsApp */}
                        {sessions.length > 0 && (
                            <Dialog>
                                <DialogTrigger asChild>
                                    <Button variant="outline">
                                        <RefreshCw className="mr-2 size-4" />
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
                                <Button>
                                    <FolderPlus className="mr-2 size-4" />
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

                {/* Groups List */}
                {groups.length === 0 ? (
                    <Card>
                        <CardContent className="pt-6">
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
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {groups.map((group) => (
                            <Card key={group.id} className="flex flex-col">
                                <CardHeader>
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <CardTitle className="flex items-center gap-2">
                                                <Users className="size-5 text-primary" />
                                                {group.name}
                                            </CardTitle>
                                            {group.description && (
                                                <CardDescription className="mt-1">
                                                    {group.description}
                                                </CardDescription>
                                            )}
                                        </div>
                                        <Badge variant={group.source === 'manual' ? 'default' : 'secondary'}>
                                            {group.source === 'manual' ? 'Manual' : 'WhatsApp'}
                                        </Badge>
                                    </div>
                                </CardHeader>
                                <CardContent className="flex-1">
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                                        <Phone className="size-4" />
                                        <span>{group.members_count} anggota</span>
                                    </div>

                                    {/* Members Preview */}
                                    {group.members.length > 0 && (
                                        <div className="space-y-2 mb-4">
                                            <p className="text-xs font-medium text-muted-foreground">Anggota:</p>
                                            <div className="max-h-32 overflow-y-auto space-y-1">
                                                {group.members.slice(0, 5).map((member) => (
                                                    <div
                                                        key={member.id}
                                                        className="flex items-center justify-between text-sm bg-muted/50 rounded px-2 py-1"
                                                    >
                                                        <div className="flex-1 min-w-0">
                                                            <span className="font-mono text-xs">{member.phone_number}</span>
                                                            {member.name && (
                                                                <span className="text-muted-foreground ml-2 text-xs">
                                                                    ({member.name})
                                                                </span>
                                                            )}
                                                        </div>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="h-6 w-6 p-0 shrink-0"
                                                            onClick={() => handleRemoveMember(group.id, member.id)}
                                                        >
                                                            <X className="size-3" />
                                                        </Button>
                                                    </div>
                                                ))}
                                                {group.members.length > 5 && (
                                                    <p className="text-xs text-muted-foreground text-center">
                                                        +{group.members.length - 5} anggota lainnya
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* Actions */}
                                    <div className="flex gap-2 mt-auto pt-4 border-t">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="flex-1"
                                            onClick={() => openAddMembersDialog(group)}
                                        >
                                            <UserPlus className="mr-1 size-4" />
                                            Tambah
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => openEditDialog(group)}
                                        >
                                            <Edit2 className="size-4" />
                                        </Button>
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button variant="outline" size="sm">
                                                    <Trash2 className="size-4 text-destructive" />
                                                </Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>Hapus Grup?</AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        Grup "{group.name}" dan semua anggotanya akan dihapus. Tindakan ini tidak dapat dibatalkan.
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>Batal</AlertDialogCancel>
                                                    <AlertDialogAction
                                                        onClick={() => handleDeleteGroup(group.id)}
                                                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                                    >
                                                        Hapus
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
                    <DialogContent className="max-w-lg">
                        <form onSubmit={handleAddMembers}>
                            <DialogHeader>
                                <DialogTitle>Tambah Anggota</DialogTitle>
                                <DialogDescription>
                                    Tambahkan nomor telepon ke grup "{selectedGroup?.name}"
                                </DialogDescription>
                            </DialogHeader>
                            <div className="py-4 space-y-4">
                                {/* Bulk Input */}
                                <div>
                                    <Label>Input Massal</Label>
                                    <Textarea
                                        value={bulkInput}
                                        onChange={(e) => setBulkInput(e.target.value)}
                                        placeholder="Masukkan nomor dipisahkan dengan koma, titik koma, atau enter.&#10;Contoh:&#10;628123456789&#10;628987654321"
                                        className="mt-2 font-mono text-sm"
                                        rows={4}
                                    />
                                    <p className="text-xs text-muted-foreground mt-1">
                                        Format: 628xxxxxxxxxx (gunakan kode negara 62)
                                    </p>
                                </div>

                                <div className="relative">
                                    <div className="absolute inset-0 flex items-center">
                                        <span className="w-full border-t" />
                                    </div>
                                    <div className="relative flex justify-center text-xs uppercase">
                                        <span className="bg-background px-2 text-muted-foreground">atau input satu per satu</span>
                                    </div>
                                </div>

                                {/* Individual Inputs */}
                                <div className="space-y-3">
                                    {memberInputs.map((input, index) => (
                                        <div key={index} className="flex gap-2">
                                            <Input
                                                placeholder="628xxx"
                                                value={input.phone_number}
                                                onChange={(e) => updateMemberInput(index, 'phone_number', e.target.value)}
                                                className="flex-1 font-mono"
                                            />
                                            <Input
                                                placeholder="Nama (opsional)"
                                                value={input.name}
                                                onChange={(e) => updateMemberInput(index, 'name', e.target.value)}
                                                className="flex-1"
                                            />
                                            {memberInputs.length > 1 && (
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => removeMemberInput(index)}
                                                >
                                                    <X className="size-4" />
                                                </Button>
                                            )}
                                        </div>
                                    ))}
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={addMemberInput}
                                        className="w-full"
                                    >
                                        <Plus className="mr-2 size-4" />
                                        Tambah Baris
                                    </Button>
                                </div>
                            </div>
                            <DialogFooter>
                                <Button type="button" variant="outline" onClick={() => setShowAddMembersDialog(false)}>
                                    Batal
                                </Button>
                                <Button type="submit">
                                    <UserPlus className="mr-2 size-4" />
                                    Tambah Anggota
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>
        </UserLayout>
    );
}
