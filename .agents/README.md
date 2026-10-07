# Peta Tata Kelola & Aturan Kerja (Antigravity & Agentic AI Rules Map)

Selamat datang di direktori tata kelola aturan dan pengetahuan proyek **Agentic AI**. Seluruh aturan kode, alur kerja, dan keahlian telah dipecah secara modular untuk efisiensi token budget, kepatuhan arsitektur, dan ketahanan sistem multi-agen.

> [!NOTE]
> File auto-load utama yang terbaca otomatis di setiap sesi percakapan baru adalah [`AGENTS.md`](../AGENTS.md) di root workspace. File tersebut mendefinisikan hirarki 4-tier peran, siklus OODA, dan pointer ke direktori ini.

---

## 1. Aturan Mutlak (Selalu Aktif)
Setiap sesi pengerjaan AI Agent **WAJIB** tunduk pada dua dokumen inti ini:
* **[00-core-guardrails.md](./rules/00-core-guardrails.md)**: Larangan keras (larangan bypass Controller/Service/Repository, bypass RBAC, hardcode kredensial rahasia, dan larangan otomasi browser tanpa izin eksplisit).
* **[01-workflow-discipline.md](./rules/01-workflow-discipline.md)**: Siklus OODA, Human-in-the-Loop review gate, task boundary (anti scope-creep), pembersihan berkas scratch/zombie code, higienitas komentar kode (anti-slop), dan label UI bebas jargon teknis.

---

## 2. Peta Aturan Berdasarkan Area Kerja (*Task-Based Rules*)

Gunakan panduan berikut untuk membuka dan mematuhi dokumen spesifik sesuai konteks file yang sedang dikerjakan:

| Jika Sedang Mengerjakan... | Buka & Patuhi Dokumen: | Cakupan Utama |
| :--- | :--- | :--- |
| **Backend & Business Logic** (`app/**`, `src/backend/**`) | **[10-architecture.md](./rules/10-architecture.md)** | Pemisahan 4-layer: Controller -> Service -> Repository -> Model. Transaction safety & guard clauses. |
| **Routing & Modul** (`routes/**`, `api/**`) | **[11-structure-routing.md](./rules/11-structure-routing.md)** | Standar import `use` di header, isolasi grup rute controller, pencegahan Git merge conflict. |
| **Database & Skema Data** (`database/**`, `migrations/**`) | **[20-database.md](./rules/20-database.md)** | Kepatuhan skema ground-truth, indeks foreign key komposit, isolasi soft-delete, dan pencegahan N+1 query. |
| **UI Form, Modal & Responsivitas** (`resources/views/**`, `components/**`) | **[30-ui-frontend.md](./rules/30-ui-frontend.md)** | Anti-clipping modal datepicker, Single Title header index tanpa breadcrumb, breadcrumb form, mobile friendly. |
| **Tabel Laporan & Data Finansial** (`reports/*`, `settlements/*`) | **[31-ui-reports.md](./rules/31-ui-reports.md)** | Single Unified Table, Zero-Double-Scroll DataTables, Pure Numeric Typography (tanpa "Rp "), pewarnaan semantik. |
| **Keamanan & Otorisasi RBAC** | **[40-security-rbac.md](./rules/40-security-rbac.md)** | Validasi hak akses controller, sanitasi input XSS/SQLi, proteksi IDOR, dan kredensial acak unik. |
| **Fitur Ekspor Spreadsheet Excel** | **[50-report-export.md](./rules/50-report-export.md)** | Ekspor berkecepatan tinggi dengan FastXlsxWriter/FastExcel streaming anti-OOM (Out-Of-Memory). |

---

## 3. Direktori Prosedur Kerja Baku (*Workflows*)
Saat menjalankan skenario pekerjaan tertentu, ikuti alur langkah-demi-langkah berikut:
* **[workflows/task-review-protocol.md](./workflows/task-review-protocol.md)**: **[WAJIB]** Protokol Review Task Sebelum Development (Evaluasi 7 Pilar & Persetujuan Pengguna).
* **[workflows/new-module.md](./workflows/new-module.md)**: Langkah pembuatan modul CRUD / domain baru end-to-end.
* **[workflows/new-prd-feature.md](./workflows/new-prd-feature.md)**: Siklus hidup pembuatan fitur berbasis PRD (PRD -> DB -> Types -> API -> UI -> QA -> Gate).
* **[workflows/new-report.md](./workflows/new-report.md)**: Langkah pembuatan modul Laporan Tabular dan Finansial.
* **[workflows/add-db-column.md](./workflows/add-db-column.md)**: Prosedur penambahan kolom database produksi aman tanpa downtime.
* **[workflows/fix-403.md](./workflows/fix-403.md)**: Panduan diagnosis cepat dan resolusi izin/otorisasi 403 Forbidden.
* **[workflows/multi-device-collaboration.md](./workflows/multi-device-collaboration.md)**: Protokol kolaborasi multi-perangkat (`git pull --rebase origin main`, linear history, zero conflict).
* **[workflows/playwright-testing.md](./workflows/playwright-testing.md)**: SOP Pengujian Browser Playwright otomatis (Hanya jika diminta eksplisit oleh pengguna).

---

## 4. Bank Kasus Bug & Solusi (*Knowledge Base*)
Setiap temuan bug produksi, akar masalah, dan perbaikan teruji dicatat secara permanen:
* **[knowledge/README.md](./knowledge/README.md)**: Tata kelola dan format pencatatan kasus bug.
* **[knowledge/bug-cases.md](./knowledge/bug-cases.md)**: Daftar riwayat kasus bug tervalidasi (Kasus #01, #02, #03, dst.).
* **[knowledge/hub-and-spoke-sync.md](./knowledge/hub-and-spoke-sync.md)**: Protokol Master Hub (`agentic AI`) vs Child Spokes (`E-Comerce-BucketFlowers`, `adminShuttleV3`, dll).
* **[knowledge/payment-logistics-integrations.md](./knowledge/payment-logistics-integrations.md)**: Blueprint integrasi payment gateway Midtrans/QRIS dan agregator logistik Biteship.
* **[04-case-bank/](../04-case-bank/)**: Long-term organizational memory (27 kasus produksi terverifikasi).

---

## 5. Keahlian Khusus (*On-Demand Skills*)
Framework ini diperkuat oleh 42 skill terdaftar di `skills/` dan `.agents/skills/`:
* **[skills/excel-export/SKILL.md](./skills/excel-export/SKILL.md)**: Pembuatan spreadsheet berkecepatan tinggi dengan FastXlsxWriter dan ReportExporter.
* **[skills/agentic-ai/SKILL.md](./skills/agentic-ai/SKILL.md)**: Master Multi-Agent Orchestration & Governance System (OODA loop).
* **[skills/antislop/SKILL.md](./skills/antislop/SKILL.md)**: Filter kualitas anti-AI-slop (38 aturan absolut, Liveliness Toolkit, Delivery Gate).
* **[skills/3d-configurator-simulator/SKILL.md](./skills/3d-configurator-simulator/SKILL.md)**: WebGL Three.js, Draco compression, dan biomechanical simulation.
* Serta modul UI enterprise lainnya: `shadcn-ui`, `magic-ui`, `21st-dev`, `react-bits`, `untitled-ui`, `animate-ui`, dan `motion`.

---

## 6. Template Stubs Boilerplate (*Scaffolding*)
Gunakan template standar di `.agents/stubs/` untuk mempercepat pembuatan kode sesuai arsitektur 4-layer:
* `stubs/controller.stub`: Controller ramping (Thin Controller) terintegrasi FormRequest & permission check.
* `stubs/service.stub`: Service layer dengan transaksi database aman (`DB::beginTransaction()`).
* `stubs/repository.stub`: Repository layer dengan isolasi kueri Eloquent dan eager loading.
