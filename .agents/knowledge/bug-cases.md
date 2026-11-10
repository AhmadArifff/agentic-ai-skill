# Riwayat Kasus Bug & Solusi Terverifikasi (Bug Knowledge Bank)

Dokumen ini mencatat riwayat pemecahan masalah teknis nyata yang telah diselesaikan di sistem `adminShuttleV3`. Seluruh AI Agent wajib merujuk dokumen ini untuk mencegah terjadinya kembali kesalahan yang serupa.

---

### Kasus #01: Restore Softdelete Akun OTA & Re-generasi Kredensial Acak
* **Kategori**: Keamanan & Autentikasi / RBAC
* **Gejala (Symptom)**:
  Saat agen/OTA yang sebelumnya sudah dihapus (*softdeleted*) didaftarkan kembali, sistem berisiko mengalami bentrok *duplicate entry* atau menggunakan kredensial lama yang berpotensi membocorkan akses.
* **Akar Masalah (Root Cause)**:
  Pemeriksaan keunikan data (*unique check*) dan penanganan restore belum otomatis men-generate ulang username dan password baru saat record dihidupkan kembali.
* **Solusi (Fix Applied)**:
  Di [OtaService.php](file:///c:/Users/ASUS/Documents/Web%20Dev/sunjaya/Roleback/adminShuttleV3/app/Services/Agent/OtaService.php) dan [OtaRepository.php](file:///c:/Users/ASUS/Documents/Web%20Dev/sunjaya/Roleback/adminShuttleV3/app/Repositories/Agent/OtaRepository.php):
  1. Periksa keberadaan akun dengan `withTrashed()`.
  2. Jika record ditemukan dalam kondisi terhapus: panggil `$record->restore()`.
  3. Generate ulang username acak baru dan password baru menggunakan `Str::random()` serta `bcrypt()` secara otomatis.
* **Pelajaran (Takeaway)**:
  Setiap entitas yang memiliki kredensial dan mendukung softdelete wajib men-generate ulang seluruh token rahasia saat di-restore.

---

### Kasus #02: Ketidaksejajaran Garis Kolom Header & Total Akumulasi Laporan Closing
* **Kategori**: UI / DataTables Alignment (Bab 41)
* **Gejala (Symptom)**:
  Pada tabel Laporan Closing, garis vertikal pemisah kolom antara header (No sampai Detail) dengan kolom di bawah total akumulasi bergeser / tidak sejajar (*misaligned vertical borders*).
* **Akar Masalah (Root Cause)**:
  1. Adanya pembungkus `.table-responsive` di Blade yang menyebabkan DataTables membuat scroll ganda sehingga kalkulasi lebar kolom header dan body berbeda beberapa piksel.
  2. Struktur baris multi-level `<thead>` (rowspan & colspan) tidak terhitung secara simetris terhadap baris `<tfoot>`.
* **Solusi (Fix Applied)**:
  1. Hapus pembungkus `.table-responsive` dari Blade; tempatkan `<table>` langsung di dalam card-body.
  2. Tambahkan CSS padding eksplisit `padding-left: 0.3rem !important; padding-right: 0.3rem !important;` pada seluruh elemen `th` dan `td`.
  3. Terapkan sinkronisasi scroll 3-arah (`scrollHead`, `scrollBody`, `scrollFoot`) pada event `initComplete` dan `drawCallback`.
* **Pelajaran (Takeaway)**:
  Jangan pernah menggabungkan kelas Bootstrap `.table-responsive` dengan DataTables `scrollX: true`.

---

### Kasus #03: Adaptasi Modul Settlement Paket & Standarisasi Laporan CSO
* **Kategori**: Desain Sistem & Kueri Cross-Database
* **Gejala (Symptom)**:
  Sistem membutuhkan menu Settlement Paket yang mengadopsi core data legacy `admin-sunjaya`, tetapi tabel transaksi paket berada di database `connex` dan styling legacy masih menggunakan Bootstrap usang (`table-danger`, prefix "Rp ", dsb).
* **Akar Masalah (Root Cause)**:
  Pemisahan basis data antara core `transport_system` dan transaksi paket `connex`, serta ketiadaan menu settlement paket di `adminShuttleV3`.
* **Solusi (Fix Applied)**:
  1. Buat kueri cross-database aman di [SettlementPackageRepository.php](file:///c:/Users/ASUS/Documents/Web%20Dev/sunjaya/Roleback/adminShuttleV3/app/Repositories/Settlement/SettlementPackageRepository.php) yang menghubungkan `connex.package_transaction` dengan `connex.v_settlement_package` dan tabel master `outlets`.
  2. Di [SettlementPackageService.php](file:///c:/Users/ASUS/Documents/Web%20Dev/sunjaya/Roleback/adminShuttleV3/app/Services/Settlement/SettlementPackageService.php), implementasikan kalkulasi 6 KPI Cards dan baris akumulasi finansial.
  3. Di View [index.blade.php](file:///c:/Users/ASUS/Documents/Web%20Dev/sunjaya/Roleback/adminShuttleV3/resources/views/apps/settlements/package/index.blade.php), gunakan standar modern **Laporan CSO**: palet warna lembut (`bg-soft-primary`, `bg-soft-danger`), format numerik murni tanpa "Rp ", single table tanpa `.table-responsive`, dan ekspor Excel via FastXlsxWriter.
* **Pelajaran (Takeaway)**:
  Saat mereplikasi fitur legacy, selalu adopsi logika core-nya namun perbarui arsitektur kode dan estetika tampilannya mengikuti standar modern yang sudah ada di `adminShuttleV3`.

---

### Kasus #04: Eliminasi Jargon Teknis Internal & Penyederhanaan Komentar Kode (UI & Code Hygiene)
* **Kategori**: UI/UX & Standarisasi Kolaborasi Tim Developer
* **Gejala (Symptom)**:
  1. Label UI pada modul Mitra OTA memunculkan detail implementasi teknis seperti `Password (16 Karakter):`, teks konfirmasi `(random string 16 karakter acak)`, dan form-text `disanitasi dari karakter injeksi`.
  2. Komentar kode di file CSS memuat banner dekoratif ASCII raksasa dan kutipan berkas tata kelola AI internal (`RULESCODE.md - Bab 7`) yang tidak developer-friendly.
* **Akar Masalah (Root Cause)**:
  Spesifikasi teknis backend bocor ke antarmuka pengguna akhir (operator/admin), dan komentar kode ditulis dengan gaya berlebihan (*slop*) bukannya ringkas fungsional.
* **Solusi (Fix Applied)**:
  1. Di [ota.js](file:///c:/Users/ASUS/Documents/Web%20Dev/sunjaya/Roleback/adminShuttleV3/public/js/apps/agents/ota.js): rapikan label menjadi `Password :` dan `Password Baru :`, serta sederhanakan pesan konfirmasi SweetAlert.
  2. Di [modal-create-ota.blade.php](file:///c:/Users/ASUS/Documents/Web%20Dev/sunjaya/Roleback/adminShuttleV3/resources/views/apps/agents/ota/modal-create-ota.blade.php) & [modal-update-ota.blade.php](file:///c:/Users/ASUS/Documents/Web%20Dev/sunjaya/Roleback/adminShuttleV3/resources/views/apps/agents/ota/modal-update-ota.blade.php): sederhanakan form-text menjadi `Format nama OTA otomatis disesuaikan ke huruf besar.`.
  3. Di [custom.css](file:///c:/Users/ASUS/Documents/Web%20Dev/sunjaya/Roleback/adminShuttleV3/public/css/assets/custom.css): ganti blok banner ASCII 10 baris menjadi komentar fungsional 1 baris yang bersih.
  4. Di [AGENTS.md](file:///c:/Users/ASUS/Documents/Web%20Dev/sunjaya/Roleback/adminShuttleV3/AGENTS.md) dan modul [`.agents/rules/`](file:///c:/Users/ASUS/Documents/Web%20Dev/sunjaya/Roleback/adminShuttleV3/.agents/rules/): kunci Larangan Mutlak ke-6 (Clean Comments) dan ke-7 (Human-Friendly UI & Anti-Jargon Teknis).
* **Pelajaran (Takeaway)**:
  Tampilan UI wajib menggunakan istilah umum yang bersih dan profesional bagi pengguna manusia. Komentar kode wajib ringkas, fungsional, dan natural bagi tim pengembang yang memelihara sistem.

---

### Kasus #05: Resolusi Suffix Angka Username OTA (`-2`) saat Restore Softdelete & Edit
* **Kategori**: Logika Bisnis & Penanganan Softdelete (Authentication)
* **Gejala (Symptom)**:
  Ketika mitra OTA yang telah di-softdelete (misal `TIKET.COM` dengan username `tiketcom-metics`) ditambahkan kembali, sistem membuatkan username baru berakhiran angka (`tiketcom-metics-2`). Saat dihapus dan ditambah lagi, suffix angka berganti-ganti secara tidak konsisten.
* **Akar Masalah (Root Cause)**:
  1. Method `usernameExists($username)` di `OtaRepository` menggunakan `withTrashed()` untuk mendeteksi tabrakan username tanpa mengecualikan ID entitas yang sedang dipulihkan/diedit (`$excludeId`).
  2. Sistem mendeteksi username milik record soft-deleted itu sendiri sebagai konflik dengan akun lain, sehingga memicu generator username unik menambahkan suffix angka increment (`-2`).
* **Solusi (Fix Applied)**:
  1. Di [OtaRepositoryInterface.php](file:///c:/Users/ASUS/Documents/Web%20Dev/sunjaya/Roleback/adminShuttleV3/app/Repositories/Agent/OtaRepositoryInterface.php) dan [OtaRepository.php](file:///c:/Users/ASUS/Documents/Web%20Dev/sunjaya/Roleback/adminShuttleV3/app/Repositories/Agent/OtaRepository.php): tambahkan parameter opsional `?string $excludeId = null` pada `usernameExists()`, dengan klausa `where('id', '!=', $excludeId)`.
  2. Di [OtaService.php](file:///c:/Users/ASUS/Documents/Web%20Dev/sunjaya/Roleback/adminShuttleV3/app/Services/Agent/OtaService.php): teruskan `$trashedOta->id` pada pemanggilan `generateUniqueUsername($data['name'], $trashedOta->id)` saat restore di `createOta()`, dan teruskan `$id` pada `updateOta()`.
* **Pelajaran (Takeaway)**:
  Pengecekan keunikan (*unique check*) pada proses restore soft-delete atau update data wajib selalu mengecualikan primary key (`id`) dari record yang sedang diproses agar tidak terjadi bentrok dengan datanya sendiri (*self-collision*).

---

### Kasus #06: Isolasi Database Eksternal (Connex) & Implementasi UI-Ready Empty State pada Settlement Paket
* **Kategori**: Keamanan Database & Isolasi Environment Development
* **Gejala (Symptom)**:
  Pada halaman Settlement Paket, muncul 1 data transaksi kargo aktif riil (`PCNX261002M7TC`) bernilai Rp 63.000 karena kueri terhubung secara *cross-database* ke database `connex` yang sedang aktif dipakai di lingkungan *production*.
* **Akar Masalah (Root Cause)**:
  Sistem `adminShuttleV3` menggunakan database utama `transport_system` (khusus penumpang), sementara data paket kargo berada di database terpisah `connex`. Kueri *cross-database* tidak boleh digunakan selama masa pengembangan karena berisiko membebani sistem lain dan membocorkan data operasional live.
* **Solusi (Fix Applied)**:
  1. Di [SettlementPackageRepository.php](file:///c:/Users/ASUS/Documents/Web%20Dev/sunjaya/Roleback/adminShuttleV3/app/Repositories/Settlement/SettlementPackageRepository.php), putus kueri `DB::table('connex.package_transaction as pt')` dan kembalikan koleksi kosong `collect([])`.
  2. Pertahankan `getFilterOptions()` agar dropdown outlet dan pembayaran tetap aktif dari `transport_system`.
  3. Antarmuka tabel dan 6 KPI summary cards tetap tampil lengkap 100% dalam kondisi *graceful empty state* (nilai 0), dan fitur ekspor Excel tetap dapat diunduh tanpa error.
* **Pelajaran (Takeaway)**:
  Lingkungan pengembangan wajib terisolasi penuh dari database luar yang aktif di *production*. Jika skema data belum final, gunakan pola *UI-ready empty state* yang aman tanpa mengorbankan kelengkapan desain antarmuka.

---

### Kasus #07: Isolasi Database Eksternal (Connex & v_package_transactions) pada Seluruh Modul Laporan
* **Kategori**: Keamanan Database & Isolasi Environment Development
* **Gejala (Symptom)**:
  Modul-modul laporan shuttle (Paket Reguler, Pembatalan Paket, CSO, All-In, Harian, dan Outlet) berpotensi mengeksekusi kueri ke database luar `connex` baik secara langsung (`connex.package_transaction_person`) maupun tidak langsung melalui view database `v_package_transactions`.
* **Akar Masalah (Root Cause)**:
  View `v_package_transactions` di skema MySQL secara implisit melakukan kueri lintas basis data ke `connex.package_transaction`. Pada masa *development*, kueri ini berisiko membocorkan data live kargo dan membebani server database luar.
* **Solusi (Fix Applied)**:
  1. Di [PackageRegularReportController.php](file:///c:/Users/ASUS/Documents/Web%20Dev/sunjaya/Roleback/adminShuttleV3/app/Http/Controllers/Report/PackageRegularReportController.php) dan [PackageCanceledReportController.php](file:///c:/Users/ASUS/Documents/Web%20Dev/sunjaya/Roleback/adminShuttleV3/app/Http/Controllers/Report/PackageCanceledReportController.php): cabut kueri database kargo dan kembalikan `collect([])` (UI-Ready Empty State).
  2. Di [CsoReportController.php](file:///c:/Users/ASUS/Documents/Web%20Dev/sunjaya/Roleback/adminShuttleV3/app/Http/Controllers/Report/CsoReportController.php), [AllInReportController.php](file:///c:/Users/ASUS/Documents/Web%20Dev/sunjaya/Roleback/adminShuttleV3/app/Http/Controllers/Report/AllInReportController.php), [DailyReportController.php](file:///c:/Users/ASUS/Documents/Web%20Dev/sunjaya/Roleback/adminShuttleV3/app/Http/Controllers/Report/DailyReportController.php), dan [OutletReportController.php](file:///c:/Users/ASUS/Documents/Web%20Dev/sunjaya/Roleback/adminShuttleV3/app/Http/Controllers/Report/OutletReportController.php): putus kueri paket kargo dan jadikan nilai paket default `0` / array kosong, sementara kalkulasi data tiket penumpang dan manifest operasional tetap 100% aktif dari `transport_system`.
* **Pelajaran (Takeaway)**:
  Pada modul laporan campuran (hybrid), isolasi modul eksternal harus dilakukan secara bedah mikro tanpa mengganggu keakuratan kalkulasi modul inti yang sudah mandiri di basis data utama.

---

### Kasus #08: Resolusi Input Menit Terpotong pada Komponen `x-input-group-text` & Pill Seamless Input Group
* **Kategori**: Frontend UI / Komponen Reusable Blade
* **Gejala (Symptom)**:
  1. Pada form promo (tiket & paket) yang memanfaatkan komponen `<x-input-group-text type="datetime">`, input waktu (`HH:mm`) terpotong sisi kanannya sehingga angka menit tidak terlihat utuh.
  2. Saat elemen input-group biasa digabungkan dengan `form-control` ber-border radius lonjong (*pill*), sudut lengkung terpotong atau memiliki siku tajam yang merusak estetika.
* **Akar Masalah (Root Cause)**:
  1. Pembagian lebar kolom input waktu di dalam wrapper input-group datetime terlalu sempit (`width: 35%`), sehingga font waktu memicu *clipping* pada resolusi layar tertentu.
  2. Standar Bootstrap input-group memerlukan penyesuaian CSS khusus untuk selector `:first-child`, `:last-child`, dan `:not(:first-child):not(:last-child)` agar border radius pil (50rem) menyatu mulus tanpa patahan.
* **Solusi (Fix Applied)**:
  1. Di [input-group-text.blade.php](file:///c:/Users/ASUS/Documents/Web%20Dev/sunjaya/Roleback/adminShuttleV3/resources/views/components/input-group-text.blade.php): ubah lebar kolom waktu menjadi `45%` dengan `min-width: 90px`, tambahkan padding `px-2`, dan isolasi styling pada kelas pembungkus `.datetime-wrapper`.
  2. Di view form yang memerlukan input group satuan (seperti Rp, Kg, Koli, Hari): terapkan CSS selektor pill seamless pada `@push('custom-style')`:
     ```css
     .input-group > :first-child,
     .input-group > .input-group-text:first-child,
     .input-group > .form-control:first-child {
         border-top-left-radius: 50rem !important;
         border-bottom-left-radius: 50rem !important;
     }
     .input-group > :last-child,
     .input-group > .input-group-text:last-child,
     .input-group > .form-control:last-child {
         border-top-right-radius: 50rem !important;
         border-bottom-right-radius: 50rem !important;
     }
     .input-group > :not(:first-child):not(:last-child) {
         border-radius: 0 !important;
     }
     ```
* **Pelajaran (Takeaway)**:
  Komponen input datetime wajib selalu memberikan ruang horizontal minimal 90px untuk input waktu. Styling pill pada input group sebaiknya diisolasi per view terkait agar tidak merusak modul lama yang menggunakan border-radius standar Bootstrap.

---

### Kasus #09: Penanganan Kolom Warisan DB Tanpa Default Value (`round_trip_expired` Error 1364) & Desain Form Konfigurasi Khusus
* **Kategori**: Database Integrity, Service Layer & UI/UX Design
* **Gejala (Symptom)**:
  1. Muncul error `SQLSTATE[HY000]: General error: 1364 Field 'round_trip_expired' doesn't have a default value` saat menyimpan data Promo Paket baru.
  2. Adanya opsi-opsi warisan tiket (`round_trip`, `round_trip_expired`, `free_ticket`, `is_special`) yang membingungkan staf jika tidak terstruktur dengan baik.
* **Akar Masalah (Root Cause)**:
  1. Skema `package_promotions` dikloning dari tabel `promotions` legacy (`sunjaya_dev`) yang mendefinisikan `round_trip_expired INT NOT NULL` tanpa default value.
  2. Fitur-fitur kebijakan bisnis (promo B2B, gratis ongkir, paket retur) berisiko membuat DataTables sesak (*overcrowded*) dan memicu salah klik jika dipaksakan dalam bentuk toggle switch di tabel.
* **Solusi (Fix Applied)**:
  1. Di [PackagePromotionService.php](file:///c:/Users/ASUS/Documents/Web%20Dev/sunjaya/Roleback/adminShuttleV3/app/Services/Promotion/PackagePromotionService.php): sanitasi payload dengan nilai default aman: `round_trip_expired` bernilai 0 jika `round_trip = 'n'`, dan bernilai angka hari jika `round_trip = 'y'`.
  2. Di [form.blade.php](file:///c:/Users/ASUS/Documents/Web%20Dev/sunjaya/Roleback/adminShuttleV3/resources/views/apps/promotion-package/form.blade.php): kelompokkan fitur ke dalam kartu "KETENTUAN KHUSUS & SKEMA PENGIRIMAN" menggunakan dropdown `<select>` bersih.
  3. Sertakan icon informasi edukasi `<i class="las la-info-circle text-primary font-14" data-bs-toggle="tooltip" title="..."></i>` agar staf operasional memahami fungsi setiap opsi secara langsung (*in-app guidance*).
  4. Di [promotion-package-form.js](file:///c:/Users/ASUS/Documents/Web%20Dev/sunjaya/Roleback/adminShuttleV3/public/js/apps/promotion-package/promotion-package-form.js): tambahkan listener dinamis bersyarat (*conditional UI*) di mana input hari `round_trip_expired` otomatis muncul dengan default 30 hari saat `round_trip = 'y'`, dan tersembunyi bernilai 0 saat `round_trip = 'n'`.
* **Pelajaran (Takeaway)**:
  Selalu pastikan seluruh kolom `NOT NULL` warisan database memiliki fallback nilai aman di Service Layer. Konfigurasi kebijakan promo wajib ditaruh di Form Input dengan bantuan tooltip deskriptif, bukan ditumpuk di baris DataTables.

---

### Kasus #10: Proteksi Hyphenation Wrapping Rentang Waktu DataTables, Kelengkapan Jam Pengiriman & Integrasi Audit Tanggal Dibuat
* **Kategori**: Frontend DataTables UI / Resource Transformation
* **Gejala (Symptom)**:
  1. Pada tabel Promo (Tiket & Paket), teks rentang tanggal terbelah buruk di tanda minus (`06-11-` di baris atas dan `2026 (23:59)` di baris bawah).
  2. Pada Promo Paket, kolom pengiriman tidak menampilkan jam (`(00:00)` s.d `(23:59)`).
  3. Tanggal pembuatan (`created_at`) tidak tampak di tabel sehingga staf tidak mengetahui kapan data promo dibuat.
* **Akar Masalah (Root Cause)**:
  1. Standar browser memperlakukan tanda strip (`-`) pada format tanggal sebagai titik potong kata (*word break*), memecah tahun dan jam ke baris baru saat lebar sel terbatas.
  2. Di [PackagePromotionResource.php](file:///c:/Users/ASUS/Documents/Web%20Dev/sunjaya/Roleback/adminShuttleV3/app/Http/Resources/PackagePromotionResource.php), kolom `start_depart` dan `end_depart` hanya diformat menggunakan `d-m-Y` tanpa `(H:i)`.
  3. Skrip DataTables hanya merender `${row.admin_name}` pada kolom `DIBUAT OLEH`.
* **Solusi (Fix Applied)**:
  1. Di [PackagePromotionResource.php](file:///c:/Users/ASUS/Documents/Web%20Dev/sunjaya/Roleback/adminShuttleV3/app/Http/Resources/PackagePromotionResource.php): ubah format `start_depart` dan `end_depart` menjadi `d-m-Y (H:i)`.
  2. Di [index.blade.php](file:///c:/Users/ASUS/Documents/Web%20Dev/sunjaya/Roleback/adminShuttleV3/resources/views/apps/promotion-package/index.blade.php) (paket) & [index.blade.php](file:///c:/Users/ASUS/Documents/Web%20Dev/sunjaya/Roleback/adminShuttleV3/resources/views/apps/promotion/index.blade.php) (tiket):
     - Tambahkan kelas `text-nowrap` pada elemen `<table>` sehingga baris data tabel konsisten berbentuk 1 baris lurus tanpa membengkak ke bawah.
     - Tambahkan kolom mandiri `<th>TANGGAL DIBUAT</th>` di samping `<th>DIBUAT OLEH</th>`.
     - Perbarui header menjadi `PERIODE PENGIRIMAN` dan `PERIODE JADWAL TRIP`.
  3. Di [promotion-package-table.js](file:///c:/Users/ASUS/Documents/Web%20Dev/sunjaya/Roleback/adminShuttleV3/public/js/apps/promotion-package/promotion-package-table.js) dan [promotion-table.js](file:///c:/Users/ASUS/Documents/Web%20Dev/sunjaya/Roleback/adminShuttleV3/public/js/apps/promotion/promotion-table.js):
     - Pisahkan kolom `DIBUAT OLEH` (nama admin murni) dan `TANGGAL DIBUAT` (`row.created_at`).
     - Bungkus kolom rentang tanggal (`periode_range`, `depart_range`) dengan class `text-nowrap` dan render jadwal trip tiket dalam 1 baris terpadu.
* **Pelajaran (Takeaway)**:
  Seluruh rentang tanggal numerik di DataTables wajib selalu dibungkus `text-nowrap` untuk menghindari *clipping* atau pemotongan kata di tanda minus `-`. Menggunakan kelas `text-nowrap` pada level `<table>` memastikan baris tabel tetap ramping horizontal (1 baris lurus) dengan scroll horizontal yang mulus tanpa membengkak ke bawah.

---

### Kasus #11: Delegasi Magic __get Laravel JsonResource vs Blade Object Access (Periode Menghasilkan Nilai Strip `:-`)
* **Kategori**: Laravel Architecture & Blade View Rendering
* **Gejala (Symptom)**:
  Kolom Periode Promo dan Periode Pengiriman pada halaman detail promo menampilkan tanda strip `:-`, padahal data `start_periode` dan `end_periode` terisi lengkap di database.
* **Akar Masalah (Root Cause)**:
  Controller mengirimkan objek mentah `JsonResource` (`$promoResult->data`) ke view Blade. Saat Blade mengakses `$promo->periode_range`, magic method `__get` milik `JsonResource` mendelegasikannya ke underlying Eloquent Model asal (`$this->resource->periode_range`). Karena di tabel/model database kolomnya bernama `start_periode` dan `end_periode` (tidak ada kolom `periode_range`), pemanggilan tersebut mengembalikan `null` sehingga Blade jatuh ke nilai cadangan strip `'-'`.
* **Solusi (Fix Applied)**:
  1. Di Controller ([PromotionController.php](file:///c:/Users/ASUS/Documents/Web%20Dev/sunjaya/Roleback/adminShuttleV3/app/Http/Controllers/Promotion/PromotionController.php) & [PackagePromotionController.php](file:///c:/Users/ASUS/Documents/Web%20Dev/sunjaya/Roleback/adminShuttleV3/app/Http/Controllers/Promotion/PackagePromotionController.php)):
     Resolve resource terlebih dahulu sebelum dipass ke view:
     ```php
     $promoData = is_object($promoResult->data) && method_exists($promoResult->data, 'resolve')
         ? (object) $promoResult->data->resolve()
         : $promoResult->data;
     ```
  2. Di Blade Template ([detail.blade.php](file:///c:/Users/ASUS/Documents/Web%20Dev/sunjaya/Roleback/adminShuttleV3/resources/views/apps/promotion/detail.blade.php)):
     Tambahkan fallback berlapis:
     ```php
     if (!empty($promo->periode_range)) {
         $periodeText = $promo->periode_range;
     } elseif (!empty($promo->start_periode) && !empty($promo->end_periode)) {
         $periodeText = Carbon::parse($promo->start_periode)->format('d-m-Y (H:i)') . ' s.d ' . Carbon::parse($promo->end_periode)->format('d-m-Y (H:i)');
     } else {
         $periodeText = '-';
     }
     ```
* **Pelajaran (Takeaway)**:
  Jangan pernah mengirim objek mentah `JsonResource` ke Blade View jika template mengonsumsi key/atribut kalkulasi yang hanya didefinisikan di dalam `toArray()`. Panggil `->resolve()` dan cast ke `(object)` agar seluruh properti kalkulasi dapat diakses secara native oleh Blade, serta selalu siapkan fallback berlapis.

---

### Kasus #12: Siklus Hidup Promo Kondisi Ganda (Dual-Condition Promo Lifecycle: Manual Switch `is_active` vs Temporal Calendar `end_periode`)
* **Kategori**: Business Logic, State Management & UI Feedback
* **Gejala (Symptom)**:
  Promo yang tanggal batasnya (`end_periode`) telah terlewati/kadaluarsa masih menampilkan switch aktif (`is_active = y`) berwarna hijau di DataTables dan halaman detail. Hal ini membingungkan staf operasional kasir/CSO yang mengira promo masih bisa digunakan, serta berisiko memicu kebocoran diskon jika modul pemesanan hanya memvalidasi `is_active = y`.
* **Akar Masalah (Root Cause)**:
  1. `is_active` (`enum('y','n')`) merupakan **State Operasional Manual** yang dikendalikan oleh admin/marketing (saklar manual).
  2. `end_periode` (`datetime`) merupakan **State Temporal Kalender** yang dinamis mengikuti perputaran waktu nyata (*real-time clock*).
  3. Mengubah database `is_active = 'n'` secara otomatis di database via cron job adalah anti-pattern yang merusak riwayat intent konfigurasi admin (misal saat marketing hanya ingin memperpanjang promo yang sudah lewat dengan cukup menggeser tanggal di menu Edit tanpa harus mengaktifkan switch ulang secara manual).
* **Solusi (Fix Applied)**:
  1. **UI Presentation Layer (DataTables & Detail View)**:
     - Hitung boolean `'is_expired'` secara real-time di Resource: `Carbon::parse($this->end_periode)->isPast()`.
     - Tampilkan Smart Status Badge kombinasi:
       * `AKTIF` (Hijau): `is_active == 'y'` dan belum kadaluarsa.
       * `KADALUARSA` (Merah): `is_active == 'y'` tetapi tanggal kalender sudah berakhir.
       * `NONAKTIF` (Abu-abu): `is_active == 'n'`.
     - Tempelkan tag visual `[Kadaluarsa]` berwarna merah di samping teks rentang tanggal promo pada tabel dan halaman detail.
  2. **Domain Guard Layer (Validasi Transaksi / Pemesanan)**:
     - Seluruh endpoint checkout pemesanan tiket atau pengiriman paket WAJIB menerapkan validasi ganda (*guard clause*):
       ```php
       if ($promo->is_active !== 'y' || Carbon::now()->isAfter($promo->end_periode)) {
           return ServiceResult::failed('Promo tidak berlaku atau telah berakhir masa aktifnya', 422);
       }
       ```
  3. **API Serializer Layer**:
     - Serialisasikan `'is_expired'` secara boolean langsung di Resource agar antarmuka client (aplikasi mobile / web pelanggan) tidak perlu melakukan parsing string tanggal manual.
* **Pelajaran (Takeaway)**:
  Jangan pernah menyatukan atau menimpa state operasional manusia (*human operational intent*) dengan state temporal waktu server. Gunakan kalkulasi dinamis real-time (*computed state*) di layer presentasi dan terapkan guard ganda mutlak di layer transaksi backend.

---

### Kasus #13: Pembersihan Berkas Fisik Storage (MinIO) & Pengosongan Kolom Gambar pada Entitas Soft Deletes
* **Kategori**: File Lifecycle, Storage Cleanup & Database Integrity
* **Gejala (Symptom)**:
  Saat entitas (Promo Tiket atau Promo Paket) dihapus di web admin menggunakan `SoftDeletes`, file fisik gambar di MinIO tetap tertinggal di bucket. Jika kelak pengembang/analis menghapus baris data langsung di phpMyAdmin (`DELETE FROM promotions`), file gambar di MinIO menjadi berkas sampah/yatim (*orphaned files*) yang menumpuk selamanya tanpa relasi di database.
* **Akar Masalah (Root Cause)**:
  Secara bawaan, trait Laravel `SoftDeletes` hanya meng-update kolom `deleted_at = now()` dan tidak memicu penghapusan berkas fisik di object storage (MinIO/S3). Jika file tidak dibersihkan saat aksi hapus di web admin, maka ketika baris tabel di phpMyAdmin dihapus permanen, sistem kehilangan jejak nama/path file gambar tersebut di storage MinIO.
* **Solusi (Fix Applied)**:
  1. Pada Service Layer ([PromotionService.php](file:///c:/Users/ASUS/Documents/Web%20Dev/sunjaya/Roleback/adminShuttleV3/app/Services/Promotion/PromotionService.php) & [PackagePromotionService.php](file:///c:/Users/ASUS/Documents/Web%20Dev/sunjaya/Roleback/adminShuttleV3/app/Services/Promotion/PackagePromotionService.php)):
     - Ambil model data promo sebelum di-delete.
     - Periksa path file fisik: jika `$promo->image` ada dan bukan URL eksternal, hapus berkas fisik dari MinIO storage secara aman dengan guard try-catch:
       ```php
       if ($promo->image && !str_starts_with($promo->image, 'http')) {
           try {
               Storage::disk('minio')->delete($promo->image);
           } catch (Exception $e) {
               Log::warning('Gagal menghapus gambar promo di MinIO: ' . $e->getMessage());
           }
       }
       ```
     - Perbarui kolom gambar di database menjadi `NULL` (`$this->repository->update($id, ['image' => null])`) agar URL gambar bersih dan tidak menyisakan broken reference.
     - Jalankan soft delete pada entitas: `$this->repository->delete($id)`.
  2. **Skenario Un-delete / Restore**:
     - Jika sewaktu-waktu data di-restore (misal tanggal `deleted_at` diubah kembali jadi `NULL` di phpMyAdmin), data promo akan muncul kembali di web admin dengan gambar kosong (`null` / banner default), dan admin dapat langsung mengunggah poster baru melalui fitur Update/Edit.
  3. **Skenario Hard Delete phpMyAdmin**:
     - Saat baris data dihapus permanen di phpMyAdmin, storage MinIO sudah bersih sejak awal, mencegah penumpukan berkas tak bertuan (*storage bloat*).
* **Pelajaran (Takeaway)**:
  Pada sistem dengan pengelolaan basis data aktif via phpMyAdmin di fase development, penghapusan fisik berkas di storage eksternal (MinIO/S3) serta pengosongan atribut kolom file (`image = null`) saat soft delete di aplikasi web adalah strategi pencegahan akumulasi berkas sampah (*orphaned storage bloat*) yang efektif dan aman.

---

### Kasus #14: Jebakan Konfirmasi Ganda (*Double Modal Race Condition*) & Penguatan CSRF Headers pada Aksi Hapus AJAX
* **Kategori**: Frontend AJAX, Modal Lifecycle & CSRF Security
* **Gejala (Symptom)**:
  Saat pengguna mengklik tombol Hapus pada DataTables Promo Tiket atau Promo Paket dan telah menekan konfirmasi "Ya, Hapus!", aksi penghapusan tidak terjadi sama sekali. Data tetap ada di tabel, tidak ada pesan error di browser, dan tidak ada request masuk di log backend server.
* **Akar Masalah (Root Cause)**:
  1. Helper bawaan sistem `actionDelete(endpoint, id)` di [ajax.js](file:///c:/Users/ASUS/Documents/Web%20Dev/sunjaya/Roleback/adminShuttleV3/public/js/apps/ajax.js) secara internal **sudah memunculkan dialog konfirmasi SweetAlert2** ("Hapus Data: Yakin akan hapus data sekarang?").
  2. Fungsi `deletePromotion(id)` membungkus `actionDelete` dengan `Swal.fire` manual tambahan ("Hapus Promo Tiket?").
  3. Terjadi bentrokan instance SweetAlert2: saat modal pertama ditutup, modal kedua yang baru dipanggil langsung tertutup seketika (*auto-dismiss*) akibat transisi penutupan modal pertama. Akibatnya, `result.isConfirmed` pada `actionDelete` bernilai `false/null` dan request AJAX `DELETE` **tidak pernah dikirimkan ke server**.
  4. Fungsi `actionDelete` sebelumnya belum menyertakan header proteksi `X-CSRF-TOKEN` dan `Accept: application/json` pada request `DELETE`.
* **Solusi (Fix Applied)**:
  1. Di [promotion-table.js](file:///c:/Users/ASUS/Documents/Web%20Dev/sunjaya/Roleback/adminShuttleV3/public/js/apps/promotion/promotion-table.js) & [promotion-package-table.js](file:///c:/Users/ASUS/Documents/Web%20Dev/sunjaya/Roleback/adminShuttleV3/public/js/apps/promotion-package/promotion-package-table.js):
     - Hapus wrapper `Swal.fire` duplikat.
     - Panggil `actionDelete(endpoint, id)` secara langsung seperti modul standar lainnya (misal `route.js`, `schedule.js`).
     - Tampilkan feedback visual menggunakan `$.toast` (Hijau untuk sukses, Merah untuk gagal) dan jadwalkan `reloadTable()` setelah 500ms.
  2. Di [ajax.js](file:///c:/Users/ASUS/Documents/Web%20Dev/sunjaya/Roleback/adminShuttleV3/public/js/apps/ajax.js):
     - Tambahkan headers `X-CSRF-TOKEN`, `Accept: application/json`, dan `X-Requested-With: XMLHttpRequest` pada `actionDelete`.
* **Pelajaran (Takeaway)**:
  Selalu periksa implementasi internal helper fungsi sebelum membuat modal konfirmasi di view/script. Jika helper sudah memiliki dialog konfirmasi terintegrasi, jangan membungkusnya lagi dengan modal eksternal untuk menghindari race condition penutupan dialog.

---

### Kasus #15: Eror 500 RouteNotFoundException [verification.send] & Redesain Profil Staf Sesuai Standar adminShuttleV3
* **Kategori**: Routing & Frontend Profile Architecture
* **Gejala (Symptom)**:
  Saat staf admin mengakses menu Pengaturan Akun (`GET /profile` atau klik Pengaturan Akun di dropdown profil), server melempar HTTP 500:
  `Symfony\Component\Routing\Exception\RouteNotFoundException: Route [verification.send] not defined.`
  di baris `resources/views/profile/partials/update-profile-information-form.blade.php:12`. Selain itu, foto profil admin belum dapat ditampilkan dan tidak ada fasilitas untuk memperbarui foto avatar.
* **Akar Masalah (Root Cause)**:
  1. Template bawaan Laravel Breeze (`update-profile-information-form.blade.php`) secara default memuat form tersembunyi verifikasi email (`<form id="send-verification" action="{{ route('verification.send') }}">`).
  2. Pada sistem operasional shuttle/travel ini, route verifikasi email pada `routes/auth.php` dinonaktifkan (karena staf admin didaftarkan langsung oleh Superadmin tanpa alur verifikasi email publik).
  3. Form request bawaan (`ProfileUpdateRequest`) melakukan validasi keunikan ke model customer `User::class` (bukan model staf `Admin::class`), serta belum mendukung atribut staf operasional (`handphone`, `address`, dan unggah file `image`).
  4. Header navbar memanggil route foto profil `route('profile.photo', ...)` yang belum terdaftar di routing web.
* **Solusi (Fix Applied)**:
  1. **Redesain Antarmuka Terpadu**: Redesain total [edit.blade.php](file:///c:/Users/ASUS/Documents/Web%20Dev/sunjaya/Roleback/adminShuttleV3/resources/views/profile/edit.blade.php) mengadopsi standar **Single Title Header** (`PENGATURAN AKUN`) dan menghapus folder partials sisa Breeze (`resources/views/profile/partials/`) yang menyebabkan RouteNotFoundException.
  2. **Layout 2 Kolom Seimbang**:
     - Kolom kiri: Kartu ringkasan identitas (Avatar 130px dengan tombol trigger kamera untuk upload foto, live preview via FileReader JS, badge role & outlet penugasan, ID karyawan, nomor kontak, serta status aktif).
     - Kolom kanan: Tab terpisah (Tab 1: Formulir Data Diri nama/username/email/handphone/alamat, Tab 2: Formulir Ubah Password).
  3. **Arsitektur 4-Layer**:
     - Service [ProfileService.php](file:///c:/Users/ASUS/Documents/Web%20Dev/sunjaya/Roleback/adminShuttleV3/app/Services/Profile/ProfileService.php) menangani penyimpanan foto avatar ke storage MinIO (bucket `connexshuttle`, folder `admins/`) dengan fallback ke storage public lokal dan pembersihan berkas lama.
     - Controller [ProfileController.php](file:///c:/Users/ASUS/Documents/Web%20Dev/sunjaya/Roleback/adminShuttleV3/app/Http/Controllers/ProfileController.php) menyediakan endpoint streaming foto `photo($fileName)` dan form handling `edit()` / `update()`.
     - Validasi [ProfileUpdateRequest.php](file:///c:/Users/ASUS/Documents/Web%20Dev/sunjaya/Roleback/adminShuttleV3/app/Http/Requests/ProfileUpdateRequest.php) disesuaikan terhadap model `Admin::class` (`admins` table) serta validasi berkas gambar (max 2MB, format jpeg/png/webp).
  4. **Accessor Model & Topbar Sync**:
     - Menambahkan accessor `getImageUrlAttribute()` pada [Admin.php](file:///c:/Users/ASUS/Documents/Web%20Dev/sunjaya/Roleback/adminShuttleV3/app/Models/AdminManagement/Admin.php) dengan fallback aman ke `images/no_image_user.png`.
     - Memperbarui [header.blade.php](file:///c:/Users/ASUS/Documents/Web%20Dev/sunjaya/Roleback/adminShuttleV3/resources/views/layouts/includes/app/header.blade.php) topbar agar foto avatar profil langsung tersinkronisasi.
* **Pelajaran (Takeaway)**:
  Saat mengintegrasikan scaffolding auth seperti Laravel Breeze ke dalam sistem manajemen internal dengan custom guard/model staf, pastikan seluruh partial bawaan yang mengasumsikan alur verifikasi email publik diganti secara tuntas dengan komponen yang selaras arsitektur proyek dan model autentikasi yang berlaku.

---

### Kasus #16: Standarisasi Profil Akun (2 Kartu Bertumpuk: Profile Information & Update Password) & Integrasi Input Group Password
* **Kategori**: Frontend UI/UX, Laravel Auth & Form Layout
* **Gejala (Symptom)**:
  1. Tampilan pengaturan akun sempat dibuat dengan tata letak 2 kolom dan tab, padahal kesepakatan desain bersama tim menghendaki tata letak terpusat yang bersih (*clean stacked*) dengan 2 kartu bertumpuk langsung: Card 1 (*Profile Information*) dan Card 2 (*Update Password*).
  2. Tombol intip password (*eye toggle*) sempat terbelah canggung (*broken visual split*) dari input karena style global `custom.css` memaksa `border-radius: 50rem !important;` pada semua elemen `.form-control`.
  3. Saat validasi form ubah password gagal, notifikasi toast warna merah tidak muncul jika pembacaan error hanya mengecek bag default `$errors->any()`.
* **Akar Masalah (Root Cause)**:
  1. Ketiadaan dokumentasi acuan baku desain profil di `.agents` menyebabkan divergensi konsep tampilan antara 2 kolom bertab vs 2 kartu vertikal terpusat.
  2. Aturan global Bootstrap dan tema me-reset border-radius input-group atau memaksakan pill radius, sehingga field password dan span mata terpisah.
  3. `PasswordController::update()` menggunakan `$request->validateWithBag('updatePassword', ...)` yang menyimpan eror ke bag terpisah `$errors->updatePassword`.
* **Solusi (Fix Applied)**:
  1. **Layout 2 Kartu Bertumpuk Terpusat Sesuai Acuan Tim**:
     - Di [edit.blade.php](file:///c:/Users/ASUS/Documents/Web%20Dev/sunjaya/Roleback/adminShuttleV3/resources/views/profile/edit.blade.php): Gunakan wrapper `col-xl-9 col-lg-10 col-md-11 mx-auto` dengan 2 kartu putih elegan (`.profile-card`):
       - Card 1: `Profile Information` (*Perbarui informasi profil akun Anda*) dengan input Nama, Username, No Handphone, Alamat, dan tombol merah `Simpan Profil` (`#c82333`).
       - Card 2: `Update Password` (*Pastikan akun Anda menggunakan kata sandi yang panjang dan acak agar tetap aman.*) dengan input Password Saat Ini, Password Baru, Konfirmasi Password, dan tombol merah `Simpan Password` (`#c82333`).
  2. **Integrated Input Group dengan Tombol Intip Password (Eye Icon)**:
     - Terapkan styling `.profile-card .form-control` dengan `border-radius: 4px !important;` untuk menimpa pill global 50rem.
     - Padukan input field dan span mata ke dalam satu grup input kotak rapi dengan highlight ring fokus biru `#3b82f6` saat fokus.
  3. **Evaluasi Error Bag Berlapis & Feedback Toast**:
     - Baca `$errors->updatePassword->first()` dan `$errors->first()` untuk memunculkan notifikasi mengambang `$.toast` (pojok kanan atas, merah untuk eror, hijau untuk sukses) tanpa merusak kebersihan tampilan kartu.
* **Pelajaran (Takeaway)**:
  Kedaulatan acuan desain tim (*team visual consensus*) adalah prioritas tertinggi. Dokumentasikan mockup atau pola tampilan yang disepakati langsung ke `.agents/rules/30-ui-frontend.md` dan `.agents/04-case-bank/cases/` agar seluruh AI Agent dan pengembang di masa mendatang selalu mereplikasi standar visual yang sama.

---

### Kasus #17: Resolusi Panggilan Undefined Method ServiceResult::toArray() pada Controller JSON Endpoint (DataTables Ajax Error 500)
* **Kategori**: Backend Architecture, Controller Response Handler & DataTables AJAX
* **Gejala (Symptom)**:
  Saat membuka tab "Tarif Antar Jemput (Jarak KM)" pada menu **PAKET ➔ TARIF PAKET** (`packages/prices`), DataTables memunculkan pop-up peringatan:
  `DataTables warning: table id=distance-price-table - Ajax error. For more information about this error, please see http://datatables.net/tn/7`
  Pemeriksaan pada `storage/logs/laravel.log` mencatat error HTTP 500:
  `local.ERROR: Call to undefined method App\Support\ServiceResult::toArray() at PackagePriceController.php:154`
* **Akar Masalah (Root Cause)**:
  Class `App\Support\ServiceResult` dirancang sebagai DTO immutable berbasis *Result Pattern* murni dengan properti publik `$success`, `$data`, `$message`, `$code`, `$errors` dan method getter seperti `isSuccess()`, `getData()`, dsb. `ServiceResult` tidak memiliki method `toArray()`. Pada `PackagePriceController`, respon JSON sebelumnya ditulis secara manual menggunakan `return response()->json($result->toArray(), $result->code);` sehingga PHP melemparkan fatal error saat controller mencoba memanggil method yang tidak ada.
* **Solusi (Fix Applied)**:
  1. Base Controller `App\Http\Controllers\Controller` telah menyediakan method pembungkus baku:
     ```php
     protected function respond(ServiceResult $result): JsonResponse
     {
         return $result->success
             ? Response::success($result->data, $result->message, $result->code)
             : Response::error($result->message, $result->code, $result->errors);
     }
     ```
  2. Seluruh endpoint JSON pada `PackagePriceController` (`matrix`, `storePrice`, `weightData`, `weightStore`, `weightShow`, `weightUpdate`, `weightToggle`, `weightDestroy`, `distanceData`, `distanceStore`, `distanceShow`, `distanceUpdate`, `distanceDestroy`) diperbarui untuk mengembalikan `$this->respond($result);`.
  3. Validasi awal pada `matrix` menggunakan `Response::error('Pilih kelompok berat terlebih dahulu', 422);`.
* **Pelajaran (Takeaway)**:
  Seluruh controller di `adminShuttleV3` yang mengonsumsi `Service` wajib memanfaatkan helper bawaan `$this->respond($result)`. Jangan pernah memanggil `$result->toArray()` pada objek `ServiceResult`. Hal ini menjamin struktur payload JSON selalu konsisten (`success`, `code`, `message`, `data`) sesuai harapan konsumen frontend dan DataTables AJAX.

---

### Kasus #18: Resolusi Tombol Hapus & Toggle SweetAlert2 Tanpa Aksi Endpoint (Inkompatibilitas result.isConfirmed pada SweetAlert2 v9.5.3)
* **Kategori**: Frontend JavaScript, SweetAlert2 Compatibility & Global Ajax Helpers
* **Gejala (Symptom)**:
  Saat pengguna mengklik tombol ikon Hapus (tempat sampah) pada tabel Tipe Paket atau Tarif Paket, dialog konfirmasi modal SweetAlert2 muncul. Namun ketika tombol "Ya, Hapus!" diklik, dialog tertutup tetapi data di tabel tidak terhapus dan di Network Tab browser sama sekali tidak ada pemanggilan endpoint AJAX DELETE ("tidak ada action endpointnya").
* **Akar Masalah (Root Cause)**:
  Versi library SweetAlert2 yang digunakan proyek (`public/plugins/sweet-alert2/sweetalert2.min.js`) adalah v9.5.3. Properti `result.isConfirmed` baru diperkenalkan pada SweetAlert2 v10+, sedangkan pada v9.5.3 nilai `result.isConfirmed` bernilai `undefined`. Penulisan logika kondisi `if (result.isConfirmed)` pada callback `.then((result) => ...)` otomatis dievaluasi sebagai `false`, sehingga pemanggilan `$.ajax` DELETE di dalamnya tidak pernah dieksekusi.
* **Solusi (Fix Applied)**:
  1. Mengganti kode AJAX manual pada tombol hapus di `package-type.js` dan `package-price.js` dengan helper global baku sistem `actionDelete(endpoint, id)` dari `public/js/apps/ajax.js`.
  2. Helper `actionDelete` secara native telah mendukung kompatibilitas versi ganda:
     ```javascript
     if (result.value == true || result.isConfirmed) {
         $.ajax({ url: getFullUrl(endpoint), type: 'DELETE', ... });
     }
     ```
  3. Memperbaiki event handler toggle switch status aktif pada kedua modul agar menggunakan `if (result.value === true || result.isConfirmed)`.
* **Pelajaran (Takeaway)**:
  Seluruh aksi penghapusan baris data pada sistem `adminShuttleV3` wajib memanggil helper baku `actionDelete(endpoint, id)`. Hindari menulis implementasi `Swal.fire` manual untuk delete agar konsistensi penanganan event SweetAlert2, CSRF token, notifikasi toast, dan reload DataTables terjaga secara seragam di seluruh modul.

---

### Kasus #19: Resolusi Kebocoran Z-Index Select2 dari Partial Modal ke Sidebar Kirim Paket & Sudut Bulat Input-Group ber-Input Hidden
* **Kategori**: Frontend CSS / Z-Index Stacking Context Isolation & Input-Group Pill Radius
* **Gejala (Symptom)**:
  1. Pada halaman Kirim Paket (`/packages`), saat sidebar dibuka pada layar laptop, kartu `KEBERANGKATAN`, judul label, dan input tanggal tertutup di belakang sidebar, tetapi **hanya** 2 elemen dropdown *Select2* (`Pilih Outlet Asal` dan `Pilih Outlet Tujuan`) yang menembus dan melayang di atas sidebar. Sementara di halaman Tiket hal ini tidak terjadi.
  2. Pada halaman Tiket (`/ticket-transactions`), tombol cari jadwal (`#btn-search-schedule`) di sebelah kanan input tanggal berbentuk kotak siku-siku (`border-radius: 0`), padahal seharusnya membulat (*pill*).
* **Akar Masalah (Root Cause)**:
  1. Halaman Kirim Paket meng-include partial `resources/views/apps/trip-management/partials/modal-plan.blade.php` yang di dalamnya memiliki aturan CSS tanpa scope `#modal-plan`: `.select2-container { z-index: 1060 !important; }`. Akibatnya seluruh `.select2-container` di halaman utama ikut terdongkrak ke `z-index: 1060` (melampaui `.left-sidenav` yang bernilai `1045`).
  2. Pada `search-section.blade.php` di menu Tiket, di dalam `<div class="input-group mb-1">` terdapat elemen ke-3 `<input type="hidden" id="latest_schedule">` setelah `<button id="btn-search-schedule">`. Akibatnya tombol tersebut dianggap `:not(:last-child)` dan terkena aturan `.input-group > :not(:first-child):not(:last-child) { border-radius: 0 !important; }` di `custom.css`.
* **Solusi (Fix Applied)**:
  1. Di [modal-plan.blade.php](file:///c:/Users/ASUS/Documents/Web%20Dev/sunjaya/Roleback/adminShuttleV3/resources/views/apps/trip-management/partials/modal-plan.blade.php#L4-L6), tambahkan scope `#modal-plan .select2-container { z-index: 1060 !important; }` dan pertahankan `.left-sidenav` sebagai overlay murni (`z-index: 1045 !important; background-color: #ffffff !important;`) tanpa mendorong `.page-wrapper`.
  2. Di [custom.css](file:///c:/Users/ASUS/Documents/Web%20Dev/sunjaya/Roleback/adminShuttleV3/public/css/assets/custom.css#L1539-L1555), tambahkan selector `.input-group > .btn:has(+ input[type="hidden"]:last-child)` dan `.input-group > .rounded-left-null` agar tetap mendapatkan sudut kanan bulat `50rem` tanpa menyentuh file Blade milik Hendris.
* **Pelajaran (Takeaway)**:
  Setiap tag `<style>` di dalam partial modal (`modal-*.blade.php`) **WAJIB** menggunakan prefix ID modal (`#modal-id ...`) pada seluruh selector-nya agar tidak membocorkan `z-index` atau properti layout ke halaman induk yang meng-include partial tersebut.

---

### Kasus #20: Resolusi Nilai NULL pada v_package_transactions (depart_at_main) & Arsitektur Multi-Sheet Export Excel Manifest
* **Kategori**: Database Views, Data Consistency, & Multi-Sheet Excel Streaming
* **Gejala (Symptom)**:
  1. Data transaksi paket lama pada basis data tidak muncul saat di-query melalui view `v_package_transactions` berdasarkan tanggal keberangkatan karena kolom `depart_at_main` pada tabel `package_transactions` bernilai `NULL`.
  2. Hasil ekspor spreadsheet Excel detail manifest sebelumnya menggabungkan tabel biaya operasional (8 kolom) dengan ringkasan laba kotor dan laba bersih di bagian bawah Sheet 3, sehingga kurang rapi dan membatasi analisis keuangan trip.
  3. Form modal Atur Rencana Jadwal mengunci field supir atau armada saat staf loket hanya ingin memperbarui biaya operasional, sehingga staf harus bolak-balik membuka modal dalam beberapa mode berbeda.
* **Akar Masalah (Root Cause)**:
  1. DDL view `v_package_transactions` melakukan pengelompokan `GROUP BY t.tripcode, t.depart_at_main`. Pada alur penyimpanan legacy `PackageTransactionService::store` dan `mutatePackage`, kolom `depart_at_main` dan `etd_main` tidak disertakan dalam array insert/update (hanya `depart_at` dan `etd`), sehingga nilainya tersimpan `NULL` di MySQL.
  2. Sheet 3 Excel menampung 2 entitas data yang berbeda (rincian item biaya trip vs rekapitulasi finansial akumulatif).
  3. `applyPlanModalMode` di JavaScript menerapkan disabling selektif berdasarkan mode yang diklik (`vehicle`, `driver`, `cost`).
* **Solusi (Fix Applied)**:
  1. Di `PackageTransactionService.php`, tambahkan `'depart_at_main' => $departYmd` dan `'etd_main' => $etdFull` pada metode `store()` dan `mutatePackage()`.
  2. Di `ManifestService.php` (`getDataTables` dan `exportAllExcel`), terapkan query fallback cerdas: query ke `v_package_transactions` terlebih dahulu, jika null/kosong fallback langsung query agregasi ke tabel fisik `package_transactions` dengan filter `DATE(depart_at)`.
  3. Di `ManifestExportService.php`, buat lembar kerja terpisah Sheet 4 (`RINGKASAN PENDAPATAN`) untuk ringkasan pendapatan kotor tiket + paket, rincian biaya operasional, dan laba bersih trip secara terstruktur 5 kolom, sementara Sheet 3 difokuskan murni untuk 8 kolom rincian biaya operasional.
  4. Di `detail.blade.php`, pusatkan 1 tombol `DOWNLOAD EXCEL` dan 1 tombol `UPDATE BIAYA PERJALANAN` di Card 1 Informasi Jadwal, hapus tombol duplikat di Card 2, 3, dan 4. Di `manifest-detail.js`, ubah `applyPlanModalMode` untuk membuka seluruh field formulir (armada, supir, kartu tol, status perjalanan, dan biaya) secara aktif (tanpa disabled) dengan mode `'all'`.
* **Pelajaran (Takeaway)**:
  Selalu sediakan fallback query langsung ke tabel fisik ketika mengonsumsi Database View yang bergantung pada kolom sekunder yang berpotensi `NULL` pada data historis. Pemisahan entitas data ke dalam lembar kerja (*worksheet*) tersendiri pada ekspor Excel menghasilkan laporan yang jauh lebih profesional dan mudah diaudit oleh tim akuntansi.

---

### Kasus #21: Penyelarasan Siklus Hidup Status Transaksi Paket (prepared -> scheduled -> departed -> finished) & Kontras Aksesibilitas Aksi Pengambilan Paket
* **Kategori**: Lifecycle State Synchronization, Data Consistency & UI Contrast Accessibility
* **Gejala (Symptom)**:
  1. Pada menu Pengambilan Paket (`/packages/takings`), paket tetap berstatus `SCHEDULED` meskipun manifest perjalanan sudah dicetak dan berstatus `DEPARTED` pada Daftar Manifest.
  2. Tombol aksi `[BELUM CHECKIN]` di kolom aksi pengambilan paket terlihat pudar, buram, dan kontrasnya rendah, sulit dibaca oleh staf operasional.
* **Akar Masalah (Root Cause)**:
  1. Di `PackageCheckinRepository::printManifest()`, query pembaruan status transaksi utama memiliki filter kaku: `PackageTransaction::where('id', $fwd->package_transaction_id)->where('transaction_status', 'prepared')->update(['transaction_status' => 'departed'])`. Karena transaksi paket dibuat berstatus `'scheduled'`, query `where('transaction_status', 'prepared')` menghasilkan 0 baris ter-update, sehingga `package_transactions` tetap tertinggal sebagai `'scheduled'` sementara `forward_status` sudah `'departed'`.
  2. Di `public/js/apps/package/package-taking.js`, tombol aksi dirender menggunakan `<button type="button" disabled class="btn btn-warning text-dark ...">`. Efek CSS bawaan Bootstrap 5 `.disabled` memberikan `opacity: 0.65`, menyebabkan teks gelap di atas latar kuning menjadi pudar/buram dan melanggar standar kontras rasio WCAG AA.
* **Solusi (Fix Applied)**:
  1. Di `PackageCheckinRepository::printManifest()`, ubah pencarian paket menjadi `whereIn('forward_status', ['prepared', 'scheduled'])` dan pembaruan `transaction_status` menjadi `whereIn('transaction_status', ['prepared', 'scheduled'])->update(['transaction_status' => 'departed'])`.
  2. Di `PackageTransactionService::store()`, terapkan logika: jika trip belum memiliki manifest armada & supir atau mode "Titip Loket", status awal adalah `'prepared'`. Jika manifest armada & supir sudah lengkap, status awal adalah `'scheduled'`.
  3. Di `SchedulePlanService` dan `ManifestService`, saat armada dan supir ditugaskan pada suatu trip dan tanggal, otomatis transisikan seluruh paket `'prepared'` pada trip tersebut menjadi `'scheduled'` dan catat riwayat pelacakan `PackageTracking`.
  4. Di `package-taking.js`, ubah tombol disabled menjadi badge status solid beralas amber terang berteks cokelat gelap dengan kontras rasio 5.9:1 (`style="background-color: #ffedd5; color: #9a3412; border: 1px solid #fdba74; font-weight: 700;"`) yang tajam dan ramah keterbacaan (*WCAG AA compliant*). Serta terjemahkan label status paket menjadi istilah bisnis yang bersih (`TERJADWAL`, `DISIAPKAN`).
* **Pelajaran (Takeaway)**:
  Dalam sistem logistik multi-tabel (`package_transactions` dan `package_transaction_forwards`), setiap transisi state wajib bersifat inklusif terhadap seluruh kemungkinan status hulu yang valid (`whereIn(['prepared', 'scheduled'])`) agar status transaksi utama tidak tertinggal dari status pergerakan fisik barang (*forward status*).

---

### Kasus #22: Validasi Batas Waktu Keberangkatan & Penyaringan Jadwal Lampau pada Modul Kirim Paket
* **Kategori**: Departure Cut-off Validation, Business Logic & Schedule UI Filtering
* **Gejala (Symptom)**:
  1. Staf loket dapat mengklik dan memesan jadwal keberangkatan yang jamnya telah lewat dari waktu operasional saat ini (`departureDateTime <= now()`), sehingga ada risiko paket tercatat pada armada yang jam operasionalnya sudah berlalu.
  2. Transaksi via panggilan API langsung (fetch/network request) pada jadwal yang jamnya telah lewat tetap diproses dan tersimpan ke basis data.
* **Akar Masalah (Root Cause)**:
  1. Pada `mapMicroserviceInventories` dan `PackageTransactionRepository::getSchedules`, belum ada flag penanda `is_expired` untuk jadwal yang jam keberangkatannya telah lewat dari waktu saat ini pada tanggal hari ini (atau untuk tanggal lampau).
  2. Pada `PackageTransactionService::store()`, belum ada pengaman validasi waktu keberangkatan penuh (`Carbon::parse($departYmd . ' ' . $schedEtd)->isPast()`), sehingga pemesanan pada jam yang sudah lewat tetap lolos.
* **Solusi (Fix Applied)**:
  1. Di `PackageTransactionService::mapMicroserviceInventories` dan `PackageTransactionRepository::getSchedules`, tambahkan atribut reaktif `'is_expired'` bernilai `true` jika jadwal telah lewat dari jam operasional saat ini.
  2. Di `package-order.js`, jadwal yang `is_expired: true` ditampilkan dengan gaya visual abu-abu garis putus-putus (`border: 1px dashed #cbd5e1; background-color: #f8fafc; opacity: 0.65; cursor: not-allowed;`) disertai badge `LEWAT JAM`. Event klik pada jadwal lampau memunculkan notifikasi Toast peringatan dan mencegah pemilihan jadwal, mencegah pembukaan modal manifest, dan mengunci form pemesanan.
  3. Di `PackageTransactionService::store()`, tambahkan pengaman validasi batas jam keberangkatan: jika jadwal yang dipesan telah lewat dari waktu saat ini, sistem mengembalikan respon 422 dengan pesan bisnis yang ramah: *"Jadwal keberangkatan ini telah lewat dari jam operasional ([Jam]) dan tidak dapat dipesan lagi. Silakan pilih jadwal berikutnya atau aktifkan Titip Loket (Tanpa Jadwal)."*
* **Pelajaran (Takeaway)**:
  Penyaringan jadwal di frontend WAJIB selalu diimbangi dengan validasi waktu ketat di layer Service backend. Hal ini menjamin integritas data operasional tetap terlindungi dari manipulasi payload jaringan maupun ketidaksengajaan staf loket.

---

### Kasus #23: Standarisasi Bahasa Hari Database (`days_used` English Standard) vs. Lokalisasi Antarmuka (Indonesian UI) pada Modul Promosi
* **Kategori**: Database Schema Consistency, Data Normalization & Form UI Localization
* **Gejala (Symptom)**:
  1. Pada form pembuatan Promo Tiket dan Promo Paket, nilai checkbox hari berlaku yang terkirim ke server adalah string Bahasa Indonesia (`Senin`, `Selasa`, dst.). Akibatnya kolom `days_used` pada tabel `promotions` dan `package_promotions` tersimpan sebagai array JSON Bahasa Indonesia (`["Senin", "Selasa", ...]`).
  2. Saat fungsi helper baku sistem `id_day($days)` memproses data hari untuk dicocokkan atau ditampilkan, terjadi inkonsistensi karena `id_day()` secara baku mengharapkan nama hari dalam Bahasa Inggris (`Monday`, `Tuesday`, dll) sesuai arsitektur legacy Sunjaya.
* **Akar Masalah (Root Cause)**:
  1. Pada `resources/views/apps/promotion/form.blade.php` dan `promotion-package/form.blade.php`, variabel `$allDays` di-hardcode menggunakan Bahasa Indonesia `['Senin', 'Selasa', ...]`, dan atribut `value` input checkbox diisi nama hari lokal tersebut.
  2. Pada `PromotionService::formatPayload` dan `PackagePromotionService::formatPayload`, nilai fallback default `days_used` juga di-hardcode `['Senin','Selasa','Rabu','Kamis','Jumat','Sabtu','Minggu']` tanpa ada layer normalisasi ke Bahasa Inggris.
* **Solusi (Fix Applied)**:
  1. Di `resources/views/apps/promotion/form.blade.php` dan `promotion-package/form.blade.php`, ganti perulangan checkbox hari menggunakan helper resmi `days()`: atribut `value` menggunakan `$day['id']` (`Monday`, `Tuesday`, dst.), label tampilan menggunakan `$day['name']` (`Senin`, `Selasa`, dst.), dan pengecekan centang mendukung backward-compatibility (`in_array($day['id'], $selectedDays) || in_array($day['name'], $selectedDays)`).
  2. Di `PromotionService` dan `PackagePromotionService`, buat method normalizer `normalizeDaysToEnglish(?array $days)` yang otomatis memetakan input hari Bahasa Indonesia maupun Inggris ke standar Bahasa Inggris murni (`Monday` s.d `Sunday`) sebelum disimpan ke database.
  3. Di halaman detail (`detail.blade.php`) promo tiket dan promo paket, lakukan penerjemahan array hari Inggris ke Bahasa Indonesia saat ditampilkan kepada staf operasional.
* **Pelajaran (Takeaway)**:
  Sesuai standar arsitektur Sunjaya, seluruh nilai data tersimpan di basis data (*storage layer*) WAJIB menggunakan Bahasa Inggris baku. Sedangkan lokalisasi Bahasa Indonesia HANYA diterapkan pada lapisan penyajian (*UI display layer*).

---

### Kasus #24: Pencarian Cepat Berdasarkan Nomor Manifest / Tripcode & Jendela Modal Baris Data pada Menu Kirim Paket
* **Kategori**: Search & Query Optimization, Modal Table UI Interaction & Sunjaya Parity
* **Gejala (Symptom)**:
  1. Input pencarian cepat di menu Kirim Paket (`#input-search-bookcode`) tidak dapat menemukan transaksi jika staf memasukkan Nomor Manifest (misal: `MSNA261109QOV4`) atau `tripcode`, dan langsung memunculkan toast "Data paket tidak ditemukan".
  2. Jika pencarian menemukan 1 data paket, sistem langsung melompati modal tabel dan membuka modal detail paket, berbeda dengan pengalaman pengguna di menu reservasi tiket di mana pencarian selalu menampilkan tabel baris data (*modal row data*) untuk ditinjau terlebih dahulu.
* **Akar Masalah (Root Cause)**:
  1. Di `PackageTransactionRepository::searchTransactions()`, query pencarian hanya memfilter kolom `booking_code`, `orderer_name`, `orderer_phone`, dan relasi `person`. Kolom `tripcode` dan relasi subquery ke tabel `manifests` belum disertakan.
  2. Di `public/js/apps/package/package-order.js` pada fungsi `executeQuickBookingSearch()`, terdapat kondisi `if (res.data.length === 1) { openPackageDetailModal(...) }` yang membypass kemunculan jendela modal daftar paket.
* **Solusi (Fix Applied)**:
  1. Di `PackageTransactionRepository::searchTransactions()`, tambahkan klausa pencarian `tripcode`, subquery `whereExists` ke tabel `manifests` yang berelasi via `tripcode` dan tanggal keberangkatan (`depart_at` / `depart_at_main`), serta pencarian terusan paket `forward_code`.
  2. Di `PackageTransactionService::formatPackageSummary()`, tambahkan atribut `'tripcode'` dan `'manifest_code'` yang ditarik dari manifest terkait.
  3. Di `resources/views/apps/package/order/index.blade.php`, tambahkan kolom header `No Manifest / Tripcode` pada modal `#modal-package-list` dan perbarui placeholder input pencarian.
  4. Di `package-order.js`, hapus bypass single-result pada `executeQuickBookingSearch()` sehingga pencarian selalu menampilkan modal tabel baris data (`#modal-package-list`) yang memuat data secara lengkap, dan setiap baris dapat diklik untuk membuka detail transaksi.
* **Pelajaran (Takeaway)**:
  Pencarian operasional loket harus mencerminkan seluruh nomor identitas yang dipegang oleh staf (kode booking, surat jalan / manifest, kode trip, nama, dan no telepon) dalam satu kotak pencarian tunggal yang fleksibel dan menyajikan hasil dalam format tabel tabular yang terstruktur.

---

### Kasus #25: Resolusi Undefined Constant STYLE_FOOTER_GREEN_CENTER pada FastXlsxWriter & Kebocoran CSS Select2 Optgroup dari Partial Modal
* **Kategori**: Excel OpenXML Stylesheet Indexing & Select2 Optgroup CSS Specificity
* **Gejala (Symptom)**:
  1. Saat mengunduh file Excel pada Detail Manifest (`/trip-managements/manifests/export/{manifest_code}`), muncul `Error 500: Undefined constant App\Services\Report\FastXlsxWriter::STYLE_FOOTER_GREEN_CENTER` di `ManifestExportService.php:598`.
  2. Pada menu Kirim Paket (`/packages`), tampilan dropdown *Select2* (`Outlet Asal` & `Outlet Tujuan`) tampak berbeda dengan menu Tiket: judul grup kota (`BALIKPAPAN`, `CIREBON`) terdorong ke kanan sejajar dengan nama outlet anaknya (`BALIKPAPAN BANDARA (SAM)`, `CIPERNA (CPN)`) sehingga hierarki indentasi hilang, serta kotak dropdown memiliki border/shadow yang berbeda.
* **Akar Masalah (Root Cause)**:
  1. Di `ManifestExportService.php` baris 598 dan 600, baris footer rekapitulasi memanggil `FastXlsxWriter::STYLE_FOOTER_GREEN_CENTER`, namun di `FastXlsxWriter.php` baru tersedia `STYLE_FOOTER_GREEN_RIGHT = 36` dan `STYLE_FOOTER_DEC_CENTER = 37`.
  2. Halaman Kirim Paket (`resources/views/apps/package/order/index.blade.php`) meng-include partial `resources/views/apps/trip-management/partials/modal-plan.blade.php` yang di dalamnya terdapat aturan CSS global tanpa scope: `.select2-results__option { font-size: 11.5px !important; padding: 6px 10px !important; }` dan `.select2-container--open .select2-dropdown { ... !important; }`. Penggunaan `!important` pada `.select2-results__option` menimpa aturan bawaan `select2.min.css` yaitu `.select2-results__option[role=group] { padding: 0; }` dan `.select2-results__option .select2-results__option { padding-left: 1em; }`. Karena elemen `<optgroup>` di DOM Select2 dirender sebagai `<li class="select2-results__option" role="group">`, pemberian padding `!important` pada `.select2-results__option` membuat grup induk ikut terdorong ke kanan dan menghilangkan indentasi anak opsi.
* **Solusi (Fix Applied)**:
  1. Di `app/Services/Report/FastXlsxWriter.php`, tambahkan konstanta `public const STYLE_FOOTER_GREEN_CENTER = 38;`, tingkatkan `<cellXfs count="39">`, tambahkan blok XML `<xf>` indeks ke-38 (Bold Green `fontId="7"`, Gray `fillId="6"`, `borderId="1"`, rata tengah), serta perbarui batas pengecekan `$isMergedFooterLabel` pada baris 213.
  2. Di `resources/views/apps/trip-management/partials/modal-plan.blade.php` dan `resources/views/apps/package/order/index.blade.php`, hapus override CSS global pada `.select2-results__option` dan `.select2-dropdown` sehingga Kirim Paket menggunakan aturan CSS bawaan `select2.min.css`, `app.min.css`, dan `custom.css` yang 100% identik dengan menu Tiket.
* **Pelajaran (Takeaway)**:
  Jangan pernah menerapkan `padding: ... !important` secara global pada `.select2-results__option` karena di dalam DOM Select2, pembungkus `<optgroup>` (`role="group"`) juga menggunakan class `.select2-results__option`. Menimpanya dengan `!important` akan merusak `padding: 0` pada grup induk dan menghancurkan hierarki indentasi antara nama kota dan daftar outlet di bawahnya.

---

### Kasus #26: Alur Penjadwalan Paket Titip Loket (`tripcode = NULL`) ke Jadwal & Sinkronisasi Manifest 2-Tahap
* **Kategori**: Package Logistics State Machine, Manifest Synchronization & Reusable UI Partial
* **Gejala (Symptom)**:
  1. Ketika transaksi paket dibuat menggunakan opsi **Titip Loket (Tanpa Jadwal)**, paket tersimpan dengan `tripcode = NULL` dan `transaction_status = 'prepared'`. Staf loket memerlukan akses cepat untuk menjadwalkan paket tersebut baik dari daftar `PAKET BELUM TERJADWAL` di `/packages` maupun dari halaman Detail Transaksi Paket (`/packages/data/{id}`).
  2. Sebelumnya, fungsi `PackageTransactionService::mutatePackage()` langsung mengubah `transaction_status` menjadi `'scheduled'` meskipun jadwal tujuan belum memiliki armada dan supir di tabel `manifests`. Akibatnya, saat armada dan supir ditugaskan belakangan melalui `SchedulePlanService::saveManifest()`, fungsi `syncPackagesToScheduled()` yang memfilter `where('transaction_status', 'prepared')` melewati paket hasil mutasi tersebut dan tidak mencatat riwayat tracking penugasan manifest.
  3. Pada halaman Detail Transaksi Paket (`/packages/data/{id}`), kartu **INFO MOBIL & SUPIR** memanggil `$manifest?->vehicle?->name` dan `$manifest?->vehicle?->plat_nomor` yang selalu menghasilkan `'-'` karena kolom resmi pada tabel `vehicles` adalah `number_plate`, `code`, dan relasi `layout->name`.
* **Akar Masalah (Root Cause)**:
  1. `mutatePackage()` tidak mengecek apakah jadwal tujuan (`tripcode` + `depart_at`) sudah memiliki manifest dengan `vehicle_list_id > 0` dan `driver_id > 0` sebelum menentukan `transaction_status`.
  2. Pada `formatPackageSummary()`, atribut `'from'` dan `'to'` mengambil `$trx->from` / `$trx->to` tanpa fallback ke kolom resmi `$trx->depart` / `$trx->arrival`.
  3. Di `PackageTransactionRepository::getSchedules()` (fallback lokal saat API microservice offline), variabel `$nowDate` belum didefinisikan sebelum digunakan pada pengecekan `is_expired`.
* **Solusi (Fix Applied)**:
  1. Di `PackageTransactionService::mutatePackage()`, periksa keberadaan manifest aktif (`vehicle_list_id > 0` dan `driver_id > 0`) pada jadwal tujuan: jika armada & supir sudah ditugaskan, set `transaction_status = 'scheduled'`; jika belum, set `transaction_status = 'prepared'` agar otomatis berubah menjadi `'scheduled'` beserta log tracking saat armada & supir ditugaskan di `SchedulePlanService::syncPackagesToScheduled()`.
  2. Ekstrak modal penjadwalan/mutasi paket ke partial reusable `resources/views/apps/package/partials/modal-mutation.blade.php` dan gunakan bersama di `resources/views/apps/package/order/index.blade.php` serta `resources/views/apps/package/data/detail.blade.php`.
  3. Tambahkan tombol aksi cepat **Atur Jadwal** pada tabel `PAKET BELUM TERJADWAL` (`#modal-package-list`), modal rincian paket (`#modal-package-detail`), dan halaman `/packages/data/{id}`, serta perbaiki tampilan `No. Manifest`, `Tipe Kendaraan` (`$manifest?->vehicle?->layout?->name`), dan `Plat Nomor` (`$manifest?->vehicle?->number_plate`).
* **Pelajaran (Takeaway)**:
  Status transaksi paket (`prepared` vs `scheduled`) wajib selalu mencerminkan ketersediaan riil penugasan armada & supir pada tabel `manifests`, baik saat paket dibuat langsung pada jadwal maupun saat paket Titip Loket dimasukkan ke jadwal keberangkatan.

---

### Kasus #27: Pembatasan Pencarian 2 Bulan, Auto-Sync Keberangkatan & Jadwal Saat Search, dan Validasi Telepon Standar Internasional (ITU-T E.164)
* **Kategori**: Search Filtering, Workspace Synchronization & Input Validation (ITU-T E.164)
* **Gejala (Symptom)**:
  1. Pencarian cepat pada menu Kirim Paket (`/packages`) menarik data tanpa batas tanggal historis dan hanya mencocokkan nomor telepon mentah (sehingga pencarian `08...` tidak mencocokkan penyimpanan `628...`).
  2. Ketika baris hasil pencarian dipilih, panel **KEBERANGKATAN** (`Outlet Asal`, `Outlet Tujuan`, `Tanggal`), **INFORMASI JADWAL** (`tripcode` aktif + scroll kartu jadwal), serta **DATA KEBERANGKATAN** & **DATA PAKET DI JADWAL INI** tidak ikut diset otomatis.
  3. Input `sender_phone` dan `recipient_phone` tidak memiliki batas panjang karakter maupun validasi standar internasional, sehingga kasir dapat mengisi nomor terlalu panjang (> 20 digit).
* **Akar Masalah (Root Cause)**:
  1. `PackageTransactionRepository::searchTransactions()` belum memfilter `created_at >= now()->subMonths(2)` dan belum membangun varian format telepon (`0...`, `62...`, `+62...`).
  2. `package-order.js` langsung membuka `#modal-package-detail` saat klik hasil modal pencarian tanpa fungsi sinkronisasi state `#depart`, `#arrival`, `#date`, dan `#departure-schedule`, serta `searchSchedules()` tidak memiliki fallback `include_tripcode` untuk jadwal yang jamnya telah berlalu hari ini.
  3. `order/index.blade.php` belum membatasi `maxlength` input telepon, `PackageTransactionStoreRequest` masih memakai `max:25`, dan `PackageTransactionService::normalizePhone62()` selalu menempelkan awalan `62` meskipun input memakai `+` kode negara lain.
* **Solusi (Fix Applied)**:
  1. Batasi `searchTransactions()` maksimal 2 bulan ke belakang (`Carbon::now($tz)->subMonths(2)->startOfDay()`) dan dukung pencarian telepon lintas format (`0...`, `62...`, `+62...`) serta `ptf.trip_code`.
  2. Tambahkan `syncWorkspaceWithPackage(pkg)` dan `selectPackageFromListModal()` di `package-order.js` beserta parameter `include_tripcode` di `PackageTransactionService::searchSchedules()` dan `PackageTransactionRepository::getSchedules()` agar `Outlet Asal`, `Outlet Tujuan`, `Tanggal`, `INFORMASI JADWAL` (dengan scroll otomatis ke kartu jadwal), `DATA KEBERANGKATAN`, dan `DATA PAKET DI JADWAL INI` otomatis ter-set.
  3. Terapkan standar internasional **ITU-T E.164 (8–15 digit)** pada frontend (`sanitizeInternationalPhoneInput()`, `validateInternationalPhoneField()`, `maxlength="16"`, mendukung `+` di awal maupun format lokal `0...` maks 14 digit) dan backend (`PackageTransactionStoreRequest.php` + perbaikan `normalizePhone62()` untuk nomor negara asing berawalan `+`).
  4. Aktifkan DataTables Bahasa Indonesia pada `#modal-package-list` (`'datatables' => true`, `Showing entri`, kotak `Cari:`, `scrollX: true`, batas hasil search dinaikkan ke `limit(200)`), adopsi kolom bernilai tambah (`Tgl. Transaksi`, `Service`, `Remark`, `Operator Pembuat & Pembayaran`, `Tgl. Bayar`) dalam format padat 2 baris per sel (menghapus duplikat `TANGGAL DIBUAT`), hapus tombol pin jadwal pada kolom `Aksi`, serta jalankan `syncWorkspaceWithPackage()` otomatis baik saat hasil tunggal/satu manifest maupun saat klik baris.
* **Pelajaran (Takeaway)**:
  Validasi nomor telepon harus menegakkan batas internasional ITU-T E.164 (8–15 digit) tanpa memblokir kebiasaan staf loket mengetik awalan lokal `08...`, sekaligus menjaga kode negara asing yang diawali `+`.

---

### Kasus #28: Autocomplete Nomor Telepon & Nama Pengirim/Penerima (MySQL Strict Mode Safe) & Pemisahan Kolom Status/Pembayaran Modal Search
* **Kategori**: UX Efficiency, Autocomplete Search & UI Column Readability
* **Gejala (Symptom)**:
  1. Pada modal hasil pencarian (`#modal-package-list`), kolom `Status & Bayar` tergabung menjadi 1 sel sehingga kasir menginginkan pemisahan antara kolom **Status** dan **Pembayaran**.
  2. Pada form Kirim Paket (`/packages`), kasir harus mengetik manual berulang kali nomor telepon dan nama pelanggan tetap (pengirim/penerima), berbeda dengan pengalaman autocomplete nomor telepon di sistem referensi lama.
* **Akar Masalah (Root Cause)**:
  1. Di sistem referensi lama (`admin-sunjaya-dev`), `suggestPhone()` melanggar arsitektur 4-layer (memanggil `DB::table` langsung di Controller), menggunakan `groupBy('sender_phone')` tanpa agregasi yang error di MySQL 8 `ONLY_FULL_GROUP_BY` serta salah kolom saat `type=receiver`, hanya mencari prefix `convert_phone_number()` dengan tanda `+`, dan mengosongkan input nama saat hasil kosong.
  2. `#modal-package-list` menggabungkan badge status transaksi dan status bayar dalam 1 kolom.
* **Solusi (Fix Applied)**:
  1. Pisahkan kolom `Status` (badge status transaksi) dan `Pembayaran` (badge status pembayaran + metode pembayaran di baris ke-2) di `resources/views/apps/package/order/index.blade.php` dan `public/js/apps/package/package-order.js` (13 kolom ringkas 2 baris).
  2. Bangun endpoint modular 4-layer `GET packages/suggest-person` (`routes/partials/package.php` -> `PackageTransactionController::suggestPerson()` -> `PackageTransactionService::suggestPerson()` -> `PackageTransactionRepository::suggestPersonByPhone()`) yang aman di MySQL Strict Mode, mencocokkan awalan lintas format (`08...`, `628...`, `+628...`), dan melakukan deduplikasi berdasarkan nomor telepon dari transaksi terbaru.
  3. Tambahkan helper `initPhoneAutocompletes()` dan `bindPhoneAutocomplete()` berbasis jQuery UI `.autocomplete()` pada `#sender_phone` dan `#recipient_phone` (`minLength: 4`), lengkap dengan styling `.ui-autocomplete`, pengisian otomatis nama + alamat tanpa menghapus nama yang sedang diketik apabila belum ada riwayat, serta sinkronisasi validator E.164.
* **Pelajaran (Takeaway)**:
  Autocomplete histori pelanggan harus selalu mendukung pencarian lintas format (`08...` vs `628...`), aman dari error `ONLY_FULL_GROUP_BY`, tidak menghapus ketikan nama baru ketika saran kosong, dan memisahkan lingkup pengisian Pengirim vs Penerima secara independen.

---

### Kasus #29: Penyelarasan Real-Time `ETD` Lock (Print Manifest, Cancel, Mutasi, Check-in Outlet Asal), Eliminasi Hardcode `Asia/Makassar` & Audit Skenario Celah Lintas-Menu
* **Kategori**: State-Machine Integrity, Operational Timezone Consistency & Multi-Menu Guard
* **Gejala (Symptom)**:
  1. Cetak manifest lebih awal sebelum jam keberangkatan (misal cetak jam `14:00` untuk jadwal `16:00`) di `PackageCheckinRepository::getManifestDataForPrint()` langsung memaksa `manifests.status = 'departed'` dan mengubah seluruh paket ke `departed`, sehingga pesanan tambahan jam `15:00` atau pembatalan jam `15:30` ikut terblokir meskipun armada belum berangkat.
  2. Paket berstatus `scheduled` tidak bisa dibatalkan oleh `PackageDataRepository::cancelTransaction()` (hanya mengizinkan `['registered', 'unregistered', 'booked', 'prepared']`), `PackageDataService` membatasi `can_cancel` hanya `['registered', 'unregistered']`, `forward_status` tidak ikut diubah menjadi `'canceled'`, dan tombol `CHECKIN` disembunyikan pada status `scheduled`.
  3. Tombol & konfirmasi Check-in pada `detail.blade.php`, `package-order.js`, `package-data.js`, dan `package-checkin.js` menyebut `"Check-in Paket Tiba"` / `"outlet tujuan"` padahal operasional check-in fisik terjadi di outlet asal keberangkatan (`departed`).
  4. `ManifestService::updatePlan()` membuat remark `SCHEDULED` berulang saat update biaya manifest, `ManifestService::updateCrew()` belum menyinkronkan status `prepared -> scheduled`, serta pergantian mobil/supir manifest tidak meninggalkan log audit pada paket aktif.
  5. `PackageDataRepository` meng-hardcode `'Asia/Makassar'` sementara modul lain memakai `config('app.timezone')` (`Asia/Jakarta`), dan transaksi `booked` (`QR`/`MERCHANT`) yang melewati `expired_at` maupun dilunasi di loket belum otomatis menyelaraskan `transaction_status` + `forward_status` + tracking.
* **Akar Masalah (Root Cause)**:
  Logika kelayakan aksi (`can_cancel`, `can_mutate`, `can_checkin`, `can_pay`), guard `ETD` keberangkatan, dan sinkronisasi kru manifest tersebar dan terduplikasi secara tidak konsisten di beberapa Service, Repository, View Blade, dan file JS.
* **Solusi (Fix Applied)**:
  1. Bangun Single Source of Truth `App\Support\PackageStatusGuard` untuk evaluasi real-time `canCancel()`, `canMutate()`, `canCheckin()` (khusus petugas outlet asal atau `OFC`), `canPay()`, pengecekan batas jam keberangkatan `hasPassedDeparture()` berbasis `config('app.timezone')`, serta `syncManifestCrewPackages()` (anti-duplikat `SCHEDULED` + log audit pergantian armada/supir).
  2. Terapkan `PackageStatusGuard` seragam di `PackageTransactionService`, `PackageDataService`, `PackageDataRepository` (mengembalikan saldo agen bila `SALDO` & memperbarui `forward_status = 'canceled'`), `ManifestService` (`updatePlan` & `updateCrew`), `SchedulePlanService`, dan `detail.blade.php` (termasuk membersihkan fallback `Tanggal Kadaluarsa` +4 jam untuk transaksi `paid`/`cod`).
  3. Perbarui `PackageCheckinRepository::getManifestDataForPrint()` agar cetak sebelum jam berangkat (`now() < ETD`) hanya menandai `print = 'y'`, dan baru memfinalisasi `departed` ketika jam keberangkatan (`ETD` manifest / forward) sudah masuk/lewat; luruskan seluruh redaksi UI ke **Check-in Paket Berangkat / Outlet Asal**; buat check-in tetap fleksibel untuk kondisi lupa check-in saat manifest sudah `departed` dengan log remark pembeda `"check-in berangkat susulan"`; ubah batas kadaluarsa pembayaran `QR` / `MERCHANT` menjadi **10 menit** disertai `expireOverdueBookedTransactions()` serta upgrade status `booked -> prepared/scheduled` pada `payCodTransaction()`.
  4. Hapus seluruh hardcode `'Asia/Makassar'` di `PackageDataRepository`, `PackageTransactionRepository`, `InformationInternal`, `helper.js::currentDate()`, serta `AGENTS.md` / `.agents/`, sekaligus mengunci kewajiban **Audit Skenario Celah Lapangan** pada setiap tahapan Review, Planning, Evaluasi, dan Fix-Bug di `AGENTS.md`, `00-core-guardrails.md`, `01-workflow-discipline.md`, dan `task-review-protocol.md`.
* **Pelajaran (Takeaway)**:
  Aturan penguncian transaksi (`Cancel`, `Mutasi`, `Order Baru`) dan cetak dokumen persiapan tidak boleh mematikan fleksibilitas loket sebelum `ETD` tiba, namun wajib terkunci serentak di seluruh layar begitu `now() >= ETD` atau paket fisik telah di-scan berangkat di outlet asal.
