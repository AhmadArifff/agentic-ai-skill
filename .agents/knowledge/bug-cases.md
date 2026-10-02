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


