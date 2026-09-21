# Multi-Agent Orchestration & Governance System

Sistem arsitektur multi-agent terdistribusi berbasis siklus **OODA (Observe, Orient, Decide, Act)** dengan pemisahan tugas tegas (*Separation of Duty*) antara pelaksana (**Builder**) dan penguji (**Reviewer**), dilengkapi dengan mekanisme pelacakan tujuan berkelanjutan (**Session State & Goal Tracker**), tata kelola kritis (**Governance**), dan memori jangka panjang tervalidasi (**Case-Bank**).

---

## ⚡ Quick Start di Perangkat Baru (One-Command Autonomous Setup)

Saat melakukan clone repositori ini ke komputer baru, server, container, atau CI/CD (Windows, macOS, Linux):
```bash
# 1. Clone repositori
git clone https://github.com/AhmadArifff/agentic-ai-skill.git
cd agentic-ai-skill

# 2. Jalankan instalasi otonom seluruh skill & dependensi
npm run setup
```
Perintah `npm run setup` secara otomatis akan:
- Memeriksa kompatibilitas runtime Node.js.
- Menginstal dependensi terisolasi untuk seluruh skill (`playwright-skill`, `motion`, `shadcn-ui`, `magic-ui`).
- Mengunduh binary peramban Chromium untuk pengujian Playwright.
- Menguji kesiapan CLI dan modul-modul penting.

Untuk memverifikasi kesehatan seluruh sistem peran dan skill kapan saja:
```bash
npm run test:system
```

---

## 1. Filosofi Inti & Prinsip Desain

### A. Separation of Duty (Pemisahan Tugas)
Satu peran pelaksana (Builder) **tidak boleh** menjadi validator tunggal atas hasil kerjanya sendiri.
- Menggabungkan builder dan reviewer menciptakan fenomena **Echo-Chamber Hallucination** (model LLM menyetujui kekeliruannya sendiri).
- Semua artifact hasil kerja Builder wajib melalui minimal 1 Reviewer domain-spesifik dan 1 Reviewer agnostik (*Tech Critic*).

### B. Explicit Reviewer Verdict
Reviewer tidak diperkenankan memberikan feedback ambigu yang tidak memiliki status mesin. Setiap evaluasi wajib menghasilkan salah satu dari 3 verdict terstruktur:
1. `approved`: Artifact memenuhi kriteria domain secara penuh.
2. `rework`: Terdapat temuan spesifik yang wajib diperbaiki oleh Builder terkait.
3. `blocked-escalate`: Terjadi pelanggaran fatal, konflik irreconcilable, atau kebuntuan yang membutuhkan keputusan manusia (*Human-in-the-Loop*).

### C. Constraint Locking & Progressive State
State sesi bukan sekadar riwayat percakapan (*chat log*). Modul **Goal Tracker** mengunci setiap keputusan arsitektural yang telah disepakati ke dalam `established_constraints`. Agent pada giliran berikutnya dilarang mengubah keputusan yang telah terkunci tanpa izin eskalasi.

### D. Dual-Approval Case-Bank Promotion
Pola solusi baru diklasifikasikan sebagai `hypothesis`. Sebuah case hanya dapat dipromosikan menjadi status `verified` jika memperoleh persetujuan ganda independen dari **QA Engineer** dan **Tech Critic**.

---

## 2. Struktur Direktori Proyek

```
.
├── README.md                                  # Dokumentasi arsitektur & panduan sistem
├── 01-roles/                                  # Definisi & spesifikasi peran agent
│   ├── builders/                              # Eksekutor (Menghasilkan output/kode/desain)
│   │   ├── backend-engineer.md                # Server, database, API, logika bisnis
│   │   ├── frontend-engineer.md               # Antarmuka web/mobile, integrasi API, CSS
│   │   ├── ui-ux-designer.md                  # Alur pengguna, wireframe, ergonomi visual
│   │   ├── copywriter.md                      # UX copy, microcopy, messaging, konsistensi nada
│   │   ├── ai-engineer.md                     # Prompt engineering, token budget, parameter LLM
│   │   └── domain-retriever.md                # Pengambilan data RAG/API tanpa kesimpulan sepihak
│   ├── reviewers/                             # Penguji (Memvalidasi output, No Self-Review)
│   │   ├── qa-engineer.md                     # Pengujian fungsional, edge cases, regresi
│   │   ├── security-engineer.md               # Threat modeling, OWASP, otentikasi & enkripsi
│   │   ├── product-manager.md                 # Keselarasan PRD, deteksi scope-creep, nilai bisnis
│   │   ├── business-sales-manager.md          # Viabilitas komersial, harga, daya saing pasar
│   │   ├── user-test-professional.md          # Heuristik usability, friksi psikologis pengguna
│   │   ├── data-cross-verifier.md             # Verifikasi fakta numerik, sumber data, sitasi
│   │   └── tech-critic.md                     # Devil's Advocate: logical fallacies & overconfidence
│   ├── orchestration/                         # Koordinasi & Manajemen State (Tier General)
│   │   ├── triage-router.md                   # Analisis intensi & routing kompleksitas
│   │   ├── context-state-pruner.md            # Kompaksi token, pembuang noise, audit log
│   │   ├── goal-tracker.md                    # Pelacak status sub-tugas & pengunci constraint
│   │   ├── problem-decomposer.md              # Dekomposisi tugas monolitik jadi unit atomik
│   │   └── synthesis-voice.md                 # Konsolidasi akhir jadi satu jawaban padu
│   └── governance/                            # Pengawasan Kritis & Keamanan (Tier Krusial)
│       ├── policy-schema-enforcer.md          # Validasi skema (JSON/YAML), token limit, etika
│       ├── deadlock-fallback-resolver.md      # Pemutus loop tak berujung (circuit breaker)
│       └── escalation-gate.md                 # Interseptor aksi sensitif untuk konfirmasi manusia
├── 02-session-state/                          # Skema & Mutasi State Percakapan
│   ├── schema.yaml                            # Spesifikasi skema session_state resmi
│   ├── state-transitions.md                   # Siklus hidup & mutasi state per giliran
│   └── example-session-state.yaml             # Contoh nyata session state yang sedang berjalan
├── 03-pipelines/                              # Alur Kerja & Protokol Komunikasi
│   ├── handoff-protocol.md                    # Format payload standar antar-agent
│   ├── rework-loop-spec.md                    # Mekanisme & pembatasan loop revisi
│   └── pipeline-flow.mermaid                  # Diagram alur end-to-end
└── 04-case-bank/                              # Penyimpanan Pola & Memori Jangka Panjang
    ├── case-bank-spec.md                      # Aturan promosi hypothesis -> verified
    └── cases/
        ├── template.yaml                      # Template deklarasi case baru
        └── sample-case.yaml                   # Contoh pola tervalidasi riil
```

---

## 3. Matriks Klasifikasi Peran

| Tier | Kelompok | Agent | Mandat Utama | Output Utama |
|---|---|---|---|---|
| **General** | Orchestration | `triage-router` | Mengurai intensi pengguna & rute awal | Route Plan & Complexity Tier |
| | Orchestration | `problem-decomposer` | Membagi gol besar jadi sub-tugas atomik | Subtask Execution Graph |
| | Orchestration | `goal-tracker` | Mengawal progres & mengunci constraint | Updated `session_state.yaml` |
| | Orchestration | `context-state-pruner`| Mengurangi beban konteks tanpa hilang fakta | Compressed Context & Prune Log |
| | Orchestration | `synthesis-voice` | Menggabungkan seluruh output jadi respon utuh | Final Response to User |
| **Specific** | Builder | `backend-engineer` | Logika server, database schema, API contracts | Backend Spec & Code Blocks |
| | Builder | `frontend-engineer` | Komponen antarmuka, layout, CSS murni/modern | Component Code & Styling |
| | Builder | `ui-ux-designer` | Tata letak interaksi, wireframe, ergonomi | Interaction & Layout Spec |
| | Builder | `copywriter` | Nada bicara, UX microcopy, pesan kesalahan | Copy Deck & Localization Map |
| | Builder | `ai-engineer` | Desain prompt, model config, parameter agent | Prompt Artifacts & Schemas |
| | Builder | `domain-retriever` | Penarikan fakta mentah (RAG/API/Docs) | Structured Raw Facts (No bias) |
| | Builder | `ml-vision-engineer` | Machine Learning, Deep Learning, Computer Vision, ONNX & Edge Deploy | Trained Models, ONNX & Inference Code |
| **Specific** | Reviewer | `qa-engineer` | Uji fungsional, skenario ekstrem, boundary check| QA Test Matrix & Verdict |
| | Reviewer | `security-engineer` | Threat analysis, OWASP, sanitasi data, izin akses| Security Audit & Verdict |
| | Reviewer | `product-manager` | Keselarasan dengan PRD dan target objektif | Value Alignment & Verdict |
| | Reviewer | `business-sales-manager`| Nilai komersial, konversi, kepraktisan pasar | Commercial Viability & Verdict |
| | Reviewer | `user-test-professional`| Usability heuristics, friction analysis | Usability Report & Verdict |
| | Reviewer | `data-cross-verifier` | Verifikasi sumber, angka, statistik, kutipan | Data Audit & Verdict |
| **Krusial** | Reviewer/Gate | `tech-critic` | Devil's Advocate: cari logical fallacy & overconfidence | Critique Report & Final Verdict |
| | Governance | `policy-schema-enforcer`| Menjamin format valid (JSON/YAML), batasan token| Compliance Badge / Rejection |
| | Governance | `deadlock-fallback-resolver`| Memutus loop rework berulang (max 3 putaran) | Circuit Break / Fallback Route |
| | Governance | `escalation-gate` | Menahan aksi destruktif untuk izin manusia | Escalation Ticket (HITL) |

---

### 3.1. DNA Personas Ahli Kelas Dunia (World-Class Expert Personas & Mental Models)

Untuk mengeliminasi respon generik (*AI slop*) dan menjamin ketajaman penalaran pada setiap keputusan, agen diperkuat oleh **14 Expert Personas & Model Mental** kelas dunia:

| Layer | Role Terkait | Expert Persona | Model Mental & Prinsip Inti |
|---|---|---|---|
| **Strategy** | `product-manager`, `triage-router` | **Jeff Bezos** | *Working Backwards PR/FAQ, Day 1 Mindset, Two-Way Doors* |
| | `backend-engineer` | **Werner Vogels** | *Design for Failure (Everything Fails All The Time), API-First* |
| | `tech-critic`, `security-engineer` | **Charlie Munger** | *Inversion (Pre-Mortem), Checklist 25 Bias Kognitif, Anti-Fallacy* |
| **Product** | `ui-ux-designer`, `user-test-professional` | **Don Norman** | *Affordance, Signifiers, Mental Models, Blame Design Not User* |
| | `frontend-engineer`, `ui-ux-designer` | **Matias Duarte** | *Material Metaphor, Typography-First, Elevation Physics* |
| | `ui-ux-designer`, `frontend-engineer` | **Alan Cooper** | *Goal-Directed Design, Persona Scenarios, Frictionless Flow* |
| **Engineering** | `backend-engineer`, `frontend-engineer` | **DHH** | *Convention over Configuration, The Majestic Monolith* |
| | `qa-engineer` | **James Bach** | *Exploratory Testing, Testing is Not Checking, Boundary Stressing* |
| | `governance`, `devops` | **Kelsey Hightower** | *Automation First, Zero-Magic Reliability, Idempotency* |
| **Business** | `copywriter`, `product-manager` | **Seth Godin** | *The Purple Cow, Permission Marketing, Smallest Viable Audience* |
| | `goal-tracker`, `triage-router` | **Paul Graham** | *Do Things That Don't Scale, Ramen Profitability, Relentless Execution* |
| | `business-sales-manager` | **Aaron Ross** | *Predictable Revenue, Funnel Systems, Specialization Outbound* |
| | `business-sales-manager`, `pm` | **Patrick Campbell** | *Value-Based Pricing, Unit Economics (LTV/CAC > 3x), Churn Defense* |
| **Intelligence**| `domain-retriever`, `triage-router` | **Ben Thompson** | *Aggregation Theory, Value Chain Disruption, Moat Durability* |

> 📖 **Panduan Lengkap**: Pelajari profil mendalam, pertanyaan uji asam (*acid test*), dan aturan heuristik masing-masing tokoh di [`01-roles/EXPERT_PERSONAS_DNA.md`](./01-roles/EXPERT_PERSONAS_DNA.md).

---

## 4. Alur Siklus Hidup Eksekusi (High-Level)

```
[User Input]
     │
     ▼
[Triage Router] ───► [Problem Decomposer] ───► [Goal Tracker: Initialize/Update]
                                                        │
                                                        ▼
                                               [Builder Swarm Execution]
                                                        │
                                                        ▼
                                              [Domain Reviewer Swarm]
                                                        │
                                          ┌─────────────┴─────────────┐
                                     (rework)                    (approved)
                                          │                           │
                                          ▼                           ▼
                               [Builder Fixes Issue]          [Tech Critic Agent]
                                          ▲                           │
                                          │                     (rework / pass)
                                          └───────────────────────────┤
                                                                      ▼
                                                         [Policy & Schema Enforcer]
                                                                      │
                                                                 (approved)
                                                                      │
                                                                      ▼
                                                           [Synthesis & Voice]
                                                                      │
                                                                      ▼
                                                                [User Output]
```

---

## 5. Cara Menggunakan Framework Ini

1. **Inisialisasi Percakapan**: Jalankan `01-roles/orchestration/triage-router.md` untuk mengklasifikasikan intensi awal pengguna.
2. **Setup State**: Buat instance `02-session-state/schema.yaml` untuk sesi tersebut. Gunakan `01-roles/orchestration/goal-tracker.md` untuk memperbarui status setiap putaran.
3. **Eksekusi Builder**: Panggil builder yang relevan berdasarkan subtask graph.
4. **Verifikasi Reviewer**: Masukkan output builder ke reviewer terkait (mis. `qa-engineer` dan `security-engineer`). Reviewer wajib menghasilkan verdict `approved`, `rework`, atau `blocked-escalate`.
5. **Uji Kritis**: Lewatkan ke `tech-critic` untuk mendeteksi fallacy atau asumsi yang rapuh.
6. **Validasi Akhir**: Pastikan semua parameter aman dan berformat benar dengan `policy-schema-enforcer` sebelum dirangkum oleh `synthesis-voice`.

---

## 6. Ekosistem Skill Workspace (`.agents/skills/`)

Setiap peran dalam framework ini diperkuat secara langsung oleh skill terdaftar di dalam `.agents/skills/` yang menyediakan kapabilitas, panduan mendalam, dan integrasi alat:

| Skill | Path Direktori | Peran yang Diberdayakan | Kapabilitas & Panduan Pendukung |
|---|---|---|---|
| **backend** | [`skills/backend/`](./skills/backend) | `backend-engineer` | API design guide, clean architecture, auth patterns, database patterns, guard clauses, dan result pattern (10 referensi teknis). |
| **frontend** | [`skills/frontend/`](./skills/frontend) | `frontend-engineer`, `ui-ux-designer` | UI/UX Pro Max Intelligence, accessibility WCAG AA, component patterns, performance, enterprise Vue & Nuxt 3 (12 referensi). |
| **pm** | [`skills/pm/`](./skills/pm) | `product-manager`, `problem-decomposer` | PRD templates, roadmap planning, feature breakdown, dan metodologi software agile/scrum (9 referensi). |
| **qa** | [`skills/qa/`](./skills/qa) | `qa-engineer`, `security-engineer` | Comprehensive testing strategies, security checklists, code review patterns, dan audit boundary (7 referensi). |
| **motion** | [`skills/motion/`](./skills/motion) | `frontend-engineer`, `ui-ux-designer` | Animasi 120fps GPU-accelerated (Motion/Framer Motion v12+), gestures, spring physics, layout transitions (`layoutId`), dan reduced-motion a11y (3 referensi). |
| **shadcn-ui** | [`skills/shadcn-ui/`](./skills/shadcn-ui) | `frontend-engineer`, `ui-ux-designer`, `qa-engineer` | Arsitektur komponen open-code berbasis Radix UI headless, CVA variant system, token CSS HSL, dan WAI-ARIA compliance (2 referensi). |
| **magic-ui** | [`skills/magic-ui/`](./skills/magic-ui) | `frontend-engineer`, `ui-ux-designer` | 50+ komponen animasi kelas dunia untuk Design Engineer: Bento Grid, Marquee, Border Beam, Particles, Shimmer Button via Shadcn Registry (2 referensi). |
| **cast** | [`skills/cast/`](./skills/cast) | `ui-ux-designer`, `frontend-engineer` | The Illusionist: creative coding untuk motion, mikro-interaksi, gestur visual, dan wow-factor (Genjutsu). |
| **design-dna** | [`skills/design-dna/`](./skills/design-dna) | `ui-ux-designer`, `frontend-engineer` | Ekstraksi profil desain 3D: Design Tokens JSON, qualitative feel, visual effects dari gambar/URL referensi. |
| **motion-design-skill** | [`skills/motion-design-skill/`](./skills/motion-design-skill) | `ui-ux-designer`, `frontend-engineer` | Standarisasi kurva easing, koreografi transisi, layer gerak, dan prinsip animasi UI emosional (LottieFiles). |
| **paint** | [`skills/paint/`](./skills/paint) | `ui-ux-designer`, `frontend-engineer` | The Master Painter: visual universe bootstrap, design system creation, dan audit desain anti-AI-slop. |
| **playwright-skill** | [`skills/playwright-skill/`](./skills/playwright-skill) | `qa-engineer`, `frontend-engineer` | Penulisan kode otomatisasi Playwright mandiri on-the-fly, deteksi dev-server otomatis, runner `run.js`, dan API reference progresif. |
| **threejs-animation** | [`skills/threejs-animation/`](./skills/threejs-animation) | `frontend-engineer`, `ui-ux-designer` | Animasi 3D keyframe, skeletal animation/rigging, morph targets, dan animation mixing. |
| **threejs-fundamentals** | [`skills/threejs-fundamentals/`](./skills/threejs-fundamentals) | `frontend-engineer`, `ui-ux-designer` | Pengaturan scene dasar, perspektif & orthographic cameras, WebGLRenderer, Object3D hierarchy. |
| **threejs-geometry** | [`skills/threejs-geometry/`](./skills/threejs-geometry) | `frontend-engineer`, `ui-ux-designer` | Pembuatan bentuk 3D bawaan, BufferGeometry kustom, manipulasi vertices, dan instanced meshes. |
| **threejs-interaction** | [`skills/threejs-interaction/`](./skills/threejs-interaction) | `frontend-engineer`, `ui-ux-designer` | Raycasting 3D, OrbitControls, drag controls, seleksi objek, dan input kursor/sentuh. |
| **threejs-lighting** | [`skills/threejs-lighting/`](./skills/threejs-lighting) | `frontend-engineer`, `ui-ux-designer` | Pencahayaan realistis: Directional, Point, Spot, Ambient, shadow mapping, dan environment HDRI lighting. |
| **threejs-loaders** | [`skills/threejs-loaders/`](./skills/threejs-loaders) | `frontend-engineer`, `ui-ux-designer` | Pemuatan aset 3D GLTF/GLB, OBJ/FBX, texture loading asinkron, Draco compression, dan asset caching. |
| **threejs-materials** | [`skills/threejs-materials/`](./skills/threejs-materials) | `frontend-engineer`, `ui-ux-designer` | Material PBR (MeshStandardMaterial, MeshPhysicalMaterial), roughness/metalness maps, dan shader materials. |
| **threejs-postprocessing** | [`skills/threejs-postprocessing/`](./skills/threejs-postprocessing) | `frontend-engineer`, `ui-ux-designer` | Efek pasca-proses EffectComposer: UnrealBloom, depth of field (DOF), glitch, vignette, dan film grain. |
| **threejs-shaders** | [`skills/threejs-shaders/`](./skills/threejs-shaders) | `frontend-engineer`, `ui-ux-designer` | Pemrograman GLSL ShaderMaterial kustom, uniform timing, per-vertex deformation, dan procedural noise. |
| **threejs-textures** | [`skills/threejs-textures/`](./skills/threejs-textures) | `frontend-engineer`, `ui-ux-designer` | Manajemen tekstur (albedo, normal, bump, roughness, displacement), UV mapping, dan render targets. |
| **ml-vision** | [`skills/ml-vision/`](./skills/ml-vision) | `ml-vision-engineer` | Machine Learning, Deep Learning & Vision: clustering (K-Means, DBSCAN), classification (LightGBM, XGBoost), PyTorch, YOLOv8/v11, ONNX INT8, FastAPI & WebGPU in-browser (4 referensi). |
| **_jutsu** | [`skills/_jutsu/`](./skills/_jutsu) | `frontend-engineer`, `ui-ux-designer` | 15 sub-keahlian kreatif modular (canvas-generative, compose-motion, swiftui-motion, threejs-r3f, gsap, css-native). |
| **playwright** | [`skills/playwright/`](./skills/playwright) | `qa-engineer`, `user-test-professional` | Otomatisasi browser interaktif via Playwright MCP (24 tool), AXTree snapshots, visual screenshots, console & network monitoring. |
| **graphify** | [`skills/graphify/`](./skills/graphify) | `domain-retriever`, `triage-router` | Ekstraksi persistent knowledge graph, penelusuran arsitektur codebase, deteksi god nodes, dan community analysis. |
| **goal-tracker** | [`skills/goal-tracker/`](./skills/goal-tracker) | `goal-tracker` | Single Source of Truth, OODA session state management, constraint locking, dan deteksi konflik/scope-creep. |
| **tech-critic** | [`skills/tech-critic/`](./skills/tech-critic) | `tech-critic` | Prinsip steelman, checklist deteksi logical fallacy & bias, audit halusinasi faktual/versi, dan gerbang Dual-Approval Case-Bank. |

---

## 7. Protokol Mandiri Lintas-Perangkat (Cross-Device Onboarding Protocol)

Saat codebase ini dipindahkan atau di-clone ke perangkat baru (laptop lain, server CI/CD, Linux, atau macOS), agen-agen AI dalam sistem ini dapat **menginstal dan mempelajari skill secara otonom**:

1. **Self-Bootstrap Otomasi Browser, Komponen Visual & ML Engine**:
   Agen cukup menjalankan bootstrap script mandiri di perangkat baru (atau sekali via `npm run setup`):
   ```bash
   # 1. Otomasi Browser Playwright
   node skills/playwright-skill/bootstrap.js
   
   # 2. Pustaka Animasi Motion
   node skills/motion/bootstrap.js
   
   # 3. Arsitektur Komponen Enterprise shadcn/ui
   node skills/shadcn-ui/bootstrap.js
   
   # 4. Komponen Desain Magic UI & Helper cn()
   node skills/magic-ui/bootstrap.js

   # 5. Machine Learning, Deep Learning & Vision Engine
   node skills/ml-vision/bootstrap.js
   ```
   Script ini secara otomatis memeriksa runtime Node.js dan Python, menginstal dependensi lokal, mengunduh browser binaries (Chromium), memverifikasi ekspor API, dan memvalidasi CLI registry runner.
2. **Panduan Operasional Mandiri**:
   Agen dapat membaca panduan lengkap di:
   - [`skills/playwright-skill/DEVICE_BOOTSTRAP.md`](./skills/playwright-skill/DEVICE_BOOTSTRAP.md)
   - [`skills/motion/DEVICE_BOOTSTRAP.md`](./skills/motion/DEVICE_BOOTSTRAP.md)
   - [`skills/shadcn-ui/DEVICE_BOOTSTRAP.md`](./skills/shadcn-ui/DEVICE_BOOTSTRAP.md)
   - [`skills/magic-ui/DEVICE_BOOTSTRAP.md`](./skills/magic-ui/DEVICE_BOOTSTRAP.md)
   - [`skills/ml-vision/DEVICE_BOOTSTRAP.md`](./skills/ml-vision/DEVICE_BOOTSTRAP.md)
3. **Pembelajaran Progresif (*Progressive Disclosure*)**:
   Agen baru mempelajari dasar melalui `SKILL.md`, mendalami helpers/pola di folder `references/`, dan hanya membuka referensi API lengkap saat menangani kasus tingkat lanjut.

---

## 8. Manajemen State Sesi & Migrasi Antar-Chat Project (`02-session-state/`)

Untuk mencegah fenomena *context drift* dan kehilangan memori keputusan pada percakapan panjang atau saat berpindah antar-jendela chat project:

1. **Struktur State Terpadu (`session-state.yaml`)**:
   Menyimpan `active_goal`, `locked_constraints`, dan daftar `subtasks` dengan dependensi eksplisit serta riwayat perbaikan (*rework history*).
2. **Snapshot & Cross-Chat Migration**:
   Konteks tugas aktif dapat diekspor menjadi file snapshot JSON dan diimpor ke sesi percakapan chat baru atau repositori proyek turunan:
   ```bash
   # Melihat status tugas aktif dan locked constraints
   npm run session:status

   # Mengekspor snapshot sesi untuk dipindahkan ke chat session lain
   npm run session:export

   # Mengimpor snapshot ke sesi aktif
   node 02-session-state/session-manager.js import --file ./session-snapshot.json
   ```
3. **Panduan Lengkap**:
   Pelajari protokol transisi state dan siklus migrasi di [`02-session-state/cross-project-handoff.md`](./02-session-state/cross-project-handoff.md) dan [`02-session-state/state-transitions.md`](./02-session-state/state-transitions.md).

---

## 9. Basis Pengetahuan Terverifikasi & Case-Bank (`04-case-bank/`)

Case-Bank berfungsi sebagai memori organisasi jangka panjang (*long-term organizational memory*) yang menyimpan pola arsitektur terbaik (*proven patterns*) dan pantangan kesalahan masa lalu (*anti-patterns*):

1. **Dual-Approval Promotion Policy**:
   Setiap solusi baru wajib berstatus `hypothesis` dan hanya dapat dipromosikan menjadi `verified_case` setelah disetujui secara independen oleh `qa-engineer` (uji fungsional/batas) dan `tech-critic` (uji fallacy/asumsi).
2. **Pencarian Cepat Semantik & Validasi**:
   Agen dan developer dapat mencari solusi tervalidasi secara instan:
   ```bash
   # Menampilkan katalog seluruh case tervalidasi
   npm run case:list

   # Mencari case berdasarkan kata kunci / domain
   node 04-case-bank/case-bank-cli.js search redis
   node 04-case-bank/case-bank-cli.js search websocket

   # Memvalidasi integritas katalog case-bank
   npm run case:validate
   ```
3. **Katalog Kasus Terverifikasi Saat Ini (11 Verified Cases)**:
   - `case-20260903-httponly-cookie-auth`: Autentikasi aman via Cookie HttpOnly SameSite=Strict.
   - `case-20260907-cross-device-autonomous-bootstrap`: Pemasangan mandiri skill lintas OS (zero-config).
   - `case-20260907-relative-path-portability`: Portabilitas tautan relatif untuk repositori GitHub.
   - `case-20260907-redis-atomic-lock-concurrency`: Distributed lock & beacon teardown via Redis Lua script.
   - `case-20260907-resilient-websocket-dual-ecosystem`: Resiliensi socket realtime Vue 3 & Next.js.
   - `case-20260907-circuit-breaker-rework-loop`: Circuit breaker penghentian infinite rework loop (max 3x).
   - `case-20260907-anti-pattern-hardcoded-credentials`: Larangan keras secret token di source code.
   - `case-20260914-session-state-consistency-goal-tracking`: Eliminasi context drift pada chat panjang via Goal Tracker.
   - `case-20260914-single-door-triage-routing`: Single Door Policy routing semantik tanpa tagging manual.
   - `case-20260914-reviewer-independence-anti-hallucination`: Pemisahan peran Builder dan Reviewer (anti echo-chamber).
   - `case-20260914-ml-cv-edge-web-inference-pipeline`: Inferensi hibrida FastAPI backend vs in-browser ONNX WebGPU.

---

## 10. Lisensi

Proyek ini dilisensikan di bawah lisensi [MIT License](LICENSE) &copy; 2026 Ahmad Arif.

