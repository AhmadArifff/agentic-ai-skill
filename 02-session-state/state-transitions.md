# Spesifikasi Transisi State & Siklus Hidup Sesi

Dokumen ini menjelaskan mesin status (*Finite State Machine*) dan aturan mutasi data untuk dokumen `session_state.yaml` di seluruh siklus multi-agent.

---

## 1. Siklus Hidup Sesi (Session Lifecycle)

```
[INIT] ──► triage ──► decomposition ──► building ──► reviewing ──► criticism ──► governance ──► synthesis ──► [COMPLETED]
                         ▲                 │             │             │
                         │                 ▼             │             │
                         │            (rework loop)◄─────┴─────────────┘
                         │                 │
                         │                 ▼ (rework count >= 3)
                         └────────── escalated (Human Intervention)
```

### Definisi Tahap (Stages)
1. `triage`: Menganalisis intensi pengguna, estimasi kompleksitas, dan verifikasi apakah tugas memerlukan dekomposisi.
2. `decomposition`: Memecah `primary_goal` menjadi daftar `decomposed_subtasks` dengan dependensi eksplisit.
3. `building`: Builder mengeksekusi sub-tugas yang dependensinya sudah terpenuhi (`depends_on` berstatus `done`).
4. `reviewing`: Reviewer domain spesifik (QA, Security, PM, Sales, UX, Data) menguji output builder.
5. `criticism`: `tech-critic` menguji ketahanan asumsi, blindspots, dan logical fallacies.
6. `governance`: `policy-schema-enforcer` memvalidasi skema data, batas token, dan etika.
7. `synthesis`: `synthesis-voice` menyatukan artefak menjadi respon akhir yang siap dibaca pengguna.
8. `escalated`: Sirkuit diputus karena kebuntuan atau aksi destruktif; menunggu intervensi manusia.
9. `completed`: Seluruh sub-tugas berstatus `done` dan disahkan.

---

## 2. Siklus Hidup Sub-Tugas (Subtask State Machine)

Setiap sub-tugas dalam array `decomposed_subtasks` memiliki siklus hidup status tersendiri:

```
  [pending]
     │ (semua dependensi berstatus 'done')
     ▼
[in_progress] ◄────────────────────────────────────────┐
     │                                                 │
     ▼ (builder selesai menghasilkan artifact)         │ (verdict == 'rework' & count < 3)
[under_review]                                         │
     │                                                 │
     ├─────────────────────────────────────────────────┤
     │ (semua reviewer + critic memberi 'approved')    │
     ▼                                                 │
  [done]                                               │
     │ (jika count >= 3 atau fatal blocker)            │
     ▼                                                 │
 [blocked] ────────────────────────────────────────────┘
     │
     ▼
[escalated]
```

### Kondisi Transisi:
- **`pending` -> `in_progress`**: Terjadi ketika seluruh sub-tugas dalam `depends_on` telah berstatus `done`.
- **`in_progress` -> `done`**: HANYA TERJADI JIKA:
  1. Seluruh `required_reviewers` memberikan verdict `approved`.
  2. `tech-critic` memberikan verdict `approved`.
  3. Tidak ada komentar `rework` yang belum diselesaikan.
- **`in_progress` -> `rework` (looping)**:
  - Nilai `rework_iteration_count` ditambah 1 (+1).
  - Status tetap `in_progress`.
  - Catatan revisi dimasukkan ke `last_reviewer_verdict`.
- **`in_progress` -> `blocked`**:
  - Terjadi jika `rework_iteration_count >= 3`.
  - Memicu aktivasi `deadlock-fallback-resolver` dan `escalation-gate`.

---

## 3. Aturan Penguncian Constraint (Constraint Locking Protocol)

Array `established_constraints` adalah memori terikat (*immutable memory*) yang menjamin konsistensi jangka panjang:

### Aturan Invarian:
1. **Append-Only**: Item baru hanya boleh ditambahkan, tidak boleh ditimpa (*overwrite*) secara sepihak.
2. **Kategori Wajib**: Setiap batasan harus memiliki kategori (`tech_stack`, `database`, `security`, `ui_styling`, `business_rule`).
3. **Pemberi Kunci (`locked_by_task`)**: Setiap constraint harus mencantumkan `task_id` yang melahirkannya sebagai jejak akuntabilitas.
4. **Proteksi Anti-Ubah**:
   - Jika `frontend-engineer` ingin menggunakan CSS framework lain padahal constraint `const-002` menyatakan "Vanilla CSS", `goal-tracker` wajib menolak eksekusi dan mengembalikan peringatan pelanggaran constraint.
   - Perubahan constraint **HANYA BISA DILAKUKAN** jika pengguna secara eksplisit meminta perubahan tersebut di giliran chat baru.

---

## 4. Protokol Pemangkasan Konteks (Pruning Audit Trail)

Ketika context window mencapai batas kritis (misal >16,000 token):
1. `context-state-pruner` dipanggil oleh orkestrator.
2. Item yang dibuang dicatat ke `pruned_log` dengan format:
   ```yaml
   pruned_at: "2026-09-03T12:00:00Z"
   item_pruned: "Traceback error migrasi 120 baris"
   reason: "Migrasi sudah sukses dijalankan pada task-001"
   tokens_saved_estimate: 850
   ```
3. Dokumen `session_state.yaml` selalu dipertahankan utuh karena skemanya sangat ringkas dan efisien secara token.
