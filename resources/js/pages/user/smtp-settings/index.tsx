import { useState, FormEvent } from 'react';
import UserLayout from '@/layouts/user/user-layout';
import { Head, router, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Plus, Mail, Trash2, Edit, CheckCircle, XCircle, Settings, PlayCircle } from 'lucide-react';
import { toast } from 'sonner';

interface SmtpSetting {
    id: number;
    name: string;
    host: string;
    port: number;
    username: string;
    encryption: string;
    from_address: string;
    from_name: string;
    is_active: boolean;
    is_verified: boolean;
    verified_at: string | null;
    created_at: string;
}

interface Props {
    smtpSettings: SmtpSetting[];
}

export default function SmtpSettingsIndex({ smtpSettings }: Props) {
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingSmtp, setEditingSmtp] = useState<SmtpSetting | null>(null);

    const { data: createData, setData: setCreateData, post: postCreate, processing: creatingSmtp, reset: resetCreate } = useForm({
        name: '',
        host: '',
        port: 587,
        username: '',
        password: '',
        encryption: 'tls',
        from_address: '',
        from_name: '',
    });

    const { data: editData, setData: setEditData, put: putEdit, processing: editingSmtpLoading } = useForm({
        name: '',
        host: '',
        port: 587,
        username: '',
        password: '',
        encryption: 'tls',
        from_address: '',
        from_name: '',
    });

    const handleCreateSubmit = (e: FormEvent) => {
        e.preventDefault();
        postCreate('/user/smtp-settings', {
            onSuccess: () => {
                toast.success('SMTP setting berhasil ditambahkan');
                setIsCreateModalOpen(false);
                resetCreate();
            },
            onError: (errors) => {
                const firstError = Object.values(errors)[0];
                toast.error(firstError as string);
            },
        });
    };

    const handleEditSubmit = (e: FormEvent) => {
        e.preventDefault();
        if (!editingSmtp) return;

        putEdit(`/user/smtp-settings/${editingSmtp.id}`, {
            onSuccess: () => {
                toast.success('SMTP setting berhasil diperbarui');
                setIsEditModalOpen(false);
                setEditingSmtp(null);
            },
            onError: (errors) => {
                const firstError = Object.values(errors)[0];
                toast.error(firstError as string);
            },
        });
    };

    const handleDelete = (smtp: SmtpSetting) => {
        if (!confirm('Apakah Anda yakin ingin menghapus SMTP setting ini?')) return;

        router.delete(`/user/smtp-settings/${smtp.id}`, {
            onSuccess: () => toast.success('SMTP setting berhasil dihapus'),
            onError: () => toast.error('Gagal menghapus SMTP setting'),
        });
    };

    const handleSetActive = (smtp: SmtpSetting) => {
        if (!smtp.is_verified) {
            toast.error('SMTP harus diverifikasi terlebih dahulu');
            return;
        }

        router.post(`/user/smtp-settings/${smtp.id}/set-active`, {}, {
            onSuccess: () => toast.success('SMTP berhasil diaktifkan'),
            onError: () => toast.error('Gagal mengaktifkan SMTP'),
        });
    };

    const handleTest = (smtp: SmtpSetting) => {
        router.post(`/user/smtp-settings/${smtp.id}/test`, {}, {
            onSuccess: () => toast.success('Test email berhasil dikirim! Silakan cek email Anda.'),
            onError: (errors) => {
                const message = errors.message || 'Gagal mengirim test email';
                toast.error(message);
            },
        });
    };

    const openEditModal = (smtp: SmtpSetting) => {
        setEditingSmtp(smtp);
        setEditData({
            name: smtp.name,
            host: smtp.host,
            port: smtp.port,
            username: smtp.username,
            password: '',
            encryption: smtp.encryption,
            from_address: smtp.from_address,
            from_name: smtp.from_name,
        });
        setIsEditModalOpen(true);
    };

    return (
        <UserLayout>
            <Head title="SMTP Settings" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">SMTP Settings</h1>
                        <p className="text-muted-foreground mt-1">
                            Kelola konfigurasi SMTP Anda untuk mengirim email broadcast
                        </p>
                    </div>
                    <Button onClick={() => setIsCreateModalOpen(true)}>
                        <Plus className="mr-2 size-4" />
                        Tambah SMTP
                    </Button>
                </div>

                {/* SMTP Settings List */}
                {smtpSettings.length === 0 ? (
                    <Card>
                        <CardContent className="flex flex-col items-center justify-center py-12">
                            <Mail className="size-12 text-muted-foreground mb-4" />
                            <h3 className="text-lg font-semibold mb-2">Belum ada SMTP setting</h3>
                            <p className="text-muted-foreground text-center mb-4">
                                Tambahkan SMTP setting pertama Anda untuk mulai mengirim email broadcast
                            </p>
                            <Button onClick={() => setIsCreateModalOpen(true)}>
                                <Plus className="mr-2 size-4" />
                                Tambah SMTP
                            </Button>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {smtpSettings.map((smtp) => (
                            <Card key={smtp.id} className={smtp.is_active ? 'border-primary' : ''}>
                                <CardHeader>
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <CardTitle className="flex items-center gap-2">
                                                {smtp.name}
                                                {smtp.is_active && (
                                                    <Badge variant="default" className="text-xs">
                                                        Active
                                                    </Badge>
                                                )}
                                            </CardTitle>
                                            <CardDescription className="mt-1">
                                                {smtp.from_address}
                                            </CardDescription>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Host:</span>
                                            <span className="font-medium">{smtp.host}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Port:</span>
                                            <span className="font-medium">{smtp.port}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Encryption:</span>
                                            <span className="font-medium uppercase">{smtp.encryption}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Status:</span>
                                            <Badge variant={smtp.is_verified ? 'success' : 'secondary'} className="text-xs">
                                                {smtp.is_verified ? (
                                                    <>
                                                        <CheckCircle className="size-3 mr-1" />
                                                        Verified
                                                    </>
                                                ) : (
                                                    <>
                                                        <XCircle className="size-3 mr-1" />
                                                        Not Verified
                                                    </>
                                                )}
                                            </Badge>
                                        </div>
                                    </div>

                                    <div className="flex gap-2 pt-2 border-t">
                                        {!smtp.is_verified && (
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="flex-1"
                                                onClick={() => handleTest(smtp)}
                                            >
                                                <PlayCircle className="size-4 mr-1" />
                                                Test
                                            </Button>
                                        )}
                                        {smtp.is_verified && !smtp.is_active && (
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="flex-1"
                                                onClick={() => handleSetActive(smtp)}
                                            >
                                                <Settings className="size-4 mr-1" />
                                                Set Active
                                            </Button>
                                        )}
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => openEditModal(smtp)}
                                        >
                                            <Edit className="size-4" />
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => handleDelete(smtp)}
                                        >
                                            <Trash2 className="size-4" />
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>

            {/* Create Modal */}
            <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Tambah SMTP Setting</DialogTitle>
                        <DialogDescription>
                            Tambahkan konfigurasi SMTP baru untuk mengirim email
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleCreateSubmit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="col-span-2">
                                <Label htmlFor="create-name">Nama Konfigurasi</Label>
                                <Input
                                    id="create-name"
                                    value={createData.name}
                                    onChange={(e) => setCreateData('name', e.target.value)}
                                    placeholder="e.g., Gmail Primary"
                                    required
                                />
                            </div>

                            <div>
                                <Label htmlFor="create-host">SMTP Host</Label>
                                <Input
                                    id="create-host"
                                    value={createData.host}
                                    onChange={(e) => setCreateData('host', e.target.value)}
                                    placeholder="smtp.gmail.com"
                                    required
                                />
                            </div>

                            <div>
                                <Label htmlFor="create-port">SMTP Port</Label>
                                <Input
                                    id="create-port"
                                    type="number"
                                    value={createData.port}
                                    onChange={(e) => setCreateData('port', parseInt(e.target.value))}
                                    required
                                />
                            </div>

                            <div>
                                <Label htmlFor="create-username">Username</Label>
                                <Input
                                    id="create-username"
                                    value={createData.username}
                                    onChange={(e) => setCreateData('username', e.target.value)}
                                    placeholder="your-email@gmail.com"
                                    required
                                />
                            </div>

                            <div>
                                <Label htmlFor="create-password">Password</Label>
                                <Input
                                    id="create-password"
                                    type="password"
                                    value={createData.password}
                                    onChange={(e) => setCreateData('password', e.target.value)}
                                    placeholder="Your SMTP password"
                                    required
                                />
                            </div>

                            <div>
                                <Label htmlFor="create-encryption">Encryption</Label>
                                <Select
                                    value={createData.encryption}
                                    onValueChange={(value) => setCreateData('encryption', value)}
                                >
                                    <SelectTrigger id="create-encryption">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="tls">TLS</SelectItem>
                                        <SelectItem value="ssl">SSL</SelectItem>
                                        <SelectItem value="none">None</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <Label htmlFor="create-from-address">From Address</Label>
                                <Input
                                    id="create-from-address"
                                    type="email"
                                    value={createData.from_address}
                                    onChange={(e) => setCreateData('from_address', e.target.value)}
                                    placeholder="sender@example.com"
                                    required
                                />
                            </div>

                            <div>
                                <Label htmlFor="create-from-name">From Name</Label>
                                <Input
                                    id="create-from-name"
                                    value={createData.from_name}
                                    onChange={(e) => setCreateData('from_name', e.target.value)}
                                    placeholder="Your Company"
                                    required
                                />
                            </div>
                        </div>

                        <div className="flex justify-end gap-2 pt-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setIsCreateModalOpen(false)}
                                disabled={creatingSmtp}
                            >
                                Batal
                            </Button>
                            <Button type="submit" disabled={creatingSmtp}>
                                {creatingSmtp ? 'Menyimpan...' : 'Simpan'}
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Edit Modal */}
            <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Edit SMTP Setting</DialogTitle>
                        <DialogDescription>
                            Perbarui konfigurasi SMTP Anda
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleEditSubmit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="col-span-2">
                                <Label htmlFor="edit-name">Nama Konfigurasi</Label>
                                <Input
                                    id="edit-name"
                                    value={editData.name}
                                    onChange={(e) => setEditData('name', e.target.value)}
                                    required
                                />
                            </div>

                            <div>
                                <Label htmlFor="edit-host">SMTP Host</Label>
                                <Input
                                    id="edit-host"
                                    value={editData.host}
                                    onChange={(e) => setEditData('host', e.target.value)}
                                    required
                                />
                            </div>

                            <div>
                                <Label htmlFor="edit-port">SMTP Port</Label>
                                <Input
                                    id="edit-port"
                                    type="number"
                                    value={editData.port}
                                    onChange={(e) => setEditData('port', parseInt(e.target.value))}
                                    required
                                />
                            </div>

                            <div>
                                <Label htmlFor="edit-username">Username</Label>
                                <Input
                                    id="edit-username"
                                    value={editData.username}
                                    onChange={(e) => setEditData('username', e.target.value)}
                                    required
                                />
                            </div>

                            <div>
                                <Label htmlFor="edit-password">Password</Label>
                                <Input
                                    id="edit-password"
                                    type="password"
                                    value={editData.password}
                                    onChange={(e) => setEditData('password', e.target.value)}
                                    placeholder="Kosongkan jika tidak ingin mengubah"
                                />
                            </div>

                            <div>
                                <Label htmlFor="edit-encryption">Encryption</Label>
                                <Select
                                    value={editData.encryption}
                                    onValueChange={(value) => setEditData('encryption', value)}
                                >
                                    <SelectTrigger id="edit-encryption">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="tls">TLS</SelectItem>
                                        <SelectItem value="ssl">SSL</SelectItem>
                                        <SelectItem value="none">None</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <Label htmlFor="edit-from-address">From Address</Label>
                                <Input
                                    id="edit-from-address"
                                    type="email"
                                    value={editData.from_address}
                                    onChange={(e) => setEditData('from_address', e.target.value)}
                                    required
                                />
                            </div>

                            <div>
                                <Label htmlFor="edit-from-name">From Name</Label>
                                <Input
                                    id="edit-from-name"
                                    value={editData.from_name}
                                    onChange={(e) => setEditData('from_name', e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div className="flex justify-end gap-2 pt-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setIsEditModalOpen(false)}
                                disabled={editingSmtpLoading}
                            >
                                Batal
                            </Button>
                            <Button type="submit" disabled={editingSmtpLoading}>
                                {editingSmtpLoading ? 'Menyimpan...' : 'Simpan'}
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </UserLayout>
    );
}
