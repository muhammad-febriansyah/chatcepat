import { Head, router, useForm } from '@inertiajs/react';
import UserLayout from '@/layouts/user/user-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Send, FileUp, MessageSquare, Users, X, UserPlus, Edit, FolderOpen } from 'lucide-react';
import { useState, FormEvent, useEffect } from 'react';

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
    display_name: string | null;
}

interface ContactGroup {
    id: number;
    name: string;
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

    const { data, setData, post, processing, errors, reset } = useForm({
        session_id: '',
        message: '',
        recipients: [] as string[],
        file: null as File | null,
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
                const response = await fetch(`/user/contact-groups/${groupId}/members`);
                const data = await response.json();
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
            console.error('Failed to fetch group members:', error);
        } finally {
            setLoadingGroupMembers(false);
        }
    };

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();

        if (!data.session_id) {
            alert('Pilih sesi WhatsApp terlebih dahulu');
            return;
        }

        if (!data.message && !data.file) {
            alert('Isi pesan atau upload file');
            return;
        }

        if (recipients.length === 0) {
            alert('Tambahkan minimal 1 nomor penerima');
            return;
        }

        post('/user/broadcast/send', {
            onSuccess: () => {
                reset();
                setSelectedFile(null);
                setRecipients([]);
                setRecipientInput('');
            },
        });
    };

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
                                        <CardTitle className="flex items-center gap-2">
                                            <FolderOpen className="size-5 text-primary" />
                                            Pilih dari Grup
                                        </CardTitle>
                                        <CardDescription>
                                            Pilih grup kontak untuk broadcast
                                        </CardDescription>
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
                                        <p className="text-sm font-medium">Siap mengirim broadcast?</p>
                                        <p className="text-sm text-muted-foreground">
                                            Pesan akan dikirim ke {recipients.length} penerima
                                        </p>
                                    </div>
                                    <Button type="submit" disabled={processing} size="lg">
                                        <Send className="mr-2 size-4" />
                                        {processing ? 'Mengirim...' : 'Kirim Broadcast'}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </form>
                )}
            </div>
        </UserLayout>
    );
}
