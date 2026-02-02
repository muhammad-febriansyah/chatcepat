<!DOCTYPE html>
<html lang="id">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Hasil Scraping Google Maps</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Arial', sans-serif;
            font-size: 10px;
            color: #333;
            line-height: 1.4;
        }

        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 20px;
            margin-bottom: 20px;
            text-align: center;
        }

        .header h1 {
            font-size: 24px;
            margin-bottom: 5px;
        }

        .header p {
            font-size: 12px;
            opacity: 0.9;
        }

        .meta-info {
            background: #f7fafc;
            padding: 15px;
            margin-bottom: 20px;
            border-left: 4px solid #667eea;
        }

        .meta-info p {
            margin-bottom: 5px;
            font-size: 11px;
        }

        .meta-info strong {
            color: #667eea;
        }

        table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
        }

        thead {
            background: #667eea;
            color: white;
        }

        th {
            padding: 10px 8px;
            text-align: left;
            font-size: 10px;
            font-weight: 600;
        }

        td {
            padding: 8px;
            border-bottom: 1px solid #e2e8f0;
            font-size: 9px;
        }

        tbody tr:nth-child(even) {
            background: #f7fafc;
        }

        tbody tr:hover {
            background: #edf2f7;
        }

        .badge {
            display: inline-block;
            padding: 3px 8px;
            border-radius: 12px;
            font-size: 8px;
            font-weight: 600;
        }

        .badge-rating {
            background: #fef3c7;
            color: #92400e;
        }

        .badge-reviews {
            background: #dbeafe;
            color: #1e40af;
        }

        .footer {
            margin-top: 30px;
            padding-top: 15px;
            border-top: 2px solid #e2e8f0;
            text-align: center;
            font-size: 9px;
            color: #718096;
        }

        .footer p {
            margin-bottom: 3px;
        }

        .no-data {
            text-align: center;
            padding: 40px;
            color: #718096;
        }

        /* Page break control */
        .page-break {
            page-break-after: always;
        }

        @page {
            margin: 20px;
        }
    </style>
</head>

<body>
    <div class="header">
        <h1>📍 Hasil Scraping Google Maps</h1>
        <p>Data Lokasi Bisnis & Tempat</p>
    </div>

    <div class="meta-info">
        <p><strong>Tanggal Export:</strong> {{ $date }}</p>
        <p><strong>Total Lokasi:</strong> {{ $places->count() }} tempat</p>
        <p><strong>Platform:</strong> ChatCepat - Google Maps Scraper</p>
    </div>

    @if($places->count() > 0)
        <table>
            <thead>
                <tr>
                    <th style="width: 5%;">No</th>
                    <th style="width: 20%;">Nama Tempat</th>
                    <th style="width: 15%;">Kategori</th>
                    <th style="width: 25%;">Alamat</th>
                    <th style="width: 10%;">Kecamatan</th>
                    <th style="width: 12%;">No. Telepon</th>
                    <th style="width: 8%;">Rating</th>
                    <th style="width: 5%;">Reviews</th>
                </tr>
            </thead>
            <tbody>
                @foreach($places as $index => $place)
                    <tr>
                        <td>{{ $index + 1 }}</td>
                        <td><strong>{{ $place->name ?? '-' }}</strong></td>
                        <td>{{ $place->category ?? '-' }}</td>
                        <td>{{ $place->address ?? '-' }}</td>
                        <td>{{ $place->kecamatan ?? '-' }}</td>
                        <td>{{ $place->phone ?? '-' }}</td>
                        <td>
                            @if($place->rating)
                                <span class="badge badge-rating">⭐ {{ number_format($place->rating, 1) }}</span>
                            @else
                                -
                            @endif
                        </td>
                        <td>
                            @if($place->reviews_count)
                                <span class="badge badge-reviews">{{ number_format($place->reviews_count) }}</span>
                            @else
                                -
                            @endif
                        </td>
                    </tr>

                    {{-- Page break every 25 rows for better PDF pagination --}}
                    @if(($index + 1) % 25 == 0 && !$loop->last)
                            </tbody>
                        </table>
                        <div class="page-break"></div>
                        <table>
                            <thead>
                                <tr>
                                    <th style="width: 5%;">No</th>
                                    <th style="width: 20%;">Nama Tempat</th>
                                    <th style="width: 15%;">Kategori</th>
                                    <th style="width: 25%;">Alamat</th>
                                    <th style="width: 10%;">Kecamatan</th>
                                    <th style="width: 12%;">No. Telepon</th>
                                    <th style="width: 8%;">Rating</th>
                                    <th style="width: 5%;">Reviews</th>
                                </tr>
                            </thead>
                            <tbody>
                    @endif
                @endforeach
            </tbody>
        </table>
    @else
        <div class="no-data">
            <p>📭 Tidak ada data untuk ditampilkan</p>
        </div>
    @endif

    <div class="footer">
        <p><strong>ChatCepat</strong> - Omnichannel + CRM Platform</p>
        <p>© {{ date('Y') }} ChatCepat. All rights reserved.</p>
        <p>Generated on {{ now()->format('d M Y H:i:s') }}</p>
    </div>
</body>

</html>