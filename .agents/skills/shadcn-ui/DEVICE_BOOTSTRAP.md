# Panduan Instalasi Mandiri & Pembelajaran Otonom (Cross-Device Bootstrap Guide)
## Khusus Agen AI: shadcn/ui Component Architecture

Dokumen ini adalah instruksi operasional agar **Agent AI dapat menginstal, menginisialisasi, dan mempelajari arsitektur komponen shadcn/ui secara mandiri** saat berpindah ke komputer atau lingkungan baru (Windows, macOS, Linux, atau Container CI/CD) tanpa memerlukan intervensi manual dari pengguna.

---

## 1. Protokol Deteksi Lingkungan Baru (Environment Health Check)

Ketika agent pertama kali ditugaskan untuk membangun antarmuka, form, atau design system menggunakan shadcn/ui di perangkat baru:

### Langkah A: Deteksi Framework & Bahasa
Periksa root direktori proyek pengguna:
1. **React Framework**: Pastikan proyek menggunakan Next.js, Vite React, Remix, atau Astro.
2. **TypeScript**: Periksa `tsconfig.json`. Pastikan path alias `@/*` telah terdefinisi:
   ```json
   {
     "compilerOptions": {
       "baseUrl": ".",
       "paths": {
         "@/*": ["./*"]
       }
     }
   }
   ```
   *(Jika menggunakan subfolder `src/`, sesuaikan menjadi `"@/*": ["./src/*"]`)*.
3. **Tailwind CSS**: Pastikan Tailwind CSS (v3 atau v4) sudah terpasang.

### Langkah B: Periksa Apakah Proyek Sudah Diinisialisasi
- Cek apakah berkas `components.json` sudah ada di root proyek.
- Jika **belum ada**, lakukan inisialisasi otomatis (lihat §3).

---

## 2. Prosedur Instalasi Mandiri Otomatis (Self-Installation Protocol)

### Jalankan Autonomous Bootstrap Script
Agen dapat menjalankan:
```bash
node .agents/skills/shadcn-ui/bootstrap.js
```
Script ini secara otomatis:
1. Memvalidasi runtime Node.js `>= 18`.
2. Menyiapkan dependensi lokal skill (`class-variance-authority`, `clsx`, `tailwind-merge`, `lucide-react`, `@radix-ui/react-slot`).
3. Menguji kebenaran algoritma varian `cva()`.
4. Memvalidasi CLI `shadcn@latest` via `npx`.
5. Memvalidasi kepatuhan skema `components.json`.
6. Mengembalikan status sukses berformat JSON `{ "success": true, ... }`.

---

## 3. Inisialisasi Non-Interaktif pada Proyek Pengguna

Agen AI **TIDAK BOLEH** menjalankan perintah interaktif yang menunggu input pengguna di terminal. Gunakan flag non-interaktif berikut:

### Opsi 1: CLI Default Flag (Cepat & Standar)
```bash
npx shadcn@latest init -d --yes
```

### Opsi 2: Pembuatan Berkas `components.json` Mandiri
Jika CLI meminta prompt tak terduga, agen dapat langsung menulis file `components.json` di root proyek:

```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "new-york",
  "rsc": true,
  "tsx": true,
  "tailwind": {
    "config": "tailwind.config.js",
    "css": "app/globals.css",
    "baseColor": "slate",
    "cssVariables": true,
    "prefix": ""
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils",
    "ui": "@/components/ui",
    "lib": "@/lib",
    "hooks": "@/hooks"
  }
}
```

---

## 4. Menambahkan Komponen Secara Otonom

Setelah `components.json` tersedia, agen dapat memasang komponen yang dibutuhkan secara otomatis dengan flag `--yes`:

```bash
# Komponen Form & Input Dasar:
npx shadcn@latest add button input form select textarea checkbox --yes

# Komponen Overlay & Navigasi:
npx shadcn@latest add dialog dropdown-menu sheet tabs tooltip popover --yes

# Komponen Data & Feedback:
npx shadcn@latest add table card badge avatar sonner skeleton --yes
```

> [!TIP]
> Jika komponen sudah pernah ada dan agen ingin memperbaruinya, tambahkan flag `--overwrite`.

---

## 5. Protokol Pembelajaran Mandiri Agen (Self-Learning Protocol)

Agen baru yang belum pernah menangani shadcn/ui wajib mempelajari aturan-aturan berikut secara mandiri:

### Tingkat 1: Primitif Radix UI & Aksesibilitas
- Komponen seperti `<Dialog>`, `<DropdownMenu>`, dan `<Select>` dibangun di atas Radix UI headless.
- Radix mengelola ARIA attributes, fokus keyboard (Tab, Shift+Tab, Arrow keys, Escape to close), dan portal DOM secara otomatis. Jangan merusak wrapper primitif ini dengan `onClick` manual pada tag `div`.

### Tingkat 2: Skema Form Type-Safe
- Selalu sandingkan shadcn `<Form>` dengan `zod` dan `react-hook-form`.
- Jangan gunakan validasi manual di state lokal jika form memiliki lebih dari 2 input. Pelajari polanya di `.agents/skills/shadcn-ui/references/form-and-validation-patterns.md`.

### Tingkat 3: Token Warna HSL Dinamis
- Hindari hardcode warna seperti `bg-blue-600`. Selalu gunakan class semantik: `bg-primary text-primary-foreground`, `bg-muted text-muted-foreground`, `border-border`.
- Hal ini menjamin mode gelap (*dark mode*) bekerja 100% tanpa modifikasi komponen.

---

## 6. Self-Healing & Troubleshooting (Pemulihan Mandiri)

| Gejala Masalah | Penyebab | Tindakan Mandiri Agent |
|---|---|---|
| `Cannot find module '@/lib/utils'` | Path alias `@/*` belum di-mapping di `tsconfig.json` | Tambahkan `"@/*": ["./*"]` (atau `"./src/*"`) ke `compilerOptions.paths` di `tsconfig.json`. |
| `Hydration failed` pada Dialog/Sheet | Komponen Portal Radix merender elemen ke `document.body` sebelum client mounting selesai | Pastikan komponen menggunakan direktif `"use client";` dan hanya terbuka setelah interaksi pengguna. |
| Komponen UI tidak berwarna atau transparan | CSS Variables HSL belum didefinisikan di `globals.css` | Salin variabel `:root` dan `.dark` dari `SKILL.md` ke dalam `globals.css` proyek. |
| Tombol `asChild` error TypeScript | Melewatkan multiple children ke dalam `<Button asChild>` | Tag yang menggunakan `asChild` hanya boleh membungkus **tepat satu elemen anak** (misal `<Link>`). |

---

## 7. Checklist Verifikasi Mandiri (Self-Verification DoD)

Sebelum agen meloloskan kode shadcn/ui ke Reviewer Swarm:
- [ ] `node .agents/skills/shadcn-ui/bootstrap.js` berhasil dieksekusi.
- [ ] Berkas `components.json` valid dan konsisten dengan struktur folder proyek.
- [ ] Helper `cn()` tersedia di `lib/utils.ts`.
- [ ] Komponen form terikat ke skema validasi Zod.
- [ ] Aksesibilitas keyboard terverifikasi (navigasi Tab dan penutupan modal via tombol Escape).
