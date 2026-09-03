# Multi-Agent Orchestration & Governance System

Sistem arsitektur multi-agent terdistribusi berbasis siklus **OODA (Observe, Orient, Decide, Act)** dengan pemisahan tugas tegas (*Separation of Duty*) antara pelaksana (**Builder**) dan penguji (**Reviewer**), dilengkapi dengan mekanisme pelacakan tujuan berkelanjutan (**Session State & Goal Tracker**), tata kelola kritis (**Governance**), dan memori jangka panjang tervalidasi (**Case-Bank**).

---

## ⚡ Quick Start di Perangkat Baru (One-Command Autonomous Setup)

Saat melakukan clone repositori ini ke komputer baru, server, container, atau CI/CD (Windows, macOS, Linux):
```bash
# 1. Clone repositori
git clone https://github.com/AhmadArifff/agentic-ai.git
cd agentic-ai

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
| **backend** | [`.agents/skills/backend/`](file:///c:/Users/ASUS/Documents/Web%20Dev/improving/agentic%20AI/.agents/skills/backend) | `backend-engineer` | API design guide, clean architecture, auth patterns, database patterns, guard clauses, dan result pattern (10 referensi teknis). |
| **frontend** | [`.agents/skills/frontend/`](file:///c:/Users/ASUS/Documents/Web%20Dev/improving/agentic%20AI/.agents/skills/frontend) | `frontend-engineer`, `ui-ux-designer` | UI/UX Pro Max Intelligence, accessibility WCAG AA, component patterns, performance optimization, dan styling modern (10 referensi). |
| **pm** | [`.agents/skills/pm/`](file:///c:/Users/ASUS/Documents/Web%20Dev/improving/agentic%20AI/.agents/skills/pm) | `product-manager`, `problem-decomposer` | PRD templates, roadmap planning, feature breakdown, dan metodologi software agile/scrum (9 referensi). |
| **qa** | [`.agents/skills/qa/`](file:///c:/Users/ASUS/Documents/Web%20Dev/improving/agentic%20AI/.agents/skills/qa) | `qa-engineer`, `security-engineer` | Comprehensive testing strategies, security checklists, code review patterns, dan audit boundary (7 referensi). |
| **motion** | [`.agents/skills/motion/`](file:///c:/Users/ASUS/Documents/Web%20Dev/improving/agentic%20AI/.agents/skills/motion) | `frontend-engineer`, `ui-ux-designer` | Animasi 120fps GPU-accelerated (Motion/Framer Motion v12+), gestures, spring physics, layout transitions (`layoutId`), dan reduced-motion a11y (3 referensi). |
| **shadcn-ui** | [`.agents/skills/shadcn-ui/`](file:///c:/Users/ASUS/Documents/Web%20Dev/improving/agentic%20AI/.agents/skills/shadcn-ui) | `frontend-engineer`, `ui-ux-designer`, `qa-engineer` | Arsitektur komponen open-code berbasis Radix UI headless, CVA variant system, token CSS HSL, dan WAI-ARIA compliance (2 referensi). |
| **magic-ui** | [`.agents/skills/magic-ui/`](file:///c:/Users/ASUS/Documents/Web%20Dev/improving/agentic%20AI/.agents/skills/magic-ui) | `frontend-engineer`, `ui-ux-designer` | 50+ komponen animasi kelas dunia untuk Design Engineer: Bento Grid, Marquee, Border Beam, Particles, Shimmer Button via Shadcn Registry (2 referensi). |
| **playwright** | [`.agents/skills/playwright/`](file:///c:/Users/ASUS/Documents/Web%20Dev/improving/agentic%20AI/.agents/skills/playwright) | `qa-engineer`, `user-test-professional` | Otomatisasi browser interaktif via Playwright MCP (24 tool), AXTree snapshots, visual screenshots, console & network monitoring. |
| **playwright-skill** | [`.agents/skills/playwright-skill/`](file:///c:/Users/ASUS/Documents/Web%20Dev/improving/agentic%20AI/.agents/skills/playwright-skill) | `qa-engineer`, `frontend-engineer` | Penulisan kode otomatisasi Playwright mandiri on-the-fly, deteksi dev-server otomatis, runner `run.js`, dan API reference progresif. |
| **graphify** | [`.agents/skills/graphify/`](file:///c:/Users/ASUS/Documents/Web%20Dev/improving/agentic%20AI/.agents/skills/graphify) | `domain-retriever`, `triage-router` | Ekstraksi persistent knowledge graph, penelusuran arsitektur codebase, deteksi god nodes, dan community analysis. |
| **goal-tracker** | [`.agents/skills/goal-tracker/`](file:///c:/Users/ASUS/Documents/Web%20Dev/improving/agentic%20AI/.agents/skills/goal-tracker) | `goal-tracker` | Single Source of Truth, OODA session state management, constraint locking, dan deteksi konflik/scope-creep. |
| **tech-critic** | [`.agents/skills/tech-critic/`](file:///c:/Users/ASUS/Documents/Web%20Dev/improving/agentic%20AI/.agents/skills/tech-critic) | `tech-critic` | Prinsip steelman, checklist deteksi logical fallacy & bias, audit halusinasi faktual/versi, dan gerbang Dual-Approval Case-Bank. |

---

## 7. Protokol Mandiri Lintas-Perangkat (Cross-Device Onboarding Protocol)

Saat codebase ini dipindahkan atau di-clone ke perangkat baru (laptop lain, server CI/CD, Linux, atau macOS), agen-agen AI dalam sistem ini dapat **menginstal dan mempelajari skill secara otonom**:

1. **Self-Bootstrap Otomasi Browser & Komponen Visual**:
   Agen cukup menjalankan bootstrap script mandiri di perangkat baru:
   ```bash
   # 1. Otomasi Browser Playwright
   node .agents/skills/playwright-skill/bootstrap.js
   
   # 2. Pustaka Animasi Motion
   node .agents/skills/motion/bootstrap.js
   
   # 3. Arsitektur Komponen Enterprise shadcn/ui
   node .agents/skills/shadcn-ui/bootstrap.js
   
   # 4. Komponen Desain Magic UI & Helper cn()
   node .agents/skills/magic-ui/bootstrap.js
   ```
   Script ini secara otomatis memeriksa runtime Node.js, menginstal dependensi lokal, mengunduh browser binaries (Chromium), memverifikasi ekspor API, dan memvalidasi CLI registry runner.
2. **Panduan Operasional Mandiri**:
   Agen dapat membaca panduan lengkap di:
   - [`.agents/skills/playwright-skill/DEVICE_BOOTSTRAP.md`](file:///c:/Users/ASUS/Documents/Web%20Dev/improving/agentic%20AI/.agents/skills/playwright-skill/DEVICE_BOOTSTRAP.md)
   - [`.agents/skills/motion/DEVICE_BOOTSTRAP.md`](file:///c:/Users/ASUS/Documents/Web%20Dev/improving/agentic%20AI/.agents/skills/motion/DEVICE_BOOTSTRAP.md)
   - [`.agents/skills/shadcn-ui/DEVICE_BOOTSTRAP.md`](file:///c:/Users/ASUS/Documents/Web%20Dev/improving/agentic%20AI/.agents/skills/shadcn-ui/DEVICE_BOOTSTRAP.md)
   - [`.agents/skills/magic-ui/DEVICE_BOOTSTRAP.md`](file:///c:/Users/ASUS/Documents/Web%20Dev/improving/agentic%20AI/.agents/skills/magic-ui/DEVICE_BOOTSTRAP.md)
3. **Pembelajaran Progresif (*Progressive Disclosure*)**:
   Agen baru mempelajari dasar melalui `SKILL.md`, mendalami helpers/pola di folder `references/`, dan hanya membuka referensi API lengkap saat menangani kasus tingkat lanjut.




