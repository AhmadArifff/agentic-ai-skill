# Workflow: New Feature Lifecycle

> **Standard Operating Procedure**: Alur standar pengembangan fitur dari PRD hingga lolos verifikasi produksi.

---

## Alur Pengembangan Terstruktur:

```mermaid
sequenceDiagram
    autonumber
    actor User as Pengguna / PM
    participant Decomposer as problem-decomposer
    participant Tracker as goal-tracker
    participant Builder as Builder Engineer
    participant QA as qa-engineer
    participant Critic as tech-critic

    User->>Decomposer: Instruksi Fitur Baru
    Decomposer->>Tracker: Update sub-tugas di session-state.json
    Tracker->>Builder: Hand-off tugas ke Builder
    Builder->>Builder: Implementasi Data Model & Logic
    Builder->>Builder: Implementasi UI & State
    Builder->>QA: Permintaan Verifikasi (No Self-Review)
    QA->>QA: Functional, Boundary & Edge Cases Test
    QA->>Critic: Verifikasi Kepatuhan Arsitektur
    Critic->>Tracker: Verdict Approved & Update State
    Tracker->>User: Laporan Penyelesaian Fitur
```

---

## Langkah-demi-Langkah:

1. **Langkah 1: Klarifikasi & Dekomposisi Tugas**:
   - `problem-decomposer` memecah kebutuhan menjadi sub-tugas independen.
   - `goal-tracker` mendaftarkan sub-tugas ke `session-state.json`.
2. **Langkah 2: Definisi Kontrak & Skema Data**:
   - Definisikan tipe data atau skema sebelum menulis kode logika.
3. **Langkah 3: Implementasi Logika Bisnis (Backend / Services)**:
   - Terapkan guard clauses dan result pattern untuk menjaga stabilitas.
4. **Langkah 4: Integrasi Antarmuka (UI Components)**:
   - Hubungkan komponen UI dengan state dan service.
   - Pastikan micro-interactions halus dan layout responsif.
5. **Langkah 5: Pengujian & Review Independen (QA Gate)**:
   - Jalankan smoke test dan periksa error di console browser/terminal.
   - `qa-engineer` dan `tech-critic` memberikan vonis kelolosan.
6. **Langkah 6: Penyelesaian & Pemutakhiran State**:
   - `goal-tracker` menandai sub-tugas sebagai `done` di `session-state.json`.
