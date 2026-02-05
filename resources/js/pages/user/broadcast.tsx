import { Head, router, useForm } from '@inertiajs/react';
import { logger } from '@/utils/logger';
import axios from 'axios';
import UserLayout from '@/layouts/user/user-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { DateTimePicker } from '@/components/ui/date-time-picker';
import { Send, FileUp, MessageSquare, Users, X, UserPlus, Edit, FolderOpen, Calendar, Clock, FolderPlus, Eye, Database, Phone, Plus, Users2, Search } from 'lucide-react';
import { useState, FormEvent, useEffect, useMemo } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';

interface WhatsAppSession {
    id: number;
    session_id: string;
    phone_number: string;
    name: string;
    status: 'connected' | 'disconnected' | 'qr_pending' | 'failed';
}

interface Contact {
    id: number;
    phone_number: string;
    name: string;
    display_name?: string | null;
}

interface ContactGroup {
    id: number;
    name: string;
    description: string | null;
    source: 'manual' | 'whatsapp';
    members_count: number;
}

interface BroadcastPageProps {
    sessions: WhatsAppSession[];
    contacts: Contact[];
    contactGroups: ContactGroup[];
}

export default function BroadcastPage({ sessions, contacts = [], contactGroups = [] }: BroadcastPageProps) {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [recipients, setRecipients] = useState<string[]>([]);
    const [recipientInput, setRecipientInput] = useState('');
    const [selectedContacts, setSelectedContacts] = useState<number[]>([]);
    const [selectedGroups, setSelectedGroups] = useState<number[]>([]);
    const [loadingGroupMembers, setLoadingGroupMembers] = useState(false);
    const [broadcastType, setBroadcastType] = useState<'now' | 'scheduled'>('now');
    const [scheduledDate, setScheduledDate] = useState<Date | null>(null);
    const [showGroupDialog, setShowGroupDialog] = useState(false);
    const [showEditGroupDialog, setShowEditGroupDialog] = useState(false);
    const [selectedGroupForEdit, setSelectedGroupForEdit] = useState<ContactGroup | null>(null);
    const [showPreviewDialog, setShowPreviewDialog] = useState(false);
    const [previewRecipients, setPreviewRecipients] = useState<string[]>([]);
    const [previewLoading, setPreviewLoading] = useState(false);
    const [showAddMembersDialog, setShowAddMembersDialog] = useState(false);
    const [newlyCreatedGroup, setNewlyCreatedGroup] = useState<ContactGroup | null>(null);
    const [memberInputs, setMemberInputs] = useState<{ phone_number: string; name: string }[]>([{ phone_number: '', name: '' }]);
    const [selectedContactsForGroup, setSelectedContactsForGroup] = useState<number[]>([]);
    const [contactSearch, setContactSearch] = useState('');

    const { data, setData, post, processing, errors, reset } = useForm({
        session_id: '',
        message: '',
        recipients: [] as string[],
        file: null as File | null,
        broadcast_type: 'now' as 'now' | 'scheduled',
        scheduled_at: null as string | null,
        broadcast_name: null as string | null,
    });

    const groupForm = useForm({
        name: '',
        description: '',
    });

    const editGroupForm = useForm({
        name: '',
        description: '',
    });

    const connectedSessions = sessions.filter(s => s.status === 'connected');

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setSelectedFile(file);
            setData('file', file);
        }
    };

    const handleAddRecipient = () => {
        if (recipientInput.trim()) {
            const newRecipients = [...recipients, recipientInput.trim()];
            setRecipients(newRecipients);
            setData('recipients', newRecipients);
            setRecipientInput('');
        }
    };

    const handleRemoveRecipient = (index: number) => {
        const newRecipients = recipients.filter((_, i) => i !== index);
        setRecipients(newRecipients);
        setData('recipients', newRecipients);
    };

    const handleAddContactsFromDB = () => {
        const contactsToAdd = contacts
            .filter(c => selectedContacts.includes(c.id))
            .map(c => c.phone_number);

        const newRecipients = [...new Set([...recipients, ...contactsToAdd])]; // Remove duplicates
        setRecipients(newRecipients);
        setData('recipients', newRecipients);
        setSelectedContacts([]);
    };

    const handleToggleContact = (contactId: number) => {
        setSelectedContacts(prev =>
            prev.includes(contactId)
                ? prev.filter(id => id !== contactId)
                : [...prev, contactId]
        );
    };

    const handleToggleGroup = (groupId: number) => {
        setSelectedGroups(prev =>
            prev.includes(groupId)
                ? prev.filter(id => id !== groupId)
                : [...prev, groupId]
        );
    };

    const handleAddFromGroups = async () => {
        if (selectedGroups.length === 0) return;

        setLoadingGroupMembers(true);
        try {
            const allMembers: string[] = [];

            for (const groupId of selectedGroups) {
                const response = await axios.get(`/user/contact-groups/${groupId}/members`);
                const data = response.data;
                if (data.members) {
                    data.members.forEach((member: { phone_number: string }) => {
                        allMembers.push(member.phone_number);
                    });
                }
            }

            const newRecipients = [...new Set([...recipients, ...allMembers])];
            setRecipients(newRecipients);
            setData('recipients', newRecipients);
            setSelectedGroups([]);
        } catch (error) {
            logger.error('Failed to fetch group members:', error);
        } finally {
            setLoadingGroupMembers(false);
        }
    };

    const handleCreateGroup = async (e: FormEvent) => {
        e.preventDefault();

        try {
            // Send request with proper headers for JSON response
            const response = await axios.post('/user/contact-groups', {
                name: groupForm.data.name,
                description: groupForm.data.description,
            }, {
                headers: {
                    'Accept': 'application/json',
                },
            });

            // Get the created group from response (safe for SaaS - no ambiguity)
            const createdGroup = response.data.group as ContactGroup;

            // Reload contactGroups to get the updated list
            router.reload({ only: ['contactGroups'], preserveScroll: true, onSuccess: () => {
                setNewlyCreatedGroup(createdGroup);
                setShowGroupDialog(false);
                groupForm.reset();

                // Open add members dialog for the new group
                setShowAddMembersDialog(true);
            }});
        } catch (error) {
            console.error('Failed to create group:', error);
            alert('Gagal membuat grup. Silakan coba lagi.');
        }
    };

    const handleEditGroup = (e: FormEvent) => {
        e.preventDefault();
        if (!selectedGroupForEdit) return;
        editGroupForm.put(`/user/contact-groups/${selectedGroupForEdit.id}`, {
            onSuccess: () => {
                setShowEditGroupDialog(false);
                setSelectedGroupForEdit(null);
                editGroupForm.reset();
                router.reload({ only: ['contactGroups'] });
            },
        });
    };

    const openEditGroupDialog = (group: ContactGroup) => {
        setSelectedGroupForEdit(group);
        editGroupForm.setData({
            name: group.name,
            description: group.description || '',
        });
        setShowEditGroupDialog(true);
    };

    const deduplicateRecipients = (recipientList: string[]): string[] => {
        return [...new Set(recipientList)];
    };

    const handlePreviewRecipients = async () => {
        setPreviewLoading(true);
        try {
            let allRecipients: string[] = [];

            // 1. Manual inputs (already in recipients state)
            allRecipients = [...recipients];

            // 2. Selected contacts
            const contactsToAdd = contacts
                .filter(c => selectedContacts.includes(c.id))
                .map(c => c.phone_number);
            allRecipients = [...allRecipients, ...contactsToAdd];

            // 3. Selected groups members
            for (const groupId of selectedGroups) {
                const response = await axios.get(`/user/contact-groups/${groupId}/members`);
                const data = response.data;
                if (data.members) {
                    data.members.forEach((member: { phone_number: string }) => {
                        allRecipients.push(member.phone_number);
                    });
                }
            }

            const deduplicated = deduplicateRecipients(allRecipients);
            setPreviewRecipients(deduplicated);
            setShowPreviewDialog(true);
        } catch (error) {
            console.error('Failed to preview recipients:', error);
            alert('Gagal memuat preview penerima');
        } finally {
            setPreviewLoading(false);
        }
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        if (!data.session_id) {
            alert('Pilih sesi WhatsApp terlebih dahulu');
            return;
        }

        if (!data.message && !data.file) {
            alert('Isi pesan atau upload file');
            return;
        }

        await handlePreviewRecipients();
    };

    const confirmAndSend = () => {
        if (previewRecipients.length === 0) {
            alert('Tambahkan minimal 1 nomor penerima');
            return;
        }

        if (broadcastType === 'scheduled' && !scheduledDate) {
            alert('Pilih tanggal dan waktu pengiriman');
            return;
        }

        setData('broadcast_type', broadcastType);
        setData('scheduled_at', scheduledDate ? scheduledDate.toISOString() : null);
        setData('recipients', previewRecipients);

        post('/user/broadcast/send', {
            onSuccess: () => {
                reset();
                setSelectedFile(null);
                setRecipients([]);
                setRecipientInput('');
                setBroadcastType('now');
                setScheduledDate(null);
                setShowPreviewDialog(false);
                setPreviewRecipients([]);
                setSelectedContacts([]);
                setSelectedGroups([]);
            },
        });
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

    const toggleContactSelection = (contactId: number) => {
        setSelectedContactsForGroup(prev =>
            prev.includes(contactId)
                ? prev.filter(id => id !== contactId)
                : [...prev, contactId]
        );
    };

    const toggleSelectAll = () => {
        const filtered = filteredContacts;
        if (selectedContactsForGroup.length === filtered.length && filtered.length > 0) {
            setSelectedContactsForGroup([]);
        } else {
            setSelectedContactsForGroup(filtered.map(c => c.id));
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

    const handleAddMembers = (e: FormEvent) => {
        e.preventDefault();
        if (!newlyCreatedGroup) return;

        let members: { phone_number: string; name: string }[] = [];

        // Get selected contacts from database
        if (selectedContactsForGroup.length > 0) {
            const contactMembers = selectedContactsForGroup.map(contactId => {
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

        router.post(`/user/contact-groups/${newlyCreatedGroup.id}/members`, {
            members,
        }, {
            preserveScroll: true,
            onSuccess: () => {
                setShowAddMembersDialog(false);
                setNewlyCreatedGroup(null);
                setMemberInputs([{ phone_number: '', name: '' }]);
                setSelectedContactsForGroup([]);
                setContactSearch('');
                router.reload({ only: ['contactGroups'] });
            },
        });
    };

    const filteredContacts = useMemo(() => {
        if (!contactSearch.trim()) return contacts;

        const search = contactSearch.toLowerCase();
        return contacts.filter(c =>
            c.phone_number.includes(search) ||
            (c.name && c.name.toLowerCase().includes(search))
        );
    }, [contacts, contactSearch]);

    return (
        <UserLayout>
            <Head title="WA Broadcast" />

            <div className="space-y-6">
                {/* Header */}
                {/* Header */}
                <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-6 border">
                    <div className="absolute inset-0 bg-grid-white/10 [mask-image:radial-gradient(white,transparent_85%)]" />
                    <div className="relative">
                        <h1 className="text-3xl font-bold tracking-tight text-foreground">WhatsApp Broadcast</h1>
                        <p className="text-muted-foreground mt-1">
                            Kirim pesan massal dengan text dan file
                        </p>
                    </div>
                </div>

                {connectedSessions.length === 0 ? (
                    <Card className="border-yellow-500 bg-yellow-50">
                        <CardContent className="pt-6">
                            <div className="flex flex-col items-center justify-center py-8">
                                <MessageSquare className="size-16 text-yellow-600 mb-4" />
                                <h3 className="text-xl font-semibold mb-2">Tidak Ada Sesi Terhubung</h3>
                                <p className="text-muted-foreground text-center mb-4">
                                    Anda perlu memiliki minimal 1 sesi WhatsApp yang terhubung untuk menggunakan fitur broadcast
                                </p>
                                <Button onClick={() => router.visit('/user/whatsapp')}>
                                    Kelola Sesi WhatsApp
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid gap-6 md:grid-cols-2">
                            {/* Left Column - Form */}
                            <div className="space-y-6">
                                {/* Session Selection */}
                                <Card className="overflow-hidden border-2">
                                    <div className="h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />
                                    <CardHeader>
                                        <CardTitle>Pilih Sesi WhatsApp</CardTitle>
                                        <CardDescription>
                                            Pilih sesi yang akan digunakan untuk mengirim broadcast
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <Select
                                            value={data.session_id}
                                            onValueChange={(value) => setData('session_id', value)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Pilih sesi WhatsApp" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {connectedSessions.map((session) => (
                                                    <SelectItem key={session.id} value={session.id.toString()}>
                                                        {session.name} ({session.phone_number})
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {errors.session_id && (
                                            <p className="text-sm text-destructive mt-2">{errors.session_id}</p>
                                        )}
                                    </CardContent>
                                </Card>

                                {/* Message */}
                                <Card className="overflow-hidden border-2">
                                    <div className="h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />
                                    <CardHeader>
                                        <CardTitle>Pesan</CardTitle>
                                        <CardDescription>
                                            Tulis pesan yang akan dikirim
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div>
                                            <Textarea
                                                placeholder="Ketik pesan Anda di sini..."
                                                value={data.message}
                                                onChange={(e) => setData('message', e.target.value)}
                                                rows={6}
                                                className="resize-none"
                                            />
                                            {errors.message && (
                                                <p className="text-sm text-destructive mt-2">{errors.message}</p>
                                            )}
                                        </div>

                                        {/* File Upload */}
                                        <div>
                                            <Label>File (Opsional)</Label>
                                            <div className="mt-2">
                                                <label
                                                    htmlFor="file-upload"
                                                    className="flex items-center justify-center gap-2 rounded-lg border-2 border-dashed border-muted-foreground/25 p-6 hover:border-muted-foreground/50 transition-colors cursor-pointer"
                                                >
                                                    <FileUp className="size-5 text-muted-foreground" />
                                                    <span className="text-sm text-muted-foreground">
                                                        {selectedFile ? selectedFile.name : 'Klik untuk upload file'}
                                                    </span>
                                                    <input
                                                        id="file-upload"
                                                        type="file"
                                                        className="hidden"
                                                        onChange={handleFileChange}
                                                        accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.xls,.xlsx"
                                                    />
                                                </label>
                                                {selectedFile && (
                                                    <div className="mt-2 flex items-center justify-between rounded-lg bg-muted p-3">
                                                        <span className="text-sm font-medium">{selectedFile.name}</span>
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => {
                                                                setSelectedFile(null);
                                                                setData('file', null);
                                                            }}
                                                        >
                                                            <X className="size-4" />
                                                        </Button>
                                                    </div>
                                                )}
                                                {errors.file && (
                                                    <p className="text-sm text-destructive mt-2">{errors.file}</p>
                                                )}
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Broadcast Timing */}
                                <Card className="overflow-hidden border-2">
                                    <div className="h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Clock className="size-5 text-primary" />
                                            Waktu Pengiriman
                                        </CardTitle>
                                        <CardDescription>
                                            Pilih kapan broadcast akan dikirim
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <RadioGroup
                                            value={broadcastType}
                                            onValueChange={(value: 'now' | 'scheduled') => {
                                                setBroadcastType(value);
                                                setData('broadcast_type', value);
                                            }}
                                        >
                                            <div className="flex items-center space-x-3 rounded-lg border p-4 hover:bg-muted/50 transition-colors">
                                                <RadioGroupItem value="now" id="now" />
                                                <Label htmlFor="now" className="flex-1 cursor-pointer">
                                                    <div className="font-medium">Kirim Sekarang</div>
                                                    <div className="text-sm text-muted-foreground">
                                                        Broadcast akan langsung diproses dan dikirim
                                                    </div>
                                                </Label>
                                                <Send className="size-5 text-muted-foreground" />
                                            </div>

                                            <div className="flex items-center space-x-3 rounded-lg border p-4 hover:bg-muted/50 transition-colors">
                                                <RadioGroupItem value="scheduled" id="scheduled" />
                                                <Label htmlFor="scheduled" className="flex-1 cursor-pointer">
                                                    <div className="font-medium">Jadwalkan Pengiriman</div>
                                                    <div className="text-sm text-muted-foreground">
                                                        Tentukan tanggal dan waktu pengiriman
                                                    </div>
                                                </Label>
                                                <Calendar className="size-5 text-muted-foreground" />
                                            </div>
                                        </RadioGroup>

                                        {broadcastType === 'scheduled' && (
                                            <div className="space-y-2 animate-in fade-in-50 slide-in-from-top-2">
                                                <Label>Tanggal & Waktu Pengiriman</Label>
                                                <DateTimePicker
                                                    selected={scheduledDate}
                                                    onChange={(date) => {
                                                        setScheduledDate(date);
                                                        setData('scheduled_at', date ? date.toISOString() : null);
                                                    }}
                                                    placeholder="Pilih tanggal dan waktu"
                                                />
                                                {errors.scheduled_at && (
                                                    <p className="text-sm text-destructive">{errors.scheduled_at}</p>
                                                )}
                                                <p className="text-xs text-muted-foreground">
                                                    Broadcast akan dikirim pada waktu yang ditentukan
                                                </p>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Right Column - Recipients */}
                            <div className="space-y-4">
                                {/* Dari Kontak */}
                                <Card className="overflow-hidden border-2">
                                    <div className="h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <UserPlus className="size-5 text-primary" />
                                            Pilih dari Kontak
                                        </CardTitle>
                                        <CardDescription>
                                            Pilih kontak yang sudah tersimpan
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        {contacts.length === 0 ? (
                                            <div className="text-center p-6 border rounded-lg bg-muted/50">
                                                <Users className="size-10 mx-auto text-muted-foreground mb-2" />
                                                <p className="text-sm text-muted-foreground mb-3">
                                                    Belum ada kontak tersimpan
                                                </p>
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => router.visit('/user/contacts/create')}
                                                >
                                                    Tambah Kontak
                                                </Button>
                                            </div>
                                        ) : (
                                            <>
                                                <div className="max-h-48 overflow-y-auto space-y-2 rounded-lg border p-3">
                                                    {contacts.map((contact) => (
                                                        <div
                                                            key={contact.id}
                                                            className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors"
                                                        >
                                                            <Checkbox
                                                                id={`contact-${contact.id}`}
                                                                checked={selectedContacts.includes(contact.id)}
                                                                onCheckedChange={() => handleToggleContact(contact.id)}
                                                            />
                                                            <label
                                                                htmlFor={`contact-${contact.id}`}
                                                                className="flex-1 cursor-pointer"
                                                            >
                                                                <p className="text-sm font-medium">
                                                                    {contact.display_name || 'Tanpa Nama'}
                                                                </p>
                                                                <p className="text-xs text-muted-foreground font-mono">
                                                                    {contact.phone_number}
                                                                </p>
                                                            </label>
                                                        </div>
                                                    ))}
                                                </div>
                                                <Button
                                                    type="button"
                                                    onClick={handleAddContactsFromDB}
                                                    disabled={selectedContacts.length === 0}
                                                    className="w-full"
                                                    variant="secondary"
                                                >
                                                    <UserPlus className="mr-2 size-4" />
                                                    Tambah {selectedContacts.length} Kontak
                                                </Button>
                                            </>
                                        )}
                                    </CardContent>
                                </Card>

                                {/* Dari Grup Kontak */}
                                <Card className="overflow-hidden border-2">
                                    <div className="h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />
                                    <CardHeader>
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <CardTitle className="flex items-center gap-2">
                                                    <FolderOpen className="size-5 text-primary" />
                                                    Pilih dari Grup
                                                </CardTitle>
                                                <CardDescription>
                                                    Pilih grup kontak untuk broadcast
                                                </CardDescription>
                                            </div>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={() => setShowGroupDialog(true)}
                                            >
                                                <FolderPlus className="size-4 mr-1" />
                                                Buat Grup
                                            </Button>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        {contactGroups.length === 0 ? (
                                            <div className="text-center p-6 border rounded-lg bg-muted/50">
                                                <FolderOpen className="size-10 mx-auto text-muted-foreground mb-2" />
                                                <p className="text-sm text-muted-foreground mb-3">
                                                    Belum ada grup kontak
                                                </p>
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => router.visit('/user/contact-groups')}
                                                >
                                                    Buat Grup
                                                </Button>
                                            </div>
                                        ) : (
                                            <>
                                                <div className="max-h-48 overflow-y-auto space-y-2 rounded-lg border p-3">
                                                    {contactGroups.map((group) => (
                                                        <div
                                                            key={group.id}
                                                            className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors"
                                                        >
                                                            <Checkbox
                                                                id={`group-${group.id}`}
                                                                checked={selectedGroups.includes(group.id)}
                                                                onCheckedChange={() => handleToggleGroup(group.id)}
                                                            />
                                                            <label
                                                                htmlFor={`group-${group.id}`}
                                                                className="flex-1 cursor-pointer"
                                                            >
                                                                <p className="text-sm font-medium">
                                                                    {group.name}
                                                                </p>
                                                                <p className="text-xs text-muted-foreground">
                                                                    {group.members_count} anggota
                                                                    <Badge variant="outline" className="ml-2 text-xs">
                                                                        {group.source === 'manual' ? 'Manual' : 'WhatsApp'}
                                                                    </Badge>
                                                                </p>
                                                            </label>
                                                            <Button
                                                                type="button"
                                                                variant="ghost"
                                                                size="sm"
                                                                className="h-7 w-7 p-0"
                                                                onClick={() => openEditGroupDialog(group)}
                                                            >
                                                                <Edit className="size-4" />
                                                            </Button>
                                                        </div>
                                                    ))}
                                                </div>
                                                <Button
                                                    type="button"
                                                    onClick={handleAddFromGroups}
                                                    disabled={selectedGroups.length === 0 || loadingGroupMembers}
                                                    className="w-full"
                                                    variant="secondary"
                                                >
                                                    <Users className="mr-2 size-4" />
                                                    {loadingGroupMembers
                                                        ? 'Memuat...'
                                                        : `Tambah dari ${selectedGroups.length} Grup`}
                                                </Button>
                                            </>
                                        )}
                                    </CardContent>
                                </Card>

                                {/* Input Manual */}
                                <Card className="overflow-hidden border-2">
                                    <div className="h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Edit className="size-5 text-primary" />
                                            Input Manual
                                        </CardTitle>
                                        <CardDescription>
                                            Atau tambahkan nomor secara manual
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        <div className="flex gap-2">
                                            <Input
                                                placeholder="628xxx"
                                                value={recipientInput}
                                                onChange={(e) => setRecipientInput(e.target.value)}
                                                onKeyPress={(e) => {
                                                    if (e.key === 'Enter') {
                                                        e.preventDefault();
                                                        handleAddRecipient();
                                                    }
                                                }}
                                            />
                                            <Button
                                                type="button"
                                                onClick={handleAddRecipient}
                                                variant="secondary"
                                            >
                                                Tambah
                                            </Button>
                                        </div>
                                        <p className="text-xs text-muted-foreground">
                                            Format: 628xxxxxxxxxx (gunakan kode negara 62 tanpa +)
                                        </p>
                                    </CardContent>
                                </Card>

                                {/* Recipients List */}
                                <Card className="overflow-hidden border-2">
                                    <div className="h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />
                                    <CardHeader>
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <CardTitle className="flex items-center gap-2">
                                                    <Users className="size-5 text-primary" />
                                                    Daftar Penerima
                                                </CardTitle>
                                                <CardDescription>
                                                    {recipients.length > 0
                                                        ? `${recipients.length} nomor siap dikirim`
                                                        : 'Belum ada penerima'}
                                                </CardDescription>
                                            </div>
                                            {recipients.length > 0 && (
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => {
                                                        setRecipients([]);
                                                        setData('recipients', []);
                                                    }}
                                                >
                                                    Hapus Semua
                                                </Button>
                                            )}
                                        </div>
                                    </CardHeader>
                                    {recipients.length > 0 && (
                                        <CardContent>
                                            <div className="max-h-64 overflow-y-auto space-y-2 rounded-lg border p-3">
                                                {recipients.map((recipient, index) => (
                                                    <div
                                                        key={index}
                                                        className="flex items-center justify-between rounded-md bg-muted/50 p-2.5 hover:bg-muted transition-colors"
                                                    >
                                                        <span className="text-sm font-medium font-mono">{recipient}</span>
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => handleRemoveRecipient(index)}
                                                            className="h-7 w-7 p-0"
                                                        >
                                                            <X className="size-4" />
                                                        </Button>
                                                    </div>
                                                ))}
                                            </div>
                                        </CardContent>
                                    )}
                                </Card>

                                {errors.recipients && (
                                    <p className="text-sm text-destructive">{errors.recipients}</p>
                                )}
                            </div>
                        </div>

                        {/* Submit Button */}
                        <Card className="overflow-hidden border-2">
                            <div className="h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium">
                                            {broadcastType === 'now'
                                                ? 'Siap mengirim broadcast?'
                                                : 'Siap menjadwalkan broadcast?'}
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            Klik tombol untuk melihat preview penerima
                                        </p>
                                    </div>
                                    <Button type="submit" disabled={processing || previewLoading} size="lg">
                                        <Eye className="mr-2 size-4" />
                                        {previewLoading ? 'Memuat...' : 'Preview & Kirim'}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </form>
                )}
            </div>

            {/* Create Group Dialog */}
            <Dialog open={showGroupDialog} onOpenChange={setShowGroupDialog}>
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
                                <Label htmlFor="group-name">Nama Grup</Label>
                                <Input
                                    id="group-name"
                                    value={groupForm.data.name}
                                    onChange={(e) => groupForm.setData('name', e.target.value)}
                                    placeholder="Contoh: Pelanggan VIP"
                                    className="mt-2"
                                />
                                {groupForm.errors.name && (
                                    <p className="text-sm text-destructive mt-1">{groupForm.errors.name}</p>
                                )}
                            </div>
                            <div>
                                <Label htmlFor="group-description">Deskripsi (Opsional)</Label>
                                <Textarea
                                    id="group-description"
                                    value={groupForm.data.description}
                                    onChange={(e) => groupForm.setData('description', e.target.value)}
                                    placeholder="Deskripsi singkat tentang grup ini..."
                                    className="mt-2"
                                    rows={3}
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setShowGroupDialog(false)}>
                                Batal
                            </Button>
                            <Button type="submit" disabled={groupForm.processing}>
                                {groupForm.processing ? 'Menyimpan...' : 'Simpan'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Edit Group Dialog */}
            <Dialog open={showEditGroupDialog} onOpenChange={setShowEditGroupDialog}>
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
                                <Label htmlFor="edit-group-name">Nama Grup</Label>
                                <Input
                                    id="edit-group-name"
                                    value={editGroupForm.data.name}
                                    onChange={(e) => editGroupForm.setData('name', e.target.value)}
                                    className="mt-2"
                                />
                                {editGroupForm.errors.name && (
                                    <p className="text-sm text-destructive mt-1">{editGroupForm.errors.name}</p>
                                )}
                            </div>
                            <div>
                                <Label htmlFor="edit-group-description">Deskripsi (Opsional)</Label>
                                <Textarea
                                    id="edit-group-description"
                                    value={editGroupForm.data.description}
                                    onChange={(e) => editGroupForm.setData('description', e.target.value)}
                                    className="mt-2"
                                    rows={3}
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setShowEditGroupDialog(false)}>
                                Batal
                            </Button>
                            <Button type="submit" disabled={editGroupForm.processing}>
                                {editGroupForm.processing ? 'Menyimpan...' : 'Simpan'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Preview Recipients Dialog */}
            <Dialog open={showPreviewDialog} onOpenChange={setShowPreviewDialog}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Users className="size-5 text-primary" />
                            Preview Penerima Broadcast
                        </DialogTitle>
                        <DialogDescription>
                            Berikut adalah daftar penerima yang akan menerima broadcast (sudah dihapus duplikat)
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4">
                        {/* Summary */}
                        <div className="flex items-center justify-between p-4 bg-primary/10 rounded-lg">
                            <div>
                                <p className="text-sm font-medium">Total Penerima Unik</p>
                                <p className="text-xs text-muted-foreground">
                                    Dari {selectedContacts.length} kontak, {selectedGroups.length} grup,
                                    dan {recipients.length} input manual
                                </p>
                            </div>
                            <div className="text-3xl font-bold text-primary">
                                {previewRecipients.length}
                            </div>
                        </div>

                        {/* Recipients List */}
                        <div>
                            <Label className="text-sm font-medium mb-2 block">Daftar Nomor Penerima:</Label>
                            <ScrollArea className="h-96 rounded-lg border p-3">
                                <div className="space-y-1">
                                    {previewRecipients.map((phone, index) => (
                                        <div
                                            key={index}
                                            className="flex items-center justify-between rounded-md bg-muted/50 p-2.5"
                                        >
                                            <span className="text-sm font-mono">{phone}</span>
                                            <Badge variant="outline">{index + 1}</Badge>
                                        </div>
                                    ))}
                                </div>
                            </ScrollArea>
                        </div>

                        {/* Message Preview */}
                        <div>
                            <Label className="text-sm font-medium mb-2 block">Pesan yang Akan Dikirim:</Label>
                            <div className="rounded-lg border p-3 bg-muted/30">
                                <p className="text-sm whitespace-pre-wrap">
                                    {data.message || '(Tanpa teks, hanya file)'}
                                </p>
                                {data.file && (
                                    <div className="mt-2 pt-2 border-t">
                                        <p className="text-xs text-muted-foreground">
                                            File: {selectedFile?.name}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setShowPreviewDialog(false)}
                        >
                            Kembali & Edit
                        </Button>
                        <Button
                            type="button"
                            onClick={confirmAndSend}
                            disabled={processing}
                        >
                            {broadcastType === 'now' ? (
                                <>
                                    <Send className="mr-2 size-4" />
                                    {processing ? 'Mengirim...' : `Kirim ke ${previewRecipients.length} Nomor`}
                                </>
                            ) : (
                                <>
                                    <Calendar className="mr-2 size-4" />
                                    {processing ? 'Menjadwalkan...' : `Jadwalkan untuk ${previewRecipients.length} Nomor`}
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Add Members Dialog */}
            <Dialog open={showAddMembersDialog} onOpenChange={setShowAddMembersDialog}>
                <DialogContent className="max-w-md">
                    <form onSubmit={handleAddMembers}>
                        <DialogHeader className="pb-4">
                            <DialogTitle className="flex items-center gap-2">
                                <UserPlus className="size-5 text-primary" />
                                Tambah Anggota ke Grup Baru
                            </DialogTitle>
                            <DialogDescription>
                                Tambahkan anggota ke grup "{newlyCreatedGroup?.name}"
                            </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-5">
                            {/* Section: Pilih dari Kontak */}
                            {contacts.length > 0 && (
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium flex items-center gap-2">
                                            <Database className="size-4" />
                                            Pilih dari Kontak
                                        </span>
                                        {selectedContactsForGroup.length > 0 && (
                                            <Badge variant="default" className="text-xs">
                                                {selectedContactsForGroup.length} dipilih
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
                                            className={`h-4 w-4 rounded border flex items-center justify-center ${selectedContactsForGroup.length === filteredContacts.length && filteredContacts.length > 0
                                                ? 'bg-primary border-primary'
                                                : 'border-input'
                                                }`}
                                        >
                                            {selectedContactsForGroup.length === filteredContacts.length && filteredContacts.length > 0 && (
                                                <svg className="h-3 w-3 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                                </svg>
                                            )}
                                        </div>
                                        <span className="text-sm text-muted-foreground">Pilih Semua</span>
                                    </div>

                                    <ScrollArea className="h-[160px] border rounded-lg">
                                        <div className="p-1.5 space-y-0.5">
                                            {filteredContacts.length === 0 ? (
                                                <p className="text-center text-muted-foreground py-6 text-sm">
                                                    Tidak ada kontak ditemukan
                                                </p>
                                            ) : (
                                                filteredContacts.map((contact) => {
                                                    const isSelected = selectedContactsForGroup.includes(contact.id);
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

                        <DialogFooter className="pt-5">
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                    setShowAddMembersDialog(false);
                                    setNewlyCreatedGroup(null);
                                    setMemberInputs([{ phone_number: '', name: '' }]);
                                    setSelectedContactsForGroup([]);
                                    setContactSearch('');
                                }}
                            >
                                Lewati
                            </Button>
                            <Button type="submit" size="sm">
                                <UserPlus className="mr-1.5 size-4" />
                                Simpan Anggota
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </UserLayout>
    );
}
