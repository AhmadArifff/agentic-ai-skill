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

### 2. Komparasi dengan Sistem Referensi (admin-sunjaya)
* **Data Database**: Tabel dan kolom terkait pada `transport_system` vs `sunjaya_dev`.
* **Logika Bisnis (Logic)**: Validasi dan formula perhitungan.
* **Metode / Arsitektur**: Struktur Controller ➔ Service ➔ Repository.
* **Tampilan (UI/UX)**: Layout filter, tabel, dan komponen (diutamakan mengikuti pola yang sudah ada di adminShuttleV3 seperti Laporan CSO).

### 3. Analisis Dampak Alur Kerja (Before vs After Flow)
* **Alur SEBELUM (Before)**:
  - Bagaimana alur kerja / kondisi kode saat ini.
  - Kendala, bug, atau ketiadaan fitur yang terjadi.
* **Alur SESUDAH (After)**:
  - Bagaimana alur kerja baru setelah fitur diadopsi atau bug diperbaiki.
  - Peningkatan performa, kemudahan navigasi, atau kebersihan visual.
* **Dampak & Dependensi**:
  - File apa saja yang akan dibuat / diubah.
  - Apakah mempengaruhi modul lain (zero side-effects).

### 4. Fallback Feedback & Skrip SQL Manual phpMyAdmin
* **Status Ketersediaan Data di `transport_system`**:
  - Apakah data tabel, menu, permission, atau master data sudah lengkap?
  - Jika **TIDAK TERSEDIA / KOSONG**: Berikan **Fallback Feedback** transparan dan siapkan query SQL `INSERT` di bawah untuk ditambahkan pengguna ke phpMyAdmin secara manual (Dilarang silent bypass atau mock data palsu).
* **Kueri SQL Siap Pakai**:
  ```sql
  -- DDL/DML untuk dieksekusi manual oleh pengguna di phpMyAdmin
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
