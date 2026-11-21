# Workflow: Membuat Modul Laporan / Settlement Baru

Gunakan alur kerja terstruktur ini saat diminta mengembangkan modul **Laporan** (`reports/*`) atau **Settlement** (`settlements/*`).

---

## Tahap 1: Analisis & Review Kebutuhan
1. Jika mereplikasi modul dari `admin-sunjaya`, periksa file sumber:
   * View: `admin-sunjaya/resources/views/apps/report/` atau `apps/settlement/`
   * Controller & Repository legacy.
   * Formula perhitungan finansial (Admin PG, Pajak, Sub Total, Expense API, Grand Total).
2. Periksa skema tabel database di `transport_system` atau `connex`.
3. Sajikan hasil review dan rancangan kolom kepada pengguna sebelum koding dimulai (*Human-in-the-Loop Gate*).

---

## Tahap 2: Implementasi Backend
1. **Repository**: `app/Repositories/[Report|Settlement]/[Name]Repository.php`
   * Method: `getData(array $filters): Collection`
   * Method: `getFilterOptions(): array`
2. **Service**: `app/Services/[Report|Settlement]/[Name]Service.php`
   * Method: `getProcessedData(array $filters): array` (menghasilkan `reportData`, `totalSummary`, dan `summaryCards`).
   * Method: `exportExcel(array $filters, ?string $clientTime = null): BinaryFileResponse` menggunakan `ReportExporter::make(...)`.
3. **Controller**: `app/Http/Controllers/[Report|Settlement]/[Name]Controller.php`
   * Method `index(Request $request): View` dengan `$this->permission('read')`.
   * Method `exportExcel(Request $request): BinaryFileResponse`.

---

## Tahap 3: Implementasi Tampilan (Standard Laporan CSO)
1. **Blade**: `resources/views/apps/[reports|settlements]/[name]/index.blade.php`
   * **Filter Bar**: `method="GET"` dengan query string URL preservation.
   * **KPI Summary Cards**: 6 kartu ringkasan di atas tabel dengan font-11 dan text styling semantik.
   * **Unified Table**: Letakkan `<table id="transaction-table">` langsung di dalam card-body **tanpa** wrapper `.table-responsive`.
   * **Header Semantik**: `bg-soft-secondary`, `bg-soft-primary`, `bg-soft-danger`, `bg-soft-success`.
   * **Tipografi Angka**: Murni numerik (`number_format(..., 0, ',', '.')`), **tanpa "Rp "**!
   * **Footer Akumulasi**: Sediakan baris `<tfoot>` dengan label **`TOTAL AKUMULASI`**.
2. **JavaScript**: `public/js/apps/[reports|settlements]/[name].js`
   * DataTables: `scrollX: true`, `paging: false`, `ordering: false`.
   * **3-Way Scroll Lock**: Sinkronisasi `.dataTables_scrollHead`, `.dataTables_scrollBody`, dan `.dataTables_scrollFoot`.
   * Export Excel trigger via URL backend.

---

## Tahap 4: Verifikasi & Rilis
1. Daftarkan rute di `routes/web.php` dan pastikan `menus` & `permissions` terdaftar di database.
2. Jalankan `php artisan optimize:clear`.
3. Uji render view dan ekspor file `.xlsx`.
