# Protokol Hand-off Antar-Agent (Inter-Agent Handoff Protocol)

Dokumen ini mendefinisikan standar payload komunikasi, header pertukaran data, dan tata kelola serah terima tugas antar-peran dalam sistem orkestrasi multi-agent.

---

## 1. Prinsip Serah Terima (Hand-off Invariants)
1. **Stateless Transmission**: Payload hand-off harus memuat konteks yang cukup secara mandiri (*self-contained*) tanpa mengharuskan penerima membaca seluruh riwayat percakapan mentah.
2. **Explicit Sender & Target**: Setiap paket wajib memiliki deklarasi `from_role` dan `to_role`.
3. **Immutability of Prior Artifacts**: Penerima dilarang mengubah artefak yang telah disetujui pada tahapan sebelumnya; penerima hanya menghasilkan artefak baru atau catatan evaluasi.

---

## 2. Struktur Paket Hand-off Terstandar (Envelope Schema)

Setiap pengiriman pesan antar-agent dibungkus dalam format envelope JSON/YAML:

```yaml
handoff_envelope:
  envelope_id: "env-uuidv4"
  timestamp: "2026-09-03T12:00:00Z"
  session_id: "sess-uuidv4"
  task_id: "task-001"
  
  routing:
    from_role: "backend-engineer"
    to_role: "security-engineer"
    orchestrator_turn: 4
  
  context_headers:
    active_constraints:
      - "const-001: PostgreSQL v16"
      - "const-002: HttpOnly Secure Cookie"
    rework_iteration: 0
    is_critical_path: true
  
  payload:
    artifact_type: "code | specification | review_verdict | critique"
    content: |
      [Isi artefak atau kode yang dikirim]
    metadata:
      assumptions: []
      dependencies_used: ["pg", "argon2"]
```

---

## 3. Matriks Jalur Hand-off Resmi (Routing Matrix)

| Pengirim (`from_role`) | Penerima Sah (`to_role`) | Kondisi & Tujuan |
|---|---|---|
| `triage-router` | `problem-decomposer` | Kompleksitas Tier 3; butuh dekomposisi |
| `triage-router` | `goal-tracker` | Kompleksitas Tier 2; inisialisasi tugas |
| `problem-decomposer` | `goal-tracker` | Menyerahkan daftar subtask & dependensi |
| `goal-tracker` | Builder Swarm | Menugaskan subtask yang dependensinya sudah berstatus `done` |
| Builder (`backend/frontend/...`) | Domain Reviewer Swarm | Menyerahkan artefak untuk pengujian (QA, Security, PM, UX) |
| Domain Reviewer | `goal-tracker` | Mengirimkan verdict (`approved` / `rework` / `blocked-escalate`) |
| `goal-tracker` | `tech-critic` | Semua reviewer domain telah memberi `approved` |
| `tech-critic` | `policy-schema-enforcer` | Lolos kritik (Verdict: `approved`) |
| `tech-critic` | `goal-tracker` | Kritik gagal (Verdict: `rework`) -> kirim ulang ke Builder |
| `policy-schema-enforcer` | `synthesis-voice` | Skema, token budget, dan etika lolos |
| `deadlock-fallback-resolver`| `escalation-gate` | Terjadi 3x loop rework atau kegagalan kritis |
| `escalation-gate` | Pengguna (Human-in-the-Loop) | Meminta izin/konfirmasi aksi strategis |

---

## 4. Penanganan Kegagalan Hand-off
Jika sebuah peran menerima payload dengan `to_role` yang tidak cocok dengan identitasnya, atau jika payload tidak mematuhi skema `handoff_envelope`:
1. Jangan mengeksekusi tugas.
2. Kirimkan pesan penolakan (*rejection packet*) ke `deadlock-fallback-resolver` dengan alasan `MALFORMED_HANDOFF_PAYLOAD`.
