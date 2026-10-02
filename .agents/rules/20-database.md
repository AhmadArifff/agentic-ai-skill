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

## 2. Mekanisme Fallback Feedback Saat Data Tidak Tersedia
1. **Prinsip Kejujuran Data (Zero-Silent-Bypass)**:
   * Jika dalam proses analisis, review, atau jalannya sistem ditemukan bahwa data master, lookup, relasi, menu, atau konfigurasi **belum tersedia / kosong** pada tabel database `transport_system`:
     * AI **DILARANG KERAS** membuat data tiruan palsu (*hardcoded dummy / mock*) atau mem-bypass logika validasi.
     * AI **WAJIB memberikan Fallback Feedback** secara transparan kepada pengguna.
2. **Penyediaan Kueri SQL Siap Eksekusi**:
   * Bersamaan dengan feedback tersebut, AI **WAJIB menyediakan kueri SQL `INSERT`** yang valid dan lengkap agar pengguna dapat menambahkannya secara manual di **phpMyAdmin**.
3. **Penanganan Anggun di Sisi Kode (*Graceful Error / Flash Warning*)**:
   * Pada level kode aplikasi (Controller/Service), jika data referensi penting tidak ditemukan, buat respons/flash message informatif yang memandu admin (misal: `"Data master [X] belum dikonfigurasi. Silakan tambahkan melalui menu Master Data atau database."`), bukan membiarkan aplikasi crash (*unhandled null pointer / 500 error*).

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

## 5. Kebijakan Migrasi Laravel (Dokumentasi Tanpa Eksekusi CLI)
1. Perintah `php artisan migrate` **DILARANG KERAS**.
2. Berkas migrasi di `database/migrations/` diperbarui hanya sebagai riwayat dokumentasi skema kode agar sinkron dengan perubahan manual yang telah dieksekusi di phpMyAdmin.
