---
description: High-Performance Excel Export Standards (ReportExporter & FastXlsxWriter)
globs: app/Services/**, app/Http/Controllers/**
---

# 50. High-Performance Excel Export Standards

Dokumen ini mengatur arsitektur pembuatan laporan Excel (.xlsx) berkinerja tinggi pada sistem `adminShuttleV3`.

---

## 1. Prinsip Utama (Zero-Memory Exhaustion)
1. **DILARANG** menggunakan ekspor Excel berbasis client-side browser (`excelHtml5` DataTables) untuk data operasional, karena membebani memori browser dan sering menyebabkan freeze pada ribuan baris data.
2. Seluruh ekspor Excel diproses di sisi backend menggunakan pustaka native **`ReportExporter`** yang didukung oleh **`FastXlsxWriter`** (arsitektur streaming OpenXML tanpa dependensi pustaka berat PhpSpreadsheet).
3. Controller mengembalikan objek `Symfony\Component\HttpFoundation\BinaryFileResponse` via `$exporter->download($filename)`.

---

## 2. Pola Implementasi Standar di Service
```php
namespace App\Services\Settlement;

use App\Services\Report\ReportExporter;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class SettlementPackageService
{
    public function exportExcel(array $filters, ?string $clientTime = null): BinaryFileResponse
    {
        $dataResult = $this->getSettlementData($filters);
        $reportData = $dataResult['reportData'];
        $daterange  = $filters['daterange'] ?? date('d-m-Y');

        $exporter = ReportExporter::make('Laporan Settlement Paket', 'Settlement Paket')
            ->period($daterange)
            ->clientTime($clientTime);

        $columns = [
            'no'            => ['label' => 'NO', 'width' => 6, 'align' => 'center'],
            'route'         => ['label' => 'RUTE', 'width' => 26, 'align' => 'left'],
            'booking_code'  => ['label' => 'NOMOR RESI', 'width' => 20, 'align' => 'center', 'bold' => true],
            'total_payment' => ['label' => 'TOTAL BAYAR', 'width' => 18, 'type' => 'currency', 'sum' => true, 'theme' => 'blue', 'bold' => true],
            'admin_pg'      => ['label' => 'ADM PG', 'width' => 15, 'type' => 'currency', 'sum' => true, 'theme' => 'red'],
            'grand_total'   => ['label' => 'TOTAL', 'width' => 20, 'type' => 'currency', 'sum' => true, 'theme' => 'green', 'bold' => true],
        ];

        $exporter->columns($columns)
            ->data($reportData, function ($row) {
                return [
                    'no'            => $row->no,
                    'route'         => $row->route,
                    'booking_code'  => $row->booking_code,
                    'total_payment' => $row->total_payment,
                    'admin_pg'      => $row->admin_pg,
                    'grand_total'   => $row->grand_total,
                ];
            });

        $filename = 'Laporan_Settlement_Paket_' . str_replace([' ', '.'], '_', $daterange) . '.xlsx';
        return $exporter->download($filename);
    }
}
```

---

## 3. Rujukan Dokumentasi Lengkap
Untuk referensi mendalam terkait sintaks kolom, metadata header, palet tema warna cell (`blue`, `red`, `green`, `yellow`), dan format OpenXML, baca:
* **Skill**: `.agents/skills/excel-export/SKILL.md`
* **API Reference**: `.agents/skills/excel-export/references/fastxlsxwriter-api.md`
* **Schema Reference**: `.agents/skills/excel-export/references/report-exporter-schema.md`

---

## 4. Standarisasi Tampilan Tombol Ekspor di Blade (Settlement & Report Pill Button Standard)
Setiap tombol yang memicu endpoint `exportExcel()` wajib menggunakan styling kapsul hijau yang selaras dengan modul Settlement:

```blade
<div class="dt-buttons">
    <a href="{{ route('[route-export-excel]', $params ?? []) }}" class="btn btn-success btn-sm buttons-excel buttons-html5" id="btn-export-excel" title="Download Excel" style="border-radius: 50rem;">
        <span class="fa fa-file-excel me-1"></span> Download Excel
    </a>
</div>
```

* **Pembungkus wajib**: `<div class="dt-buttons">` (mengaktifkan CSS settlement `#03D87F !important`, padding `.25rem .5rem !important`, dan font-size `0.71rem !important`).
* **Kelas tombol wajib**: `btn btn-success btn-sm buttons-excel buttons-html5` dengan `style="border-radius: 50rem;"`.
* **Icon wajib**: `<span class="fa fa-file-excel me-1"></span>` (Font Awesome solid sheet icon).
* **Teks label**: `Download Excel`.
