# Panduan Instalasi Mandiri & Pembelajaran Otonom (Cross-Device Bootstrap Guide)
## Khusus Agen AI: Motion (Framer Motion v12+) Animation

Dokumen ini adalah instruksi operasional agar **Agent AI dapat menginstal, mengonfigurasi, dan mempelajari skill animasi Motion secara mandiri** saat berpindah ke komputer atau lingkungan baru (Windows, macOS, Linux, atau Container CI/CD) tanpa memerlukan intervensi manual dari pengguna.

---

## 1. Protokol Deteksi Lingkungan Baru (Environment Health Check)

Ketika agent pertama kali ditugaskan untuk menambahkan animasi interaktif atau micro-interactions pada proyek di perangkat baru, lakukan pemeriksaan berikut:

### Langkah A: Deteksi Framework Target Proyek
Periksa `package.json` di root proyek:
- Jika terdapat dependensi `react` / `next`: Gunakan paket `motion` dengan import `"motion/react"`.
- Jika terdapat dependensi `vue`: Gunakan paket `motion-v`.
- Jika proyek murni HTML/JavaScript: Gunakan paket `motion` dengan import `"motion"`.

### Langkah B: Periksa Apakah Pustaka Motion Sudah Terpasang
- Cek apakah `motion` sudah ada di `package.json` proyek.
- Jika belum terpasang, instal langsung di proyek pengguna:
  ```bash
  # Untuk React / Next.js / Vanilla JS
  npm install motion
  
  # Untuk Vue 3
  npm install motion-v
  ```

---

## 2. Prosedur Instalasi Mandiri Otomatis (Self-Installation Protocol)

Untuk memastikan skill lokal di `.agents/skills/motion/` siap digunakan oleh agen:

### Jalankan Autonomous Bootstrap Script
Agen dapat menjalankan:
```bash
node .agents/skills/motion/bootstrap.js
```
Script ini akan:
1. Memvalidasi runtime Node.js `>= 18`.
2. Mengisolasi instalasi `motion` di dalam folder skill agar agen selalu memiliki akses ke API docs dan binary uji.
3. Memverifikasi ekspor fungsi `animate`.
4. Mengembalikan status sukses berformat JSON `{ "success": true, ... }`.

---

## 3. Protokol Pembelajaran Mandiri Agen (Self-Learning Protocol)

Agen baru yang belum pernah menggunakan Motion wajib mempelajari aturan-aturan berikut secara mandiri:

### Tingkat 1: Sintaks Import Resmi (Mencegah Kesalahan Usang)
> [!CAUTION]
> **DILARANG MENGGUNAKAN `framer-motion`**:
> Sejak rilis Motion v12, import dari `"framer-motion"` telah didepresiasi.
> Selalu gunakan:
> - `import { motion, AnimatePresence } from "motion/react"` (React/Next.js)
> - `import { animate, scroll, timeline } from "motion"` (Vanilla JS)
> - `import { motion } from "motion-v"` (Vue 3)

### Tingkat 2: Performa & GPU Acceleration (120fps Rules)
- **Komposisi GPU**: Hanya animasikan properti `transform` (`x`, `y`, `scale`, `rotate`) dan `opacity`.
- **Hindari Layout Reflow**: Jangan menganimasikan `width`, `height`, `top`, `left` secara manual dalam keyframes karena memicu *layout thrashing* di browser.
- **Transisi Layout Otomatis**: Jika ukuran elemen berubah dinamis, gunakan prop `layout` atau `layoutId` dari Motion — Motion akan secara otomatis menghitung transisi menggunakan teknik inverted scale FLIP (*First, Last, Invert, Play*) yang efisien.

### Tingkat 3: Aksesibilitas (WCAG & Reduced Motion)
Pengguna dengan sensitivitas vestibular dapat mengalami pusing akibat animasi yang berlebihan. Agen **WAJIB** menerapkan:
```tsx
import { useReducedMotion } from "motion/react";

const prefersReduced = useReducedMotion();
const animation = prefersReduced ? { opacity: 1 } : { opacity: 1, y: 0 };
```

---

## 4. Self-Healing & Troubleshooting (Pemulihan Mandiri)

| Gejala Error | Penyebab | Tindakan Mandiri Agent |
|---|---|---|
| `Cannot find module 'motion/react'` | Versi `framer-motion` lama terpasang atau salah ketik path import | Jalankan `npm install motion@latest` dan ubah import ke `"motion/react"`. |
| `window is not defined` (Next.js SSR) | Menggunakan hook atau komponen Motion di Server Component | Tambahkan baris `"use client";` di baris pertama file komponen React. |
| Animasi patah-patah (*janky / dropped frames*) | Menganimasikan properti CSS yang memicu reflow (`height`, `margin`) | Ubah animasi menjadi berbasis `scaleY` atau `y` dengan `transform`, atau gunakan prop `layout`. |
| Exit animation tidak muncul | `<AnimatePresence>` tidak membungkus elemen kondisional | Bungkus elemen dengan `<AnimatePresence>` dan pastikan elemen anak memiliki properti `key` yang unik. |

---

## 5. Checklist Verifikasi Mandiri (Self-Verification DoD)

Sebelum agen meloloskan kode animasi ke Reviewer Swarm:
- [ ] Pustaka `motion` terpasang di dependencies proyek.
- [ ] Import menggunakan path modern `"motion/react"`.
- [ ] Properti animasi hanya memanipulasi `transform` dan `opacity`.
- [ ] Mendukung preferensi `useReducedMotion()`.
- [ ] Tidak ada error SSR pada Next.js atau Vite build.
