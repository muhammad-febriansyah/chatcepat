<?php

namespace App\Exports;

use App\Models\GoogleMapPlace;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithStyles;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;
use Illuminate\Support\Collection;

class GoogleMapPlacesExport implements FromCollection, WithHeadings, WithMapping, WithStyles, ShouldAutoSize
{
    protected $places;

    public function __construct($places)
    {
        $this->places = $places;
    }

    public function collection()
    {
        return $this->places;
    }

    public function headings(): array
    {
        return [
            'Name',
            'Kecamatan',
            'Location',
            'Category',
            'Rating',
            'Review Count',
            'Address',
            'Phone',
            'Website',
            'URL',
            'Scraped At',
        ];
    }

    public function map($place): array
    {
        return [
            $place->name,
            $place->kecamatan,
            $place->location,
            $place->category,
            $place->rating,
            $place->review_count,
            $place->address,
            $place->phone,
            $place->website,
            $place->url,
            $place->scraped_at ? $place->scraped_at->format('Y-m-d H:i:s') : $place->created_at->format('Y-m-d H:i:s'),
        ];
    }

    public function styles(Worksheet $sheet)
    {
        return [
            1 => [
                'font' => ['bold' => true],
                'fill' => [
                    'fillType' => \PhpOffice\PhpSpreadsheet\Style\Fill::FILL_SOLID,
                    'startColor' => ['rgb' => '2563eb']
                ],
                'font' => [
                    'bold' => true,
                    'color' => ['rgb' => 'FFFFFF']
                ]
            ],
        ];
    }
}
