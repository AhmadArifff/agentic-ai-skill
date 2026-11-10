---
description: Core Guardrails & Absolute Invariants for adminShuttleV3 (Always Loaded)
always_apply: true
---

# 00. Core Guardrails (Aturan Mutlak & Larangan Keras)

Dokumen ini memuat **invarian mutlak** yang wajib dipatuhi oleh setiap AI Agent dan pengembang tanpa pengecualian. Catatan: Istilah `.agent` dan `.agents` adalah identik dan merujuk pada direktori tata kelola yang sama.

---

## 1. Database & Migrasi (Zero-Direct-CRUD & Fallback Feedback Policy)
1. **Pemetaan Basis Data Sistem (`transport_system` vs `sunjaya_dev`)**:
   * **Sistem Saat Ini (`adminShuttleV3`)**: Beroperasi mutlak menggunakan database **`transport_system`**. Pengguna selalu menyediakan file dump skema terkininya di folder root sistem ini, yaitu **`transport_system-*.sql`** (misal: `transport_system-30-9-2026.sql`, `transport_system-01-10-2026.sql`).
   * **Sistem Acuan Legacy (`admin-sunjaya`)**: Menggunakan database **`sunjaya_dev`**. File dump skemanya disediakan di folder root sistem ini, yaitu **`sunjaya_dev_*.sql`** (misal: `sunjaya_dev_9-9-2026_cleaned.sql`).
   * **Kedua Berkas Dump SQL Sebagai Knowledge Ground-Truth**: AI wajib membaca berkas dump ini untuk memahami struktur tabel, relasi, tipe data, dan perbandingan logika tanpa perlu menebak-nebak atau bingung konteks basis data.
2. **Perlindungan Data & Zero-Direct-CRUD**:
   * **DILARANG KERAS** mengutak-atik atau menimpa data eksisting di database `transport_system`.
   * Baik dalam sesi review, development, maupun skrip di `scratch/`, AI **DILARANG KERAS** mengeksekusi query mutasi (`INSERT`, `UPDATE`, `DELETE`, `ALTER`) langsung ke database `transport_system`.
3. **Mekanisme Fallback Feedback Saat Data Tidak Tersedia**:
   * Jika saat development atau eksekusi ditemukan bahwa data pada tabel database `transport_system` **tidak tersedia / kosong** (misal: menu, role, permissions, master setting, rute, outlet):
     * AI **DILARANG KERAS** melakukan silent bypass atau membuat data mock tiruan di controller.
     * AI **WAJIB memberikan Fallback Feedback** secara transparan kepada pengguna.
     * AI **WAJIB menyediakan kueri SQL query manual** yang siap dieksekusi pengguna di **phpMyAdmin**.
4. **DILARANG KERAS Menjalankan Migrasi Otomatis**:
   * Dilarang menjalankan `php artisan migrate`, `migrate:fresh`, `migrate:rollback`, atau `migrate:reset`. Berkas migrasi hanya diperbarui sebagai sinkronisasi dokumentasi skema kode.
5. **Integritas Tabel `menus` & `permissions`**:
   * Dilarang menambah/mengubah baris `menus` atau `permissions` tanpa query SQL manual terverifikasi untuk phpMyAdmin.

---

## 2. Review Gate Sebelum Development (Human-in-the-Loop)
1. **Wajib Dimulai dari Review**:
   * Setiap pengembangan fitur baru, perbaikan bug tampilan, bug logika, maupun penambahan menu baru (misal: `schedule`/jadwal) **WAJIB dimulai dari Review Task terlebih dahulu**.
2. **Larangan Mulai Koding Tanpa Persetujuan**:
   * **DILARANG KERAS** membuat atau mengedit file aplikasi sebelum ada konfirmasi "setuju" secara eksplisit dari pengguna terhadap alur review yang diajukan.

---

## 3. Penyelarasan Sistem & Larangan Bypass (Security & Integrity)
1. **Prioritas Standar Internal `adminShuttleV3`**:
   * Lakukan komparasi dengan sistem acuan legacy (`admin-sunjaya`) pada aspek logic, data database, dan tampilan.
   * **Namun, utamakan mengadopsi pola dan komponen yang SUDAH ADA di `adminShuttleV3`** (seperti standar Laporan CSO, ReportExporter, layout card, dan komponen form yang telah teruji).
2. **DILARANG BYPASS PERMISSION & DATA**:
   * Dilarang melakukan bypass izin otorisasi (`permission('read')`, dll) atau membuat data tiruan (*mock dummy data*) di controller jika data belum ada di database.
   * Jika data/permission belum ada di database, sediakan query SQL manual agar pengguna menambahkannya ke phpMyAdmin.

---

## 4. Arsitektur & Lapisan Kode (Strict Layer Isolation)
1. **Controller ➔ Model**: **DILARANG KERAS**. Controller hanya boleh berkomunikasi dengan **Service**.
2. **Controller ➔ Repository**: **DILARANG KERAS**. Controller tidak boleh mem-bypass Service.
3. **Service ➔ Model / Query Builder**: **DILARANG**. Kueri database adalah tanggung jawab mutlak **Repository**.
4. **Repository ➔ Business Logic**: **DILARANG**. Repository hanya bertugas mengambil dan menyimpan data.

---

## 5. Kebijakan Penggunaan Playwright (On-Demand User Request Only)
1. **Hanya Digunakan Jika Diminta Eksplisit Oleh Pengguna**:
   * Penggunaan Playwright MCP atau otomasi browser **HANYA BOLEH DIJALANKAN JIKA PENGGUNA YANG MEMINTANYA SECARA EKSPLISIT** (misal: *"tolong tes pakai playwright"*, *"coba cek tampilan halaman ini dengan playwright"*).
   * Secara *default* (tanpa instruksi eksplisit dari pengguna), AI **DILARANG** menjalankan Playwright atau otomasi browser secara inisiatif sendiri.
2. **Kredensial Resmi Login Playwright**:
   * Ketika pengguna meminta pengujian Playwright, gunakan kredensial berikut untuk login ke sistem:
     * **Username**: `superahmad`
     * **Password**: `password123`
3. **Cakupan & Keamanan Pengujian**:
   * Digunakan untuk verifikasi visual, form input, inspeksi console error, dan memastikan tidak ada elemen yang tumpang tindih (*clipping*).
   * Dilarang mengeksekusi mutasi data berbahaya saat sesi browser.

---

## 6. Standar Komentar Kode Bersih & Anti-Slop (Clean Code Comments)
1. **DILARANG Menulis Komentar Banner Panjang Bertele-tele**:
   * Dilarang membuat blok komentar dekorasi ASCII besar yang memakan banyak baris (misal banner 5-10 baris).
   * Dilarang mencantumkan referensi aturan internal AI seperti `(RULESCODE.md - Bab X)` atau embel-embel generator AI ke dalam file kode produksi (`.css`, `.js`, `.php`, `.blade.php`).
2. **Komentar Ringkas, Fungsional & Ramah Tim Developer**:
   * Tulis komentar yang singkat (1–2 baris), lugas, dan menjelaskan *maksud/kegunaan* kode secara natural agar mudah dimengerti oleh sesama developer manusia di tim.
   * Jangan menjelaskan sintaks yang sudah jelas terlihat dari kodenya sendiri (*no redundant comments*).

---

## 7. Standar Bahasa UI: Bebas Jargon Teknis (Human-Friendly UI)
1. **DILARANG Memunculkan Detail Teknis Kode ke Pengguna**:
   * Label input, modal popup alert, notifikasi toast, dan form-text dilarang memuat jargon teknis internal seperti panjang karakter backend `(16 Karakter)`, mekanisme generator `random string 16 karakter acak`, atau istilah internal database/keamanan `disanitasi dari karakter injeksi`.
2. **Gunakan Istilah Umum & Bersih**:
   * Gunakan bahasa umum yang mudah dipahami manusia (contoh: cukup `Password :` bukan `Password (16 Karakter):`).

---

## 8. Eliminasi Dead Code & Sisa Iterasi Development (Clean Code Discipline)
1. **DILARANG Meninggalkan Kode Usang Sisa Iterasi**:
   * Ketika proses development berlangsung secara berulang/iteratif (misal: kode versi 1 direvisi ke versi 2, lalu disempurnakan di versi 3):
   * Seluruh kode tampilan (elemen DOM/Blade/HTML, modal dialog lama), logika backend/frontend, fungsi helper, event listener, maupun variabel dari versi sebelumnya yang sudah tidak digunakan lagi **WAJIB LANGSUNG DIHAPUS BERSIH**.
2. **Larangan Menumpuk Kode Mati Sebagai Komentar (*Zombie Code*)**:
   * Dilarang membiarkan blok kode lama hanya dijadikan komentar (`//` atau `/* */`). Kode yang sudah tidak dipakai harus dibuang sepenuhnya dari berkas produksi agar basis kode selalu bersih, ringkas, dan mudah dirawat.

---

## 9. Standar Modular Route Partials Per Resource (`routes/partials/`)
1. **DILARANG Menumpuk Rute Baru di `routes/web.php`**:
   * File `routes/web.php` hanya bertindak sebagai *Aggregator Utama* yang me-require berkas-berkas partial.
   * Dilarang menambahkan route fitur/modul baru langsung ke `routes/web.php`.
2. **Wajib Pisahkan Rute Per Resource / Domain**:
   * Seluruh penambahan endpoint dan rute baru WAJIB ditempatkan pada file partial domain masing-masing di dalam folder `routes/partials/[resource].php` (misal `routes/partials/voucher.php`, `routes/partials/promotion.php`, `routes/partials/ticket-transaction.php`, dsb).
   * Pendekatan ini menjaga modularitas, memudahkan pemeliharaan jangka panjang (*high maintainability*), serta mengeliminasi potensi konflik merge Git antar-pengembang.

---

## 10. Audit Perlindungan Kode Rekan Tim (*Co-Developer Commit Protection Protocol*)
1. **Prinsip Non-Regresi Kode Rekan Developer**:
   * Dalam proyek kolaboratif multi-pengembang (seperti riwayat commit rekan developer `"Hendris"` di `adminShuttleV3`), AI Agent memiliki kebijakan mutlak: **TIDAK BOLEH mengubah, merusak, atau menimpa hasil development yang telah di-commit oleh rekan pengembang tanpa izin**.
2. **Wajib Audit Check Pasca-Development**:
   * Setiap kali suatu sesi pekerjaan (fitur baru, modifikasi, perbaikan bug/fix, refactoring) dinyatakan selesai sebelum diserahkan ke pengguna, AI Agent **WAJIB melakukan audit check**:
     * Menjalankan inspeksi Git (`git blame`, `git log`, atau `git diff`) pada berkas-berkas yang disentuh.
     * Memverifikasi apakah ada baris kode, fungsi, struktur tabel, atau rute milik rekan pengembang lain yang terhapus, tergeser, atau termutasi.
3. **Protokol Human-in-the-Loop & Analisis Dampak (Jika Terpaksa Diubah)**:
   * Jika ditemukan bahwa penyelesaian suatu task menuntut perubahan pada kode milik rekan developer lain:
     * AI Agent **DILARANG KERAS** langsung mengedit atau menimpanya secara sepihak.
     * AI Agent **WAJIB STOP dan mengajukan konfirmasi eksplisit kepada pengguna**.
     * AI Agent wajib menjelaskan berkas/baris kode yang terdampak, urgensi teknisnya, serta analisis dampak terhadap fitur lain sebelum mengambil tindakan.

---

## 11. Bahasa Penyimpanan Database (Inggris) vs. Tampilan Antarmuka (Indonesia)
1. **Penyimpanan Database (Storage Layer)**:
   * Seluruh nilai data yang disimpan ke database (*storage layer*), seperti nama hari (`Monday`, `Tuesday`, `Wednesday`, `Thursday`, `Friday`, `Saturday`, `Sunday`), status transaksi (*ENUM* / *constants* seperti `scheduled`, `departed`, `arrived`, `finished`, `canceled`), tipe, dan kode internal **WAJIB menggunakan Bahasa Inggris baku**.
2. **Tampilan Antarmuka (UI Localization Layer)**:
   * Seluruh teks pada lapisan antarmuka pengguna (*UI display layer*), seperti label form, tabel, badge status, modal, toast notifikasi, dan pesan konfirmasi, **WAJIB disesuaikan menggunakan Bahasa Indonesia** (atau bahasa lokal aplikasi) yang ramah, santun, dan mudah dipahami pengguna awam.

---

## 12. Panduan Set Data Uji Manual (*Manual Testing Data Set*) Pasca-Pengembangan Form
1. **Wajib Sajikan Set Data Contoh Pengujian Form**:
   * Setiap kali menyelesaikan pembuatan atau perubahan modul formulir (*form tambah / edit*), AI Agent WAJIB menyajikan panduan pengujian manual berupa contoh set data input nyata yang dapat langsung diisi oleh pengguna pada form antarmuka browser.
2. **Wajib Rinci Representasi Data Database**:
   * AI Agent WAJIB menyajikan perbandingan representasi data persisnya yang masuk ke dalam baris tabel database (nama kolom, format data string/JSON/ENUM, dan tipe nilainya) agar pengguna dapat melakukan testing mandiri dan mencocokkan (*cross-check*) ke database/phpMyAdmin dengan mudah.

---

## 13. Standar Import Header (Zero Inline FQCN) & Error Logging Wajib
1. **Larangan Mutlak Inline FQCN**:
   * Dilarang memanggil class menggunakan namespace inline di dalam tubuh method (seperti `\Illuminate\Support\Facades\Log::error(...)` atau `\Carbon\Carbon::now()`). Seluruh class wajib di-import di header file menggunakan `use`.
2. **Wajib Error Logging Tanpa Menelan Error (*No Silent Catch*)**:
   * Setiap pengecualian (*exception*) wajib dicatat via `Log::error(...)` sebelum mengembalikan respons gagal (`ServiceResult::failed(...)` atau JSON error).

---

## 14. Standar Zona Waktu Dinamis (Larangan Hardcode Timezone)
1. **Wajib Ikuti `config('app.timezone')` / `APP_TIMEZONE`**:
   * Seluruh fungsi tanggal/waktu di backend (`Carbon::now()`, `Carbon::today()`, `Carbon::parse()`) maupun helper frontend wajib mengikuti timezone konfigurasi aplikasi.
   * **DILARANG KERAS** melakukan hardcode string timezone statis (seperti `'Asia/Makassar'`) di Service, Repository, Model, maupun helper JavaScript.

---

## 15. Audit Wajib Skenario Celah Lapangan (Review, Planning, Evaluasi & Fix-Bug)
1. **Tidak Boleh Di-skip di Tahap Manapun**:
   * Setiap proses **Review**, **Planning**, **Evaluasi**, dan **Fix-Bug** WAJIB mencakup pengecekan proaktif celah skenario lapangan:
     1. **Sinkronisasi State-Machine Lintas Menu**: Pastikan tombol aksi (`can_cancel`, `can_mutate`, `can_checkin`, `can_pay`), guard repository (Single Source of Truth Guard), dan tampilan view lain sejalan.
     2. **Batas Waktu Real-Time (`ETD` / `expired_at`)**: Memastikan batas operasional nyata (jam berangkat, kadaluarsa pembayaran, urutan cetak dokumen persiapan) tidak bertabrakan atau mengunci secara prematur.
     3. **Integritas Tabel Terkait & Log Audit**: Tabel induk vs tabel relasi (`forwards`, `trackings`, `manifests`) tetap sinkron tanpa duplikasi log maupun status yatim (*orphaned status*).
     4. **Penanganan Kegagalan & Kondisi Pinggiran**: Skenario cetak ulang manifest, ganti supir/armada mendadak, pembatalan setelah penjadwalan, dan konsistensi timezone.

---

### Ringkasan Cepat: Do's and Don'ts

| Area | ✅ WAJIB DILAKUKAN | ❌ DILARANG KERAS |
| :--- | :--- | :--- |
| **Alur Kerja** | Awali dengan Review Task mendalam & tunggu persetujuan pengguna | Langsung koding sebelum pengguna konfirmasi setuju |
| **Mutasi DB** | Sediakan query SQL manual untuk phpMyAdmin | Eksekusi query INSERT/UPDATE/DELETE langsung dari AI/scratch |
| **Basis Data** | Fokus pada database `transport_system` | Akses DB luar tanpa izin / utak-atik data eksisting |
| **Migrasi** | Update berkas migrasi sebagai arsip dokumentasi | Menjalankan `php artisan migrate` di terminal |
| **Permission** | Sediakan SQL permission jika menu baru belum ada | Mem-bypass otorisasi atau memalsukan data mock |
| **Arsitektur** | Prioritaskan komponen & pola yang sudah ada di `adminShuttleV3` | Menjiplak kode usang yang bertentangan dengan standar saat ini |
| **Playwright** | Jalankan HANYA jika diminta eksplisit oleh user (Akun: `superahmad` / `password123`) | Menjalankan Playwright otomatis tanpa instruksi pengguna |
| **Komentar Kode** | Tulis komentar ringkas (1-2 baris), fungsional & ramah developer tim | Banner ASCII panjang, dekoratif berlebihan, atau mengutip rujukan aturan AI |
| **Teks & Label UI** | Gunakan istilah umum dan ramah pengguna (misal: "Password :") | Memunculkan jargon teknis (misal: "Password (16 Karakter):", "injeksi", regex) |
| **Routing Modular** | Pisahkan rute per resource di `routes/partials/[resource].php` | Menumpuk semua rute baru di `routes/web.php` |
| **Sisa Iterasi (Dead Code)** | Hapus tuntas kode versi lama saat revisi berlanjut | Membiarkan dead code atau zombie comment menumpuk |
| **Proteksi Commit Rekan** | Audit `git blame`/`git diff` & konfirmasi dampak sebelum edit | Menimpa hasil kerja/commit rekan developer secara sepihak |
| **Dual-Language Data** | Nilai ENUM, hari (`Monday`), status DB wajib Bahasa Inggris baku | Menyimpan nama hari/status berbahasa lokal ke tabel DB |
| **Testing Form** | Sajikan contoh set data uji manual & representasi kolom DB | Membiarkan user tanpa panduan cross-check pengujian form |
| **Import & Logging** | Import via `use` di header file & catat error via `Log::error` | Menulis inline FQCN atau melakukan silent catch tanpa log |
| **Zona Waktu Dinamis** | Gunakan `config('app.timezone')` / `APP_TIMEZONE` secara dinamis | Hardcode timezone statis (misal `'Asia/Makassar'`) |
| **Audit Celah Lapangan** | Audit skenario celah lintas-menu, batas `ETD`, & tabel relasi | Melewatkan audit state-machine saat Review atau Fix-Bug |
| **Knowledge** | Catat setiap bug dan solusinya ke `.agents/knowledge/` | Mengabaikan dokumentasi problem-solving |
