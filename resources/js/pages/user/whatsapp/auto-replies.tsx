import { Head, router, useForm } from '@inertiajs/react';
import { ColumnDef } from '@tanstack/react-table';
import UserLayout from '@/layouts/user/user-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DataTable } from '@/components/ui/data-table';
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
import { Plus, Trash2, Edit2, ArrowLeft, Image, FileText, MessageSquare, Bot, Zap } from 'lucide-react';
import { useState, FormEvent } from 'react';

interface AutoReply {
    id: number;
    name: string;
    trigger_type: 'exact' | 'contains' | 'starts_with' | 'regex' | 'all';
    trigger_value: string | null;
    reply_type: 'custom' | 'openai';
    response_type: 'text' | 'photo' | 'document';
    custom_reply: string;
    response_media_url: string | null;
    is_active: boolean;
    priority: number;
}

interface WhatsappSession {
    id: number;
    name: string;
    phone_number: string;
    status: string;
    settings: {
        autoReplyEnabled?: boolean;
    } | null;
}

interface AutoRepliesPageProps {
    session: WhatsappSession;
    autoReplies: AutoReply[];
}

const triggerTypeLabels: Record<string, string> = {
    exact: 'Sama Persis',
    contains: 'Mengandung',
    starts_with: 'Diawali Dengan',
    regex: 'Regex',
    all: 'Semua Pesan',
};

const responseTypeLabels: Record<string, { label: string; icon: React.ReactNode }> = {
    text: { label: 'Teks', icon: <MessageSquare className="size-4" /> },
    photo: { label: 'Foto', icon: <Image className="size-4" /> },
    document: { label: 'Dokumen', icon: <FileText className="size-4" /> },
};

const replyTypeLabels: Record<string, { label: string; icon: React.ReactNode }> = {
    custom: { label: 'Custom', icon: <MessageSquare className="size-4" /> },
    openai: { label: 'AI (OpenAI)', icon: <Bot className="size-4" /> },
};

export default function AutoRepliesPage({ session, autoReplies }: AutoRepliesPageProps) {
    const [showAddDialog, setShowAddDialog] = useState(false);
    const [editingReply, setEditingReply] = useState<AutoReply | null>(null);
    const autoReplyEnabled = session.settings?.autoReplyEnabled ?? false;

    const { data, setData, post, put, processing, errors, reset } = useForm({
        name: '',
        trigger_type: 'contains' as string,
        trigger_value: '',
        reply_type: 'custom' as string,
        response_type: 'text' as string,
        custom_reply: '',
        response_media_url: '',
        priority: 0,
        is_active: true,
    });

    const handleAdd = (e: FormEvent) => {
        e.preventDefault();
        post(`/user/whatsapp/${session.id}/auto-replies`, {
            onSuccess: () => {
                setShowAddDialog(false);
                reset();
            },
        });
    };

    const handleEdit = (e: FormEvent) => {
        e.preventDefault();
        if (!editingReply) return;
        put(`/user/whatsapp/${session.id}/auto-replies/${editingReply.id}`, {
            onSuccess: () => {
                setEditingReply(null);
                reset();
            },
        });
    };

    const handleDelete = (replyId: number) => {
        router.delete(`/user/whatsapp/${session.id}/auto-replies/${replyId}`);
    };

    const handleToggleAutoReply = () => {
        router.post(`/user/whatsapp/${session.id}/toggle-auto-reply`);
    };

    const openEditDialog = (reply: AutoReply) => {
        setEditingReply(reply);
        setData({
            name: reply.name || '',
            trigger_type: reply.trigger_type,
            trigger_value: reply.trigger_value || '',
            reply_type: reply.reply_type,
            response_type: reply.response_type || 'text',
            custom_reply: reply.custom_reply || '',
            response_media_url: reply.response_media_url || '',
            priority: reply.priority,
            is_active: reply.is_active,
        });
    };

    const closeDialogs = () => {
        setShowAddDialog(false);
        setEditingReply(null);
        reset();
    };

    const columns: ColumnDef<AutoReply>[] = [
        {
            accessorKey: 'name',
            header: 'Nama Rule',
            cell: ({ row }) => (
                <div className="font-medium">{row.original.name || '-'}</div>
            ),
        },
        {
            accessorKey: 'trigger_type',
            header: 'Trigger',
            cell: ({ row }) => (
                <div className="flex flex-col gap-1">
                    <Badge variant="outline" className="w-fit">
                        {triggerTypeLabels[row.original.trigger_type]}
                    </Badge>
                    {row.original.trigger_value && (
                        <code className="text-xs text-primary bg-muted px-1.5 py-0.5 rounded">
                            {row.original.trigger_value}
                        </code>
                    )}
                </div>
            ),
        },
        {
            accessorKey: 'reply_type',
            header: 'Tipe Balas',
            cell: ({ row }) => {
                const type = row.original.reply_type;
                const typeInfo = replyTypeLabels[type];
                return (
                    <div className="flex items-center gap-2">
                        {typeInfo?.icon}
                        <span>{typeInfo?.label || type}</span>
                    </div>
                );
            },
        },
        {
            accessorKey: 'response_type',
            header: 'Tipe Respon',
            cell: ({ row }) => {
                const type = row.original.response_type || 'text';
                const typeInfo = responseTypeLabels[type];
                return (
                    <div className="flex items-center gap-2">
                        {typeInfo?.icon}
                        <span>{typeInfo?.label}</span>
                    </div>
                );
            },
        },
        {
            accessorKey: 'custom_reply',
            header: 'Konten',
            cell: ({ row }) => (
                <div className="max-w-[200px] truncate text-muted-foreground">
                    {row.original.custom_reply || '-'}
                </div>
            ),
        },
        {
            accessorKey: 'priority',
            header: 'Prioritas',
            cell: ({ row }) => (
                <Badge variant="secondary">{row.original.priority}</Badge>
            ),
        },
        {
            accessorKey: 'is_active',
            header: 'Status',
            cell: ({ row }) => (
                <Badge variant={row.original.is_active ? 'default' : 'secondary'}>
                    {row.original.is_active ? 'Aktif' : 'Nonaktif'}
                </Badge>
            ),
        },
        {
            id: 'actions',
            header: 'Aksi',
            cell: ({ row }) => (
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => openEditDialog(row.original)}>
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
                                <AlertDialogTitle>Hapus Auto Reply?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    Rule "{row.original.name}" akan dihapus. Tindakan ini tidak dapat dibatalkan.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Batal</AlertDialogCancel>
                                <AlertDialogAction
                                    onClick={() => handleDelete(row.original.id)}
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                    Hapus
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>
            ),
        },
    ];

    const FormFields = () => (
        <div className="space-y-4">
            <div>
                <Label>Nama Rule</Label>
                <Input
                    value={data.name}
                    onChange={(e) => setData('name', e.target.value)}
                    placeholder="Contoh: Balasan Selamat Datang"
                    className="mt-2"
                />
                {errors.name && <p className="text-sm text-destructive mt-1">{errors.name}</p>}
            </div>
            {editingReply && (
                <div className="flex items-center justify-between">
                    <Label>Status Aktif</Label>
                    <Switch
                        checked={data.is_active}
                        onCheckedChange={(v) => setData('is_active', v)}
                    />
                </div>
            )}
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <Label>Tipe Trigger</Label>
                    <Select value={data.trigger_type} onValueChange={(v) => setData('trigger_type', v)}>
                        <SelectTrigger className="mt-2">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="exact">Sama Persis</SelectItem>
                            <SelectItem value="contains">Mengandung</SelectItem>
                            <SelectItem value="starts_with">Diawali Dengan</SelectItem>
                            <SelectItem value="regex">Regex</SelectItem>
                            <SelectItem value="all">Semua Pesan</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div>
                    <Label>Prioritas</Label>
                    <Input
                        type="number"
                        value={data.priority}
                        onChange={(e) => setData('priority', parseInt(e.target.value) || 0)}
                        min={0}
                        max={100}
                        className="mt-2"
                    />
                </div>
            </div>
            {data.trigger_type !== 'all' && (
                <div>
                    <Label>Nilai Trigger</Label>
                    <Input
                        value={data.trigger_value}
                        onChange={(e) => setData('trigger_value', e.target.value)}
                        placeholder={data.trigger_type === 'regex' ? '^halo.*' : 'halo'}
                        className="mt-2"
                    />
                    {errors.trigger_value && <p className="text-sm text-destructive mt-1">{errors.trigger_value}</p>}
                </div>
            )}
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <Label>Tipe Balasan</Label>
                    <Select value={data.reply_type} onValueChange={(v) => setData('reply_type', v)}>
                        <SelectTrigger className="mt-2">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="custom">Custom (Manual)</SelectItem>
                            <SelectItem value="openai">AI (OpenAI)</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div>
                    <Label>Tipe Respon</Label>
                    <Select value={data.response_type} onValueChange={(v) => setData('response_type', v)}>
                        <SelectTrigger className="mt-2">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="text">Teks</SelectItem>
                            <SelectItem value="photo">Foto + Caption</SelectItem>
                            <SelectItem value="document">Dokumen + Caption</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>
            {data.response_type !== 'text' && (
                <div>
                    <Label>URL Media</Label>
                    <Input
                        value={data.response_media_url}
                        onChange={(e) => setData('response_media_url', e.target.value)}
                        placeholder="https://example.com/image.jpg"
                        className="mt-2"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                        Masukkan URL langsung ke file {data.response_type === 'photo' ? 'gambar' : 'dokumen'}
                    </p>
                </div>
            )}
            <div>
                <Label>
                    {data.reply_type === 'openai'
                        ? 'System Prompt (Instruksi untuk AI)'
                        : data.response_type === 'text'
                        ? 'Konten Respon'
                        : 'Caption'}
                </Label>
                <Textarea
                    value={data.custom_reply}
                    onChange={(e) => setData('custom_reply', e.target.value)}
                    placeholder={
                        data.reply_type === 'openai'
                            ? 'Kamu adalah customer service yang ramah...'
                            : 'Halo! Selamat datang...'
                    }
                    rows={4}
                    className="mt-2"
                />
                {errors.custom_reply && <p className="text-sm text-destructive mt-1">{errors.custom_reply}</p>}
                <p className="text-xs text-muted-foreground mt-1">
                    {data.reply_type === 'openai'
                        ? 'Tulis instruksi untuk AI tentang cara membalas pesan'
                        : 'Mendukung format: *bold*, _italic_, ~strikethrough~'}
                </p>
            </div>
        </div>
    );

    return (
        <UserLayout>
            <Head title={`Auto Reply - ${session.name}`} />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="sm" onClick={() => router.visit(`/user/whatsapp/${session.id}`)}>
                            <ArrowLeft className="size-4" />
                        </Button>
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">Auto Reply</h1>
                            <p className="text-muted-foreground mt-1">
                                {session.name} ({session.phone_number})
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                            <Switch
                                checked={autoReplyEnabled}
                                onCheckedChange={handleToggleAutoReply}
                            />
                            <span className="text-sm">
                                {autoReplyEnabled ? (
                                    <Badge variant="default" className="bg-green-500">
                                        <Zap className="size-3 mr-1" />
                                        Aktif
                                    </Badge>
                                ) : (
                                    <Badge variant="secondary">Nonaktif</Badge>
                                )}
                            </span>
                        </div>
                        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
                            <DialogTrigger asChild>
                                <Button>
                                    <Plus className="mr-2 size-4" />
                                    Tambah Rule
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                                <form onSubmit={handleAdd}>
                                    <DialogHeader>
                                        <DialogTitle>Tambah Auto Reply</DialogTitle>
                                        <DialogDescription>
                                            Buat aturan balasan otomatis baru
                                        </DialogDescription>
                                    </DialogHeader>
                                    <div className="py-4">
                                        <FormFields />
                                    </div>
                                    <DialogFooter>
                                        <Button type="button" variant="outline" onClick={closeDialogs}>Batal</Button>
                                        <Button type="submit" disabled={processing}>
                                            {processing ? 'Menyimpan...' : 'Simpan'}
                                        </Button>
                                    </DialogFooter>
                                </form>
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>

                {/* Info Card */}
                <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
                    <CardContent className="pt-6">
                        <div className="flex items-start gap-4">
                            <div className="p-3 rounded-full bg-green-100">
                                <Bot className="size-6 text-green-600" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-green-900">Cara Kerja Auto Reply</h3>
                                <ul className="mt-2 text-sm text-green-800 space-y-1">
                                    <li>1. Pesan masuk akan dicocokkan dengan trigger rules berdasarkan prioritas</li>
                                    <li>2. Rule dengan prioritas tertinggi yang cocok akan dieksekusi</li>
                                    <li>3. Jika tidak ada yang cocok & ada rule "Semua Pesan", rule tersebut digunakan</li>
                                    <li>4. Tipe "AI (OpenAI)" akan menggunakan AI untuk generate balasan</li>
                                </ul>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* DataTable */}
                <Card>
                    <CardHeader>
                        <CardTitle>Daftar Rules</CardTitle>
                        <CardDescription>
                            {autoReplies.length} rule auto-reply terdaftar
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <DataTable
                            columns={columns}
                            data={autoReplies}
                            searchKey="name"
                            searchPlaceholder="Cari nama rule..."
                        />
                    </CardContent>
                </Card>

                {/* Edit Dialog */}
                <Dialog open={!!editingReply} onOpenChange={(open) => !open && closeDialogs()}>
                    <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                        <form onSubmit={handleEdit}>
                            <DialogHeader>
                                <DialogTitle>Edit Auto Reply</DialogTitle>
                                <DialogDescription>
                                    Ubah aturan balasan otomatis
                                </DialogDescription>
                            </DialogHeader>
                            <div className="py-4">
                                <FormFields />
                            </div>
                            <DialogFooter>
                                <Button type="button" variant="outline" onClick={closeDialogs}>Batal</Button>
                                <Button type="submit" disabled={processing}>
                                    {processing ? 'Menyimpan...' : 'Simpan'}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>
        </UserLayout>
    );
}
