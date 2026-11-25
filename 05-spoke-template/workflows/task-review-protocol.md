# Workflow: Protokol Wajib Review Sebelum Development & Fix Bug

SOP ini wajib dijalankan oleh AI Agent **sebelum menulis atau mengubah kode apapun** pada setiap sesi pengembangan fitur baru, penambahan menu, maupun perbaikan bug.

> [!IMPORTANT]
> **Pemisahan Cakupan (Universal Spoke Core vs Add-on Laravel/MySQL)**:
> - **Universal (Wajib di SEMUA Proyek Anak)**: Deklarasi **Skill Activation Gate** (`adopted_skills`), Analogi Dunia Nyata + Before/After, Matriks Target Perubahan Eksplisit (`3A`), Audit Skenario Celah (`3B`), Optimization Gate Multi-Domain, Visual Planning Gate (`Rule 32`), dan Human-in-the-Loop Approval Gate.
> - **Add-on Khusus Laravel / MySQL (`adminShuttleV3`)**: Bagian dump `transport_system-*.sql`, komparasi 4-dimensi `admin-sunjaya` / `sunjaya_dev`, query manual phpMyAdmin, dan `qa-kernel.php` **HANYA aktif** jika proyek menggunakan Laravel/MySQL legacy tersebut; lewati bagian spesifik Laravel tersebut pada proyek Next.js, 3D WebGL, Video, Game, atau AI Agent.

---

## 📋 Alur Kerja Standar (SOP 7 Pilar)

```
┌────────────────────────────────────────────────────────┐
│ 1. Eksplorasi Database transport_system & SQL Dumps   │
└───────────────────────────┬────────────────────────────┘
                            │
┌───────────────────────────▼────────────────────────────┐
│ 2. Komparasi 4-Dimensi: adminShuttleV3 vs admin-sunjaya│
│    (Database, Logika Bisnis, Metode/Arsitektur, UI)    │
└───────────────────────────┬────────────────────────────┘
                            │
┌───────────────────────────▼────────────────────────────┐
│ 3. Penyelarasan Standar Eksisting adminShuttleV3       │
│    (Prioritaskan Pola Laporan CSO, UI Pro Max, dsb)   │
└───────────────────────────┬────────────────────────────┘
                            │
┌───────────────────────────▼────────────────────────────┐
│ 4. Penyusunan Skrip SQL Manual untuk phpMyAdmin        │
│    (Zero-Direct-CRUD, transparan & aman)               │
└───────────────────────────┬────────────────────────────┘
                            │
┌───────────────────────────▼────────────────────────────┐
│ 5. Penyusunan Analisis Dampak: BEFORE vs AFTER         │
│    (Alur sebelum vs alur sesudah & dampak sistem)     │
└───────────────────────────┬────────────────────────────┘
                            │
┌───────────────────────────▼────────────────────────────┐
│ 6. HUMAN-IN-THE-LOOP APPROVAL GATE                     │
│    (Menunggu konfirmasi "Setuju" dari pengguna di chat)│
└───────────────────────────┬────────────────────────────┘
                            │ [Setelah Disetujui]
┌───────────────────────────▼────────────────────────────┐
│ 7. Eksekusi Koding & Dokumentasi ke Knowledge Base     │
│    (Komentar ringkas & bersih, catat bug-cases.md)     │
└────────────────────────────────────────────────────────┘
```

> [!TIP]
> **Disiplin Eksekusi Koding**: Saat menulis kode aplikasi, gunakan komentar fungsional yang ringkas (1-2 baris). DILARANG menulis komentar banner ASCII raksasa atau mencantumkan kutipan bab aturan internal AI (`RULESCODE.md - Bab X`). Kode harus bersih dan mudah dipahami oleh seluruh tim pengembang.

---

## Format Laporan Review Wajib kepada Pengguna:

Ketika pengguna memberikan instruksi fitur/bug baru, AI wajib merespon dengan format review terstruktur berikut:

```markdown
### 0. Skill Activation Gate (WAJIB untuk Semua Domain - Anti Passive Skill Syndrome)
* **Skill Teradopsi yang Diaktifkan**: Sebutkan daftar skill dari `adopted_skills` (`session-state.json`) atau katalog 60 skill global yang relevan untuk tugas ini (mencakup Backend, Frontend/UI, 3D/WebGL, Video/Motion, ML, Browser, atau Observabilitas).
* **Status Pembacaan `SKILL.md`**: Konfirmasikan bahwa `SKILL.md` masing-masing skill aktif sudah dibaca sebelum menyusun desain/kode, serta aturan routing Zero-Overlap sudah dipatuhi.

### 1. Status & Temuan Awal
* Menjelaskan kondisi fitur/bug pada basis kode saat ini.
* **Basis Data Operasional**: `transport_system` (skema dipelajari dari berkas `transport_system-*.sql` di root).
* **Basis Data Referensi Lama**: `sunjaya_dev` (skema dipelajari dari berkas `sunjaya_dev_*.sql` di root).
* **Tabel Database yang Terdampak Saat INSERT (Penyimpanan Data Baru)**:
  - **Tabel Utama**: Nama tabel penampung data form utama, tipe kolom, dan primary key.
  - **Tabel Relasi / Pivot**: Tabel anak atau log aktivitas yang ikut terisi record baru.
  - **Keterkaitan Foreign Key / Master**: Relasi ke tabel master pendukung.
* **Audit Definisi View & Kontrak Pengurutan SP**: Periksa tabel master yang sudah di-join di dalam View tersebut. DILARANG melakukan join ganda ke tabel fisik yang sama di Laravel (anti-2x proses), DILARANG memasang filter `WHERE` kaku (`vehicle_list_id > 0`, `driver_id > 0`) yang menyembunyikan jadwal/manifest baru, proyeksikan kolom langsung via `vm.*` (Kasus #41), dan **WAJIB mempertahankan urutan bawaan (*native ORDER BY*) Stored Procedure** (misal jadwal non-aktif di paling bawah tabel) tanpa menimpanya dengan sorting koleksi sembarangan di PHP (Kasus #43).

### 2. Strategi Akses Data (Data Engine Strategy) & Komparasi Sistem
* **Strategi Akses Data (WAJIB)**:
  - **Tipe Engine**: Nyatakan tegas apakah fitur beroperasi secara **`PURE DIRECT DB CRUD`** (100% database lokal) ATAU **`HYBRID / MICROSERVICE API`** (terhubung ke API eksternal/pusat).
  - **Status Keterlibatan Tim Backend Eksternal**: Jelaskan apakah tim API eksternal **perlu atau TIDAK PERLU membuat endpoint baru** (beserta draf kontrak JSON jika perlu).
* **Deklarasi Metode Eksekusi Pengujian (Testing Execution Method - Kasus #42)**:
  - **Alur di Dalam Admin**: **`BROWSER UI FLOW (Playwright)`** (standar mutlak untuk menguji alur aplikasi secara end-to-end melalui formulir antarmuka pengguna).
  - **Alur di Luar Admin**: **`PAUSE + QUERY SQL PHPMYADMIN`** (jika ada simulasi status tiba `arrived` dari Aplikasi Android Driver, pengajuan penarikan supir, atau batas waktu `ETD`). DILARANG keras injeksi skrip/SQL langsung dari AI tanpa izin eksplisit pengguna.
* **Komparasi 4-Dimensi dengan Sistem Referensi (`admin-sunjaya`)**:
  - **Data Database**: Tabel dan kolom terkait pada `transport_system` vs `sunjaya_dev`.
  - **Logika Bisnis (Logic)**: Validasi dan formula perhitungan.
  - **Metode / Arsitektur**: Struktur Controller -> Service -> Repository.
  - **Tampilan (UI/UX)**: Layout filter, tabel, dan komponen (wajib audit ketersediaan modal/partial reusable agar tidak duplikasi kode).

### 3. Analisis Alur Kerja Before vs After (Wajib Analogi Nyata)
* **Analogi Dunia Nyata Sederhana (WAJIB)**:
  - Sajikan 1 analogi operasional nyata (misal: titip kilat bus antar-kota, kasir bioskop XXI, flight manifest penerbangan, tutup shift minimarket) agar pengguna dan pemangku kepentingan non-teknis langsung menangkap esensi dan nilai inti (*core values*) fitur tanpa pusing dengan istilah teknis.
* **Alur SEBELUM (Before Flow)**:
  - Bagaimana alur kerja / kondisi kode saat ini beserta kendala atau bug yang dialami.
* **Alur SESUDAH (After Flow)**:
  - Bagaimana alur kerja baru setelah fitur diadopsi atau bug diperbaiki.
  - Peningkatan efisiensi, akurasi data operasional, atau kebersihan visual.
* **Dampak & Dependensi**:
  - File apa saja yang akan dibuat / diubah dan jaminan non-regresi terhadap commit rekan pengembang lain.

### 3A. Matriks Target Perubahan Eksplisit (WAJIB - Endpoint, File Kode & Konten Spesifik - Kasus #39)
* Wajib dicantumkan pada **Planning, Review, Development, Fix-Bug, dan Evaluasi** agar sasaran perubahan 100% presisi dan tidak salah sasaran menghapus/mengubah komponen lain:
  | Endpoint / Halaman (URL) | File Kode (Path) | Bagian / Konten Spesifik | Aksi (Tambah / Ubah / Hapus / Tidak Disentuh) |
  | :--- | :--- | :--- | :--- |
  | `/contoh-endpoint` | `public/js/apps/.../file.js` | Kolom `CHECKIN` baris ikon paket | **Hapus** baris paket; pertahankan baris tiket |
  | `/contoh-endpoint/detail/{id}` | `resources/views/.../detail.blade.php` | Card `Data Paket` | **Tidak Disentuh / Dipertahankan** |
* **Verifikasi Pasca-Eksekusi**: Setelah koding selesai, cocokkan `git diff --stat` terhadap tabel di atas untuk memastikan 100% perubahan tepat sasaran tanpa efek samping pada file atau bagian lain.

### 3B. Audit Wajib Skenario Celah Lapangan (Review, Planning, Evaluasi & Fix-Bug)
* **Konsistensi Lintas Menu & Tampilan**: Periksa apakah aturan/validasi baru sudah sinkron antara halaman order, list, detail, modal, serta menu operasional lain melalui *Single Source of Truth Guard*.
* **Batas Waktu Real-Time & State-Machine**: Pastikan zona waktu mengikuti `config('app.timezone')` (anti hardcode timezone statis `Asia/Makassar`), batas `ETD`/kadaluarsa tidak mengunci prematur saat cetak dokumen persiapan, serta urutan perubahan status valid di semua jalur.
* **Integritas Tabel Anak & Audit Log**: Pastikan tabel relasi (`forwards`, `trackings`, dll.) ikut diperbarui dan tidak terjadi duplikasi remark maupun status macet (*stuck*).
* **Validasi Input Ekstrem & Pergantian Mode Form (Kasus #32)**: Periksa celah angka batas (`percent 1..100`, `0`, nilai negatif), *leading zero*, *paste*, pergantian jenis potongan (`Rp` vs `%`), penempatan error `.input-group`, serta keselarasan validasi backend `FormRequest` (lihat [`30-ui-frontend.md`](../rules/30-ui-frontend.md) Bagian 14).
* **Portabilitas & Sinkronisasi Komponen Modal Reusable (Kasus #34, #35)**: Jika menyentuh modal popup atau partial lintas-halaman, pastikan HTML partial + JS handler tidak duplikat, ID & CSS terskop ke ID modal (anti-bocor ke halaman pemanggil), Select2/Datepicker mengikat parent modal, state dibersihkan saat `hidden.bs.modal`, dan seluruh halaman pemanggil ikut dicek pada saat Planning, Fix-Bug, Development, maupun Evaluasi (lihat [`30-ui-frontend.md`](../rules/30-ui-frontend.md) Bagian 13).
* **Integritas Payload JSON Murni Endpoint GET / DataTables (Kasus #17, #47)**: Pastikan endpoint `GET` (`DataTables`, `JsonResource`, API) tidak menyisipkan HTML/badge mentah di response JSON (`10-architecture.md` Bagian 5), memiliki proteksi `try/catch` + `Carbon::parse` aman + filter `search[value]`, dan seluruh tampilan badge/aksi dirender aman di `columns[].render` JS memakai `escapeHtml()` (`30-ui-frontend.md` Bagian 12).
* **Audit N+1 Query & Prioritas Database Views**: Pastikan endpoint daftar / DataTables tidak mengeksekusi kueri database berulang di dalam perulangan loop baris data (`foreach ($records as $item)`). Jika memerlukan data agregasi lintas tabel (tiket, koli paket, status boarding), wajib memanfaatkan Database View (`v_manifest`, `v_transactions`, `v_package_transactions`) dalam 1 kueri tunggal (*single query*).
* **Audit Definisi Database View & Single-Source Projection (Anti-Double Join & Anti-Penyensoran Data Baru - Kasus #41)**: Jika modul/fitur mengonsumsi Database View (`v_...`), AI Agent **WAJIB** membaca definisi `CREATE VIEW` pada dump SQL terbaru. Pastikan: (1) Bebas join ganda ke tabel master fisik yang sudah di-join di dalam View (anti-2x proses), (2) Bebas klausa `WHERE` prematur/kaku (seperti `vehicle_list_id > 0`, `driver_id > 0`) yang menyembunyikan jadwal/manifest baru yang armadanya belum ditentukan dari antarmuka staf operasional, (3) Seluruh kolom View diproyeksikan langsung via `vm.*` (Single-Source Projection), dan (4) Jika ada kolom master yang kurang (misal `vehicle_code` atau `layout_name`), komunikasikan secara transparan ke tim database alih-alih me-join ulang di Laravel (SSOT: [`21-database-reasoning.md`](../rules/21-database-reasoning.md) Bagian 5).
* **Klasifikasi Celah & Solusi (`[CORE FLOW]` vs `[DI LUAR CORE FLOW / OPSIONAL PELENGKAP]`)**:
  * Pastikan penyesuaian utama merujuk langsung ke **`[CORE FLOW]`** yang memiliki celah.
  * Penyesuaian preventif / *edge case* untuk melengkapi area di luar core flow tetap **wajib dicantumkan dan dijelaskan**, namun dipisahkan dengan label **`[DI LUAR CORE FLOW / OPSIONAL PELENGKAP]`** beserta **pertimbangan *impact*-nya** (dampak bila ditambah vs bila dilewati) agar pengguna memahami alurnya dan dapat menentukan persetujuan per item.
* **Simulasi Testing Impact Menggunakan Data Nyata (WAJIB untuk `[CORE FLOW]` & `[DI LUAR CORE FLOW / OPSIONAL PELENGKAP]`)**:
  * Setiap skenario celah wajib dilengkapi ilustrasi konkret berbasis **data contoh / baris DB aktual** (simulasi *read-only* tanpa mutasi langsung ke `transport_system`), disajikan ringkas dengan format berikut:
    - **Tabel Simulasi `[CORE FLOW]`**: `Skenario | Data Uji Input / Record DB | Hasil SEBELUM Fix | Hasil SESUDAH Fix`
    - **Tabel Simulasi `[DI LUAR CORE FLOW / OPSIONAL PELENGKAP]`**: `Opsi & Celah | Contoh Data Uji Nyata | Dampak Jika Diabaikan | Dampak Jika Diterapkan`
  * Catatan Ruang Lingkup: Simulasi ini melengkapi proses **Review, Planning, Evaluasi & Fix-Bug** agar pengguna paham alur & dampak nyata sebelum eksekusi; sedangkan **Set Data Uji Manual Pasca-Development Form** (*field input form vs kolom DB tersimpan*) tetap disajikan terpisah setelah perubahan form selesai dikerjakan.

### 4. Status Permission, Konsultasi SP/View & Skrip SQL Manual phpMyAdmin
* **Status Permission & Menu di `transport_system`**:
  - Apakah menu dan hak akses sudah lengkap di `menus` & `permissions`?
  - **Jika SUDAH ADA**: Konfirmasikan ketersediaannya secara transparan. **DILARANG** menyertakan query SQL dummy data bisnis.
  - **Jika BELUM ADA / KOSONG**: Berikan **Fallback Feedback** transparan dan siapkan query SQL `INSERT` khusus registrasi menu/permission untuk dieksekusi manual di phpMyAdmin (Zero-Direct-CRUD).
* **Kesiapan Berkas Migrasi Statis (`Schema::create`)**:
  - Pastikan tabel modul memiliki berkas migrasi `Schema::create` (bukan alter) yang presisi sesuai SQL dump terbaru di `database/migrations/` (tanpa menjalankan CLI `migrate`).
* **Konsultasi Optimization Gate Multi-Domain (Sesuai Stack Proyek)**:
  - **Database / Backend** (*jika memuat join multi-tabel berat atau mutasi transaksi atomik*): AI **WAJIB menawarkan secara proaktif** Stored Procedure (`sp_...`) atau Database View (`v_...`) lengkap dengan `SQL SECURITY INVOKER` / `SET search_path = public, pg_temp`, error rollback handler, parameter sanitization, dan pencegahan N+1 query.
  - **Frontend / UI**: audit ukuran bundle/lazy-loading, penghindaran re-render berlebih, dan kepatuhan WCAG AA / mobile reflow.
  - **3D WebGL / Diorama**: batasi `devicePixelRatio <= 2.0`, kontrol jumlah draw calls, wajib `.dispose()` pada geometry/material/texture saat swap aset, serta render deterministik `f(t)`.
  - **Video & Motion**: pantau anggaran `ms/frame`, pekerja paralel, sinkronisasi audio-visual, dan cek contact sheet sebelum encode akhir.
* **Kueri SQL Siap Pakai**:
  ```sql
  -- DDL/DML untuk dieksekusi manual oleh pengguna di phpMyAdmin / database console
  -- 1. Skrip Pembuatan (CREATE TABLE / VIEW / PROCEDURE)
  -- 2. Skrip Uji Coba Pemanggilan (Smoke Test)
  -- 3. Skrip Rollback (DROP ... IF EXISTS)
  ```
* **Penanganan Anggun di Kode (*Graceful Fallback*)**:
  - Pastikan kode memberikan notifikasi/flash message informatif jika konfigurasi belum diset, bukan fatal crash 500.

### 5. Visual Planning Gate & Jangkar Referensi (Khusus Fitur Antarmuka / UI)
*Wajib disertakan jika pengerjaan melibatkan pembuatan atau perubahan tampilan UI:*
* **ASCII Layout Wireframe**: Gambaran visual kasar tata letak komponen (Header, KPI Cards, Filter Bar, Table/Grid, Pagination, Modal/Drawer).
* **Jangkar Referensi (*Visual Anchor*)**:
  - *Metode A*: Minta/gunakan screenshot desain dari `scratch/ui-references/` (misal: `scratch/ui-references/mockup.png`).
  - *Metode B*: Kiblat desain acuan (misal: *Untitled UI / Stripe Dashboard* atau *Vercel Dark Mode*).
  - *Metode C*: Penawaran pembuatan mockup AI via `generate_image` jika pengguna belum memiliki gambaran kasar.
* **Skill Aktif**: Deklarasi skill yang diaktifkan (misal: `skills/untitled-ui`, `skills/shadcn-ui`, `skills/21st-dev`). Dilarang slicing dari `<div>` mentah.
* **Persistensi State**: Pastikan aset acuan disimpan di `scratch/` untuk state session yang dapat dipakai kembali.

### 6. Konfirmasi Tindak Lanjut (Human-in-the-Loop Approval)
* Mengajukan pertanyaan persetujuan kepada pengguna terhadap logika, skrip SQL manual, dan wireframe visual sebelum mulai menulis kode.
```
