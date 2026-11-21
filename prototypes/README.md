# Katalog Prototipe & Pembuktian Konsep Keahlian (Skill Prototypes)

Direktori ini berisi prototipe nyata (*runnable prototypes*) dan artefak mandiri (*standalone artifacts*) dari katalog keahlian Agentic AI untuk digunakan sebagai referensi implementasi langsung di proyek spoke.

---

## Daftar Prototipe Tersedia

### 1. `archify` - Diagram Interaktif Mandiri & One-Page Explainer
- **Berkas Prototipe**: [`prototypes/archify/driver-withdrawal-sequence.html`](./archify/driver-withdrawal-sequence.html)
- **Spesifikasi JSON**: [`prototypes/archify/driver-withdrawal-sequence.json`](./archify/driver-withdrawal-sequence.json)
- **Studi Kasus Terkait**: [`04-case-bank/cases/case-20261121-archify-interactive-architecture-explainer.yaml`](../04-case-bank/cases/case-20261121-archify-interactive-architecture-explainer.yaml)
- **Deskripsi**: Diagram sekuensial interaktif mandiri (*offline standalone HTML*) yang memodelkan penarikan insentif supir dengan Redis Atomic Mutex Lock, transaksi InnoDB `SELECT ... FOR UPDATE`, dan panggilan gateway bank BCA/Mandiri.
- **Fitur Interaktif**:
  - Penelusuran alur pesan dinamis (*animated trace*).
  - Zoom & Pan kanvas langsung di browser.
  - Kartu panduan arsitektur (*Financial Ledger Guard* & *Idempotency*).
  - Mode tema terang & gelap (*light & dark mode toggle*).
  - Ekspor gambar PNG/SVG/WebM langsung dari browser.

### 2. `stack-diagram` - Diagram Topologi Cloud & Monorepo Tooling
- **Berkas Prototipe**: [`prototypes/stack-diagram/admin-shuttle-architecture.html`](./stack-diagram/admin-shuttle-architecture.html)
- **Draf HTML**: [`prototypes/stack-diagram/admin-shuttle-architecture.draft.html`](./stack-diagram/admin-shuttle-architecture.draft.html)
- **Studi Kasus Terkait**: [`04-case-bank/cases/case-20261121-stack-diagram-cloud-architecture.yaml`](../04-case-bank/cases/case-20261121-stack-diagram-cloud-architecture.yaml)
- **Deskripsi**: Diagram arsitektur bergaya kertas milimeter (*engineering graph paper*) dengan logo vendor resmi (Nginx, Laravel, Redis, MySQL, Docker) dan rute panah ortogonal bebas tabrakan label teks.
- **Fitur Khusus**:
  - Semua font (Geist & JetBrains Mono) dan ikon SVG di-encode langsung sebagai base64 Data URI (100% offline).
  - Pembagian layer rapi: Application Layer vs Persistence & Cache Layer.
  - Kompatibel dengan tema terang dan gelap.

---

## Cara Membuat Ulang Prototipe

Jalankan skrip pembangun otomatis:
```bash
node scripts/build-prototypes.js
```
Skrip ini akan mengompilasi spesifikasi JSON dan draf HTML menjadi artefak final siap distribusi.
