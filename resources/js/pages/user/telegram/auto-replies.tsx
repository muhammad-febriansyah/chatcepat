import { Head, router, useForm } from '@inertiajs/react';
import UserLayout from '@/layouts/user/user-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
import { Bot, Plus, Trash2, Edit2, Zap, ArrowLeft } from 'lucide-react';
import { useState, FormEvent } from 'react';

interface AutoReply {
    id: number;
    name: string;
    trigger_type: 'exact' | 'contains' | 'starts_with' | 'regex' | 'all';
    trigger_value: string | null;
    response_type: 'text' | 'photo' | 'document';
    response_content: string;
    response_media_url: string | null;
    is_active: boolean;
    priority: number;
}

interface TelegramBot {
    id: number;
    bot_username: string;
    auto_reply_enabled: boolean;
}

interface AutoRepliesPageProps {
    bot: TelegramBot;
    autoReplies: AutoReply[];
}

const triggerTypeLabels: Record<string, string> = {
    exact: 'Sama Persis',
    contains: 'Mengandung',
    starts_with: 'Diawali Dengan',
    regex: 'Regex',
    all: 'Semua Pesan',
};

export default function AutoRepliesPage({ bot, autoReplies }: AutoRepliesPageProps) {
    const [showAddDialog, setShowAddDialog] = useState(false);
    const [editingReply, setEditingReply] = useState<AutoReply | null>(null);

    const { data, setData, post, put, processing, errors, reset } = useForm({
        name: '',
        trigger_type: 'contains' as string,
        trigger_value: '',
        response_type: 'text' as string,
        response_content: '',
        response_media_url: '',
        priority: 0,
        is_active: true,
    });

    const handleAdd = (e: FormEvent) => {
        e.preventDefault();
        post(`/user/telegram/bots/${bot.id}/auto-replies`, {
            onSuccess: () => {
                setShowAddDialog(false);
                reset();
            },
        });
    };

    const handleEdit = (e: FormEvent) => {
        e.preventDefault();
        if (!editingReply) return;
        put(`/user/telegram/bots/${bot.id}/auto-replies/${editingReply.id}`, {
            onSuccess: () => {
                setEditingReply(null);
                reset();
            },
        });
    };

    const handleDelete = (replyId: number) => {
        router.delete(`/user/telegram/bots/${bot.id}/auto-replies/${replyId}`);
    };

    const openEditDialog = (reply: AutoReply) => {
        setEditingReply(reply);
        setData({
            name: reply.name,
            trigger_type: reply.trigger_type,
            trigger_value: reply.trigger_value || '',
            response_type: reply.response_type,
            response_content: reply.response_content,
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

    return (
        <UserLayout>
            <Head title={`Auto Reply - @${bot.bot_username}`} />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="sm" onClick={() => router.visit('/user/telegram')}>
                            <ArrowLeft className="size-4" />
                        </Button>
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">Auto Reply</h1>
                            <p className="text-muted-foreground mt-1">
                                @{bot.bot_username} - {bot.auto_reply_enabled ? 'Aktif' : 'Nonaktif'}
                            </p>
                        </div>
                    </div>
                    <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
                        <DialogTrigger asChild>
                            <Button>
                                <Plus className="mr-2 size-4" />
                                Tambah Rule
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-lg">
                            <form onSubmit={handleAdd}>
                                <DialogHeader>
                                    <DialogTitle>Tambah Auto Reply</DialogTitle>
                                    <DialogDescription>
                                        Buat aturan balasan otomatis baru
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="py-4 space-y-4">
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
                                                placeholder={data.trigger_type === 'regex' ? '^/start$' : 'halo'}
                                                className="mt-2"
                                            />
                                            {errors.trigger_value && <p className="text-sm text-destructive mt-1">{errors.trigger_value}</p>}
                                        </div>
                                    )}
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
                                    {data.response_type !== 'text' && (
                                        <div>
                                            <Label>URL Media</Label>
                                            <Input
                                                value={data.response_media_url}
                                                onChange={(e) => setData('response_media_url', e.target.value)}
                                                placeholder="https://example.com/image.jpg"
                                                className="mt-2"
                                            />
                                        </div>
                                    )}
                                    <div>
                                        <Label>Konten Respon</Label>
                                        <Textarea
                                            value={data.response_content}
                                            onChange={(e) => setData('response_content', e.target.value)}
                                            placeholder="Halo! Selamat datang..."
                                            rows={4}
                                            className="mt-2"
                                        />
                                        {errors.response_content && <p className="text-sm text-destructive mt-1">{errors.response_content}</p>}
                                        <p className="text-xs text-muted-foreground mt-1">Mendukung format HTML (bold, italic, link)</p>
                                    </div>
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

                {/* Auto Replies List */}
                {autoReplies.length === 0 ? (
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex flex-col items-center justify-center py-12">
                                <Zap className="size-16 text-muted-foreground mb-4" />
                                <h3 className="text-xl font-semibold mb-2">Belum Ada Auto Reply</h3>
                                <p className="text-muted-foreground text-center mb-4">
                                    Buat aturan auto reply untuk membalas pesan secara otomatis
                                </p>
                                <Button onClick={() => setShowAddDialog(true)}>
                                    <Plus className="mr-2 size-4" />
                                    Tambah Rule Pertama
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-4">
                        {autoReplies.map((reply) => (
                            <Card key={reply.id}>
                                <CardContent className="pt-6">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-2">
                                                <h3 className="font-semibold">{reply.name}</h3>
                                                <Badge variant={reply.is_active ? 'default' : 'secondary'}>
                                                    {reply.is_active ? 'Aktif' : 'Nonaktif'}
                                                </Badge>
                                                <Badge variant="outline">
                                                    Prioritas: {reply.priority}
                                                </Badge>
                                            </div>
                                            <div className="grid grid-cols-2 gap-4 text-sm">
                                                <div>
                                                    <p className="text-muted-foreground">Trigger:</p>
                                                    <p className="font-mono">
                                                        {triggerTypeLabels[reply.trigger_type]}
                                                        {reply.trigger_value && (
                                                            <span className="text-primary ml-2">"{reply.trigger_value}"</span>
                                                        )}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-muted-foreground">Respon ({reply.response_type}):</p>
                                                    <p className="truncate">{reply.response_content.substring(0, 50)}...</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button variant="outline" size="sm" onClick={() => openEditDialog(reply)}>
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
                                                            Rule "{reply.name}" akan dihapus. Tindakan ini tidak dapat dibatalkan.
                                                        </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel>Batal</AlertDialogCancel>
                                                        <AlertDialogAction
                                                            onClick={() => handleDelete(reply.id)}
                                                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                                        >
                                                            Hapus
                                                        </AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}

                {/* Edit Dialog */}
                <Dialog open={!!editingReply} onOpenChange={(open) => !open && closeDialogs()}>
                    <DialogContent className="max-w-lg">
                        <form onSubmit={handleEdit}>
                            <DialogHeader>
                                <DialogTitle>Edit Auto Reply</DialogTitle>
                            </DialogHeader>
                            <div className="py-4 space-y-4">
                                <div>
                                    <Label>Nama Rule</Label>
                                    <Input
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        className="mt-2"
                                    />
                                </div>
                                <div className="flex items-center justify-between">
                                    <Label>Status Aktif</Label>
                                    <Switch
                                        checked={data.is_active}
                                        onCheckedChange={(v) => setData('is_active', v)}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label>Tipe Trigger</Label>
                                        <Select value={data.trigger_type} onValueChange={(v) => setData('trigger_type', v)}>
                                            <SelectTrigger className="mt-2"><SelectValue /></SelectTrigger>
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
                                            className="mt-2"
                                        />
                                    </div>
                                )}
                                <div>
                                    <Label>Tipe Respon</Label>
                                    <Select value={data.response_type} onValueChange={(v) => setData('response_type', v)}>
                                        <SelectTrigger className="mt-2"><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="text">Teks</SelectItem>
                                            <SelectItem value="photo">Foto + Caption</SelectItem>
                                            <SelectItem value="document">Dokumen + Caption</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                {data.response_type !== 'text' && (
                                    <div>
                                        <Label>URL Media</Label>
                                        <Input
                                            value={data.response_media_url}
                                            onChange={(e) => setData('response_media_url', e.target.value)}
                                            className="mt-2"
                                        />
                                    </div>
                                )}
                                <div>
                                    <Label>Konten Respon</Label>
                                    <Textarea
                                        value={data.response_content}
                                        onChange={(e) => setData('response_content', e.target.value)}
                                        rows={4}
                                        className="mt-2"
                                    />
                                </div>
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
