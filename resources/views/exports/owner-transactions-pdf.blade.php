<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <title>Laporan Transaksi</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: Arial, sans-serif; font-size: 11px; color: #1e293b; }
        .header { background: #2563eb; color: white; padding: 20px 24px; margin-bottom: 20px; }
        .header h1 { font-size: 20px; font-weight: 700; }
        .header p { font-size: 11px; opacity: 0.85; margin-top: 4px; }
        .meta { display: flex; gap: 24px; padding: 0 24px 16px; }
        .meta-item { font-size: 11px; color: #64748b; }
        .meta-item strong { display: block; font-size: 13px; color: #1e293b; }
        .stats { display: flex; gap: 12px; padding: 0 24px 20px; }
        .stat-card { flex: 1; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px; text-align: center; }
        .stat-card .num { font-size: 20px; font-weight: 700; color: #2563eb; }
        .stat-card .lbl { font-size: 10px; color: #64748b; margin-top: 2px; }
        table { width: 100%; border-collapse: collapse; margin: 0 24px; width: calc(100% - 48px); }
        thead tr { background: #1e40af; color: white; }
        thead th { padding: 8px 10px; text-align: left; font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; }
        tbody tr:nth-child(even) { background: #f8fafc; }
        tbody tr:hover { background: #eff6ff; }
        tbody td { padding: 8px 10px; border-bottom: 1px solid #e2e8f0; font-size: 10px; }
        .badge { display: inline-block; padding: 2px 8px; border-radius: 9999px; font-size: 9px; font-weight: 600; }
        .badge-paid    { background: #dcfce7; color: #166534; }
        .badge-pending { background: #fef9c3; color: #854d0e; }
        .badge-failed  { background: #fee2e2; color: #991b1b; }
        .badge-expired { background: #f1f5f9; color: #475569; }
        .amount { font-weight: 700; color: #2563eb; }
        .mono { font-family: monospace; font-size: 9px; }
        .footer { text-align: center; margin-top: 24px; padding: 12px 24px; border-top: 1px solid #e2e8f0; font-size: 9px; color: #94a3b8; }
    </style>
</head>
<body>
    <div class="header">
        <h1>Laporan Transaksi</h1>
        <p>{{ $siteName ?? 'ChatCepat' }} &mdash; Diekspor pada {{ now()->format('d F Y, H:i') }} WIB</p>
    </div>

    <div class="meta">
        <div class="meta-item">
            <span>Periode</span>
            <strong>{{ $period }}</strong>
        </div>
        <div class="meta-item">
            <span>Total Data</span>
            <strong>{{ $transactions->count() }} transaksi</strong>
        </div>
        @if($filters['status'] && $filters['status'] !== 'all')
        <div class="meta-item">
            <span>Filter Status</span>
            <strong>{{ ucfirst($filters['status']) }}</strong>
        </div>
        @endif
    </div>


    <table>
        <thead>
            <tr>
                <th>#</th>
                <th>Invoice</th>
                <th>Pengguna</th>
                <th>Paket</th>
                <th>Jumlah</th>
                <th>Metode</th>
                <th>Status</th>
                <th>Tanggal</th>
            </tr>
        </thead>
        <tbody>
            @forelse($transactions as $i => $tx)
            <tr>
                <td>{{ $i + 1 }}</td>
                <td class="mono">{{ $tx->invoice_number }}</td>
                <td>
                    <strong>{{ $tx->user?->name ?? '-' }}</strong><br>
                    <span style="color:#64748b">{{ $tx->user?->email ?? '' }}</span>
                </td>
                <td>{{ $tx->pricingPackage?->name ?? '-' }}</td>
                <td class="amount">Rp {{ number_format($tx->amount, 0, ',', '.') }}</td>
                <td style="text-transform:capitalize">{{ str_replace('_', ' ', $tx->payment_method ?? '-') }}</td>
                <td>
                    @php $s = $tx->status; @endphp
                    <span class="badge badge-{{ $s }}">
                        {{ $s === 'paid' ? 'Lunas' : ($s === 'pending' ? 'Pending' : ($s === 'failed' ? 'Gagal' : 'Kadaluarsa')) }}
                    </span>
                </td>
                <td>{{ $tx->created_at?->format('d/m/Y') }}</td>
            </tr>
            @empty
            <tr>
                <td colspan="8" style="text-align:center;padding:20px;color:#94a3b8">Tidak ada data</td>
            </tr>
            @endforelse
        </tbody>
    </table>

    <div class="footer">
        Laporan ini dibuat otomatis oleh sistem &mdash; {{ $siteName ?? 'ChatCepat' }} &copy; {{ date('Y') }}
    </div>
</body>
</html>
