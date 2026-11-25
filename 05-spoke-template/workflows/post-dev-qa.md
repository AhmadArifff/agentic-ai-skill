# SOP: Post-Development QA (Multi-Stack Universal + Mode A Hemat Token)

Dokumen ini mengatur pelaksanaan **Quality Assurance (QA) terstruktur pasca-development** secara cepat, akurat, dan hemat token untuk **seluruh proyek anak (*Child Spokes*)**, sekaligus mempertahankan jalur enterprise khusus **Laravel / MySQL (`adminShuttleV3`)** tanpa tumpang tindih dengan aturan lain.

---

## 🚨 1. Activation Gate & Pemisahan Peran (Zero-Overlap, Selaras dengan Rule 32)

* **Tier 0 (Selalu Wajib Otomatis Tiap Selesai Coding)**: Verifikasi dasar ringan seperti syntax lint (`php -l`, `node --check`, `tsc --noEmit`), build/compile check, Anti-Slop Delivery Gate, Co-Developer Non-Regression Guard, dan audit kueri View/DB tetap dijalankan otomatis per [`01-workflow-discipline.md`](../rules/01-workflow-discipline.md) Tahap 4.
* **Tier 1 & Tier 2 Deep QA (ON-DEMAND + Approval Gate)**: Workflow pengujian mendalam ini **HANYA dieksekusi ketika pengguna secara eksplisit meminta pengujian/QA** (misal: *"tolong QA modul ini"*, *"tes fitur ini"*, *"cek bug pake testing"*) ATAU setelah pengguna menyetujui penawaran uji visual pada rilis UI/3D/Video baru ([`32-visual-first-engineering.md`](../rules/32-visual-first-engineering.md) Bagian 4). AI **TIDAK BOLEH** menjalankan deep QA / Playwright otomatis secara diam-diam tiap selesai edit kecil agar hemat token.
* **Batas Tanggung Jawab (Tidak Tumpang Tindih)**:
  * **Tier 0 (Verifikasi Dasar Wajib)** -> [`01-workflow-discipline.md`](../rules/01-workflow-discipline.md) Tahap 4.
  * **Tier 1 (Fast Kernel / Unit / Contract / Asset QA)** -> dikelola di dokumen ini (Laravel via `.agents/scripts/qa-kernel.php`, atau runner domain masing-masing pada Bagian `3C`).
  * **Tier 2 (QA Visual & Interaksi Browser via Playwright)** -> merujuk ke [`playwright-testing.md`](./playwright-testing.md) sebagai SSOT checklist visual & single-shot script.

---

## 🗺️ 2. Wajib Planning Flow Pengujian & Approval Gate (Tidak Boleh Dilewatkan)

> [!CAUTION]
> **WAJIB & TIDAK BOLEH DILEWATKAN**: Sebelum mengeksekusi pengujian apa pun (baik **Tier 1** maupun **Tier 2**), AI **DILARANG** langsung menjalankan skrip testing. AI **WAJIB** menyajikan **Planning Flow Testing** terlebih dahulu dan **STOP menunggu konfirmasi "Setuju"** dari pengguna.

### Komponen Wajib dalam Planning Flow Testing:
1. **Ruang Lingkup Menu & Target Endpoint**: Daftar menu, halaman (`GET`), endpoint AJAX/DataTables (`JSON`), dan endpoint export (`XLSX`) yang akan diuji.
2. **Alur / Flow Pengujian Langkah-demi-Langkah (WAJIB Mencakup `[CORE FLOW]` & `[EDGE-CASE FLOW]`)** *(format tabel ringkas)*:
   | Urutan | Kategori | Menu / Halaman | Aksi / Skenario Flow | Hasil yang Diharapkan (Expected) |
   | :--- | :--- | :--- | :--- | :--- |
   | 1 | `[CORE FLOW]` | *(Nama Menu & URL)* | *(Alur utama end-to-end: buka index, filter, buka modal, submit valid)* | HTTP 200, data/saldo/laporan sinkron |
   | 2 | `[EDGE-CASE FLOW]` | *(Nama Menu & URL)* | *(Guard & celah lapangan: double-submit, status belum `arrived`, batas `ETD`, saldo kurang, payload kosong `422`, RBAC `403`)* | Ditolak sesuai guard, bebas duplikasi & eror 500 |
   | 3 | `[CORE / CROSS-MENU]` | *(Integrasi Lintas-Menu)* | *(Aksi di Menu A terefleksi akurat di Menu B / Laporan)* | Angka & status 100% konsisten |
3. **Identifikasi Potensi Blocker Eksternal / Waktu (`ETD`, `arrived`, dll.)**: - Jika ada tahap yang bergantung pada aksi aplikasi eksternal (misal status `arrived` atau pengajuan withdrawal dari Aplikasi Android Driver) atau jeda waktu (`ETD` / kadaluarsa), tandai sejak awal di Planning Flow bahwa tahap tersebut akan menggunakan **Protokol Pause & Shortcut phpMyAdmin** (Bagian `2B`).
4. **Tier & Mode Keamanan Data**: - Sebutkan tegas apakah memakai **Tier 1 saja** atau **Tier 1 + Tier 2 (Playwright)**. - Konfirmasikan jaminan keamanan data: **Read-Only** atau **Rollback-Safe (`DB::beginTransaction()` ➔ `DB::rollBack()`)**, atau **Manual phpMyAdmin + Query Pemulihan** khusus uji browser E2E.
5. **STOP & Tunggu Review Pengguna**: - Jika pengguna merevisi flow/skenario, sesuaikan planning terlebih dahulu. - Eksekusi skrip QA **HANYA dimulai** setelah pengguna menyatakan **"Setuju"**.

---

## ⏸️ 2B. Protokol Pause & Shortcut Query phpMyAdmin (External / Time Blocker - Tidak Boleh Di-skip)

Saat pengujian berlangsung (khususnya uji E2E / browser pada database aktif), jika alur terhenti karena **ketergantungan sistem eksternal** (contoh: status manifest belum `arrived` dari Aplikasi Android Driver, atau belum ada data request withdrawal dari aplikasi driver) atau **harus menunggu waktu lama** (contoh: batas jam keberangkatan `ETD` / kadaluarsa):

1. **PAUSE Sementara & Tetap Patuh Zero-Direct-CRUD**: - AI **DILARANG** mengeksekusi `INSERT`/`UPDATE`/`DELETE` langsung ke database `transport_system`. - AI **WAJIB menghentikan sementara (PAUSE)** testing tepat di tahap blocker tersebut dan meminta bantuan pengguna mengeksekusi query jalan pintas di **phpMyAdmin**.
2. **Sajikan Paket Monitoring Wajib (4 Informasi + Query Siap Paste)**: - **📍 Status Tahap Saat Ini**: Ringkas tahap mana yang sudah ✅ PASS, tahap mana yang sedang ⏸️ PAUSE, dan tahap apa yang akan dilanjutkan setelah query dijalankan. - **🎯 Untuk Apa (Tujuan Query)**: Penjelasan singkat kondisi bisnis apa yang sedang disimulasikan (misal: mensimulasikan armada telah tiba / `arrived` dari Aplikasi Android Driver, atau memajukan kondisi melewati `ETD`). - **⚙️ Bagaimana Cara Kerjanya**: Tabel, kolom, kondisi `WHERE`, serta perubahan nilai `Before ➔ After`. - **💥 Dampak (*Impact*)**: Efek langsung pada tampilan/menu/saldo yang diuji, plus catatan apakah data ini bersifat sementara. - **📋 Query SQL Siap Paste (phpMyAdmin)** + **Query Rollback/Pemulihan** (untuk mengembalikan data seperti semula setelah rangkaian testing selesai).
3. **Lanjutkan Tepat dari Titik Pause**: - Setelah pengguna mengonfirmasi query sudah dijalankan di phpMyAdmin, AI langsung melanjutkan pengujian dari tahap berikutnya **tanpa mengulang tahap yang sudah PASS** (hemat token & cepat).

---

## ⚡ 3. Tier 1 - Fast Kernel & Rollback-Safe QA (Default, ±3–5 Detik)

Gunakan Tier 1 terlebih dahulu saat pengguna meminta testing. Seluruh uji berjalan di memori Laravel **tanpa membuka browser** dan **100% bebas residu database** (`DB::beginTransaction()` ➔ uji ➔ `DB::rollBack()`).

### A. Smoke & Contract Check (1x Perintah CLI)
Jalankan runner reusable [qa-kernel.php](../scripts/qa-kernel.php):

```bash
php .agents/scripts/qa-kernel.php \
  --html="/halaman-index,/halaman-detail" \
  --json="/endpoint-datatables,/endpoint-api-get" \
  --excel="/endpoint-export-excel"
```

Yang diverifikasi otomatis dalam 1 eksekusi:
1. **HTTP & Blade Render (`--html`)**: Status `200 OK`, bebas *Blade undefined variable* / exception trace.
2. **DataTables & JSON Contract (`--json`)**: Status `200 OK`, JSON valid, **bebas raw HTML/badge** (`<span>`, `<div>`, `<a>`, `<button>`, `<i>`) sesuai Rule #24, serta data record operasional baru/unassigned tetap muncul (bebas penyensoran data akibat filter kaku pada Database View, Kasus #41).
3. **Excel Export Integrity (`--excel`)**: Status `200 OK`, signature biner `.xlsx` valid (`PK`), ukuran > 100 byte.

### B. Mutation, Guard & Edge-Case Check (Jika Menguji Form/Transaksi)
Jika pengguna meminta uji alur mutasi (*create, update, approve, reject, double-submit, validasi 422, RBAC 403*):
1. Buat 1 skrip PHP sementara di `.agents/scratch/qa-mutation.php` yang **WAJIB membungkus seluruh simulasi dalam `DB::beginTransaction()` ... `finally { DB::rollBack(); }`**.
2. Uji minimal: - *Happy path* (data valid ➔ perubahan state/saldo akurat). - *Guard / Edge case* (double-submit / saldo kurang / status tidak valid ➔ tertolak `422` atau `ServiceResult::failed`). - *Input validation* (payload kosong/tidak valid ➔ ditolak `FormRequest`).
3. Jalankan 1 kali, cetak ringkasan `PASS/FAIL`, lalu **wajib hapus** `.agents/scratch/qa-mutation.php` setelah selesai.

### C. Jalur Tier 1 & Tier 2 Multi-Stack (Untuk Proyek Anak Non-Laravel)
Jika proyek anak **bukan** Laravel/MySQL (`adminShuttleV3`), lewati `qa-kernel.php` dan phpMyAdmin, lalu jalankan runner yang sesuai dengan domain proyek:

| Domain Proyek Anak | Tier 1 (Fast Automated / Contract QA) | Tier 2 (Visual / Perceptual QA) |
| :--- | :--- | :--- |
| **Next.js / Vue / Nuxt / Node TS** | `npm run typecheck`, `npm run lint`, `npm run build`, unit/integration test (`vitest` / `jest`), validasi kontrak API JSON | Single-shot Playwright (`console.error` = 0, mobile 390px zero horizontal overflow, WCAG AA contrast) |
| **3D WebGL & Diorama (`diorama`, `teardown`, `3d-configurator-simulator`)** | `node --check`, `mechanism-contract.test.mjs`, validasi lisensi aset `SOURCES.md`/`CREDITS.md`, audit `.dispose()` anti-memory-leak | `diorama` QA harness (`shoot.mjs`, `audit.mjs`, `frames.mjs`, `sweep.mjs`) atau tangkapan orbit desktop/ponsel |
| **Video & Motion (`motlab`, `reelmimic`, `showtime`, `herk-edit-kit`, `code-animation-prompts`)** | `validate-plan.mjs`, `motion_check.py`, `py_compile`, cek resolusi/fps/durasi/audio stream via `ffprobe` | Inspeksi visual contact sheet (`preview-contact-sheet.jpg` / `clip_strip.py --vs`), `showtime qa` (visual + hearing pass), Mog Check G0-G5 |
| **Game Studio (`ohmygame-studio`)** | `canvas_check` validasi Design & Asset Canvas, build/syntax check | Automated playtest via `game_use` & verifikasi frame/interaksi input |
| **AI Agent / MCP Tools (`habblaud`, `posewear`, `webbrain`)** | Smoke test `/api/health` atau JSON-RPC stdio `initialize` + `tools/list`, cek masking secret & batas akses lokal | Uji interaksi UI lokal / verifikasi ekstraksi JSON Schema `webbrain_extract` |

---

## 🎭 4. Tier 2 - Browser QA via Playwright (Khusus Permintaan UI/Browser, ±8–12 Detik)

Jalankan Tier 2 **hanya jika pengguna secara spesifik meminta tes browser / tampilan / Playwright** (atau setelah Tier 1 lulus dan pengguna setuju lanjut cek visual).

* **Wajib Single-Shot Script (Anti Boros Token)**:
  * **DILARANG** melakukan klik/snapshot DOM satu-per-satu secara interaktif via banyak panggilan MCP (yang memakan 15–25 turn LLM).
  * Gunakan **1x panggilan `browser_run_code_unsafe`** (dari `playwright-mcp_playwright`) berisi skrip terarah yang langsung:
    1. Login ke `http://localhost:8000/login` (jika belum berstatus login di sesi browser).
    2. Membuka daftar URL target secara berurutan (tanpa meraba-raba sidebar).
    3. Memantau otomatis `console.error`, `pageerror`, dan HTTP response `>= 400`.
    4. Memverifikasi elemen spesifik (DataTables terisi, modal terbuka tanpa *clipping*, footer total tampil).
    5. Mengembalikan ringkasan JSON ringkas (maksimal 10–15 baris).
* Rujuk kredensial, checklist visual, dan larangan *hard delete* operasional di [playwright-testing.md](./playwright-testing.md).

### 🌐 4A. Standar Pengujian Berbasis Alur UI Browser Nyata (Browser UI Flow First vs Larangan Injeksi Skrip/SQL - Kasus #42)
Saat menguji skenario bisnis pengguna (misal: alur reservasi/pemesanan tiket kasir, pengiriman paket kargo, atau pengisian formulir operasional):
1. **Wajib Alur UI Browser Nyata**: Pengujian transaksi bisnis WAJIB disimulasikan melalui antarmuka web browser nyata via Playwright automation (`browser_run_code_unsafe`) dengan menavigasi halaman formulir, memilih kursi/opsi dropdown, mengisi input identitas, memilih metode pembayaran (tunai/transfer), dan mengklik tombol submit selayaknya staf loket/admin riil di lapangan.
2. **Larangan Keras Injeksi Skrip/SQL Tanpa Instruksi Eksplisit**: AI **DILARANG KERAS** menggunakan injeksi langsung via skrip backend runner atau manipulasi query SQL untuk memalsukan/membuat data transaksi bisnis dengan dalih efisiensi token atau kecepatan waktu.
3. **Pengecualian Khusus**: Injeksi skrip backend atau query SQL untuk membuat data transaksi HANYA diperbolehkan jika dan hanya jika pengguna secara eksplisit memberikan instruksi tertulis (misal: *"inject via script/sql saja"* atau *"buatkan via query/service saja"*).

### 🔄 4B. Wajib Query SQL Reset / Pemulihan Pasca-Testing Interaktif (Tidak Boleh Di-skip)
Jika **Tier 2 Playwright** dijalankan dalam mode **Interactive E2E (klik tombol submit / mutasi nyata di browser)** yang mengubah data di database `transport_system`:
1. **Catat Snapshot Awal (*Before State*)**: Sebelum tombol mutasi diklik, AI wajib membaca nilai awal kolom/baris target secara *read-only* (status, pembayaran, saldo, relasi anak/log).
2. **Wajib Sediakan Query SQL Reset Siap Paste (phpMyAdmin)**: Pada akhir laporan QA, AI **WAJIB** melampirkan blok query SQL pemulihan lengkap dan akurat untuk mengembalikan seluruh tabel terdampak (tabel utama, tabel relasi/person, saldo, serta penghapusan log tracking/history baru hasil testing) persis ke kondisi semula (*Before State*).
3. **Tetap Patuh Zero-Direct-CRUD**: AI **DILARANG** mengeksekusi query reset tersebut sendiri ke database - biarkan pengguna memilih apakah ingin mempertahankan hasil testing atau menyalin query reset ke **phpMyAdmin**.

---

## 📋 5. Format Laporan QA ke Pengguna

Sajikan hasil QA secara ringkas dalam 1 tabel (dan sertakan blok **Query SQL Reset phpMyAdmin** sesuai Bagian `4B` setiap kali ada mutasi nyata pada database):

| Lapisan Uji | Target / Skenario | Status | Catatan Singkat |
| :--- | :--- | :--- | :--- |
| Tier 1 (HTML) | `/url-target` | ✅ PASS | HTTP 200 (180ms) |
| Tier 1 (JSON) | `/url-target/data` | ✅ PASS | JSON murni, 0 raw HTML |
| Tier 1 (XLSX) | `/url-target/export` | ✅ PASS | Valid XLSX (14 KB) |
| Tier 1 (Guard) | Double-submit / Validasi 422 | ✅ PASS | Ditolak sesuai guard, DB di-rollback |
| Tier 2 (UI) | *(Opsional - hanya jika diminta)* | ⏭️ SKIP / ✅ PASS | 0 console error, 0 network 4xx/5xx |
