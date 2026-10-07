---
description: Reports & Settlement UI Standards - Zero-Double-Scroll, Semantic Tokens, Pure Numeric
globs: resources/views/apps/reports/**, resources/views/apps/settlements/**, public/js/apps/reports/**, public/js/apps/settlements/**
---

# 31. Reports & Settlement UI Standards

Dokumen ini mengatur standar tampilan khusus untuk seluruh modul **Laporan** (`reports/*`) dan **Settlement** (`settlements/*`), dengan mengacu pada benchmark **Laporan CSO** dan **Settlement Tiket**.

---

## 1. Single Unified Table & Zero-Double-Scroll Standard (Bab 41)
Bug umum pada laporan berkolom banyak adalah munculnya **Double Scrollbar** (scroll ganda horizontal).
* **Aturan Mutlak di Blade**:
  * ❌ **JANGAN PERNAH** membungkus `<table id="transaction-table">` ke dalam `<div class="table-responsive">` di file Blade!
  * Letakkan elemen `<table>` langsung di dalam `<div class="card-body">`:
    ```blade
    <div class="card">
        <div class="card-body">
            <!-- Header Controls: Excel & Search -->
            <table class="table table-striped table-bordered w-100 mb-0 font-11 text-nowrap" id="transaction-table">
                ...
            </table>
        </div>
    </div>
    ```

* **Aturan Mutlak di JavaScript**:
  * Inisialisasi DataTables dengan `scrollX: true`, `paging: false`, dan sinkronisasi scroll horizontal 3-arah:
    ```javascript
    // Safety check: jika terbungkus class table-responsive, unwrap secara otomatis
    if ($("#transaction-table").parent().hasClass("table-responsive")) {
        $("#transaction-table").unwrap();
    }

    var table = $("#transaction-table").DataTable({
        ordering: false,
        searching: true,
        paging: false,
        scrollX: true,       // Scroll horizontal aktif di atas TOTAL AKUMULASI
        autoWidth: false,
        dom: "<'row'<'col-12' tr>><'row mt-3 align-items-center'<'col-12 text-center text-md-start mb-2 mb-md-0'i>>",
        initComplete: function () {
            // 3-Way Scroll Lock
            var scrollBody = $(".dataTables_scrollBody");
            var scrollHead = $(".dataTables_scrollHead");
            var scrollFoot = $(".dataTables_scrollFoot");

            scrollBody.on("scroll", function () {
                if (scrollHead.length) scrollHead[0].scrollLeft = this.scrollLeft;
                if (scrollFoot.length) scrollFoot[0].scrollLeft = this.scrollLeft;
            });
        }
    });
    ```

---

## 2. Struktur Baris Akumulasi Footer (`<tfoot>`)
* Seluruh tabel laporan/settlement **WAJIB memiliki `<tfoot>`** yang menyajikan baris `TOTAL AKUMULASI`.
* Scroll horizontal harus berjalan tepat di atas `<tfoot>`, sehingga footer ikut bergeser secara mulus saat digulir ke samping.
* Label `TOTAL AKUMULASI` menggunakan `colspan` yang menyatukan kolom identitas awal.

---

## 3. Palet Warna Semantik (Semantic Soft Tokens - Bab 33)
Gunakan token warna lembut (*soft palette*) untuk membedakan kategori data secara visual:

| Kategori Kolom | Token Background & Text | Contoh Kolom |
| :--- | :--- | :--- |
| **Identitas / Umum** | `bg-soft-secondary text-dark` | NO, RUTE, TANGGAL, NAMA |
| **Pemasukan / Finansial Positif** | `bg-soft-primary text-primary fw-bold` | JUMLAH TIKET, TOTAL BAYAR, SUB TOTAL |
| **Pengurang / Potongan** | `bg-soft-danger text-danger fw-bold` | ADM PG, PAJAK, EXPENSE API, PEMBATALAN |
| **Paket / Kargo** | `bg-soft-warning text-warning fw-bold` | JUMLAH PAKET, BERAT, PENJUALAN PAKET |
| **Grand Total (Hasil Akhir)** | `bg-soft-success text-success fw-bold font-12` | TOTAL AKHIR / HASIL BERSIH |

---

## 4. Tipografi Angka Murni (Pure Numeric Typography - Bab 42)
* **DILARANG** menambahkan prefix mata uang `"Rp "` di dalam cell tabel data.
* Angka diformat secara numerik murni dengan pemisah ribuan titik:
  * PHP (Blade): `number_format($row->total_payment, 0, ',', '.')` ➔ `165.000`
  * Angka desimal (Berat): `number_format($row->weight, 1, ',', '.') . ' kg'` ➔ `2,5 kg`
  * Teks angka finansial selalu rata kanan (`text-end`).

---

## 5. Tombol Aksi Kolom Detail Berbasis Ikon Polos (Plain Icon Detail Standard - Bab 42)
* Kolom aksi 'DETAIL' atau link modal pada tabel laporan **DILARANG** menggunakan button ber-frame atau badge tebal yang memakan tinggi baris (*row height*).
* Wajib menggunakan ikon polos (*plain icon*) dengan tooltip/title:
  ```blade
  <a href="javascript:void(0)" class="text-secondary btn-detail" data-id="{{ $row->id }}" title="Lihat Rincian Transaksi">
      <i class="las la-eye font-16"></i>
  </a>
  ```
* Menjaga tabel tetap padat (*compact*), estetis, dan sejajar sempurna dengan baris data lainnya.
