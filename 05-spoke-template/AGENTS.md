# AGENTS.md: Local Project Governance & Agentic Guidelines

> **Child Spoke Entry File**: File ini dibaca secara otomatis pada setiap sesi percakapan baru di lingkungan Antigravity, Claude Code, Codex, dan Cursor untuk proyek ini. Proyek ini mengadopsi tata kelola arsitektur dari **Master Hub** (`agentic AI`) dengan penyesuaian (*tailored customization*) untuk domain proyek ini.

---

## 1. Identitas Proyek & Single Source of Truth

- **Nama Proyek**: `{{PROJECT_NAME}}`
- **Domain & Tech Stack**: `{{TECH_STACK}}`
- **Spesifikasi Utama**: Lihat dokumen [PRD.md](../PRD.md) (atau `README.md`) di root proyek.
- **Session State Aktif**: Terkunci di [session-state.json](./session-state.json). Semua agen wajib membaca dan memperbarui status sub-tugas di file ini guna mencegah *context drift*.

---

## 2. Arsitektur multi-agen & Peran Utama

Sistem ini mewarisi siklus **OODA (Observe -> Orient -> Decide -> Act)** dan prinsip **No Self-Review** dari Master Hub:

### Peran Kunci yang Aktif di Proyek Ini:
1. **Generalist / Orchestration**:
   - `triage-router`: Gerbang utama penerima instruksi alami pengguna.
   - `goal-tracker`: Pengelola [session-state.json](./session-state.json) dan penjaga batasan terkunci (`established_constraints`).
2. **Builders (Pelaksana Teknis)**:
   - `{{PRIMARY_BUILDER_ROLE}}`: Pembangun logika domain, arsitektur, dan integrasi teknis.
   - `frontend-engineer`: Pembangun antarmuka pengguna, micro-interactions, dan visual responsif.
3. **Reviewers (Penguji Kualitas & Ketahanan)**:
   - `qa-engineer`: Boundary testing, validasi fungsional, dan automated test.
   - `tech-critic`: Devil's advocate independen, menantang asumsi, dan penjaga kualitas arsitektur.
   - `security-engineer`: Pengawal keamanan data, sanitasi input, dan proteksi kredensial.

---

## 3. Kedaulatan Aturan Lokal (*Local Rules Precedence*)

1. **Aturan Domain Proyek Ini adalah Prioritas Utama**:
   Jika terdapat aturan spesifik di [PRD.md](../PRD.md), `RULES.md`, atau `rules/` lokal, sistem **100% mematuhi aturan lokal tersebut** untuk logika bisnis, skema data, dan alur aplikasi.
2. **Guardrails Global Tetap Aktif**:
   Standar keamanan (OWASP, larangan hardcoded secrets), filter anti-slop (bebas em dash, rasio kontras WCAG AA), dan 42 skill global (`skills/`) tetap aktif mengawal kualitas pengiriman (*Mandatory Delivery Gate*).

---

## 4. Struktur Direktori Tata Kelola Lokal (`.agents/`)

- [session-state.json](./session-state.json): Memori sesi aktif, sasaran utama, dan status sub-tugas saat ini.
- `rules/`:
  - [00-core-guardrails.md](./rules/00-core-guardrails.md): Aturan mutlak keamanan dan kepatuhan sistem.
  - [01-workflow-discipline.md](./rules/01-workflow-discipline.md): Disiplin OODA loop, 7 pilar task review, dan eliminasi zombie code.
  - [10-domain-architecture.md](./rules/10-domain-architecture.md): Standar arsitektur teknis spesifik proyek.
- `workflows/`:
  - [task-review-protocol.md](./workflows/task-review-protocol.md): Evaluasi 7 pilar sebelum penulisan kode baru.
  - [new-feature-lifecycle.md](./workflows/new-feature-lifecycle.md): Siklus hidup pengembangan fitur dari PRD hingga QA.
- `knowledge/cases/`: Catatan preseden bug produksi lokal yang telah terselesaikan agar tidak terulang kembali.
