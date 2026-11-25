---
description: Workflow Discipline, Review Gate & Bug Knowledge Management (Always Loaded)
always_apply: true
---

# 01. Workflow Discipline, Review Protocol & Knowledge Base

Dokumen ini mengatur tata kelola pengerjaan tugas oleh AI Agent agar setiap fitur dan perbaikan bug dikerjakan secara terkontrol, aman, dan terdokumentasi.

---

## 1. Protokol Wajib Review Sebelum Development (Review Gate)
Setiap permintaan pengembangan fitur baru, perbaikan bug tampilan, bug logika, maupun adopsi menu baru (seperti `schedule` / jadwal perjalanan) **WAJIB melalui 4 tahapan OODA**:

### Tahap 1: Analisis, Aktivasi Skill & Komparasi Sistem (Observe & Orient)
* **Skill Activation Gate (Universal)**: Cek daftar `adopted_skills` di `session-state.json` (atau `AGENTS.md` lokal), tentukan skill yang relevan untuk tugas ini, dan baca `SKILL.md`-nya sebelum menyusun desain agar bebas *Passive Skill Syndrome*.
* **Add-on Proyek Laravel / MySQL (`adminShuttleV3` - Lewati di Proyek Non-Laravel)**:
  * **Fokus Database**: Periksa skema database `transport_system`. Gunakan file dump SQL (`*.sql`) sebagai sumber referensi.
  * **Komparasi Mendalam**: Bandingkan sistem saat ini (`adminShuttleV3`) dengan sistem referensi legacy (`admin-sunjaya`) pada 4 dimensi: Data Database, Logika Bisnis, Metode & Service, serta Tampilan & UX. Utamakan pola eksisting `adminShuttleV3` (Laporan CSO, layout card seragam, ReportExporter).

### Tahap 2: Penyusunan Dokumen Review & Analisis Dampak (Decide)
Sebelum menyentuh kode aplikasi, AI menyajikan dokumen review kepada pengguna yang berisi:
1. **Status Fitur / Bug Saat Ini & Tabel Terdampak Saat INSERT**:
   * Rincikan tabel-tabel database yang terdampak saat operasi simpan/INSERT pada fitur baru (tabel utama, tabel relasi/pivot, kolom kunci, serta foreign key terkait).
2. **Deklarasi Data Engine Strategy (WAJIB)**:
   * Nyatakan tegas apakah fitur beroperasi via **`PURE DIRECT DB CRUD`** (100% kueri database lokal) atau **`HYBRID / MICROSERVICE API`** (terhubung ke API eksternal/pusat).
   * Konfirmasikan apakah tim backend eksternal **perlu atau TIDAK PERLU** membuat endpoint baru, dan gunakan *Contract-First JSON Payload* bila diperlukan.
3. **Hasil Komparasi & Audit Skenario Celah Lapangan (WAJIB Tidak Boleh Di-skip)**:
   * Komparasi 4-dimensi dengan sistem referensi (Database, Logic, Service, UI & Reusable Component).
   * Audit menyeluruh kemungkinan skenario celah lapangan (*edge-cases*): sinkronisasi status antar-menu (*Single Source of Truth Guard*), guard batas waktu (`ETD` / kadaluarsa), kesesuaian aksi tombol UI vs backend guard, risiko duplikasi log tracking, dan integritas tabel anak/relasi (`forwards`, dll).
4. **Analisis Dampak Sebelum & Sesudah (Before vs After Flow) dengan Analogi Nyata (WAJIB)**:
   * **Analogi Dunia Nyata Sederhana**: Sertakan 1 analogi operasional nyata agar nilai inti (*core values*) fitur langsung dipahami oleh pemangku kepentingan non-teknis.
   * **Before**: Bagaimana sistem/halaman berjalan saat ini beserta kendala/bug-nya.
   * **After**: Bagaimana alur sistem baru setelah fitur diadopsi atau bug diperbaiki.
   * **Dampak**: Komponen apa saja yang terpengaruh (routing, controller, tabel, performa).
5. **Skrip SQL Manual (Jika Dibutuhkan)**:
   * Jika ada pendaftaran menu (`menus`) atau hak akses (`permissions`) yang belum tersedia di DB, sediakan query SQL manual siap pakai untuk phpMyAdmin. **Jangan menyertakan SQL dummy data bisnis dan jangan lakukan injection CRUD langsung ke database**.

### Tahap 3: Menunggu Konfirmasi Pengguna (Approval Gate)
* **DILARANG KERAS** mulai memodifikasi atau membuat file sebelum pengguna menyatakan persetujuan secara eksplisit terhadap hasil review dan alur yang diajukan.

### Tahap 4: Eksekusi Terarah, Evaluasi Celah & Verifikasi Tier 0 (Act)
* Terapkan perubahan sesuai cakupan yang disepakati (*laser-focused*) dengan mematuhi best practice dari `SKILL.md` yang diaktifkan.
* Lakukan **Evaluasi Celah Lintas-Menu (*Post-Fix Field Gap Check*)**: pastikan perubahan/fix bug tidak meninggalkan inkonsistensi di menu/halaman lain maupun hardcode timezone statis.
* Jalankan **Verifikasi Tier 0 (Wajib Otomatis sesuai Stack)**:
  * Syntax lint / typecheck / build (`npm run build` / `tsc --noEmit` / `node --check` / `python -m py_compile` atau `php -l` + `php artisan optimize:clear` khusus Laravel).
  * Mandatory Delivery Gate 4-Blok (`antislop`: 0 em dash, kontras WCAG AA, zero mobile overflow, data riil, tanpa link mati) dan Co-Developer Non-Regression Guard (`git diff`).
  * Pengujian mendalam Tier 1/Tier 2 (Playwright / `qa-kernel.php` / `diorama` QA harness) mengikuti kebijakan [`workflows/post-dev-qa.md`](../workflows/post-dev-qa.md).
* Hapus seluruh berkas sementara di `scratch/`.

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
5. **Eliminasi Dead Code & Zombie Code**: Dilarang meninggalkan kode mati (*dead code*), logika terbengkalai, atau elemen tampilan sisa iterasi development sebelumnya. Seluruh kode versi lama yang sudah tidak terpakai wajib dihapus tuntas agar basis kode selalu bersih (*clean code*).
6. **Label UI Bersih & Human-Friendly (Bebas Jargon Teknis)**: Dilarang menampilkan detail/jargon teknis kode ke antarmuka pengguna (seperti `Password (16 Karakter):`, `random string 16 karakter acak`, atau `disanitasi dari karakter injeksi`). Label UI, modal, dan pesan sistem wajib menggunakan istilah umum yang bersih dan mudah dipahami manusia (misal cukup `Password :`).

---

## 4. Standar Penulisan Komentar Kode Bersih (Code Comment Hygiene - Anti-Slop)
Setelah review disetujui dan AI mulai menulis kode, perhatikan etika penulisan komentar berikut:

1. **Ringkas, Sederhana & Langsung ke Tujuan**:
   * Komentar kode harus padat (1-2 baris). Jelaskan *apa/tujuan* fungsional blok kode tersebut, bukan mengulang sintaks yang sudah jelas.
2. **Larangan Mutlak Istilah Prompt, Benchmarking Legacy & Meta-Rules AI**:
   * Dilarang menulis nama sistem referensi lama (misal `admin-sunjaya`, `sunjaya_dev`) atau istilah benchmarking (`100% Parity`) di komentar kode produksi.
   * Dilarang mencantumkan referensi aturan internal AI (`RULESCODE.md - Bab 7`, `7 Pilar .agents`), catatan defensif Git (`// Tidak mengganggu commit rekan`), atau narasi percakapan (`// Sesuai diskusi chat`).
   * Dilarang membuat border dekoratif ASCII besar (garis panjang `===`, `---`, blok banner 10 baris). Kode harus bersih dan natural.
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

---

## 5. Disiplin Pembersihan Kode Sisa Iterasi (Dead Code Elimination)
Dalam siklus development yang melibatkan revisi bertahap (V1 -> V2 -> V3):
1. **Wajib Purge Saat Iterasi Lanjutan**: Seluruh kode tampilan (Blade/DOM/modal lama), event listener JS, dan method backend usang dari versi sebelumnya yang sudah tidak dipakai lagi **wajib langsung dihapus bersih**.
2. **Anti-Zombie Code**: Dilarang hanya mematikan kode dengan tanda komentar (`//` atau `/* */`).

---

## 6. Audit Non-Regresi Terhadap Commit Rekan Tim (*Co-Developer Commit Protection*)
1. **Pemeriksaan Wajib Sebelum Menyelesaikan Task**: Sebelum menyerahkan hasil pengerjaan, jalankan audit Git (`git blame` / `git diff` / `git log`) pada file yang disentuh untuk memastikan tidak ada logika, fungsi, atau rute milik rekan pengembang lain (seperti riwayat commit `"Hendris"` di `adminShuttleV3`) yang terhapus atau tertimpa.
2. **Prosedur Konfirmasi Human-in-the-Loop**: Jika suatu task mengharuskan penyesuaian pada kode milik rekan tim, AI wajib berhenti dan memaparkan baris terdampak serta *impact analysis* kepada pengguna sebelum melanjutkan.

