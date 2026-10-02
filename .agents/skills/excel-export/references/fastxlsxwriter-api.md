# FastXlsxWriter API & Internal Architecture

`FastXlsxWriter` (`app/Services/Report/FastXlsxWriter.php`) adalah pustaka generator spreadsheet native berbasis format OpenXML (.xlsx) yang dioptimasi khusus untuk efisiensi memori tingkat tinggi.

---

## 1. Masalah PhpSpreadsheet & Solusi FastXlsxWriter
* **PhpSpreadsheet**: Menyimpan setiap cell, font, dan border sebagai objek PHP di memori RAM. Pada 5.000 baris x 20 kolom (100.000 cells), konsumsi RAM dapat menembus 256MB–512MB dan menyebabkan `Fatal error: Allowed memory size exhausted`.
* **FastXlsxWriter**: Mengalirkan data (*streaming*) baris per baris langsung ke berkas XML sementara (`php://temp` atau file temporer) yang kemudian dikompresi ke dalam kontainer `.zip` OpenXML melalui `ZipArchive`. Penggunaan RAM konstan di bawah 5MB meskipun mengekspor ratusan ribu baris.

---

## 2. Struktur Internal Arsip OpenXML
FastXlsxWriter menyusun struktur file Excel standar ECMA-376:
```text
[Content_Types].xml       # Deklarasi MIME types untuk parts OpenXML
_rels/
  .rels                   # Hubungan paket tingkat atas
xl/
  _rels/
    workbook.xml.rels     # Hubungan workbook ke worksheet & styles
  styles.xml              # Tabel format, font, fill warna, dan number format
  workbook.xml            # Metadata sheet & definisi nama sheet
  worksheets/
    sheet1.xml            # Data tabular baris & sel terkompresi
```

---

## 3. Penanganan Karakter & XML Escaping
Setiap nilai string yang ditulis ke dalam cell disanitasi dari karakter khusus XML agar file tidak korup saat dibuka di Microsoft Excel:
```php
htmlspecialchars($value, ENT_XML1 | ENT_QUOTES, 'UTF-8');
```
Karakter kontrol ASCII di bawah 32 (kecuali newline, tab, carriage return) disaring secara otomatis.

---

## 4. Format Angka (Number Formats)
FastXlsxWriter menyediakan mapping ID bawaan:
* `currency`: `#,##0` (Angka ribuan integer tanpa desimal dan tanpa simbol mata uang).
* `decimal`: `#,##0.00` atau `#,##0.0` (Format desimal untuk berat/jarak).
* `phone`: `@` (Format teks murni untuk nomor telepon agar angka nol di awal tidak hilang).
* `date`: `yyyy-mm-dd` atau `dd-mm-yyyy`.
