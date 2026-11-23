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
| **Routing & Modul** (`routes/**`, `api/**`) | **[11-structure-routing.md](./rules/11-structure-routing.md)** | Standar import `use` di header, isolasi grup rute controller, dan modular `routes/partials/`. |
| **Database & Skema Data** (`database/**`, `migrations/**`) | **[20-database.md](./rules/20-database.md)** | Kepatuhan skema ground-truth, migrasi statis `Schema::create`, SQL manual permission, SP & View. |
| **Database Reasoning (Legacy vs Modern)** | **[21-database-reasoning.md](./rules/21-database-reasoning.md)** | Pemetaan evolusi skema basis data Legacy Monolitik vs Modern Normalized. |
| **UI Form, Modal & Responsivitas** (`resources/views/**`, `components/**`) | **[30-ui-frontend.md](./rules/30-ui-frontend.md)** | Anti-clipping modal datepicker, Single Title header index tanpa breadcrumb, breadcrumb form, mobile friendly. |
| **UI Component Reasoning & Z-Index** | **[30-ui-component-reasoning.md](./rules/30-ui-component-reasoning.md)** | Matriks reasoning elemen UI (Toast vs Modal vs Drawer vs Popover vs Inline Alert) dan skala Z-index. |
| **Tabel Laporan & Data Finansial** (`reports/*`, `settlements/*`) | **[31-ui-reports.md](./rules/31-ui-reports.md)** | Single Unified Table, Zero-Double-Scroll DataTables, Pure Numeric Typography (tanpa "Rp "), pewarnaan semantik. |
| **Visual-First Engineering & Mockups** | **[32-visual-first-engineering.md](./rules/32-visual-first-engineering.md)** | Protokol Visual Planning Gate (ASCII wireframe), Visual Anchor (`scratch/ui-references/`), dan 4 Invarian Visual. |
| **Keamanan & Otorisasi RBAC** | **[40-security-rbac.md](./rules/40-security-rbac.md)** | Validasi hak akses controller, sanitasi input XSS/SQLi, proteksi IDOR, dan kredensial acak unik. |
| **Fitur Ekspor Spreadsheet Excel** | **[50-report-export.md](./rules/50-report-export.md)** | Ekspor berkecepatan tinggi dengan FastXlsxWriter/FastExcel streaming anti-OOM (Out-Of-Memory). |

---

## 3. Direktori Prosedur Kerja Baku (*Workflows*)
Saat menjalankan skenario pekerjaan tertentu, ikuti alur langkah-demi-langkah berikut:
* **[workflows/task-review-protocol.md](./workflows/task-review-protocol.md)**: **[WAJIB]** Protokol Review Task Sebelum Development (Evaluasi 7 Pilar & Persetujuan Pengguna).
* **[workflows/post-dev-qa.md](./workflows/post-dev-qa.md)**: SOP Post-Development QA on-demand (Tier 1 Fast Kernel & Rollback-Safe QA via `qa-kernel.php` & Tier 2 Playwright Browser Flow).
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
* **[knowledge/bug-cases.md](./knowledge/bug-cases.md)**: Daftar riwayat kasus bug tervalidasi (`Kasus #01` s.d `Kasus #47`).
* **[knowledge/team-alignment-framework.md](./knowledge/team-alignment-framework.md)**: Pola briefing 3 Kalimat Emas ke stakeholder, Contract-First JSON protocol, & Kamus Zero-Jargon.
* **[knowledge/hub-and-spoke-sync.md](./knowledge/hub-and-spoke-sync.md)**: Protokol Master Hub (`agentic AI`) vs Child Spokes (`E-Comerce-BucketFlowers`, `adminShuttleV3`, dll).
* **[knowledge/spoke-adoption-guide.md](./knowledge/spoke-adoption-guide.md)**: Panduan adopsi starter pack, 2 pertanyaan kustomisasi onboarding (Git & DB).
* **[knowledge/stored-procedures-and-views.md](./knowledge/stored-procedures-and-views.md)**: Blueprint Stored Procedures & Database Views untuk MySQL (`adminShuttleV3`) & Supabase/Postgres.
* **[knowledge/financial-ledger-transactions.md](./knowledge/financial-ledger-transactions.md)**: Blueprint pemisahan tabel request vs disbursement penarikan insentif supir dengan atomic lock.
* **[knowledge/production-db-sync.md](./knowledge/production-db-sync.md)**: SOP sanitasi dan mitigasi schema drift impor dump SQL produksi.
* **[knowledge/payment-logistics-integrations.md](./knowledge/payment-logistics-integrations.md)**: Blueprint integrasi payment gateway Midtrans/QRIS dan agregator logistik Biteship.
* **[knowledge/video-retention-engineering.md](./knowledge/video-retention-engineering.md)**: Blueprint video shorts viral (The 3-Second Hook & timeline snapping milidetik).
* **[knowledge/web3-client-architecture.md](./knowledge/web3-client-architecture.md)**: Blueprint Pure Client-Side Web3 Terminal & anti SSR hydration mismatch.
* **[04-case-bank/](../04-case-bank/)**: Long-term organizational memory (35 kasus produksi terverifikasi).

---

## 5. Keahlian Khusus (*On-Demand Skills*)
Framework ini diperkuat oleh 56 skill terdaftar di `skills/` dan `.agents/skills/`:
* **[skills/reelmimic/SKILL.md](./skills/reelmimic/SKILL.md)**: Suite kloning gaya video referensi & animasi 2D artistik berbasis kode (`video-clone` + Motion Score compiler, 6 engine 2D: cat air `painted-animation` p5.brush, `anime-cel`, `crayon-storybook`, `pixel-art`, `paper-cutout`, `whiteboard`, plus `music-to-video` beatgrid & `blender-product-film`).
* **[skills/webbrain/SKILL.md](./skills/webbrain/SKILL.md)**: Delegasi tugas ke sesi browser Chrome/Edge nyata yang sudah login (cookies/SSO/MFA aktif) via `@webbrain/mcp-server` (`webbrain_run`, `webbrain_extract` JSON Schema, approval-gated `Act`, `/watch`, `/workflow`, `/teach`, dan Vision mode).
* **[skills/openmotion/SKILL.md](./skills/openmotion/SKILL.md)**: Alternatif open-source Claude Motion & CapCut (Visual Timeline Studio + MCP `openmotion_*`, standar `Motion.md` & 300+ template brand film, Motion Package v0.2, BYOK Multimodal Gateway, dan import HyperFrames ZIP).
* **[skills/showtime/SKILL.md](./skills/showtime/SKILL.md)**: Studio video 100% lokal tanpa cloud API key (voice-over Kokoro/Piper/Supertonic lokal, developer videos `pr-video`/`release-video`/`recap`/`repro`, data story CSV/PDF/Manim math, audio-synced `xray`, video kuis interaktif HTML offline, dan `showtime qa` visual + hearing pass).
* **[skills/hypit/SKILL.md](./skills/hypit/SKILL.md)**: Sistem kloning & produksi video viral berbasis bahasa deklaratif SVML/SVS/SVRun tertambat kata (*word-anchored*) untuk multi-varian UGC/iklan, podcast split-screen, tierboard, dan street interview (`@hypit/hypit`).
* **[skills/ohmygame-studio/SKILL.md](./skills/ohmygame-studio/SKILL.md)**: AI Game Studio MCP workflow (Design & Asset Canvas, generasi aset game 2D/3D/rig/audio, multiplayer rooms/saves/leaderboards, playable interactive stories, plugin SDK, dan playtest otomatis `game_use`).
* **[skills/herk-edit-kit/SKILL.md](./skills/herk-edit-kit/SKILL.md)**: Suite post-production rekaman *talking-head* & footage nyata (`cut-silences`, `cut-mistakes` review-gated, `edit-video`, Reels/Shorts 9:16 `short-form-edit`, `video-storytelling`, dan `motion-showreel` 120-130 BPM).
* **[skills/hyperframes/SKILL.md](./skills/hyperframes/SKILL.md)**: Engine komposisi HTML+GSAP Studio (`npx hyperframes` CLI terpadu, 9 palet kurasi, 14 katalog transisi, *video-beats* talking-head, dan registry blok/komponen).
* **[skills/motlab/SKILL.md](./skills/motlab/SKILL.md)**: Studio produksi video berbasis kode HTML `<canvas>` (`renderAt(t)`), web viewer frame-by-frame dengan catatan revisi visual (`selection.json`), manajemen versi, talking-head cutter, dan render cepat WebCodecs 4K MP4.
* **[skills/motlab-assets/SKILL.md](./skills/motlab-assets/SKILL.md)**: Pabrik kit aset visual reusable berbasis kode (ikon, ilustrasi, karakter 2D rig, transisi, objek 3D PBR) berformat PNG transparan + SVG atau GLB/FBX/OBJ.
* **[skills/archify/SKILL.md](./skills/archify/SKILL.md)**: Diagram interaktif mandiri (*standalone HTML*) dan One-Page Explainer (10 tipe diagram: architecture, workflow, sequence, dataflow, lifecycle, ERD, class, tree, timeline, waterfall), path tracing, dark/light theme, ekspor image/SVG/WebM, dan verifikasi CLI (`node bin/archify.mjs finalize`).
* **[skills/stack-diagram/SKILL.md](./skills/stack-diagram/SKILL.md)**: Diagram arsitektur cloud, monorepo, dan system layout dengan logo resmi vendor (AWS, GCP, Azure, K8s, svgl, devicon), orthogonal arrow routing, dan output self-contained HTML/PNG/TSX.
* **[skills/teardown/SKILL.md](./skills/teardown/SKILL.md)**: Simulator 3D mesin interaktif offline single-file HTML, exploded view / cutaways, kinematic linkages, live telemetry HUD panels, dan 60fps video capture via Playwright & Three.js.
* **[skills/motionmaxxing/SKILL.md](./skills/motionmaxxing/SKILL.md)**: Looksmaxxing for motion graphics: mengubah video AI slop menjadi film berkualitas senior motion designer (seek-safe GSAP, Three.js 3D hero objects, Mog Check G0-G5, dan render lokal frame-by-frame via Chrome & FFmpeg).
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
