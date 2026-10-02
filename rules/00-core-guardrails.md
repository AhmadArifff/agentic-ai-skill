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
| **Knowledge** | Catat setiap bug dan solusinya ke `.agents/knowledge/` | Mengabaikan dokumentasi problem-solving |
