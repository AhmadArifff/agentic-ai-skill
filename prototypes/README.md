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

### 3. `motlab` & `motlab-assets` - Prototipe Mini Studio Video Berbasis Kode & Kit Aset Visual
- **Direktori Proyek**: [`prototypes/motlab/agentic-ai-intro/`](./motlab/agentic-ai-intro/)
- **Konfigurasi Video**: [`prototypes/motlab/agentic-ai-intro/project.json`](./motlab/agentic-ai-intro/project.json) (9.0 detik, 3 scene @ 30 fps, 1920x1080)
- **Scene `<canvas>`**:
  - [`scenes/01-hook.html`](./motlab/agentic-ai-intro/scenes/01-hook.html) (emblem OODA landing, judul masked rise, transisi *shape carryover* ink core disc)
  - [`scenes/02-ooda-flow.html`](./motlab/agentic-ai-intro/scenes/02-ooda-flow.html) (Separation of Duty Builder vs Independent Reviewer + metrik riil sistem `24 / 48 / 35` + transisi *shape carryover* kartu emerald)
  - [`scenes/03-verified-end.html`](./motlab/agentic-ai-intro/scenes/03-verified-end.html) (radial reveal end card + perintah viewer terukur dinamis)
- **Mini Asset Kit (`motlab-assets`)**: [`assets/kits/agentic-brand/`](./motlab/agentic-ai-intro/assets/kits/agentic-brand/) (`kit.json`, `style.md`, `tokens.json`, `2d/emblem-ooda/source.svg`, dan `emblem-ooda@2x.png` tervalidasi `1.1% off-palette`, median `dE 0.0`)
- **Audio & Inspeksi Visual**:
  - [`audio/cues.json`](./motlab/agentic-ai-intro/audio/cues.json) & [`audio/sfx-mix.mp3`](./motlab/agentic-ai-intro/audio/sfx-mix.mp3) (12 SFX cues prosedural tersinkron `window.EVENTS`, worst offset `0.0 ms`)
  - [`preview-contact-sheet.jpg`](./motlab/agentic-ai-intro/preview-contact-sheet.jpg) (lembar verifikasi 10 stills termasuk momen di dalam transisi)
- **Studi Kasus Terkait**: [`04-case-bank/cases/case-20261123-motlab-code-as-video-pipeline.yaml`](../04-case-bank/cases/case-20261123-motlab-code-as-video-pipeline.yaml)
- **Cara Menjalankan di Web Viewer**:
  ```bash
  motlab edit prototypes/motlab/agentic-ai-intro
  ```

---

## Cara Membuat Ulang Prototipe

Jalankan skrip pembangun otomatis:
```bash
node scripts/build-prototypes.js
```
Skrip ini akan mengompilasi spesifikasi JSON dan draf HTML menjadi artefak final siap distribusi.
