---
description: Database Standards, Zero-Direct-CRUD, Menus & Permissions (database/**, SQL)
globs: database/**
---

# 20. Database & Schema Governance

Dokumen ini mengatur tata kelola basis data, kebijakan perlindungan data eksisting, larangan injeksi CRUD langsung, serta pengelolaan tabel `menus` & `permissions`.

---

## 1. Pemetaan Konteks Basis Data (`transport_system` vs `sunjaya_dev`)
1. **Target Tunggal Operasional (`adminShuttleV3`)**:
   * Sistem saat ini (**`adminShuttleV3`**) beroperasi penuh menggunakan database **`transport_system`**.
   * File dump skema database sistem ini selalu disediakan pengguna di folder root: **`transport_system-*.sql`** (misalnya `transport_system-30-9-2026.sql`, `transport_system-01-10-2026.sql`).
   * **DILARANG** mengarahkan kueri aplikasi ke database lain kecuali ada kebutuhan integrasi mutlak yang disetujui.
2. **Konteks Basis Data Sistem Referensi (`admin-sunjaya`)**:
   * Sistem referensi lama (**`admin-sunjaya`**) menggunakan database **`sunjaya_dev`**.
   * File dump skema database lama disediakan di folder root: **`sunjaya_dev_*.sql`** (misalnya `sunjaya_dev_9-9-2026_cleaned.sql`).
   * **Fungsi SQL Dump**: Kedua berkas SQL dump di root proyek berfungsi murni sebagai **sumber informasi dan basis pengetahuan (*knowledge ground-truth*)** bagi AI untuk memahami skema, komparasi relasi tabel, tipe kolom, dan logika data lama vs baru.
3. **Perlindungan Data Eksisting**:
   * **DILARANG KERAS** mengutak-atik, menimpa (*overwrite*), memodifikasi, atau menghapus baris data riil yang ada pada tabel database `transport_system`.

---

## 2. Kebijakan SQL Manual (Khusus Side Permission & Fallback Feedback)
1. **Prinsip Kejujuran Data (Zero-Silent-Bypass) & Batasan Ketat SQL Manual**:
   * Jika dalam proses analisis, review, atau jalannya sistem ditemukan bahwa data master, lookup, relasi, menu, atau konfigurasi **belum tersedia / kosong** pada tabel database operasional:
     * AI **DILARANG KERAS** membuat data tiruan palsu (*hardcoded dummy / mock*) atau mem-bypass logika validasi.
     * AI **WAJIB memberikan Fallback Feedback** secara transparan kepada pengguna.
   * **Batasan Ketat SQL Manual**: Kueri SQL manual yang disajikan kepada pengguna **HANYA BERLAKU UNTUK SETUP PERMISSION & MENU** (pada tabel `menus` dan `permissions`) jika belum terdaftar di DB, atau DDL SP/View. **DILARANG KERAS** menyajikan query dummy / sampel data bisnis (seperti `INSERT INTO promotions`, `INSERT INTO tickets`, dsb).
   * Jika menu dan hak akses untuk fitur yang didevelop sudah terdaftar di database, AI **CUKUP MEMBERIKAN KONFIRMASI TRANSPARAN** bahwa hak akses telah tersedia tanpa menyertakan query SQL data bisnis.
2. **Penanganan Anggun di Sisi Kode (*Graceful Error / Flash Warning*)**:
   * Pada level kode aplikasi (Controller/Service), jika data referensi penting tidak ditemukan, buat respons/flash message informatif yang memandu admin (misal: `"Data master [X] belum dikonfigurasi. Silakan tambahkan melalui menu Master Data atau pengaturan sistem."`), bukan membiarkan aplikasi crash (*unhandled null pointer / 500 error*).

---

## 3. Kebijakan Zero-Direct-CRUD (Wajib SQL Manual phpMyAdmin)
1. **Larangan Mutasi Langsung dari AI / Skrip Scratch**:
   * AI **DILARANG** menjalankan query `INSERT`, `UPDATE`, `DELETE`, `ALTER TABLE`, atau `DROP TABLE` langsung ke database `transport_system` melalui command line, tinker, atau script sementara di `scratch/`.
2. **Penyediaan Skrip SQL Manual**:
   * Setiap penambahan menu, konfigurasi izin baru, atau penambahan kolom baru **WAJIB dibuatkan query SQL terstruktur** untuk disajikan kepada pengguna.
   * Pengguna akan mereview dan mengeksekusinya secara manual di **phpMyAdmin**.
   * **Tujuan**:
     * Pengguna mengetahui secara transparan tabel dan kolom apa saja yang terdampak.
     * Mencegah kerusakan data yang tidak disengaja.
     * Mempermudah pelacakan dan pemeliharaan (*maintenance*) di masa mendatang.

---

## 4. Tata Kelola Menu (`menus`) & Hak Akses (`permissions`)
1. **Dilarang Bypass Izin / Data**:
   * **DILARANG** melakukan bypass otorisasi (`permission('read')`) di controller atau membuat mock data palsu jika data belum terdaftar di database.
   * Jika menu atau hak akses belum ada, sediakan query SQL siap pakai:
     ```sql
     -- 1. Daftarkan Menu di tabel `menus`
     INSERT INTO `menus` (`id`, `label`, `group`, `name`, `link`, `icon`, `order`, `is_active`, `created_at`, `updated_at`)
     VALUES ([ID], '[LABEL]', '[GROUP]', '[NAME]', '[url/index]', 'la-icon', [ORDER], 'y', NOW(), NOW())
     ON DUPLICATE KEY UPDATE `is_active` = 'y', `updated_at` = NOW();

     -- 2. Berikan Hak Akses di tabel `permissions` (Role SUPER ADMIN)
     INSERT INTO `permissions` (`id`, `role_id`, `menu_id`, `create`, `read`, `update`, `delete`, `created_at`, `updated_at`)
     VALUES (UUID(), '05581f52-1a25-4b51-97a1-e915c922ed39', [ID], 1, 1, 1, 1, NOW(), NOW());
     ```
2. **Penyegaran Cache Menu**:
   * Setelah query dieksekusi di phpMyAdmin, segarkan cache aplikasi:
     ```bash
     php artisan cache:clear
     ```

---

## 5. Kebijakan Kesiapan Migrasi Laravel (`Schema::create` Statis Tanpa Eksekusi CLI)
1. **Alur Kerja Kolaboratif Tim & Fungsi phpMyAdmin**:
   * Perancangan skema, penambahan tabel, dan modifikasi kolom sering dilakukan langsung di phpMyAdmin oleh tim developer/analis pada fase development. File dump SQL terbaru disediakan berkala sebagai **ground-truth** skema terkini.
2. **Peran & Tanggung Jawab `.agents` (Sinkronisasi Migrasi Statis)**:
   * Baca file SQL dump terbaru, identifikasi tabel yang sudah dibuat di phpMyAdmin tetapi belum memiliki berkas migrasi di `database/migrations/`, lalu **buatkan atau perbarui file migrasi pembuat tabel (`Schema::create`)** yang 100% presisi sesuai skema dump tersebut (tipe data, panjang karakter, enum, nullable, default value, comment, index).
   * **Wajib `Schema::create`**: Gunakan `Schema::create` (membuat tabel utuh dari nol), **BUKAN** alter `Schema::table`, agar saat fresh deployment ke server baru cukup menjalankan satu perintah `php artisan migrate`.
3. **Larangan Mutlak Eksekusi CLI Migrate**:
   * Perintah `php artisan migrate`, `migrate:fresh`, atau `migrate:rollback` **DILARANG KERAS** dijalankan di lingkungan dev aktif.

---

## 6. Standar Stored Procedures & Database Views (Optimasi & Keamanan)

1. **Konsultasi & Penawaran Proaktif (Review Gate)**:
   - Ketika tugas melibatkan agregasi baca kompleks (> 4 tabel join) atau transaksi mutasi multi-tabel krusial (seperti mutasi saldo supir, settlement kasir, validasi kuota tiket), AI **WAJIB menawarkan opsi penggunaan Stored Procedure / View kepada pengguna** di tahap review.
   - Jelaskan keuntungannya: kueri pre-compiled lebih cepat, logic terpusat tanpa menulis fungsi berulang kali di controller/service, dan atomisitas transaksi terlindungi.
2. **Kepatuhan Zero-Direct-CRUD pada DDL Stored Procedure / View**:
   - Dilarang membuat SP/View langsung ke database via koneksi background.
   - AI **WAJIB menyajikan skrip SQL DDL lengkap** (`CREATE PROCEDURE`, `CREATE VIEW`) disertai pembungkus `DELIMITER //`, `DROP IF EXISTS`, dan skrip rollback agar **PENGGUNA SENDIRI YANG MENGEKSEKUSINYA DI PHPMYADMIN**.
3. **Standar Keamanan Mutlak Stored Procedure (MySQL)**:
   - **Error Handling Wajib**: Sertakan `DECLARE EXIT HANDLER FOR SQLEXCEPTION BEGIN ROLLBACK; ... END;` dan blok transaksi atomik `START TRANSACTION; ... COMMIT;`.
   - **Konteks Keamanan**: Gunakan `SQL SECURITY INVOKER` secara default untuk mencegah *privilege escalation*.
   - **Anti-SQL Injection**: Gunakan parameter SQL langsung (`WHERE id = p_id`). Dilarang string concatenation dinamis tanpa parameter binding.
   - **Pencegahan Race Condition**: Gunakan `FOR UPDATE` saat membaca saldo, kuota, atau status sebelum operasi pemotongan data.
4. **Integrasi ke Layer Aplikasi**:
   - Kueri pemanggilan Stored Procedure (`DB::select('CALL sp_...')`) atau View (`DB::table('v_...')`) **WAJIB diletakkan di dalam Repository layer**, bukan ditulis secara acak di Controller atau Blade view.
   - Simpan berkas DDL di folder repositori (misal: `database/procedures/` atau `database/views/`) sebagai arsip version control.

---

## 7. Kewajiban Rincian Tabel Terdampak Saat INSERT pada Review Development Menu Baru
1. **Analisis Tabel yang Terdampak Saat Penambahan Data (`INSERT`)**:
   * Pada setiap penyajian **Review Task** untuk development menu atau fitur baru, AI Agent **WAJIB** secara transparan mencantumkan daftar tabel database yang terdampak saat operasi penyimpanan data baru (`INSERT`).
   * Rincian wajib mencakup:
     - **Tabel Utama**: Nama tabel yang menampung rekaman data utama form, primary key, dan kolom penampung input.
     - **Tabel Relasi / Pivot**: Tabel relasi many-to-many, child items, atau tabel log aktivitas yang ikut terisi record baru saat submit.
     - **Relasi Foreign Key**: Keterkaitan kolom referensi ke tabel master pendukung.
2. **Kesesuaian dengan Ground-Truth SQL Dump**:
   * Seluruh penamaan tabel dan kolom yang dirinci wajib mengacu langsung pada file dump SQL database operasional terbaru.
