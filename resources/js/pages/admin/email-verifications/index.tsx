import { Head, router, useForm } from '@inertiajs/react';
import AdminLayout from '@/layouts/admin/admin-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
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
} from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Mail, CheckCircle2, XCircle, Clock, Send, User, Eye, Info } from 'lucide-react';
import { useState, FormEventHandler } from 'react';

interface UserEmail {
    id: number;
    user_id: number;
    user_name: string;
    user_email: string;
    email: string;
    status: 'pending' | 'approved' | 'rejected';
    verified_at: string | null;
    approved_at: string | null;
    approved_by: string | null;
    rejection_reason: string | null;
    notes: string | null;
    created_at: string;
}

interface Stats {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
}

interface EmailVerificationsProps {
    emails: UserEmail[];
    stats: Stats;
    currentStatus: string;
}

export default function EmailVerifications({ emails, stats, currentStatus }: EmailVerificationsProps) {
    const [selectedEmail, setSelectedEmail] = useState<UserEmail | null>(null);
    const [approveDialogOpen, setApproveDialogOpen] = useState(false);
    const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
    const [detailDialogOpen, setDetailDialogOpen] = useState(false);

    const approveForm = useForm({
        notes: '',
    });

    const rejectForm = useForm({
        rejection_reason: '',
        notes: '',
    });

    const handleApprove: FormEventHandler = (e) => {
        e.preventDefault();
        if (!selectedEmail) return;

        approveForm.post(`/admin/email-verifications/${selectedEmail.id}/approve`, {
            preserveScroll: true,
            onSuccess: () => {
                approveForm.reset();
                setApproveDialogOpen(false);
                setSelectedEmail(null);
            },
        });
    };

    const handleReject: FormEventHandler = (e) => {
        e.preventDefault();
        if (!selectedEmail) return;

        rejectForm.post(`/admin/email-verifications/${selectedEmail.id}/reject`, {
            preserveScroll: true,
            onSuccess: () => {
                rejectForm.reset();
                setRejectDialogOpen(false);
                setSelectedEmail(null);
            },
        });
    };

    const handleResend = (id: number) => {
        if (confirm('Kirim ulang email verifikasi?')) {
            router.post(`/admin/email-verifications/${id}/resend`, {}, {
                preserveScroll: true,
            });
        }
    };

    const handleStatusFilter = (status: string) => {
        router.get('/admin/email-verifications', { status }, {
            preserveScroll: true,
            preserveState: true,
        });
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
        <AdminLayout>
            <Head title="Verifikasi Email" />

            <div className="space-y-6">
                {/* Header */}
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Verifikasi Email</h1>
                    <p className="text-muted-foreground mt-2">
                        Kelola verifikasi email user untuk fitur broadcast
                    </p>
                </div>

                {/* Stats Cards */}
                <div className="grid gap-4 md:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Email</CardTitle>
                            <Mail className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.total}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Menunggu</CardTitle>
                            <Clock className="h-4 w-4 text-yellow-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.pending}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Disetujui</CardTitle>
                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.approved}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Ditolak</CardTitle>
                            <XCircle className="h-4 w-4 text-red-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.rejected}</div>
                        </CardContent>
                    </Card>
                </div>

                {/* Email List */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle>Daftar Email</CardTitle>
                                <CardDescription>
                                    Email yang didaftarkan oleh user
                                </CardDescription>
                            </div>
                            <Select value={currentStatus} onValueChange={handleStatusFilter}>
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder="Filter Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Semua Status</SelectItem>
                                    <SelectItem value="pending">Menunggu</SelectItem>
                                    <SelectItem value="approved">Disetujui</SelectItem>
                                    <SelectItem value="rejected">Ditolak</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {emails.length === 0 ? (
                            <div className="text-center py-12">
                                <Mail className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                                <h3 className="text-lg font-semibold mb-2">Tidak ada email</h3>
                                <p className="text-muted-foreground">
                                    Belum ada email yang perlu diverifikasi
                                </p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>User</TableHead>
                                            <TableHead>Email Broadcast</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Tanggal Submit</TableHead>
                                            <TableHead>Verified At</TableHead>
                                            <TableHead className="text-right">Aksi</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {emails.map((email) => (
                                            <TableRow key={email.id}>
                                                <TableCell>
                                                    <div className="flex flex-col">
                                                        <div className="flex items-center gap-2">
                                                            <User className="w-4 h-4 text-muted-foreground" />
                                                            <span className="font-medium">{email.user_name}</span>
                                                        </div>
                                                        <span className="text-xs text-muted-foreground">
                                                            {email.user_email}
                                                        </span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <Mail className="w-4 h-4 text-muted-foreground" />
                                                        <span className="font-mono text-sm">{email.email}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    {getStatusBadge(email.status)}
                                                    {email.status === 'rejected' && email.rejection_reason && (
                                                        <p className="text-xs text-red-600 mt-1">
                                                            {email.rejection_reason}
                                                        </p>
                                                    )}
                                                </TableCell>
                                                <TableCell className="text-sm text-muted-foreground">
                                                    {email.created_at}
                                                </TableCell>
                                                <TableCell className="text-sm text-muted-foreground">
                                                    {email.verified_at || '-'}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <Button
                                                            size="sm"
                                                            variant="ghost"
                                                            onClick={() => {
                                                                setSelectedEmail(email);
                                                                setDetailDialogOpen(true);
                                                            }}
                                                        >
                                                            <Eye className="w-4 h-4" />
                                                        </Button>
                                                        {email.status === 'pending' && (
                                                            <>
                                                                <Button
                                                                    size="sm"
                                                                    variant="default"
                                                                    onClick={() => {
                                                                        setSelectedEmail(email);
                                                                        setApproveDialogOpen(true);
                                                                    }}
                                                                >
                                                                    <CheckCircle2 className="w-4 h-4 mr-1" />
                                                                    Approve
                                                                </Button>
                                                                <Button
                                                                    size="sm"
                                                                    variant="destructive"
                                                                    onClick={() => {
                                                                        setSelectedEmail(email);
                                                                        setRejectDialogOpen(true);
                                                                    }}
                                                                >
                                                                    <XCircle className="w-4 h-4 mr-1" />
                                                                    Reject
                                                                </Button>
                                                            </>
                                                        )}
                                                        {email.status === 'approved' && (
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                onClick={() => handleResend(email.id)}
                                                            >
                                                                <Send className="w-4 h-4 mr-1" />
                                                                Kirim Ulang
                                                            </Button>
                                                        )}
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Approve Dialog */}
            <Dialog open={approveDialogOpen} onOpenChange={setApproveDialogOpen}>
                <DialogContent>
                    <form onSubmit={handleApprove}>
                        <DialogHeader>
                            <DialogTitle>Approve Email</DialogTitle>
                            <DialogDescription>
                                Setujui email <strong>{selectedEmail?.email}</strong> untuk user{' '}
                                <strong>{selectedEmail?.user_name}</strong>. Email verifikasi akan dikirim otomatis via Mailketing.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="notes">Catatan (Opsional)</Label>
                                <Textarea
                                    id="notes"
                                    placeholder="Tambahkan catatan jika diperlukan"
                                    value={approveForm.data.notes}
                                    onChange={(e) => approveForm.setData('notes', e.target.value)}
                                    rows={3}
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setApproveDialogOpen(false)}
                            >
                                Batal
                            </Button>
                            <Button type="submit" disabled={approveForm.processing}>
                                {approveForm.processing ? 'Memproses...' : 'Approve & Kirim Email'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Reject Dialog */}
            <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
                <DialogContent>
                    <form onSubmit={handleReject}>
                        <DialogHeader>
                            <DialogTitle>Reject Email</DialogTitle>
                            <DialogDescription>
                                Tolak email <strong>{selectedEmail?.email}</strong> untuk user{' '}
                                <strong>{selectedEmail?.user_name}</strong>. Berikan alasan penolakan.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="rejection_reason">Alasan Penolakan *</Label>
                                <Textarea
                                    id="rejection_reason"
                                    placeholder="Jelaskan alasan penolakan email ini"
                                    value={rejectForm.data.rejection_reason}
                                    onChange={(e) => rejectForm.setData('rejection_reason', e.target.value)}
                                    rows={3}
                                    required
                                />
                                {rejectForm.errors.rejection_reason && (
                                    <p className="text-sm text-red-600">{rejectForm.errors.rejection_reason}</p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="reject_notes">Catatan (Opsional)</Label>
                                <Textarea
                                    id="reject_notes"
                                    placeholder="Tambahkan catatan internal jika diperlukan"
                                    value={rejectForm.data.notes}
                                    onChange={(e) => rejectForm.setData('notes', e.target.value)}
                                    rows={2}
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setRejectDialogOpen(false)}
                            >
                                Batal
                            </Button>
                            <Button type="submit" variant="destructive" disabled={rejectForm.processing}>
                                {rejectForm.processing ? 'Memproses...' : 'Reject Email'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Detail Dialog */}
            <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Detail Verifikasi</DialogTitle>
                        <DialogDescription>
                            Informasi lengkap verifikasi email
                        </DialogDescription>
                    </DialogHeader>
                    {selectedEmail && (
                        <div className="space-y-4 py-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label className="text-muted-foreground text-xs uppercase">User</Label>
                                    <div className="flex items-center gap-2 mt-1">
                                        <User className="w-4 h-4 text-muted-foreground" />
                                        <p className="font-medium">{selectedEmail.user_name}</p>
                                    </div>
                                    <p className="text-xs text-muted-foreground ml-6">{selectedEmail.user_email}</p>
                                </div>
                                <div>
                                    <Label className="text-muted-foreground text-xs uppercase">Email Broadcast</Label>
                                    <div className="flex items-center gap-2 mt-1">
                                        <Mail className="w-4 h-4 text-muted-foreground" />
                                        <p className="font-mono text-sm">{selectedEmail.email}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label className="text-muted-foreground text-xs uppercase">Status</Label>
                                    <div className="mt-1">{getStatusBadge(selectedEmail.status)}</div>
                                </div>
                                <div>
                                    <Label className="text-muted-foreground text-xs uppercase">Tanggal Submit</Label>
                                    <p className="text-sm mt-1">{selectedEmail.created_at}</p>
                                </div>
                            </div>

                            <Separator />

                            <div className="grid grid-cols-2 gap-4">
                                {selectedEmail.approved_at && (
                                    <div>
                                        <Label className="text-muted-foreground text-xs uppercase">Tanggal Diproses</Label>
                                        <p className="text-sm mt-1">{selectedEmail.approved_at}</p>
                                    </div>
                                )}
                                {selectedEmail.approved_by && (
                                    <div>
                                        <Label className="text-muted-foreground text-xs uppercase">Diproses Oleh</Label>
                                        <p className="text-sm mt-1 font-medium">{selectedEmail.approved_by}</p>
                                    </div>
                                )}
                            </div>

                            {selectedEmail.verified_at && (
                                <div>
                                    <Label className="text-muted-foreground text-xs uppercase">Verified At</Label>
                                    <p className="text-sm mt-1 text-green-600 font-medium">✅ {selectedEmail.verified_at}</p>
                                </div>
                            )}

                            {selectedEmail.rejection_reason && (
                                <div className="space-y-2">
                                    <Label className="text-muted-foreground text-xs uppercase">Alasan Penolakan</Label>
                                    <div className="p-3 rounded-lg bg-red-50 border border-red-100 text-sm text-red-800">
                                        {selectedEmail.rejection_reason}
                                    </div>
                                </div>
                            )}

                            {selectedEmail.notes && (
                                <div className="space-y-2">
                                    <Label className="text-muted-foreground text-xs uppercase text-primary">Catatan Admin</Label>
                                    <div className="p-3 rounded-lg bg-blue-50 border border-blue-100 text-sm text-blue-800 flex gap-2">
                                        <Info className="w-4 h-4 shrink-0 mt-0.5" />
                                        <p>{selectedEmail.notes}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDetailDialogOpen(false)}>
                            Tutup
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AdminLayout>
    );
}
