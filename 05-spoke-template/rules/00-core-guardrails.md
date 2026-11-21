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

---

## 15. Audit Wajib Skenario Celah Lapangan (Review, Planning, Evaluasi & Fix-Bug)
1. **Tidak Boleh Di-skip di Tahap Manapun**:
   * Setiap proses **Review**, **Planning**, **Evaluasi**, dan **Fix-Bug** WAJIB mencakup pengecekan proaktif celah skenario lapangan:
     1. **Sinkronisasi State-Machine Lintas Menu**: Apakah tombol aksi (`can_cancel`, `can_mutate`, `can_checkin`, `can_pay`), guard repository, dan tampilan view lain sejalan.
     2. **Batas Waktu Real-Time (`ETD` / `expired_at`)**: Memastikan batas operasional nyata (jam berangkat, kadaluarsa pembayaran, urutan cetak dokumen) tidak bertabrakan atau mengunci secara prematur.
     3. **Integritas Tabel Terkait & Log Audit**: Tabel induk vs tabel relasi (`forwards`, `trackings`, `manifests`) tetap sinkron tanpa duplikasi log maupun data yatim (*orphaned status*).
     4. **Penanganan Kegagalan & Kondisi Pinggiran**: Skenario cetak ulang manifest, ganti supir/armada mendadak, pembatalan setelah penjadwalan, dan konsistensi timezone.
2. **Klasifikasi Wajib: Fokus Core Flow vs Pelengkap Di Luar Core Flow**:
   * **Prioritas Solusi Utama (`[CORE FLOW]`)**: Setiap solusi perbaikan celah WAJIB langsung menyasar dan merujuk pada **core flow** utama yang mengalami celah agar akar masalah terselesaikan tepat sasaran.
   * **Pelengkap Di Luar Core Flow (`[DI LUAR CORE FLOW / OPSIONAL PELENGKAP]`)**: Jika terdapat penyesuaian preventif atau penanganan *edge case* tambahan untuk melengkapi area di luar core flow utama, AI Agent **tetap wajib mengikutsertakan dan memaparkannya**, tetapi dipisahkan secara eksplisit dari daftar perbaikan core flow dengan label **`[DI LUAR CORE FLOW / OPSIONAL PELENGKAP]`**.
   * **Transparansi Alur & Impact**: Setiap item berlabel di luar core flow WAJIB disertai penjelasan singkat mengapa item tersebut berada di luar core flow serta **pertimbangan dampaknya (*impact analysis*) jika ditambahkan vs jika tidak ditambahkan**, sehingga pengguna memahami alur sistem secara menyeluruh dan dapat memverifikasi keputusan secara sadar sebelum eksekusi.
3. **Wajib Simulasi Testing Impact Menggunakan Data Nyata (*Data-Driven Impact Simulation*)**:
   * Setiap pemaparan celah `[CORE FLOW]` maupun `[DI LUAR CORE FLOW / OPSIONAL PELENGKAP]` pada tahap Review, Planning, Evaluasi, dan Fix-Bug **WAJIB disertai ilustrasi simulasi uji menggunakan contoh data nyata / record DB aktual** (`Before vs After` atau `Jika Diterapkan vs Jika Diabaikan`) sesuai template pada [`workflows/task-review-protocol.md`](../workflows/task-review-protocol.md) Bagian 3B.
   * Pengujian dilakukan secara **read-only** (simulasi skrip/logika/query baca) tanpa melanggar Zero-Direct-CRUD.

---

## 16. Kontrak JSON Murni Endpoint GET & DataTables (Zero Raw HTML/Badge)
1. **Backend Mengembalikan Data Terstruktur Murni (Tanpa Tag HTML)**:
   * Seluruh endpoint `GET` AJAX/DataTables maupun `JsonResource` **DILARANG KERAS** menyisipkan tag HTML (`<span>`, `<a href>`, `<div>`, `<i>`, `<button>`) di dalam response JSON. Endpoint cukup mengirim nilai mentah yang bersih dan aman, serta wajib dilindungi `try/catch` + `Log::error(...)` agar kegagalan parsing tidak memecah JSON DataTables (spesifikasi backend: [`rules/10-architecture.md`](./10-architecture.md) Bagian 5).
2. **Frontend Merender Tampilan & Melindungi XSS**:
   * Pembuatan badge status, warna semantik, multi-line layout, tautan, dan tombol aksi wajib dikerjakan di sisi klien lewat `columns[].render` menggunakan helper `escapeHtml()` (spesifikasi frontend: [`rules/30-ui-frontend.md`](./30-ui-frontend.md) Bagian 12).
   * Aturan ini **WAJIB diaudit** di setiap tahap: **Review, Planning, Development, Fix-Bug, dan Evaluasi**.

---

## 17. Audit Definisi Database View (Anti-Double Join, Anti-Censorship Filter & Single-Source Projection)
1. **Wajib Membaca Definisi View Sebelum Menulis Query (Anti-Double Join)**:
   * Setiap kali sebuah repository mengonsumsi Database View (MySQL View `v_...`), AI Agent **WAJIB** membaca berkas SQL dump terbaru (`transport_system-*.sql`) untuk memeriksa tabel-tabel master apa saja yang **sudah di-join di dalam View tersebut**.
   * **DILARANG KERAS** melakukan `leftJoin` / `join` ulang di Query Builder Laravel ke tabel master fisik yang sudah di-join di dalam View (anti-2x proses). Contoh: dilarang men-join ulang `routes`, `vehicles`, `vehicle_layouts`, `emoneys`, dan `admins` jika kueri sudah memanggil `v_manifest`.
   * Jika terdapat kolom master yang belum diekspos oleh View (misal `vehicle_code` atau `layout_name`), AI **WAJIB mendeklarasikannya secara transparan** kepada tim basis data / atasan untuk ditambahkan ke baris `SELECT` View, bukan secara sepihak menambahkan join fisik ganda yang melumpuhkan performa kueri.
2. **DILARANG Menambahkan Filter WHERE Prematur/Kaku pada View (Anti-Penyensoran Data & Perlindungan Indeks)**:
   * **DILARANG KERAS** menambahkan filter `WHERE` kaku seperti `->where('vehicle_list_id', '>', 0)->where('driver_id', '>', 0)->whereNotNull('manifest_code')` pada kueri view kecuali jika secara mutlak diminta oleh aturan bisnis.
   * Dampak negatif filter prematur ini:
     a) **Penyensoran Data Tidak Sengaja**: Jadwal/manifest yang baru dibuat dan armadanya belum ditentukan (`NULL` / `0`) menjadi **hilang misterius** dari antarmuka pengguna, padahal staf butuh melihatnya dengan status *"Belum Diatur"*.
     b) **Degradasi Performa**: Kondisi `>` pada view memicu *full table scan* dan merusak optimasi indeks MySQL (~10x lebih lambat).
3. **Proyeksi Tunggal Bersih (Single-Source Projection via `vm.*` )**:
   * Seluruh atribut yang sudah diproyeksikan oleh Database View wajib diambil langsung via `vm.*` (atau alias view terkait) tanpa menulis deretan `COALESCE` panjang yang berlebihan di layer repository.
4. **Lifecycle Mandat (Tidak Boleh Di-skip)**:
   * Aturan ini **WAJIB diaudit** pada setiap tahap: **Planning, Review, Development, Fix-Bug, dan Evaluasi** (Kasus #41, SSOT: [`rules/21-database-reasoning.md`](./21-database-reasoning.md) Bagian 5).

---

## 18. Standar Pengujian: Alur UI Browser Nyata (In-Admin) vs Query SQL phpMyAdmin (Out-of-Admin)
1. **(A) Pengujian Alur di Dalam Sistem Admin (In-Admin Flow - Browser UI Flow First)**:
   * Setiap alur yang memiliki modul/antarmuka di web admin (seperti pemesanan tiket, kirim paket, penugasan armada, input upah harian, check-in, dan form modal) **WAJIB disimulasikan secara nyata melalui antarmuka web peramban (Browser UI Flow via Playwright)**.
   * Alur wajib mencerminkan interaksi manusia sesungguhnya: membuka halaman aplikasi admin, memilih dropdown/kursi, mengisi form input, dan mengklik tombol simpan di browser.
   * **DILARANG KERAS** menggunakan jalan pintas (*shortcut*) pembuatan data uji melalui skrip kernel PHP/service backend langsung atau query SQL injeksi, **KECUALI** pengguna secara eksplisit menginstruksikannya (contoh instruksi eksplisit: *"tolong inject data via script/sql saja biar hemat token"*).
2. **(B) Pengujian Alur di Luar Sistem Admin (Out-of-Admin Flow / External Blockers & Time Fast-Forward)**:
   * Jika skenario pengujian bergantung pada pemicu yang berada di luar aplikasi web admin (contoh: status manifest telah tiba / `arrived` yang dipicu dari Aplikasi Android Driver, pengajuan penarikan saldo supir / withdrawal dari aplikasi driver, simulasi melewati jam `ETD` / kadaluarsa, atau callback payment gateway), AI **DILARANG KERAS mengeksekusi injeksi skrip atau mutasi database sendiri** (mematuhi Rule #2 Zero-Direct-CRUD).
   * AI **WAJIB PAUSE**, lalu **MENYEDIAKAN PAKET QUERY SQL MANUAL YANG TRANSPARAN & SIAP PASTE UNTUK DIJALANKAN OLEH PENGGUNA DI PHPMYADMIN** (lengkap dengan penjelasan status, tujuan, cara kerja, dampak, dan kueri pemulihan/rollback).
   * Setelah pengguna mengonfirmasi query berhasil dijalankan di phpMyAdmin, AI langsung melanjutkan pengujian alur admin di peramban browser.
3. **Keterikatan Siklus Hidup Menyeluruh (Lifecycle Mandat - Tidak Boleh Di-skip)**:
   * **Planning & Review**: Wajib mendeklarasikan metode eksekusi data uji secara transparan: **`BROWSER UI FLOW (Playwright)`** untuk alur in-admin, dan **`PAUSE + QUERY SQL PHPMYADMIN`** jika ada ketergantungan pemicu eksternal/waktu di luar admin.
   * **Development & Fix-Bug**: Validasi perbaikan wajib dipastikan bekerja mulus pada antarmuka web peramban.
   * **Evaluasi & QA**: Bukti uji wajib menyertakan tangkapan layar (*screenshot*) dari alur antarmuka browser yang nyata (Kasus #42, SSOT: [`workflows/task-review-protocol.md`](../workflows/task-review-protocol.md) & [`workflows/post-dev-qa.md`](../workflows/post-dev-qa.md)).

---

### Ringkasan Cepat: Do's and Don'ts

| Area | ✅ WAJIB DILAKUKAN | ❌ DILARANG KERAS |
| :--- | :--- | :--- |
| **Alur Kerja** | Awali dengan Review Task mendalam & tunggu persetujuan pengguna | Langsung koding sebelum pengguna konfirmasi setuju |
| **Routing** | Tempatkan rute secara modular per resource di `routes/partials/[resource].php` | Menumpuk / menambahkan rute baru langsung ke `routes/web.php` |
| **Mutasi DB** | Sediakan query SQL manual untuk phpMyAdmin | Eksekusi query INSERT/UPDATE/DELETE langsung dari AI/scratch |
| **Basis Data** | Nilai kolom ENUM, hari, status WAJIB Bahasa Inggris (Monday, Tuesday, departed, dll) | Menyimpan nilai hari/status berlabel lokal (Senin, Selasa, dll) ke tabel database |
| **Migrasi** | Update berkas migrasi sebagai arsip dokumentasi | Menjalankan `php artisan migrate` di terminal |
| **Permission** | Sediakan SQL permission jika menu baru belum ada | Mem-bypass otorisasi atau memalsukan data mock |
| **Arsitektur** | Prioritaskan komponen & pola yang sudah ada di `adminShuttleV3` | Menjiplak kode usang yang bertentangan dengan standar saat ini |
| **Playwright** | Jalankan HANYA jika diminta eksplisit oleh user (Akun: `superahmad` / `password123`) | Menjalankan Playwright otomatis tanpa instruksi pengguna |
| **Alur Pengujian (Testing Flow)** | Jalankan alur in-admin via browser (Browser UI Flow via Playwright); untuk alur di luar admin (Android Driver/ETD) PAUSE & sediakan query SQL manual untuk phpMyAdmin | Menginjeksi data via skrip kernel PHP/SQL langsung untuk mensimulasikan transaksi bisnis KECUALI diminta eksplisit oleh pengguna |
| **Komentar Kode** | Tulis komentar ringkas (1-2 baris), fungsional & ramah developer tim | Banner ASCII panjang, dekoratif berlebihan, atau mengutip rujukan aturan AI |
| **Teks & Label UI** | Gunakan istilah bisnis umum dan ramah pengguna awam (misal: "Password :", "disimpan menjadi harga tarif operasional") | Memunculkan jargon teknis (misal: kata "database", "database operasional", "query", "record", "Password (16 Karakter):", "injeksi") |
| **Sisa Iterasi (Dead Code)** | Bersihkan/hapus tuntas kode versi lama yang sudah tidak terpakai saat revisi berikutnya | Membiarkan dead code, UI modal usang, atau potongan komentar kode mati menumpuk |
| **Git / Version Control** | Biarkan seluruh perubahan kode di working tree (*uncommitted*) untuk direview pengguna | Menjalankan `git commit` maupun `git push` (eksekusi commit & push dikelola mandiri oleh user) |
| **Proteksi Commit Rekan** | Wajib audit non-regresi pasca-dev & konfirmasi dampak jika perlu menyentuh kode rekan developer | Mengubah atau menimpa kode/fitur commit milik rekan secara sepihak tanpa konfirmasi |
| **Testing Form** | Sajikan set data uji manual & perbandingan representasi data database pada review selesai dev | Meninggalkan user tanpa panduan pengujian atau tanpa kejelasan format data database |
| **Import & Error Handling** | Import class via `use` di atas file & kembalikan `ServiceResult::failed` | Menulis inline FQCN (`\Illuminate\...::error`) atau menelan error secara bisu (*silent catch*) |
| **Zona Waktu** | Gunakan `config('app.timezone')` / `Carbon::now()` secara dinamis | Hardcode `'Asia/Makassar'` di kode backend atau frontend |
| **Modal & Komponen UI Portable** | Pusatkan modal/popup lintas-menu ke 1 Blade partial + 1 JS portabel ber-scope terisolasi, lalu cek semua halaman pemakainya saat Planning, Fix, Dev & Evaluasi (`30-ui-frontend.md` Bag. 13) | Menyalin-tempel HTML modal atau JS handler di banyak menu, atau memakai selector CSS/ID global yang bocor ke halaman induk |
| **Audit Celah Lapangan** | Lakukan audit skenario celah lintas-menu pada Review, Planning, Evaluasi & Fix-Bug | Melewatkan pengecekan celah state-machine, batas ETD, & tabel anak |
| **Klasifikasi Celah & Impact** | Fokus solusi ke `[CORE FLOW]`; pisahkan pelengkap `[DI LUAR CORE FLOW / OPSIONAL PELENGKAP]` + simulasi testing impact berbasis data nyata | Mencampur perbaikan opsional di luar core flow tanpa penjelasan dampak & ilustrasi uji data |
| **Endpoint GET / DataTables** | Kembalikan data JSON murni bebas HTML; render badge/aksi di `columns[].render` JS dengan `escapeHtml()` (`10-architecture.md` Bag. 5 & `30-ui-frontend.md` Bag. 12) | Mengirim `<span class="badge">`, `<a>`, atau HTML mentah di payload JSON Service / JsonResource |
| **Konsumsi Database View** | Baca definisi `CREATE VIEW` di dump SQL terbaru; gunakan `vm.*` tanpa join master ganda; hapus filter `>` prematur | Join ulang ke tabel master yang sudah ada di view (2x proses); filter kaku `vehicle_list_id > 0` yang menyembunyikan jadwal baru |
| **Knowledge** | Catat setiap bug dan solusinya ke `knowledge/` | Mengabaikan dokumentasi problem-solving |
