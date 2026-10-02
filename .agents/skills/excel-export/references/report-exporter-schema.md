# ReportExporter Schema, Theme & Layout Reference

`ReportExporter` (`app/Services/Report/ReportExporter.php`) adalah lapisan fasad yang menyusun tata letak (*layout*), header metadata, tema warna, dan baris akumulasi laporan Excel secara seragam di seluruh aplikasi.

---

## 1. Anatomi Blok Laporan Excel

```
┌─────────────────────────────────────────────────────────────┐
│ [BARIS 1] JUDUL LAPORAN UTAMA (Bold, Font 14, Dark Primary) │
│ [BARIS 2] Periode: 01-10-2026 s.d 31-10-2026               │
│ [BARIS 3] Dicetak: 02-10-2026 08:00:00 WIB                  │
├─────────────────────────────────────────────────────────────┤
│ [BARIS 5] METADATA FILTER                                   │
│           • Filter Waktu: Tanggal Pembayaran                │
│           • Jenis Layanan: POOL TO POOL                     │
├─────────────────────────────────────────────────────────────┤
│ [BARIS 7] HEADER TABEL (Themed Background, Centered, Bold) │
│           NO │ RUTE │ RESI │ ... │ TOTAL BAYAR │ TOTAL      │
├─────────────────────────────────────────────────────────────┤
│ [DATA]    1  │ BGR  │ PCNX │ ... │ 165.000     │ 162.225    │
│           2  │ BDG  │ PCNX │ ... │ 250.000     │ 245.000    │
├─────────────────────────────────────────────────────────────┤
│ [TOTAL]   TOTAL AKUMULASI  │ ... │ 415.000     │ 407.225    │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. Palet Tema Warna OpenXML (Theme Tokens)

| Nama Tema | Penggunaan Utama | Hex Background (Soft) | Hex Border / Text Accent |
| :--- | :--- | :--- | :--- |
| `'default'` | Header standar identitas & teks | `#F3F4F6` (Gray-100) | `#374151` (Gray-700) |
| `'blue'` | Finansial pemasukan, total bayar | `#DBEAFE` (Blue-100) | `#1D4ED8` (Blue-700) |
| `'red'` | Potongan, adm PG, pajak, biaya | `#FEE2E2` (Red-100) | `#B91C1C` (Red-700) |
| `'green'` | Grand total, hasil bersih akhir | `#DCFCE7` (Green-100) | `#15803D` (Green-700) |
| `'yellow'` | Informasi paket, kargo, warning | `#FEF3C7` (Amber-100) | `#B45309` (Amber-700) |

---

## 3. Spesifikasi Lengkap Pengaturan Kolom
```php
$columns = [
    'field_key' => [
        'label' => 'LABEL HEADER',  // Teks header
        'width' => 20,              // Lebar kolom numerik
        'align' => 'center',         // 'left' | 'center' | 'right'
        'type'  => 'currency',       // 'currency' | 'decimal' | 'number' | 'phone' | 'date'
        'sum'   => true,             // true jika kolom ini dihitung akumulasinya
        'theme' => 'blue',           // 'blue' | 'red' | 'green' | 'yellow' | 'default'
        'bold'  => true,             // true untuk cetak tebal
    ],
];
```

---

## 4. Method Chaining pada ReportExporter
* `ReportExporter::make(string $title, string $sheetName = 'Sheet1')`
* `->period(string $periodString)`
* `->clientTime(?string $formattedClientTime)`
* `->metadata(array $keyValuePairs)`
* `->columns(array $columnsDefinition)`
* `->data(Collection|array $data, Closure $rowMapper)`
* `->download(string $filename): BinaryFileResponse`
* `->store(string $path): string`
