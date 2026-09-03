# Panduan Instalasi Mandiri & Pembelajaran Otonom (Cross-Device Bootstrap Guide)
## Khusus Agen AI: Magic UI Component Library

Dokumen ini adalah instruksi operasional agar **Agent AI dapat menginstal, mengonfigurasi, dan mempelajari Magic UI secara mandiri** saat berpindah ke komputer atau lingkungan baru (Windows, macOS, Linux, atau Container CI/CD) tanpa memerlukan intervensi manual dari pengguna.

---

## 1. Protokol Deteksi Lingkungan Baru (Environment Health Check)

Ketika agent pertama kali ditugaskan untuk membuat landing page premium, bento grid, atau efek visual modern di proyek baru:

### Langkah A: Deteksi Stack Proyek
Periksa `package.json` di root proyek:
- Proyek wajib berbasis **React** (Next.js, Vite React, Remix, atau Astro dengan React integration).
- Proyek wajib memiliki **Tailwind CSS** (v3 atau v4).
- Jika Tailwind CSS belum terpasang, tawarkan atau jalankan inisialisasi Tailwind terlebih dahulu.

### Langkah B: Periksa Helper `cn()`
Magic UI bergantung pada helper `cn()` untuk menggabungkan class Tailwind. Periksa keberadaan:
- `lib/utils.ts` atau `lib/utils.js` atau `src/lib/utils.ts`.
- Jika belum ada, agent wajib membuatnya (lihat §3).

---

## 2. Prosedur Instalasi Mandiri Otomatis (Self-Installation Protocol)

### Jalankan Autonomous Bootstrap Script
Agen dapat menjalankan:
```bash
node .agents/skills/magic-ui/bootstrap.js
```
Script ini akan:
1. Memvalidasi runtime Node.js `>= 18`.
2. Menyiapkan dependensi lokal (`clsx`, `tailwind-merge`, `lucide-react`, `motion`).
3. Menguji kebenaran algoritma penggabungan class `cn()`.
4. Memverifikasi aksesibilitas CLI `magicui-cli` via `npx`.
5. Mengembalikan status sukses berformat JSON `{ "success": true, ... }`.

### Instalasi Dependensi pada Proyek Host Pengguna:
Jalankan di root proyek aplikasi yang sedang dibangun:
```bash
npm install clsx tailwind-merge lucide-react motion
```

---

## 3. Scaffolding Utility Helper `lib/utils.ts`

Jika proyek belum memiliki file ini, agent wajib membuatnya di `lib/utils.ts` (atau `src/lib/utils.ts`):

```typescript
import { ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

---

## 4. Cara Menambahkan Komponen Secara Otonom

Agen dapat menambahkan komponen Magic UI ke proyek dengan dua cara:

### Cara 1: Menggunakan CLI Otomatis (Direkomendasikan)
```bash
# Tambahkan komponen bento-grid
npx magicui-cli@latest add bento-grid --yes

# Tambahkan efek border-beam
npx magicui-cli@latest add border-beam --yes

# Tambahkan marquee
npx magicui-cli@latest add marquee --yes
```

### Cara 2: Manual Atomic Copy (Jika CLI Terkendala Jaringan / Offline)
Jika CLI tidak memiliki akses internet atau mengalami rate-limit, agen dapat menyusun file komponen langsung di `components/magicui/[name].tsx` menggunakan referensi kode yang tersimpan di `.agents/skills/magic-ui/references/component-catalog.md`.

---

## 5. Konfigurasi Tailwind CSS (Keyframes & Animations)

Beberapa komponen Magic UI (seperti `marquee`, `border-beam`, `shimmer-button`, `ripple`, `meteors`) membutuhkan konfigurasi keyframe khusus di `tailwind.config.js`:

```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  theme: {
    extend: {
      animation: {
        marquee: "marquee var(--duration) linear infinite",
        "marquee-vertical": "marquee-vertical var(--duration) linear infinite",
        "border-beam": "border-beam calc(var(--duration)*1s) infinite linear",
        shimmer: "shimmer 2s linear infinite",
        ripple: "ripple var(--duration,2s) ease calc(var(--i, 0)*.2s) infinite",
        meteor: "meteor 5s linear infinite",
      },
      keyframes: {
        marquee: {
          from: { transform: "translateX(0)" },
          to: { transform: "translateX(calc(-100% - var(--gap)))" },
        },
        "marquee-vertical": {
          from: { transform: "translateY(0)" },
          to: { transform: "translateY(calc(-100% - var(--gap)))" },
        },
        "border-beam": {
          "100%": { "offset-distance": "100%" },
        },
        shimmer: {
          from: { backgroundPosition: "0 0" },
          to: { backgroundPosition: "-200% 0" },
        },
        ripple: {
          "0%, 100%": { transform: "translate(-50%, -50%) scale(1)" },
          "50%": { transform: "translate(-50%, -50%) scale(0.9)" },
        },
        meteor: {
          "0%": { transform: "rotate(215deg) translateX(0)", opacity: "1" },
          "70%": { opacity: "1" },
          "100%": {
            transform: "rotate(215deg) translateX(-500px)",
            opacity: "0",
          },
        },
      },
    },
  },
};
```

---

## 6. Protokol Pembelajaran Mandiri Agen (Self-Learning Protocol)

Agen yang ingin memperluas pemahaman tentang Magic UI harus mengikuti alur berikut:
1. **Pahami Katalog Komponen**: Buka `.agents/skills/magic-ui/references/component-catalog.md` untuk melihat daftar properti (*props*) tiap komponen.
2. **Kombinasi Pola Landing Page**: Buka `.agents/skills/magic-ui/references/bento-and-landing-patterns.md` untuk melihat arsitektur perpaduan Bento Grid, Particles, dan Shimmer Button.
3. **Dokumentasi Resmi**: Buka `https://magicui.design/docs` untuk memeriksa pembaruan komponen terbaru.

---

## 7. Self-Healing & Troubleshooting (Pemulihan Mandiri)

| Gejala Masalah | Penyebab | Tindakan Mandiri Agent |
|---|---|---|
| Animasi Marquee / Border Beam diam tidak bergerak | Keyframes CSS belum ditambahkan ke `tailwind.config` | Salin keyframes dari panduan ini ke file konfigurasi Tailwind proyek. |
| `Cannot find module '@/lib/utils'` | Alias path `@/` belum terkonfigurasi di `tsconfig.json` | Sesuaikan path import menjadi relative path `../lib/utils` atau tambahkan `"@/*": ["./*"]` di tsconfig. |
| `Hydration failed` pada Next.js | Efek acak (seperti posisi meteor atau partikel) berbeda antara server dan client | Tambahkan `"use client";` dan gunakan wrapper `useEffect` atau `mounted` state sebelum render komponen dinamis. |
| Konflik class Tailwind | Class bawaan menimpa class custom | Selalu bungkus class elemen dengan `cn(defaultClass, customClass)`. |

---

## 8. Checklist Verifikasi Mandiri (Self-Verification DoD)

Sebelum agen menyatakan komponen Magic UI siap di-review:
- [ ] `node .agents/skills/magic-ui/bootstrap.js` berhasil dieksekusi.
- [ ] Helper `cn()` tersedia dan berfungsi.
- [ ] Animasi berjalan mulus di browser tanpa error console CSS.
- [ ] Komponen responsif di ukuran layar mobile dan desktop.
- [ ] Tidak ada error SSR / hydration mismatch pada Next.js.
