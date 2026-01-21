import { Head, router, useForm } from '@inertiajs/react';
import { useState } from 'react';
import UserLayout from '@/layouts/user/user-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Plus,
    UserCog,
    Users,
    Clock,
    MoreVertical,
    Edit,
    Trash2,
    Power,
    Circle,
    Phone,
    Mail,
    Shield,
    CheckCircle,
    XCircle,
} from 'lucide-react';

interface WhatsAppSession {
    id: number;
    name: string;
    phone_number: string;
}

interface Agent {
    id: number;
    full_name: string;
    email: string;
    phone_number: string | null;
    role: 'admin' | 'supervisor' | 'agent';
    shift: 'morning' | 'afternoon' | 'night' | 'full_time';
    shift_start: string | null;
    shift_end: string | null;
    is_active: boolean;
    is_online: boolean;
    is_working: boolean;
    last_active_at: string | null;
    whatsapp_session: WhatsAppSession | null;
    assigned_sessions_count: number;
    created_at: string;
}

interface HumanAgentsProps {
    agents: Agent[];
    whatsappSessions: WhatsAppSession[];
}

export default function HumanAgentsIndex({ agents, whatsappSessions }: HumanAgentsProps) {
    const [showCreateDialog, setShowCreateDialog] = useState(false);
    const [editingAgent, setEditingAgent] = useState<Agent | null>(null);
    const [deletingAgent, setDeletingAgent] = useState<Agent | null>(null);

    const { data, setData, post, put, processing, errors, reset } = useForm({
        full_name: '',
        email: '',
        phone_number: '',
        password: '',
        password_confirmation: '',
        role: 'agent' as 'admin' | 'supervisor' | 'agent',
        shift: 'full_time' as 'morning' | 'afternoon' | 'night' | 'full_time',
        shift_start: '',
        shift_end: '',
        whatsapp_session_id: '',
        assigned_sessions: [] as number[],
    });

    const handleCreate = () => {
        reset();
        setEditingAgent(null);
        setShowCreateDialog(true);
    };

    const handleEdit = (agent: Agent) => {
        setData({
            full_name: agent.full_name,
            email: agent.email,
            phone_number: agent.phone_number || '',
            password: '',
            password_confirmation: '',
            role: agent.role,
            shift: agent.shift,
            shift_start: agent.shift_start || '',
            shift_end: agent.shift_end || '',
            whatsapp_session_id: agent.whatsapp_session?.id.toString() || '',
            assigned_sessions: [],
        });
        setEditingAgent(agent);
        setShowCreateDialog(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (editingAgent) {
            put(`/user/human-agents/${editingAgent.id}`, {
                onSuccess: () => {
                    setShowCreateDialog(false);
                    reset();
                },
            });
        } else {
            post('/user/human-agents', {
                onSuccess: () => {
                    setShowCreateDialog(false);
                    reset();
                },
            });
        }
    };

    const handleDelete = () => {
        if (deletingAgent) {
            router.delete(`/user/human-agents/${deletingAgent.id}`, {
                onSuccess: () => setDeletingAgent(null),
            });
        }
    };

    const handleToggleStatus = (agent: Agent) => {
        router.post(`/user/human-agents/${agent.id}/toggle-status`);
    };

    const getRoleBadge = (role: string) => {
        const roleConfig = {
            admin: { label: 'Admin', className: 'bg-purple-100 text-purple-700' },
            supervisor: { label: 'Supervisor', className: 'bg-blue-100 text-blue-700' },
            agent: { label: 'Agent', className: 'bg-gray-100 text-gray-700' },
        };
        return roleConfig[role as keyof typeof roleConfig];
    };

    const getShiftLabel = (shift: string) => {
        const shiftLabels = {
            morning: 'Pagi',
            afternoon: 'Siang',
            night: 'Malam',
            full_time: 'Full Time',
        };
        return shiftLabels[shift as keyof typeof shiftLabels];
    };

    return (
        <UserLayout>
            <Head title="Human Agents - CRM" />

            <div className="space-y-4">
                {/* Header */}
                <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-6 border">
                    <div className="absolute inset-0 bg-grid-white/10 [mask-image:radial-gradient(white,transparent_85%)]" />
                    <div className="relative flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
                                <Users className="size-7 text-primary" />
                                Human Agents
                            </h1>
                            <p className="text-muted-foreground mt-1">
                                Kelola agen manusia untuk menangani chat customer
                            </p>
                        </div>
                        <Button onClick={handleCreate} size="lg" className="gap-2">
                            <Plus className="size-4" />
                            Buat Agent Baru
                        </Button>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid gap-3 md:grid-cols-4">
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-blue-100">
                                    <Users className="size-5 text-blue-600" />
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground">Total Agents</p>
                                    <p className="text-xl font-bold">{agents.length}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-green-100">
                                    <CheckCircle className="size-5 text-green-600" />
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground">Agents Aktif</p>
                                    <p className="text-xl font-bold">
                                        {agents.filter(a => a.is_active).length}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-emerald-100">
                                    <Circle className="size-5 text-emerald-600 fill-emerald-600" />
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground">Sedang Online</p>
                                    <p className="text-xl font-bold">
                                        {agents.filter(a => a.is_online).length}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-orange-100">
                                    <Clock className="size-5 text-orange-600" />
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground">Sedang Bekerja</p>
                                    <p className="text-xl font-bold">
                                        {agents.filter(a => a.is_working).length}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Agents List */}
                <Card className="overflow-hidden border-2">
                    <div className="h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />
                    <CardHeader className="border-b pb-3">
                        <CardTitle className="flex items-center gap-2">
                            <Users className="size-5 text-primary" />
                            Daftar Agents
                        </CardTitle>
                        <CardDescription>
                            Kelola agents yang dapat menangani chat customer
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-4">
                        {agents.length > 0 ? (
                            <div className="space-y-2">
                                {agents.map((agent) => (
                                    <Card key={agent.id} className="p-4">
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex items-start gap-4 flex-1">
                                                {/* Avatar */}
                                                <div className="relative">
                                                    <div className="size-12 rounded-full bg-gradient-to-br from-purple-400 to-blue-500 flex items-center justify-center text-white font-semibold">
                                                        {agent.full_name.substring(0, 2).toUpperCase()}
                                                    </div>
                                                    {agent.is_online && (
                                                        <div className="absolute -bottom-0.5 -right-0.5 size-4 bg-green-500 border-2 border-white rounded-full" />
                                                    )}
                                                </div>

                                                {/* Info */}
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <h3 className="font-semibold text-base">{agent.full_name}</h3>
                                                        <Badge className={getRoleBadge(agent.role).className}>
                                                            {getRoleBadge(agent.role).label}
                                                        </Badge>
                                                        {agent.is_working && (
                                                            <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
                                                                <Circle className="size-2 mr-1 fill-emerald-700" />
                                                                Working
                                                            </Badge>
                                                        )}
                                                    </div>

                                                    <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground mb-2">
                                                        <div className="flex items-center gap-1">
                                                            <Mail className="size-3" />
                                                            <span className="truncate">{agent.email}</span>
                                                        </div>
                                                        {agent.phone_number && (
                                                            <div className="flex items-center gap-1">
                                                                <Phone className="size-3" />
                                                                <span>{agent.phone_number}</span>
                                                            </div>
                                                        )}
                                                        <div className="flex items-center gap-1">
                                                            <Clock className="size-3" />
                                                            <span>Shift: {getShiftLabel(agent.shift)}</span>
                                                        </div>
                                                        {agent.whatsapp_session && (
                                                            <div className="flex items-center gap-1">
                                                                <UserCog className="size-3" />
                                                                <span className="truncate">{agent.whatsapp_session.name}</span>
                                                            </div>
                                                        )}
                                                    </div>

                                                    {agent.last_active_at && (
                                                        <p className="text-xs text-muted-foreground">
                                                            Terakhir aktif: {agent.last_active_at}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Actions */}
                                            <div className="flex items-center gap-2">
                                                <Badge variant={agent.is_active ? 'default' : 'secondary'} className={agent.is_active ? 'bg-green-500' : ''}>
                                                    {agent.is_active ? 'Aktif' : 'Nonaktif'}
                                                </Badge>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                                            <MoreVertical className="size-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem onClick={() => handleEdit(agent)}>
                                                            <Edit className="size-4 mr-2" />
                                                            Edit
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => handleToggleStatus(agent)}>
                                                            <Power className="size-4 mr-2" />
                                                            {agent.is_active ? 'Nonaktifkan' : 'Aktifkan'}
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            onClick={() => setDeletingAgent(agent)}
                                                            className="text-destructive focus:text-destructive"
                                                        >
                                                            <Trash2 className="size-4 mr-2" />
                                                            Hapus
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </div>
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-12">
                                <div className="p-4 rounded-full bg-muted mb-4">
                                    <Users className="size-8 text-muted-foreground" />
                                </div>
                                <p className="text-sm font-medium mb-1">Belum ada agent</p>
                                <p className="text-sm text-muted-foreground mb-4">
                                    Buat agent baru untuk mulai mengelola chat customer
                                </p>
                                <Button onClick={handleCreate}>
                                    <Plus className="size-4 mr-2" />
                                    Buat Agent Baru
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Create/Edit Dialog */}
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{editingAgent ? 'Edit Agent' : 'Buat Agent Baru'}</DialogTitle>
                        <DialogDescription>
                            {editingAgent ? 'Update informasi agent' : 'Tambahkan agent baru untuk menangani chat customer'}
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="full_name">Nama Lengkap *</Label>
                                <Input
                                    id="full_name"
                                    value={data.full_name}
                                    onChange={(e) => setData('full_name', e.target.value)}
                                    placeholder="Masukkan nama lengkap"
                                    required
                                />
                                {errors.full_name && (
                                    <p className="text-xs text-destructive">{errors.full_name}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="email">Email *</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    placeholder="agent@example.com"
                                    required
                                />
                                {errors.email && (
                                    <p className="text-xs text-destructive">{errors.email}</p>
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="phone_number">Nomor Telepon</Label>
                                <Input
                                    id="phone_number"
                                    value={data.phone_number}
                                    onChange={(e) => setData('phone_number', e.target.value)}
                                    placeholder="08123456789"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="role">Role *</Label>
                                <Select value={data.role} onValueChange={(v) => setData('role', v as any)}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="agent">Agent</SelectItem>
                                        <SelectItem value="supervisor">Supervisor</SelectItem>
                                        <SelectItem value="admin">Admin</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="password">Password {!editingAgent && '*'}</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    value={data.password}
                                    onChange={(e) => setData('password', e.target.value)}
                                    placeholder={editingAgent ? 'Kosongkan jika tidak diubah' : 'Minimal 6 karakter'}
                                    required={!editingAgent}
                                />
                                {errors.password && (
                                    <p className="text-xs text-destructive">{errors.password}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="password_confirmation">Konfirmasi Password {!editingAgent && '*'}</Label>
                                <Input
                                    id="password_confirmation"
                                    type="password"
                                    value={data.password_confirmation}
                                    onChange={(e) => setData('password_confirmation', e.target.value)}
                                    placeholder="Ulangi password"
                                    required={!editingAgent && !!data.password}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="shift">Shift Kerja *</Label>
                                <Select value={data.shift} onValueChange={(v) => setData('shift', v as any)}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="full_time">Full Time</SelectItem>
                                        <SelectItem value="morning">Pagi (07:00 - 15:00)</SelectItem>
                                        <SelectItem value="afternoon">Siang (15:00 - 23:00)</SelectItem>
                                        <SelectItem value="night">Malam (23:00 - 07:00)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="whatsapp_session_id">WhatsApp Number</Label>
                                <Select
                                    value={data.whatsapp_session_id || 'none'}
                                    onValueChange={(v) => setData('whatsapp_session_id', v === 'none' ? '' : v)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Pilih WhatsApp" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="none">Tidak ada</SelectItem>
                                        {whatsappSessions.map((session) => (
                                            <SelectItem key={session.id} value={session.id.toString()}>
                                                {session.name} - {session.phone_number}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <p className="text-xs text-muted-foreground">
                                    Pilih nomor WhatsApp yang akan ditangani agent ini
                                </p>
                            </div>
                        </div>

                        {data.shift !== 'full_time' && (
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="shift_start">Jam Mulai</Label>
                                    <Input
                                        id="shift_start"
                                        type="time"
                                        value={data.shift_start}
                                        onChange={(e) => setData('shift_start', e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="shift_end">Jam Selesai</Label>
                                    <Input
                                        id="shift_end"
                                        type="time"
                                        value={data.shift_end}
                                        onChange={(e) => setData('shift_end', e.target.value)}
                                    />
                                </div>
                            </div>
                        )}

                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setShowCreateDialog(false)}
                            >
                                Batal
                            </Button>
                            <Button type="submit" disabled={processing}>
                                {processing ? 'Menyimpan...' : (editingAgent ? 'Update Agent' : 'Buat Agent')}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation */}
            <AlertDialog open={!!deletingAgent} onOpenChange={() => setDeletingAgent(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Hapus Agent?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Agent "{deletingAgent?.full_name}" akan dihapus. Tindakan ini tidak dapat dibatalkan.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Batal</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            Hapus
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </UserLayout>
    );
}
