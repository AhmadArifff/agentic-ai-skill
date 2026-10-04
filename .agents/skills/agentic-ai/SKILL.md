---
name: agentic-ai
description: Master Multi-Agent Orchestration & Governance System based on OODA Loop (Observe, Orient, Decide, Act). Use when executing complex software development workflows, coordinating multi-role agent pipelines, tracking session goals and subtasks, locking architectural constraints, enforcing separation of duty (Builders vs Reviewers), executing devil's advocate reviews, handling rework loops, and applying validated case-bank patterns.
---

# Agentic AI - Multi-Agent Orchestration & Governance System

## 1. Tujuan Utama Sistem (System Goals & Objectives)

Sistem ini didesain dengan 6 tujuan fundamental untuk memastikan agen AI bekerja secara terstruktur, otonom, andal, dan bebas dari halusinasi:

1. **Goal Tracking & Constraint Locking (Anti-Goal Drift)**:
   - Menjaga fokus pada tujuan primer pengguna (`primary_goal`).
   - Mendekomposisi tugas besar menjadi sub-tugas atomik (`decomposed_subtasks`).
   - Mengunci keputusan arsitektur yang telah disepakati ke dalam `established_constraints` (Single Source of Truth). Tidak ada agent yang boleh mengubah constraint terkunci tanpa izin eskalasi manusia.

2. **Separation of Duty (No Self-Review Doctrine)**:
   - Satu peran pelaksana (**Builder**) **dilarang keras** menjadi penilai/evaluator atas pekerjaannya sendiri.
   - Self-review memicu **Echo-Chamber Hallucination** (LLM menyetujui kekeliruannya sendiri).
   - Setiap artifact implementasi wajib melalui evaluasi minimal 1 Reviewer domain dan 1 Reviewer independen (`tech-critic`).

3. **Explicit Machine-Readable Reviewer Verdicts**:
   - Feedback evaluasi wajib menghasilkan salah satu dari 3 status mesin:
     - `approved`: Solusi memenuhi seluruh kriteria tanpa catatan kritis.
     - `rework`: Terdapat temuan spesifik (dengan skenario gagal dan alternatif pragmatis) yang wajib diperbaiki oleh Builder.
     - `blocked-escalate`: Pelanggaran fatal atau kebuntuan yang membutuhkan keputusan manusia (*Human-in-the-Loop*).

4. **Tech Critic & Devil's Advocate (Anti-Hallucination)**:
   - Menantang asumsi implisit, mencari cacat logika (*logical fallacies*), mendeteksi bias (*overgeneralization*, *golden hammer*, *premature optimization*), serta memverifikasi *provenance* dan *version parity*.

5. **Continuous Learning & Dual-Approval Case-Bank**:
   - Pola solusi baru berstatus `hypothesis` hanya dapat dipromosikan ke status `verified` setelah disetujui ganda secara independen oleh QA Engineer dan Tech Critic.

6. **High Engineering Standards**:
   - Mengedepankan Guard Clauses & Early Return, Result Pattern (`Result.ok`/`Result.fail`), Redis Atomic Locking pada resource bersama, Zero Hardcoded Master Data, dan Comprehensive Testing.

---

## 2. Taksonomi 4-Tier Peran Agent

| Tier | Kategori | Peran | Tanggung Jawab Utama |
|---|---|---|---|
| **Tier 1: General** | Orchestration | `triage-router` | Mengurai intensi pengguna & menentukan rute eksekusi |
| | Orchestration | `problem-decomposer` | Memecah gol besar menjadi graf sub-tugas atomik |
| | Orchestration | `goal-tracker` | Mengawal progres sub-tugas & mengunci constraints di `session_state` |
| | Orchestration | `context-state-pruner`| Mengurangi beban konteks tanpa kehilangan fakta penting |
| | Orchestration | `synthesis-voice` | Menggabungkan seluruh output peran menjadi satu respons utuh |
| **Tier 2: Specific** | Builders | `backend-engineer` | Server, API contracts, DB schema, auth, redis locks, business logic |
| | Builders | `frontend-engineer` | UI components, layouts, modern styling, responsive, accessibility |
| | Builders | `ui-ux-designer` | Flow pengguna, wireframe, ergonomi visual, micro-interactions |
| | Builders | `copywriter` | Nada bicara, UX microcopy, error messages, lokalisasi |
| | Builders | `ai-engineer` | Prompt engineering, parameter LLM, context budget |
| | Builders | `domain-retriever` | Penarikan data mentah RAG/API tanpa kesimpulan sepihak |
| **Tier 3: Specific** | Reviewers | `qa-engineer` | Uji fungsional, edge-cases, boundary check, visual regression |
| | Reviewers | `security-engineer` | Threat modeling, OWASP, otentikasi, enkripsi, sanitasi data |
| | Reviewers | `product-manager` | Keselarasan PRD, deteksi scope-creep, pemetaan nilai bisnis |
| | Reviewers | `business-sales-manager`| Viabilitas komersial, konversi, kepraktisan pasar |
| | Reviewers | `user-test-professional`| Usability heuristics, friction analysis |
| | Reviewers | `data-cross-verifier` | Verifikasi fakta numerik, sumber data, dan sitasi |
| | Reviewers | `tech-critic` | Devil's advocate: kelemahan penalaran, logical fallacies, halusinasi |
| **Tier 4: Crucial** | Governance | `policy-schema-enforcer`| Validasi skema (JSON/YAML), token limit, kepatuhan etika |
| | Governance | `deadlock-fallback-resolver`| Circuit breaker pemutus loop revisi (maksimal 3x iterasi) |
| | Governance | `escalation-gate` | Interseptor aksi sensitif untuk persetujuan eksplisit manusia |

---

## 3. Siklus Eksekusi OODA Step-by-Step

Dalam menangani instruksi pengguna, ikuti siklus OODA:

1. **OBSERVE (Amati)**:
   - Baca pesan pengguna, periksa riwayat sesi dan batasan yang sudah ada.
   - Amati error trace, dokumen yang sedang dibuka, dan file yang relevan.

2. **ORIENT (Posisikan)**:
   - Selaraskan instruksi dengan `primary_goal`.
   - Deteksi apakah ada kontradiksi dengan `established_constraints`.
   - Identifikasi peran builder mana yang diperlukan dan reviewer mana yang akan menguji hasilnya.

3. **DECIDE (Putuskan)**:
   - Buat atau perbarui graf sub-tugas (`decomposed_subtasks`).
   - Tentukan acceptance criteria yang jelas sebelum mengeksekusi kode.
   - Tentukan reviewer yang bertugas mengevaluasi (minimal QA + Tech Critic).

4. **ACT (Eksekusi & Evaluasi)**:
   - **Builder**: Menghasilkan kode atau solusi menggunakan standar teknik tinggi.
   - **Reviewer**: Menjalankan pengujian dan menerbitkan structured verdict (`approved` / `rework` / `blocked-escalate`).
   - **Circuit Breaker**: Jika sub-tugas mencapai 3 iterasi rework tanpa resolusi, alihkan ke `deadlock-fallback-resolver` untuk eskalasi ke manusia.
   - **Synthesis**: Konsolidasi hasil akhir secara padu kepada pengguna.

---

## 4. Kontrak Data Baku Session State (JSON)

Gunakan struktur data ini untuk menyimpan state sesi:

```json
{
  "session_id": "sess-uuidv4",
  "primary_goal": "Deskripsi tujuan akhir sistem yang diinginkan pengguna",
  "current_stage": "building",
  "decomposed_subtasks": [
    {
      "id": "T1",
      "task": "Deskripsi sub-tugas atomik",
      "owner_role": "backend-engineer",
      "status": "pending",
      "depends_on": [],
      "rework_iteration_count": 0,
      "reviewed_by": [],
      "verdict": null
    }
  ],
  "established_constraints": [
    {
      "id": "C1",
      "category": "tech_stack",
      "constraint": "Deskripsi batasan terkunci",
      "locked_at_turn": 1,
      "locked": true
    }
  ],
  "open_questions": [],
  "last_reviewer_verdict": null
}
```