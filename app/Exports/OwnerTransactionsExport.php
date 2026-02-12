<?php

namespace App\Exports;

use App\Models\Transaction;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithStyles;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithTitle;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class OwnerTransactionsExport implements FromCollection, WithHeadings, WithMapping, WithStyles, ShouldAutoSize, WithTitle
{
    protected $transactions;

    public function __construct($transactions)
    {
        $this->transactions = $transactions;
    }

    public function collection()
    {
        return $this->transactions;
    }

    public function title(): string
    {
        return 'Laporan Transaksi';
    }

    public function headings(): array
    {
        return [
            'Invoice',
            'Pengguna',
            'Email',
            'Paket',
            'Jumlah (Rp)',
            'Metode',
            'Status',
            'Tanggal Dibuat',
            'Tanggal Dibayar',
        ];
    }

    public function map($transaction): array
    {
        $statusMap = [
            'pending' => 'Pending',
            'paid'    => 'Lunas',
            'failed'  => 'Gagal',
            'expired' => 'Kadaluarsa',
        ];

        return [
            $transaction->invoice_number,
            $transaction->user?->name ?? '-',
            $transaction->user?->email ?? '-',
            $transaction->pricingPackage?->name ?? '-',
            number_format($transaction->amount, 0, ',', '.'),
            $transaction->payment_method ?? '-',
            $statusMap[$transaction->status] ?? $transaction->status,
            $transaction->created_at?->format('d/m/Y H:i'),
            $transaction->paid_at?->format('d/m/Y H:i') ?? '-',
        ];
    }

    public function styles(Worksheet $sheet)
    {
        return [
            1 => [
                'font' => ['bold' => true, 'color' => ['rgb' => 'FFFFFF']],
                'fill' => [
                    'fillType' => \PhpOffice\PhpSpreadsheet\Style\Fill::FILL_SOLID,
                    'startColor' => ['rgb' => '2563eb'],
                ],
            ],
        ];
    }
}
