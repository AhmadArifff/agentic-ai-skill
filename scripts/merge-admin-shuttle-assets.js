/**
 * Automated Asset Synchronization from adminShuttleV3 to Master Hub (agentic AI)
 * Ensures:
 * 1. Zero Overlap / Redundancy
 * 2. Anti-Slop R-02 Compliance (strictly zero em dash '—', replaced with '-' or ':')
 * 3. Preservation of all master hub extensions (Archify, Stack Diagram, Visual Planning Gate)
 */

const fs = require('fs');
const path = require('path');

const ADMIN_PATH = 'C:/Users/ASUS/Documents/Web Dev/sunjaya/Roleback/adminShuttleV3/.agents';
const HUB_ROOT = path.resolve(__dirname, '..');

function cleanEmDash(str) {
    return str.replace(/—/g, ' - ').replace(/\s+-\s+/g, ' - ');
}

// ---------------------------------------------------------
// 1. Bug Cases #30 to #47
// ---------------------------------------------------------
console.log('1. Processing Bug Cases...');
const adminBugPath = path.join(ADMIN_PATH, 'knowledge/bug-cases.md');
const adminBugContent = fs.readFileSync(adminBugPath, 'utf8');
const adminBugLines = adminBugContent.split(/\r?\n/);

const idx30 = adminBugLines.findIndex(l => l.includes('### Kasus #30:'));
const idx47First = adminBugLines.findIndex(l => l.includes('### Kasus #47:'));
const idx47Second = adminBugLines.findIndex((l, i) => i > idx47First && l.includes('### Kasus #47:'));

let kasusSlice = adminBugLines.slice(idx30, idx47Second);
while (kasusSlice.length && (kasusSlice[kasusSlice.length - 1].trim() === '---' || kasusSlice[kasusSlice.length - 1].trim() === '')) {
    kasusSlice.pop();
}

const cleanedCasesText = cleanEmDash(kasusSlice.join('\n'));

const masterBugPath = path.join(HUB_ROOT, 'knowledge/bug-cases.md');
let masterBugContent = fs.readFileSync(masterBugPath, 'utf8');

if (!masterBugContent.includes('### Kasus #30:')) {
    masterBugContent = masterBugContent.trimEnd() + '\n\n---\n\n' + cleanedCasesText + '\n';
    fs.writeFileSync(masterBugPath, masterBugContent, 'utf8');
    console.log('-> Appended Kasus #30 to #47 to knowledge/bug-cases.md');
} else {
    console.log('-> Kasus #30 already present in knowledge/bug-cases.md');
}

// ---------------------------------------------------------
// 2. workflows/post-dev-qa.md
// ---------------------------------------------------------
console.log('2. Processing workflows/post-dev-qa.md...');
const adminPostQaPath = path.join(ADMIN_PATH, 'workflows/post-dev-qa.md');
const adminPostQaContent = fs.readFileSync(adminPostQaPath, 'utf8');
const cleanedPostQa = cleanEmDash(adminPostQaContent);

const masterPostQaPath = path.join(HUB_ROOT, 'workflows/post-dev-qa.md');
fs.writeFileSync(masterPostQaPath, cleanedPostQa, 'utf8');
console.log('-> Created workflows/post-dev-qa.md');

// ---------------------------------------------------------
// 3. scripts/qa-kernel.php
// ---------------------------------------------------------
console.log('3. Processing scripts/qa-kernel.php...');
const adminQaKernelPath = path.join(ADMIN_PATH, 'scripts/qa-kernel.php');
if (fs.existsSync(adminQaKernelPath)) {
    const qaKernelContent = fs.readFileSync(adminQaKernelPath, 'utf8');
    const masterQaKernelPath = path.join(HUB_ROOT, 'scripts/qa-kernel.php');
    fs.writeFileSync(masterQaKernelPath, qaKernelContent, 'utf8');
    console.log('-> Created scripts/qa-kernel.php');
}

// ---------------------------------------------------------
// 4. workflows/task-review-protocol.md
// ---------------------------------------------------------
console.log('4. Upgrading workflows/task-review-protocol.md...');
const masterTaskProtoPath = path.join(HUB_ROOT, 'workflows/task-review-protocol.md');

const upgradedTaskProtocol = `# Workflow: Protokol Wajib Review Sebelum Development & Fix Bug

SOP ini wajib dijalankan oleh AI Agent **sebelum menulis atau mengubah kode apapun** pada setiap sesi pengembangan fitur baru, penambahan menu acuan (seperti \`schedule\`), maupun perbaikan bug.

---

## 📋 Alur Kerja Standar (SOP 7 Pilar)

\`\`\`
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
\`\`\`

> [!TIP]
> **Disiplin Eksekusi Koding**: Saat menulis kode aplikasi, gunakan komentar fungsional yang ringkas (1-2 baris). DILARANG menulis komentar banner ASCII raksasa atau mencantumkan kutipan bab aturan internal AI (\`RULESCODE.md - Bab X\`). Kode harus bersih dan mudah dipahami oleh seluruh tim pengembang.

---

## Format Laporan Review Wajib kepada Pengguna:

Ketika pengguna memberikan instruksi fitur/bug baru, AI wajib merespon dengan format review terstruktur berikut:

\`\`\`markdown
### 1. Status & Temuan Awal
* Menjelaskan kondisi fitur/bug pada basis kode saat ini.
* **Basis Data Operasional**: \`transport_system\` (skema dipelajari dari berkas \`transport_system-*.sql\` di root).
* **Basis Data Referensi Lama**: \`sunjaya_dev\` (skema dipelajari dari berkas \`sunjaya_dev_*.sql\` di root).
* **Tabel Database yang Terdampak Saat INSERT (Penyimpanan Data Baru)**:
  - **Tabel Utama**: Nama tabel penampung data form utama, tipe kolom, dan primary key.
  - **Tabel Relasi / Pivot**: Tabel anak atau log aktivitas yang ikut terisi record baru.
  - **Keterkaitan Foreign Key / Master**: Relasi ke tabel master pendukung.
* **Audit Definisi View & Kontrak Pengurutan SP**: Periksa tabel master yang sudah di-join di dalam View tersebut. DILARANG melakukan join ganda ke tabel fisik yang sama di Laravel (anti-2x proses), DILARANG memasang filter \`WHERE\` kaku (\`vehicle_list_id > 0\`, \`driver_id > 0\`) yang menyembunyikan jadwal/manifest baru, proyeksikan kolom langsung via \`vm.*\` (Kasus #41), dan **WAJIB mempertahankan urutan bawaan (*native ORDER BY*) Stored Procedure** (misal jadwal non-aktif di paling bawah tabel) tanpa menimpanya dengan sorting koleksi sembarangan di PHP (Kasus #43).

### 2. Strategi Akses Data (Data Engine Strategy) & Komparasi Sistem
* **Strategi Akses Data (WAJIB)**:
  - **Tipe Engine**: Nyatakan tegas apakah fitur beroperasi secara **\`PURE DIRECT DB CRUD\`** (100% database lokal) ATAU **\`HYBRID / MICROSERVICE API\`** (terhubung ke API eksternal/pusat).
  - **Status Keterlibatan Tim Backend Eksternal**: Jelaskan apakah tim API eksternal **perlu atau TIDAK PERLU membuat endpoint baru** (beserta draf kontrak JSON jika perlu).
* **Deklarasi Metode Eksekusi Pengujian (Testing Execution Method - Kasus #42)**:
  - **Alur di Dalam Admin**: **\`BROWSER UI FLOW (Playwright)\`** (standar mutlak untuk menguji alur aplikasi secara end-to-end melalui formulir antarmuka pengguna).
  - **Alur di Luar Admin**: **\`PAUSE + QUERY SQL PHPMYADMIN\`** (jika ada simulasi status tiba \`arrived\` dari Aplikasi Android Driver, pengajuan penarikan supir, atau batas waktu \`ETD\`). DILARANG keras injeksi skrip/SQL langsung dari AI tanpa izin eksplisit pengguna.
* **Komparasi 4-Dimensi dengan Sistem Referensi (\`admin-sunjaya\`)**:
  - **Data Database**: Tabel dan kolom terkait pada \`transport_system\` vs \`sunjaya_dev\`.
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
  | \`/contoh-endpoint\` | \`public/js/apps/.../file.js\` | Kolom \`CHECKIN\` baris ikon paket | **Hapus** baris paket; pertahankan baris tiket |
  | \`/contoh-endpoint/detail/{id}\` | \`resources/views/.../detail.blade.php\` | Card \`Data Paket\` | **Tidak Disentuh / Dipertahankan** |
* **Verifikasi Pasca-Eksekusi**: Setelah koding selesai, cocokkan \`git diff --stat\` terhadap tabel di atas untuk memastikan 100% perubahan tepat sasaran tanpa efek samping pada file atau bagian lain.

### 3B. Audit Wajib Skenario Celah Lapangan (Review, Planning, Evaluasi & Fix-Bug)
* **Konsistensi Lintas Menu & Tampilan**: Periksa apakah aturan/validasi baru sudah sinkron antara halaman order, list, detail, modal, serta menu operasional lain melalui *Single Source of Truth Guard*.
* **Batas Waktu Real-Time & State-Machine**: Pastikan zona waktu mengikuti \`config('app.timezone')\` (anti hardcode timezone statis \`Asia/Makassar\`), batas \`ETD\`/kadaluarsa tidak mengunci prematur saat cetak dokumen persiapan, serta urutan perubahan status valid di semua jalur.
* **Integritas Tabel Anak & Audit Log**: Pastikan tabel relasi (\`forwards\`, \`trackings\`, dll.) ikut diperbarui dan tidak terjadi duplikasi remark maupun status macet (*stuck*).
* **Validasi Input Ekstrem & Pergantian Mode Form (Kasus #32)**: Periksa celah angka batas (\`percent 1..100\`, \`0\`, nilai negatif), *leading zero*, *paste*, pergantian jenis potongan (\`Rp\` vs \`%\`), penempatan error \`.input-group\`, serta keselarasan validasi backend \`FormRequest\` (lihat [\`30-ui-frontend.md\`](../rules/30-ui-frontend.md) Bagian 14).
* **Portabilitas & Sinkronisasi Komponen Modal Reusable (Kasus #34, #35)**: Jika menyentuh modal popup atau partial lintas-halaman, pastikan HTML partial + JS handler tidak duplikat, ID & CSS terskop ke ID modal (anti-bocor ke halaman pemanggil), Select2/Datepicker mengikat parent modal, state dibersihkan saat \`hidden.bs.modal\`, dan seluruh halaman pemanggil ikut dicek pada saat Planning, Fix-Bug, Development, maupun Evaluasi (lihat [\`30-ui-frontend.md\`](../rules/30-ui-frontend.md) Bagian 13).
* **Integritas Payload JSON Murni Endpoint GET / DataTables (Kasus #17, #47)**: Pastikan endpoint \`GET\` (\`DataTables\`, \`JsonResource\`, API) tidak menyisipkan HTML/badge mentah di response JSON (\`10-architecture.md\` Bagian 5), memiliki proteksi \`try/catch\` + \`Carbon::parse\` aman + filter \`search[value]\`, dan seluruh tampilan badge/aksi dirender aman di \`columns[].render\` JS memakai \`escapeHtml()\` (\`30-ui-frontend.md\` Bagian 12).
* **Audit N+1 Query & Prioritas Database Views**: Pastikan endpoint daftar / DataTables tidak mengeksekusi kueri database berulang di dalam perulangan loop baris data (\`foreach ($records as $item)\`). Jika memerlukan data agregasi lintas tabel (tiket, koli paket, status boarding), wajib memanfaatkan Database View (\`v_manifest\`, \`v_transactions\`, \`v_package_transactions\`) dalam 1 kueri tunggal (*single query*).
* **Audit Definisi Database View & Single-Source Projection (Anti-Double Join & Anti-Penyensoran Data Baru - Kasus #41)**: Jika modul/fitur mengonsumsi Database View (\`v_...\`), AI Agent **WAJIB** membaca definisi \`CREATE VIEW\` pada dump SQL terbaru. Pastikan: (1) Bebas join ganda ke tabel master fisik yang sudah di-join di dalam View (anti-2x proses), (2) Bebas klausa \`WHERE\` prematur/kaku (seperti \`vehicle_list_id > 0\`, \`driver_id > 0\`) yang menyembunyikan jadwal/manifest baru yang armadanya belum ditentukan dari antarmuka staf operasional, (3) Seluruh kolom View diproyeksikan langsung via \`vm.*\` (Single-Source Projection), dan (4) Jika ada kolom master yang kurang (misal \`vehicle_code\` atau \`layout_name\`), komunikasikan secara transparan ke tim database alih-alih me-join ulang di Laravel (SSOT: [\`21-database-reasoning.md\`](../rules/21-database-reasoning.md) Bagian 5).
* **Klasifikasi Celah & Solusi (\`[CORE FLOW]\` vs \`[DI LUAR CORE FLOW / OPSIONAL PELENGKAP]\`)**:
  * Pastikan penyesuaian utama merujuk langsung ke **\`[CORE FLOW]\`** yang memiliki celah.
  * Penyesuaian preventif / *edge case* untuk melengkapi area di luar core flow tetap **wajib dicantumkan dan dijelaskan**, namun dipisahkan dengan label **\`[DI LUAR CORE FLOW / OPSIONAL PELENGKAP]\`** beserta **pertimbangan *impact*-nya** (dampak bila ditambah vs bila dilewati) agar pengguna memahami alurnya dan dapat menentukan persetujuan per item.
* **Simulasi Testing Impact Menggunakan Data Nyata (WAJIB untuk \`[CORE FLOW]\` & \`[DI LUAR CORE FLOW / OPSIONAL PELENGKAP]\`)**:
  * Setiap skenario celah wajib dilengkapi ilustrasi konkret berbasis **data contoh / baris DB aktual** (simulasi *read-only* tanpa mutasi langsung ke \`transport_system\`), disajikan ringkas dengan format berikut:
    - **Tabel Simulasi \`[CORE FLOW]\`**: \`Skenario | Data Uji Input / Record DB | Hasil SEBELUM Fix | Hasil SESUDAH Fix\`
    - **Tabel Simulasi \`[DI LUAR CORE FLOW / OPSIONAL PELENGKAP]\`**: \`Opsi & Celah | Contoh Data Uji Nyata | Dampak Jika Diabaikan | Dampak Jika Diterapkan\`
  * Catatan Ruang Lingkup: Simulasi ini melengkapi proses **Review, Planning, Evaluasi & Fix-Bug** agar pengguna paham alur & dampak nyata sebelum eksekusi; sedangkan **Set Data Uji Manual Pasca-Development Form** (*field input form vs kolom DB tersimpan*) tetap disajikan terpisah setelah perubahan form selesai dikerjakan.

### 4. Status Permission, Konsultasi SP/View & Skrip SQL Manual phpMyAdmin
* **Status Permission & Menu di \`transport_system\`**:
  - Apakah menu dan hak akses sudah lengkap di \`menus\` & \`permissions\`?
  - **Jika SUDAH ADA**: Konfirmasikan ketersediaannya secara transparan. **DILARANG** menyertakan query SQL dummy data bisnis.
  - **Jika BELUM ADA / KOSONG**: Berikan **Fallback Feedback** transparan dan siapkan query SQL \`INSERT\` khusus registrasi menu/permission untuk dieksekusi manual di phpMyAdmin (Zero-Direct-CRUD).
* **Kesiapan Berkas Migrasi Statis (\`Schema::create\`)**:
  - Pastikan tabel modul memiliki berkas migrasi \`Schema::create\` (bukan alter) yang presisi sesuai SQL dump terbaru di \`database/migrations/\` (tanpa menjalankan CLI \`migrate\`).
* **Konsultasi Stored Procedure / Database View (Optimization Gate)**:
  - *Jika tugas memuat join multi-tabel berat atau mutasi transaksi atomik*: AI **WAJIB menawarkan secara proaktif**:
    > *"Untuk modul ini, apakah Anda ingin kita implementasikan menggunakan **Stored Procedure (\`sp_...\`)** atau **Database View (\`v_...\`)** agar lebih optimal? Keuntungannya: kueri pre-compiled di database lebih cepat, logic reusable tanpa membuat fungsi berulang di controller, serta transaksi atomik terlindungi."*
  - Jelaskan aspek keamanan: \`SQL SECURITY INVOKER\` (MySQL) atau \`SET search_path = public, pg_temp\` (Postgres/Supabase), error rollback handler, dan parameter sanitization.
* **Kueri SQL Siap Pakai**:
  \`\`\`sql
  -- DDL/DML untuk dieksekusi manual oleh pengguna di phpMyAdmin / database console
  -- 1. Skrip Pembuatan (CREATE TABLE / VIEW / PROCEDURE)
  -- 2. Skrip Uji Coba Pemanggilan (Smoke Test)
  -- 3. Skrip Rollback (DROP ... IF EXISTS)
  \`\`\`
* **Penanganan Anggun di Kode (*Graceful Fallback*)**:
  - Pastikan kode memberikan notifikasi/flash message informatif jika konfigurasi belum diset, bukan fatal crash 500.

### 5. Visual Planning Gate & Jangkar Referensi (Khusus Fitur Antarmuka / UI)
*Wajib disertakan jika pengerjaan melibatkan pembuatan atau perubahan tampilan UI:*
* **ASCII Layout Wireframe**: Gambaran visual kasar tata letak komponen (Header, KPI Cards, Filter Bar, Table/Grid, Pagination, Modal/Drawer).
* **Jangkar Referensi (*Visual Anchor*)**:
  - *Metode A*: Minta/gunakan screenshot desain dari \`scratch/ui-references/\` (misal: \`scratch/ui-references/mockup.png\`).
  - *Metode B*: Kiblat desain acuan (misal: *Untitled UI / Stripe Dashboard* atau *Vercel Dark Mode*).
  - *Metode C*: Penawaran pembuatan mockup AI via \`generate_image\` jika pengguna belum memiliki gambaran kasar.
* **Skill Aktif**: Deklarasi skill yang diaktifkan (misal: \`skills/untitled-ui\`, \`skills/shadcn-ui\`, \`skills/21st-dev\`). Dilarang slicing dari \`<div>\` mentah.
* **Persistensi State**: Pastikan aset acuan disimpan di \`scratch/\` untuk state session yang dapat dipakai kembali.

### 6. Konfirmasi Tindak Lanjut (Human-in-the-Loop Approval)
* Mengajukan pertanyaan persetujuan kepada pengguna terhadap logika, skrip SQL manual, dan wireframe visual sebelum mulai menulis kode.
\`\`\`
`;

fs.writeFileSync(masterTaskProtoPath, upgradedTaskProtocol, 'utf8');
console.log('-> Upgraded workflows/task-review-protocol.md');

// ---------------------------------------------------------
// 5. rules/00-core-guardrails.md
// ---------------------------------------------------------
console.log('5. Upgrading rules/00-core-guardrails.md...');
const masterGuardPath = path.join(HUB_ROOT, 'rules/00-core-guardrails.md');
let masterGuardContent = fs.readFileSync(masterGuardPath, 'utf8');

const additionalGuardrails = `
---

## 15. Audit Wajib Skenario Celah Lapangan (Review, Planning, Evaluasi & Fix-Bug)
1. **Tidak Boleh Di-skip di Tahap Manapun**:
   * Setiap proses **Review**, **Planning**, **Evaluasi**, dan **Fix-Bug** WAJIB mencakup pengecekan proaktif celah skenario lapangan:
     1. **Sinkronisasi State-Machine Lintas Menu**: Apakah tombol aksi (\`can_cancel\`, \`can_mutate\`, \`can_checkin\`, \`can_pay\`), guard repository, dan tampilan view lain sejalan.
     2. **Batas Waktu Real-Time (\`ETD\` / \`expired_at\`)**: Memastikan batas operasional nyata (jam berangkat, kadaluarsa pembayaran, urutan cetak dokumen) tidak bertabrakan atau mengunci secara prematur.
     3. **Integritas Tabel Terkait & Log Audit**: Tabel induk vs tabel relasi (\`forwards\`, \`trackings\`, \`manifests\`) tetap sinkron tanpa duplikasi log maupun data yatim (*orphaned status*).
     4. **Penanganan Kegagalan & Kondisi Pinggiran**: Skenario cetak ulang manifest, ganti supir/armada mendadak, pembatalan setelah penjadwalan, dan konsistensi timezone.
2. **Klasifikasi Wajib: Fokus Core Flow vs Pelengkap Di Luar Core Flow**:
   * **Prioritas Solusi Utama (\`[CORE FLOW]\`)**: Setiap solusi perbaikan celah WAJIB langsung menyasar dan merujuk pada **core flow** utama yang mengalami celah agar akar masalah terselesaikan tepat sasaran.
   * **Pelengkap Di Luar Core Flow (\`[DI LUAR CORE FLOW / OPSIONAL PELENGKAP]\`)**: Jika terdapat penyesuaian preventif atau penanganan *edge case* tambahan untuk melengkapi area di luar core flow utama, AI Agent **tetap wajib mengikutsertakan dan memaparkannya**, tetapi dipisahkan secara eksplisit dari daftar perbaikan core flow dengan label **\`[DI LUAR CORE FLOW / OPSIONAL PELENGKAP]\`**.
   * **Transparansi Alur & Impact**: Setiap item berlabel di luar core flow WAJIB disertai penjelasan singkat mengapa item tersebut berada di luar core flow serta **pertimbangan dampaknya (*impact analysis*) jika ditambahkan vs jika tidak ditambahkan**, sehingga pengguna memahami alur sistem secara menyeluruh dan dapat memverifikasi keputusan secara sadar sebelum eksekusi.
3. **Wajib Simulasi Testing Impact Menggunakan Data Nyata (*Data-Driven Impact Simulation*)**:
   * Setiap pemaparan celah \`[CORE FLOW]\` maupun \`[DI LUAR CORE FLOW / OPSIONAL PELENGKAP]\` pada tahap Review, Planning, Evaluasi, dan Fix-Bug **WAJIB disertai ilustrasi simulasi uji menggunakan contoh data nyata / record DB aktual** (\`Before vs After\` atau \`Jika Diterapkan vs Jika Diabaikan\`) sesuai template pada [\`workflows/task-review-protocol.md\`](../workflows/task-review-protocol.md) Bagian 3B.
   * Pengujian dilakukan secara **read-only** (simulasi skrip/logika/query baca) tanpa melanggar Zero-Direct-CRUD.

---

## 16. Kontrak JSON Murni Endpoint GET & DataTables (Zero Raw HTML/Badge)
1. **Backend Mengembalikan Data Terstruktur Murni (Tanpa Tag HTML)**:
   * Seluruh endpoint \`GET\` AJAX/DataTables maupun \`JsonResource\` **DILARANG KERAS** menyisipkan tag HTML (\`<span>\`, \`<a href>\`, \`<div>\`, \`<i>\`, \`<button>\`) di dalam response JSON. Endpoint cukup mengirim nilai mentah yang bersih dan aman, serta wajib dilindungi \`try/catch\` + \`Log::error(...)\` agar kegagalan parsing tidak memecah JSON DataTables (spesifikasi backend: [\`rules/10-architecture.md\`](./10-architecture.md) Bagian 5).
2. **Frontend Merender Tampilan & Melindungi XSS**:
   * Pembuatan badge status, warna semantik, multi-line layout, tautan, dan tombol aksi wajib dikerjakan di sisi klien lewat \`columns[].render\` menggunakan helper \`escapeHtml()\` (spesifikasi frontend: [\`rules/30-ui-frontend.md\`](./30-ui-frontend.md) Bagian 12).
   * Aturan ini **WAJIB diaudit** di setiap tahap: **Review, Planning, Development, Fix-Bug, dan Evaluasi**.

---

## 17. Audit Definisi Database View (Anti-Double Join, Anti-Censorship Filter & Single-Source Projection)
1. **Wajib Membaca Definisi View Sebelum Menulis Query (Anti-Double Join)**:
   * Setiap kali sebuah repository mengonsumsi Database View (MySQL View \`v_...\`), AI Agent **WAJIB** membaca berkas SQL dump terbaru (\`transport_system-*.sql\`) untuk memeriksa tabel-tabel master apa saja yang **sudah di-join di dalam View tersebut**.
   * **DILARANG KERAS** melakukan \`leftJoin\` / \`join\` ulang di Query Builder Laravel ke tabel master fisik yang sudah di-join di dalam View (anti-2x proses). Contoh: dilarang men-join ulang \`routes\`, \`vehicles\`, \`vehicle_layouts\`, \`emoneys\`, dan \`admins\` jika kueri sudah memanggil \`v_manifest\`.
   * Jika terdapat kolom master yang belum diekspos oleh View (misal \`vehicle_code\` atau \`layout_name\`), AI **WAJIB mendeklarasikannya secara transparan** kepada tim basis data / atasan untuk ditambahkan ke baris \`SELECT\` View, bukan secara sepihak menambahkan join fisik ganda yang melumpuhkan performa kueri.
2. **DILARANG Menambahkan Filter WHERE Prematur/Kaku pada View (Anti-Penyensoran Data & Perlindungan Indeks)**:
   * **DILARANG KERAS** menambahkan filter \`WHERE\` kaku seperti \`->where('vehicle_list_id', '>', 0)->where('driver_id', '>', 0)->whereNotNull('manifest_code')\` pada kueri view kecuali jika secara mutlak diminta oleh aturan bisnis.
   * Dampak negatif filter prematur ini:
     a) **Penyensoran Data Tidak Sengaja**: Jadwal/manifest yang baru dibuat dan armadanya belum ditentukan (\`NULL\` / \`0\`) menjadi **hilang misterius** dari antarmuka pengguna, padahal staf butuh melihatnya dengan status *"Belum Diatur"*.
     b) **Degradasi Performa**: Kondisi \`>\` pada view memicu *full table scan* dan merusak optimasi indeks MySQL (~10x lebih lambat).
3. **Proyeksi Tunggal Bersih (Single-Source Projection via \`vm.*\` )**:
   * Seluruh atribut yang sudah diproyeksikan oleh Database View wajib diambil langsung via \`vm.*\` (atau alias view terkait) tanpa menulis deretan \`COALESCE\` panjang yang berlebihan di layer repository.
4. **Lifecycle Mandat (Tidak Boleh Di-skip)**:
   * Aturan ini **WAJIB diaudit** pada setiap tahap: **Planning, Review, Development, Fix-Bug, dan Evaluasi** (Kasus #41, SSOT: [\`rules/21-database-reasoning.md\`](./21-database-reasoning.md) Bagian 5).

---

## 18. Standar Pengujian: Alur UI Browser Nyata (In-Admin) vs Query SQL phpMyAdmin (Out-of-Admin)
1. **(A) Pengujian Alur di Dalam Sistem Admin (In-Admin Flow - Browser UI Flow First)**:
   * Setiap alur yang memiliki modul/antarmuka di web admin (seperti pemesanan tiket, kirim paket, penugasan armada, input upah harian, check-in, dan form modal) **WAJIB disimulasikan secara nyata melalui antarmuka web peramban (Browser UI Flow via Playwright)**.
   * Alur wajib mencerminkan interaksi manusia sesungguhnya: membuka halaman aplikasi admin, memilih dropdown/kursi, mengisi form input, dan mengklik tombol simpan di browser.
   * **DILARANG KERAS** menggunakan jalan pintas (*shortcut*) pembuatan data uji melalui skrip kernel PHP/service backend langsung atau query SQL injeksi, **KECUALI** pengguna secara eksplisit menginstruksikannya (contoh instruksi eksplisit: *"tolong inject data via script/sql saja biar hemat token"*).
2. **(B) Pengujian Alur di Luar Sistem Admin (Out-of-Admin Flow / External Blockers & Time Fast-Forward)**:
   * Jika skenario pengujian bergantung pada pemicu yang berada di luar aplikasi web admin (contoh: status manifest telah tiba / \`arrived\` yang dipicu dari Aplikasi Android Driver, pengajuan penarikan saldo supir / withdrawal dari aplikasi driver, simulasi melewati jam \`ETD\` / kadaluarsa, atau callback payment gateway), AI **DILARANG KERAS mengeksekusi injeksi skrip atau mutasi database sendiri** (mematuhi Rule #2 Zero-Direct-CRUD).
   * AI **WAJIB PAUSE**, lalu **MENYEDIAKAN PAKET QUERY SQL MANUAL YANG TRANSPARAN & SIAP PASTE UNTUK DIJALANKAN OLEH PENGGUNA DI PHPMYADMIN** (lengkap dengan penjelasan status, tujuan, cara kerja, dampak, dan kueri pemulihan/rollback).
   * Setelah pengguna mengonfirmasi query berhasil dijalankan di phpMyAdmin, AI langsung melanjutkan pengujian alur admin di peramban browser.
3. **Keterikatan Siklus Hidup Menyeluruh (Lifecycle Mandat - Tidak Boleh Di-skip)**:
   * **Planning & Review**: Wajib mendeklarasikan metode eksekusi data uji secara transparan: **\`BROWSER UI FLOW (Playwright)\`** untuk alur in-admin, dan **\`PAUSE + QUERY SQL PHPMYADMIN\`** jika ada ketergantungan pemicu eksternal/waktu di luar admin.
   * **Development & Fix-Bug**: Validasi perbaikan wajib dipastikan bekerja mulus pada antarmuka web peramban.
   * **Evaluasi & QA**: Bukti uji wajib menyertakan tangkapan layar (*screenshot*) dari alur antarmuka browser yang nyata (Kasus #42, SSOT: [\`workflows/task-review-protocol.md\`](../workflows/task-review-protocol.md) & [\`workflows/post-dev-qa.md\`](../workflows/post-dev-qa.md)).

---

### Ringkasan Cepat: Do's and Don'ts

| Area | ✅ WAJIB DILAKUKAN | ❌ DILARANG KERAS |
| :--- | :--- | :--- |
| **Alur Kerja** | Awali dengan Review Task mendalam & tunggu persetujuan pengguna | Langsung koding sebelum pengguna konfirmasi setuju |
| **Routing** | Tempatkan rute secara modular per resource di \`routes/partials/[resource].php\` | Menumpuk / menambahkan rute baru langsung ke \`routes/web.php\` |
| **Mutasi DB** | Sediakan query SQL manual untuk phpMyAdmin | Eksekusi query INSERT/UPDATE/DELETE langsung dari AI/scratch |
| **Basis Data** | Nilai kolom ENUM, hari, status WAJIB Bahasa Inggris (Monday, Tuesday, departed, dll) | Menyimpan nilai hari/status berlabel lokal (Senin, Selasa, dll) ke tabel database |
| **Migrasi** | Update berkas migrasi sebagai arsip dokumentasi | Menjalankan \`php artisan migrate\` di terminal |
| **Permission** | Sediakan SQL permission jika menu baru belum ada | Mem-bypass otorisasi atau memalsukan data mock |
| **Arsitektur** | Prioritaskan komponen & pola yang sudah ada di \`adminShuttleV3\` | Menjiplak kode usang yang bertentangan dengan standar saat ini |
| **Playwright** | Jalankan HANYA jika diminta eksplisit oleh user (Akun: \`superahmad\` / \`password123\`) | Menjalankan Playwright otomatis tanpa instruksi pengguna |
| **Alur Pengujian (Testing Flow)** | Jalankan alur in-admin via browser (Browser UI Flow via Playwright); untuk alur di luar admin (Android Driver/ETD) PAUSE & sediakan query SQL manual untuk phpMyAdmin | Menginjeksi data via skrip kernel PHP/SQL langsung untuk mensimulasikan transaksi bisnis KECUALI diminta eksplisit oleh pengguna |
| **Komentar Kode** | Tulis komentar ringkas (1-2 baris), fungsional & ramah developer tim | Banner ASCII panjang, dekoratif berlebihan, atau mengutip rujukan aturan AI |
| **Teks & Label UI** | Gunakan istilah bisnis umum dan ramah pengguna awam (misal: "Password :", "disimpan menjadi harga tarif operasional") | Memunculkan jargon teknis (misal: kata "database", "database operasional", "query", "record", "Password (16 Karakter):", "injeksi") |
| **Sisa Iterasi (Dead Code)** | Bersihkan/hapus tuntas kode versi lama yang sudah tidak terpakai saat revisi berikutnya | Membiarkan dead code, UI modal usang, atau potongan komentar kode mati menumpuk |
| **Git / Version Control** | Biarkan seluruh perubahan kode di working tree (*uncommitted*) untuk direview pengguna | Menjalankan \`git commit\` maupun \`git push\` (eksekusi commit & push dikelola mandiri oleh user) |
| **Proteksi Commit Rekan** | Wajib audit non-regresi pasca-dev & konfirmasi dampak jika perlu menyentuh kode rekan developer | Mengubah atau menimpa kode/fitur commit milik rekan secara sepihak tanpa konfirmasi |
| **Testing Form** | Sajikan set data uji manual & perbandingan representasi data database pada review selesai dev | Meninggalkan user tanpa panduan pengujian atau tanpa kejelasan format data database |
| **Import & Error Handling** | Import class via \`use\` di atas file & kembalikan \`ServiceResult::failed\` | Menulis inline FQCN (\`\\Illuminate\\...::error\`) atau menelan error secara bisu (*silent catch*) |
| **Zona Waktu** | Gunakan \`config('app.timezone')\` / \`Carbon::now()\` secara dinamis | Hardcode \`'Asia/Makassar'\` di kode backend atau frontend |
| **Modal & Komponen UI Portable** | Pusatkan modal/popup lintas-menu ke 1 Blade partial + 1 JS portabel ber-scope terisolasi, lalu cek semua halaman pemakainya saat Planning, Fix, Dev & Evaluasi (\`30-ui-frontend.md\` Bag. 13) | Menyalin-tempel HTML modal atau JS handler di banyak menu, atau memakai selector CSS/ID global yang bocor ke halaman induk |
| **Audit Celah Lapangan** | Lakukan audit skenario celah lintas-menu pada Review, Planning, Evaluasi & Fix-Bug | Melewatkan pengecekan celah state-machine, batas ETD, & tabel anak |
| **Klasifikasi Celah & Impact** | Fokus solusi ke \`[CORE FLOW]\`; pisahkan pelengkap \`[DI LUAR CORE FLOW / OPSIONAL PELENGKAP]\` + simulasi testing impact berbasis data nyata | Mencampur perbaikan opsional di luar core flow tanpa penjelasan dampak & ilustrasi uji data |
| **Endpoint GET / DataTables** | Kembalikan data JSON murni bebas HTML; render badge/aksi di \`columns[].render\` JS dengan \`escapeHtml()\` (\`10-architecture.md\` Bag. 5 & \`30-ui-frontend.md\` Bag. 12) | Mengirim \`<span class="badge">\`, \`<a>\`, atau HTML mentah di payload JSON Service / JsonResource |
| **Konsumsi Database View** | Baca definisi \`CREATE VIEW\` di dump SQL terbaru; gunakan \`vm.*\` tanpa join master ganda; hapus filter \`>\` prematur | Join ulang ke tabel master yang sudah ada di view (2x proses); filter kaku \`vehicle_list_id > 0\` yang menyembunyikan jadwal baru |
| **Knowledge** | Catat setiap bug dan solusinya ke \`knowledge/\` | Mengabaikan dokumentasi problem-solving |
`;

// Replace lines starting from ## 15
const idxSec15 = masterGuardContent.indexOf('## 15. Audit Wajib Skenario Celah Lapangan');
if (idxSec15 !== -1) {
    masterGuardContent = masterGuardContent.substring(0, idxSec15).trimEnd() + '\n' + additionalGuardrails;
    fs.writeFileSync(masterGuardPath, masterGuardContent, 'utf8');
    console.log('-> Upgraded rules/00-core-guardrails.md');
}

// ---------------------------------------------------------
// 6. rules/10-architecture.md
// ---------------------------------------------------------
console.log('6. Upgrading rules/10-architecture.md...');
const masterArchPath = path.join(HUB_ROOT, 'rules/10-architecture.md');
let masterArchContent = fs.readFileSync(masterArchPath, 'utf8');

const archSection5 = `
---

## 5. Standar Kontrak JSON Murni Endpoint GET & DataTables (Zero Raw HTML/Badge)
1. **DILARANG Mengirim Tag HTML / Badge Mentah di Payload JSON**:
   * Seluruh endpoint \`GET\` (DataTables AJAX, \`JsonResource\`, maupun API list/detail) **WAJIB hanya mengembalikan data terstruktur murni** (*primitive scalar*: string teks polos, integer/float numerik, boolean, ISO timestamp, URL bersih, atau array/object data).
   * **DILARANG KERAS** menyisipkan markup HTML (\`<span class="badge ...">\`, \`<a href=...>\`, \`<div>\`, \`<i>\`, \`<br>\`, atau tombol HTML \`<button>\`) di dalam Service, Repository, maupun \`JsonResource\`.
   * Pengecualian khusus format karakter seperti \`'∞'\` gunakan karakter Unicode langsung, bukan entitas HTML (\`&infin;\`).
2. **Keamanan Data, Anti-Error 500 & Pencarian Server-Side DataTables**:
   * Lapisan \`Service\` pada endpoint DataTables/AJAX wajib membungkus pengambilan & pemetaan data dalam \`try/catch\` yang mencatat error via \`Log::error(...)\` (import via \`use\`) serta mengembalikan JSON terstruktur kosong + flag pesan eror (status HTTP \`500\`), bukan HTML stack-trace/exception yang memicu \`DataTables Ajax error\`.
   * Parsing filter tanggal/parameter eksternal di \`Repository\` (misal \`daterange\` via \`Carbon::parse\`) wajib dilindungi blok \`try/catch\` agar input tidak valid tidak menjatuhkan query.
   * Jika DataTables memakai \`serverSide: true\`, \`Repository\` wajib memproses parameter \`search[value]\` secara aman pada kolom bisnis yang relevan.
3. **Alur Tanggung Jawab (*Separation of Concerns*)**:
   * **Backend (\`Repository -> Service -> Resource/Controller\`)**: Kueri, kalkulasi metrik/status mentah, format data murni (\`type\`, \`status\`, \`delay_minutes\`, \`booked_count\`, \`net_profit\`, dll.).
   * **Frontend (\`public/js/apps/...\`)**: Rendering visual badge, warna, ikon, link detail, dan tombol aksi via \`columns[].render\` dengan sanitasi XSS (\`escapeHtml()\`), sesuai [\`rules/30-ui-frontend.md\`](./30-ui-frontend.md) Bagian 12.
`;

if (!masterArchContent.includes('## 5. Standar Kontrak JSON Murni Endpoint GET & DataTables')) {
    masterArchContent = masterArchContent.trimEnd() + '\n' + archSection5;
    fs.writeFileSync(masterArchPath, masterArchContent, 'utf8');
    console.log('-> Upgraded rules/10-architecture.md');
}

// ---------------------------------------------------------
// 7. rules/21-database-reasoning.md
// ---------------------------------------------------------
console.log('7. Upgrading rules/21-database-reasoning.md...');
const masterDbReasonPath = path.join(HUB_ROOT, 'rules/21-database-reasoning.md');
let masterDbReasonContent = fs.readFileSync(masterDbReasonPath, 'utf8');

const dbReasonSection5 = `
---

## 5. Kebijakan Prioritas Database Views & Stored Procedures (Anti N+1 Protocol)

1. **Prioritas Database View untuk Kueri Agregasi Berulang**:
   - Jika suatu menu menampilkan data tabular yang membutuhkan metrik dari multi-tabel (\`COUNT\` tiket, \`SUM\` nominal pendapatan, koli paket, atau ketersediaan kursi), pengembang dan AI Agent **WAJIB memprioritaskan kueri langsung ke Database View (\`v_...\`)**.
   - **DILARANG KERAS** memecah pengambilan data menjadi sub-kueri berulang di dalam perulangan PHP/Service (pola N+1), karena query berulang dengan kalkulasi tanggal (\`DATE(COALESCE(...))\`) pada tabel fisik akan melumpuhkan performa aplikasi (> 3 detik vs < 1 detik).
2. **Pola Konsumsi di Layer Repository**:
   - Kueri ke Database View dikelola di lapisan \`Repository\` menggunakan \`DB::table('v_manifest as vm')\` dengan klausa \`leftJoin\` ke tabel/view lain dalam **1 kueri tunggal (*single trip query*)**.
   - Lapisan \`Service\` menerima data yang sudah teragregasi secara lengkap dan hanya melakukan kalkulasi finansial / formatting waktu di memori PHP (*in-memory*).
3. **Penyelarasan dengan Tim Basis Data (Zero-Direct-CRUD)**:
   - Jika ditemukan kebutuhan agregasi data baru yang berat dan belum diakomodasi oleh View yang ada, AI Agent **DILARANG membuat view langsung di database**. Sediakan draf query SQL \`CREATE VIEW\` atau \`CREATE PROCEDURE\` untuk dieksekusi tim database di phpMyAdmin.
   - Blueprint teknis selengkapnya: [\`knowledge/stored-procedures-and-views.md\`](../knowledge/stored-procedures-and-views.md).
4. **Audit Definisi View Terlebih Dahulu (Anti-Double Join / Anti-2x Proses)**:
   - Sebelum menambahkan \`leftJoin\` di Query Builder Laravel yang memanggil Database View, AI Agent **WAJIB membaca berkas SQL dump terbaru (\`transport_system-*.sql\`)** untuk memeriksa tabel apa saja yang *sudah di-join di dalam View tersebut*.
   - **DILARANG KERAS** melakukan join ulang ke tabel master fisik yang sudah ada di dalam View (misal me-join ulang \`routes\`, \`vehicles\`, \`vehicle_layouts\`, \`emoneys\`, \`admins\` padahal \`v_manifest\` sudah memuat relasi tersebut).
   - Melakukan join ganda mengakibatkan MySQL memproses tabel yang sama sebanyak 2 kali dan melipatgandakan waktu eksekusi kueri (~10x lebih lambat, dari ~100ms melonjak ke ~950ms).
5. **Larangan Filter WHERE Prematur/Kaku pada View (Anti-Penyensoran Data & Perlindungan Indeks)**:
   - **DILARANG KERAS** menambahkan filter \`WHERE\` kaku seperti \`->where('vehicle_list_id', '>', 0)->where('driver_id', '>', 0)->whereNotNull('manifest_code')\` pada kueri view kecuali secara eksplisit diwajibkan oleh aturan bisnis.
   - Filter kaku ini terbukti berbahaya karena:
     a) **Menyembunyikan Data Baru**: Jadwal operasional atau manifest yang baru dibuat tetapi supir/armadanya belum ditentukan (\`NULL\`/\`0\`) menjadi **hilang misterius** dari antarmuka web, padahal staf butuh melihatnya dengan status *"Belum Diatur"*.
     b) **Degradasi Performa Indeks**: Operator pembanding \`>\` pada view memicu *full table scan* dan merusak optimasi indeks MySQL.
6. **Proyeksi Tunggal Bersih (Single-Source Projection via \`vm.*\` )**:
   - Seluruh kolom yang sudah diproyeksikan oleh View wajib diambil langsung via \`vm.*\` tanpa perlu menulis deretan \`COALESCE(...)\` panjang yang redundan di repository.
7. **Sinergi Komunikasi dengan Tim Basis Data**:
   - Jika terdapat kolom dari tabel master yang belum diekspos oleh View (misal \`v.code\` atau \`vl.name\`), AI Agent **WAJIB mendeklarasikannya secara transparan** kepada atasan / analis database untuk ditambahkan ke baris \`SELECT\` View database, bukan mengakali dengan join fisik ganda di Laravel. Aturan ini wajib diterapkan pada setiap tahap **Planning, Review, Development, Fix-Bug, dan Evaluasi** (Kasus #41).
8. **Preservasi Kontrak Pengurutan Stored Procedure & Database View (Anti-Overwriting Database ORDER BY)**:
   - Ketika repository mengonsumsi data dari Stored Procedure (\`sp_...\`) atau Database View yang telah memiliki klausa \`ORDER BY\` terstruktur (misal pada \`sp_schedule_daily_route_temps\`: jadwal aktif \`on\` terlebih dahulu diurutkan \`etd ASC\`, lalu seluruh jadwal non-aktif \`off\` di paling bawah tabel), layer aplikasi/repository Laravel **WAJIB MEMATUHI DAN MEMPERTAHANKAN KONTRAK PENGURUTAN BAWAAN TERSEBUT**.
   - **DILARANG KERAS menimpa urutan database** dengan melakukan sorting ulang koleksi murni berdasarkan satu kolom (misal: \`$results->sortBy('sort_etd')\`) yang mengakibatkan baris non-aktif naik ke atas tabel di antara jadwal aktif.
   - Jika ada penggabungan entitas tambahan di layer aplikasi (seperti jadwal ekstra non-aktif yang di-merge di PHP), pengurutan wajib menggunakan multi-level sorting bertingkat yang identik dengan kontrak Stored Procedure: status ranking (\`on\` -> 0, \`off\` -> 1) lalu \`sort_etd ASC\` (Kasus #43).
`;

if (!masterDbReasonContent.includes('## 5. Kebijakan Prioritas Database Views & Stored Procedures')) {
    masterDbReasonContent = masterDbReasonContent.trimEnd() + '\n' + dbReasonSection5;
    fs.writeFileSync(masterDbReasonPath, masterDbReasonContent, 'utf8');
    console.log('-> Upgraded rules/21-database-reasoning.md');
}

// ---------------------------------------------------------
// 8. rules/30-ui-frontend.md
// ---------------------------------------------------------
console.log('8. Upgrading rules/30-ui-frontend.md...');
const masterFrontendPath = path.join(HUB_ROOT, 'rules/30-ui-frontend.md');
let masterFrontendContent = fs.readFileSync(masterFrontendPath, 'utf8');

const frontendSections12to15 = `
---

## 12. Standar Rendering DataTables Sisi Klien (\`columns[].render\` & XSS Escape)
1. **Wajib Merender Badge, Warna, Link & Tombol di Frontend (Bukan dari JSON Backend)**:
   * Kolom tabel berbasis AJAX DataTables wajib menerima field data mentah/murni dari endpoint \`GET\` (lihat [\`rules/10-architecture.md\`](./10-architecture.md) Bagian 5), lalu merangkai badge Bootstrap (\`bg-soft-*\`), ikon, penataan multi-baris, dan tombol aksi di callback \`columns[].render(data, type, row)\` pada berkas JS halaman (\`public/js/apps/...\`).
   * Gunakan \`'data': null\` pada kolom yang menggabungkan beberapa field mentah dalam 1 sel (misal kode + waktu, penumpang terjual vs kapasitas, tombol aksi dinamis).
2. **Proteksi XSS (\`escapeHtml\`) Wajib untuk Semua Teks Dinamis**:
   * Setiap string input pengguna/DB (nama supir, nama penumpang, kode rute, plat nomor, catatan) yang disisipkan ke template HTML string di \`render()\` **WAJIB dilewatkan melalui helper \`escapeHtml()\`** terlebih dahulu sebelum masuk ke DOM.
3. **Penanganan Error AJAX DataTables yang Elegan**:
   * Matikan alert popup bawaan browser DataTables yang kaku bila diperlukan dengan \`$.fn.dataTable.ext.errMode = 'none'\` dan tangani \`ajax.error\` atau event \`error.dt\` menggunakan \`toastAlert('error', ...)\` agar pengguna mendapat pesan operasional yang jelas.
4. **Pemangkasan Payload \`ajax.data\` Server-Side (Anti-\`414 URI Too Long\`)**:
   * Pada DataTables dengan \`serverSide: true\` dan jumlah kolom banyak (misal 15-39 kolom), \`type: 'GET'\` bawaan mengirim array \`columns[0..N]\` hingga ribuan karakter ke query string yang berisiko ditolak server/WAF dengan \`HTTP 414 URI Too Long\`.
   * Jika backend tidak memakai sorting/pencarian per-kolom DataTables, pangkas payload di \`ajax.data(d)\` menjadi field inti saja (\`draw\`, \`start\`, \`length\`, \`search: { value }\`, dan filter formulir).

---

## 13. Standar Komponen Modal & Popup Portable Lintas-Halaman (Single Source of Truth)
Agar modal popup (contoh: \`#modal-plan\` *Atur Rencana Jadwal & Biaya Operasional*, \`#modal-package-mutation\`, dll.) dapat dimuat di tampilan mana saja tanpa tumpang tindih, konflik ID, maupun duplikasi kode, wajib terapkan 4 standar berikut:

1. **Pemusatan Blade Partial + Shared JS Handler (Anti-Duplikasi 2 Lapis)**:
   * **Blade HTML**: Pusatkan ke \`resources/views/apps/[domain]/partials/modal-[nama].blade.php\` (atau \`resources/views/apps/shared/modals/modal-[nama].blade.php\` untuk komponen lintas-domain), lalu muat dengan \`@include(...)\`.
   * **Shared JS Controller (Anti Copy-Paste JS)**: Logika buka modal, binding Select2, kalkulasi biaya, reset form, dan submit AJAX **DILARANG di-copy-paste** ke masing-masing file JS halaman (\`plan.js\`, \`package-order.js\`, \`manifest-detail.js\`). Ekstrak menjadi 1 berkas JS portabel mandiri (misal \`public/js/apps/shared/modal-[nama].js\` atau \`public/js/apps/[domain]/modal-[nama].js\`) yang diekspos sebagai modul/namespace dengan callback.
   * **Anti-Duplicate Asset Load**: Sertakan skrip JS komponen cukup satu kali menggunakan \`@pushOnce('custom-script')\` agar tidak termuat ganda bila beberapa partial saling memanggil.
2. **Isolasi Konteks Halaman Pemanggil (Zero Conflict & Zero CSS Leak)**:
   * **Prefix ID & Selector**: Seluruh elemen internal modal wajib memakai prefix spesifik modal (misal \`#modal_plan_date\`, \`#modal_tripcode\`, \`#form-modal-plan\`) agar tidak pernah bentrok dengan ID milik halaman induk.
   * **Scoped CSS & Z-Index**: Aturan CSS khusus modal (tinggi Select2, z-index, styling input) wajib diawali ID modal (contoh: \`#modal-plan .select2-container { z-index: 1060 !important; }\`). **DILARANG** menulis selector global tanpa prefix modal agar tampilan halaman induk tidak rusak.
   * **Binding Parent Dropdown & Datepicker**: Select2 wajib mengikat \`dropdownParent: $('#modal-[nama] .modal-content')\`, dan DateRangePicker mengikat \`parentEl: '#modal-[nama]'\`.
   * **Idempotent Event & Reset Bersih**: Daftarkan event listener menggunakan pola aman (\`.off('...').on(...)\`) dan wajib bersihkan state/input pada event \`hidden.bs.modal\` agar tidak ada sisa data cache saat modal dibuka berulang kali di halaman yang sama.
3. **Dual-Mode Binding & Kemandirian Data Master**:
   * Komponen modal wajib aman terhadap ketiadaan variabel Blade dari controller halaman pemanggil: gunakan fallback aman (\`$manifest ?? null\`, \`$vehicles ?? collect()\`) atau dukung *lazy-load AJAX* data dropdown master jika \`$vehicles\` / \`$drivers\` belum dikirim oleh controller halaman pemanggil.
   * Modal **tidak boleh meng-hardcode** pemanggilan fungsi refresh halaman tertentu di dalamnya; seluruh efek pasca-simpan diserahkan ke callback \`onSuccess(res)\` dari halaman pemanggil.
4. **Gerbang Audit Wajib di Seluruh Siklus Kerja (Planning, Development, Fix-Bug & Evaluasi)**:
   * **Planning & Review**: Wajib inventarisasi modal/partial eksisting sebelum mendesain modal baru atau menyambungkan ke halaman baru, serta deklarasikan daftar halaman pemakai (*consumers*).
   * **Development & Fix-Bug**: Setiap perubahan field, validasi, atau perbaikan bug pada modal reusable wajib memastikan **seluruh halaman pemanggil** tetap sinkron dan tidak regresi.
   * **Evaluasi Akhir**: Periksa tidak ada HTML modal duplikat, tidak ada logika JS modal yang disalin-tempel antar modul, tidak ada ID bentrok, dan tidak ada CSS bocor di seluruh halaman pemakai.

---

## 14. Proteksi Input Real-Time & Nilai Ekstrem (Percent 1..100, Leading-Zero, Paste & .input-group Error Placement)

Untuk mencegah kelolosan input ekstrem (contoh: mengetik \`60000\`, \`0\`, \`050\`, atau mem-paste nominal Rupiah ke kolom persentase \`%\`), setiap form transaksi maupun master data wajib mematuhi 5 standar pertahanan input berikut:

1. **Multi-Event Guard Real-Time (Bukan Hanya \`keyup\` atau \`submit\`)**:
   * Pengikatan validasi tidak boleh hanya mengandalkan \`keyup\` (yang lolos saat *click-right Paste*, *drag-drop*, atau autofill) maupun validasi \`submit\` semata.
   * Wajib ikat serentak pada event \`input\`, \`paste\`, \`blur\`, dan \`change\` pada pemilih jenis potongan (\`#value_type\` / \`#type\`).
2. **Normalisasi Digit & Anti-Leading-Zero Real-Time**:
   * Bersihkan karakter non-angka dan angka nol di depan (\`clean.replace(/^0+(?!$)/, '')\`) sehingga \`050\` langsung ternormalisasi menjadi \`50\` (atau kosong bila murni karakter tidak valid).
   * Di mode Rupiah (\`price\` / \`selling_price\`), format ribuan (\`.\` titik ribuan) otomatis mengikuti konvensi input harga.
3. **Larangan *Silent Auto-Cap* \`60000\` ➔ \`100%\` Saat Pergantian Tipe atau Salah Input**:
   * Saat jenis potongan diubah dari nominal (\`Rp\`, misal \`60.000\`) ke persentase (\`%\`), ataupun ketika pengguna mengetik \`60000\` / \`0\` di mode \`%\`, sistem **DILARANG mengubah diam-diam nilai \`60000\` menjadi \`100\`** tanpa tanda error/konfirmasi yang jelas.
   * Mengubah paksa angka besar menjadi \`100\` secara senyap berisiko fatal secara finansial: staf/kasir yang berniat memberi diskon \`Rp 60.000\` justru berisiko menyimpan voucher/promo **Diskon 100% (Gratis)** tanpa sadar.
   * Berikan indikator merah instan (\`is-invalid\`) serta pesan kontekstual yang mengarahkan pengguna: apakah nilai persentase di luar \`1..100%\` atau jenis potongannya perlu dipindahkan ke \`Nominal Potongan (Rp)\`.
4. **Kompatibilitas jQuery Validate pada \`.input-group\` & Input Teks Biasa**:
   * Callback \`highlight\` dan \`unhighlight\` WAJIB ikut men-toggle kelas \`is-invalid\` / \`is-valid\` pada input/select standar, bukan hanya \`.select2-container\`.
   * Callback \`errorPlacement\` WAJIB mengecek \`element.closest('.input-group')\`: jika elemen berada di dalam \`.input-group\`, letakkan \`.invalid-feedback\` **setelah \`.closest('.input-group')\`** (\`error.insertAfter(element.closest('.input-group'))\`) agar radius pil \`.input-group\` tidak patah dan teks error tampil utuh di bawah input.
   * Pada objek \`messages\` jQuery Validate, hindari mendefinisikan pesan sebagai string tunggal (seperti \`value: 'Wajib diisi'\`) karena akan menimpa pesan error custom rule (\`validPercentRange\`). Gunakan format objek per-aturan (misal \`value: { required: '...' }\`).
5. **Pertahanan Lapis Backend (\`FormRequest\`) yang Sinkron**:
   * \`FormRequest\` (\`rules()\` / \`after()\`) wajib selalu memvalidasi batas nyata per mode (khusus \`percent\`: angka valid rentang \`1..100\`, untuk nominal \`>= 0\` sesuai kebutuhan bisnis) agar payload langsung dari DevTools/Postman tidak pernah menembus aturan antarmuka.
   * Hindari penghapusan titik sembarangan dengan \`dot_replace()\` yang berpotensi mengubah pecahan \`50.5\` menjadi \`505\` saat tipe \`percent\`.

---

## 15. Standar Penataan Tombol Modal Footer (Right-Aligned Clustered Action Standard)

Untuk menciptakan konsistensi antarmuka pengguna (*visual alignment*) yang selaras dengan seluruh modul sistem:

1. **Pengelompokan di Pojok Kanan Bawah (\`d-flex justify-content-end gap-2\`)**:
   * Seluruh footer modal form/konfirmasi **WAJIB** menempatkan tombol-tombolnya berkumpul di pojok kanan bawah menggunakan kelas \`modal-footer bg-light py-2 px-3 border-top d-flex justify-content-end gap-2\` (atau padding yang proporsional).
   * **DILARANG KERAS** menggunakan \`d-flex justify-content-between\` yang melempar tombol Tutup/Batal ke ujung kiri dan tombol Simpan ke ujung kanan modal, karena merusak fokus ergonomis pengguna (*eye-tracking & mouse travel distance*).
   * *Pengecualian*: Hanya diperbolehkan jika terdapat kontrol navigasi/tautan tambahan yang sengaja ditempatkan di sisi kiri (misal: link *"Lihat Saldo & Riwayat Supir"* atau *"Cetak Manifest"*).
2. **Urutan Baku Tombol (Action-First, Dismiss-Last)**:
   * **Tombol Aksi Utama (Kiri di dalam kluster)**: Tombol aksi utama (seperti \`[SIMPAN]\`, \`[YA, PROSES...]\`, \`[SELESAIKAN]\`) ditulis pertama agar berada di sebelah kiri dari tombol pembatalan.
   * **Tombol Tutup / Batal (Kanan Luar di dalam kluster)**: Tombol penutup modal (seperti \`[Tutup]\` atau \`[BATAL]\`) ditulis setelah tombol aksi utama sehingga berada di posisi paling kanan bawah.
   * Format HTML standar:
     \`\`\`html
     <div class="modal-footer bg-light py-2 px-4 border-0 d-flex justify-content-end gap-2">
         <button type="submit" class="btn btn-sm btn-primary rounded-pill fw-bold px-4" id="btn-submit">
             <i class="las la-save me-1 font-16"></i> SIMPAN PERUBAHAN
         </button>
         <button type="button" class="btn btn-sm btn-secondary rounded-pill font-12 px-3" data-bs-dismiss="modal">
             Tutup
         </button>
     </div>
     \`\`\`
`;

const idxSec12 = masterFrontendContent.indexOf('## 12. Standar Bahasa UI Ramah Pengguna');
if (idxSec12 !== -1) {
    masterFrontendContent = masterFrontendContent.substring(0, idxSec12).trimEnd() + '\n' + frontendSections12to15;
    fs.writeFileSync(masterFrontendPath, masterFrontendContent, 'utf8');
    console.log('-> Upgraded rules/30-ui-frontend.md');
}

console.log('All adminShuttleV3 assets successfully integrated into Master Hub!');
