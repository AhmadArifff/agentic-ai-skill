---
name: excel-export
description: >-
  Panduan dan spesifikasi ekspor laporan spreadsheet Excel (.xlsx) berkinerja tinggi
  menggunakan ReportExporter dan FastXlsxWriter pada sistem adminShuttleV3.
  Gunakan skill ini ketika diminta membuat, mengubah, atau mendiagnosis fitur ekspor Excel.
---

# Skill: Excel Export via ReportExporter & FastXlsxWriter

Modul ekspor Excel pada `adminShuttleV3` menggunakan mesin streaming native **`FastXlsxWriter`** yang dibungkus oleh antarmuka fasad **`ReportExporter`**. Solusi ini dirancang untuk menangani puluhan ribu baris data tanpa lonjakan memori (*OOM Prevention*).

---

## 1. Alur Penggunaan Standar di Service
```php
use App\Services\Report\ReportExporter;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class MyService
{
    public function exportExcel(array $filters, ?string $clientTime = null): BinaryFileResponse
    {
        $data = $this->getData($filters);
        $period = $filters['daterange'] ?? date('d-m-Y');

        return ReportExporter::make('Judul Laporan Utama', 'NamaSheet')
            ->period($period)
            ->clientTime($clientTime)
            ->metadata([
                'Filter Waktu' => $filters['date_type'] ?? 'Semua',
                'Status'       => 'PAID',
            ])
            ->columns($this->getColumnDefinition())
            ->data($data, function ($row, $index) {
                return [
                    'no'       => $index + 1,
                    'code'     => $row->booking_code,
                    'total'    => (float) $row->total_payment,
                ];
            })
            ->download('Laporan_' . date('Ymd_His') . '.xlsx');
    }
}
```

---

## 2. Definisi Tipe Kolom & Formatting
Setiap kolom dalam array `columns()` mendukung properti konfigurasi berikut:

| Properti | Tipe | Pilihan Nilai | Keterangan |
| :--- | :--- | :--- | :--- |
| `label` | string | Judul header | Teks label pada baris header Excel |
| `width` | integer | misal: `6`, `18`, `24` | Lebar kolom karakter OpenXML |
| `align` | string | `'left'`, `'center'`, `'right'` | Perataan teks cell |
| `type` | string | `'currency'`, `'number'`, `'decimal'`, `'phone'`, `'date'` | Format angka & tipe data |
| `sum` | boolean | `true` / `false` | Menghasilkan total otomatis di baris bawah |
| `theme` | string | `'blue'`, `'red'`, `'green'`, `'yellow'` | Warna aksen header & total |
| `bold` | boolean | `true` / `false` | Menebalkan teks isi kolom |

---

## 3. Dokumentasi Referensi Tambahan
Untuk rujukan mendalam mengenai arsitektur internal dan referensi API lengkap:
* [FastXlsxWriter API Reference](./references/fastxlsxwriter-api.md)
* [ReportExporter Schema & Theme Reference](./references/report-exporter-schema.md)
