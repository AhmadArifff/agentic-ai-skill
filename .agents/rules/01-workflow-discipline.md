---
description: Workflow Discipline, Review Gate & Bug Knowledge Management (Always Loaded)
always_apply: true
---

# 01. Workflow Discipline, Review Protocol & Knowledge Base

Dokumen ini mengatur tata kelola pengerjaan tugas oleh AI Agent agar setiap fitur dan perbaikan bug dikerjakan secara terkontrol, aman, dan terdokumentasi.

---

## 1. Protokol Wajib Review Sebelum Development (Review Gate)
Setiap permintaan pengembangan fitur baru, perbaikan bug tampilan, bug logika, maupun adopsi menu baru (seperti `schedule` / jadwal perjalanan) **WAJIB melalui 4 tahapan OODA**:

### Tahap 1: Analisis & Komparasi Sistem (Observe & Orient)
* **Fokus Database**: Periksa skema database `transport_system`. Gunakan file dump SQL (`*.sql`) sebagai sumber referensi.
* **Komparasi Mendalam**: Bandingkan sistem saat ini (`adminShuttleV3`) dengan sistem referensi legacy (`admin-sunjaya`) pada 4 dimensi:
  1. **Data Database**: Nama tabel, tipe kolom, dan relasi.
  2. **Logika Bisnis (Logic)**: Alur proses, formula hitungan, dan validasi.
  3. **Metode & Service**: Struktur method di Controller/Service/Repository.
  4. **Tampilan & UX**: Tata letak, kartu summary, filter, tabel, dan warna.
* **Prinsip Utama Adopsi**:
  * Utamakan mengadopsi styling, komponen, dan konvensi yang **SUDAH ADA di `adminShuttleV3`** (seperti Laporan CSO, layout card seragam, ReportExporter) daripada menjiplak mentah-mentah kode lama yang sudah usang.

### Tahap 2: Penyusunan Dokumen Review & Analisis Dampak (Decide)
Sebelum menyentuh kode aplikasi, AI menyajikan dokumen review kepada pengguna yang berisi:
1. **Status Fitur / Bug Saat Ini**.
2. **Hasil Komparasi dengan Sistem Referensi**.
3. **Analisis Dampak Sebelum & Sesudah (Before vs After Flow)**:
   * **Before**: Bagaimana sistem/halaman berjalan saat ini beserta kendala/bug-nya.
   * **After**: Bagaimana alur sistem baru setelah fitur diadopsi atau bug diperbaiki.
   * **Dampak**: Komponen apa saja yang terpengaruh (routing, controller, tabel, performa).
4. **Skrip SQL Manual (Jika Dibutuhkan)**:
   * Jika ada pendaftaran menu (`menus`), hak akses (`permissions`), atau skema kolom baru, sediakan query SQL manual siap pakai untuk phpMyAdmin. **Jangan lakukan injection CRUD langsung ke database**.

### Tahap 3: Menunggu Konfirmasi Pengguna (Approval Gate)
* **DILARANG KERAS** mulai memodifikasi atau membuat file sebelum pengguna menyatakan persetujuan secara eksplisit terhadap hasil review dan alur yang diajukan.

### Tahap 4: Eksekusi Terarah & Pengujian (Act)
* Terapkan perubahan sesuai cakupan yang disepakati (*laser-focused*).
* Uji coba render view atau validasi kueri.
* Hapus seluruh berkas sementara di `scratch/`.
* Segarkan cache: `php artisan optimize:clear`.

---

## 2. Manajemen Kasus Bug ke Knowledge Base (`.agents/knowledge/`)
Setiap kali AI berhasil menyelesaikan perbaikan bug (tampilan, responsive, logic, query DB, atau otorisasi), AI **WAJIB mencatatkan studi kasusnya ke berkas [`.agents/knowledge/bug-cases.md`](../knowledge/bug-cases.md)**:

Format Pencatatan:
1. **ID & Nama Kasus**: Ringkasan singkat bug.
2. **Gejala Masalah (Symptom)**: Apa yang salah pada tampilan/logic (sertakan konteks Before).
3. **Akar Masalah (Root Cause)**: Mengapa bug tersebut terjadi.
4. **Solusi & Penanganan (Fix Applied)**: File yang diubah dan potongan kode perbaikan (After).
5. **Pelajaran untuk Sesi Berikutnya (Key Takeaway)**: Aturan pencegahan agar bug serupa tidak terulang.

---

## 3. Disiplin Batasan Tugas & Kebersihan Repositori
1. **Anti Scope-Creep**: Hanya sentuh file yang relevan dengan tugas yang diminta.
2. **Full English Naming**: Simbol kode (class, function, variable, folder) wajib bahasa Inggris baku.
3. **Bahasa Indonesia**: Khusus untuk label antarmuka pengguna (UI) dan komunikasi di chat.
4. **Keamanan Git**: Berkas aturan, knowledge, `.agents/`, `.agent/`, dan file `.sql` telah dimasukkan ke `.gitignore` dan tidak boleh di-force add ke repositori Git.

---

## 4. Standar Penulisan Komentar Kode Bersih (Code Comment Hygiene — Anti-Slop)
Setelah review disetujui dan AI mulai menulis kode, perhatikan etika penulisan komentar berikut:

1. **Ringkas, Sederhana & Langsung ke Tujuan**:
   * Komentar kode harus padat (1-2 baris). Jelaskan *apa/tujuan* fungsional blok kode tersebut, bukan mengulang sintaks yang sudah jelas.
2. **DILARANG Menulis Komentar Banner Raksasa & Kutipan Aturan AI**:
   * Dilarang membuat border dekoratif ASCII besar (garis panjang `===`, `---`, blok banner 10 baris).
   * Dilarang mencantumkan referensi aturan AI seperti `(RULESCODE.md - Bab 7)` atau penanda mesin lainnya. Sistem ini dikerjakan oleh tim developer manusia, sehingga kode harus terlihat bersih, rapi, dan natural.
3. **Contoh Komparasi Penulisan Komentar**:

* **CSS / Styling**:
  * ❌ *Salah (Slop / Banner Raksasa)*:
    ```css
    /* ==========================================================================
       STANDARISASI KONTRAS & HIRARKI WARNA TABEL LAPORAN (RULESCODE.md - Bab 7)
       3-Tier Luminance Hierarchy:
       1. thead th : Header Kolom Pekat & Berkarakter
       ========================================================================== */
    ```
  * ✅ *Benar (Ringkas & Developer-Friendly)*:
    ```css
    /* Header tabel laporan: styling kontras pekat & tegas */
    ```

* **PHP / Backend Logic**:
  * ❌ *Salah*:
    ```php
    // MENERAPKAN STRICT ARCHITECTURE LAYER BAB 10 DIMANA CONTROLLER MEMANGGIL SERVICE TANPA BYPASS
    ```
  * ✅ *Benar*:
    ```php
    // Ambil rekap transaksi per outlet untuk data laporan
    ```

* **JavaScript / DataTables**:
  * ❌ *Salah*:
    ```javascript
    /* IMPLEMENTASI ZERO-DOUBLE-SCROLL BAB 41 DENGAN UNWRAP TABLE RESPONSIVE DAN SINKRONISASI 3 ARAH */
    ```
  * ✅ *Benar*:
    ```javascript
    // Sinkronisasi scroll horizontal header, body, dan footer
    ```

