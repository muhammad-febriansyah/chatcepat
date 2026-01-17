import { Head, router } from '@inertiajs/react';
import UserLayout from '@/layouts/user/user-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Receipt,
    ArrowLeft,
    CreditCard,
    CheckCircle2,
    Clock,
    XCircle,
    Copy,
    ExternalLink,
    Calendar,
    Building2,
    Package,
    FileText,
    Image,
} from 'lucide-react';
import { useState } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface TransactionDetail {
    id: number;
    invoice_number: string;
    merchant_order_id: string;
    package_name: string;
    bank_name: string;
    bank_code: string;
    amount: number;
    formatted_amount: string;
    status: string;
    status_label: string;
    status_color: string;
    payment_method: string;
    payment_code: string | null;
    va_number: string | null;
    payment_url: string | null;
    proof_image: string | null;
    notes: string | null;
    created_at: string;
    paid_at: string | null;
    expired_at: string | null;
}

interface TransactionShowProps {
    transaction: TransactionDetail;
}

export default function TransactionShow({ transaction }: TransactionShowProps) {
    const [copied, setCopied] = useState<string | null>(null);

    const copyToClipboard = (text: string, field: string) => {
        navigator.clipboard.writeText(text);
        setCopied(field);
        setTimeout(() => setCopied(null), 2000);
    };

    const getStatusBadge = (status: string, label: string) => {
        const variants: Record<string, string> = {
            pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
            paid: 'bg-green-100 text-green-800 border-green-200',
            failed: 'bg-red-100 text-red-800 border-red-200',
            expired: 'bg-gray-100 text-gray-800 border-gray-200',
            cancelled: 'bg-gray-100 text-gray-800 border-gray-200',
        };

        const icons: Record<string, React.ReactNode> = {
            pending: <Clock className="size-4 mr-1" />,
            paid: <CheckCircle2 className="size-4 mr-1" />,
            failed: <XCircle className="size-4 mr-1" />,
            expired: <XCircle className="size-4 mr-1" />,
            cancelled: <XCircle className="size-4 mr-1" />,
        };

        return (
            <Badge variant="outline" className={`${variants[status] || variants.cancelled} flex items-center text-base px-3 py-1`}>
                {icons[status]}
                {label}
            </Badge>
        );
    };

    return (
        <UserLayout>
            <Head title={`Transaksi ${transaction.invoice_number}`} />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.visit('/user/transactions')}
                    >
                        <ArrowLeft className="size-4 mr-2" />
                        Kembali
                    </Button>
                </div>

                <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-blue-500/10 via-blue-500/5 to-transparent p-6 border">
                    <div className="absolute inset-0 bg-grid-white/10 [mask-image:radial-gradient(white,transparent_85%)]" />
                    <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight text-foreground">
                                Detail Transaksi
                            </h1>
                            <p className="text-muted-foreground mt-1">
                                {transaction.invoice_number}
                            </p>
                        </div>
                        {getStatusBadge(transaction.status, transaction.status_label)}
                    </div>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                    {/* Transaction Info */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Receipt className="size-5 text-primary" />
                                Informasi Transaksi
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex justify-between items-center py-2 border-b">
                                <span className="text-muted-foreground">Invoice</span>
                                <div className="flex items-center gap-2">
                                    <span className="font-medium">{transaction.invoice_number}</span>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-6 w-6 p-0"
                                        onClick={() => copyToClipboard(transaction.invoice_number, 'invoice')}
                                    >
                                        <Copy className="size-3" />
                                    </Button>
                                    {copied === 'invoice' && (
                                        <span className="text-xs text-green-600">Copied!</span>
                                    )}
                                </div>
                            </div>

                            <div className="flex justify-between items-center py-2 border-b">
                                <span className="text-muted-foreground">Order ID</span>
                                <span className="font-medium text-sm">{transaction.merchant_order_id}</span>
                            </div>

                            <div className="flex justify-between items-center py-2 border-b">
                                <span className="text-muted-foreground flex items-center gap-2">
                                    <Package className="size-4" />
                                    Paket
                                </span>
                                <span className="font-medium">{transaction.package_name}</span>
                            </div>

                            <div className="flex justify-between items-center py-2 border-b">
                                <span className="text-muted-foreground flex items-center gap-2">
                                    <Calendar className="size-4" />
                                    Tanggal Transaksi
                                </span>
                                <span className="font-medium">{transaction.created_at}</span>
                            </div>

                            {transaction.paid_at && (
                                <div className="flex justify-between items-center py-2 border-b">
                                    <span className="text-muted-foreground flex items-center gap-2">
                                        <CheckCircle2 className="size-4 text-green-500" />
                                        Tanggal Bayar
                                    </span>
                                    <span className="font-medium text-green-600">{transaction.paid_at}</span>
                                </div>
                            )}

                            {transaction.expired_at && transaction.status === 'pending' && (
                                <div className="flex justify-between items-center py-2 border-b">
                                    <span className="text-muted-foreground flex items-center gap-2">
                                        <Clock className="size-4 text-yellow-500" />
                                        Batas Pembayaran
                                    </span>
                                    <span className="font-medium text-yellow-600">{transaction.expired_at}</span>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Payment Info */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <CreditCard className="size-5 text-primary" />
                                Informasi Pembayaran
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex justify-between items-center py-2 border-b">
                                <span className="text-muted-foreground flex items-center gap-2">
                                    <Building2 className="size-4" />
                                    Metode Pembayaran
                                </span>
                                <span className="font-medium">{transaction.bank_name}</span>
                            </div>

                            {transaction.va_number && (
                                <div className="flex justify-between items-center py-2 border-b">
                                    <span className="text-muted-foreground">Nomor VA</span>
                                    <div className="flex items-center gap-2">
                                        <span className="font-mono font-bold text-lg">{transaction.va_number}</span>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-6 w-6 p-0"
                                            onClick={() => copyToClipboard(transaction.va_number!, 'va')}
                                        >
                                            <Copy className="size-3" />
                                        </Button>
                                        {copied === 'va' && (
                                            <span className="text-xs text-green-600">Copied!</span>
                                        )}
                                    </div>
                                </div>
                            )}

                            {transaction.payment_code && (
                                <div className="flex justify-between items-center py-2 border-b">
                                    <span className="text-muted-foreground">Kode Pembayaran</span>
                                    <div className="flex items-center gap-2">
                                        <span className="font-mono font-bold">{transaction.payment_code}</span>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-6 w-6 p-0"
                                            onClick={() => copyToClipboard(transaction.payment_code!, 'code')}
                                        >
                                            <Copy className="size-3" />
                                        </Button>
                                        {copied === 'code' && (
                                            <span className="text-xs text-green-600">Copied!</span>
                                        )}
                                    </div>
                                </div>
                            )}

                            <div className="flex justify-between items-center py-3 bg-primary/5 rounded-lg px-3 mt-4">
                                <span className="font-medium">Total Pembayaran</span>
                                <span className="font-bold text-xl text-primary">{transaction.formatted_amount}</span>
                            </div>

                            {transaction.payment_url && transaction.status === 'pending' && (
                                <Button
                                    className="w-full mt-4"
                                    onClick={() => window.open(transaction.payment_url!, '_blank')}
                                >
                                    <ExternalLink className="size-4 mr-2" />
                                    Lanjutkan Pembayaran
                                </Button>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Notes & Proof */}
                {(transaction.notes || transaction.proof_image) && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <FileText className="size-5 text-primary" />
                                Informasi Tambahan
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {transaction.notes && (
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">Catatan</label>
                                    <p className="mt-1">{transaction.notes}</p>
                                </div>
                            )}

                            {transaction.proof_image && (
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                        <Image className="size-4" />
                                        Bukti Pembayaran
                                    </label>
                                    <div className="mt-2 border rounded-lg p-2">
                                        <img
                                            src={transaction.proof_image}
                                            alt="Bukti Pembayaran"
                                            className="max-w-full h-auto rounded"
                                        />
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                )}

                {/* Pending Payment Alert */}
                {transaction.status === 'pending' && (
                    <Alert className="bg-yellow-50 border-yellow-200">
                        <Clock className="size-4 text-yellow-600" />
                        <AlertDescription className="text-yellow-800">
                            Transaksi ini menunggu pembayaran. Silakan selesaikan pembayaran sebelum batas waktu yang ditentukan.
                        </AlertDescription>
                    </Alert>
                )}

                {/* Success Alert */}
                {transaction.status === 'paid' && (
                    <Alert className="bg-green-50 border-green-200">
                        <CheckCircle2 className="size-4 text-green-600" />
                        <AlertDescription className="text-green-800">
                            Pembayaran berhasil! Paket Anda sudah aktif.
                        </AlertDescription>
                    </Alert>
                )}
            </div>
        </UserLayout>
    );
}
