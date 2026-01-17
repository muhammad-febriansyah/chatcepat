import { Head, Link } from '@inertiajs/react';
import UserLayout from '@/layouts/user/user-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, Clock, AlertCircle, ArrowRight, Download } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Transaction {
    id: number;
    invoice_number: string;
    amount: string;
    status: string;
    payment_method: string;
    payment_code: string;
    va_number: string;
    created_at: string;
    paid_at: string | null;
    pricing_package: {
        name: string;
        description: string;
        period_text: string;
    };
}

interface PaymentReturnProps {
    transaction: Transaction;
    status: 'success' | 'pending' | 'failed' | 'unknown';
    message: string;
}

export default function PaymentReturn({ transaction, status, message }: PaymentReturnProps) {
    const statusConfig = {
        success: {
            icon: CheckCircle,
            color: 'text-green-600',
            bgColor: 'bg-green-50',
            borderColor: 'border-green-200',
            title: 'Pembayaran Berhasil!',
        },
        pending: {
            icon: Clock,
            color: 'text-yellow-600',
            bgColor: 'bg-yellow-50',
            borderColor: 'border-yellow-200',
            title: 'Menunggu Pembayaran',
        },
        failed: {
            icon: XCircle,
            color: 'text-red-600',
            bgColor: 'bg-red-50',
            borderColor: 'border-red-200',
            title: 'Pembayaran Gagal',
        },
        unknown: {
            icon: AlertCircle,
            color: 'text-gray-600',
            bgColor: 'bg-gray-50',
            borderColor: 'border-gray-200',
            title: 'Status Tidak Diketahui',
        },
    };

    const config = statusConfig[status];
    const StatusIcon = config.icon;

    return (
        <UserLayout>
            <Head title={`Pembayaran - ${config.title}`} />

            <div className="max-w-3xl mx-auto space-y-6">
                {/* Status Card */}
                <Card className={cn("border-2", config.borderColor)}>
                    <CardHeader className={cn("text-center", config.bgColor)}>
                        <div className="flex justify-center mb-4">
                            <div className={cn("rounded-full p-4", config.bgColor)}>
                                <StatusIcon className={cn("size-16", config.color)} />
                            </div>
                        </div>
                        <CardTitle className="text-2xl">{config.title}</CardTitle>
                        <CardDescription className="text-base mt-2">
                            {message}
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="pt-6 space-y-6">
                        {/* Transaction Details */}
                        <div className="space-y-4">
                            <h3 className="font-semibold text-lg border-b pb-2">Detail Transaksi</h3>

                            <div className="grid gap-3">
                                <div className="flex justify-between items-start">
                                    <span className="text-sm text-muted-foreground">Invoice</span>
                                    <span className="font-medium text-right">{transaction.invoice_number}</span>
                                </div>

                                <div className="flex justify-between items-start">
                                    <span className="text-sm text-muted-foreground">Paket</span>
                                    <span className="font-medium text-right">{transaction.pricing_package?.name || '-'}</span>
                                </div>

                                <div className="flex justify-between items-start">
                                    <span className="text-sm text-muted-foreground">Masa Aktif</span>
                                    <span className="font-medium text-right">{transaction.pricing_package?.period_text || '-'}</span>
                                </div>

                                {transaction.payment_method && (
                                    <div className="flex justify-between items-start">
                                        <span className="text-sm text-muted-foreground">Metode Pembayaran</span>
                                        <span className="font-medium text-right">{transaction.payment_method}</span>
                                    </div>
                                )}

                                {transaction.va_number && (
                                    <div className="flex justify-between items-start">
                                        <span className="text-sm text-muted-foreground">Nomor VA</span>
                                        <span className="font-mono font-medium text-right">{transaction.va_number}</span>
                                    </div>
                                )}

                                {transaction.payment_code && (
                                    <div className="flex justify-between items-start">
                                        <span className="text-sm text-muted-foreground">Kode Pembayaran</span>
                                        <span className="font-mono font-medium text-right">{transaction.payment_code}</span>
                                    </div>
                                )}

                                <div className="flex justify-between items-start border-t pt-3">
                                    <span className="text-sm text-muted-foreground">Total Pembayaran</span>
                                    <span className="font-bold text-lg text-primary">
                                        Rp {Number(transaction.amount).toLocaleString('id-ID')}
                                    </span>
                                </div>

                                <div className="flex justify-between items-start">
                                    <span className="text-sm text-muted-foreground">Status</span>
                                    <span className={cn(
                                        "font-medium px-2 py-1 rounded text-xs uppercase",
                                        transaction.status === 'paid' && "bg-green-100 text-green-700",
                                        transaction.status === 'pending' && "bg-yellow-100 text-yellow-700",
                                        transaction.status === 'failed' && "bg-red-100 text-red-700"
                                    )}>
                                        {transaction.status}
                                    </span>
                                </div>

                                {transaction.paid_at && (
                                    <div className="flex justify-between items-start">
                                        <span className="text-sm text-muted-foreground">Waktu Pembayaran</span>
                                        <span className="font-medium text-right">
                                            {new Date(transaction.paid_at).toLocaleString('id-ID', {
                                                dateStyle: 'long',
                                                timeStyle: 'short'
                                            })}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Additional Info based on status */}
                        {status === 'pending' && (
                            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                                <h4 className="font-semibold text-yellow-900 mb-2">Instruksi Pembayaran</h4>
                                <ul className="space-y-1 text-sm text-yellow-800">
                                    <li>• Segera lakukan pembayaran sebelum masa berlaku habis</li>
                                    <li>• Gunakan nomor VA atau kode pembayaran yang tertera</li>
                                    <li>• Status akan otomatis terupdate setelah pembayaran berhasil</li>
                                </ul>
                            </div>
                        )}

                        {status === 'success' && (
                            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                <h4 className="font-semibold text-green-900 mb-2">Terima Kasih!</h4>
                                <p className="text-sm text-green-800">
                                    Paket Anda sudah aktif dan siap digunakan. Invoice telah dikirim ke email Anda.
                                </p>
                            </div>
                        )}

                        {status === 'failed' && (
                            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                <h4 className="font-semibold text-red-900 mb-2">Pembayaran Gagal</h4>
                                <p className="text-sm text-red-800 mb-2">
                                    Transaksi Anda gagal diproses. Silakan coba lagi atau hubungi support kami.
                                </p>
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex flex-col sm:flex-row gap-3 pt-4">
                            {status === 'success' && (
                                <>
                                    <Button asChild variant="default" className="flex-1">
                                        <Link href="/user/dashboard">
                                            Ke Dashboard
                                            <ArrowRight className="ml-2 size-4" />
                                        </Link>
                                    </Button>
                                    <Button asChild variant="outline" className="flex-1">
                                        <Link href={`/user/transactions/${transaction.id}`}>
                                            <Download className="mr-2 size-4" />
                                            Lihat Detail
                                        </Link>
                                    </Button>
                                </>
                            )}

                            {status === 'pending' && (
                                <>
                                    <Button
                                        asChild
                                        variant="outline"
                                        className="flex-1"
                                        onClick={() => window.location.reload()}
                                    >
                                        <a href={window.location.href}>
                                            Refresh Status
                                        </a>
                                    </Button>
                                    <Button asChild variant="default" className="flex-1">
                                        <Link href="/user/transactions">
                                            Lihat Riwayat
                                            <ArrowRight className="ml-2 size-4" />
                                        </Link>
                                    </Button>
                                </>
                            )}

                            {status === 'failed' && (
                                <>
                                    <Button asChild variant="outline" className="flex-1">
                                        <Link href="/user/topup">
                                            Coba Lagi
                                        </Link>
                                    </Button>
                                    <Button asChild variant="default" className="flex-1">
                                        <Link href="/contact">
                                            Hubungi Support
                                            <ArrowRight className="ml-2 size-4" />
                                        </Link>
                                    </Button>
                                </>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Help Section */}
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-center space-y-2">
                            <p className="text-sm text-muted-foreground">
                                Butuh bantuan? Hubungi customer support kami
                            </p>
                            <div className="flex justify-center gap-2">
                                <Button asChild variant="outline" size="sm">
                                    <Link href="/contact">Hubungi Support</Link>
                                </Button>
                                <Button asChild variant="ghost" size="sm">
                                    <Link href="/faq">Lihat FAQ</Link>
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </UserLayout>
    );
}
