# Panduan Instalasi Mandiri & Pembelajaran Otonom (Cross-Device Bootstrap Guide)
## Khusus Agen AI: Playwright Programmatic Automation

Dokumen ini adalah instruksi operasional agar **Agent AI dapat menginstal, mengonfigurasi, dan mempelajari skill ini secara mandiri** saat berpindah ke perangkat lain (Windows, macOS, Linux, atau Container CI/CD) tanpa memerlukan intervensi manual dari pengguna.

---

## 1. Protokol Deteksi Lingkungan Baru (Environment Health Check)

Ketika agent pertama kali dipanggil di perangkat baru untuk menjalankan pengujian web atau otomasi peramban, agent **WAJIB** menjalankan urutan pemeriksaan berikut:

### Langkah A: Periksa Keberadaan Node.js & Versi
Jalankan di shell:
```bash
node -v
```
- **Syarat**: Node.js versi `>= 20.0.0`.
- Jika Node.js belum terpasang atau versinya usang, laporkan kepada pengguna bahwa Node.js 20+ diperlukan.

### Langkah B: Periksa Apakah Dependensi Skill Sudah Terpasang
Periksa apakah folder `.agents/skills/playwright-skill/node_modules/playwright` sudah ada:
- **Windows (PowerShell)**: `Test-Path .agents\skills\playwright-skill\node_modules\playwright`
- **Linux/macOS (Bash)**: `test -d .agents/skills/playwright-skill/node_modules/playwright && echo true`

---

## 2. Prosedur Instalasi Mandiri Otomatis (Self-Installation Protocol)

Jika dependensi belum terpasang di perangkat baru, agent harus memilih salah satu dari metode di bawah ini:

### Opsi 1: Menjalankan Autonomous Bootstrap Script (Paling Direkomendasikan)
Jalankan script mandiri lintas-platform yang telah disediakan:
```bash
node .agents/skills/playwright-skill/bootstrap.js
```
Script ini akan:
1. Memvalidasi runtime Node.js >= 20.
2. Menjalankan `npm install` di dalam direktori skill.
3. Mengunduh binary peramban Chromium (`npx playwright install chromium`).
4. Menjalankan uji sanity headless untuk memastikan browser dapat di-launch.
5. Mengembalikan output JSON terstruktur `{ success: true, ... }`.

### Opsi 2: Menggunakan Skills CLI (Vercel)
Jika ingin menginstal ulang dari repositori sumber di perangkat baru:
```bash
npx -y skills add lackeyjb/playwright-skill --skill playwright-skill --yes
cd .agents/skills/playwright-skill && npm run setup
```

### Opsi 3: Penanganan Khusus Sistem Linux / Docker Container
Pada distro Linux (Ubuntu/Debian) tanpa display server:
```bash
cd .agents/skills/playwright-skill
npm install
npx playwright install --with-deps chromium
```
*Catatan Linux headless*: Jika environment tidak memiliki layar grafis (X11/Wayland), selalu set `headless: true` pada script Playwright.

---

## 3. Protokol Pembelajaran Mandiri Agen (Self-Learning Protocol)

Setelah instalasi selesai, agen baru dapat mempelajari seluruh kapabilitas skill ini secara progresif (*progressive disclosure*):

```
[Level 1: Konsep Dasar] ──► Baca .agents/skills/playwright-skill/SKILL.md
                                 │
                                 ▼
[Level 2: Contoh Helpers] ──► Pelajari .agents/skills/playwright-skill/lib/helpers.js
                                 │
                                 ▼
[Level 3: API Lengkap]   ──► Buka .agents/skills/playwright-skill/API_REFERENCE.md
                                (untuk selector kompleks, network intercept, auth state)
```

### Prinsip Eksekusi yang Wajib Diingat Agent:
1. **Gunakan `run.js` Universal Executor**:
   Jangan jalankan script Playwright dengan `node test.js` biasa, karena modul `@playwright/test` atau `playwright` berada di dalam direktori skill. Selalu gunakan:
   ```bash
   node .agents/skills/playwright-skill/run.js <path-ke-script.js>
   ```
2. **Headless Default**:
   - Jika berjalan di komputer desktop pengguna dengan layar: gunakan `headless: false` agar pengguna dapat melihat otomatisasi secara real-time.
   - Jika pengguna meminta background run atau di server: gunakan `headless: true`.
3. **Deteksi Dev Server Lokal**:
   Sebelum menjalankan pengujian terhadap localhost, jalankan helper deteksi port:
   ```bash
   node -e "require('./.agents/skills/playwright-skill/lib/helpers').detectDevServers().then(s => console.log(JSON.stringify(s)))"
   ```

---

## 4. Self-Healing & Troubleshooting (Pemulihan Mandiri)

| Gejala Masalah | Penyebab | Tindakan Mandiri Agent |
|---|---|---|
| `Cannot find module 'playwright'` | `node_modules` belum ada di folder skill | Jalankan `npm --prefix .agents/skills/playwright-skill install` |
| `Executable doesn't exist at C:\Users\...` | Binary browser Chromium belum diunduh | Jalankan `npx --prefix .agents/skills/playwright-skill playwright install chromium` |
| `Missing system dependencies` (Linux) | Pustaka C++ Linux belum lengkap | Jalankan `npx playwright install-deps chromium` (butuh akses root/sudo) |
| `Browser failed to open (Display not found)` | Sistem headless / SSH tanpa GUI | Ubah opsi launch menjadi `{ headless: true }` |

---

## 5. Checklist Verifikasi Mandiri (Self-Verification DoD)

Sebelum agent menyatakan siap mengotomasi browser di perangkat baru:
- [ ] `node .agents/skills/playwright-skill/bootstrap.js` menghasilkan status `success: true`.
- [ ] Agent telah membaca `SKILL.md` untuk memahami format pembuatan script sementara (`tmpdir`).
- [ ] Uji navigasi sederhana ke satu URL berhasil mengambil screenshot tanpa exception.
