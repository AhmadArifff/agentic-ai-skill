# Workflow: SOP Penambahan Skill Baru ke Master Hub (`add-new-skill`)

Prosedur wajib setiap kali pengguna meminta menambahkan skill atau tools baru dari GitHub / npm ke Master Hub `agentic AI`. Tujuannya menjaga repositori tetap ramping, bebas tumpang tindih (*Zero-Overlap*), sinkron 3-arah (`skills/`, `.agents/skills/`, `~/.gemini/config/skills/`), dan otomatis terhubung ke seluruh proyek anak (*Child Spokes*).

---

## Tahap 1: Inspeksi Aman, Audit Ukuran & Zero-Overlap (Anti-Hang, Anti-Bloat)

1. **Inspeksi Metadata Cepat (Dilarang Full Clone Buta)**:
   - Gunakan partial clone metadata-only ke folder scratch:
     ```powershell
     git clone --depth 1 --filter=blob:none --no-checkout <repo_url> "<scratch_dir>"
     git -c core.quotepath=false ls-tree -r --name-only HEAD
     ```
   - **LARANGAN MUTLAK**: Dilarang menggunakan flag `--long` (`-l`) pada `git ls-tree` terhadap `--filter=blob:none` clone karena memicu unduhan ribuan blob satu-per-satu yang menyebabkan hang. Untuk cek ukuran byte per ekstensi, gunakan GitHub Tree API (`https://api.github.com/repos/<owner>/<repo>/git/trees/main?recursive=1`) atau `npm view <pkg> dist.unpackedSize`.
   - Jika upstream meminta instalasi via npm registry (contoh: `@sloemo/diorama`), gunakan `npx --yes <pkg>` dari folder scratch agar `package.json` root tetap bersih.
2. **Audit Mode Integrasi (Ringan vs Hybrid)**:
   - Jika repo berisi aplikasi full-stack atau aset media demo besar (`> 5 MB` seperti `.mp4`, `.jpg` massal, Electron/Vite app), **tawarkan mode Hybrid** ke pengguna:
     - Paket ringan (`SKILL.md`, skrip inti, referensi, lisensi) di `skills/<nama>/`.
     - Aplikasi runnable atau arsip media lengkap di luar repo (`~/<nama>`).
3. **Audit Zero-Overlap & Lisensi**:
   - Bandingkan fungsi skill baru dengan katalog eksisting di `skills/`. Pangkas sub-skill kembar (contoh: tidak menduplikasi `hyperframes*`, `ffmpeg`, `figma`, atau `frontend-design`).
   - Pastikan lisensi dan atribusi upstream (`LICENSE`, `THIRD_PARTY_NOTICES.md`) dipertahankan apa adanya; jangan melabeli ulang koleksi non-MIT sebagai MIT.

---

## Tahap 2: Perakitan Skill & Pendaftaran 5 Titik Tata Kelola

1. **Bangun `skills/<nama>/SKILL.md` (atau `AGENTIC_ROUTING.md` jika `SKILL.md` upstream dibiarkan utuh)**:
   - Sertakan frontmatter YAML (`name`, `description` kaya kata kunci untuk trigger akurat).
   - Wajib menyertakan tabel **Zero-Overlap Routing** yang menjelaskan batas tegas terhadap skill serumpun.
   - Wajib lolos Anti-Slop Rule R-02: **0 em dash** pada seluruh prosa yang kita tulis/edit.
2. **Daftarkan Skill Baru pada 5 Titik Hub**:
   - `AGENTS.md`: tambahkan 1 baris deskripsi ringkas pada kategori yang sesuai di Bagian 4.
   - `.agents/README.md`: tambahkan 1 baris tautan di Bagian 5 (*On-Demand Skills*).
   - `01-roles/<tier>/<role>.md`: tautkan skill pada peran spesialis paling relevan (`frontend-engineer`, `multimedia-video-engineer`, `ui-ux-designer`, `ai-engineer`, `backend-engineer`, dll).
   - `scripts/scaffold-spoke.js`: masukkan nama skill ke array `adoptedSkills` pada preset proyek yang relevan di `PRESETS` (atau tambahkan preset baru jika membuka domain baru) agar otomatis ikut teradopsi saat `npm run spoke:scaffold`.
   - `scripts/sync-global-and-spoke.js`: tambahkan ringkasan singkat di item `Katalog Skill Global` jika merupakan skill pilar utama.
   - *(Angka total skill di `AGENTS.md`, `.agents/README.md`, `05-spoke-template/AGENTS.md`, `knowledge/spoke-adoption-guide.md`, `knowledge/hub-and-spoke-sync.md`, dan `~/.gemini/config/rules/agentic-ai-orchestration.md` otomatis disinkronkan oleh skrip pada Tahap 3.)*

---

## Tahap 3: Sinkronisasi 3-Arah, Smoke Test & Gerbang Validasi

1. **Sinkronisasi Global & Spoke (Otomatis Update Angka & 3-Way Copy)**:
   ```powershell
   node scripts/sync-global-and-spoke.js
   ```
   *(Gunakan `node scripts/sync-global-and-spoke.js --force-skills` bila mengubah banyak file internal pada skill yang sudah ada.)*
2. **Validasi Sistem & Integritas Preset (Wajib 100% PASS)**:
   ```powershell
   npm run test:system
   npm run case:validate
   ```
   `test-system.js` otomatis memeriksa:
   - Parity 100% antara `skills/` dan `.agents/skills/` (+ keberadaan `SKILL.md`),
   - 100% nama skill di `scripts/scaffold-spoke.js` (`adoptedSkills`) valid di `skills/`,
   - 0 drift angka skill di seluruh dokumen tata kelola utama.
3. **Smoke Test Nyata Sesuai Jenis Skill**:
   - Skrip JS/Python: `node --check` dan `python -m py_compile` (bersihkan `__pycache__`).
   - MCP Server: uji JSON-RPC stdio `initialize` + `tools/list`.
   - Web/Local App: uji start singkat + `GET /api/health` pada port sementara lalu hentikan bersih.
   - CLI: uji `<tool> --version` atau perintah pencarian dasar (misal `styles.py search`).
4. **Kebersihan Akhir**:
   - Verifikasi `0` em dash pada file `.md` baru/diedit.
   - Hapus seluruh folder clone sementara di `scratch/`.
   - Cek `git status --short` (jangan commit/push otomatis tanpa instruksi pengguna).
