import { Head, useForm, router } from '@inertiajs/react';
import UserLayout from '@/layouts/user/user-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Mail, Plus, Trash2, CheckCircle2, XCircle, Clock, AlertCircle, Eye } from 'lucide-react';
import { FormEventHandler, useState } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface UserEmail {
    id: number;
    email: string;
    status: 'pending' | 'approved' | 'rejected';
    verified_at: string | null;
    approved_at: string | null;
    approved_by: string | null;
    rejection_reason: string | null;
    notes: string | null;
    created_at: string;
}

interface EmailSettingsProps {
    emails: UserEmail[];
}

export default function EmailSettings({ emails }: EmailSettingsProps) {
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [selectedEmail, setSelectedEmail] = useState<UserEmail | null>(null);
    const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);

    const addEmailForm = useForm({
        email: '',
    });

    const handleAddEmail: FormEventHandler = (e) => {
        e.preventDefault();
        addEmailForm.post('/user/email-settings', {
            preserveScroll: true,
            onSuccess: () => {
                addEmailForm.reset();
                setIsAddDialogOpen(false);
            },
        });
    };

    const handleDeleteEmail = (id: number) => {
        if (confirm('Apakah Anda yakin ingin menghapus email ini?')) {
            router.delete(`/user/email-settings/${id}`, {
                preserveScroll: true,
            });
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'approved':
                return (
                    <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                        Disetujui
                    </Badge>
                );
            case 'pending':
                return (
                    <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
                        <Clock className="w-3 h-3 mr-1" />
                        Menunggu
                    </Badge>
                );
            case 'rejected':
                return (
                    <Badge className="bg-red-100 text-red-800 hover:bg-red-100">
                        <XCircle className="w-3 h-3 mr-1" />
                        Ditolak
                    </Badge>
                );
            default:
                return null;
        }
    };

    return (
        <UserLayout>
            <Head title="Pengaturan Email" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Pengaturan Email</h1>
                        <p className="text-muted-foreground mt-2">
                            Kelola alamat email Anda untuk fitur broadcast email
                        </p>
                    </div>
                    <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                        <DialogTrigger asChild>
                            <Button>
                                <Plus className="w-4 h-4 mr-2" />
                                Tambah Email
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <form onSubmit={handleAddEmail}>
                                <DialogHeader>
                                    <DialogTitle>Tambah Email Baru</DialogTitle>
                                    <DialogDescription>
                                        Masukkan alamat email yang ingin Anda gunakan untuk broadcast.
                                        Email akan diverifikasi admin, lalu Mailketing akan mengirim konfirmasi ke email Anda.
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4 py-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="email">Alamat Email</Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            placeholder="email@example.com"
                                            value={addEmailForm.data.email}
                                            onChange={(e) => addEmailForm.setData('email', e.target.value)}
                                            required
                                        />
                                        {addEmailForm.errors.email && (
                                            <p className="text-sm text-red-600">{addEmailForm.errors.email}</p>
                                        )}
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => setIsAddDialogOpen(false)}
                                    >
                                        Batal
                                    </Button>
                                    <Button type="submit" disabled={addEmailForm.processing}>
                                        {addEmailForm.processing ? 'Menyimpan...' : 'Simpan'}
                                    </Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>

                {/* Info Alert */}
                <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                        Email yang Anda tambahkan akan diverifikasi oleh admin terlebih dahulu.
                        Setelah disetujui, Mailketing akan mengirim email konfirmasi ke alamat Anda.
                        Klik link konfirmasi di email tersebut untuk mengaktifkan email broadcast.
                    </AlertDescription>
                </Alert>

                {/* Email List */}
                <Card>
                    <CardHeader>
                        <CardTitle>Daftar Email</CardTitle>
                        <CardDescription>
                            Email yang telah Anda daftarkan
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {emails.length === 0 ? (
                            <div className="text-center py-12">
                                <Mail className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                                <h3 className="text-lg font-semibold mb-2">Belum ada email terdaftar</h3>
                                <p className="text-muted-foreground mb-4">
                                    Tambahkan email untuk mulai menggunakan fitur broadcast email
                                </p>
                                <Button onClick={() => setIsAddDialogOpen(true)}>
                                    <Plus className="w-4 h-4 mr-2" />
                                    Tambah Email Pertama
                                </Button>
                            </div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Email</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Tanggal Ditambahkan</TableHead>
                                        <TableHead>Disetujui Oleh</TableHead>
                                        <TableHead className="text-right">Aksi</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {emails.map((email) => (
                                        <TableRow key={email.id}>
                                            <TableCell className="font-medium">
                                                <div className="flex items-center gap-2">
                                                    <Mail className="w-4 h-4 text-muted-foreground" />
                                                    {email.email}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                {getStatusBadge(email.status)}
                                                {email.status === 'rejected' && email.rejection_reason && (
                                                    <p className="text-xs text-red-600 mt-1">
                                                        Alasan: {email.rejection_reason}
                                                    </p>
                                                )}
                                                {email.status !== 'pending' && email.notes && (
                                                    <p className="text-xs text-muted-foreground mt-1">
                                                        Catatan: {email.notes}
                                                    </p>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-sm text-muted-foreground">
                                                {email.created_at}
                                            </TableCell>
                                            <TableCell className="text-sm text-muted-foreground">
                                                {email.approved_by || '-'}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => {
                                                            setSelectedEmail(email);
                                                            setIsDetailDialogOpen(true);
                                                        }}
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                    </Button>
                                                    {email.status !== 'approved' && (
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => handleDeleteEmail(email.id)}
                                                        >
                                                            <Trash2 className="w-4 h-4 text-red-600" />
                                                        </Button>
                                                    )}
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Detail Dialog */}
            <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Detail Email</DialogTitle>
                        <DialogDescription>
                            Informasi lengkap tentang email broadcast
                        </DialogDescription>
                    </DialogHeader>
                    {selectedEmail && (
                        <div className="space-y-4 py-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label className="text-muted-foreground">Email</Label>
                                    <p className="font-medium mt-1">{selectedEmail.email}</p>
                                </div>
                                <div>
                                    <Label className="text-muted-foreground">Status</Label>
                                    <div className="mt-1">{getStatusBadge(selectedEmail.status)}</div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label className="text-muted-foreground">Tanggal Ditambahkan</Label>
                                    <p className="text-sm mt-1">{selectedEmail.created_at}</p>
                                </div>
                                {selectedEmail.approved_at && (
                                    <div>
                                        <Label className="text-muted-foreground">Tanggal Disetujui</Label>
                                        <p className="text-sm mt-1">{selectedEmail.approved_at}</p>
                                    </div>
                                )}
                            </div>

                            {selectedEmail.approved_by && (
                                <div>
                                    <Label className="text-muted-foreground">Disetujui Oleh</Label>
                                    <p className="text-sm mt-1">{selectedEmail.approved_by}</p>
                                </div>
                            )}

                            {selectedEmail.verified_at && (
                                <div>
                                    <Label className="text-muted-foreground">Tanggal Verifikasi</Label>
                                    <p className="text-sm mt-1">{selectedEmail.verified_at}</p>
                                </div>
                            )}

                            {selectedEmail.rejection_reason && (
                                <div>
                                    <Label className="text-muted-foreground">Alasan Penolakan</Label>
                                    <Alert className="mt-2 border-red-200 bg-red-50">
                                        <XCircle className="h-4 w-4 text-red-600" />
                                        <AlertDescription className="text-red-800">
                                            {selectedEmail.rejection_reason}
                                        </AlertDescription>
                                    </Alert>
                                </div>
                            )}

                            {selectedEmail.notes && (
                                <div>
                                    <Label className="text-muted-foreground">Catatan dari Admin</Label>
                                    <Alert className="mt-2">
                                        <AlertCircle className="h-4 w-4" />
                                        <AlertDescription>
                                            {selectedEmail.notes}
                                        </AlertDescription>
                                    </Alert>
                                </div>
                            )}
                        </div>
                    )}
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDetailDialogOpen(false)}>
                            Tutup
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </UserLayout>
    );
}
