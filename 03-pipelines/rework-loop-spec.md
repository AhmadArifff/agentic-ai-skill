# Spesifikasi Rework Loop & Circuit Breaker

Dokumen ini mengatur tata laksana siklus evaluasi ulang (*rework loop*), pembatasan perulangan, kriteria vonis review, dan pemutusan sirkuit kegagalan.

---

## 1. Mengapa Rework Loop Krusial?
Pada arsitektur linear tradisional, agent builder seringkali menghasilkan kode atau argumen yang mengandung asumsi keliru atau bug tersembunyi. Jika output langsung diteruskan ke fase sintesis tanpa gerbang koreksi balik, LLM akan melakukan rasionalisasi palsu (*post-hoc rationalization*) dan memaksakan jawaban yang belum teruji ke pengguna — inilah akar utama **halusinasi** dan **kerentanan sistemik**.

Rework loop menjamin bahwa artefak yang bermasalah **wajib kembali ke meja kerja Builder** untuk diperbaiki sebelum diizinkan melangkah lebih jauh.

---

## 2. Tiga Vonis Reviewer Resmi

Setiap reviewer (QA, Security, PM, UX, Sales, Data, Critic) **WAJIB** mengeluarkan tepat satu dari tiga status berikut:

| Verdict | Definisi Operasional | Konsekuensi Alur |
|---|---|---|
| `approved` | Seluruh kriteria penerimaan dan standar domain terpenuhi tanpa cacat kritis. | Sub-tugas dapat melanjutkan ke tahapan verifikasi berikutnya (atau ke Tech Critic). |
| `rework` | Ditemukan kesalahan fungsional, celah keamanan, pelanggaran heuristik, atau logical fallacy yang bisa diperbaiki. | Sub-tugas dikembalikan ke Builder pemilik kode dengan instruksi perbaikan spesifik. |
| `blocked-escalate` | Terjadi kebuntuan teknis fundamental, pelanggaran hukum/etika, atau konflik prinsipil antar-spesialis. | Eksekusi otomatis dihentikan seketika dan diteruskan ke `escalation-gate`. |

---

## 3. Batas Iterasi & Circuit Breaker (Max 3x)

Untuk mencegah kebuntuan tanpa akhir (*infinite looping / token burning*), setiap sub-tugas memiliki counter: `rework_iteration_count`.

```
[Iterasi 0: Pengerjaan Awal]
             │
             ▼
    [Review Pertama] ────(rework)────► [Iterasi 1: Builder Perbaiki Cacat Lokal]
                                                  │
                                                  ▼
                                         [Review Kedua] ────(rework)────► [Iterasi 2: Builder & Reviewer Sederhanakan Solusi]
                                                                                       │
                                                                                       ▼
                                                                              [Review Ketiga] ────(rework)────► [CIRCUIT BREAKER TRIPPED]
                                                                                                                            │
                                                                                                                            ▼
                                                                                                                 [deadlock-fallback-resolver]
                                                                                                                            │
                                                                                                                            ▼
                                                                                                                    [escalation-gate]
```

### Aturan Operasional per Iterasi:
- **Iterasi 1 (Perbaikan Spesifik)**: Builder membaca `rework_instructions` dari reviewer dan memperbaiki baris kode/elemen desain terkait.
- **Iterasi 2 (Penyederhanaan Arsitektur)**: Jika masih gagal, `deadlock-fallback-resolver` menginstruksikan builder untuk memilih alternatif teknis yang lebih sederhana dan tidak agresif.
- **Iterasi 3 (Circuit Breaker Tripped)**: Jika revisi ke-3 tetap ditolak:
  1. Status subtask diubah menjadi `blocked`.
  2. Eksekusi otomatis ditangguhkan (*paused*).
  3. `escalation-gate` memanggil pengguna dengan menyajikan opsi mitigasi.

---

## 4. Peran Kritis Tech Critic dalam Rework

Bahkan jika semua Reviewer domain spesifik (QA, Security, PM) telah menyatakan `approved`, artefak masih harus melalui `tech-critic`:
- Jika `tech-critic` menemukan logical fallacy atau overconfidence bias, status `approved` dari reviewer sebelumnya **DIBATALKAN**.
- Subtask dikembalikan ke Builder dengan catatan kritik dari Tech Critic.
- Ini mencegah kolusi kelompok (*groupthink*) antar-spesialis yang terlalu fokus pada aspek mikro tanpa melihat kerapuhan sistemik makro.

---

## 5. Matriks Eskalasi Rework

| Skenario | Pihak Terlibat | Tindakan Rework |
|---|---|---|
| Bug fungsional / edge case gagal | QA -> Backend/Frontend | Builder memperbaiki normalisasi input / error handling |
| Token disimpan di LocalStorage | Security -> Frontend | Builder memindahkan token ke Cookie HttpOnly |
| Form memiliki 12 langkah rumit | User Test -> UI/UX | Desainer memangkas langkah menjadi 3 tahap ringkas |
| Mengusulkan Redis untuk 5 user | Tech Critic -> Backend | Builder membatalkan Redis, gunakan connection pool PostgreSQL |
