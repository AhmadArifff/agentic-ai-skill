# Rule 32: Visual-First Engineering & Visual Anchor Protocol

> **Frontend Slicing & Craftsmanship Standard**: Protokol wajib untuk mengeliminasi *The Functional Trap* (koding asal jalan tanpa estetika) dan *Passive Skill Syndrome* (skill desain ada tapi tidak terpicu). Menjamin seluruh hasil slicing antarmuka memiliki estetika tinggi, proporsi presisi, dan visual hierarchy sekelas template Figma atau dashboard enterprise modern.

---

## 1. Prinsip Utama & Larangan Keras

1. **Larangan Koding Buta (*Zero Blind Slicing*)**:
   - Agen **DILARANG KERAS** langsung menulis kode frontend (Blade, React, Vue, HTML, CSS, Tailwind) sebelum menyajikan **Visual Planning (ASCII Wireframe)** dan menyepakati **Jangkar Referensi Visual (*Visual Anchor*)** di tahap Planning & Review.
2. **Eliminasi *The Functional Trap***:
   - Kriteria "selesai" bukan hanya fungsinya berjalan atau API sukses 200, melainkan mencakup **kesempurnaan estetika, ritme whitespace, kontras tipografi, dan kerapian visual**.
3. **Eliminasi *Passive Skill Syndrome***:
   - Agen dilarang membuat komponen antarmuka dari nol dengan `<div>` mentah tanpa gaya.
   - Agen **WAJIB secara eksplisit mengaktifkan katalog skill terdaftar** pada sub-tugasnya:
     - Gunakan `skills/untitled-ui` untuk Application Shell, KPI Metric Cards, dan Data Tables.
     - Gunakan `skills/shadcn-ui` dan `skills/21st-dev` untuk Modal Dialog, Slide-Over Drawer, Tabs, dan Filter Controls.
     - Gunakan `skills/antislop-ui` untuk audit eliminasi cacat visual AI.

---

## 2. Protokol Wajib di Tahap Planning & Review (Visual Planning Gate)

Setiap kali pengguna meminta fitur baru yang memiliki tampilan antarmuka (UI), agen **WAJIB menyertakan 4 elemen visual ini di dalam laporan review sebelum meminta persetujuan koding**:

### Elemen 1: ASCII Layout Wireframe
Agen wajib menggambar sketsa tata letak kasar halaman secara visual:
```text
+--------------------------------------------------------------------------+
| Header: [Judul Halaman]                    [Search Bar]  [+ Tombol Aksi] |
+--------------------------------------------------------------------------+
| Metric Cards (KPI 3 Kolom):                                              |
| [ Total Armada: 42 ]   [ Supir Aktif: 38 ]   [ Pendapatan: Rp 12.4M ]    |
+--------------------------------------------------------------------------+
| Filter Bar: [Tanggal v]  [Outlet v]  [Status v]            [Tombol Reset] |
+--------------------------------------------------------------------------+
| Data Table: Clean borderless, hover subtle slate-50, badges rounded-full |
| [Foto + Nama Supir] | [No Lambung] | [Rute] | [Status Badge] | [Aksi ...] |
+--------------------------------------------------------------------------+
| Footer: Pagination ringkas (Showing 1-10 of 120)                         |
+--------------------------------------------------------------------------+
```

### Elemen 2: Klarifikasi Jangkar Referensi (*Visual Anchor*)
Agen wajib mencantumkan opsi jangkar referensi desain:
- **Metode A (Screenshot / Mockup Aset)**: Minta pengguna menaruh screenshot desain Figma atau template favorit ke `scratch/ui-references/` (misal: `scratch/ui-references/driver-table.png`). Agen membaca gambar tersebut via kemampuan multimodal untuk menyerap rasio padding, palet warna, dan hierarki visualnya.
- **Metode B (Design Universe / Role Model)**: Mendeklarasikan kiblat desain secara spesifik, contoh:
  - *Benchmark Untitled UI / Stripe*: Clean light mode, latar `slate-50`, card surface putih dengan border 1px `slate-200/80`, font Inter, dan angka numerik tabular.
  - *Benchmark Vercel / Linear*: Sleek dark mode, crisp 1px borders, subtle hover transitions.
- **Metode C (AI Generative Mockup Wireframe)**: Jika pengguna belum memiliki bayangan sama sekali, agen menawarkan untuk membuatkan mockup gambar kasar terlebih dahulu via `generate_image` dan menyimpannya di `scratch/` untuk disetujui.

### Elemen 3: Persistensi Referensi di `scratch/` untuk Session State
Setiap referensi visual (gambar mockup, screenshot Figma, atau token warna) **wajib disimpan di folder `scratch/ui-references/`**. Hal ini bertujuan agar:
1. Menjadi acuan ground-truth visual yang tidak mengalami halusinasi konteks (*context drift*).
2. Dapat digunakan kembali (*reusable*) pada kasus-kasus pengembangan modul serupa di masa mendatang.

### Elemen 4: Deklarasi Skill Desain Aktif
Sebutkan skill yang diaktifkan, contoh:
`"Mengaktifkan skills/untitled-ui (KPI Cards) + skills/shadcn-ui (Modal) + skills/antislop-ui (Audit Visual)"`.

---

## 3. 4 Invarian Rekayasa Visual (Visual Craftsmanship Invariants)

Seluruh kode frontend yang diproduksi agen wajib mematuhi 4 invarian ini:

1. **8pt Spacing Scale**:
   - Semua margin, padding, dan gap wajib mengikuti kelipatan 4px atau 8px konsisten (`p-3`, `p-4`, `p-6`, `gap-3`, `gap-4`).
   - Dilarang keras menggunakan padding arbitrer acak (seperti `p-[11px]` atau `m-[17px]`).
2. **Hierarki Tipografi 3-Tingkat**:
   - **Level 1 (Title / KPI)**: `font-bold text-slate-900 text-lg` atau `text-2xl`.
   - **Level 2 (Data / Isi Utama)**: `font-medium text-slate-700 text-sm`.
   - **Level 3 (Meta / Label Kolom)**: `text-xs font-semibold text-slate-400 uppercase tracking-wider`.
3. **Penyederhanaan Palet Warna (Anti-AI Slop)**:
   - Maksimal 3 lapisan warna: Background (`bg-slate-50`), Surface Card (`bg-white` dengan border halus `border-slate-200/80`), dan 1 Warna Aksen Utama (misal Emerald atau Blue untuk status & aksi).
   - Dilarang keras menggunakan gradien ungu-biru generik AI tanpa identitas merek.
4. **Kelengkapan Polish State**:
   - Wajib menyertakan *Hover State* halus (`hover:bg-slate-50 transition-colors`).
   - Wajib menyertakan *Status Badge* yang proporsional (`rounded-full px-2.5 py-0.5 text-xs font-medium`).
   - Wajib menyertakan *Empty State* yang ramah (dengan ikon mini dan pesan humanis) jika data tabel kosong.
   - Wajib menyertakan *Skeleton Loading* saat menunggu data AJAX.

---

## 4. Visual Verification Gate Sebelum Serah Terima

Sebelum menyatakan tugas selesai (*done*):
1. Reviewer (`qa-engineer` atau subagent) wajib melakukan verifikasi visual menggunakan Playwright browser testing:
   - Buka halaman lokal dan ambil screenshot tampilan render aktual.
   - Periksa apakah ada elemen bertabrakan, teks terpotong, atau layout kaku.
2. Jika ditemukan cacat visual, agen builder wajib memperbaikinya secara otonom **sebelum** menyerahkan hasil akhir kepada pengguna.
