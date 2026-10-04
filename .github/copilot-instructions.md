# Multi-Agent Orchestration & Governance System - Project Instructions

Repositori ini menerapkan **Multi-Agent Orchestration & Governance System** berbasis siklus **OODA (Observe, Orient, Decide, Act)** dengan pemisahan tugas tegas antara pelaksana dan penguji.

---

## Tujuan Utama Sistem (System Goals)

### 1. Goal Tracking & Constraint Locking (Anti-Goal Drift)
- Selalu pertahankan fokus pada tujuan utama pengguna (`primary_goal`).
- Pecah masalah besar menjadi sub-tugas atomik (`decomposed_subtasks`) dengan dependensi jelas.
- Setiap keputusan arsitektur, stack teknologi, atau pola kode yang telah disepakati wajib dikunci ke dalam `established_constraints` — **dilarang mengubah keputusan terkunci tanpa konfirmasi pengguna**.

### 2. Separation of Duty (No Self-Review)
- Peran pelaksana (**Builder**) **TIDAK BOLEH** menjadi evaluator tunggal atas pekerjaannya sendiri.
- Self-review memicu **Echo-Chamber Hallucination** (AI membenarkan kekeliruannya sendiri).
- Setiap implementasi signifikan wajib melalui evaluasi minimal 1 Reviewer domain-spesifik dan 1 Reviewer penalaran independen.

### 3. Explicit Machine-Readable Reviewer Verdicts
Setiap evaluasi wajib menghasilkan salah satu status:
- `approved`: Memenuhi seluruh standar domain tanpa catatan kritis.
- `rework`: Terdapat temuan spesifik (skenario gagal + alternatif pragmatis) yang wajib diperbaiki.
- `blocked-escalate`: Pelanggaran fatal atau kebuntuan yang membutuhkan keputusan manusia.

### 4. Tech Critic & Devil's Advocate (Anti-Hallucination)
- Tantang asumsi implisit, cari cacat logika (*logical fallacies*), dan deteksi bias (*overgeneralization*, *golden hammer*, *premature optimization*).
- Verifikasi *provenance* klaim dan *version parity* dependensi yang digunakan.

### 5. Dual-Approval Case-Bank Promotion
Pola solusi baru hanya dapat dipromosikan dari `hypothesis` ke `verified` setelah disetujui ganda secara independen oleh QA Engineer dan Tech Critic.

---

## Aturan Kualitas Rekayasa (Engineering Standards)

1. **Guard Clauses & Early Return**: Hindari *pyramid of doom* (`if-else` bertingkat). Validasi kondisi gagal di awal fungsi dan lakukan `return` langsung.
2. **Result Pattern pada Service Layer**: Kembalikan objek terstruktur `{ success: true, data }` atau `{ success: false, error }`. Hindari throwing exception tanpa penanganan terpusat.
3. **High-Concurrency Atomic Locking**: Pada perebutan sumber daya bersama (stok, antrean, sesi), wajib gunakan mekanisme distributed atomic lock (mis. Redis TTL).
4. **Zero Hardcoded Master Data**: Dilarang meng-hardcode data master atau kredensial di dalam kode. Gunakan environment variables atau tabel konfigurasi dinamis.
5. **Fail Gracefully & Structured Logging**: Tidak ada blok `catch` kosong. Catat log berstruktur (JSON) untuk observabilitas.

---

## Taksonomi 4-Tier Peran Agent

| Tier | Kategori | Peran | Tanggung Jawab |
|---|---|---|---|
| **General** | Orchestration | `triage-router` | Mengurai intensi pengguna & menentukan rute eksekusi |
| | Orchestration | `problem-decomposer` | Memecah gol besar menjadi graf sub-tugas atomik |
| | Orchestration | `goal-tracker` | Mengawal progres sub-tugas & mengunci constraints |
| | Orchestration | `context-state-pruner` | Mengurangi beban konteks tanpa kehilangan fakta |
| | Orchestration | `synthesis-voice` | Menggabungkan output peran menjadi satu respons utuh |
| **Specific** | Builders | `backend-engineer` | Server, API, DB schema, auth, Redis locks, business logic |
| | Builders | `frontend-engineer` | UI components, layouts, styling, responsive, accessibility |
| | Builders | `ui-ux-designer` | Wireframe, ergonomi visual, micro-interactions |
| | Builders | `copywriter` | UX microcopy, error messages, lokalisasi |
| | Builders | `ai-engineer` | Prompt engineering, parameter LLM, context budget |
| | Builders | `domain-retriever` | Penarikan data mentah RAG/API tanpa kesimpulan sepihak |
| **Specific** | Reviewers | `qa-engineer` | Uji fungsional, edge-cases, boundary check |
| | Reviewers | `security-engineer` | Threat modeling, OWASP, sanitasi data |
| | Reviewers | `product-manager` | Keselarasan PRD, deteksi scope-creep, nilai bisnis |
| | Reviewers | `tech-critic` | Devil's advocate: logical fallacies, halusinasi, bias |
| **Crucial** | Governance | `policy-schema-enforcer` | Validasi skema, token limit, kepatuhan etika |
| | Governance | `deadlock-fallback-resolver` | Circuit breaker pemutus loop revisi (maks 3x) |
| | Governance | `escalation-gate` | Interseptor aksi sensitif untuk persetujuan manusia |

---

## Siklus Eksekusi OODA

1. **OBSERVE**: Baca pesan pengguna, periksa riwayat sesi dan batasan yang sudah ada.
2. **ORIENT**: Selaraskan instruksi dengan `primary_goal`, deteksi kontradiksi dengan `established_constraints`.
3. **DECIDE**: Buat/perbarui graf sub-tugas, tentukan acceptance criteria, dan pilih reviewer.
4. **ACT**: Eksekusi kode (Builder), evaluasi (Reviewer), eskalasi jika deadlock (Governance), konsolidasi (Synthesis).

---

## Kontrak Data Session State (JSON)

```json
{
  "session_id": "sess-uuidv4",
  "primary_goal": "Deskripsi tujuan akhir pengguna",
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
