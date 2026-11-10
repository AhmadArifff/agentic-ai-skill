# Workflow: Protokol Wajib Review Sebelum Development & Fix Bug

SOP ini wajib dijalankan oleh AI Agent **sebelum menulis atau mengubah kode apapun** pada setiap sesi pengembangan fitur baru, penambahan menu acuan (seperti `schedule`), maupun perbaikan bug.

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
> **Disiplin Eksekusi Koding**: Saat menulis kode aplikasi, gunakan komentar fungsional yang ringkas (1–2 baris). DILARANG menulis komentar banner ASCII raksasa atau mencantumkan kutipan bab aturan internal AI (`RULESCODE.md - Bab X`). Kode harus bersih dan mudah dipahami oleh seluruh tim pengembang.

---

## Format Laporan Review Wajib kepada Pengguna:

Ketika pengguna memberikan instruksi fitur/bug baru, AI wajib merespon dengan format review terstruktur berikut:

```markdown
### 1. Status & Temuan Awal
* Menjelaskan kondisi fitur/bug pada basis kode saat ini.
* **Basis Data Operasional**: `transport_system` (skema dipelajari dari berkas `transport_system-*.sql` di root).
* **Basis Data Referensi Lama**: `sunjaya_dev` (skema dipelajari dari berkas `sunjaya_dev_*.sql` di root).
* **Tabel Database yang Terdampak Saat INSERT (Penyimpanan Data Baru)**:
  - **Tabel Utama**: Nama tabel penampung data form utama, tipe kolom, dan primary key.
  - **Tabel Relasi / Pivot**: Tabel anak atau log aktivitas yang ikut terisi record baru.
  - **Keterkaitan Foreign Key / Master**: Relasi ke tabel master pendukung.

### 2. Strategi Akses Data (Data Engine Strategy) & Komparasi Sistem
* **Strategi Akses Data (WAJIB)**:
  - **Tipe Engine**: Nyatakan tegas apakah fitur beroperasi secara **`PURE DIRECT DB CRUD`** (100% database lokal) ATAU **`HYBRID / MICROSERVICE API`** (terhubung ke API eksternal/pusat).
  - **Status Keterlibatan Tim Backend Eksternal**: Jelaskan apakah tim API eksternal **perlu atau TIDAK PERLU membuat endpoint baru** (beserta draf kontrak JSON jika perlu).
* **Komparasi 4-Dimensi dengan Sistem Referensi (`admin-sunjaya`)**:
  - **Data Database**: Tabel dan kolom terkait pada `transport_system` vs `sunjaya_dev`.
  - **Logika Bisnis (Logic)**: Validasi dan formula perhitungan.
  - **Metode / Arsitektur**: Struktur Controller -> Service -> Repository.
  - **Tampilan (UI/UX)**: Layout filter, tabel, dan komponen (wajib audit ketersediaan modal/partial reusable agar tidak duplikasi kode).

### 3. Analisis Alur Kerja Before vs After (Wajib Analogi Nyata)
* **Analogi Dunia Nyata Sederhana (WAJIB)**:
  - Sajikan 1 analogi operasional nyata agar pengguna dan pemangku kepentingan non-teknis langsung memahami nilai inti (*core values*) fitur tanpa jargon kode.
* **Alur SEBELUM (Before)**:
  - Bagaimana alur kerja / kondisi kode saat ini.
  - Kendala, bug, atau ketiadaan fitur yang terjadi.
* **Alur SESUDAH (After)**:
  - Bagaimana alur kerja baru setelah fitur diadopsi atau bug diperbaiki.
  - Peningkatan performa, kemudahan navigasi, atau kebersihan visual.
* **Dampak & Dependensi**:
  - File apa saja yang akan dibuat / diubah dan jaminan non-regresi terhadap commit rekan pengembang lain.

### 3B. Audit Wajib Skenario Celah Lapangan (Review, Planning, Evaluasi & Fix-Bug)
* **Konsistensi Lintas Menu & Tampilan**: Periksa apakah aturan/validasi baru sudah sinkron antara halaman order, list, detail, modal, serta menu operasional lain melalui *Single Source of Truth Guard*.
* **Batas Waktu Real-Time & State-Machine**: Pastikan zona waktu mengikuti `config('app.timezone')` (anti hardcode timezone statis), batas `ETD`/kadaluarsa tidak mengunci prematur saat cetak dokumen persiapan, serta urutan perubahan status valid di semua jalur.
* **Integritas Tabel Anak & Audit Log**: Pastikan tabel relasi (`forwards`, `trackings`, dll.) ikut diperbarui dan tidak terjadi duplikasi remark maupun status macet (*stuck*).

### 4. Status Permission, Konsultasi SP/View & Skrip SQL Manual phpMyAdmin
* **Status Permission & Menu di `transport_system`**:
  - Apakah menu dan hak akses sudah lengkap di `menus` & `permissions`?
  - **Jika SUDAH ADA**: Konfirmasikan ketersediaannya secara transparan. **DILARANG** menyertakan query SQL dummy data bisnis.
  - **Jika BELUM ADA / KOSONG**: Berikan **Fallback Feedback** transparan dan siapkan query SQL `INSERT` khusus registrasi menu/permission untuk dieksekusi manual di phpMyAdmin (Zero-Direct-CRUD).
* **Kesiapan Berkas Migrasi Statis (`Schema::create`)**:
  - Pastikan tabel modul memiliki berkas migrasi `Schema::create` (bukan alter) yang presisi sesuai SQL dump terbaru di `database/migrations/` (tanpa menjalankan CLI `migrate`).
* **Konsultasi Stored Procedure / Database View (Optimization Gate)**:
  - *Jika tugas memuat join multi-tabel berat atau mutasi transaksi atomik*: AI **WAJIB menawarkan secara proaktif**:
    > *"Untuk modul ini, apakah Anda ingin kita implementasikan menggunakan **Stored Procedure (`sp_...`)** atau **Database View (`v_...`)** agar lebih optimal? Keuntungannya: kueri pre-compiled di database lebih cepat, logic reusable tanpa membuat fungsi berulang di controller, serta transaksi atomik terlindungi."*
  - Jelaskan aspek keamanan: `SQL SECURITY INVOKER` (MySQL) atau `SET search_path = public, pg_temp` (Postgres/Supabase), error rollback handler, dan parameter sanitization.
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
